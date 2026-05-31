const player = document.getElementById('player');
const road = document.getElementById('road');
const container = document.getElementById('game-container');
const scoreElem = document.getElementById('score');
const moneyElem = document.getElementById('session-money');
const totalMoneyElem = document.getElementById('total-money');
const energyBar = document.getElementById('energy-bar');
const specialBar = document.getElementById('special-bar');
const logContainer = document.getElementById('status-log');
const buffTimersContainer = document.getElementById('buff-timers-container');

const bikes = [
  {id: 0, emoji: '🚲', price: 0, speed: 1, duration: 3},
  {id: 1, emoji: '🛵', price: 50, speed: 1.2, duration: 4},
  {id: 2, emoji: '🏍️', price: 150, speed: 1.5, duration: 6},
  {id: 3, emoji: '🏎️', price: 300, speed: 2.0, duration: 5},
  {id: 4, emoji: '🛹', price: 30, speed: 0.9, duration: 3},
  {id: 5, emoji: '🛺', price: 80, speed: 1.1, duration: 4},
  {id: 6, emoji: '🚜', price: 200, speed: 0.8, duration: 8},
  {id: 7, emoji: '🐎', price: 250, speed: 1.3, duration: 5},
  {id: 8, emoji: '🛩️', price: 1200, speed: 2.8, duration: 8},
  {id: 9, emoji: '🦼', price: 60, speed: 0.7, duration: 6},
  {id: 10, emoji: '🛸', price: 2000, speed: 4.0, duration: 15}, 
  {id: 11, emoji: '🚀', price: 2000, speed: 3.5, duration: 12}, 
  {id: 12, emoji: '🥙', price: 5000, speed: 2.2, duration: 9},  
  {id: 13, emoji: '🦎', price: 10000, speed: 2.5, duration: 10}, 
  {id: 14, emoji: '🐻', price: 10000, speed: 1.4, duration: 7}   
];

const worlds = ['city', 'school', 'beach', 'forest', 'circuit', 'volcano'];
const worldNames = { 
  city: 'CIUDAD 🏙️', school: 'INSTITUTO 🏫', beach: 'PLAYA 🏖️', 
  forest: 'BOSQUE 🌲', circuit: 'CIRCUITO 🏎️', volcano: 'VOLCÁN 🔥' 
};
let currentWorldViewIdx = 0;

const pachaTeams = ["Deportivo Ahoraves", "Ososuna", "Patético de Madrid", "Downchester City", "Payo Vallecano", "Minabo de Kiev", "Real Suciedad", "Celta de Vino", "Inter de miflan", "Villar-real", "Bayern de los caídos", "FCBarceló", "Coca Juniors", "Penerbahce", "Cultural Mayonesa"];
const pachaStadiums = [
    {name: "Campo Nuevo", bg: "#1b4d3e"}, {name: "Santiago Bergabeu", bg: "#34495e"},
    {name: "Benito Villarmartín", bg: "#27ae60"}, {name: "Ramón Sanchez Pijajuan", bg: "#c0392b"},
    {name: "Mestallalapolla", bg: "#d35400"}, {name: "San Memes", bg: "#7f8c8d"},
    {name: "Micropolitana", bg: "#2c3e50"}
];

let currentBikeIndex = parseInt(localStorage.getItem('ramiroSelectedBike')) || 0;
let ownedBikes = JSON.parse(localStorage.getItem('ramiroOwnedBikes')) || [0];
let totalMoney = parseInt(localStorage.getItem('ramiroMoney')) || 0;
let unlockedLevel = parseInt(localStorage.getItem('ramiroUnlockedLevel')) || 1; 
let highScores = JSON.parse(localStorage.getItem('ramiroHighScores')) || [0, 0, 0];
let snakeRecord = parseInt(localStorage.getItem('ramiroSnakeRecord')) || 0;

let gameMode = 'infinite'; 
let targetLevelDist = 0;
let playerX = 125;
let score = 0;
let money = 0;
let gameActive = false;
let scrollSpeed = 7;
let timeScale = 1;
let energy = 100;
let specialCharge = 0;
let isBulletTimeActive = false;
let currentLevelKey = 'city';

let magnetTimeLeft = 0;      
let turboTimeLeft = 0;       
let spainStarTimeLeft = 0;   
let geckoEaterTimeLeft = 0;  

let hasMagnet = false;
let hasExtraLife = false; 
let isStarImmune = false; 
let isGeckoEaterActive = false;
let bikeSpeedMult = 1;
let specialDuration = 3;

