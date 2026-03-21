require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');

const path = require('path');
const app = express();
const prisma = new PrismaClient();

// Trust proxy for Railway/Heroku to get correct client IP
app.set('trust proxy', 1);

// ----- Security Measures -----

// Use helmet for standard security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disabling CSP for simplicity as we use many scripts and styles, but in production this should be configured
}));

// Basic CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) 
  : ['*'];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf('*') !== -1 || allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'));
  }
}));

// Limit JSON body size to prevent large payload attacks
app.use(express.json({ limit: '10kb' }));

// Rate limiting for the post submission route
const postRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: { error: 'Too many post-its sent from this IP, please try again after 1 minute' }
});
app.use('/api/postits', (req, res, next) => {
  if (req.method === 'POST') {
    return postRateLimit(req, res, next);
  }
  next();
});

// ------------------------------

app.use(express.static(path.join(__dirname, './client')));

const PORT = process.env.PORT || 3000;
const MAX_TEXT_LENGTH = parseInt(process.env.MAX_TEXT_LENGTH, 10) || 150;

// Array para armazenar conexões ativas de SSE
let clients = [];

// Middleware para habilitar o Server-Sent Events (SSE)
function eventsHandler(req, res, next) {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  res.writeHead(200, headers);

  const clientId = Date.now();
  
  const newClient = {
    id: clientId,
    res
  };

  clients.push(newClient);

  req.on('close', () => {
    clients = clients.filter(client => client.id !== clientId);
  });
}

function sendEventToAll(newPostIt) {
  clients.forEach(client => {
    client.res.write(`data: ${JSON.stringify(newPostIt)}\n\n`);
  });
}

// ----- Routes -----

// Rota para a tela do projetor se conectar e ficar ouvindo novos post-its
app.get('/api/postits/stream', eventsHandler);

// Rota de GET inicial (caso o projetor seja recarregado e precise carregar os últimos 50 post-its)
app.get('/api/postits', async (req, res) => {
  try {
    const postits = await prisma.postIt.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(postits.reverse()); // Enviamos na ordem de mais antigo pro mais novo nessa janela
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch post-its' });
  }
});

// Rota de POST (submissão de nova ideia pelo celular)
app.post('/api/postits', async (req, res) => {
  let { text, color, textcolor } = req.body;

  if (!text || !color) {
    return res.status(400).json({ error: 'Text and color are required' });
  }

  // Se o texto vier muito grande, corta para não estourar nossa tela
  if (text.length > MAX_TEXT_LENGTH) {
    text = text.substring(0, MAX_TEXT_LENGTH);
  }

  try {
    const newPostIt = await prisma.postIt.create({
      data: {
        text,
        color,
        textColor: textcolor,
      }
    });

    // Avisa os projetores que tem post-it novo
    sendEventToAll(newPostIt);

    res.status(201).json(newPostIt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create post-it' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Max Text Length allowed: ${MAX_TEXT_LENGTH}`);
});
