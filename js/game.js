// Hlavní herní logika
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Nastavení velikosti canvasu
canvas.width = 1000;
canvas.height = 600;

// Game state
let gameRunning = true;
let particles = [];
let lightningEffects = [];
let meteorites = [];
let roundNumber = 1;
let roundWinner = null;
let respawnDelay = 0;
let nextMeteoriteTime = 1800 + Math.random() * 600; // 30-40 sekund náhodně

// Vytvoření hráčů
const bluePlayer = new Stickman(200, 400, '#00d4ff', 'MODRÝ');
const redPlayer = new Stickman(800, 400, '#ff4444', 'ČERVENÝ');

// Aktualizace UI
function updateUI() {
    document.getElementById('blueHealth').style.width = Math.max(0, bluePlayer.health) + '%';
    document.getElementById('redHealth').style.width = Math.max(0, redPlayer.health) + '%';
    
    // Aktualizace životů
    const blueLives = document.querySelectorAll('#blueLives .life');
    const redLives = document.querySelectorAll('#redLives .life');
    
    blueLives.forEach((life, index) => {
        if (index >= bluePlayer.lives) {
            life.classList.add('lost');
        } else {
            life.classList.remove('lost');
        }
    });
    
    redLives.forEach((life, index) => {
        if (index >= redPlayer.lives) {
            life.classList.add('lost');
        } else {
            life.classList.remove('lost');
        }
    });
}

// Kontrola konce kola
function checkRoundEnd() {
    // Odpočítávání pauzy a respawn po jejím skončení
    if (respawnDelay > 0) {
        respawnDelay--;
        
        // Po skončení pauzy provést respawn
        if (respawnDelay === 0 && roundWinner !== null) {
            // Zvýšit číslo kola před respawnem
            roundNumber++;
            
            // Respawnuj oba hráče na začátek nového kola
            bluePlayer.respawn();
            redPlayer.respawn();
            roundWinner = null;
            
            // Efekt pro nové kolo
            for (let i = 0; i < 20; i++) {
                particles.push(new Particle(canvas.width / 2, canvas.height / 2, 'white'));
            }
        }
        return; // Během pauzy nekontrolujeme úmrtí
    }
    
    // Kontrola úmrtí - pouze když není pauza
    if (bluePlayer.health <= 0 && roundWinner === null) {
        bluePlayer.lives--;
        roundWinner = 'red';
        respawnDelay = 60; // 1 sekunda pauza
        
        if (bluePlayer.lives <= 0) {
            endGame('ČERVENÝ VYHRÁL CELOU HRU!', '#ff4444');
            return;
        }
    } else if (redPlayer.health <= 0 && roundWinner === null) {
        redPlayer.lives--;
        roundWinner = 'blue';
        respawnDelay = 60; // 1 sekunda pauza
        
        if (redPlayer.lives <= 0) {
            endGame('MODRÝ VYHRÁL CELOU HRU!', '#00d4ff');
            return;
        }
    }
}

// Konec hry
function endGame(message, color) {
    gameRunning = false;
    document.getElementById('winner').textContent = message;
    document.getElementById('winner').style.color = color;
    document.getElementById('gameOver').style.display = 'block';
}

// Restart hry
document.getElementById('restartBtn').addEventListener('click', () => {
    location.reload();
});

// Herní smyčka
function gameLoop() {
    if (!gameRunning) return;
    
    // Vyčištění canvasu
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Kreslení pozadí
    drawBackground();
    
    // Zpracování vstupu
    handleInput();
    
    // Aktualizace hráčů
    bluePlayer.update();
    redPlayer.update();
    
    // Meteorit spawn
    nextMeteoriteTime--;
    if (nextMeteoriteTime <= 0) {
        const x = Math.random() * canvas.width;
        const y = -50;
        meteorites.push(new Meteorite(x, y));
        nextMeteoriteTime = 1800 + Math.random() * 600; // 30-40 sekund náhodně
    }
    
    // Aktualizace meteoritů
    meteorites.forEach(meteorite => meteorite.update());
    meteorites = meteorites.filter(meteorite => !meteorite.isFinished());
    
    // Kreslení meteoritů
    meteorites.forEach(meteorite => meteorite.draw());
    
    // Kreslení hráčů
    bluePlayer.draw();
    redPlayer.draw();
    
    // Aktualizace a kreslení částic
    particles = particles.filter(particle => {
        particle.update();
        if (particle.life > 0) {
            particle.draw();
            return true;
        }
        return false;
    });
    
    // Kreslení bleskových efektů
    lightningEffects = lightningEffects.filter(effect => {
        effect.life--;
        if (effect.life > 0) {
            ctx.save();
            ctx.globalAlpha = effect.life / 10;
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 10;
            
            ctx.beginPath();
            ctx.moveTo(effect.x1, effect.y1);
            for (let segment of effect.segments) {
                ctx.lineTo(segment.x, segment.y);
            }
            ctx.stroke();
            ctx.restore();
            return true;
        }
        return false;
    });
    
    // Kreslení informace o kole
    if (respawnDelay > 0 && roundWinner !== null) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        const winnerName = roundWinner === 'blue' ? 'MODRÝ' : 'ČERVENÝ';
        ctx.fillText(`${winnerName} VYHRÁL KOLO!`, canvas.width / 2, canvas.height / 2);
        
        ctx.font = '24px Arial';
        ctx.fillText(`Kolo ${roundNumber} začíná...`, canvas.width / 2, canvas.height / 2 + 50);
        ctx.restore();
    }
    
    // Zobrazení čísla kola
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`KOLO ${roundNumber}`, canvas.width / 2, 40);
    ctx.restore();
    
    // Aktualizace UI
    updateUI();
    
    // Kontrola konce kola
    checkRoundEnd();
    
    // Další snímek
    requestAnimationFrame(gameLoop);
}

// Inicializace a spuštění hry
function initGame() {
    setupMobileControls();
    gameLoop();
}