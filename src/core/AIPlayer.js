import { randInt } from '../utils/math.js';

export class AIPlayer {
    constructor({ mistakeChance = 0.3, feintChance = 0.18 } = {}) {
        this.mistakeChance = mistakeChance;
        this.feintChance = feintChance;
    }

    planTurn(state) {
        const pairs = state.getPairs();
        if (!pairs.length) {
            return null;
        }

        pairs.sort((a, b) => b.score - a.score);
        const complexity = pairs.length;
        const mistakeChance = complexity > 8 ? this.mistakeChance + 0.08 : this.mistakeChance;
        const takeMistake = Math.random() < mistakeChance;

        let pickIndex = 0;
        if (takeMistake && pairs.length > 3) {
            pickIndex = randInt(Math.floor(pairs.length * 0.45), pairs.length - 1);
        } else {
            const topCount = Math.min(3, pairs.length);
            pickIndex = randInt(0, topCount - 1);
        }

        const chosenPair = pairs[pickIndex];
        const plan = {
            pair: chosenPair,
            feint: null,
            isMistake: takeMistake
        };

        if (Math.random() < this.feintChance) {
            const selectable = state.getSelectableCards();
            const candidates = selectable.filter((card) =>
                card !== chosenPair.a && card !== chosenPair.b
            );
            if (candidates.length > 0) {
                plan.feint = candidates[randInt(0, candidates.length - 1)];
            }
        }

        return plan;
    }
}
