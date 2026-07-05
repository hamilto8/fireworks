/**
 * Liberty Sparks • Web Audio API Procedural Sound Synthesis
 * Synthesizes realistic rising whooshes, sub-bass explosion booms, crisp atmospheric cracks,
 * and lingering crackles in real-time without external audio assets.
 */

export class SoundSystem {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContextClass();
            this.initialized = true;
        } catch (e) {
            console.warn("Web Audio API not supported on this device or browser.");
            this.enabled = false;
        }
    }

    /**
     * Resume audio context if suspended by browser autoplay policies
     */
    ensureResumed() {
        if (!this.initialized) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * Synthesize rising launch / whoosh air sound
     */
    playLaunch() {
        if (!this.enabled || !this.ctx) return;
        this.ensureResumed();

        const now = this.ctx.currentTime;
        const duration = 0.75;

        // Create noise buffer for whoosh air sound
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // Bandpass filter that sweeps upwards in frequency
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(1100, now + duration);
        filter.Q.value = 3;

        // Gain envelope control
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.18, now + duration * 0.7);
        gain.gain.linearRampToValueAtTime(0.0, now + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + duration);
    }

    /**
     * Synthesize detonation boom + sharp crack
     * @param {number} sizeFactor - Scale multiplier (50-180)
     */
    playExplosion(sizeFactor = 100) {
        if (!this.enabled || !this.ctx) return;
        this.ensureResumed();

        const now = this.ctx.currentTime;

        // --- Part A: Sub-bass boom (Sine/Triangle wave sweep) ---
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        
        osc.type = 'sine';
        const startFreq = 110 + Math.random() * 30;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(28, now + 0.45);

        const boomVolume = Math.min(0.5, 0.35 * (sizeFactor / 100));
        oscGain.gain.setValueAtTime(boomVolume, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);

        // --- Part B: Explosive Crack (Filtered Pink/White Noise) ---
        const duration = 0.6;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // Lowpass filter simulating atmospheric acoustic resonance
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3500, now);
        filter.frequency.exponentialRampToValueAtTime(400, now + duration);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.4 * (sizeFactor / 100), now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + duration);

        // --- Part C: Secondary Crackles / Echoes ---
        if (Math.random() > 0.3) {
            setTimeout(() => this.playCrackle(), Math.random() * 150 + 100);
        }
    }

    /**
     * Synthesize crisp micro-crackles for lingering sparkle trails
     */
    playCrackle() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const duration = 0.08;

        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.02));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1800;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + duration);
    }
}
