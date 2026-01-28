import { ParticleSystem } from '../effects/ParticleSystem.js';
import { createPaperTexture, createWoodTexture } from './TextureFactory.js';
import { approach, clamp, easeOutCubic, lerp } from '../utils/math.js';

export class Renderer {
    constructor(canvas, { baseWidth = 960, baseHeight = 720 } = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.baseWidth = baseWidth;
        this.baseHeight = baseHeight;
        this.pixelRatio = window.devicePixelRatio || 1;
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.ready = false;
        this.spriteSheet = null;
        this.frames = new Map();
        this.particles = new ParticleSystem();
        this.floatingTexts = [];
        this.removals = [];
        this.turnFlash = 0;
        this.shuffleFlash = 0;
        this.haze = 0;
        this.layout = {
            cardWidth: 48,
            cardHeight: 64,
            gap: 6,
            ratio: 48 / 64,
            safeTop: 96,
            safeBottom: 82,
            safeSide: 70,
            baseX: 0,
            baseY: 0,
            boardWidth: 0,
            boardHeight: 0
        };

        this.woodTexture = createWoodTexture(512, 512);
        this.paperTexture = createPaperTexture(128, 128);
        this.woodPattern = this.ctx.createPattern(this.woodTexture, 'repeat');
        this.paperPattern = this.ctx.createPattern(this.paperTexture, 'repeat');

        this._updateViewport();
        window.addEventListener('resize', () => this._updateViewport());
    }

    setSpriteSheet(image, atlasJson) {
        this.spriteSheet = image;
        this.frames.clear();
        atlasJson.frames.forEach((frame) => {
            this.frames.set(frame.filename, frame.frame);
        });
    }

    setReady(value) {
        this.ready = value;
    }

    resetEffects() {
        this.floatingTexts = [];
        this.removals = [];
        this.particles.reset();
        this.turnFlash = 0;
        this.shuffleFlash = 0;
    }

    update(dt, state) {
        if (!state) {
            return;
        }

        this._updateLayout(state);

        state.cards.forEach((card) => {
            if (!card || card.removed) {
                return;
            }
            const target = this._getCardTargetPosition(state, card);
            if (!card.view.ready) {
                card.view.x = target.x;
                card.view.y = target.y;
                card.view.ready = true;
            }
            card.view.x = approach(card.view.x, target.x, 0.18, dt);
            card.view.y = approach(card.view.y, target.y, 0.18, dt);

            const isHover = state.hoveredCard === card && state.canSelect(card) && state.currentPlayer === 'human';
            const hoverTarget = isHover ? 1 : 0;
            card.view.hover = approach(card.view.hover, hoverTarget, 0.25, dt);

            const liftTarget = (card.selected ? 14 : 0) + card.view.hover * 6;
            card.view.lift = approach(card.view.lift, liftTarget, 0.2, dt);

            const scaleTarget = 1 + (card.selected ? 0.03 : 0) + card.view.hover * 0.015;
            card.view.scale = approach(card.view.scale, scaleTarget, 0.2, dt);
        });

        this.floatingTexts = this.floatingTexts.filter((text) => {
            text.age += dt;
            text.y -= text.rise * dt;
            return text.age < text.life;
        });

        this.removals = this.removals.filter((removal) => {
            removal.age += dt;
            return removal.age < removal.life;
        });

        this.turnFlash = clamp(this.turnFlash - dt * 1.4, 0, 1);
        this.shuffleFlash = clamp(this.shuffleFlash - dt * 1.1, 0, 1);
        this.haze = approach(this.haze, 0.22, 0.08, dt);

        this.particles.update(dt);
    }

    render(state) {
        this._updateViewport();
        const ctx = this.ctx;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.setTransform(this.scale * this.pixelRatio, 0, 0, this.scale * this.pixelRatio, this.offsetX * this.pixelRatio, this.offsetY * this.pixelRatio);

        this._drawBackground();
        this._drawBoardFrame();
        this._drawBoardSurface();

        if (state) {
            this._drawCards(state);
            this._drawRemovalEffects();
            this._drawFloatingTexts();
        }

        this.particles.render(ctx);
        this._drawOverlays();
    }

