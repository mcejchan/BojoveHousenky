class Stickman {
    constructor(x, y, color, name) {
        this.name = name;
        this.color = color;
        this.health = 100;
        this.maxHealth = 100;
        this.lives = 3;
        this.stunned = 0;
        this.attackCooldown = 0;
        this.isJumping = false;
        this.startX = x;
        this.startY = y;
        
        // Vytvoření ragdoll částí
        this.head = new RagdollPart(x, y - 40, 15, color);
        this.torso = new RagdollPart(x, y, 12, color);
        this.leftHand = new RagdollPart(x - 20, y - 10, 8, color);
        this.rightHand = new RagdollPart(x + 20, y - 10, 8, color);
        this.leftFoot = new RagdollPart(x - 10, y + 30, 8, color);
        this.rightFoot = new RagdollPart(x + 10, y + 30, 8, color);
        
        this.parts = [this.head, this.torso, this.leftHand, this.rightHand, this.leftFoot, this.rightFoot];
        
        // Vytvoření kloubů
        this.joints = [
            new Joint(this.head, this.torso, 30),
            new Joint(this.torso, this.leftHand, 25),
            new Joint(this.torso, this.rightHand, 25),
            new Joint(this.torso, this.leftFoot, 35),
            new Joint(this.torso, this.rightFoot, 35)
        ];
        
        // Blesková hůl
        this.staffLength = 40;
        this.staffAngle = 0;
    }

    respawn() {
        // Reset pozice
        this.head.x = this.startX;
        this.head.y = this.startY - 40;
        this.torso.x = this.startX;
        this.torso.y = this.startY;
        this.leftHand.x = this.startX - 20;
        this.leftHand.y = this.startY - 10;
        this.rightHand.x = this.startX + 20;
        this.rightHand.y = this.startY - 10;
        this.leftFoot.x = this.startX - 10;
        this.leftFoot.y = this.startY + 30;
        this.rightFoot.x = this.startX + 10;
        this.rightFoot.y = this.startY + 30;
        
        // Reset rychlostí
        this.parts.forEach(part => {
            part.vx = 0;
            part.vy = 0;
        });
        
        // Reset stavu (ale neobnovujeme lives - ty se snižují pouze při prohře kola)
        this.health = this.maxHealth;
        this.stunned = 0;
        this.attackCooldown = 0;
        this.isJumping = false;
    }

    update() {
        // Aktualizace cooldownů
        if (this.stunned > 0) this.stunned--;
        if (this.attackCooldown > 0) this.attackCooldown--;
        
        // Aktualizace částí
        this.parts.forEach(part => part.update());
        
        // Aktualizace kloubů (2x pro stabilitu)
        for (let i = 0; i < 2; i++) {
            this.joints.forEach(joint => joint.update());
        }
        
        // Kontrola pádu do lávy
        if (this.torso.y > canvas.height - 30) {
            this.health = 0;
        }
        
        // Kontrola skákání
        if (Math.abs(this.leftFoot.vy) < 0.1 && Math.abs(this.rightFoot.vy) < 0.1) {
            this.isJumping = false;
        }
    }

    draw() {
        // Kreslení kloubů
        this.joints.forEach(joint => joint.draw());
        
        // Kreslení částí
        this.parts.forEach(part => part.draw());
        
        // Kreslení obličeje
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.head.x - 5, this.head.y - 3, 3, 0, Math.PI * 2);
        ctx.arc(this.head.x + 5, this.head.y - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Kreslení bleskové hole
        if (this.attackCooldown > 15) {
            ctx.save();
            ctx.translate(this.rightHand.x, this.rightHand.y);
            ctx.rotate(this.staffAngle);
            
            // Hůl
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(this.staffLength, 0);
            ctx.stroke();
            
            // Blesk na konci hole
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.moveTo(this.staffLength - 5, -5);
            ctx.lineTo(this.staffLength + 10, 0);
            ctx.lineTo(this.staffLength - 5, 5);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }
        
        // Efekt omráčení
        if (this.stunned > 0) {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(this.head.x, this.head.y - 20, 5 + i * 3, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }

    move(direction) {
        if (this.stunned > 0) return;
        
        const speed = 3;
        this.torso.vx += direction * speed;
        this.head.vx += direction * speed;
    }

    jump() {
        if (this.stunned > 0 || this.isJumping) return;
        
        const jumpPower = -12;
        this.parts.forEach(part => {
            part.vy += jumpPower;
        });
        this.isJumping = true;
    }

    attack(opponent) {
        if (this.attackCooldown > 0 || this.stunned > 0) return;
        
        this.attackCooldown = 30;
        this.staffAngle = Math.atan2(opponent.torso.y - this.rightHand.y, 
                                    opponent.torso.x - this.rightHand.x);
        
        // Kontrola dosahu
        const dx = opponent.torso.x - this.rightHand.x;
        const dy = opponent.torso.y - this.rightHand.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
            // Zasažení
            opponent.health -= 15;
            opponent.stunned = 20;
            
            // Knockback
            const knockbackPower = 10;
            opponent.parts.forEach(part => {
                part.vx += (dx / distance) * knockbackPower;
                part.vy += (dy / distance) * knockbackPower - 5;
            });
            
            // Blesk efekt
            createLightningEffect(this.rightHand.x, this.rightHand.y, 
                                opponent.torso.x, opponent.torso.y);
            
            // Částice
            for (let i = 0; i < 10; i++) {
                particles.push(new Particle(opponent.torso.x, opponent.torso.y, 'yellow'));
            }
        }
    }
}