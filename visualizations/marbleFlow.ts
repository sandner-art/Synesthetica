import type { VisualizationModule, VisualizationInitParams, VisualizationRenderParams } from '../types';
import { getDerivative } from '../services/functionParser';

const init = (params: VisualizationInitParams) => {
    const { canvas, parameters: p } = params;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    
    const marbles = [];
    const count = p.marbles || 20;
    for (let i = 0; i < count; i++) {
        marbles.push({
            x: (Math.random() - 0.5) * width * 0.8,
            vx: (Math.random() - 0.5) * 1,
            y: 0,
            color: `hsl(${i * (360 / count)}, 80%, 70%)`,
        });
    }
    return { particles: marbles };
};

const render = (params: VisualizationRenderParams) => {
    const { ctx, t, f, p, state, width, zoom } = params;

    const particles = state.particles || [];
    const w = width / zoom;
    const gravity = p.gravity || 0.2;
    const damping = 1 - (p.damping || 0.05);

    // Draw the function curve
    ctx.beginPath();
    ctx.strokeStyle = `hsla(200, 50%, 50%, 0.5)`;
    ctx.lineWidth = 1 / zoom;
    const step = 5;
    for (let i = -w / 2; i <= w / 2; i += step) {
        const y = f(i / 100, t, 1, 1, 1) * 50;
        if (i === -w / 2) {
            ctx.moveTo(i, y);
        } else {
            ctx.lineTo(i, y);
        }
    }
    ctx.stroke();

    // Update and draw marbles
    particles.forEach((marble: any) => {
        const slope = getDerivative(f, marble.x / 100, t, 1, 1, 1);
        const angle = Math.atan(slope);
        const force_x = gravity * Math.sin(angle) * Math.cos(angle);
        
        marble.vx += force_x;
        marble.vx *= damping;
        marble.x += marble.vx;

        marble.y = f(marble.x / 100, t, 1, 1, 1) * 50;

        if (marble.x < -w / 2 || marble.x > w / 2) {
            marble.x = (Math.random() - 0.5) * w * 0.8;
            marble.vx = (Math.random() - 0.5) * 1;
        }

        ctx.beginPath();
        ctx.arc(marble.x, marble.y, 4 / zoom, 0, Math.PI * 2);
        ctx.fillStyle = marble.color;
        ctx.fill();
    });
};

export const marbleFlow: VisualizationModule = {
    init,
    render
};