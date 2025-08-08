class Joint {
    constructor(partA, partB, length, stiffness = 0.8) {
        this.partA = partA;
        this.partB = partB;
        this.length = length;
        this.stiffness = stiffness;
    }

    update() {
        const dx = this.partB.x - this.partA.x;
        const dy = this.partB.y - this.partA.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            const diff = (this.length - dist) / dist * this.stiffness;
            const offsetX = dx * diff * 0.5;
            const offsetY = dy * diff * 0.5;
            
            this.partA.x -= offsetX;
            this.partA.y -= offsetY;
            this.partB.x += offsetX;
            this.partB.y += offsetY;
        }
    }

    draw() {
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.partA.x, this.partA.y);
        ctx.lineTo(this.partB.x, this.partB.y);
        ctx.stroke();
    }
}