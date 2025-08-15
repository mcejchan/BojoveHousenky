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
        
        // Zbraňový systém
        this.weaponType = 'staff';  // výchozí blesková hůl
        this.staffLength = 40;
        this.staffAngle = 0;
        this.burnTimer = 0;         // časovač hoření z fireballu
        this.slowTimer = 0;         // časovač zpomalení z ledového kopí
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
        this.burnTimer = 0;
        this.slowTimer = 0;
    }

    setWeapon(type) {
        this.weaponType = type;
    }

    update() {
        // Aktualizace cooldownů
        if (this.stunned > 0) this.stunned--;
        if (this.attackCooldown > 0) this.attackCooldown--;
        
        // Efekty ohně a ledu
        if (this.burnTimer > 0) {
            this.burnTimer--;
            this.health -= 0.5;  // postupné zranění
            // Červené částice při hoření
            if (Math.random() < 0.3) {
                particles.push(new Particle(this.torso.x + (Math.random() - 0.5) * 20, 
                                           this.torso.y + (Math.random() - 0.5) * 20, 'red'));
            }
        }
        if (this.slowTimer > 0) {
            this.slowTimer--;
        }
        
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
        
        // Kreslení zbraní
        if (this.attackCooldown > 15) {
            ctx.save();
            ctx.translate(this.rightHand.x, this.rightHand.y);
            ctx.rotate(this.staffAngle);
            
            switch (this.weaponType) {
                case 'staff':
                    // Blesková hůl
                    ctx.strokeStyle = '#8B4513';
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(this.staffLength, 0);
                    ctx.stroke();
                    
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    ctx.moveTo(this.staffLength - 5, -5);
                    ctx.lineTo(this.staffLength + 10, 0);
                    ctx.lineTo(this.staffLength - 5, 5);
                    ctx.closePath();
                    ctx.fill();
                    break;
                    
                case 'fire':
                    // Ohnivá hůl
                    ctx.strokeStyle = '#8B4513';
                    ctx.lineWidth = 4;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(this.staffLength, 0);
                    ctx.stroke();
                    
                    ctx.fillStyle = '#FF4500';
                    ctx.beginPath();
                    ctx.arc(this.staffLength, 0, 8, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    ctx.arc(this.staffLength, 0, 5, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                case 'ice':
                    // Ledové kopí
                    ctx.strokeStyle = '#4682B4';
                    ctx.lineWidth = 5;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(this.staffLength + 10, 0);
                    ctx.stroke();
                    
                    ctx.fillStyle = '#87CEEB';
                    ctx.beginPath();
                    ctx.moveTo(this.staffLength + 10, 0);
                    ctx.lineTo(this.staffLength + 20, -3);
                    ctx.lineTo(this.staffLength + 20, 3);
                    ctx.closePath();
                    ctx.fill();
                    break;
                    
                case 'crossbow':
                    // Kuše
                    ctx.strokeStyle = '#8B4513';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(25, 0);
                    ctx.stroke();
                    
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(25, -8);
                    ctx.lineTo(25, 8);
                    ctx.stroke();
                    break;
                    
                case 'boomerang':
                    // Bumerang (jen při házení se nekreslí)
                    break;
            }
            
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
        
        const baseSpeed = 3;
        const speed = this.slowTimer > 0 ? baseSpeed * 0.5 : baseSpeed; // zpomalení na 50 %
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
        
        // Úhel na soupeře
        const angle = Math.atan2(opponent.torso.y - this.rightHand.y, 
                               opponent.torso.x - this.rightHand.x);
        
        switch (this.weaponType) {
            case 'staff': {
                this.attackCooldown = 30;
                this.staffAngle = angle;
                const dx = opponent.torso.x - this.rightHand.x;
                const dy = opponent.torso.y - this.rightHand.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    opponent.health -= 15;
                    opponent.stunned = 20;
                    
                    const knockbackPower = 10;
                    opponent.parts.forEach(part => {
                        part.vx += (dx / distance) * knockbackPower;
                        part.vy += (dy / distance) * knockbackPower - 5;
                    });
                    
                    createLightningEffect(this.rightHand.x, this.rightHand.y, 
                                        opponent.torso.x, opponent.torso.y);
                    
                    for (let i = 0; i < 10; i++) {
                        particles.push(new Particle(opponent.torso.x, opponent.torso.y, 'yellow'));
                    }
                }
                break;
            }
            case 'fire': {
                this.attackCooldown = 40;
                fireballs.push(new Fireball(this.rightHand.x, this.rightHand.y, angle));
                break;
            }
            case 'ice': {
                this.attackCooldown = 35;
                this.staffAngle = angle;
                const dx = opponent.torso.x - this.rightHand.x;
                const dy = opponent.torso.y - this.rightHand.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 130) {
                    opponent.health -= 12;
                    opponent.slowTimer = 180; // zpomalí na 3 sekundy
                    opponent.stunned = 10;
                    
                    const knockbackPower = 8;
                    opponent.parts.forEach(part => {
                        part.vx += (dx / distance) * knockbackPower;
                        part.vy += (dy / distance) * knockbackPower - 3;
                    });
                    
                    for (let i = 0; i < 15; i++) {
                        particles.push(new Particle(opponent.torso.x, opponent.torso.y, 'lightblue'));
                    }
                }
                break;
            }
            case 'boomerang': {
                this.attackCooldown = 80;
                boomerangs.push(new Boomerang(this.rightHand.x, this.rightHand.y, angle, this));
                break;
            }
            case 'crossbow': {
                this.attackCooldown = 60;
                arrows.push(new Arrow(this.rightHand.x, this.rightHand.y, angle));
                break;
            }
        }
    }
}