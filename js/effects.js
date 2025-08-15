// Funkce pro vytvoření bleskového efektu
function createLightningEffect(x1, y1, x2, y2) {
    lightningEffects.push({
        x1, y1, x2, y2,
        life: 10,
        segments: []
    });
    
    // Vytvoření segmentů blesku
    const segments = 5;
    const effect = lightningEffects[lightningEffects.length - 1];
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 20;
        const y = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 20;
        effect.segments.push({x, y});
    }
}

// Načtení obrázků pozadí
const backgroundImages = [];
const backgroundSources = ['background1.jpg', 'background2.jpg', 'background3.jpg'];

// Načtení všech obrázků pozadí
backgroundSources.forEach((src, index) => {
    const img = new Image();
    img.src = src;
    backgroundImages[index] = img;
});

// Fallback na původní obrázek, pokud nové neexistují
const fallbackImage = new Image();
fallbackImage.src = 'background.jpg';

// Kreslení pozadí
function drawBackground() {
    // Výběr pozadí podle čísla kola (cyklicky pro 3 obrázky)
    const backgroundIndex = (roundNumber - 1) % 3;
    const currentBackground = backgroundImages[backgroundIndex];
    
    // Pokud je aktuální obrázek načten, použij ho
    if (currentBackground && currentBackground.complete && currentBackground.naturalWidth > 0) {
        ctx.drawImage(currentBackground, 0, 0, canvas.width, canvas.height);
    } 
    // Fallback na původní obrázek
    else if (fallbackImage.complete && fallbackImage.naturalWidth > 0) {
        ctx.drawImage(fallbackImage, 0, 0, canvas.width, canvas.height);
    } else {
        // Fallback na původní pozadí, pokud se obrázek nenačte
        // Nebe
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height * 0.7);
        
        // Mraky
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        for (let i = 0; i < 3; i++) {
            const x = 150 + i * 300 + Math.sin(Date.now() * 0.0001 + i) * 20;
            const y = 50 + i * 30;
            ctx.beginPath();
            ctx.arc(x, y, 30, 0, Math.PI * 2);
            ctx.arc(x + 25, y, 35, 0, Math.PI * 2);
            ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Platforma
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
        
        // Láva
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
        
        // Bubliny lávy
        for (let i = 0; i < 5; i++) {
            const x = (Date.now() * 0.1 + i * 200) % canvas.width;
            const y = canvas.height - 20 + Math.sin(Date.now() * 0.002 + i) * 10;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}