let keys = {};
window.addEventListener('keydown', (e) => { keys[e.key] = true; });
window.addEventListener('keyup', (e) => { keys[e.key] = false; });

function createIntroEffects() {
  const phrases = ["Bon Treball!", "Arreglame la bici", "🦎", "🚲", "¿Tienes pensado entregarla?", "11 bicis", "🐻", "🎱"];
  const intro = document.getElementById('intro-screen');
  if(!intro) return;
  for(let i=0; i<15; i++) {
      let div = document.createElement('div'); div.className = 'floating-text';
      div.innerText = phrases[Math.floor(Math.random()*phrases.length)];
      div.style.setProperty('--x1', Math.random()*350 + 'px'); div.style.setProperty('--y1', Math.random()*600 + 'px');
      div.style.setProperty('--x2', Math.random()*350 + 'px'); div.style.setProperty('--y2', Math.random()*600 + 'px');
      div.style.left = "0"; div.style.top = "0"; div.style.animationDelay = (Math.random()*5) + "s";
      intro.appendChild(div);
  }
}
createIntroEffects();

function showModeSelection() { hideAll(); document.getElementById('mode-selection').style.display = 'flex'; }
function showInfiniteMenu() { hideAll(); document.getElementById('infinite-menu').style.display = 'flex'; updateRecordsUI(); }
function showShopMenu() { hideAll(); document.getElementById('shop-menu').style.display = 'flex'; updateShopUI(); }
function showMinigamesMenu() { hideAll(); document.getElementById('minigames-menu').style.display = 'flex'; document.getElementById('snake-record-ui').innerText = `Récord: ${snakeRecord}s`; }
function toggleInstructions() { const inst = document.getElementById('instructions-screen'); inst.style.display = inst.style.display === 'none' ? 'flex' : 'none'; }

function showLevelMenu() {
   hideAll(); document.getElementById('levels-menu').style.display = 'flex';
   let worldMaxIdx = Math.floor((unlockedLevel - 1) / 20);
   if(worldMaxIdx > 5) worldMaxIdx = 5;
   currentWorldViewIdx = worldMaxIdx; renderLevelsGrid();
}
function changeWorldMenu(dir) {
    currentWorldViewIdx += dir;
    if(currentWorldViewIdx < 0) currentWorldViewIdx = 5;
    if(currentWorldViewIdx > 5) currentWorldViewIdx = 0;
    renderLevelsGrid();
}
function renderLevelsGrid() {
   const grid = document.getElementById('levels-grid'); grid.innerHTML = '';
   let worldKey = worlds[currentWorldViewIdx];
   document.getElementById('current-world-title').innerText = worldNames[worldKey];
   for(let i=1; i<=20; i++) {
       let globalLvl = (currentWorldViewIdx * 20) + i;
       let btn = document.createElement('div');
       btn.className = `level-card ${globalLvl <= unlockedLevel ? 'unlocked' : 'locked'}`;
       btn.innerText = i;
       if(globalLvl <= unlockedLevel) btn.onclick = () => startLevel(globalLvl, worldKey);
       grid.appendChild(btn);
   }
}

function hideAll() {
   ['intro-screen', 'mode-selection', 'levels-menu', 'infinite-menu', 'shop-menu', 
    'minigames-menu', 'pachanguita-setup', 'pachanguita-screen', 'snake-screen', 
    'flappy-screen', 'game-over', 'reward-screen'].forEach(id => {
       const el = document.getElementById(id); if(el) el.style.display = 'none';
   });
   document.getElementById('level-progress-ui').style.display = 'none';
   container.className = ""; container.style.background = "#222";
}
function exitToMenu() { gameActive = false; stopAllMinigames(); showModeSelection(); }

function startInfinite(level) { gameMode = 'infinite'; currentLevelKey = level; initGame(); }
function startLevel(num, world) {
   gameMode = 'levels'; currentLevelKey = world;
   targetLevelDist = num * 100; 
   document.getElementById('dist-needed').innerText = targetLevelDist;
   document.getElementById('level-progress-ui').style.display = 'block';
   initGame();
}

