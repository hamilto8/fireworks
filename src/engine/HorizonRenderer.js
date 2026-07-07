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
        ctx.beginPath();
        ctx.moveTo(0, h);
        let x = 0;
        let idx = 0;
        
        while (x < w) {
            const bw = this.buildingWidths[idx % this.buildingWidths.length] * (w / 1000 + 0.5);
            const bh = this.buildingHeights[idx % this.buildingHeights.length];
            ctx.lineTo(x, h - bh);
            ctx.lineTo(x + bw, h - bh);
            x += bw;
            idx++;
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();

        // Glowing window lights on buildings
        ctx.fillStyle = 'rgba(255, 215, 0, 0.35)';
        for (let i = 50; i < w - 50; i += 80) {
            if (i % 160 === 0) {
                ctx.fillRect(i, h - 70, 4, 6);
                ctx.fillRect(i, h - 50, 4, 6);
            }
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
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(0, h - 35);
        // Tree line rolling hills
        for (let i = 0; i <= w; i += 40) {
            ctx.quadraticCurveTo(i + 20, h - 50 - Math.sin(i) * 10, i + 40, h - 35);
        }
        ctx.lineTo(w, h);
        ctx.fill();

        // Statue of Liberty / Monument silhouette on left center
        const mx = w * 0.25;
        ctx.beginPath();
        ctx.moveTo(mx - 30, h);
        ctx.lineTo(mx - 15, h - 85);
        ctx.lineTo(mx - 22, h - 120); // Torch arm
        ctx.lineTo(mx - 18, h - 130);
        ctx.lineTo(mx - 12, h - 118);
        ctx.lineTo(mx - 5, h - 145);  // Crown/Head
        ctx.lineTo(mx + 5, h - 145);
        ctx.lineTo(mx + 15, h - 85);
        ctx.lineTo(mx + 30, h);
        ctx.closePath();
        ctx.fill();

        // Optimized torch flame (zero shadowBlur, soft additive circle instead)
        ctx.fillStyle = 'rgba(255, 60, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(mx - 20, h - 133, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(mx - 20, h - 133, 3.5, 0, Math.PI * 2);
        ctx.fill();
    }
}
