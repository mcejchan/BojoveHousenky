# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This is a client-side HTML5 game with no build system. The game can be run by opening `index.html` directly in a web browser or serving it through a local HTTP server.

To run the game:
```bash
# Option 1: Open directly in browser
open index.html

# Option 2: Serve with Python (recommended for development)
python3 -m http.server 8000
# Then navigate to http://localhost:8000

# Option 3: Serve with Node.js (if available)
npx http-server .
```

## Architecture Overview

This is a 2D stick figure fighting game called "Stick Duel Legends" (Bojové Housenky) built with vanilla JavaScript and HTML5 Canvas. The game features physics-based ragdoll characters that battle using lightning staffs.

### Core Game Systems

**Physics Engine**: Custom ragdoll physics system using verlet integration
- `RagdollPart.js`: Individual body parts with physics properties (position, velocity, mass)
- `Joint.js`: Constraint system connecting body parts with distance constraints
- Each character consists of 6 parts (head, torso, left/right hand/foot) connected by 5 joints

**Character System**: `Stickman.js` - Main character class managing:
- Ragdoll physics integration
- Health (100 HP) and lives (3) management  
- Attack system with lightning staff (100 unit range, 15 damage, knockback)
- Movement (3 unit speed) and jumping (-12 velocity impulse)
- Respawn and game state management

**Game State Management**: `game.js` - Central game loop handling:
- Round-based combat system with respawn delays
- Player input processing and UI updates
- Particle effects and lightning visual effects
- Meteorite hazard spawning (every 30-40 seconds, instant kill on contact)

**Input Handling**: `input.js` - Multi-platform controls:
- Keyboard: Blue player (WASD), Red player (Arrow keys)
- Mobile touch controls with virtual buttons
- Unified input state management through keys object

**Visual Effects**: `effects.js` and `Particle.js`:
- Lightning bolt rendering with randomized segments
- Particle systems for combat effects and explosions
- Background rendering with fallback system (loads background.jpg or renders procedural sky/lava)
- Meteorite explosion effects

### Game Mechanics

- **Combat**: Turn-based lightning staff attacks with cooldowns and range validation
- **Physics**: Realistic ragdoll physics with gravity, friction, and collision detection
- **Hazards**: Falling meteorites that cause instant death
- **Victory Conditions**: First to eliminate opponent's 3 lives wins
- **Round System**: Automatic respawn after death with brief pause between rounds

### File Structure

```
├── index.html          # Main game page with UI and styling
├── background.jpg      # Game background image
└── js/
    ├── game.js         # Main game loop and state management
    ├── Stickman.js     # Player character implementation
    ├── RagdollPart.js  # Physics body parts
    ├── Joint.js        # Physics constraints
    ├── Particle.js     # Visual effect particles
    ├── Meteorite.js    # Environmental hazards
    ├── effects.js      # Visual effects and background rendering
    └── input.js        # Input handling system
```

### Technical Notes

- No external dependencies - pure vanilla JavaScript
- Canvas size: 1000x600 pixels
- Physics runs at 60 FPS via requestAnimationFrame
- Mobile-responsive with touch controls
- Uses ES6 classes and modern JavaScript features
- Czech language UI text