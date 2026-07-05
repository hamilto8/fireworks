<div align="center">
  <h1>🎆 LIBERTY SPARKS • 2026</h1>
  <p><strong>A Professionally Architected, Interactive 4th of July Fireworks & Particle Physics Engine</strong></p>

  <p>
    <a href="#-features">Features</a> •
    <a href="#-architecture--separation-of-concerns">Architecture</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-controls--shortcuts">Controls</a>
  </p>

  <br />
  
  <!-- HERO IMAGE -->
  <img src="assets/hero.png" alt="Liberty Sparks Hero Screenshot" width="100%" style="border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />

  <br /><br />
</div>

---

## 🌟 Overview

**Liberty Sparks** is a world-class, celebratory HTML5 web application created for the **4th of July**. Engineered from the ground up with native **ES6 Modules** and **Tailwind CSS**, it transforms any web browser into a vibrant, high-performance fireworks celebration following strict software engineering principles and separation of concerns.

Whether you're hosting an Independence Day party, looking for a dynamic screen saver, or exploring interactive particle physics, Liberty Sparks delivers real-time procedural sound synthesis, realistic wind drift physics, and customizable patriotic themes.

---

## ✨ Features

### 🎇 High-Performance Particle & Physics Engine (60 FPS)
- **Rocket Phase:** Shells shoot upward from the horizon with aerodynamic wobble and glowing spark trails, accelerating toward target coordinates.
- **Explosion Phase:** Detonations spawn radiating particle clouds that obey natural physics—including air resistance (friction), downward gravity, wind drift, and sparkle flicker.
- **Additive Blending & Trails:** Utilizes HTML5 Canvas `globalCompositeOperation = 'lighter'` with particle position histories to create intense luminous cores and tapered strobe trails.
- **Diverse Burst Styles:** Randomly generates Classic Sphere bursts, Saturn/Ring bursts, cascading Willow gold trails, and multi-color Double Bursts.

### 🔊 Procedural Web Audio API Sound Synthesis
- **Zero External Assets:** All audio is synthesized procedurally in real-time using the browser's Web Audio API.
- **Realistic Acoustics:** Features rising bandpass whooshes, deep sub-bass oscillator booms (`110Hz → 28Hz`), atmospheric crack bursts, and lingering high-frequency micro-pops.

### 🎨 Patriotic Glassmorphism UI & Custom Themes
- **Modern Design:** Sleek semi-transparent glassmorphic panels (`backdrop-blur-md`), glowing neon accents, and responsive controls.
- **5 Color Themes:**
  - **🇺🇸 Patriot (Default):** Crimson Red, Bright White, Electric Blue, and Gold.
  - **🌈 Rainbow:** Vibrant full-spectrum neon colors.
  - **✨ Gold & Silver:** Warm champagne, pure gold, and silver sparkles.
  - **⚡ Neon:** Cyberpunk magenta, electric lime, and cyan.
  - **❄️ Cool Blue:** Ice blue, sapphire, and royal white.

### 🏞️ Interactive Environments & Details
- **Dynamic Horizons:** Select between a **City Skyline** (with illuminated window lights), a **Calm Lake Reflection** (where exploding fireworks cast expanding water ripples), a **Statue of Liberty Silhouette**, or a **Pure Night Sky**.
- **Twinkling Starfield:** Over 140 individually seeded background stars with randomized sizes and pulsing twinkle cycles.
- **💡 4th of July Trivia:** Explore rotating historical and scientific facts about Independence Day and fireworks.
- **📸 Capture the Moment:** Instant camera shutter flash animation that generates and downloads a high-resolution PNG screenshot of your custom display.
- **🎆 Grand Finale Spectacular:** Triggers a synchronized 25-shell barrage with a glowing top banner announcement!

---

## 🏗️ Architecture & Separation of Concerns

Liberty Sparks is built as a professionally architected frontend application using standard ES modules (`type="module"`), ensuring clean separation of concerns, effortless testability, and modular maintainability:

```text
fireworks/
├── index.html                  # Pure semantic HTML structure & UI containers
├── assets/
│   └── hero.png                # Hero screenshot for documentation
└── src/
    ├── main.js                 # Application Bootstrapper & Dependency Injection
    ├── config/
    │   └── constants.js        # Static datasets, theme palettes, and physical boundaries
    ├── styles/
    │   └── main.css            # Custom CSS variables, animations, and glassmorphism utilities
    ├── audio/
    │   └── SoundSystem.js      # Web Audio API procedural sound synthesizer class
    ├── models/
    │   ├── Star.js             # Celestial background particle model
    │   ├── Particle.js         # Explosion spark entity with friction, gravity & decay
    │   └── Rocket.js           # Launch shell entity with aerodynamic wobble & trajectory
    ├── engine/
    │   ├── HorizonRenderer.js    # Dedicated silhouette & water ripple renderer
    │   └── FireworksEngine.js    # Core requestAnimationFrame loop & composite blending
    └── ui/
        └── UIManager.js        # DOM event listener bindings & presentation state controller
```

### Key Architectural Highlights
1. **Decoupled Domain Models:** Particle physics (`Particle.js`, `Rocket.js`) are completely decoupled from DOM rendering and audio synthesis.
2. **Clean Dependency Injection:** `main.js` instantiates the `SoundSystem` and `FireworksEngine` and injects them into the `UIManager`, eliminating global state mutations.
3. **No Build Step Required:** Uses standard browser-native ES module import/export syntax. No bundlers (Webpack, Vite) or external JS libraries required!

---

## 🚀 Quick Start

Getting started with Liberty Sparks is effortless:

### Option 1: Direct File Open
Clone or download this repository and open `index.html` directly in any modern web browser:
```bash
git clone https://github.com/hamilto8/fireworks.git
cd fireworks
open index.html # on macOS (or double-click the file)
```

### Option 2: Local Development Server
If you prefer running a local HTTP development server:
```bash
# Using Python
python3 -m http.server 8000

# Or using Node / npx
npx serve .
```
Then visit `http://localhost:8000` in your browser.

---

## 🎮 Controls & Shortcuts

| Key / Input | Action |
| :--- | :--- |
| **Click / Tap** | Launch a firework to the exact cursor location |
| <kbd>Space</kbd> | Launch a randomized spark |
| <kbd>F</kbd> | Trigger the **Grand Finale** show |
| <kbd>A</kbd> | Toggle **Auto Show** continuous party mode |
| <kbd>M</kbd> | Mute / Unmute procedural sound |
| <kbd>C</kbd> | Capture screenshot & download PNG |
| <kbd>H</kbd> | Hide / Show UI control panels |

---

<div align="center">
  <p>Made with 💥 for July 4th, 2026 • Celebrate Safely!</p>
</div>
