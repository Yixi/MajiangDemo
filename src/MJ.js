/**
 * Author: Yixi
 * Date: 13-2-27
 * Time: 下午11:11
 */

const Util = {
    getEle(selector) {
        return document.querySelector(selector);
    },
    setStyle(dom, attr, value) {
        dom.style[attr] = value;
    },
    setAttr(dom, attr, value) {
        dom[attr] = value;
    }
};

export class MaJiang {
    constructor(selector) {
        this.MJdom = Util.getEle(selector);
        Util.setAttr(this.MJdom, 'width', 800);
        Util.setAttr(this.MJdom, 'height', 700);
        this.Ctx = this.MJdom.getContext('2d');
        this._initcards();
        this._buildDrawInfo();
        this._drawByInfo();
    }

    _initcards() {
        /*生成麻将牌
            a_1_1 a_1_2 a_1_3 a_1_4
        */
        this.cards = [];
        const colo_ = ['a', 'b', 'c'];
        for (let i = 0; i < 3; i++) {
            const p_1 = colo_[i];
            for (let m = 1; m <= 9; m++) {
                for (let n = 1; n <= 4; n++) {
                    this.cards.push(p_1 + '_' + m + '_' + n);
                }
            }
        }
    }

    _buildDrawInfo() {
        this.drawinfo = {};
        let _top = 0;
        let _left = 130;
        for (let i = 0; i < this.cards.length; i++) {
            if (i % 12 == 0) {
                _top += 65;
                _left = 130;
            }
            this.drawinfo[this.cards[i]] = {
                type: 'rect',
                top: _top,
                left: _left
            };

            _left += 45;
        }
    }

    _drawByInfo() {
        for (const key in this.drawinfo) {
            if (!Object.prototype.hasOwnProperty.call(this.drawinfo, key)) {
                continue;
            }
            const info = this.drawinfo[key];
            switch (info.type) {
                case 'rect':
                    this.Ctx.fillStyle = 'rgba(0,0,0,.5)';
                    this.Ctx.fillRect(info.left, info.top, 40, 60);

                    break;
            }
        }
    }
}

export function MJ(selector) {
    return new MaJiang(selector);
}
