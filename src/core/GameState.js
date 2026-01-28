import { CardModel } from './CardModel.js';
import { randInt } from '../utils/math.js';

export class GameState {
    constructor({ rows = 9, cols = 12 } = {}) {
        this.rows = rows;
        this.cols = cols;
        this.grid = [];
        this.cards = [];
        this.currentPlayer = 'human';
        this.selectedCard = null;
        this.hoveredCard = null;
        this.scores = {
            human: 0,
            ai: 0
        };
    }

    reset() {
        this.cards = this._createDeck();
        this._shuffle(this.cards);
        this._buildGrid(this.cards);
        this.currentPlayer = 'human';
        this.selectedCard = null;
        this.hoveredCard = null;
        this.scores.human = 0;
        this.scores.ai = 0;
    }

    _createDeck() {
        const deck = [];
        const suits = ['a', 'b', 'c'];
        let id = 0;
        for (let i = 0; i < suits.length; i++) {
            for (let value = 1; value <= 9; value++) {
                for (let count = 0; count < 4; count++) {
                    deck.push(new CardModel({
                        id: String(id++),
                        name: suits[i] + value,
                        value,
                        row: 0,
                        col: 0
                    }));
                }
            }
        }
        return deck;
    }

    _shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = randInt(0, i);
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    _buildGrid(cards) {
        this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
        let index = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const card = cards[index++];
                if (!card) {
                    continue;
                }
                card.row = row;
                card.col = col;
                card.selected = false;
                card.removed = false;
                this.grid[row][col] = card;
            }
        }
    }

    getCard(row, col) {
        if (row < 0 || col < 0 || row >= this.rows || col >= this.cols) {
            return null;
        }
        return this.grid[row][col];
    }

    setHover(card) {
        this.hoveredCard = card;
    }

    canSelect(card) {
        if (!card || card.removed) {
            return false;
        }
        const row = card.row;
        const col = card.col;
        if (row < 1 || row >= this.rows - 1) {
            return true;
        }
        return !this.grid[row - 1][col] || !this.grid[row + 1][col];
    }

    getSelectableCards() {
        const selectable = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const card = this.grid[row][col];
                if (card && this.canSelect(card)) {
                    selectable.push(card);
                }
            }
        }
        return selectable;
    }

    getPairs() {
        const selectable = this.getSelectableCards();
        const pairs = [];
        for (let i = 0; i < selectable.length; i++) {
            for (let j = i + 1; j < selectable.length; j++) {
                if (selectable[i].name === selectable[j].name) {
                    pairs.push({
                        a: selectable[i],
                        b: selectable[j],
                        score: selectable[i].value
                    });
                }
            }
        }
        return pairs;
    }

    hasMoves() {
        return this.getPairs().length > 0;
    }

    shuffleGrid() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const targetRow = randInt(0, this.rows - 1);
                const targetCol = randInt(0, this.cols - 1);
                const cardA = this.grid[row][col];
                const cardB = this.grid[targetRow][targetCol];
                if (!cardA || !cardB) {
                    continue;
                }
                this.grid[row][col] = cardB;
                this.grid[targetRow][targetCol] = cardA;
                cardA.row = targetRow;
                cardA.col = targetCol;
                cardB.row = row;
                cardB.col = col;
            }
        }
    }

    handleSelection(card) {
        if (!card || !this.canSelect(card)) {
            return { type: 'blocked' };
        }

        if (!this.selectedCard) {
            card.selected = true;
            this.selectedCard = card;
            return { type: 'select', card };
        }

        if (card === this.selectedCard) {
            card.selected = false;
            this.selectedCard = null;
            return { type: 'deselect', card };
        }

        if (card.name === this.selectedCard.name) {
            const first = this.selectedCard;
            first.selected = false;
            card.selected = false;
            this.selectedCard = null;
            return { type: 'match', pair: [first, card], score: card.value };
        }

        const previous = this.selectedCard;
        previous.selected = false;
        card.selected = true;
        this.selectedCard = card;
        return { type: 'switch', card, previous };
    }

    removeCards(cards) {
        cards.forEach((card) => {
            if (!card || card.removed) {
                return;
            }
            card.removed = true;
            this.grid[card.row][card.col] = null;
        });
    }

    addScore(player, score) {
        this.scores[player] += score;
    }
}
