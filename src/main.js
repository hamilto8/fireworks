/**
 * Liberty Sparks • Application Bootstrapper
 * Coordinates initialization of the SoundSystem, FireworksEngine, and UIManager
 * with clean dependency injection on DOMContentLoaded.
 */

import { SoundSystem } from './audio/SoundSystem.js';
import { FireworksEngine } from './engine/FireworksEngine.js';
import { UIManager } from './ui/UIManager.js';

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('fireworksCanvas');
    if (!canvas) {
        console.error("Critical: Canvas element #fireworksCanvas not found in DOM.");
        return;
    }

    // 1. Instantiate Audio Engine
    const soundSystem = new SoundSystem();

    // 2. Instantiate Particle Rendering Engine
    const engine = new FireworksEngine(canvas, soundSystem);

    // 3. Instantiate UI Controller and bind DOM interactions
    const uiManager = new UIManager(engine, soundSystem);

    // Set initial active theme state
    uiManager.setTheme('patriot');

    // Expose app instance globally for debug or optional console interaction
    window.LibertySparks = {
        engine,
        soundSystem,
        uiManager
    };
});
