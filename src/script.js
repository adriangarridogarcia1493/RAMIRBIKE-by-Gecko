const player = document.getElementById('player');
const road = document.getElementById('road');
const container = document.getElementById('game-container');
const scoreElem = document.getElementById('score');
const moneyElem = document.getElementById('session-money');
const totalMoneyElem = document.getElementById('total-money');
const energyBar = document.getElementById('energy-bar');
const specialBar = document.getElementById('special-bar');
const logContainer = document.getElementById('status-log');


// DATOS
const bikes = [
  {id: 0, emoji: '🚲', price: 0, speed: 1, duration: 3},
  {id: 1, emoji: '🛵', price: 50, speed: 1.2, duration: 4},
  {id: 2, emoji: '🏍️', price: 150, speed: 1.5, duration: 6},
  {id: 3, emoji: '🦎', price: 1000, speed: 2.5, duration: 10}
];


const worlds = ['city', 'school', 'beach', 'forest'];
const worldNames = { city: 'CIUDAD 🏙️', school: 'INSTITUTO 🏫', beach: 'PLAYA 🏖️', forest: 'BOSQUE 🌲' };


// ESTADO GLOBAL
let currentBikeIndex = parseInt(localStorage.getItem('ramiroSelectedBike')) || 0;
let ownedBikes = JSON.parse(localStorage.getItem('ramiroOwnedBikes')) || [0];
let totalMoney = parseInt(localStorage.getItem('ramiroMoney')) || 0;
let unlockedLevel = parseInt(localStorage.getItem('ramiroUnlockedLevel')) || 1; // 1 a 80
let highScores = JSON.parse(localStorage.getItem('ramiroHighScores')) || [0, 0, 0];


let gameMode = 'infinite'; // 'infinite' o 'levels'
let targetLevelDist = 0;
let playerX = 125;
let score = 0;
let money = 0;
let gameActive = false;
let scrollSpeed = 7;
let timeScale = 1;
let energy = 100;
let specialCharge = 0;
let currentLevelKey = 'city';
let hasMagnet = false;
let bikeSpeedMult = bikes[currentBikeIndex].speed;
let specialDuration = bikes[currentBikeIndex].duration;


// 1. EFECTO INTRO
function createIntroEffects() {
  const phrases = ["Bon Treball!","Arreglame la bici", "🦎", "🚲", "¿Tienes pensado entregarla?", "11 bicis", "🐻", "🎱", "⛲"];
  const intro = document.getElementById('intro-screen');
  for(let i=0; i<15; i++) {
      let div = document.createElement('div');
      div.className = 'floating-text';
      div.innerText = phrases[Math.floor(Math.random()*phrases.length)];
      div.style.setProperty('--x1', Math.random()*350 + 'px');
      div.style.setProperty('--y1', Math.random()*600 + 'px');
      div.style.setProperty('--x2', Math.random()*350 + 'px');
      div.style.setProperty('--y2', Math.random()*600 + 'px');
      div.style.left = "0"; div.style.top = "0";
      div.style.animationDelay = (Math.random()*5) + "s";
      intro.appendChild(div);
  }
}
createIntroEffects();


// NAVEGACIÓN
function showModeSelection() {
   hideAll();
   document.getElementById('mode-selection').style.display = 'flex';
}


function showInfiniteMenu() {
   hideAll();
   document.getElementById('infinite-menu').style.display = 'flex';
   updateShopUI();
   updateRecordsUI();
}


function showLevelMenu() {
   hideAll();
   document.getElementById('levels-menu').style.display = 'flex';
   const grid = document.getElementById('levels-grid');
   grid.innerHTML = '';
  
   // Determinar mundo actual basado en unlockedLevel (1-20 city, 21-40 school...)
   let worldIdx = Math.floor((unlockedLevel - 1) / 20);
   if(worldIdx > 3) worldIdx = 3;
   let worldKey = worlds[worldIdx];
   document.getElementById('current-world-title').innerText = worldNames[worldKey];


   for(let i=1; i<=20; i++) {
       let globalLvl = (worldIdx * 20) + i;
       let btn = document.createElement('div');
       btn.className = `level-card ${globalLvl <= unlockedLevel ? 'unlocked' : 'locked'}`;
       btn.innerText = i;
       if(globalLvl <= unlockedLevel) btn.onclick = () => startLevel(globalLvl, worldKey);
       grid.appendChild(btn);
   }
}


function hideAll() {
   ['intro-screen', 'mode-selection', 'levels-menu', 'infinite-menu', 'game-over', 'reward-screen'].forEach(id => {
       document.getElementById(id).style.display = 'none';
   });
}


