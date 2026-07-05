/**
 * Liberty Sparks • Background Star Model
 * Manages celestial point particles with automated twinkle cycles and opacity oscillation.
 */

export class Star {
    constructor(canvasWidth, canvasHeight) {
        this.reset(canvasWidth, canvasHeight);
        this.y = Math.random() * (canvasHeight * 0.75); // Concentrate stars in upper 3/4 sky
    }

    reset(width, height) {
        this.x = Math.random() * width;
        this.y = Math.random() * (height * 0.75);
        this.size = Math.random() * 1.8 + 0.4;
        this.baseAlpha = Math.random() * 0.7 + 0.2;
        this.alpha = this.baseAlpha;
        this.twinkleSpeed = Math.random() * 0.03 + 0.01;
        this.twinkleDir = Math.random() > 0.5 ? 1 : -1;
        this.color = Math.random() > 0.8 ? '#FFD700' : (Math.random() > 0.5 ? '#90E0EF' : '#FFFFFF');
    }

    update() {
        this.alpha += this.twinkleSpeed * this.twinkleDir;
        if (this.alpha >= 1.0) {
            this.alpha = 1.0;
            this.twinkleDir = -1;
        } else if (this.alpha <= 0.15) {
            this.alpha = 0.15;
            this.twinkleDir = 1;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}
