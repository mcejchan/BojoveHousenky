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
let roundNumber = 1;
let roundWinner = null;
let respawnDelay = 0;

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
    if (respawnDelay > 0) {
        respawnDelay--;
        return;
    }
    
    if (bluePlayer.health <= 0 && roundWinner === null) {
        bluePlayer.lives--;
        roundWinner = 'red';
        respawnDelay = 60; // 1 sekunda pauza
        
        if (bluePlayer.lives <= 0) {
            endGame('ČERVENÝ VYHRÁL CELOU HRU!', '#ff4444');
        }
    } else if (redPlayer.health <= 0 && roundWinner === null) {
        redPlayer.lives--;
        roundWinner = 'blue';
        respawnDelay = 60; // 1 sekunda pauza
        
        if (redPlayer.lives <= 0) {
            endGame('MODRÝ VYHRÁL CELOU HRU!', '#00d4ff');
        }
    }
    
    // Respawn po pauze
    if (respawnDelay === 1 && roundWinner !== null) {
        if (bluePlayer.lives > 0 && redPlayer.lives > 0) {
            // Oba hráči mají ještě životy - respawn pro nové kolo
            bluePlayer.respawn();
            redPlayer.respawn();
            roundWinner = null;
            roundNumber++;
            
            // Efekt pro nové kolo
            for (let i = 0; i < 20; i++) {
                particles.push(new Particle(canvas.width / 2, canvas.height / 2, 'white'));
            }
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
        ctx.fillText(`Kolo ${roundNumber + 1} začíná...`, canvas.width / 2, canvas.height / 2 + 50);
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