function toggleInstructions() {
   const inst = document.getElementById('instructions-screen');
   inst.style.display = inst.style.display === 'none' ? 'flex' : 'none';
}


// LÓGICA DE JUEGO
function startInfinite(level) {
   gameMode = 'infinite';
   currentLevelKey = level;
   initGame();
}


function startLevel(num, world) {
   gameMode = 'levels';
   currentLevelKey = world;
   targetLevelDist = num * 100; // Nivel 1 = 100m, Nivel 20 = 2000m...
   document.getElementById('dist-needed').innerText = targetLevelDist;
   document.getElementById('level-progress-ui').style.display = 'block';
   initGame();
}


function initGame() {
   hideAll();
   container.className = 'level-' + currentLevelKey;
   player.innerText = bikes[currentBikeIndex].emoji;
   playerX = 125; score = 0; money = 0; energy = 100; specialCharge = 0;
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


   if (gameMode === 'levels' && score >= targetLevelDist) {
       completeLevel();
       return;
   }


   if (energy <= 0) endGame("¡RAMIR TIENE HAMBRE!");
   else requestAnimationFrame(update);
}


function updateUI() {
   scoreElem.innerText = Math.floor(score) + "m";
   moneyElem.innerText = money;
   energyBar.style.width = energy + "%";
   specialBar.style.width = specialCharge + "%";
}


// COLISIONES Y OBJETOS
let keys = {};
document.addEventListener('keydown', e => {
   keys[e.key] = true;
   if (e.code === 'Space' && specialCharge >= 100 && gameActive) useSpecial();
});
document.addEventListener('keyup', e => keys[e.key] = false);


function spawnLoop() {
   if (!gameActive) return;
   createObject();
   setTimeout(spawnLoop, (Math.max(200, 1000 - (score * 0.2))) / timeScale);
}


