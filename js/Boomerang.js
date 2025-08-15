class Boomerang {
    constructor(x, y, angle, owner) {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.vx = Math.cos(angle) * 8;
        this.vy = Math.sin(angle) * 8;
        this.owner = owner;
        this.distance = 0;
        this.maxDistance = 200;
        this.returning = false;
        this.finished = false;
        this.rotation = 0;
        this.rotationSpeed = 0.3;
        this.hitPlayers = new Set(); // zamezí vícenásobnému zásahu stejného hráče
    }

    update() {
        if (this.finished) return;
        
        // Rotace bumerangu
        this.rotation += this.rotationSpeed;
        
        if (!this.returning) {
            // Cesta tam
            this.x += this.vx;
            this.y += this.vy;
            this.distance += Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            
            // Kontrola maximální vzdálenosti
            if (this.distance >= this.maxDistance) {
                this.returning = true;
                // Otočení směru
                this.vx = -this.vx * 0.8; // trochu pomalejší návrat
                this.vy = -this.vy * 0.8;
                this.rotationSpeed = -this.rotationSpeed;
            }
        } else {
            // Cesta zpět
            this.x += this.vx;
            this.y += this.vy;
            this.distance -= Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            
            // Kontrola návratu k majiteli
            const dx = this.owner.rightHand.x - this.x;
            const dy = this.owner.rightHand.y - this.y;
            const distanceToOwner = Math.sqrt(dx * dx + dy * dy);
            
            if (distanceToOwner < 20 || this.distance <= 0) {
                this.finished = true;
                return;
            }
        }
        
        // Kontrola hranic
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height - 50) {
            this.finished = true;
            return;
        }
        
        // Kolize s hráči (kromě majitele při návratu)
        [bluePlayer, redPlayer].forEach(player => {
            if (player === this.owner && this.returning) return;
            if (this.hitPlayers.has(player)) return;
            
            const dx = player.torso.x - this.x;
            const dy = player.torso.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 15 + player.torso.radius && !this.finished) {
                player.health -= 12;
                player.stunned = 15;
                
                // Knockback
                const knockbackPower = 12;
                player.parts.forEach(part => {
                    part.vx += (dx < 0 ? -1 : 1) * knockbackPower;
                    part.vy += (dy < 0 ? -1 : 1) * knockbackPower - 3;
                });
                
                // Částice při zásahu
                for (let i = 0; i < 10; i++) {
                    particles.push(new Particle(this.x, this.y, 'brown'));
                }
                
                this.hitPlayers.add(player);
                
                // Bumerang se může vrátit i po zásahu
                if (!this.returning) {
                    this.returning = true;
                    this.vx = -this.vx * 0.8;
                    this.vy = -this.vy * 0.8;
                    this.rotationSpeed = -this.rotationSpeed;
                }
            }
        });
    }

    draw() {
        if (this.finished) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Bumerang ve tvaru "L"
        ctx.fillStyle = '#8B4513';
        ctx.lineWidth = 3;
        
        // Horizontální rameno
        ctx.fillRect(-10, -2, 20, 4);
        
        // Vertikální rameno
        ctx.fillRect(-2, -10, 4, 20);
        
        // Ozdobné konce
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.arc(-10, 0, 3, 0, Math.PI * 2);
        ctx.arc(10, 0, 3, 0, Math.PI * 2);
        ctx.arc(0, -10, 3, 0, Math.PI * 2);
        ctx.arc(0, 10, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // Efekt rotace (trail efekt)
        if (Math.random() < 0.3) {
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation - 0.5);
            ctx.fillStyle = '#A0522D';
            ctx.fillRect(-8, -2, 16, 4);
            ctx.fillRect(-2, -8, 4, 16);
            ctx.restore();
        }
    }

    isFinished() {
        return this.finished;
    }
}