    toLocalPoint(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (clientX - rect.left - this.offsetX) / this.scale;
        const y = (clientY - rect.top - this.offsetY) / this.scale;
        return { x, y };
    }

    pickCard(state, x, y) {
        if (!state) {
            return null;
        }
        const cards = state.cards;
        for (let i = cards.length - 1; i >= 0; i--) {
            const card = cards[i];
            if (!card || card.removed) {
                continue;
            }
            const bounds = this._getCardBounds(state, card);
            if (x >= bounds.x && x <= bounds.x + bounds.w && y >= bounds.y && y <= bounds.y + bounds.h) {
                return card;
            }
        }
        return null;
    }

    pulseCard(card) {
        if (!card) {
            return;
        }
        card.view.scale = 1.08;
        card.view.lift = Math.max(card.view.lift, 16);
    }

    spawnRemoval(card) {
        if (!card) {
            return;
        }
        const bounds = this._getCardBounds(null, card);
        this.removals.push({
            x: bounds.x,
            y: bounds.y,
            w: bounds.w,
            h: bounds.h,
            key: card.spriteKey,
            age: 0,
            life: 0.7
        });
    }

    spawnFloatingText(text, x, y) {
        this.floatingTexts.push({
            text,
            x,
            y,
            age: 0,
            life: 1.2,
            rise: 22
        });
    }

    emitPaperBurst(card) {
        if (!card) {
            return;
        }
        const bounds = this._getCardBounds(null, card);
        const centerX = bounds.x + bounds.w / 2;
        const centerY = bounds.y + bounds.h / 2;
        this.particles.emitBurst({
            x: centerX,
            y: centerY,
            count: 14,
            spread: 1.2,
            speed: 120,
            gravity: 80,
            drag: 0.08,
            size: [4, 8],
            life: [0.6, 1.1],
            colors: ['#f0e6d2', '#e6d7bb', '#c9b894']
        });
    }

    flashTurn() {
        this.turnFlash = 1;
    }

    flashShuffle() {
        this.shuffleFlash = 1;
    }

    getPairCenter(pair) {
        const first = this._getCardBounds(null, pair[0]);
        const second = this._getCardBounds(null, pair[1]);
        return {
            x: (first.x + first.w / 2 + second.x + second.w / 2) / 2,
            y: (first.y + first.h / 2 + second.y + second.h / 2) / 2
        };
    }

    _updateViewport() {
        const rect = this.canvas.getBoundingClientRect();
        const width = rect.width || this.baseWidth;
        const height = rect.height || this.baseHeight;
        this.scale = Math.min(width / this.baseWidth, height / this.baseHeight);
        this.offsetX = (width - this.baseWidth * this.scale) / 2;
        this.offsetY = (height - this.baseHeight * this.scale) / 2;
        this.canvas.width = Math.floor(width * this.pixelRatio);
        this.canvas.height = Math.floor(height * this.pixelRatio);
        this.ctx.imageSmoothingEnabled = true;
    }

    _updateLayout(state) {
        const { gap, ratio, safeTop, safeBottom, safeSide } = this.layout;
        const availableWidth = this.baseWidth - safeSide * 2;
        const availableHeight = this.baseHeight - safeTop - safeBottom;

        const widthBased = (availableWidth - (state.cols - 1) * gap) / state.cols;
        const heightBased = (availableHeight - (state.rows - 1) * gap) / state.rows;

        const cardWidth = Math.min(widthBased, heightBased * ratio);
        const cardHeight = cardWidth / ratio;
        const boardWidth = state.cols * cardWidth + (state.cols - 1) * gap;
        const boardHeight = state.rows * cardHeight + (state.rows - 1) * gap;

        this.layout.cardWidth = cardWidth;
        this.layout.cardHeight = cardHeight;
        this.layout.boardWidth = boardWidth;
        this.layout.boardHeight = boardHeight;
        this.layout.baseX = (this.baseWidth - boardWidth) / 2;
        this.layout.baseY = safeTop + (availableHeight - boardHeight) / 2;
    }

