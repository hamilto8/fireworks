/**
 * Liberty Sparks • Core Fireworks & Particle Physics Engine
 * Orchestrates the main requestAnimationFrame loop, particle arrays, composite blending,
 * automated party show generators, and grand finale sequences.
 */

import { Star } from '../models/Star.js';
import { Particle } from '../models/Particle.js';
import { Rocket } from '../models/Rocket.js';
import { HorizonRenderer } from './HorizonRenderer.js';
import { COLOR_THEMES, DEFAULT_CONFIG } from '../config/constants.js';

export class FireworksEngine {
    constructor(canvas, soundSystem) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.sound = soundSystem;
        this.horizonRenderer = new HorizonRenderer();

        // Collections & State
        this.rockets = [];
        this.particles = [];
        this.stars = [];
        this.waterRipples = [];
        
        this.currentThemeName = 'patriot';
        this.currentTheme = COLOR_THEMES.patriot;
        this.config = { ...DEFAULT_CONFIG };
        
        this.autoTimer = 0;
        this.finaleActive = false;
        this.animationFrameId = null;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Initialize celestial starfield
        for (let i = 0; i < 140; i++) {
            this.stars.push(new Star(this.canvas.width, this.canvas.height));
        }

        // Start render loop
        this.start();
        console.log("🎇 Liberty Sparks Core Engine Initialized (60 FPS Target)");
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.stars.forEach(star => {
            if (star.x > this.canvas.width) star.x = Math.random() * this.canvas.width;
        });
    }

    start() {
        if (!this.animationFrameId) {
            this.animate();
        }
    }

    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    setTheme(themeName) {
        this.currentThemeName = themeName;
        this.currentTheme = COLOR_THEMES[themeName] || COLOR_THEMES.patriot;
        this.launchRandom();
    }

    updateConfig(key, value) {
        this.config[key] = value;
    }

    /**
     * Launch a firework shell toward target coordinates
     */
    launchRocket(startX, startY, targetX, targetY, overrideTheme = null) {
        const theme = overrideTheme || this.currentTheme;
        
        if (this.config.soundEnabled) {
            this.sound.playLaunch();
        }

        const rocket = new Rocket(
            startX, startY, targetX, targetY, theme,
            this.config.size, this.config.particles,
            (ex, ey, thm, sz, cnt) => this.createExplosion(ex, ey, thm, sz, cnt)
        );

        this.rockets.push(rocket);
    }

    launchRandom() {
        const targetX = Math.random() * (this.canvas.width * 0.8) + (this.canvas.width * 0.1);
        const targetY = Math.random() * (this.canvas.height * 0.45) + (this.canvas.height * 0.1);
        const startX = targetX + (Math.random() - 0.5) * 250;
        const startY = this.canvas.height;

        this.launchRocket(startX, startY, targetX, targetY);
    }

    createExplosion(x, y, theme, sizeFactor, particleCount) {
        if (this.config.soundEnabled) {
            this.sound.playExplosion(sizeFactor);
        }

        if (this.config.horizon === 'water') {
            this.waterRipples.push({
                x: x,
                y: this.canvas.height - 40,
                radius: 10,
                maxRadius: Math.random() * 100 + 80,
                alpha: 0.6,
                color: theme[0]
            });
        }

        const styles = ['classic', 'classic', 'ring', 'willow', 'sparkle', 'double'];
        const selectedStyle = styles[Math.floor(Math.random() * styles.length)];

        const count = parseInt(particleCount);
        const baseSpeed = (Math.random() * 3.5 + 4.5) * (sizeFactor / 100);

        if (selectedStyle === 'ring') {
            const color = theme[Math.floor(Math.random() * theme.length)];
            for (let i = 0; i < count; i++) {
                const angle = (i * Math.PI * 2) / count;
                const speed = baseSpeed * (0.95 + Math.random() * 0.1);
                this.particles.push(new Particle(x, y, color, Math.cos(angle) * speed, Math.sin(angle) * speed, 'classic', sizeFactor));
            }
            const innerColor = theme[Math.floor(Math.random() * theme.length)];
            for (let i = 0; i < count * 0.3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = baseSpeed * 0.4 * Math.random();
                this.particles.push(new Particle(x, y, innerColor, Math.cos(angle) * speed, Math.sin(angle) * speed, 'sparkle', sizeFactor));
            }
        } else if (selectedStyle === 'double') {
            const outerColor = theme[0];
            const innerColor = theme.length > 1 ? theme[1] : theme[0];
            
            for (let i = 0; i < count * 0.6; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = baseSpeed * (0.85 + Math.random() * 0.3);
                this.particles.push(new Particle(x, y, outerColor, Math.cos(angle) * speed, Math.sin(angle) * speed, 'classic', sizeFactor));
            }
            for (let i = 0; i < count * 0.4; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = baseSpeed * (0.35 + Math.random() * 0.2);
                this.particles.push(new Particle(x, y, innerColor, Math.cos(angle) * speed, Math.sin(angle) * speed, 'sparkle', sizeFactor));
            }
        } else if (selectedStyle === 'willow') {
            const goldColor = { hex: '#FFD700', r: 255, g: 215, b: 0 };
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = baseSpeed * Math.sqrt(Math.random()) * 1.1;
                this.particles.push(new Particle(x, y, goldColor, Math.cos(angle) * speed, Math.sin(angle) * speed, 'willow', sizeFactor));
            }
        } else {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = baseSpeed * Math.sqrt(Math.random()) * 1.05;
                const color = theme[Math.floor(Math.random() * theme.length)];
                const pStyle = Math.random() > 0.7 ? 'sparkle' : 'classic';
                this.particles.push(new Particle(x, y, color, Math.cos(angle) * speed, Math.sin(angle) * speed, pStyle, sizeFactor));
            }
        }
    }

    triggerGrandFinale(onStart, onEnd) {
        if (this.finaleActive) return;
        this.finaleActive = true;
        if (onStart) onStart();

        let count = 0;
        const totalShots = 25;
        const interval = setInterval(() => {
            count++;
            const x1 = (this.canvas.width * 0.15) + Math.random() * (this.canvas.width * 0.7);
            const y1 = (this.canvas.height * 0.15) + Math.random() * (this.canvas.height * 0.35);
            this.launchRocket(x1 + (Math.random() - 0.5) * 150, this.canvas.height, x1, y1);

            if (count % 3 === 0) {
                const yPair = this.canvas.height * 0.3;
                this.launchRocket(this.canvas.width * 0.2, this.canvas.height, this.canvas.width * 0.25, yPair);
                this.launchRocket(this.canvas.width * 0.8, this.canvas.height, this.canvas.width * 0.75, yPair);
            }

            if (count >= totalShots) {
                clearInterval(interval);
                setTimeout(() => {
                    this.finaleActive = false;
                    if (onEnd) onEnd();
                }, 2500);
            }
        }, 180);
    }

    animate() {
        this.animationFrameId = requestAnimationFrame(() => this.animate());

        // 1. Clear background with semi-transparent dark navy for lingering motion strobe trails
        this.ctx.fillStyle = 'rgba(5, 8, 20, 0.22)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 2. Update and draw background starfield
        this.stars.forEach(star => {
            star.update();
            star.draw(this.ctx);
        });

        // 3. Automated party show logic
        if (this.config.autoShow) {
            this.autoTimer++;
            const threshold = Math.max(15, 110 - (this.config.rate * 10));
            if (this.autoTimer >= threshold) {
                this.autoTimer = 0;
                this.launchRandom();
                if (Math.random() > 0.7) {
                    setTimeout(() => this.launchRandom(), 250);
                }
            }
        }

        // 4. Enable additive blending for glowing fireworks particles
        this.ctx.globalCompositeOperation = 'lighter';

        // Update & Draw Rockets
        for (let i = this.rockets.length - 1; i >= 0; i--) {
            const rocket = this.rockets[i];
            rocket.update(this.config.wind);
            rocket.draw(this.ctx);
            if (rocket.exploded) {
                this.rockets.splice(i, 1);
            }
        }

        // Update & Draw Explosion Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update(this.config.wind);
            p.draw(this.ctx);
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // 5. Restore standard blending for horizon silhouettes and water ripples
        this.ctx.globalCompositeOperation = 'source-over';
        this.horizonRenderer.draw(this.ctx, this.config.horizon, this.canvas.width, this.canvas.height, this.waterRipples);
    }
}
