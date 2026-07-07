/**
 * Liberty Sparks • Horizon & Environment Renderer (Optimized with Offscreen Caching)
 * Uses offscreen canvas caching to pre-render static horizon silhouettes (skyline, monument, water background)
 * eliminating heavy path recalculations and shadow shaders from the 60 FPS animation loop.
 */

export class HorizonRenderer {
    constructor() {
        this.buildingWidths = [35, 45, 25, 60, 40, 55, 30, 50, 65, 35, 45, 40, 55, 30, 70, 40];
        this.buildingHeights = [40, 70, 35, 110, 60, 95, 50, 130, 85, 45, 100, 65, 120, 55, 90, 60];

        // Offscreen cache properties
        this.cachedCanvas = null;
        this.cachedCtx = null;
        this.cachedType = null;
        this.cachedWidth = 0;
        this.cachedHeight = 0;
    }

    /**
     * Render the active horizon silhouette using high-speed bitmap blitting
     * @param {CanvasRenderingContext2D} ctx 
     * @param {string} type - 'skyline', 'water', 'monument', or 'none'
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {Array} waterRipples - Collection of active ripple animations
     */
    draw(ctx, type, width, height, waterRipples = []) {
        if (type === 'none') return;

        // Check if static silhouette needs to be pre-rendered or updated
        if (this.cachedType !== type || this.cachedWidth !== width || this.cachedHeight !== height || !this.cachedCanvas) {
            this.updateCache(type, width, height);
        }

        // Fast hardware-accelerated bitmap draw of the static horizon
        if (this.cachedCanvas) {
            ctx.drawImage(this.cachedCanvas, 0, 0);
        }

        // Only draw dynamic elements (water ripples) in real-time loop
        if (type === 'water' && waterRipples.length > 0) {
            this.drawWaterRipples(ctx, width, height, waterRipples);
        }
    }

    updateCache(type, w, h) {
        if (!this.cachedCanvas) {
            this.cachedCanvas = document.createElement('canvas');
            this.cachedCtx = this.cachedCanvas.getContext('2d');
        }
        this.cachedCanvas.width = w;
        this.cachedCanvas.height = h;
        this.cachedType = type;
        this.cachedWidth = w;
        this.cachedHeight = h;

        const ctx = this.cachedCtx;
        ctx.clearRect(0, 0, w, h);
        ctx.save();
        ctx.fillStyle = '#03050B'; // Deep navy/black silhouette color

        if (type === 'skyline') {
            this.drawSkyline(ctx, w, h);
        } else if (type === 'water') {
            this.drawWaterBackground(ctx, w, h);
        } else if (type === 'monument') {
            this.drawMonument(ctx, w, h);
        }

        ctx.restore();
    }

