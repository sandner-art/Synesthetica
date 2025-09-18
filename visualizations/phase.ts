import type { VisualizationModule, VisualizationInitParams, VisualizationRenderParams } from '../types';

type Oscillator = {
    phase: number;
    freq: number;
};

type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    trail: {x: number, y: number}[];
};

const init = (params: VisualizationInitParams) => {
    const { canvas, parameters: p, algorithm } = params;
    const rect = canvas.getBoundingClientRect();

    if (algorithm === 'v2') { // Phase Portrait
        const particles: Particle[] = [];
        const count = p.particles || 100;
        for (let i = 0; i < count; i++) {
            particles.push({
                x: (Math.random() - 0.5) * rect.width,
                y: (Math.random() - 0.5) * rect.height,
                vx: 0,
                vy: 0,
                trail: []
            });
        }
        return { particles };
    }

    if (algorithm === 'v3') { // Coupled Oscillators
        const oscillators: Oscillator[] = [];
        const count = p.oscillators || 30;
        for (let i = 0; i < count; i++) {
            oscillators.push({
                phase: Math.random() * Math.PI * 2,
                freq: 1.0,
            });
        }
        return { oscillators };
    }

    return {}; // For v0 and v1 which are stateless or simple init
};

const render = (params: VisualizationRenderParams) => {
    const { ctx, t, f, p, state, width, height, zoom, algorithm } = params;

    switch (algorithm) {
        case 'v1': { // Lissajous Field
            const gridSize = p.gridSize || 5;
            const baseFreq = p.baseFreq || 2.0;
            const amplitude = p.amplitude || 40;

            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    const cx = (i / (gridSize - 1) - 0.5) * width * 0.8 / zoom;
                    const cy = (j / (gridSize - 1) - 0.5) * height * 0.8 / zoom;
                    
                    const funcVal = f(cx / width, t, 1, 1, 1);
                    const freqX = baseFreq;
                    const freqY = baseFreq + funcVal;

                    ctx.beginPath();
                    for (let angle = 0; angle <= Math.PI * 2.05; angle += 0.05) {
                        const x = cx + Math.sin(angle * freqX + t) * amplitude / zoom;
                        const y = cy + Math.cos(angle * freqY + t) * amplitude / zoom;
                        if (angle === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.strokeStyle = `hsla(${180 + funcVal * 100}, 80%, 70%, 0.8)`;
                    ctx.lineWidth = 1.5 / zoom;
                    ctx.stroke();
                }
            }
            break;
        }

        case 'v2': { // Phase Portrait
            const particles: Particle[] = state.particles || [];
            const stiffness = p.stiffness || 1.0;
            const damping = p.damping || 0.1;
            const force = p.force || 1.0;
            const dt = 0.05;
            
            particles.forEach(pt => {
                const radius = Math.hypot(pt.x, pt.y);
                const angle = Math.atan2(pt.y, pt.x);
                
                const funcVal = f(radius / 100, t, 1, 1, 1) * force * 10;
                const force_x = funcVal * Math.cos(angle);
                const force_y = funcVal * Math.sin(angle);
                
                const ax = (-stiffness * 0.01 * pt.x - damping * pt.vx + force_x) * dt;
                const ay = (-stiffness * 0.01 * pt.y - damping * pt.vy + force_y) * dt;

                pt.vx += ax;
                pt.vy += ay;
                pt.x += pt.vx;
                pt.y += pt.vy;

                pt.trail.push({x: pt.x, y: pt.y});
                if (pt.trail.length > 20) pt.trail.shift();

                if (Math.hypot(pt.x, pt.y) > Math.max(width, height) / 1.5 / zoom) {
                    pt.x = (Math.random() - 0.5) * width / zoom * 0.5;
                    pt.y = (Math.random() - 0.5) * height / zoom * 0.5;
                    pt.vx = 0; pt.vy = 0;
                    pt.trail = [];
                }
            });

            ctx.lineWidth = 1 / zoom;
            particles.forEach(pt => {
                ctx.beginPath();
                pt.trail.forEach((pos, i) => {
                    if (i === 0) ctx.moveTo(pos.x, pos.y);
                    else ctx.lineTo(pos.x, pos.y);
                });
                const speed = Math.hypot(pt.vx, pt.vy);
                ctx.strokeStyle = `hsla(${200 + speed * 2}, 80%, 70%, 0.5)`;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 2 / zoom, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${200 + speed * 2}, 80%, 70%, 1)`;
                ctx.fill();
            });
            break;
        }

        case 'v3': { // Coupled Oscillators
            const oscillators: Oscillator[] = state.oscillators || [];
            const count = oscillators.length;
            if (count === 0) break;

            const coupling = (p.coupling || 0.5) / count;
            const freqMod = p.freqMod || 1.0;
            const radius = Math.min(width, height) * 0.35 / zoom;
            const dt = 0.016;

            const newPhases = oscillators.map(o => o.phase);

            oscillators.forEach((osc, i) => {
                const naturalFreq = 1.0 + f(i / count, t, 1, 1, 1) * freqMod;
                
                let couplingTerm = 0;
                for (let j = 0; j < count; j++) {
                    if (i !== j) {
                        couplingTerm += Math.sin(oscillators[j].phase - osc.phase);
                    }
                }
                
                const dPhase = (naturalFreq + coupling * couplingTerm) * dt * 5;
                newPhases[i] = (osc.phase + dPhase) % (Math.PI * 2);
            });

            oscillators.forEach((osc, i) => {
                osc.phase = newPhases[i];
                const angle = (i / count) * Math.PI * 2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                const hue = (osc.phase / (Math.PI * 2)) * 360;
                ctx.beginPath();
                ctx.arc(x, y, 5 / zoom, 0, Math.PI * 2);
                ctx.fillStyle = `hsl(${hue}, 90%, 70%)`;
                ctx.fill();

                // Draw coupling lines for nearby phases
                for (let j = i + 1; j < count; j++) {
                    const phaseDiff = Math.abs(osc.phase - oscillators[j].phase);
                    if (Math.min(phaseDiff, Math.PI * 2 - phaseDiff) < 0.5) {
                        const nextAngle = (j / count) * Math.PI * 2;
                        const nx = Math.cos(nextAngle) * radius;
                        const ny = Math.sin(nextAngle) * radius;
                        ctx.beginPath();
                        ctx.moveTo(x,y);
                        ctx.lineTo(nx, ny);
                        ctx.strokeStyle = `hsla(${hue}, 90%, 70%, 0.2)`;
                        ctx.lineWidth = 1 / zoom;
                        ctx.stroke();
                    }
                }
            });
            break;
        }

        default: { // v0 - Polar Orbits
            const numParticles = p.particles || 20;
            for (let i = 0; i < numParticles; i++) {
                const angle = (i / numParticles) * Math.PI * 2 + t * 0.5;
                const radius = (p.radius || 80) + f(angle / Math.PI - 1, t, 1, 1, 1) * 30; // map angle to [-1, 1] for f
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                ctx.fillStyle = `hsla(${320 + i * (360/numParticles)}, 90%, 65%, 0.8)`;
                ctx.beginPath();
                ctx.arc(x, y, 4 / zoom, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
        }
    }
};

export const phase: VisualizationModule = {
    init,
    render,
};