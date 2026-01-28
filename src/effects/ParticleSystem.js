import { randRange } from '../utils/math.js';

export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    reset() {
        this.particles = [];
    }

    emitBurst({ x, y, count, spread, speed, gravity, drag, size, life, colors }) {
        for (let i = 0; i < count; i++) {
            const angle = randRange(-Math.PI * spread, Math.PI * spread);
            const velocity = randRange(speed * 0.5, speed);
            const particle = {
                x,
                y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity * 0.6,
                gravity,
                drag,
                size: randRange(size[0], size[1]),
                life: randRange(life[0], life[1]),
                age: 0,
                rotation: randRange(0, Math.PI * 2),
                spin: randRange(-6, 6),
                color: colors[Math.floor(randRange(0, colors.length))]
            };
            this.particles.push(particle);
        }
    }

    update(dt) {
        this.particles = this.particles.filter((particle) => {
            particle.age += dt;
            particle.vx *= 1 - particle.drag * dt;
            particle.vy *= 1 - particle.drag * dt;
            particle.vy += particle.gravity * dt;
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            particle.rotation += particle.spin * dt;
            return particle.age < particle.life;
        });
    }

    render(ctx) {
        ctx.save();
        this.particles.forEach((particle) => {
            const t = particle.age / particle.life;
            const alpha = 1 - t;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);
            ctx.fillStyle = particle.color;
            ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.6);
            ctx.restore();
        });
        ctx.restore();
    }
}
