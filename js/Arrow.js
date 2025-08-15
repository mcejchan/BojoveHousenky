class Arrow {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * 12;
        this.vy = Math.sin(angle) * 12;
        this.angle = angle;
        this.life = 100; // přibližně 1,6 s letu
        this.length = 20;
        this.hitPlayers = new Set(); // zamezí vícenásobnému zásahu
    }

    update() {
        if (this.life <= 0) return;
        
        // Pohyb
        this.x += this.vx;
        this.y += this.vy;
        
        // Mírná gravitace pro realistický oblouk
        this.vy += 0.1;
        
        // Aktualizace úhlu podle směru letu
        this.angle = Math.atan2(this.vy, this.vx);
        
        this.life--;
        
        // Kontrola hranic
        if (this.x < -50 || this.x > canvas.width + 50 || 
            this.y < -50 || this.y > canvas.height - 30) {
            this.life = 0;
        }
        
        // Kolize se zemí
        if (this.y > canvas.height - 50) {
            this.life = 0;
            // Částice při dopadu
            for (let i = 0; i < 5; i++) {
                particles.push(new Particle(this.x, this.y, '#8B4513'));
            }
        }
        
        // Kolize s hráči
        [bluePlayer, redPlayer].forEach(player => {
            if (this.hitPlayers.has(player)) return;
            
            const dx = player.torso.x - this.x;
            const dy = player.torso.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 12 + player.torso.radius && this.life > 0) {
                player.health -= 20;
                player.stunned = 25;
                
                // Silný knockback
                const knockbackPower = 15;
                player.parts.forEach(part => {
                    part.vx += (this.vx / 12) * knockbackPower;
                    part.vy += (this.vy / 12) * knockbackPower - 8;
                });
                
                // Částice při zásahu
                for (let i = 0; i < 12; i++) {
                    particles.push(new Particle(this.x, this.y, '#666'));
                    particles.push(new Particle(this.x, this.y, 'red'));
                }
                
                this.hitPlayers.add(player);
                this.life = 0;
            }
        });
    }

    draw() {
        if (this.life <= 0) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Hrot šipky
        ctx.fillStyle = '#4A4A4A';
        ctx.beginPath();
        ctx.moveTo(this.length / 2, 0);
        ctx.lineTo(this.length / 2 - 8, -3);
        ctx.lineTo(this.length / 2 - 8, 3);
        ctx.closePath();
        ctx.fill();
        
        // Tělo šipky
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-this.length / 2, -1, this.length - 8, 2);
        
        // Peří
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.moveTo(-this.length / 2, 0);
        ctx.lineTo(-this.length / 2 - 5, -4);
        ctx.lineTo(-this.length / 2 - 2, 0);
        ctx.lineTo(-this.length / 2 - 5, 4);
        ctx.closePath();
        ctx.fill();
        
        // Stín šipky pro 3D efekt
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#000';
        ctx.fillRect(-this.length / 2, 1, this.length - 8, 1);
        
        ctx.restore();
        
        // Trail efekt pro rychlé šipky
        if (this.life > 80) {
            ctx.save();
            ctx.globalAlpha = 0.4;
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.vx * 2, this.y - this.vy * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    isFinished() {
        return this.life <= 0;
    }
}