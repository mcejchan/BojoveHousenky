class Fireball {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * 6;
        this.vy = Math.sin(angle) * 6;
        this.life = 60; // letí ~1s
        this.size = 8;
        this.trail = [];
        this.hitPlayers = new Set(); // zamezí vícenásobnému zásahu
    }

    update() {
        if (this.life <= 0) return;
        
        // Pohyb
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        
        // Přidání do stopy
        this.trail.push({ x: this.x, y: this.y, life: 10 });
        if (this.trail.length > 8) {
            this.trail.shift();
        }
        
        // Aktualizace stopy
        this.trail.forEach(point => point.life--);
        this.trail = this.trail.filter(point => point.life > 0);
        
        // Kontrola hranic
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height - 50) {
            this.life = 0;
        }
        
        // Kolize s hráči
        [bluePlayer, redPlayer].forEach(player => {
            if (this.hitPlayers.has(player)) return;
            
            const dx = player.torso.x - this.x;
            const dy = player.torso.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.size + player.torso.radius && this.life > 0) {
                player.health -= 10;
                player.burnTimer = 180; // hoří 3s
                player.stunned = 15;
                
                // Knockback
                const knockbackPower = 8;
                player.parts.forEach(part => {
                    part.vx += (dx < 0 ? -1 : 1) * knockbackPower;
                    part.vy -= 5;
                });
                
                // Částice při zásahu
                for (let i = 0; i < 15; i++) {
                    particles.push(new Particle(this.x, this.y, 'orange'));
                    particles.push(new Particle(this.x, this.y, 'red'));
                }
                
                this.hitPlayers.add(player);
                this.life = 0;
            }
        });
    }

    draw() {
        if (this.life <= 0) return;
        
        // Kreslení stopy
        ctx.save();
        this.trail.forEach((point, index) => {
            const alpha = (point.life / 10) * (index / this.trail.length);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#ff6600';
            const size = (index / this.trail.length) * this.size * 0.5;
            ctx.beginPath();
            ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
        
        // Kreslení ohnivé koule
        ctx.save();
        
        // Vnější oheň
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Vnitřní jádro
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // Blikající střed
        if (Math.random() < 0.5) {
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    isFinished() {
        return this.life <= 0;
    }
}