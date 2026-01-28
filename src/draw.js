/**
 * Created by liuyixi on 3/25/14.
 */
import { resources, Sprite } from './resources.js';
import MJSprites from './MJsprites.js';

const Util = {
    randomArray(array) {
        for (let i = 0; i < array.length; i++) {
            const iRand = Math.floor(array.length * Math.random());
            [array[i], array[iRand]] = [array[iRand], array[i]];
        }
        return array;
    },
    setAttr(dom, attr, value) {
        dom[attr] = value;
    }
};

class Card {
    constructor() {
        this.id = null;
        this.name = null;
        this.value = null;
        this.x = 0;
        this.y = 0;
        this.width = 40;
        this.height = 53;
        this.isSelect = false;
        this.location = { x: null, y: null };
        this.sprite = null;
    }

    includePoint(x, y) {
        return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
    }
}

class BaseLayer {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.id = null;
        this.type = null;
    }
}

class TextLayer extends BaseLayer {
    constructor(ctx, content, fontFamily, fontSize, fontColor) {
        super();
        this.type = 'text';
        this.content = content;
        this.fontFamily = fontFamily;
        this.fontSize = fontSize;
        this.fontColor = fontColor;
        this.ctx = ctx;
    }

    draw() {
        this.clear();
        this.ctx.save();
        this.ctx.font = this.fontSize + 'px ' + this.fontFamily;
        this.ctx.textAlign = 'left';
        this.ctx.fillStyle = this.fontColor;
        this.ctx.fillText(this.content, this.x, this.y);
        this.ctx.restore();
    }

    clear() {
    }
}

class Player {
    constructor(ctx, name) {
        this.scoreBoard = new TextLayer(ctx, 'Score 0', 'Arial', '20', 'green');
        this._x = 0;
        this._y = 0;
        this.scoreBoard.x = this._x;
        this.scoreBoard.y = this._y;
        this.name = name;
        this.scoreBoard.id = name;
        this.score = 0;
    }

    set x(value) {
        this._x = value;
        this.scoreBoard.x = value;
    }

    get x() {
        return this._x;
    }

    set y(value) {
        this._y = value;
        this.scoreBoard.y = value;
    }

    get y() {
        return this._y;
    }

    addScore(score) {
        this.score += score;
        this.scoreBoard.content = 'Score ' + this.score;
    }
}

export class MJ {
    constructor(element) {
        this.Dom = element;
        this.Ctx = this.Dom.getContext('2d');
        Util.setAttr(this.Dom, 'width', 800);
        Util.setAttr(this.Dom, 'height', 700);
        this.layers = [];
        this.cards = [];
        this.currentPlayer = null;
        this.lastSelect = null;
        this.CurrentselectCard = null;
        this.currentSelectColor = null;
        this.sprites = new Sprite(this.Ctx, 'res/mj.png', MJSprites);

        resources.load([
            'res/mj.png'
        ]);
        resources.onReady(this.init.bind(this));
    }

    init() {
        this.initCards();
        this.initPlayers();
        this.bindEvent();
        this.renderView();
    }

    initCards() {
        const colo = ['a', 'b', 'c'];
        const tmpCards = [];
        for (let i = 0; i < 3; i++) {
            const p_1 = colo[i];
            for (let m = 1; m <= 9; m++) {
                for (let n = 0; n < 4; n++) {
                    const card = new Card();
                    card.id = p_1 + '_' + m + '_' + n;
                    card.name = p_1 + m;
                    card.value = m;
                    card.sprite = this.sprites.get(card.name + '.png');
                    tmpCards.push(card);
                }
            }
        }

        const shuffled = Util.randomArray(tmpCards);
        const baseX = 130;
        const baseY = 60;
        for (let i = 0; i < 9; i++) {
            this.cards[i] = [];
            for (let m = 0; m < 12; m++) {
                this.cards[i][m] = shuffled[i * 12 + m];
                const card = this.cards[i][m];
                card.x = m * (card.width + 5) + baseX;
                card.y = i * (card.height + 5) + baseY;
                card.location = {
                    x: m,
                    y: i
                };
            }
        }
    }

