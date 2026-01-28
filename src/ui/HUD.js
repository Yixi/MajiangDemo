export class HUD {
    constructor(stage) {
        this.stage = stage;
        this.callbacks = {
            start: [],
            restart: [],
            newGame: [],
            sound: []
        };

        this._build();
    }

    _build() {
        this.hud = document.createElement('div');
        this.hud.className = 'hud';

        this.top = document.createElement('div');
        this.top.className = 'hud-top';

        this.brand = document.createElement('div');
        this.brand.className = 'brand';
        this.brand.textContent = 'Mahjong Atelier';

        this.scoreboard = document.createElement('div');
        this.scoreboard.className = 'scoreboard';
        this.humanScore = this._createScoreCard('You');
        this.aiScore = this._createScoreCard('Opponent');
        this.scoreboard.append(this.humanScore.wrapper, this.aiScore.wrapper);

        this.top.append(this.brand, this.scoreboard);

        this.bottom = document.createElement('div');
        this.bottom.className = 'hud-bottom';

        this.message = document.createElement('div');
        this.message.className = 'message';
        this.message.textContent = 'Ready';

        this.controls = document.createElement('div');
        this.controls.className = 'controls';

        this.soundToggle = document.createElement('button');
        this.soundToggle.className = 'toggle';
        this.soundToggle.textContent = 'Sound On';
        this.soundEnabled = true;
        this.soundToggle.addEventListener('click', () => {
            this.soundEnabled = !this.soundEnabled;
            this.soundToggle.textContent = this.soundEnabled ? 'Sound On' : 'Sound Off';
            this.soundToggle.classList.toggle('is-off', !this.soundEnabled);
            this.callbacks.sound.forEach((cb) => cb(this.soundEnabled));
        });

        this.newGameButton = document.createElement('button');
        this.newGameButton.className = 'btn';
        this.newGameButton.textContent = 'New Round';
        this.newGameButton.addEventListener('click', () => {
            this.callbacks.newGame.forEach((cb) => cb());
        });

        this.controls.append(this.soundToggle, this.newGameButton);
        this.bottom.append(this.message, this.controls);

        this.hud.append(this.top, this.bottom);
        this.stage.append(this.hud);

        this.startOverlay = this._createOverlay({
            title: 'Mahjong Atelier',
            body: 'Match the tiles to outscore your rival.',
            button: 'Begin'
        });
        this.startOverlay.button.addEventListener('click', () => {
            this.callbacks.start.forEach((cb) => cb());
        });

        this.endOverlay = this._createOverlay({
            title: 'Round Complete',
            body: 'Another round awaits.',
            button: 'Play Again'
        });
        this.endOverlay.button.addEventListener('click', () => {
            this.callbacks.restart.forEach((cb) => cb());
        });

        this.stage.append(this.startOverlay.overlay, this.endOverlay.overlay);
    }

    _createScoreCard(label) {
        const wrapper = document.createElement('div');
        wrapper.className = 'score-card';
        const small = document.createElement('small');
        small.textContent = label;
        const value = document.createElement('span');
        value.textContent = '0';
        wrapper.append(small, value);
        return { wrapper, value };
    }

    _createOverlay({ title, body, button }) {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        const panel = document.createElement('div');
        panel.className = 'panel';
        const heading = document.createElement('h1');
        heading.textContent = title;
        const text = document.createElement('p');
        text.textContent = body;
        const action = document.createElement('button');
        action.className = 'btn';
        action.textContent = button;
        panel.append(heading, text, action);
        overlay.append(panel);
        return { overlay, button: action, heading, text };
    }

    onStart(callback) {
        this.callbacks.start.push(callback);
    }

    onRestart(callback) {
        this.callbacks.restart.push(callback);
    }

    onNewGame(callback) {
        this.callbacks.newGame.push(callback);
    }

    onToggleSound(callback) {
        this.callbacks.sound.push(callback);
    }

    setScores(scores) {
        this.humanScore.value.textContent = String(scores.human);
        this.aiScore.value.textContent = String(scores.ai);
    }

    setMessage(text) {
        this.message.textContent = text;
    }

    showStart(visible) {
        this.startOverlay.overlay.classList.toggle('is-active', visible);
    }

    showEnd(visible, title = '', scores = null) {
        this.endOverlay.overlay.classList.toggle('is-active', visible);
        if (visible) {
            if (title) {
                this.endOverlay.heading.textContent = title;
            }
            if (scores) {
                this.endOverlay.text.textContent = `Final score ${scores.human} : ${scores.ai}`;
            }
        }
    }
}