function initGame() {
   hideAll();
   container.className = 'level-' + currentLevelKey;
   player.innerText = bikes[currentBikeIndex] ? bikes[currentBikeIndex].emoji : '🚲';
   playerX = 125; score = 0; money = 0; energy = 100; specialCharge = 0; isBulletTimeActive = false;
   hasExtraLife = false; isStarImmune = false; isGeckoEaterActive = false;
   magnetTimeLeft = 0; turboTimeLeft = 0; spainStarTimeLeft = 0; geckoEaterTimeLeft = 0;
   buffTimersContainer.innerHTML = '';
   updateExtraLifeUI(); updateMoneyUI();
   gameActive = true; scrollSpeed = 7; timeScale = 1;
   bikeSpeedMult = bikes[currentBikeIndex] ? bikes[currentBikeIndex].speed : 1;
   specialDuration = bikes[currentBikeIndex] ? bikes[currentBikeIndex].duration : 3;
   requestAnimationFrame(update); spawnLoop();
}

function update() {
   if (!gameActive) return;

   if (keys[' '] && specialCharge >= 100 && !isBulletTimeActive) {
       isBulletTimeActive = true;
       timeScale = 0.5;
       addLog("⏱️ TIEMPO BALA ACTIVADO");
   }

   if (isBulletTimeActive) {
       specialCharge -= (100 / (60 * specialDuration));
       if (specialCharge <= 0) {
           specialCharge = 0;
           isBulletTimeActive = false;
           timeScale = 1;
           addLog("⏱️ TIEMPO NORMAL");
       }
   } else {
       if (specialCharge < 100) specialCharge += 0.15;
   }

   let delta = (1000 / 60) * timeScale;

   if (magnetTimeLeft > 0) {
       magnetTimeLeft -= delta;
       if (magnetTimeLeft <= 0) { magnetTimeLeft = 0; hasMagnet = false; addLog("🧲 Fin del Imán"); }
   }
   if (turboTimeLeft > 0) {
       turboTimeLeft -= delta;
       if (turboTimeLeft <= 0) { turboTimeLeft = 0; scrollSpeed = Math.max(7, scrollSpeed - 5); addLog("⏩ Fin del Turbo"); }
   }
   if (spainStarTimeLeft > 0) {
       spainStarTimeLeft -= delta;
       if (spainStarTimeLeft <= 0) { spainStarTimeLeft = 0; isStarImmune = false; container.classList.remove('espana-effect'); addLog("🇪🇸 Fin de la Inmunidad"); }
   }
   if (geckoEaterTimeLeft > 0) {
       geckoEaterTimeLeft -= delta;
       if (geckoEaterTimeLeft <= 0) { geckoEaterTimeLeft = 0; isGeckoEaterActive = false; addLog("🦎 Fin del Gecko Devorador"); }
   }

   updateBuffTimersHUD();

   let finalSideSpeed = (5 * bikeSpeedMult) * (isBulletTimeActive ? 1.4 : timeScale); 
   if (keys['ArrowLeft'] && playerX > 0) playerX -= finalSideSpeed;
   if (keys['ArrowRight'] && playerX < 250) playerX += finalSideSpeed;
   player.style.left = playerX + 'px';

   if (isStarImmune) { score += 0.3 * timeScale; } 
   else { energy -= 0.05 * timeScale; score += 0.1 * timeScale; }
   
   updateUI();

   if (gameMode === 'levels' && score >= targetLevelDist) { completeLevel(); return; }
   if (energy <= 0) endGame("¡RAMIR TIENE HAMBRE!");
   else requestAnimationFrame(update);
}

function updateBuffTimersHUD() {
    let html = '';
    if (magnetTimeLeft > 0) html += `<div class="buff-badge">🧲 ${(magnetTimeLeft/1000).toFixed(1)}s</div>`;
    if (turboTimeLeft > 0) html += `<div class="buff-badge">⏩ ${(turboTimeLeft/1000).toFixed(1)}s</div>`;
    if (spainStarTimeLeft > 0) html += `<div class="buff-badge" style="border-color:#f1c40f;">🇪🇸 ${(spainStarTimeLeft/1000).toFixed(1)}s</div>`;
    if (geckoEaterTimeLeft > 0) html += `<div class="buff-badge" style="border-color:#e74c3c;">❤️ ${(geckoEaterTimeLeft/1000).toFixed(1)}s</div>`;
    buffTimersContainer.innerHTML = html;
}

function updateUI() {
   scoreElem.innerText = Math.floor(score) + "m"; moneyElem.innerText = money;
   energyBar.style.width = energy + "%"; specialBar.style.width = specialCharge + "%";
}
function updateExtraLifeUI() { document.getElementById('shield-indicator').style.display = hasExtraLife ? 'inline' : 'none'; }

