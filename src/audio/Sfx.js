export class Sfx {
    constructor() {
        this.enabled = true;
        this.ctx = null;
        this.master = null;
    }

    _ensure() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.master = this.ctx.createGain();
            this.master.gain.value = this.enabled ? 0.35 : 0;
            this.master.connect(this.ctx.destination);
        }
    }

    unlock() {
        this._ensure();
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setEnabled(value) {
        this.enabled = value;
        if (this.master) {
            this.master.gain.value = value ? 0.35 : 0;
        }
    }

    playSelect() {
        this._tone(280, 0.08, 'triangle', 0.12, 2200);
    }

    playSoft() {
        this._tone(160, 0.12, 'sine', 0.08, 900);
    }

    playMatch() {
        this._tone(420, 0.12, 'sine', 0.16, 2400);
        this._tone(620, 0.18, 'triangle', 0.14, 2600, 0.04);
    }

    playTurn() {
        this._tone(220, 0.15, 'triangle', 0.1, 1400);
    }

    playWin() {
        this._tone(330, 0.25, 'triangle', 0.18, 2000);
        this._tone(495, 0.32, 'sine', 0.15, 2200, 0.05);
        this._tone(660, 0.4, 'sine', 0.12, 2600, 0.1);
    }

    _tone(freq, duration, type, gainValue, filterFreq, delay = 0) {
        if (!this.enabled) {
            return;
        }
        this._ensure();
        const now = this.ctx.currentTime + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(filterFreq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(gainValue, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.master);

        osc.start(now);
        osc.stop(now + duration + 0.05);
    }
}
