import type { VisualizationModule, VisualizationInitParams, VisualizationRenderParams } from '../types';

type TrailPoint = { x: number; y: number; z: number };
type Particle = { x: number; y: number };

const init = (params: VisualizationInitParams) => {
    const { parameters: p, algorithm } = params;
    
    if (algorithm === 'v2') { // De Jong
        const count = p.points || 2000;
        const particles: Particle[] = [];
        for (let i = 0; i < count; i++) {
            particles.push({ x: Math.random() * 4 - 2, y: Math.random() * 4 - 2 });
        }
        return { particles };
    } else { // Lorenz, Rössler
        const trail: TrailPoint[] = [{ x: 0.1, y: 0, z: 0 }];
        return { trail };
    }
};

const render = (params: VisualizationRenderParams) => {
    const { ctx, t, f, p, state, zoom, rotation, algorithm } = params;

    ctx.globalCompositeOperation = 'lighter';

    if (algorithm === 'v2') { // De Jong discrete map
        const { particles } = state;
        const scale = 150;
        const funcVal = f(0, t, 1, 1, 1);
        
        const a = (p.a ?? 1.4) + funcVal * 0.1;
        const b = p.b ?? -2.3;
        const c = p.c ?? 2.4;
        const d = p.d ?? -2.1;

        particles.forEach((pt: Particle) => {
            const { x, y } = pt;
            pt.x = Math.sin(a * y) - Math.cos(b * x);
            pt.y = Math.sin(c * x) - Math.cos(d * y);
            
            ctx.beginPath();
            ctx.arc(pt.x * scale, pt.y * scale, 0.5 / zoom, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${(Math.hypot(pt.x, pt.y) * 20 + t * 50) % 360}, 80%, 70%, 0.2)`;
            ctx.fill();
        });

    } else { // Continuous attractors (Lorenz, Rössler)
        const { trail } = state;
        const trailLength = p.points || 1000;
        const iterationsPerFrame = 5;

        for (let i = 0; i < iterationsPerFrame; i++) {
            const lastPt = trail[trail.length - 1];
            let nextPt = { ...lastPt };
            
            if (algorithm === 'v0') { // Lorenz
                const sigma = p.sigma ?? 10;
                const rho = p.rho ?? 28;
                const beta = p.beta ?? 8/3;
                const funcVal = f(lastPt.z / 30, t, 1, 1, 1); // Normalize z for function input
                const dt = 0.01 * (1 + funcVal * 0.2); // Function modulates speed
                
                const dx = sigma * (lastPt.y - lastPt.x);
                const dy = lastPt.x * (rho - lastPt.z) - lastPt.y;
                const dz = lastPt.x * lastPt.y - beta * lastPt.z;
                
                nextPt.x += dx * dt;
                nextPt.y += dy * dt;
                nextPt.z += dz * dt;
            } else { // Rössler
                const a = p.a ?? 0.2;
                const b = p.b ?? 0.2;
                const c_base = p.c ?? 5.7;
                const funcVal = f(lastPt.x / 10, t, 1, 1, 1);
                const c = c_base + funcVal * 2; // Function modulates 'c' parameter
                const dt = 0.02;

                const dx = -lastPt.y - lastPt.z;
                const dy = lastPt.x + a * lastPt.y;
                const dz = b + lastPt.z * (lastPt.x - c);

                nextPt.x += dx * dt;
                nextPt.y += dy * dt;
                nextPt.z += dz * dt;
            }
            trail.push(nextPt);
        }

        while (trail.length > trailLength) {
            trail.shift();
        }

        const scale = algorithm === 'v0' ? 10 : 20;
        
        ctx.beginPath();
        trail.forEach((pt, i) => {
            // Basic 3D projection
            const perspective = 1 + pt.z / 50;
            const screenX = pt.x * scale * perspective;
            const screenY = pt.y * scale * perspective;
            const yRotated = screenY * Math.cos(rotation.x) - (pt.z * scale) * Math.sin(rotation.x);

            if (i === 0) {
                ctx.moveTo(screenX, yRotated);
            } else {
                ctx.lineTo(screenX, yRotated);
            }
        });
        
        const gradient = ctx.createLinearGradient(0, -150, 0, 150);
        gradient.addColorStop(0, `hsla(${(t*50)%360}, 90%, 70%, 0.1)`);
        gradient.addColorStop(1, `hsla(${(t*50 + 60)%360}, 90%, 70%, 0.8)`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1 / zoom;
        ctx.stroke();
    }
    
    ctx.globalCompositeOperation = 'source-over';
};

export const attractor: VisualizationModule = {
    init,
    render,
};