function createObject() {
   const obj = document.createElement('div');
   obj.className = 'obj';
   const rand = Math.random();
   let type = 'obstacle';


   if (rand > 0.95) { type = 'gold'; obj.innerText = '💰'; }
   else if (rand > 0.85) { type = 'coin'; obj.innerText = '🪙'; }
   else if (rand > 0.60) { type = 'kebab'; obj.innerText = '🥙'; }
   else if (rand > 0.75) { type = 'turbo'; obj.innerText = '⏩'; }
   else if (rand > 0.70) { type = 'magnet'; obj.innerText = '🧲'; }
   else if (rand > 0.65) { type = 'flag'; obj.innerText = '🇲🇦'; }
   else if (rand > 0.60) { type = 'obstacle'; obj.innerText = '🏗️'; }
   else if (rand > 0.50) { type = 'obstacle'; obj.innerText = '🚲'; }
   else if (rand > 0.50) { type = 'obstacle'; obj.innerText = '🦎'; }
   else if (rand > 0.50) { type = 'obstacle'; obj.innerText = '🐻'; }
   else if (rand > 0.50) { type = 'obstacle'; obj.innerText = '🎱'; }
   else if (rand > 0.50) { type = 'obstacle'; obj.innerText = '⛲'; }
   else if (rand > 0.65) { type = 'obstacle'; obj.innerText = '🐂'; }
   else {
       const obs = { city: ['🚗', '🚧', '🐀'], school: ['📝', '📚', '👨‍🏫'], beach: ['🦈', '🦀', '⛱️'], forest: ['🌲', '🍄', '🐺'] };
       obj.innerText = obs[currentLevelKey][Math.floor(Math.random() * obs[currentLevelKey].length)];
   }


   let objX = Math.floor(Math.random() * 250);
   let objY = -60;
   obj.style.left = objX + 'px';
   road.appendChild(obj);


   let moveInterval = setInterval(() => {
       if (!gameActive) { clearInterval(moveInterval); obj.remove(); return; }
       objY += scrollSpeed * timeScale;
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
   if (type === 'coin') { money++; addLog("+1 🪙"); }
   else if (type === 'gold') { money += 10; addLog("+10 💰"); }
   else if (type === 'kebab') { energy = Math.min(100, energy + 30); addLog("🥙 Energía!"); }
   else if (type === 'turbo') { scrollSpeed += 5; setTimeout(() => scrollSpeed -= 5, 2000); addLog("⏩ TURBO!"); }
   else if (type === 'magnet') { hasMagnet = true; setTimeout(() => hasMagnet = false, 5000); addLog("🧲 IMÁN!"); }
   else if (type === 'flag') { totalMoney = Math.max(0, totalMoney - 1); updateMoneyUI(); addLog("🇲🇦 ¡ROBO! -1💰"); }
   else { endGame("¿Tienes pensado entregarla?"); }
   obj.remove();
}


// FINALIZACIÓN
function completeLevel() {
   gameActive = false;
   let reward = Math.floor(targetLevelDist / 100);
   totalMoney += reward + money;
  
   if (unlockedLevel % 20 === 0 && unlockedLevel < 80) {
       showRewards();
   } else {
       unlockedLevel++;
       saveProgress();
       alert(`¡Nivel completado! Ganaste ${reward} 💰`);
       showLevelMenu();
   }
}


function endGame(msg) {
   gameActive = false;
   if (gameMode === 'infinite') {
       totalMoney += money;
       saveHighScore(Math.floor(score));
   }
   saveProgress();
   document.getElementById('death-msg').innerText = msg;
   document.getElementById('game-over').style.display = 'flex';
}


function saveProgress() {
   localStorage.setItem('ramiroMoney', totalMoney);
   localStorage.setItem('ramiroUnlockedLevel', unlockedLevel);
}


// RULETA
function showRewards() {
   hideAll();
   document.getElementById('reward-screen').style.display = 'flex';
   document.getElementById('wheel-result').innerText = "";
   document.getElementById('claim-btn').style.display = "none";
   document.getElementById('spin-btn').style.display = "block";
}


function spinWheel() {
   const wheel = document.getElementById('wheel');
   const btn = document.getElementById('spin-btn');
   btn.style.display = "none";
   const randDeg = 1800 + Math.random() * 1000;
   wheel.style.transform = `rotate(${randDeg}deg)`;
  
   setTimeout(() => {
       const prizes = ["100 💰", "200 💰", "Bici Nueva (Gecko)", "50 💰"];
       const win = prizes[Math.floor(Math.random() * prizes.length)];
       document.getElementById('wheel-result').innerText = "¡TE HA TOCADO: " + win + "!";
       if(win.includes("100")) totalMoney += 100;
       if(win.includes("200")) totalMoney += 200;
       if(win.includes("50")) totalMoney += 50;
       if(win.includes("Bici")) {
           if(!ownedBikes.includes(3)) ownedBikes.push(3);
           localStorage.setItem('ramiroOwnedBikes', JSON.stringify(ownedBikes));
       }
       unlockedLevel++;
       saveProgress();
       document.getElementById('claim-btn').style.display = "block";
   }, 3500);
}


function closeRewards() {
   showLevelMenu();
}


// TIENDA Y RÉCORDS
function updateShopUI() {
   const shop = document.getElementById('bike-shop');
   shop.innerHTML = '';
   totalMoneyElem.innerText = totalMoney;
   bikes.forEach((bike, index) => {
       let isOwned = ownedBikes.includes(index);
       let div = document.createElement('div');
       div.className = `item ${currentBikeIndex === index ? 'selected' : ''}`;
       div.innerHTML = `${bike.emoji}<br>${isOwned ? 'OK' : bike.price + ' 💰'}`;
       div.onclick = () => selectBike(index);
       shop.appendChild(div);
   });
}


function selectBike(index) {
   if (ownedBikes.includes(index)) {
       currentBikeIndex = index;
       bikeSpeedMult = bikes[index].speed;
       specialDuration = bikes[index].duration;
       localStorage.setItem('ramiroSelectedBike', index);
       updateShopUI();
   } else if (totalMoney >= bikes[index].price) {
       totalMoney -= bikes[index].price;
       ownedBikes.push(index);
       saveProgress();
       localStorage.setItem('ramiroOwnedBikes', JSON.stringify(ownedBikes));
       selectBike(index);
   }
}


function saveHighScore(s) {
   highScores.push(s);
   highScores.sort((a, b) => b - a);
   highScores = highScores.slice(0, 3);
   localStorage.setItem('ramiroHighScores', JSON.stringify(highScores));
}


function updateRecordsUI() {
   const box = document.getElementById('best-scores');
   box.innerHTML = highScores.map((s, i) => `<p>${i+1}º - ${s}m 🦎</p>`).join('');
}


function useSpecial() {
   specialCharge = 0; timeScale = 0.3;
   player.style.filter = "drop-shadow(0 0 15px #3498db)";
   addLog("🌀 TIEMPO BALA!");
   setTimeout(() => { timeScale = 1; player.style.filter = "none"; }, specialDuration * 1000);
}


function addLog(text) {
   const item = document.createElement('div');
   item.className = 'log-item';
   item.innerText = text;
   logContainer.appendChild(item);
   setTimeout(() => item.remove(), 2000);
}


function updateMoneyUI() { totalMoneyElem.innerText = totalMoney; }
function resetGame() { document.getElementById('game-over').style.display = 'none'; initGame(); }