function spawnLoop() {
   if (!gameActive) return;
   createObject();
   setTimeout(spawnLoop, (Math.max(250, 1000 - (score * 0.2))) / timeScale);
}

function createObject() {
   if (!gameActive) return;
   const obj = document.createElement('div'); obj.className = 'obj';
   const rand = Math.random(); let type = 'obstacle';

   if (rand < 0.07) { type = 'coin'; obj.innerText = '🪙'; }
   else if (rand < 0.11) { type = 'gold'; obj.innerText = '💰'; }
   else if (rand < 0.18) { type = 'kebab'; obj.innerText = '🥙'; }
   else if (rand < 0.21) { type = 'turbo'; obj.innerText = '⏩'; }
   else if (rand < 0.24) { type = 'magnet'; obj.innerText = '🧲'; }
   else if (rand < 0.26) { type = 'flag'; obj.innerText = '🇲🇦'; }
   else if (rand < 0.28) { type = 'extralife'; obj.innerText = '💚'; }
   else if (rand < 0.30) { type = 'spainstar'; obj.innerText = '🇪🇸'; }
   else if (rand < 0.32) { type = 'geckoeater'; obj.innerText = '❤️'; }
   else if (rand < 0.55) {
       const comunes = ['🏗️', '🚲', '🦎', '🐻', '🎱', '⛲', '🐂'];
       obj.innerText = comunes[Math.floor(Math.random() * comunes.length)];
   } else {
       const obs = { 
           city: ['🚗', '🚧', '🐀'], school: ['📝', '📚', '👨‍🏫'], 
           beach: ['🦈', '🦀', '⛱️'], forest: ['🌲', '🍄', '🐺'],
           circuit: ['🏎️', '🏍️', '✊🏼', '🤙🏼'], volcano: ['🔥']
       };
       let list = obs[currentLevelKey] || obs['city'];
       obj.innerText = list[Math.floor(Math.random() * list.length)];
   }

   let objX = Math.floor(Math.random() * 250); let objY = -60;
   obj.style.left = objX + 'px'; obj.style.top = objY + 'px';
   road.appendChild(obj);

   let moveInterval = setInterval(() => {
       if (!gameActive) { clearInterval(moveInterval); obj.remove(); return; }
       if (isGeckoEaterActive && (type === 'obstacle' || type === 'flag')) {
           obj.innerText = '🦎'; setTimeout(() => { obj.remove(); clearInterval(moveInterval); }, 80); return;
       }
       objY += scrollSpeed * timeScale;
       if ((type === 'coin' || type === 'gold') && hasMagnet) {
           objX += (playerX - objX) * 0.15; obj.style.left = objX + 'px';
       }
       obj.style.top = objY + 'px';
      
       let pR = player.getBoundingClientRect(); let oR = obj.getBoundingClientRect();
       if (!(pR.right < oR.left || pR.left > oR.right || pR.bottom < oR.top || pR.top > oR.bottom)) {
           handleCollision(type, obj); clearInterval(moveInterval);
       }
       if (objY > window.innerHeight) { clearInterval(moveInterval); obj.remove(); }
   }, 20);
}

function handleCollision(type, obj) {
   if (type === 'coin') { money++; addLog("+1 🪙"); }
   else if (type === 'gold') { money += 10; addLog("+10 💰"); }
   else if (type === 'kebab') { energy = Math.min(100, energy + 30); addLog("🥙 Energía!"); }
   else if (type === 'turbo') { 
       scrollSpeed += 5; 
       turboTimeLeft = 2000; 
       addLog("⏩ TURBO ACTIVADO!"); 
   }
   else if (type === 'magnet') { 
       hasMagnet = true; 
       magnetTimeLeft = 5000; 
       addLog("🧲 IMÁN ACTIVADO!"); 
   }
   else if (type === 'flag') { if (!isStarImmune) { totalMoney = Math.max(0, totalMoney - 1); updateMoneyUI(); addLog("🇲🇦 -1💰"); } }
   else if (type === 'extralife') { hasExtraLife = true; updateExtraLifeUI(); addLog("💚 VIDA EXTRA!"); }
   else if (type === 'spainstar') { 
       isStarImmune = true; 
       container.classList.add('espana-effect'); 
       spainStarTimeLeft = 10000; 
       addLog("🇪🇸 ESTRELLA IMPERIAL!"); 
   }
   else if (type === 'geckoeater') { 
       isGeckoEaterActive = true; 
       geckoEaterTimeLeft = 10000; 
       addLog("❤️ GECKO DEVORADOR ACTIVADO! Se está comiendo todo lo que ve..."); 
   }
   else { 
       if (isStarImmune) { addLog("💥 INMUNE! 🇪🇸"); } 
       else if (hasExtraLife) { hasExtraLife = false; updateExtraLifeUI(); addLog("🛡️ CORAZÓN VERDE SALVÓ!"); } 
       else { endGame("¿Tienes pensado entregarla?"); }
   }
   obj.remove();
}

