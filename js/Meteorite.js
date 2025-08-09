class Meteorite {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = Math.random() * 3 + 2;
        this.size = Math.random() * 15 + 10;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        this.trail = [];
        this.exploded = false;
        this.explosionRadius = 0;
        this.explosionMaxRadius = this.size * 3;
        this.explosionParticles = [];
    }

    update() {
        if (!this.exploded) {
            // Pohyb meteoritu
            this.vy += 0.1; // Gravitace
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotationSpeed;
            
            // Přidání do stopy
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 8) {
                this.trail.shift();
            }
            
            // Kontrola kolize se zemí
            if (this.y + this.size > canvas.height - 50) {
                this.explode();
            }
            
            // Kontrola kolize s hráči
            this.checkPlayerCollision(bluePlayer);
            this.checkPlayerCollision(redPlayer);
        } else {
            // Animace exploze
            if (this.explosionRadius < this.explosionMaxRadius) {
                this.explosionRadius += 2;
            }
            
            // Aktualizace částic exploze
            this.explosionParticles.forEach(particle => particle.update());
            this.explosionParticles = this.explosionParticles.filter(p => p.life > 0);
        }
    }

    checkPlayerCollision(player) {
        if (this.exploded) return;
        
        const dx = this.x - player.torso.x;
        const dy = this.y - player.torso.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.size + player.torso.radius) {
            this.explode();
            // Poškození hráče
            player.health -= 25;
            player.stunned = 30;
            
            // Knockback
            const knockbackPower = 15;
            player.parts.forEach(part => {
                part.vx += (part.x - this.x) / distance * knockbackPower;
                part.vy += (part.y - this.y) / distance * knockbackPower - 8;
            });
        }
    }

    explode() {
        if (this.exploded) return;
        
        this.exploded = true;
        
        // Vytvoření částic exploze
        for (let i = 0; i < 15; i++) {
            this.explosionParticles.push(new Particle(this.x, this.y, 'orange'));
            this.explosionParticles.push(new Particle(this.x, this.y, 'red'));
            this.explosionParticles.push(new Particle(this.x, this.y, 'yellow'));
        }
        
        // Přidání dalších částic do hlavního pole
        for (let i = 0; i < 20; i++) {
            particles.push(new Particle(this.x, this.y, 'orange'));
        }
    }

    draw() {
        if (!this.exploded) {
            // Kreslení stopy
            ctx.save();
            for (let i = 0; i < this.trail.length; i++) {
                const alpha = i / this.trail.length * 0.5;
                ctx.globalAlpha = alpha;
                ctx.fillStyle = '#ff6600';
                const size = (i / this.trail.length) * this.size * 0.5;
                ctx.beginPath();
                ctx.arc(this.trail[i].x, this.trail[i].y, size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
            
            // Kreslení meteoritu
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            
            // Vnější oheň
            ctx.fillStyle = '#ff3300';
            ctx.beginPath();
            ctx.arc(0, 0, this.size + 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Vnitřní část
            ctx.fillStyle = '#660000';
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Textury na meteoritu
            ctx.fillStyle = '#330000';
            ctx.beginPath();
            ctx.arc(-3, -2, 3, 0, Math.PI * 2);
            ctx.arc(4, 1, 2, 0, Math.PI * 2);
            ctx.arc(-1, 4, 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        } else {
            // Kreslení exploze
            if (this.explosionRadius > 0) {
                ctx.save();
                ctx.globalAlpha = Math.max(0, (this.explosionMaxRadius - this.explosionRadius) / this.explosionMaxRadius);
                
                // Vnější kruh exploze
                ctx.fillStyle = '#ff6600';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.explosionRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // Vnitřní kruh
                ctx.fillStyle = '#ffaa00';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.explosionRadius * 0.7, 0, Math.PI * 2);
                ctx.fill();
                
                // Střed exploze
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.explosionRadius * 0.3, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
            }
            
            // Kreslení částic exploze
            this.explosionParticles.forEach(particle => particle.draw());
        }
    }

    isFinished() {
        return this.exploded && this.explosionRadius >= this.explosionMaxRadius && this.explosionParticles.length === 0;
    }
}