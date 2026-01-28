import { GameState } from './core/GameState.js';
import { AIPlayer } from './core/AIPlayer.js';
import { Renderer } from './render/Renderer.js';
import { Sfx } from './audio/Sfx.js';
import { HUD } from './ui/HUD.js';
import { resources } from './resources.js';
import MJSprites from './MJsprites.js';

export class GameApp {
    constructor({ canvas, stage }) {
        this.canvas = canvas;
        this.stage = stage;
        this.state = new GameState();
        this.ai = new AIPlayer();
        this.renderer = new Renderer(canvas, {
            baseWidth: 960,
            baseHeight: 720
        });
        this.sfx = new Sfx();
        this.hud = new HUD(stage);
        this.running = false;
        this.lastTime = 0;
        this.aiPending = false;
        this.aiTimers = [];

        this._bindHUD();
        this._bindInput();
        this._preload();
    }

    _bindHUD() {
        this.hud.onStart(() => {
            this.sfx.unlock();
            this.startGame();
        });
        this.hud.onRestart(() => {
            this.sfx.unlock();
            this.startGame();
        });
        this.hud.onNewGame(() => {
            this.sfx.unlock();
            this.startGame();
        });
        this.hud.onToggleSound((enabled) => {
            this.sfx.setEnabled(enabled);
        });
    }

    _bindInput() {
        this.canvas.addEventListener('mousemove', (event) => {
            if (!this.running || this.state.currentPlayer !== 'human') {
                return;
            }
            const local = this.renderer.toLocalPoint(event.clientX, event.clientY);
            const card = this.renderer.pickCard(this.state, local.x, local.y);
            this.state.setHover(card);
            this.canvas.style.cursor = card && this.state.canSelect(card) ? 'pointer' : 'default';
        });

        this.canvas.addEventListener('mousedown', (event) => {
            if (!this.running || this.state.currentPlayer !== 'human' || this.aiPending) {
                return;
            }
            this.sfx.unlock();
            const local = this.renderer.toLocalPoint(event.clientX, event.clientY);
            const card = this.renderer.pickCard(this.state, local.x, local.y);
            this._handleSelection(card);
        });
    }

    _preload() {
        const spritePath = `${import.meta.env.BASE_URL}res/mj.png`;
        resources.load([spritePath]);
        resources.onReady(() => {
            this.renderer.setSpriteSheet(resources.get(spritePath), MJSprites);
            this.hud.showStart(true);
            this.renderer.setReady(true);
            this._renderStatic();
        });
    }

    startGame() {
        this._clearAITimers();
        this.state.reset();
        this.renderer.resetEffects();
        this.hud.showStart(false);
        this.hud.showEnd(false);
        this.hud.setScores(this.state.scores);
        this.hud.setMessage('Your turn');
        this.running = true;
        this.lastTime = performance.now();
        this._loop(this.lastTime);
    }

    _loop(time) {
        if (!this.running) {
            return;
        }
        const dt = Math.min(0.033, (time - this.lastTime) / 1000);
        this.lastTime = time;

        this._update(dt);
        this.renderer.render(this.state, dt);

        requestAnimationFrame((next) => this._loop(next));
    }

    _update(dt) {
        this.renderer.update(dt, this.state);
    }

    _renderStatic() {
        this.renderer.render(this.state, 0);
    }

    _handleSelection(card) {
        if (!card) {
            return;
        }
        const result = this.state.handleSelection(card);
        switch (result.type) {
            case 'select':
                this.sfx.playSelect();
                this.renderer.pulseCard(card);
                break;
            case 'switch':
                this.sfx.playSelect();
                this.renderer.pulseCard(card);
                break;
            case 'deselect':
                this.sfx.playSoft();
                break;
            case 'match':
                this._resolveMatch(result.pair, result.score, this.state.currentPlayer);
                break;
            default:
                break;
        }
    }

    _resolveMatch(pair, score, player) {
        this.state.addScore(player, score);
        this.hud.setScores(this.state.scores);
        this.sfx.playMatch();
        pair.forEach((card) => {
            this.renderer.spawnRemoval(card);
            this.renderer.emitPaperBurst(card);
        });
        const position = this.renderer.getPairCenter(pair);
        this.renderer.spawnFloatingText('+' + score, position.x, position.y);
        this.state.removeCards(pair);

        if (!this._hasRemainingCards()) {
            this._finishGame();
            return;
        }

        this._advanceTurn();
    }

    _advanceTurn() {
        this.renderer.flashTurn();
        this.sfx.playTurn();
        if (!this.state.hasMoves()) {
            this.state.shuffleGrid();
            this.renderer.flashShuffle();
        }

        this.state.currentPlayer = this.state.currentPlayer === 'human' ? 'ai' : 'human';
        if (this.state.currentPlayer === 'ai') {
            this.hud.setMessage('Opponent thinking');
            this._startAITurn();
        } else {
            this.hud.setMessage('Your turn');
        }
    }

    _startAITurn() {
        this.aiPending = true;
        const plan = this.ai.planTurn(this.state);
        if (!plan) {
            this.aiPending = false;
            this._advanceTurn();
            return;
        }

        const schedule = (delay, fn) => {
            const id = window.setTimeout(fn, delay);
            this.aiTimers.push(id);
        };

        let delay = 500;
        if (plan.feint) {
            schedule(delay, () => this._handleSelection(plan.feint));
            delay += 400;
            schedule(delay, () => this._handleSelection(plan.feint));
            delay += 300;
        }

        schedule(delay, () => this._handleSelection(plan.pair.a));
        delay += 500;
        schedule(delay, () => {
            this._handleSelection(plan.pair.b);
            this.aiPending = false;
        });
    }

    _finishGame() {
        this.running = false;
        const winner = this.state.scores.human >= this.state.scores.ai ? 'You win' : 'Opponent wins';
        this.sfx.playWin();
        this.hud.showEnd(true, winner, this.state.scores);
    }

    _hasRemainingCards() {
        return this.state.cards.some((card) => !card.removed);
    }

    _clearAITimers() {
        this.aiTimers.forEach((id) => window.clearTimeout(id));
        this.aiTimers = [];
        this.aiPending = false;
    }
}