function completeLevel() {
   gameActive = false;
   let reward = Math.floor(targetLevelDist / 10);
   totalMoney += reward + money; saveProgress();
   
   let levelInWorld = ((unlockedLevel - 1) % 20) + 1;
   if (levelInWorld === 10) { unlockedLevel++; saveProgress(); launchRewardWheel('comun_gratis'); } 
   else if (levelInWorld === 20) { unlockedLevel++; saveProgress(); launchRewardWheel('premium_gratis'); } 
   else { unlockedLevel++; saveProgress(); alert(`¡Completado! Ganaste ${reward} 💰`); showLevelMenu(); }
}

function updateShopUI() {
   const shop = document.getElementById('bike-shop'); if(!shop) return; shop.innerHTML = ''; updateMoneyUI();
   bikes.forEach((bike, index) => {
       let isOwned = ownedBikes.includes(index);
       let div = document.createElement('div'); div.className = `item ${currentBikeIndex === index ? 'selected' : ''}`;
       div.innerHTML = `<span style="font-size:22px;">${bike.emoji}</span><br>${isOwned ? 'ELEGIR' : bike.price + ' 💰'}`;
       div.onclick = () => selectBike(index); shop.appendChild(div);
   });
}
function selectBike(index) {
   if (ownedBikes.includes(index)) { currentBikeIndex = index; localStorage.setItem('ramiroSelectedBike', index); updateShopUI(); } 
   else if (totalMoney >= bikes[index].price) { totalMoney -= bikes[index].price; ownedBikes.push(index); saveProgress(); selectBike(index); } 
   else { alert("Falta pasta 💰"); }
}
function buyWheelSpin(type) {
    let cost = type === 'normal' ? 1 : 100;
    if (totalMoney >= cost) { totalMoney -= cost; saveProgress(); updateMoneyUI(); launchRewardWheel(type); } 
    else { alert("Falta dinero."); }
}
function launchRewardWheel(mode) {
    currentWheelType = mode; hideAll(); document.getElementById('reward-screen').style.display = 'flex';
    document.getElementById('wheel-result').innerText = ""; document.getElementById('claim-btn').style.display = "none"; document.getElementById('spin-btn').style.display = "block";
}
function spinWheel() {
   const wheel = document.getElementById('wheel'); document.getElementById('spin-btn').style.display = "none";
   const randDeg = 1800 + Math.random() * 1000; wheel.style.transform = `rotate(${randDeg}deg)`;
   setTimeout(() => {
       let prizes, win;
       if(currentWheelType.includes('normal') || currentWheelType.includes('comun')) {
           prizes = ["5 💰", "15 💰", "25 💰"]; win = prizes[Math.floor(Math.random() * prizes.length)];
           totalMoney += parseInt(win);
       } else {
           prizes = ["100 💰", "500 💰", "🛸 OVNI"]; win = prizes[Math.floor(Math.random() * prizes.length)];
           if(win.includes("100")) totalMoney += 100; if(win.includes("500")) totalMoney += 500;
           if(win.includes("🛸") && !ownedBikes.includes(10)) ownedBikes.push(10);
       }
       document.getElementById('wheel-result').innerText = "¡PREMIO: " + win + "!"; saveProgress(); document.getElementById('claim-btn').style.display = "block";
   }, 3500);
}
function closeRewards() { if(currentWheelType.includes('gratis')) showLevelMenu(); else showShopMenu(); }
function saveProgress() { localStorage.setItem('ramiroMoney', totalMoney); localStorage.setItem('ramiroUnlockedLevel', unlockedLevel); localStorage.setItem('ramiroOwnedBikes', JSON.stringify(ownedBikes)); updateMoneyUI(); }
function saveHighScore(s) { highScores.push(s); highScores.sort((a, b) => b - a); highScores = highScores.slice(0, 3); localStorage.setItem('ramiroHighScores', JSON.stringify(highScores)); }
function updateRecordsUI() { const box = document.getElementById('best-scores'); if(box) box.innerHTML = highScores.map((s, i) => `<p>${i+1}º - ${s}m 🦎</p>`).join(''); }
function addLog(text) { const item = document.createElement('div'); item.className = 'log-item'; item.innerText = text; logContainer.appendChild(item); setTimeout(() => item.remove(), 2500); }
function updateMoneyUI() { if(totalMoneyElem) totalMoneyElem.innerText = totalMoney; }
function endGame(msg) { gameActive = false; document.getElementById('death-msg').innerText = msg; document.getElementById('game-over').style.display = 'flex'; if(gameMode==='infinite') saveHighScore(Math.floor(score)); }
function resetGame() { document.getElementById('game-over').style.display = 'none'; initGame(); }

