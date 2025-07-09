const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.9;

const fruits = ['apple', 'banana', 'mango', 'pineapple', 'watermelon'];
const fruitImages = {};
let fallingFruits = [];
let targetFruit = '';
let countdown = 3;
let gameStarted = false;
let gameOver = false;
let startTime, reactionTime, highScore = null;
let timeoutId;

const restartBtn = document.getElementById('restartBtn');

// Load fruit images
fruits.forEach(name => {
  const img = new Image();
  img.src = `assets/${name}.png`;
  fruitImages[name] = img;
});

function createFruit(name, x) {
  return {
    name,
    x,
    y: -50,
    speed: 2 + Math.random() * 2,
    width: 60,
    height: 60
  };
}

function drawCountdown() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '60px Arial';
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.fillText(countdown > 0 ? countdown : 'GO!', canvas.width / 2, canvas.height / 2);
}

function drawTargetText() {
  ctx.font = '24px Arial';
  ctx.fillStyle = '#444';
  ctx.textAlign = 'center';
  ctx.fillText(`Tap on: ${targetFruit.toUpperCase()}`, canvas.width / 2, 40);
}

function drawFruits() {
  fallingFruits.forEach(fruit => {
    ctx.drawImage(fruitImages[fruit.name], fruit.x, fruit.y, fruit.width, fruit.height);
    fruit.y += fruit.speed;
  });
}

function drawScore() {
  ctx.font = '20px Arial';
  ctx.fillStyle = '#222';
  ctx.textAlign = 'center';
  ctx.fillText(`Reaction: ${reactionTime.toFixed(2)}s`, canvas.width / 2, canvas.height / 2 + 20);
  if (highScore !== null) {
    ctx.fillText(`High Score: ${highScore.toFixed(2)}s`, canvas.width / 2, canvas.height / 2 + 50);
  }
}

function gameLoop() {
  if (!gameStarted || gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTargetText();
  drawFruits();

  requestAnimationFrame(gameLoop);
}

function startCountdown() {
  drawCountdown();
  const interval = setInterval(() => {
    countdown--;
    drawCountdown();
    if (countdown < 0) {
      clearInterval(interval);
      startGame();
    }
  }, 1000);
}

function startGame() {
  gameStarted = true;
  targetFruit = fruits[Math.floor(Math.random() * fruits.length)];

  const positions = [20, 100, 180, 260, 340];
  fallingFruits = fruits.map((fruit, i) => createFruit(fruit, positions[i]));

  startTime = performance.now();
  gameLoop();

  // End game if no action in 5.5s
  timeoutId = setTimeout(() => {
    if (!gameOver) {
      gameOver = true;
      reactionTime = (performance.now() - startTime) / 1000;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = '24px Arial';
      ctx.fillStyle = 'red';
      ctx.textAlign = 'center';
      ctx.fillText('Too Slow! Game Over', canvas.width / 2, canvas.height / 2 - 20);
      drawScore();
      restartBtn.style.display = 'block';
    }
  }, 5000);
}

// Click / Tap
['click', 'touchstart'].forEach(eventType => {
  canvas.addEventListener(eventType, (e) => {
    if (!gameStarted || gameOver) return;

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    for (let fruit of fallingFruits) {
      if (
        mouseX >= fruit.x &&
        mouseX <= fruit.x + fruit.width &&
        mouseY >= fruit.y &&
        mouseY <= fruit.y + fruit.height
      ) {
        if (fruit.name === targetFruit) {
          clearTimeout(timeoutId); // Cancel "Too Slow!" trigger
          gameOver = true;
          const endTime = performance.now();
          reactionTime = (endTime - startTime) / 1000;

          if (highScore === null || reactionTime < highScore) {
            highScore = reactionTime;
          }

          // ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.font = '24px Arial';
          ctx.fillStyle = 'green';
          ctx.textAlign = 'center';
          ctx.fillText('🎉 Correct! 🎯', canvas.width / 2, canvas.height / 2 - 20);
          drawScore();
          restartBtn.style.display = 'block';
        }
      }
    }
  });
});

// Start game after page load
window.onload = () => {
  startCountdown();
};

// Restart button logic
restartBtn.addEventListener('click', () => {
  countdown = 3;
  gameStarted = false;
  gameOver = false;
  fallingFruits = [];
  reactionTime = 0;
  restartBtn.style.display = 'none';
  clearTimeout(timeoutId);
  startCountdown();
});