    rearrageCards() {
        const baseX = 130;
        const baseY = 60;
        for (let i = 0; i < 9; i++) {
            for (let m = 0; m < 12; m++) {
                const iRandi = Math.floor(9 * Math.random());
                const iRandm = Math.floor(12 * Math.random());
                if (this.cards[iRandi][iRandm] && this.cards[i][m]) {
                    const temp = this.cards[i][m];
                    this.cards[i][m] = this.cards[iRandi][iRandm];
                    this.cards[iRandi][iRandm] = temp;

                    const leftCard = this.cards[i][m];
                    leftCard.x = m * (leftCard.width + 5) + baseX;
                    leftCard.y = i * (leftCard.height + 5) + baseY;
                    leftCard.location = { x: m, y: i };

                    const rightCard = this.cards[iRandi][iRandm];
                    rightCard.x = iRandm * (rightCard.width + 5) + baseX;
                    rightCard.y = iRandi * (rightCard.height + 5) + baseY;
                    rightCard.location = { x: iRandm, y: iRandi };
                }
            }
        }
    }

    initPlayers() {
        this.playerA = new Player(this.Ctx, 'playerA');
        this.playerA.x = 30;
        this.playerA.y = 30;
        this.layers.push(this.playerA.scoreBoard);

        this.playerB = new Player(this.Ctx, 'playerB');
        this.playerB.x = 30;
        this.playerB.y = 640;
        this.playerB.scoreBoard.fontColor = 'red';
        this.layers.push(this.playerB.scoreBoard);

        this.changePlayer();
    }

    changePlayer() {
        if (this.getAllDual().length < 1) {
            this.rearrageCards();
            this.renderView();
        }
        if (this.currentPlayer == this.playerB) {
            this.currentPlayer = this.playerA;
            this.currentSelectColor = ['green', 'rgba(0,255,0,.5)'];
            this.AISelect();
        } else {
            this.currentPlayer = this.playerB;
            this.currentSelectColor = ['red', 'rgba(255,0,0,.5)'];
//            this.AISelect();
        }
    }

    /* AI*/
    AISelect() {
        const z = this;
        const allDual = this.getAllDual();
        allDual.sort(function(left, right) {
            if (left.score > right.score) {
                return -1;
            }
            return 1;
        });

        /*hard*/
        const standby = allDual.slice(0, 2);
        const take = standby[Math.floor(standby.length * Math.random())];
        console.log(take);
        setTimeout(function() {
            take.f.isSelect = true;
            z.lastSelect = take.f;
            z.renderView();
        }, 1000);
        setTimeout(function() {
            take.s.isSelect = true;
            z.lastSelect = null;
            z.renderView();
        }, 2000);
        setTimeout(function() {
            z.currentPlayer.addScore(take.score);
            z.cleanCard(take.f);
            z.cleanCard(take.s);
            z.renderView();
            z.changePlayer();
        }, 3000);
    }

    getAllDual() {
        const canSelect = this.getAllCanSelect();
        const dual = [];
        for (let i = 0; i < canSelect.length; i++) {
            for (let m = i + 1; m < canSelect.length; m++) {
                if (canSelect[m].name == canSelect[i].name) {
                    dual.push({
                        f: canSelect[i],
                        s: canSelect[m],
                        score: canSelect[m].value
                    });
                }
            }
        }
        return dual;
    }

    getAllCanSelect() {
        const canSelect = [];
        for (let i = 0; i < this.cards.length; i++) {
            for (let m = 0; m < this.cards[i].length; m++) {
                const card = this.cards[i][m];
                if (!card) {
                    continue;
                }
                if (this.cardCanSelect(card)) {
                    canSelect.push(card);
                }
            }
        }
        return canSelect;
    }

