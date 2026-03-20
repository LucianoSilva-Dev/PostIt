require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const path = require('path');
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../frontend')));

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
  let { text, color } = req.body;

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
        color
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
