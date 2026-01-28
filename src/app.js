import './style.css';
import { GameApp } from './GameApp.js';

const canvas = document.getElementById('game-canvas');
const stage = document.querySelector('.stage');

if (canvas && stage) {
    new GameApp({ canvas, stage });
}