    /**/
    cardCanSelect(card) {
        const x = card.location.x;
        const y = card.location.y;
        if (y < 1 || y >= 8) {
            return true;
        }
        return !this.cards[y - 1][x] || !this.cards[y + 1][x];
    }

    /*bind Event*/
    bindEvent() {
        this.Dom.addEventListener('mousemove', this.mouseMove.bind(this), false);
        this.Dom.addEventListener('mousedown', this.mouseDown.bind(this), false);
    }

    mouseDown(e) {
        if (this.currentPlayer == this.playerA) {
            return;
        }
        if (this.CurrentselectCard) {
            if (!this.lastSelect) {
                if (this.cardCanSelect(this.CurrentselectCard)) {
                    this.lastSelect = this.CurrentselectCard;
                    this.CurrentselectCard.isSelect = true;
                }
            } else {
                if (this.CurrentselectCard == this.lastSelect) {
                    this.CurrentselectCard.isSelect = false;
                    this.lastSelect = null;
                } else {
                    if (this.cardCanSelect(this.CurrentselectCard)) {
                        if (this.CurrentselectCard.name == this.lastSelect.name) {
                            console.log('get point ' + this.lastSelect.value);
                            this.currentPlayer.addScore(this.lastSelect.value);
                            this.cleanCard(this.CurrentselectCard);
                            this.cleanCard(this.lastSelect);
                            this.lastSelect = null;
                            this.CurrentselectCard = null;
                            this.changePlayer();
                        } else {
                            this.lastSelect.isSelect = false;
                            this.lastSelect = this.CurrentselectCard;
                            this.lastSelect.isSelect = true;
                        }
                    }
                }
            }
            this.renderView();
        }
    }

    mouseMove(e) {
        let intersected = false;
        this.CurrentselectCard = null;
        for (let i = 0; i < this.cards.length; i++) {
            for (let m = 0; m < this.cards[i].length; m++) {
                const card = this.cards[i][m];
                if (!card) {
                    continue;
                }
                if (card.includePoint(e.offsetX, e.offsetY) && this.cardCanSelect(card)) {
                    intersected = true;
                    this.drawMarker(this.cards[i][m], '#000');
                    this.CurrentselectCard = this.cards[i][m];
                }
            }
        }
        if (!intersected) {
            this.renderView();
        }
    }

    /*draw*/
    cleanCard(card) {
        this.cards[card.location.y][card.location.x] = null;
    }

    drawMarker(card, color) {
        this.renderView();
        this.Ctx.save();
        this.Ctx.strokeStyle = color;
        this.Ctx.strokeRect(card.x, card.y, card.width, card.height);
        this.Ctx.restore();
    }

    renderView() {
        this.Ctx.clearRect(0, 0, this.Dom.width, this.Dom.height);
        this.drawLayers();
        this.drawCards();
    }

    drawLayers() {
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            layer.draw();
        }
    }

    drawCards() {
        for (let i = 0; i < this.cards.length; i++) {
            for (let m = 0; m < this.cards[i].length; m++) {
                this.Ctx.save();

                const card = this.cards[i][m];
                if (!card) {
                    continue;
                }

//                this.Ctx.fillStyle = '#c1c1c1';
//                this.Ctx.fillRect(card.x, card.y, card.width, card.height);
                card.sprite.draw(card.x, card.y);

                if (card.isSelect) {
                    this.Ctx.strokeStyle = this.currentSelectColor[0];
                    this.Ctx.strokeRect(card.x, card.y, card.width, card.height);
                    this.Ctx.fillStyle = this.currentSelectColor[1];
                    this.Ctx.fillRect(card.x, card.y, card.width, card.height);
                }

//                this.Ctx.font = "Bold 20px Arial";
//                this.Ctx.textAlign = 'center';
//                this.Ctx.fillStyle = '#000';
//                this.Ctx.fillText(card.name,card.x + 20,card.y + 40);

                this.Ctx.restore();
            }
        }
    }
}
