import { randRange } from '../utils/math.js';

export function createNoiseTexture(size = 256, alpha = 0.08) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(size, size);
    for (let i = 0; i < imageData.data.length; i += 4) {
        const value = Math.floor(randRange(140, 255));
        imageData.data[i] = value;
        imageData.data[i + 1] = value;
        imageData.data[i + 2] = value;
        imageData.data[i + 3] = Math.floor(alpha * 255);
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

export function createWoodTexture(width = 512, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#4a3022');
    gradient.addColorStop(0.5, '#3a271c');
    gradient.addColorStop(1, '#2b1a12');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 60; i++) {
        const y = randRange(0, height);
        const thickness = randRange(8, 22);
        ctx.strokeStyle = `rgba(20, 12, 9, ${randRange(0.08, 0.18)})`;
        ctx.lineWidth = thickness;
        ctx.beginPath();
        ctx.moveTo(-20, y);
        ctx.bezierCurveTo(width * 0.25, y + randRange(-20, 20), width * 0.75, y + randRange(-20, 20), width + 20, y + randRange(-10, 10));
        ctx.stroke();
    }

    ctx.globalAlpha = 0.15;
    ctx.drawImage(createNoiseTexture(256, 0.12), 0, 0, width, height);
    ctx.globalAlpha = 1;

    return canvas;
}

export function createPaperTexture(width = 128, height = 128) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f5eddc';
    ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = 0.08;
    ctx.drawImage(createNoiseTexture(128, 0.2), 0, 0, width, height);
    ctx.globalAlpha = 1;

    return canvas;
}
