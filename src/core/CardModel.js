export class CardModel {
    constructor({ id, name, value, row, col }) {
        this.id = id;
        this.name = name;
        this.value = value;
        this.row = row;
        this.col = col;
        this.selected = false;
        this.removed = false;
        this.view = {
            x: 0,
            y: 0,
            lift: 0,
            hover: 0,
            scale: 1,
            alpha: 1,
            wobble: 0
        };
    }

    get spriteKey() {
        return this.name + '.png';
    }
}
