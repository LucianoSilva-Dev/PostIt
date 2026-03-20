const API_URL_STREAM = 'http://localhost:3000/api/postits/stream';
const API_URL_GET = 'http://localhost:3000/api/postits';

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

const POSTIT_SIZE = 280;
const SCROLL_SPEED = 1.3; // Velocidade suave do scroll vertical (subindo)

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

  // Como o SCROLL AGORA É VERTICAL, vamos distribuir eles no EIXO X usando faixas horizontais!!
  const maxWidth = window.innerWidth - 80; // Levando a borda de madeira do CSS em conta
  const maxLanes = Math.floor(maxWidth / POSTIT_SIZE) || 1;
  const lane = Math.floor(Math.random() * maxLanes);

  const paddingX = (maxWidth - (maxLanes * POSTIT_SIZE)) / 2;
  const x = paddingX + lane * POSTIT_SIZE + (Math.random() * 40 - 20); // Distribuição com leve bagunça

  // Surgindo da parte inferior do quadro p/ fora da tela
  let startY = window.innerHeight + delayOffsetY;

  // MOTOR ANTI-COLISÃO LOOP (Mesma Faixa/Eixo X)
  let lowestYInLane = 0;
  activePostIts.forEach(p => {
    // Se está mais ou menos na mesma coluna de rolagem
    if (Math.abs(p.x - x) < POSTIT_SIZE * 0.8) {
      // A gente busca quem é o elemento MAIS abaixo da tela (o maior valor em startY)
      if (p.y > lowestYInLane) {
        lowestYInLane = p.y;
      }
    }
  });

  // Garante que o recém inserido entre DEPOIS do post it mais pra baixo dessa coluna
  if (lowestYInLane > startY - POSTIT_SIZE * 1.1) {
    startY = lowestYInLane + POSTIT_SIZE * 1.1;
  }

  el.style.left = `${x}px`;
  el.style.transform = `translateY(${startY}px) rotate(${rotation}deg) scale(0)`;

  container.appendChild(el);

  requestAnimationFrame(() => {
    setTimeout(() => {
      el.style.transform = `translateY(${startY}px) rotate(${rotation}deg) scale(1)`;
    }, 50);
  });

  activePostIts.push({ el, x, y: startY, rotation, width: POSTIT_SIZE });
}

function animate() {
  for (let i = activePostIts.length - 1; i >= 0; i--) {
    let p = activePostIts[i];
    p.y -= SCROLL_SPEED; // Sobe a cada frame!
    p.el.style.transform = `translateY(${p.y}px) rotate(${p.rotation}deg) scale(1)`;

    // ----------- O TÃO AGUARDADO INFINITE LOOP -----------
    // Quando ele sair lá no alto da tela:
    if (p.y < -p.width * 1.5) {
      // 1. Descobre se tem alguém ainda mais lá embaixo na fila dessa mesma coluna pra ele nascer DEPOIS dele
      let lowestYInLane = window.innerHeight;
      activePostIts.forEach(other => {
        if (other !== p && Math.abs(other.x - p.x) < p.width * 0.8) {
          if (other.y > lowestYInLane) {
            lowestYInLane = other.y;
          }
        }
      });

      // 2. Coloca ele magicamente lá no fundo (+50 margem relax)
      p.y = Math.max(window.innerHeight + 50, lowestYInLane + p.width * 1.1);
      // Muda a inclinação pra fingir que é um post it novo subindo! Reuso eterno de DOM pra performance
      p.rotation = Math.floor(Math.random() * 20) - 10;
    }
  }
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
