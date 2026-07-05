/**
 * Liberty Sparks • Launch Rocket Model
 * Represents the rising Phase 1 firework shell traveling upward with aerodynamic wobble
 * before triggering the apex detonation event.
 */

export class Rocket {
    constructor(startX, startY, targetX, targetY, theme, sizeFactor, particleCount, onExplode) {
        this.x = startX;
        this.y = startY;
        this.startX = startX;
        this.startY = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.theme = theme;
        this.sizeFactor = sizeFactor;
        this.particleCount = particleCount;
        this.onExplode = onExplode;

        // Calculate trajectory angle and Euclidean distance
        const angle = Math.atan2(targetY - startY, targetX - startX);
        const distance = Math.hypot(targetX - startX, targetY - startY);
        
        // Speed scales smoothly with distance
        const speed = Math.max(10, Math.min(16, distance * 0.032));
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.color = theme[Math.floor(Math.random() * theme.length)];
        this.history = [];
        this.maxHistory = 6;
        this.exploded = false;
        this.wobble = Math.random() * 10;
    }

    update(wind = 0) {
        this.history.unshift({ x: this.x, y: this.y });
        if (this.history.length > this.maxHistory) {
            this.history.pop();
        }

        // Apply subtle aerodynamic wobble and wind drift
        this.wobble += 0.4;
        this.x += this.vx + Math.sin(this.wobble) * 0.3 + (wind * 0.02);
        this.y += this.vy;

        // Check if rocket reached apex height or heading downward
        if (this.vy >= -1 || this.y <= this.targetY || Math.hypot(this.targetX - this.x, this.targetY - this.y) < 15) {
            this.explode();
        }
    }

    explode() {
        if (this.exploded) return;
        this.exploded = true;
        this.onExplode(this.x, this.y, this.theme, this.sizeFactor, this.particleCount);
    }

    draw(ctx) {
        if (this.exploded) return;
        ctx.save();

        // Draw rising rocket trail
        if (this.history.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            for (let i = 0; i < this.history.length; i++) {
                ctx.lineTo(this.history[i].x, this.history[i].y);
            }
            ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.6)`;
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.shadowColor = this.color.hex;
            ctx.shadowBlur = 10;
            ctx.stroke();
        }

        // Rocket glowing white head
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
