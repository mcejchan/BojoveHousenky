// Ovládání
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Mobilní ovládání
function setupMobileControls() {
    const addTouchControl = (id, action) => {
        const btn = document.getElementById(id);
        if (!btn) return;
        
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            action.start();
        });
        
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            action.end();
        });
    };

    addTouchControl('blueLeft', {
        start: () => keys['a'] = true,
        end: () => keys['a'] = false
    });
    
    addTouchControl('blueRight', {
        start: () => keys['d'] = true,
        end: () => keys['d'] = false
    });
    
    addTouchControl('blueJump', {
        start: () => keys['w'] = true,
        end: () => keys['w'] = false
    });
    
    addTouchControl('blueAttack', {
        start: () => keys['s'] = true,
        end: () => keys['s'] = false
    });
    
    addTouchControl('redLeft', {
        start: () => keys['arrowleft'] = true,
        end: () => keys['arrowleft'] = false
    });
    
    addTouchControl('redRight', {
        start: () => keys['arrowright'] = true,
        end: () => keys['arrowright'] = false
    });
    
    addTouchControl('redJump', {
        start: () => keys['arrowup'] = true,
        end: () => keys['arrowup'] = false
    });
    
    addTouchControl('redAttack', {
        start: () => keys['arrowdown'] = true,
        end: () => keys['arrowdown'] = false
    });
}

// Zpracování vstupu
function handleInput() {
    // Modrý hráč
    if (keys['a']) bluePlayer.move(-1);
    if (keys['d']) bluePlayer.move(1);
    if (keys['w']) bluePlayer.jump();
    if (keys['s']) bluePlayer.attack(redPlayer);
    
    // Červený hráč
    if (keys['arrowleft']) redPlayer.move(-1);
    if (keys['arrowright']) redPlayer.move(1);
    if (keys['arrowup']) redPlayer.jump();
    if (keys['arrowdown']) redPlayer.attack(bluePlayer);
}