    _getCardTargetPosition(state, card) {
        const baseX = this.layout.baseX;
        const baseY = this.layout.baseY;
        const { cardWidth, cardHeight, gap } = this.layout;
        return {
            x: baseX + card.col * (cardWidth + gap),
            y: baseY + card.row * (cardHeight + gap)
        };
    }

    _getCardBounds(state, card) {
        const position = state ? this._getCardTargetPosition(state, card) : { x: card.view.x, y: card.view.y };
        const { cardWidth, cardHeight } = this.layout;
        const scale = card.view.scale || 1;
        const lift = card.view.lift || 0;
        const x = position.x + (cardWidth - cardWidth * scale) / 2;
        const y = position.y + (cardHeight - cardHeight * scale) / 2 - lift;
        return {
            x,
            y,
            w: cardWidth * scale,
            h: cardHeight * scale
        };
    }

    _drawBackground() {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = this.woodPattern;
        ctx.fillRect(0, 0, this.baseWidth, this.baseHeight);
        ctx.restore();
    }

    _drawBoardFrame() {
        const ctx = this.ctx;
        const { boardWidth, boardHeight, baseX, baseY } = this.layout;
        const padding = 18;
        ctx.save();
        ctx.fillStyle = 'rgba(20, 12, 8, 0.35)';
        ctx.fillRect(baseX - padding, baseY - padding, boardWidth + padding * 2, boardHeight + padding * 2);
        ctx.strokeStyle = 'rgba(225, 200, 160, 0.25)';
        ctx.lineWidth = 2;
        ctx.strokeRect(baseX - padding, baseY - padding, boardWidth + padding * 2, boardHeight + padding * 2);
        ctx.restore();
    }

    _drawBoardSurface() {
        const ctx = this.ctx;
        const { boardWidth, boardHeight, baseX, baseY } = this.layout;
        ctx.save();
        const surface = ctx.createLinearGradient(baseX, baseY, baseX + boardWidth, baseY + boardHeight);
        surface.addColorStop(0, 'rgba(248, 241, 226, 0.18)');
        surface.addColorStop(1, 'rgba(20, 14, 10, 0.12)');
        ctx.fillStyle = surface;
        ctx.fillRect(baseX - 4, baseY - 4, boardWidth + 8, boardHeight + 8);

        ctx.globalAlpha = 0.22;
        ctx.fillStyle = this.paperPattern;
        ctx.fillRect(baseX - 4, baseY - 4, boardWidth + 8, boardHeight + 8);
        ctx.restore();
    }

    _drawCards(state) {
        const ctx = this.ctx;
        for (let row = 0; row < state.rows; row++) {
            for (let col = 0; col < state.cols; col++) {
                const card = state.getCard(row, col);
                if (!card || card.removed) {
                    continue;
                }
                const bounds = this._getCardBounds(state, card);
                this._drawCardSprite(ctx, card, bounds, state.currentPlayer);
            }
        }
    }

