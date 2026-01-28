export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function lerp(start, end, t) {
    return start + (end - start) * t;
}

export function smoothStep(t) {
    return t * t * (3 - 2 * t);
}

export function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

export function approach(current, target, speed, dt) {
    const t = 1 - Math.pow(1 - speed, dt * 60);
    return current + (target - current) * t;
}

export function randRange(min, max) {
    return min + Math.random() * (max - min);
}

export function randInt(min, max) {
    return Math.floor(randRange(min, max + 1));
}
