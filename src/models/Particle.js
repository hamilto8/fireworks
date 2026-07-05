/**
 * Liberty Sparks • Explosion Particle Model
 * Handles individual spark physics including air resistance (friction), downward gravity,
 * wind drift, position history trails, and shimmer strobe effects.
 */

export class Particle {
    constructor(x, y, colorObj, vx, vy, style = 'classic', sizeFactor = 100) {
        this.x = x;
        this.y = y;
        this.color = colorObj;
        this.vx = vx;
        this.vy = vy;
        this.style = style; // 'classic', 'willow', 'sparkle', 'ring'
        
        // Style-dependent physical behavior
        if (style === 'willow') {
            this.friction = 0.965;
            this.gravity = 0.12;
            this.decay = Math.random() * 0.008 + 0.005;
            this.size = (Math.random() * 2.2 + 1.2) * (sizeFactor / 100);
        } else if (style === 'sparkle') {
            this.friction = 0.94;
            this.gravity = 0.08;
            this.decay = Math.random() * 0.015 + 0.01;
            this.size = (Math.random() * 1.8 + 0.8) * (sizeFactor / 100);
        } else { // Classic / Ring
            this.friction = 0.955;
            this.gravity = 0.09;
            this.decay = Math.random() * 0.012 + 0.008;
            this.size = (Math.random() * 2.0 + 1.0) * (sizeFactor / 100);
        }

        this.alpha = 1.0;
        this.brightness = Math.random() * 20 + 80;
        this.history = [];
        this.maxHistory = style === 'willow' ? 8 : 5;
        this.sparkleFreq = Math.random() * 0.3 + 0.1;
        this.age = 0;
    }

    update(wind = 0) {
        this.age++;
        // Record position history for smooth strobe trails
        this.history.unshift({ x: this.x, y: this.y });
        if (this.history.length > this.maxHistory) {
            this.history.pop();
        }

        // Apply wind drift, friction, and gravitational acceleration
        this.vx += wind * 0.005;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;

        this.x += this.vx;
        this.y += this.vy;

        // Alpha decay over time
        this.alpha -= this.decay;
        
        // Sparkle flicker effect towards end of life
        if (this.style === 'sparkle' || this.alpha < 0.4) {
            if (Math.random() < 0.25) {
                this.brightness = Math.random() * 50 + 50;
            }
        }
    }

    draw(ctx) {
        if (this.alpha <= 0) return;

        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        
        // Draw glowing trail from position history
        if (this.history.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            for (let i = 0; i < this.history.length; i++) {
                const pt = this.history[i];
                ctx.lineTo(pt.x, pt.y);
            }
            ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha * 0.5})`;
            ctx.lineWidth = this.size * 0.8;
            ctx.lineCap = 'round';
            ctx.stroke();
        }

        // Draw luminous particle head
        ctx.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
        ctx.shadowColor = this.color.hex;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Extra white core for super-hot spark glow
        if (this.alpha > 0.5) {
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowBlur = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
