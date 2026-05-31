const player = document.getElementById('player');
const road = document.getElementById('road');
const container = document.getElementById('game-container');
const scoreElem = document.getElementById('score');
const moneyElem = document.getElementById('session-money');
const totalMoneyElem = document.getElementById('total-money');
const energyBar = document.getElementById('energy-bar');
const specialBar = document.getElementById('special-bar');


let playerX = 125;
let score = 0;
let money = 0;
let gameActive = false;
let scrollSpeed = 7;
let timeScale = 1;
let energy = 100;
let specialCharge = 0;
let currentLevel = 'city';
let hasMagnet = false;
let bikeSpeedMult = 1;
let specialDuration = 3;
let totalMoney = parseInt(localStorage.getItem('ramiroMoney')) || 0;
totalMoneyElem.innerText = totalMoney;


let keys = {};
document.addEventListener('keydown', e => {
   keys[e.key] = true;
   if (e.code === 'Space' && specialCharge >= 100 && gameActive) useSpecial();
});
document.addEventListener('keyup', e => keys[e.key] = false);


function selectBike(emoji, price, speed, duration) {
   if (totalMoney >= price) {
       player.innerText = emoji;
       bikeSpeedMult = speed;
       specialDuration = duration;
       alert("Bon treball!");
   } else {
       alert("¡No tienes pasta!");
   }
}


function startGame(level) {
   currentLevel = level;
   document.getElementById('start-screen').style.display = 'none';
   container.className = 'level-' + level;
   gameActive = true;
   requestAnimationFrame(update);
   spawnLoop();
}


function update() {
   if (!gameActive) return;
   let finalSideSpeed = (8 * bikeSpeedMult) * timeScale;
   if (keys['ArrowLeft'] && playerX > 0) playerX -= finalSideSpeed;
   if (keys['ArrowRight'] && playerX < 250) playerX += finalSideSpeed;
   player.style.left = playerX + 'px';


   energy -= 0.06 * timeScale;
   score += 0.1 * timeScale;
   if (specialCharge < 100) specialCharge += 0.15;
  
   updateUI();
   if (energy <= 0) endGame("¡RAMIRO TIENE HAMBRE!");
   requestAnimationFrame(update);
}


function updateUI() {
   scoreElem.innerText = Math.floor(score) + "m";
   moneyElem.innerText = money;
   energyBar.style.width = energy + "%";
   specialBar.style.width = specialCharge + "%";
}


function useSpecial() {
   specialCharge = 0;
   timeScale = 0.3;
   player.style.filter = "drop-shadow(0 0 15px #3498db)";
   setTimeout(() => { timeScale = 1; player.style.filter = "none"; }, specialDuration * 1000);
}


function spawnLoop() {
   if (!gameActive) return;
   createObject();
   setTimeout(spawnLoop, (Math.max(250, 1000 - (score * 0.5))) / timeScale);
}


function createObject() {
   const obj = document.createElement('div');
   obj.className = 'obj';
   const rand = Math.random();
   let type = 'obstacle';


   if (rand > 0.96) { type = 'gold'; obj.innerText = '💰'; }
   else if (rand > 0.85) { type = 'coin'; obj.innerText = '🪙'; }
   else if (rand > 0.80) { type = 'kebab'; obj.innerText = '🥙'; }
   else if (rand > 0.75) { type = 'turbo'; obj.innerText = '⏩'; }
   else if (rand > 0.70) { type = 'magnet'; obj.innerText = '🧲'; }
   else if (rand > 0.65) { type = 'flag'; obj.innerText = '🇲🇦'; }
   else if (rand > 0.55) { // OBSTÁCULOS OBLIGATORIOS (OSO O GECKO)
       obj.innerText = Math.random() > 0.5 ? '🐻' : '🦎';
   } else {
       const obs = {
           city: ['🚗', '🚧', '🐀'],
           school: ['📝', '📚', '👨‍🏫'],
           beach: ['🦈', '🦀', '⛱️'],
           forest: ['🌲', '🍄', '🐺']
       };
       obj.innerText = obs[currentLevel][Math.floor(Math.random() * obs[currentLevel].length)];
   }


   let objX = Math.floor(Math.random() * 250);
   let objY = -60;
   obj.style.left = objX + 'px';
   road.appendChild(obj);


   let moveInterval = setInterval(() => {
       if (!gameActive) { clearInterval(moveInterval); obj.remove(); return; }
      
       objY += scrollSpeed * timeScale;


       // Lógica Imán
       if ((type === 'coin' || type === 'gold') && hasMagnet) {
           objX += (playerX - objX) * 0.15;
           obj.style.left = objX + 'px';
       }


       obj.style.top = objY + 'px';


       let pR = player.getBoundingClientRect();
       let oR = obj.getBoundingClientRect();


       if (!(pR.right < oR.left || pR.left > oR.right || pR.bottom < oR.top || pR.top > oR.bottom)) {
           handleCollision(type, obj);
           clearInterval(moveInterval);
       }
       if (objY > window.innerHeight) { clearInterval(moveInterval); obj.remove(); }
   }, 20);
}


function handleCollision(type, obj) {
   const item = obj.innerText;
   if (type === 'coin') money += 1;
   else if (type === 'gold') money += 10;
   else if (type === 'kebab') energy = Math.min(100, energy + 30);
   else if (type === 'turbo') {
       scrollSpeed += 5;
       setTimeout(() => scrollSpeed -= 5, 2000);
   } else if (type === 'magnet') {
       hasMagnet = true;
       setTimeout(() => hasMagnet = false, 5000);
   } else if (type === 'flag') {
       scrollSpeed -= 3;
       player.style.opacity = "0.5";
       setTimeout(() => { scrollSpeed += 3; player.style.opacity = "1"; }, 3000);
   } else {
       endGame("¿Tienes pensado entregarla?");
   }
   obj.remove();
}


function endGame(msg) {
   gameActive = false;
   totalMoney += money;
   localStorage.setItem('ramiroMoney', totalMoney);
   document.getElementById('death-msg').innerText = msg;
   document.getElementById('game-over').style.display = 'flex';
}
