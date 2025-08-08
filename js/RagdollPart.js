class RagdollPart {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = radius;
        this.color = color;
        this.mass = radius * 0.1;
    }

    update() {
        // Gravitace
        this.vy += 0.5;
        
        // Tření
        this.vx *= 0.98;
        this.vy *= 0.99;
        
        // Aktualizace pozice
        this.x += this.vx;
        this.y += this.vy;
        
        // Omezení na canvas
        if (this.y + this.radius > canvas.height - 50) {
            this.y = canvas.height - 50 - this.radius;
            this.vy *= -0.5;
        }
        
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -0.5;
        }
        
        if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.vx *= -0.5;
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}