// ==========================================
// MINIJUEGOS 
// ==========================================
let minigameIntervals = [];
let pachaBallX, pachaBallY, pachaBallSpeedX, pachaBallSpeedY;
let pachaUserX, pachaCpuX, pachaUserScore, pachaCpuScore, pachaBallEmoji;

function stopAllMinigames() {
    minigameIntervals.forEach(clearInterval); minigameIntervals = [];
}

function openPachanguitaSetup() {
    hideAll(); document.getElementById('pachanguita-setup').style.display = 'flex';
    document.getElementById('pacha-team').innerHTML = pachaTeams.map(t => `<option value="${t}">${t}</option>`).join('');
    document.getElementById('pacha-stadium').innerHTML = pachaStadiums.map((s,i) => `<option value="${i}">${s.name}</option>`).join('');
}

function startPachanguitaGame() {
    hideAll();
    stopAllMinigames();
    
    document.getElementById('pachanguita-screen').style.display = 'flex';
    document.getElementById('pacha-announcement').style.display = 'none'; 
    document.getElementById('pacha-announcement').innerHTML = '';
    
    const stadIdx = document.getElementById('pacha-stadium').value;
    document.getElementById('pacha-field').style.background = pachaStadiums[stadIdx].bg;
    pachaBallEmoji = document.getElementById('pacha-ball').value;
    document.getElementById('pacha-ball-obj').innerText = pachaBallEmoji;
    
    pachaUserScore = 0; pachaCpuScore = 0; pachaUserX = 125; pachaCpuX = 125;
    updatePachaScoreUI();
    resetPachaRound();
    
    let loop = setInterval(updatePachaPhysics, 1000/60);
    minigameIntervals.push(loop);
}

function resetPachaRound() {
    pachaBallX = 135; pachaBallY = 200;
    pachaBallSpeedX = (Math.random() > 0.5 ? 2.5 : -2.5);
    pachaBallSpeedY = (Math.random() > 0.5 ? 3 : -3);
    document.getElementById('pacha-announcement').style.display = 'none';
}

function updatePachaPhysics() {
    pachaBallX += pachaBallSpeedX; pachaBallY += pachaBallSpeedY;
    
    if (keys['ArrowLeft']) pachaUserX = Math.max(0, pachaUserX - 5);
    if (keys['ArrowRight']) pachaUserX = Math.min(250, pachaUserX + 5);
    
    if (pachaBallX <= 0) { pachaBallX = 0; pachaBallSpeedX *= -1; }
    if (pachaBallX >= 270) { pachaBallX = 270; pachaBallSpeedX *= -1; }
    
    let targetAI = pachaBallX - 10;
    let cpuDiff = targetAI - pachaCpuX;
    pachaCpuX += Math.sign(cpuDiff) * Math.min(Math.abs(cpuDiff), 3.5);
    pachaCpuX = Math.max(0, Math.min(250, pachaCpuX));
    
    document.getElementById('pacha-paddle-user').style.left = pachaUserX + 'px';
    document.getElementById('pacha-paddle-cpu').style.left = pachaCpuX + 'px';
    document.getElementById('pacha-ball-obj').style.left = pachaBallX + 'px';
    document.getElementById('pacha-ball-obj').style.top = pachaBallY + 'px';
    
    if (pachaBallY >= 440 && pachaBallY <= 455 && pachaBallSpeedY > 0) {
        if (pachaBallX >= pachaUserX - 25 && pachaBallX <= pachaUserX + 45) {
            pachaBallSpeedY *= -1.05; pachaBallY = 439;
        }
    }
    if (pachaBallY <= 60 && pachaBallY >= 45 && pachaBallSpeedY < 0) {
        if (pachaBallX >= pachaCpuX - 25 && pachaBallX <= pachaCpuX + 45) {
            pachaBallSpeedY *= -1.05; pachaBallY = 61;
        }
    }
    
    if (pachaBallY > 500) { pachaCpuScore++; triggerPachaGoal("¡GOL DE LA IA! 🤖"); } 
    else if (pachaBallY < 0) { pachaUserScore++; triggerPachaGoal("¡GOOOL! BON TREBALL 🦎"); }
}

