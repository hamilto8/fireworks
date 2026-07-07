/**
 * Liberty Sparks • UI & Event Controller
 * Manages DOM interaction, slider bindings, theme selection, keyboard shortcuts,
 * trivia modal navigation, and screenshot canvas captures.
 */

import { TRIVIA_FACTS, COLOR_THEMES, WIND_SPEEDS } from '../config/constants.js';

export class UIManager {
    constructor(engine, soundSystem) {
        this.engine = engine;
        this.sound = soundSystem;
        this.currentTriviaIndex = 0;

        this.initEventListeners();
        this.updateTriviaDisplay();
        this.randomizeWind();
    }

    initEventListeners() {
        // Canvas interaction
        this.engine.canvas.addEventListener('pointerdown', (e) => this.handleCanvasClick(e));

        // Keyboard navigation
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Button Click Bindings
        this.bindClick('btnLaunchRandom', () => this.engine.launchRandom());
        this.bindClick('btnGrandFinale', () => this.triggerGrandFinale());
        this.bindClick('btnAutoShow', () => this.toggleAutoShow());
        this.bindClick('btnToggleSound', () => this.toggleSound());
        this.bindClick('btnOpenTrivia', () => this.openTriviaModal());
        this.bindClick('btnCloseTrivia', () => this.closeTriviaModal());
        this.bindClick('btnPrevTrivia', () => this.prevTrivia());
        this.bindClick('btnNextTrivia', () => this.nextTrivia());
        this.bindClick('btnCapture', () => this.captureScreenshot());
        this.bindClick('btnToggleUI', () => this.toggleUI());
        this.bindClick('btnToggleCollapse', () => this.toggleUI());
        this.bindClick('btnRandomizeWind', () => this.randomizeWind());

        // Instruction Badge click
        const badge = document.getElementById('instructionBadge');
        if (badge) {
            badge.addEventListener('click', () => this.engine.launchRandom());
        }

        // Theme selection buttons
        Object.keys(COLOR_THEMES).forEach(themeKey => {
            const btn = document.getElementById(`theme-${themeKey}`);
            if (btn) {
                btn.addEventListener('click', () => this.setTheme(themeKey));
            }
        });

        // Sliders & Selects
        this.bindInput('sliderRate', (val) => {
            this.engine.updateConfig('rate', parseFloat(val));
            const labels = { 1: 'Very Slow', 3: 'Slow', 5: 'Medium', 8: 'Fast', 10: 'Intense!' };
            this.setText('valRate', labels[val] || `${val}x`);
        });

        this.bindInput('sliderSize', (val) => {
            this.engine.updateConfig('size', parseFloat(val));
            this.setText('valSize', `${val}%`);
        });

        this.bindInput('sliderParticles', (val) => {
            this.engine.updateConfig('particles', parseFloat(val));
            this.setText('valParticles', val);
        });

        const selectHorizon = document.getElementById('selectHorizon');
        if (selectHorizon) {
            selectHorizon.addEventListener('change', (e) => {
                this.engine.updateConfig('horizon', e.target.value);
            });
        }
    }

