/**
 * Liberty Sparks • Web Audio API Procedural Sound Synthesis
 * Synthesizes realistic mortar ground thumps, rising screamer whistles, sub-bass explosion booms,
 * atmospheric detonation cracks, and lingering ember crackles in real-time.
 */

export class SoundSystem {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.initialized = false;
    }

    init() {
        if (this.initialized && this.ctx) return;
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
     * Resume audio context if suspended by browser autoplay policies.
     * Guaranteed to be called on any user interaction so sound works immediately by default.
     */
    ensureResumed() {
        if (!this.initialized || !this.ctx) {
            this.init();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(err => {
                console.debug("AudioContext resume blocked until user interaction:", err);
            });
        }
    }

    /**
     * Synthesize firework launch (Mortar ground thump + rising screamer whistle)
     */
    playLaunch() {
        if (!this.enabled) return;
        this.ensureResumed();
        if (!this.ctx) return;

        // 1. Play Mortar Thump / Launch Pop
        this.playMortarThump();

        // 2. Play Rising Whistle / Screamer (80% probability for realistic dynamic variety)
        if (Math.random() < 0.8) {
            this.playWhistle();
        }
    }

    /**
     * Ground mortar tube launch pop and air displacement thump
     */
    playMortarThump() {
        const now = this.ctx.currentTime;
        const duration = 0.22;

        // Deep acoustic mortar thump (sine sweep)
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150 + Math.random() * 20, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + duration);

        oscGain.gain.setValueAtTime(0.25, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + duration);

        // Ejection air puff (lowpass filtered noise)
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.linearRampToValueAtTime(150, now + duration);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.12, now);
        noiseGain.gain.linearRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + duration);
    }

    /**
     * Synthesize rising frequency screamer whistle as rocket shoots into the sky
     */
    playWhistle() {
        const now = this.ctx.currentTime;
        const duration = 0.75 + Math.random() * 0.15; // Matches rocket ascent time to apex

        // Main whistling screamer oscillator (triangle wave gives pyrotechnic harmonic richness)
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();

        osc.type = 'triangle';
        const startFreq = 420 + Math.random() * 80;
        const endFreq = 1800 + Math.random() * 400;

        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

        // Add subtle vibrato / air flutter to whistle (15Hz LFO modulation)
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 16 + Math.random() * 4;
        lfoGain.gain.value = 25; // Modulation depth in Hz
        lfo.connect(osc.frequency);
        lfo.start(now);
        lfo.stop(now + duration);

        // Smooth envelope: fades in quickly, holds during ascent, tapers off right before detonation
        oscGain.gain.setValueAtTime(0.001, now);
        oscGain.gain.linearRampToValueAtTime(0.08, now + duration * 0.2);
        oscGain.gain.setValueAtTime(0.08, now + duration * 0.75);
        oscGain.gain.linearRampToValueAtTime(0.001, now + duration);

        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + duration);

        // Secondary wind hiss layer accompanying the whistle
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(startFreq, now);
        filter.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
        filter.Q.value = 5;

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.001, now);
        noiseGain.gain.linearRampToValueAtTime(0.03, now + duration * 0.5);
        noiseGain.gain.linearRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + duration);
    }

    /**
     * Synthesize detonation boom + sharp atmospheric crack
     * @param {number} sizeFactor - Scale multiplier (50-180)
     */
    playExplosion(sizeFactor = 100) {
        if (!this.enabled) return;
        this.ensureResumed();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const isLargeShell = sizeFactor >= 120;

        // --- Part A: Sub-bass shockwave boom (Sine wave sweep) ---
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        
        osc.type = 'sine';
        const startFreq = isLargeShell ? 90 + Math.random() * 20 : 120 + Math.random() * 30;
        const endFreq = isLargeShell ? 20 : 30;
        const boomDuration = isLargeShell ? 0.65 : 0.45;

        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + boomDuration);

        const boomVolume = Math.min(0.55, 0.38 * (sizeFactor / 100));
        oscGain.gain.setValueAtTime(boomVolume, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + boomDuration + 0.1);

        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + boomDuration + 0.15);

        // --- Part B: Explosive Acoustic Crack (Filtered Noise) ---
        const duration = isLargeShell ? 0.7 : 0.55;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.09));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        // Lowpass filter simulating atmospheric acoustic decay
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(4500, now);
        filter.frequency.exponentialRampToValueAtTime(350, now + duration);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.42 * (sizeFactor / 100), now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + duration);

        // --- Part C: Lingering Crackle & Sizzle Echoes ---
        // 50% chance to spawn a cascade of sizzling ember crackles after burst
        if (Math.random() < 0.5) {
            const crackleCount = Math.floor(Math.random() * 3) + 2;
            for (let c = 0; c < crackleCount; c++) {
                setTimeout(() => this.playCrackle(), Math.random() * 280 + 120);
            }
        }
    }

    /**
     * Synthesize crisp micro-crackles for falling sparks and lingering ember trails
     */
    playCrackle() {
        if (!this.enabled || !this.ctx) return;
        const now = this.ctx.currentTime;
        const duration = 0.07;

        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.015));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2200;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.linearRampToValueAtTime(0.001, now + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + duration);
    }
}
