import type { VisualizationModule, VisualizationInitParams, VisualizationRenderParams } from '../types';

const ZEROS = [14.13, 21.02, 25.01, 30.42, 32.93, 37.58, 40.91, 43.32, 48.00, 49.77, 52.94, 56.44, 59.34, 60.83, 65.11, 67.07, 69.54, 72.06, 75.70, 77.14];

type Particle = { x: number; y: number; vx: number; energy: number; color: string; };

const init = (params: VisualizationInitParams) => {
    const { canvas, parameters: p, algorithm } = params;
    const rect = canvas.getBoundingClientRect();

    if (algorithm === 'v2') { // Scattering Landscape
        const particles: Particle[] = [];
        const count = p.particles || 50;
        const energyScale = p.energyScale || 1.0;
        for (let i = 0; i < count; i++) {
            const energy = ZEROS[i % ZEROS.length] * energyScale;
            particles.push({
                x: -rect.width / 2 - Math.random() * 100,
                y: (Math.random() - 0.5) * rect.height * 0.8,
                vx: 2 + Math.random() * 2,
                energy: energy,
                color: `hsl(${200 + energy * 2}, 80%, 70%)`,
            });
        }
        return { particles };
    }
    return {};
};

const render = (params: VisualizationRenderParams) => {
    const { ctx, t, f, p, state, width, height, zoom, algorithm } = params;
    
    switch(algorithm) {
        case 'v1': { // Resonant String
            const numZeros = p.numZeros || 20;
            const amplitude = p.amplitude || 80;
            const spread = p.spread || 5;
            const halfWidth = width / 2 / zoom;

            // Draw central string
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1 / zoom;
            ctx.beginPath();
            ctx.moveTo(0, -height/2/zoom);
            ctx.lineTo(0, height/2/zoom);
            ctx.stroke();

            for (let i = 0; i < numZeros; i++) {
                const y = ZEROS[i] * spread;
                const funcVal = f(y / 100, t, 1, 1, 1);
                const currentAmplitude = funcVal * amplitude;
                
                // Draw mode for positive y
                ctx.beginPath();
                ctx.moveTo(-halfWidth, y);
                for (let x = -halfWidth; x <= halfWidth; x += 5) {
                    const wave = Math.sin((x + halfWidth) / (halfWidth * 2) * Math.PI) * currentAmplitude;
                    ctx.lineTo(x, y - wave);
                }
                ctx.strokeStyle = `hsla(${180 + y/2}, 80%, 70%, 0.9)`;
                ctx.stroke();
                
                // Draw mode for negative y
                ctx.beginPath();
                ctx.moveTo(-halfWidth, -y);
                 for (let x = -halfWidth; x <= halfWidth; x += 5) {
                    const wave = Math.sin((x + halfWidth) / (halfWidth * 2) * Math.PI) * currentAmplitude;
                    ctx.lineTo(x, -y + wave);
                }
                ctx.stroke();
            }
            break;
        }
        case 'v2': { // Scattering Landscape
            const particles: Particle[] = state.particles;
            if (!particles) break;
            const potentialAmp = p.potentialAmp || 50;
            const halfWidth = width / 2 / zoom;

            // Draw potential
            ctx.beginPath();
            ctx.moveTo(-halfWidth, 0);
            for (let x = -halfWidth; x <= halfWidth; x += 5) {
                const V = f(x/100, t, 1, 1, 1) * potentialAmp;
                ctx.lineTo(x, -V); // Negative to make positive values go up
            }
            ctx.strokeStyle = `rgba(100, 150, 255, 0.6)`;
            ctx.lineWidth = 1.5 / zoom;
            ctx.stroke();

            // Update and draw particles
            particles.forEach(pt => {
                const V = f(pt.x/100, t, 1, 1, 1) * potentialAmp;
                if (pt.energy < V && Math.sign(pt.vx) === Math.sign(pt.x)) {
                    pt.vx *= -1; // Reflect
                }
                pt.x += pt.vx;

                if (pt.x > halfWidth || pt.x < -halfWidth * 1.5) {
                    pt.x = -halfWidth - Math.random() * 100;
                    pt.vx = Math.abs(pt.vx);
                }
                
                ctx.fillStyle = pt.color;
                ctx.beginPath();
                ctx.arc(pt.x, -pt.energy*0.5, 2/zoom, 0, Math.PI * 2);
                ctx.fill();
            });
            break;
        }
        case 'v3': { // Phase Shift Resonances
            const numZeros = p.numZeros || 8;
            const spread = p.spread || 20;
            const phaseMod = p.phaseMod || 2.0;
            
            for (let i = 0; i < numZeros; i++) {
                const energy = ZEROS[i];
                const radius = energy * spread / zoom;
                const funcVal = f(energy / 10, t, 1, 1, 1);
                const phaseShift = funcVal * phaseMod;
                const numLobes = Math.floor(energy / 5);

                ctx.beginPath();
                for (let angle = 0; angle <= Math.PI * 2; angle += 0.02) {
                    const r_offset = Math.sin(angle * numLobes + phaseShift) * radius * 0.1;
                    const r = radius + r_offset;
                    const x = Math.cos(angle) * r;
                    const y = Math.sin(angle) * r;
                    if (angle === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                const opacity = Math.max(0.1, Math.abs(funcVal));
                ctx.strokeStyle = `hsla(${180 + energy * 3}, 80%, 70%, ${opacity})`;
                ctx.lineWidth = 1.5 / zoom;
                ctx.stroke();
            }
            break;
        }
        default: { // v0 - Point Scattering
            const halfHeight = height / 2 / zoom;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1 / zoom;
            ctx.beginPath();
            ctx.moveTo(0, -halfHeight);
            ctx.lineTo(0, halfHeight);
            ctx.stroke();

            for (let i = 0; i < (p.density || 400); i++) {
                const yDrift = Math.sin(t * 0.1 + i) * 10;
                const baseZeroY = ZEROS[i % ZEROS.length] * (p.spread||5) * (1 + Math.floor(i / ZEROS.length) * 0.5);
                const zeroY = baseZeroY + yDrift;
                const x = f(zeroY / 100, t, 1, 1, 1) * 30;
                const size = 2 + Math.sin(t * 2 + zeroY * 0.1) * 1.5;
                
                ctx.fillStyle = `hsla(${180 + zeroY % 180}, 80%, 70%, 0.8)`;
                ctx.beginPath();
                ctx.arc(x, zeroY, size, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x, -zeroY, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
};

export const zeta: VisualizationModule = {
    init,
    render
};