    bindClick(id, handler) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', handler);
    }

    bindInput(id, handler) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', (e) => handler(e.target.value));
    }

    setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    }

    handleCanvasClick(e) {
        const badge = document.getElementById('instructionBadge');
        if (badge && !badge.classList.contains('hidden')) {
            badge.classList.add('opacity-0');
            setTimeout(() => badge.classList.add('hidden'), 300);
        }

        const rect = this.engine.canvas.getBoundingClientRect();
        const targetX = e.clientX - rect.left;
        const targetY = e.clientY - rect.top;

        const startX = targetX + (Math.random() - 0.5) * 120;
        const startY = this.engine.canvas.height;

        this.engine.launchRocket(startX, startY, targetX, targetY);
    }

    handleKeyDown(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.engine.launchRandom();
                break;
            case 'KeyF':
                e.preventDefault();
                this.triggerGrandFinale();
                break;
            case 'KeyA':
                e.preventDefault();
                this.toggleAutoShow();
                break;
            case 'KeyM':
                e.preventDefault();
                this.toggleSound();
                break;
            case 'KeyC':
                e.preventDefault();
                this.captureScreenshot();
                break;
            case 'KeyH':
                e.preventDefault();
                this.toggleUI();
                break;
        }
    }

    setTheme(themeName) {
        this.engine.setTheme(themeName);

        Object.keys(COLOR_THEMES).forEach(key => {
            const btn = document.getElementById(`theme-${key}`);
            if (btn) {
                if (key === themeName) {
                    btn.classList.add('ring-2', 'ring-white', 'scale-105');
                } else {
                    btn.classList.remove('ring-2', 'ring-white', 'scale-105');
                }
            }
        });
    }

    triggerGrandFinale() {
        const banner = document.getElementById('finaleBanner');
        if (!banner) return;

        this.engine.triggerGrandFinale(
            () => {
                banner.classList.remove('opacity-0', '-translate-y-4');
                banner.classList.add('opacity-100', 'translate-y-0');
            },
            () => {
                banner.classList.remove('opacity-100', 'translate-y-0');
                banner.classList.add('opacity-0', '-translate-y-4');
            }
        );
    }

    toggleAutoShow() {
        const newState = !this.engine.config.autoShow;
        this.engine.updateConfig('autoShow', newState);

        const btn = document.getElementById('btnAutoShow');
        const icon = document.getElementById('autoShowIcon');
        const text = document.getElementById('autoShowText');

        if (newState) {
            if (btn) {
                btn.classList.replace('bg-slate-800/80', 'bg-green-600/90');
                btn.classList.add('border-green-400');
            }
            if (icon) {
                icon.classList.replace('bg-slate-500', 'bg-white');
                icon.classList.add('animate-ping');
            }
            if (text) text.innerText = 'Auto: ON';
        } else {
            if (btn) {
                btn.classList.replace('bg-green-600/90', 'bg-slate-800/80');
                btn.classList.remove('border-green-400');
            }
            if (icon) {
                icon.classList.replace('bg-white', 'bg-slate-500');
                icon.classList.remove('animate-ping');
            }
            if (text) text.innerText = 'Auto Show';
        }
    }

    randomizeWind() {
        const wind = WIND_SPEEDS[Math.floor(Math.random() * WIND_SPEEDS.length)];
        this.engine.updateConfig('wind', wind);

        const display = document.getElementById('windDisplay');
        if (!display) return;

        if (wind === 0) {
            display.innerText = 'Calm (0 mph)';
            display.className = 'text-slate-200 font-semibold';
        } else if (wind > 0) {
            display.innerText = `East → (${wind * 3} mph)`;
            display.className = 'text-cyan-300 font-semibold';
        } else {
            display.innerText = `← West (${Math.abs(wind * 3)} mph)`;
            display.className = 'text-cyan-300 font-semibold';
        }
    }

    toggleSound() {
        const newState = !this.engine.config.soundEnabled;
        this.engine.updateConfig('soundEnabled', newState);

        const btn = document.getElementById('btnToggleSound');
        const icon = document.getElementById('soundIcon');
        const label = document.getElementById('soundLabel');

        if (newState) {
            this.sound.init();
            this.sound.ensureResumed();
            if (icon) icon.innerText = '🔊';
            if (label) label.innerText = 'Sound On';
            if (btn) {
                btn.classList.replace('text-slate-400', 'text-white');
                btn.classList.add('border-white/20');
            }
        } else {
            if (icon) icon.innerText = '🔇';
            if (label) label.innerText = 'Muted';
            if (btn) {
                btn.classList.replace('text-white', 'text-slate-400');
                btn.classList.remove('border-white/20');
            }
        }
    }

    toggleUI() {
        const newState = !this.engine.config.uiVisible;
        this.engine.updateConfig('uiVisible', newState);

        const header = document.getElementById('topHeader');
        const card = document.getElementById('controlPanelCard');
        const icon = document.getElementById('collapseIcon');
        const text = document.getElementById('collapseText');
        const eyeBtn = document.getElementById('btnToggleUI');

        if (newState) {
            // Expand controls panel
            if (header) {
                header.style.opacity = '1';
                header.style.pointerEvents = 'auto';
            }
            if (card) {
                card.classList.remove('card-collapsed');
            }
            if (icon) icon.textContent = '▼';
            if (text) text.textContent = 'Hide Controls';
            if (eyeBtn) eyeBtn.classList.remove('text-yellow-400', 'bg-yellow-500/20');
        } else {
            // Collapse controls so user can focus on fireworks
            if (header) {
                header.style.opacity = '0';
                header.style.pointerEvents = 'none';
            }
            if (card) {
                card.classList.add('card-collapsed');
            }
            if (icon) icon.textContent = '▲';
            if (text) text.textContent = 'Show Controls';
            if (eyeBtn) eyeBtn.classList.add('text-yellow-400', 'bg-yellow-500/20');
        }
    }

    captureScreenshot() {
        const flash = document.getElementById('flash-overlay');
        if (flash) {
            flash.classList.remove('opacity-0', 'flash-active');
            void flash.offsetWidth;
            flash.classList.add('flash-active');
        }

        if (this.engine.config.soundEnabled) {
            this.sound.playCrackle();
        }

        setTimeout(() => {
            const dataUrl = this.engine.canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `Liberty-Sparks-July4th-${Date.now()}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, 150);
    }

    openTriviaModal() {
        const modal = document.getElementById('triviaModal');
        const card = document.getElementById('triviaCard');
        if (modal && card) {
            modal.classList.remove('opacity-0', 'pointer-events-none');
            modal.classList.add('opacity-100', 'pointer-events-auto');
            card.classList.replace('scale-95', 'scale-100');
        }
    }

    closeTriviaModal() {
        const modal = document.getElementById('triviaModal');
        const card = document.getElementById('triviaCard');
        if (modal && card) {
            modal.classList.replace('opacity-100', 'opacity-0');
            modal.classList.replace('pointer-events-auto', 'pointer-events-none');
            card.classList.replace('scale-100', 'scale-95');
        }
    }

    updateTriviaDisplay() {
        const textEl = document.getElementById('triviaText');
        const counterEl = document.getElementById('triviaCounter');
        if (!textEl || !counterEl) return;

        textEl.style.opacity = '0';
        setTimeout(() => {
            textEl.innerText = TRIVIA_FACTS[this.currentTriviaIndex];
            counterEl.innerText = `Fact ${this.currentTriviaIndex + 1} of ${TRIVIA_FACTS.length}`;
            textEl.style.opacity = '1';
        }, 150);
    }

    nextTrivia() {
        this.currentTriviaIndex = (this.currentTriviaIndex + 1) % TRIVIA_FACTS.length;
        this.updateTriviaDisplay();
    }

    prevTrivia() {
        this.currentTriviaIndex = (this.currentTriviaIndex - 1 + TRIVIA_FACTS.length) % TRIVIA_FACTS.length;
        this.updateTriviaDisplay();
    }
}