    _drawCardSprite(ctx, card, bounds, currentPlayer) {
        const frame = this.frames.get(card.spriteKey);
        if (!frame || !this.spriteSheet) {
            return;
        }
        const lift = card.view.lift || 0;
        const hoverGlow = card.view.hover || 0;

        ctx.save();
        ctx.translate(bounds.x + bounds.w / 2, bounds.y + bounds.h / 2);
        ctx.globalAlpha = card.view.alpha || 1;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 14 + lift * 0.6;
        ctx.shadowOffsetY = 6;
        ctx.fillStyle = this.paperPattern;
        ctx.fillRect(-bounds.w / 2, -bounds.h / 2, bounds.w, bounds.h);
        ctx.shadowColor = 'transparent';

        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(210, 190, 155, 0.7)';
        ctx.strokeRect(-bounds.w / 2, -bounds.h / 2, bounds.w, bounds.h);

        if (hoverGlow > 0.01) {
            ctx.strokeStyle = `rgba(215, 195, 155, ${0.4 * hoverGlow})`;
            ctx.lineWidth = 6;
            ctx.strokeRect(-bounds.w / 2 + 2, -bounds.h / 2 + 2, bounds.w - 4, bounds.h - 4);
        }

        const innerPadding = 6;
        ctx.drawImage(
            this.spriteSheet,
            frame.x,
            frame.y,
            frame.w,
            frame.h,
            -bounds.w / 2 + innerPadding,
            -bounds.h / 2 + innerPadding,
            bounds.w - innerPadding * 2,
            bounds.h - innerPadding * 2
        );

        if (card.selected) {
            const color = currentPlayer === 'ai' ? 'rgba(166, 87, 71, 0.85)' : 'rgba(94, 126, 97, 0.85)';
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.strokeRect(-bounds.w / 2 + 1, -bounds.h / 2 + 1, bounds.w - 2, bounds.h - 2);
            ctx.fillStyle = color.replace('0.85', '0.18');
            ctx.fillRect(-bounds.w / 2 + 2, -bounds.h / 2 + 2, bounds.w - 4, bounds.h - 4);
        }

        ctx.restore();
    }

    _drawRemovalEffects() {
        const ctx = this.ctx;
        this.removals.forEach((removal) => {
            const frame = this.frames.get(removal.key);
            if (!frame || !this.spriteSheet) {
                return;
            }
            const t = clamp(removal.age / removal.life, 0, 1);
            const fade = 1 - easeOutCubic(t);
            const scale = 1 + t * 0.08;
            ctx.save();
            ctx.globalAlpha = fade;
            ctx.translate(removal.x + removal.w / 2, removal.y + removal.h / 2);
            ctx.scale(scale, scale);
            ctx.fillStyle = this.paperPattern;
            ctx.fillRect(-removal.w / 2, -removal.h / 2, removal.w, removal.h);
            ctx.drawImage(
                this.spriteSheet,
                frame.x,
                frame.y,
                frame.w,
                frame.h,
                -removal.w / 2 + 6,
                -removal.h / 2 + 6,
                removal.w - 12,
                removal.h - 12
            );
            ctx.restore();
        });
    }

    _drawFloatingTexts() {
        const ctx = this.ctx;
        ctx.save();
        ctx.font = '600 20px "Marcellus", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        this.floatingTexts.forEach((text) => {
            const t = clamp(text.age / text.life, 0, 1);
            const alpha = 1 - t;
            ctx.fillStyle = `rgba(246, 233, 208, ${alpha})`;
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 8;
            ctx.fillText(text.text, text.x, text.y);
        });
        ctx.restore();
    }

    _drawOverlays() {
        const ctx = this.ctx;
        if (this.turnFlash > 0.01) {
            ctx.save();
            ctx.globalAlpha = this.turnFlash * 0.2;
            ctx.fillStyle = '#f3e6c4';
            ctx.fillRect(0, 0, this.baseWidth, this.baseHeight);
            ctx.restore();
        }

        if (this.shuffleFlash > 0.01) {
            ctx.save();
            ctx.globalAlpha = this.shuffleFlash * 0.22;
            ctx.fillStyle = '#d9c49a';
            ctx.fillRect(0, 0, this.baseWidth, this.baseHeight);
            ctx.restore();
        }

        ctx.save();
        const vignette = ctx.createRadialGradient(
            this.baseWidth / 2,
            this.baseHeight / 2,
            this.baseWidth * 0.2,
            this.baseWidth / 2,
            this.baseHeight / 2,
            this.baseWidth * 0.75
        );
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.45)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, this.baseWidth, this.baseHeight);
        ctx.restore();
    }
}