function updatePachaScoreUI() {
    document.getElementById('pacha-scoreboard').innerText = `${pachaUserScore} - ${pachaCpuScore}`;
}

function triggerPachaGoal(msg) {
    updatePachaScoreUI();
    stopAllMinigames();
    const banner = document.getElementById('pacha-announcement');
    banner.innerText = msg; banner.style.display = 'block';
    
    if (pachaUserScore >= 3 || pachaCpuScore >= 3) {
        let winner = pachaUserScore >= 3 ? document.getElementById('pacha-team').value : "Robot IA";
        setTimeout(() => {
            banner.innerHTML = `¡SIUUU!<br><span style="font-size:18px;color:#f1c40f;">Ganador:<br>${winner}</span><br><br><button class="btn-start" style="width:140px;padding:6px;font-size:12px;" onclick="startPachanguitaGame()">REPETIR</button><br><button class="btn-info" style="width:140px;padding:6px;margin-top:4px;font-size:12px;" onclick="exitToMenu()">SALIR</button>`;
        }, 1000);
    } else {
        setTimeout(() => {
            resetPachaRound();
            let loop = setInterval(updatePachaPhysics, 1000/60);
            minigameIntervals.push(loop);
        }, 1500);
    }
}

// GECKO SNAKE
let snakeBody = [], snakeDir = {x: 0, y: -1}, snakeFood = {};
let snakeTime, snakeTimerInterval, snakeGridSize = 16;

function startSnakeMinigame() {
    hideAll(); document.getElementById('snake-screen').style.display = 'flex'; stopAllMinigames();
    const containerGrid = document.getElementById('snake-canvas-container');
    containerGrid.innerHTML = ''; containerGrid.className = 'snake-grid-canvas';
    containerGrid.style.gridTemplateColumns = `repeat(${snakeGridSize}, 18px)`;
    containerGrid.style.gridTemplateRows = `repeat(${snakeGridSize}, 18px)`;
    
    snakeBody = [{x: 8, y: 8}, {x: 8, y: 9}, {x: 8, y: 10}]; snakeDir = {x: 0, y: -1}; snakeTime = 0;
    document.getElementById('snake-timer').innerText = "0s";
    
    snakeTimerInterval = setInterval(() => { snakeTime++; document.getElementById('snake-timer').innerText = snakeTime + "s"; }, 1000);
    minigameIntervals.push(snakeTimerInterval);
    
    spawnSnakeFood(); renderSnake();
    
    let loop = setInterval(() => {
        if(keys['ArrowUp'] && snakeDir.y !== 1) snakeDir = {x:0, y:-1};
        if(keys['ArrowDown'] && snakeDir.y !== -1) snakeDir = {x:0, y:1};
        if(keys['ArrowLeft'] && snakeDir.x !== 1) snakeDir = {x:-1, y:0};
        if(keys['ArrowRight'] && snakeDir.x !== -1) snakeDir = {x:1, y:0};
        moveSnake();
    }, 180);
    minigameIntervals.push(loop);
}
function spawnSnakeFood() {
    snakeFood = { x: Math.floor(Math.random() * snakeGridSize), y: Math.floor(Math.random() * snakeGridSize), emoji: ['🚲', '🥙', '🐻'][Math.floor(Math.random() * 3)] };
}
function renderSnake() {
    const containerGrid = document.getElementById('snake-canvas-container'); containerGrid.innerHTML = '';
    for(let y=0; y<snakeGridSize; y++) {
        for(let x=0; x<snakeGridSize; x++) {
            let cell = document.createElement('div'); cell.className = 'snake-cell';
            if(snakeBody[0].x === x && snakeBody[0].y === y) cell.innerText = '🦎'; 
            else if(snakeBody.some((b, i) => i > 0 && b.x === x && b.y === y)) cell.innerText = '🟢'; 
            else if(snakeFood.x === x && snakeFood.y === y) cell.innerText = snakeFood.emoji;
            containerGrid.appendChild(cell);
        }
    }
}
function moveSnake() {
    let head = {x: snakeBody[0].x + snakeDir.x, y: snakeBody[0].y + snakeDir.y};
    if (head.x < 0 || head.x >= snakeGridSize || head.y < 0 || head.y >= snakeGridSize || snakeBody.some(b => b.x === head.x && b.y === head.y)) {
        stopAllMinigames();
        if (snakeTime > snakeRecord) { snakeRecord = snakeTime; localStorage.setItem('ramiroSnakeRecord', snakeRecord); }
        alert(`Fin. Tiempo: ${snakeTime}s.`); exitToMenu(); return;
    }
    snakeBody.unshift(head);
    if (head.x === snakeFood.x && head.y === snakeFood.y) { spawnSnakeFood(); } else { snakeBody.pop(); }
    renderSnake();
}

