const API_URL_STREAM = '/api/postits/stream';
const API_URL_GET = '/api/postits';

const container = document.getElementById('board-container');
let activePostIts = [];

const stream = new EventSource(API_URL_STREAM);

fetch(API_URL_GET)
  .then(res => res.json())
  .then(data => {
    data.forEach((p, index) => spawnPostIt(p, index * 320));
  });

stream.onmessage = (event) => {
  const postit = JSON.parse(event.data);
  spawnPostIt(postit, 0);
};

stream.onerror = (err) => console.error("SSE Error:", err);

const POSTIT_SIZE = 180;
const SCROLL_SPEED = 1.2; // Velocidade suave do scroll vertical (subindo)

function getSafePosition(width, delayOffsetY = 0, ignorePostIt = null) {
  const minX = 40;
  const maxX = window.innerWidth - 40 - width;
  const rangeX = maxX > minX ? maxX - minX : 0;
  
  const x = minX + Math.random() * rangeX;

  let startY = window.innerHeight + delayOffsetY;
  
  // overlap em X permitido: até 85% do próprio post-it, para estarem mais juntos
  const X_TOLERANCE = width * 0.85; 
  // permite sobreposição papel sobre papel verticalmente
  const Y_MARGIN = -20; 

  let collisionBottom = 0;
  
  activePostIts.forEach(other => {
    if (other === ignorePostIt) return;
    
    if (Math.abs(other.x - x) < X_TOLERANCE) {
       const otherBottomY = other.y + (other.el.offsetHeight || 180) + Y_MARGIN;
       if (otherBottomY > collisionBottom) {
         collisionBottom = otherBottomY;
       }
    }
  });

  return {
    x: x,
    y: Math.max(startY, collisionBottom)
  };
}

function spawnPostIt(data, delayOffsetY = 0) {
  const el = document.createElement('div');
  el.className = 'post-it';
  el.style.backgroundColor = data.color;

  const textEl = document.createElement('div');
  textEl.className = 'post-it-text';
  textEl.textContent = data.text;
  textEl.style.color = data.textColor;
  el.appendChild(textEl);

  const rotation = Math.floor(Math.random() * 20) - 10;

  // Inseri invisível para conseguir as dimensões reais renderizadas com sucesso
  el.style.left = `-9999px`;
  el.style.transform = `scale(0)`;
  container.appendChild(el);

  // Calcula a largura a partir do DOM construído
  const actualWidth = el.offsetWidth || POSTIT_SIZE;

  // Usa o novo motor anti-colisão
  const pos = getSafePosition(actualWidth, delayOffsetY);

  el.style.left = `${pos.x}px`;
  el.style.transform = `translateY(${pos.y}px) rotate(${rotation}deg) scale(0)`;

  requestAnimationFrame(() => {
    setTimeout(() => {
      el.style.transform = `translateY(${pos.y}px) rotate(${rotation}deg) scale(1)`;
    }, 50);
  });

  activePostIts.push({ el, x: pos.x, y: pos.y, rotation, width: actualWidth });
}

function animate() {
  for (let i = activePostIts.length - 1; i >= 0; i--) {
    let p = activePostIts[i];
    p.y -= SCROLL_SPEED; // Sobe a cada frame!
    p.el.style.transform = `translateY(${p.y}px) rotate(${p.rotation}deg) scale(1)`;

    // ----------- O TÃO AGUARDADO INFINITE LOOP -----------
    const actualHeight = p.el.offsetHeight || p.width;
    
    // Quando ele sair lá no alto da tela: APENAS DEPOIS DA SUA ALTURA TOTAL SAIR + 50 margin
    if (p.y < -actualHeight - 50) {
      
      const pos = getSafePosition(p.width, 50, p);

      p.x = pos.x;
      p.y = pos.y;
      p.el.style.left = `${p.x}px`;

      // Randomiza a posição em eixo Z do post-it
      const zind = Math.floor(Math.random() * 14) + 1;
      p.zind = zind;
      p.el.style.zIndex = zind;

      // Muda a inclinação pra fingir que é um post it novo subindo! Reuso eterno de DOM pra performance
      p.rotation = Math.floor(Math.random() * 20) - 10;
    }
  }
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