    drawSkyline(ctx, w, h) {
        // Base shoreline / waterfront embankment
        ctx.fillStyle = '#03050B';
        ctx.fillRect(0, h - 25, w, 25);

        // Towering Metropolitan Skyline (NYC / Chicago inspired)
        const buildings = [
            { x: 0.02, w: 0.05, h: 140, type: 'block' },
            { x: 0.08, w: 0.06, h: 220, type: 'spire' },      // Chrysler-like spire
            { x: 0.15, w: 0.07, h: 180, type: 'grid' },
            { x: 0.23, w: 0.08, h: 310, type: 'step' },       // Empire State step-back style
            { x: 0.32, w: 0.06, h: 190, type: 'block' },
            { x: 0.39, w: 0.07, h: 260, type: 'spire' },      // Freedom Tower style
            { x: 0.47, w: 0.05, h: 160, type: 'grid' },
            { x: 0.53, w: 0.08, h: 230, type: 'step' },
            { x: 0.62, w: 0.06, h: 150, type: 'block' }
        ];

        buildings.forEach(b => {
            const bx = b.x * w;
            const bw = b.w * w;
            const bh = b.h;
            
            ctx.fillStyle = '#050914';
            
            if (b.type === 'step') {
                // Stepped skyscraper (3 tiers + needle antenna)
                ctx.fillRect(bx, h - bh * 0.6, bw, bh * 0.6);
                ctx.fillRect(bx + bw * 0.15, h - bh * 0.85, bw * 0.7, bh * 0.25);
                ctx.fillRect(bx + bw * 0.3, h - bh, bw * 0.4, bh * 0.15);
                // Antenna spire
                ctx.fillRect(bx + bw * 0.48, h - bh - 35, bw * 0.04, 35);
                // Red warning beacon at peak
                ctx.fillStyle = 'rgba(255, 30, 30, 0.8)';
                ctx.beginPath();
                ctx.arc(bx + bw * 0.5, h - bh - 35, 3, 0, Math.PI * 2);
                ctx.fill();
            } else if (b.type === 'spire') {
                // Art-deco tapered tower
                ctx.beginPath();
                ctx.moveTo(bx, h);
                ctx.lineTo(bx, h - bh * 0.75);
                ctx.lineTo(bx + bw * 0.5, h - bh - 20);
                ctx.lineTo(bx + bw, h - bh * 0.75);
                ctx.lineTo(bx + bw, h);
                ctx.fill();
            } else {
                // Standard modern tower block
                ctx.fillRect(bx, h - bh, bw, bh);
            }

            // Illuminated Windows Array
            const cols = Math.max(2, Math.floor(bw / 12));
            const rows = Math.floor((bh * 0.8) / 16);
            const winW = 4;
            const winH = 7;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    // 70% chance a window is illuminated
                    if ((r * 13 + c * 7 + Math.floor(bx)) % 10 < 7) {
                        const wx = bx + 6 + c * ((bw - 12) / Math.max(1, cols - 1));
                        const wy = h - 20 - r * 16;
                        
                        // Varying window light tints (warm gold, cool cyan, crisp white)
                        const tint = (r + c) % 3;
                        if (tint === 0) ctx.fillStyle = 'rgba(255, 215, 100, 0.75)';
                        else if (tint === 1) ctx.fillStyle = 'rgba(180, 230, 255, 0.85)';
                        else ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';

                        ctx.fillRect(wx - winW * 0.5, wy, winW, winH);
                    }
                }
            }
        });

        // Majestic Suspension Bridge spanning the right side (Brooklyn / Golden Gate inspired)
        const bridgeLeft = w * 0.68;
        const bridgeRight = w;
        const deckY = h - 55;
        const tower1X = bridgeLeft + (bridgeRight - bridgeLeft) * 0.3;
        const tower2X = bridgeLeft + (bridgeRight - bridgeLeft) * 0.8;
        const towerH = 170;

        // Bridge towers (Gothic arches)
        ctx.fillStyle = '#060A17';
        ctx.fillRect(tower1X - 12, h - towerH, 24, towerH);
        ctx.fillRect(tower2X - 12, h - towerH, 24, towerH);
        
        // Bridge road deck
        ctx.fillRect(bridgeLeft, deckY, bridgeRight - bridgeLeft, 8);

        // Main parabolic suspension cables
        ctx.strokeStyle = 'rgba(200, 220, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bridgeLeft, deckY - 20);
        ctx.quadraticCurveTo((bridgeLeft + tower1X) * 0.5, deckY, tower1X, h - towerH + 5);
        ctx.quadraticCurveTo((tower1X + tower2X) * 0.5, deckY + 10, tower2X, h - towerH + 5);
        ctx.quadraticCurveTo((tower2X + bridgeRight) * 0.5, deckY, bridgeRight, deckY - 20);
        ctx.stroke();

        // Glowing golden deck streetlights along the bridge
        ctx.fillStyle = 'rgba(255, 200, 50, 0.9)';
        for (let lx = bridgeLeft + 10; lx < bridgeRight; lx += 25) {
            ctx.beginPath();
            ctx.arc(lx, deckY - 3, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawWaterBackground(ctx, w, h) {
        const waterHeight = 70;
        const gradient = ctx.createLinearGradient(0, h - waterHeight, 0, h);
        gradient.addColorStop(0, 'rgba(11, 19, 43, 0.95)');
        gradient.addColorStop(1, 'rgba(5, 8, 20, 0.98)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, h - waterHeight, w, waterHeight);

        // Top waterline neon glow
        ctx.strokeStyle = 'rgba(56, 182, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, h - waterHeight);
        ctx.lineTo(w, h - waterHeight);
        ctx.stroke();
    }

    drawWaterRipples(ctx, w, h, waterRipples) {
        const waterHeight = 70;
        for (let i = waterRipples.length - 1; i >= 0; i--) {
            const r = waterRipples[i];
            r.radius += 1.2;
            r.alpha -= 0.008;
            if (r.alpha <= 0 || r.radius > r.maxRadius) {
                waterRipples.splice(i, 1);
                continue;
            }
            ctx.save();
            ctx.beginPath();
            // Flattened ellipse for realistic perspective ripple on water surface
            ctx.ellipse(r.x, h - waterHeight * 0.5, r.radius, r.radius * 0.25, 0, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${r.color.r}, ${r.color.g}, ${r.color.b}, ${r.alpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();
        }
    }

    drawMonument(ctx, w, h) {
        // Pristine national park shoreline and reflecting pool bank
        ctx.fillStyle = '#03050B';
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(0, h - 30);
        for (let i = 0; i <= w; i += 50) {
            ctx.quadraticCurveTo(i + 25, h - 42 - Math.sin(i * 0.05) * 8, i + 50, h - 30);
        }
        ctx.lineTo(w, h);
        ctx.fill();

        // 1. STATUE OF LIBERTY (Prominent on Left: w * 0.18, majestic 280px tall)
        const lx = w * 0.18;
        const baseTop = h - 85;
        
        // Fort Wood / Pedestal Base (Neoclassical tiered masonry)
        ctx.fillStyle = '#060A16';
        ctx.beginPath();
        ctx.moveTo(lx - 45, h);
        ctx.lineTo(lx - 35, h - 45);
        ctx.lineTo(lx - 28, baseTop);
        ctx.lineTo(lx + 28, baseTop);
        ctx.lineTo(lx + 35, h - 45);
        ctx.lineTo(lx + 45, h);
        ctx.fill();

        // Patriotic upward floodlights lighting the pedestal
        const pedGlow = ctx.createLinearGradient(0, baseTop, 0, h);
        pedGlow.addColorStop(0, 'rgba(56, 182, 255, 0.25)');
        pedGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = pedGlow;
        ctx.fillRect(lx - 40, baseTop, 80, 85);

        // Robed Figure of Liberty
        ctx.fillStyle = '#050814';
        ctx.beginPath();
        ctx.moveTo(lx - 22, baseTop);
        ctx.lineTo(lx - 16, h - 170); // Waist/Shoulder
        ctx.lineTo(lx - 28, h - 210); // Torch arm extended high and proud
        ctx.lineTo(lx - 24, h - 225); // Hand holding torch
        ctx.lineTo(lx - 18, h - 210);
        ctx.lineTo(lx - 10, h - 195); // Neck
        ctx.lineTo(lx - 8, h - 215);  // Head/Crown base
        ctx.lineTo(lx + 8, h - 215);
        ctx.lineTo(lx + 14, h - 180); // Right shoulder/tablet
        ctx.lineTo(lx + 22, baseTop);
        ctx.closePath();
        ctx.fill();

        // The 7-Ray Crown Spikes
        ctx.strokeStyle = '#050814';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let angle = -Math.PI * 0.8; angle <= -Math.PI * 0.2; angle += Math.PI * 0.1) {
            ctx.moveTo(lx, h - 215);
            ctx.lineTo(lx + Math.cos(angle) * 16, h - 215 + Math.sin(angle) * 16);
        }
        ctx.stroke();

        // Radiant Golden Torch Flame (Additive glowing halo without shadowBlur)
        const torchX = lx - 26;
        const torchY = h - 232;
        
        ctx.fillStyle = 'rgba(255, 60, 0, 0.35)';
        ctx.beginPath();
        ctx.arc(torchX, torchY, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
        ctx.beginPath();
        ctx.arc(torchX, torchY, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(torchX, torchY, 3, 0, Math.PI * 2);
        ctx.fill();


        // 2. WASHINGTON MONUMENT OBELISK (Soaring center centerpiece: w * 0.52, 320px tall)
        const wx = w * 0.52;
        const monH = 320;
        const monW = 22;
        
        // Obelisk shaft
        ctx.fillStyle = '#050914';
        ctx.beginPath();
        ctx.moveTo(wx - monW * 0.5, h);
        ctx.lineTo(wx - monW * 0.3, h - monH + 25);
        ctx.lineTo(wx, h - monH); // Pinnacle capstone
        ctx.lineTo(wx + monW * 0.3, h - monH + 25);
        ctx.lineTo(wx + monW * 0.5, h);
        ctx.closePath();
        ctx.fill();

        // White monument floodlighting
        const monGlow = ctx.createLinearGradient(0, h - monH, 0, h);
        monGlow.addColorStop(0, 'rgba(255, 255, 240, 0.18)');
        monGlow.addColorStop(0.8, 'rgba(255, 255, 240, 0.05)');
        monGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = monGlow;
        ctx.beginPath();
        ctx.moveTo(wx - monW * 0.3, h - monH + 25);
        ctx.lineTo(wx, h - monH);
        ctx.lineTo(wx + monW * 0.3, h - monH + 25);
        ctx.lineTo(wx + monW * 0.5, h);
        ctx.lineTo(wx - monW * 0.5, h);
        ctx.fill();

        // Twin pulsing red aircraft warning beacons at the obelisk pinnacle
        ctx.fillStyle = 'rgba(255, 20, 20, 0.9)';
        ctx.beginPath();
        ctx.arc(wx - 2, h - monH + 8, 2, 0, Math.PI * 2);
        ctx.arc(wx + 2, h - monH + 8, 2, 0, Math.PI * 2);
        ctx.fill();


        // 3. U.S. CAPITOL DOME / LINCOLN MEMORIAL (Right: w * 0.82)
        const cx = w * 0.82;
        const capW = 140;
        const capTop = h - 65;
        
        // Neoclassical colonnade base
        ctx.fillStyle = '#060A16';
        ctx.fillRect(cx - capW * 0.5, capTop, capW, 65);
        
        // Glowing white marble columns
        ctx.fillStyle = 'rgba(255, 255, 240, 0.25)';
        for (let col = cx - capW * 0.42; col <= cx + capW * 0.42; col += 14) {
            ctx.fillRect(col - 2, capTop + 8, 4, 48);
        }

        // Tiered Capitol Dome
        ctx.fillStyle = '#050914';
        ctx.beginPath();
        ctx.arc(cx, capTop, 35, Math.PI, 0); // Lower dome
        ctx.fill();

        ctx.fillRect(cx - 18, capTop - 55, 36, 20); // Drum tower
        
        ctx.beginPath();
        ctx.arc(cx, capTop - 55, 18, Math.PI, 0); // Upper cupola dome
        ctx.fill();

        // Statue of Freedom apex spire
        ctx.fillRect(cx - 2, capTop - 80, 4, 10);
        ctx.beginPath();
        ctx.arc(cx, capTop - 83, 3.5, 0, Math.PI * 2);
        ctx.fill();
    }
}