// FLAPPY GECKO
let flappyBirdY, flappyVelocity, flappyScoreValue, flappyPipes = [];
let flappyTrailCounter = 0;

function startFlappyMinigame() {
    hideAll(); document.getElementById('flappy-screen').style.display = 'flex'; stopAllMinigames();
    flappyBirdY = 200; flappyVelocity = 0; flappyScoreValue = 0; flappyPipes = []; flappyTrailCounter = 0;
    document.getElementById('flappy-score').innerText = "0";
    document.getElementById('flappy-obstacle-container').innerHTML = '';
    
    let physicsLoop = setInterval(() => {
        if(keys[' ']) flappyVelocity = -4.8; 
        updateFlappyPhysics();
    }, 1000/60);
    let pipeLoop = setInterval(spawnFlappyPipe, 2200);
    minigameIntervals.push(physicsLoop, pipeLoop);
}
function spawnFlappyPipe() {
    let gap = 145; let topHeight = Math.floor(Math.random() * 160) + 60; let bottomHeight = 500 - topHeight - gap;
    let containerGrid = document.getElementById('flappy-obstacle-container');
    let topPipe = document.createElement('div'); topPipe.className = 'flappy-pipe'; topPipe.style.height = topHeight + 'px'; topPipe.style.top = '0px'; topPipe.style.left = '400px'; topPipe.innerText = '🏗️';
    let bottomPipe = document.createElement('div'); bottomPipe.className = 'flappy-pipe'; bottomPipe.style.height = bottomHeight + 'px'; bottomPipe.style.bottom = '0px'; bottomPipe.style.left = '400px'; bottomPipe.innerText = '🏗️';
    containerGrid.appendChild(topPipe); containerGrid.appendChild(bottomPipe);
    flappyPipes.push({topElement: topPipe, bottomElement: bottomPipe, left: 400, passed: false, topH: topHeight, botH: bottomHeight});
}
function updateFlappyPhysics() {
    flappyVelocity += 0.22; flappyBirdY += flappyVelocity;
    document.getElementById('flappy-bird').style.top = flappyBirdY + 'px';
    
    if(flappyBirdY < 0 || flappyBirdY > 465) { handleFlappyDefeat(); return; }
    
    flappyTrailCounter++;
    if (flappyTrailCounter % 4 === 0) {
        const trail = document.createElement('div');
        trail.className = 'flappy-trail';
        trail.style.left = '70px';
        trail.style.top = (flappyBirdY + 12) + 'px';
        
        let mod = (flappyTrailCounter / 4) % 3;
        trail.style.background = (mod === 1) ? '#f1c40f' : '#e74c3c';
        
        document.getElementById('flappy-screen').appendChild(trail);
        
        let trailLeft = 70;
        let trailInt = setInterval(() => {
            trailLeft -= 2.2;
            trail.style.left = trailLeft + 'px';
            if (trailLeft < -20) { clearInterval(trailInt); trail.remove(); }
        }, 1000/60);
    }

    flappyPipes.forEach((pipe) => {
        pipe.left -= 2.2; pipe.topElement.style.left = pipe.left + 'px'; pipe.bottomElement.style.left = pipe.left + 'px';
        if(pipe.left < 60 && !pipe.passed) { pipe.passed = true; flappyScoreValue++; document.getElementById('flappy-score').innerText = flappyScoreValue; }
        if(pipe.left > 35 && pipe.left < 85) {
            if(flappyBirdY + 4 < pipe.topH || (flappyBirdY + 26) > (500 - pipe.botH)) handleFlappyDefeat();
        }
    });
    if(flappyPipes.length > 0 && flappyPipes[0].left < -65) { flappyPipes[0].topElement.remove(); flappyPipes[0].bottomElement.remove(); flappyPipes.shift(); }
}
function handleFlappyDefeat() { stopAllMinigames(); alert(`Fin. Puntos: ${flappyScoreValue}`); exitToMenu(); }
