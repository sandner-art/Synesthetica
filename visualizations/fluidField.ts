import type { VisualizationModule, VisualizationInitParams, VisualizationRenderParams, EvaluatedFunction } from '../types';

type Particle = {
    x: number; y: number;
    vx: number; vy: number;
    life: number;
    trail: { x: number, y: number }[];
};

type GridPoint = {
    ox: number; oy: number; // Original position
    x: number; y: number;
    vx: number; vy: number;
};

const init = (params: VisualizationInitParams) => {
    const { canvas, parameters: p, algorithm } = params;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    switch (algorithm) {
        case 'v3': { // Lattice Deformation
            const grid: GridPoint[][] = [];
            const density = p.gridDensity || 20;
            for (let i = 0; i < density; i++) {
                const row: GridPoint[] = [];
                for (let j = 0; j < density; j++) {
                    const x = (i / (density - 1) - 0.5) * width * 1.2;
                    const y = (j / (density - 1) - 0.5) * height * 1.2;
                    row.push({ ox: x, oy: y, x, y, vx: 0, vy: 0 });
                }
                grid.push(row);
            }
            return { grid };
        }
        case 'v0':
        case 'v1':
        case 'v2':
        case 'v4':
        case 'v5': {
            const particles: Particle[] = [];
            const count = p.particleCount || 1000;
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: (Math.random() - 0.5) * width,
                    y: (Math.random() - 0.5) * height,
                    vx: 0, vy: 0,
                    life: Math.random(),
                    trail: [],
                });
            }
            return { particles };
        }
        default:
             return {};
    }
};

// Helper for numerical derivatives in 2D (for v3, v4, v5)
const getGradient = (func: EvaluatedFunction, x: number, y: number, t: number, scale: number): { dx: number, dy: number } => {
    const h = 0.01;
    // The user's function f(x,t,a,b,c) is being used here with x=spatial_x, t=spatial_y, a=time.
    const f_x_plus_h = func((x + h) / scale, y / scale, t, 1, 1);
    const f_x_minus_h = func((x - h) / scale, y / scale, t, 1, 1);
    const f_y_plus_h = func(x / scale, (y + h) / scale, t, 1, 1);
    const f_y_minus_h = func(x / scale, (y - h) / scale, t, 1, 1);

    return {
        dx: (f_x_plus_h - f_x_minus_h) / (2 * h),
        dy: (f_y_plus_h - f_y_minus_h) / (2 * h)
    };
};

const render = (params: VisualizationRenderParams) => {
    const { ctx, t, f, p, state, width, height, zoom, algorithm } = params;

    ctx.globalCompositeOperation = 'lighter';

    switch (algorithm) {
        case 'v3': { // Lattice Deformation (Unchanged)
            const grid: GridPoint[][] = state.grid;
            if (!grid) return;
            const density = grid.length;
            const scale = p.deformationScale || 1.5;
            const damping = p.damping || 0.92;

            grid.forEach(row => {
                row.forEach(pt => {
                    const { dx, dy } = getGradient(f, pt.x, pt.y, t, 100);
                    const forceX = dx * scale;
                    const forceY = dy * scale;
                    
                    const springX = (pt.ox - pt.x) * 0.1;
                    const springY = (pt.oy - pt.y) * 0.1;

                    pt.vx += forceX + springX;
                    pt.vy += forceY + springY;
                    pt.vx *= damping;
                    pt.vy *= damping;
                    pt.x += pt.vx;
                    pt.y += pt.vy;
                });
            });

            ctx.lineWidth = 1 / zoom;
            for (let i = 0; i < density - 1; i++) {
                for (let j = 0; j < density - 1; j++) {
                    const p1 = grid[i][j];
                    const p2 = grid[i+1][j];
                    const p3 = grid[i][j+1];
                    const speed = Math.hypot(p1.vx, p1.vy);
                    ctx.strokeStyle = `hsla(${180 + speed * 50}, 80%, 70%, 0.7)`;
                    
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p3.x, p3.y);
                    ctx.stroke();
                }
            }
            break;
        }
        case 'v4': { // Curl & Divergence (Unchanged)
            const particles: Particle[] = state.particles;
            if (!particles) return;
            
            const fieldStrength = p.fieldStrength || 2.0;
            const trailLength = p.trailLength || 15;
            const glow = p.glow ?? 0;
            const h_deriv = 0.01;
            const w = width / zoom;
            const h = height / zoom;

            // Draw background field
            const gridSize = 30;
            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    const x = (i / gridSize - 0.5) * w;
                    const y = (j / gridSize - 0.5) * h;
                    const xn = x / w;
                    const yn = y / h;

                    const Vx = (_x:number, _y:number) => f(_x, _y, t, 1, 1) * fieldStrength;
                    const Vy = (_x:number, _y:number) => f(_y, _x, t + 0.5, 1, 1) * fieldStrength;
                    
                    const dvx_dy = (Vx(xn, yn + h_deriv) - Vx(xn, yn - h_deriv)) / (2*h_deriv);
                    const dvy_dx = (Vy(xn + h_deriv, yn) - Vy(xn - h_deriv, yn)) / (2*h_deriv);
                    const curl = dvy_dx - dvx_dy;

                    const dvx_dx = (Vx(xn + h_deriv, yn) - Vx(xn - h_deriv, yn)) / (2*h_deriv);
                    const dvy_dy = (Vy(xn, yn + h_deriv) - Vy(xn, yn - h_deriv)) / (2*h_deriv);
                    const divergence = dvx_dx + dvy_dy;
                    
                    const r = Math.max(0, Math.min(255, 128 + curl * 200));
                    const b = Math.max(0, Math.min(255, 128 - curl * 200));
                    const g = 128 - Math.abs(curl) * 100;
                    const brightness = 0.2 + Math.max(0, Math.min(0.4, divergence * 0.1));
                    
                    ctx.fillStyle = `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${brightness})`;
                    ctx.fillRect(x - (w / gridSize / 2), y - (h / gridSize / 2), w / gridSize, h / gridSize);
                }
            }
            
            particles.forEach(pt => {
                const xn = pt.x / w;
                const yn = pt.y / h;
                pt.x += f(xn, yn, t, 1, 1) * fieldStrength;
                pt.y += f(yn, xn, t + 0.5, 1, 1) * fieldStrength;
                
                pt.trail?.push({x: pt.x, y: pt.y});
                if(pt.trail && pt.trail.length > trailLength) pt.trail.shift();

                const color = `hsla(${(pt.x / w * 100 + t * 50) % 360}, 80%, 70%, 1)`;

                if (glow > 0) {
                    ctx.shadowBlur = 10 / zoom;
                    ctx.shadowColor = color;
                }

                if (trailLength > 1 && pt.trail) {
                    ctx.beginPath();
                    pt.trail.forEach((p_trail, i) => {
                        if(i === 0) ctx.moveTo(p_trail.x, p_trail.y);
                        else ctx.lineTo(p_trail.x, p_trail.y);
                    });
                    ctx.strokeStyle = `hsla(${(pt.x / w * 100 + t * 50) % 360}, 80%, 70%, 0.5)`;
                    ctx.lineWidth = 1 / zoom;
                    ctx.stroke();
                }
                
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 1.5 / zoom, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();

                if (glow > 0) ctx.shadowBlur = 0;

                if (pt.x < -w/2 || pt.x > w/2 || pt.y < -h/2 || pt.y > h/2) {
                    pt.x = (Math.random() - 0.5) * w;
                    pt.y = (Math.random() - 0.5) * h;
                    pt.trail = [];
                }
            });
            break;
        }
        case 'v5': { // Topological Portrait (Unchanged)
            const particles: Particle[] = state.particles;
            if (!particles) return;
            const w = width / zoom;
            const h = height / zoom;
            const fieldStrength = (p.fieldStrength || 2.0) * 5;
            const streamlineLength = p.streamlineLength || 40;
            const colorize = p.colorizeSpeed > 0;
            
            particles.forEach(pt => {
                 const { dx, dy } = getGradient(f, pt.x, pt.y, t, 100);
                 pt.x -= dx * fieldStrength;
                 pt.y -= dy * fieldStrength;

                 pt.trail?.push({x: pt.x, y: pt.y});
                 if (pt.trail && pt.trail.length > streamlineLength) {
                     pt.trail.shift();
                 }

                 if (pt.x < -w/1.8 || pt.x > w/1.8 || pt.y < -h/1.8 || pt.y > h/1.8) {
                    pt.x = (Math.random() - 0.5) * w;
                    pt.y = (Math.random() - 0.5) * h;
                    pt.trail = [];
                 }
            });

            particles.forEach(pt => {
                ctx.beginPath();
                pt.trail?.forEach((pos, i) => {
                     if (i === 0) ctx.moveTo(pos.x, pos.y);
                     else ctx.lineTo(pos.x, pos.y);
                });
                const speed = Math.hypot(pt.x - (pt.trail?.[pt.trail.length-2]?.x ?? pt.x), pt.y - (pt.trail?.[pt.trail.length-2]?.y ?? pt.y));
                const hue = colorize ? 200 + speed * 10 : 200;
                ctx.strokeStyle = `hsla(${hue}, 80%, 70%, 0.4)`;
                ctx.lineWidth = 1.5 / zoom;
                ctx.stroke();
            });
            break;
        }
        default: {
            const particles: Particle[] = state.particles || [];
            const w = width / zoom;
            const h = height / zoom;
            
            if (algorithm === 'v2') {
                const gravityStrength = p.gravityStrength || 50;
                const wellPower = p.wellPower || 75;
                const trailLength = p.trailLength ?? 5;
                const particleSize = p.particleSize || 1.5;

                // 1. Find dynamic wells from function's critical points
                const dynamicWells: { x: number, y: number, mass: number }[] = [];
                const scanPoints = 100;
                const scanStep = w / scanPoints;
                const values = [];
                for (let i = 0; i <= scanPoints; i++) {
                    const x = -w / 2 + i * scanStep;
                    // The y-value on the graph, scaling similar to other modes
                    values.push(f(x / 100, t, 1, 1, 1) * 50); 
                }

                for (let i = 1; i < scanPoints; i++) {
                    const yPrev = values[i-1];
                    const yCurr = values[i];
                    const yNext = values[i+1];
                    const isMin = yCurr < yPrev && yCurr < yNext;
                    const isMax = yCurr > yPrev && yCurr > yNext;

                    if (isMin || isMax) {
                        const x = -w / 2 + i * scanStep;
                        // Mass is proportional to how much the point sticks out from its neighbors.
                        // For minima (attractors), mass > 0. For maxima (repulsors), mass < 0.
                        const mass = ((yPrev + yNext) / 2 - yCurr) * (wellPower / 10);
                        dynamicWells.push({ x: x, y: yCurr, mass: mass });
                    }
                }

                // 2. Draw function curve and wells
                ctx.globalCompositeOperation = 'source-over'; // Draw solid things first
                ctx.lineWidth = 1 / zoom;
                
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(100, 150, 255, 0.2)';
                for (let i = 0; i <= scanPoints; i++) {
                    const x = -w / 2 + i * scanStep;
                    if (i === 0) ctx.moveTo(x, values[i]);
                    else ctx.lineTo(x, values[i]);
                }
                ctx.stroke();

                dynamicWells.forEach(well => {
                    const radius = Math.min(20, 2 + Math.abs(well.mass) * 0.5) / zoom;
                    const isAttractor = well.mass > 0;
                    
                    ctx.beginPath();
                    ctx.arc(well.x, well.y, radius, 0, Math.PI * 2);
                    
                    const gradient = ctx.createRadialGradient(well.x, well.y, 0, well.x, well.y, radius);
                    if (isAttractor) { // Attractor (Minima) - Blue/Cyan
                        gradient.addColorStop(0, 'rgba(150, 220, 255, 0.8)');
                        gradient.addColorStop(1, 'rgba(50, 150, 255, 0)');
                    } else { // Repulsor (Maxima) - Red/Orange
                        gradient.addColorStop(0, 'rgba(255, 200, 150, 0.8)');
                        gradient.addColorStop(1, 'rgba(255, 100, 50, 0)');
                    }
                    ctx.fillStyle = gradient;
                    ctx.fill();
                });
                
                ctx.globalCompositeOperation = 'lighter'; // Switch to additive for particles

                // 3. Update and draw particles
                ctx.lineWidth = particleSize / zoom;
                particles.forEach(pt => {
                    let forceX = 0;
                    let forceY = 0;
                    
                    dynamicWells.forEach(well => {
                        const dx = well.x - pt.x;
                        const dy = well.y - pt.y;
                        const distSq = dx * dx + dy * dy + 100; // Softening factor
                        const force = (gravityStrength * well.mass) / distSq;
                        forceX += force * dx;
                        forceY += force * dy;
                    });
                    
                    const curlAmount = p.curlAmount || 0;
                    if (curlAmount > 0) {
                        const xNorm = pt.x / (w / 2);
                        const yNorm = pt.y / (h / 2);
                        forceX += Math.sin(yNorm * 3.0 + t * 0.5) * curlAmount * 0.1;
                        forceY += Math.cos(xNorm * 3.0 + t * 0.5) * curlAmount * 0.1;
                    }

                    const effectiveSpeed = 0.1 * (p.particleSpeed || 1.0);
                    pt.vx += forceX * effectiveSpeed;
                    pt.vy += forceY * effectiveSpeed;

                    pt.vx *= 0.95; pt.vy *= 0.95; // Damping
                    pt.x += pt.vx; pt.y += pt.vy;
                    
                    pt.trail.push({x: pt.x, y: pt.y});
                    if(pt.trail.length > trailLength) pt.trail.shift();

                    const mag = Math.hypot(pt.vx, pt.vy);
                    const hue = 180 + mag * 20;
                    const alpha = Math.min(0.8, mag * 0.2);
                    
                    if (pt.trail.length > 1) {
                        ctx.beginPath();
                        ctx.moveTo(pt.trail[0].x, pt.trail[0].y);
                        for (let i = 1; i < pt.trail.length; i++) ctx.lineTo(pt.trail[i].x, pt.trail[i].y);
                        ctx.strokeStyle = `hsla(${hue}, 80%, 70%, ${alpha})`;
                        ctx.stroke();
                    }

                    pt.life -= 0.001;
                    if (pt.life <= 0 || Math.abs(pt.x) > w/1.8 || Math.abs(pt.y) > h/1.8) {
                        pt.x = (Math.random() - 0.5) * w;
                        pt.y = (Math.random() - 0.5) * h;
                        pt.vx = 0; pt.vy = 0;
                        pt.trail = []; pt.life = 1;
                    }
                });

            } else { // Logic for v0, v1
                const particleSpeed = p.particleSpeed || 1.0;
                const particleSize = p.particleSize || 1.5;
                const trailLength = p.trailLength ?? 10;
                const curlAmount = p.curlAmount || 0;
                const noise = p.noise || 0;

                ctx.lineWidth = particleSize / zoom;

                particles.forEach(pt => {
                    const xNorm = pt.x / (w / 2);
                    const yNorm = pt.y / (h / 2);
                    
                    let forceX = 0; let forceY = 0;
                    
                    if (algorithm === 'v1') { // Vortex
                        const vortexStrength = p.vortexStrength || 5;
                        forceX += f(yNorm, t, 1, 1, 1) * vortexStrength;
                        forceY += -f(xNorm, t, 1, 1, 1) * vortexStrength;
                    } else { // v0 - Classic
                        forceX += f(xNorm, t, 1, 1, 1);
                        forceY += f(yNorm, t + 0.5, 1, 1, 1);
                    }

                    if (curlAmount > 0) {
                        forceX += Math.sin(yNorm * 3.0 + t * 0.5) * curlAmount;
                        forceY += Math.cos(xNorm * 3.0 + t * 0.5) * curlAmount;
                    }
                    
                    const effectiveSpeed = 0.1 * particleSpeed;
                    pt.vx += forceX * effectiveSpeed + (Math.random() - 0.5) * noise;
                    pt.vy += forceY * effectiveSpeed + (Math.random() - 0.5) * noise;
                    pt.vx *= 0.95; pt.vy *= 0.95;
                    pt.x += pt.vx; pt.y += pt.vy;
                    
                    pt.trail.push({x: pt.x, y: pt.y});
                    if(pt.trail.length > trailLength) pt.trail.shift();

                    const mag = Math.hypot(pt.vx, pt.vy);
                    const hue = 180 + mag * 20;
                    const alpha = Math.min(0.8, mag * 0.2);
                    
                    if (pt.trail.length > 1) {
                        ctx.beginPath();
                        ctx.moveTo(pt.trail[0].x, pt.trail[0].y);
                        for (let i = 1; i < pt.trail.length; i++) ctx.lineTo(pt.trail[i].x, pt.trail[i].y);
                        ctx.strokeStyle = `hsla(${hue}, 80%, 70%, ${alpha})`;
                        ctx.stroke();
                    }

                    pt.life -= 0.001;
                    if (pt.life <= 0 || Math.abs(pt.x) > w/1.8 || Math.abs(pt.y) > h/1.8) {
                        pt.x = (Math.random() - 0.5) * w;
                        pt.y = (Math.random() - 0.5) * h;
                        pt.vx = 0; pt.vy = 0;
                        pt.trail = []; pt.life = 1;
                    }
                });
            }
            break;
        }
    }
    // Reset composite operation for other UI elements
    ctx.globalCompositeOperation = 'source-over';
};

export const fluidField: VisualizationModule = {
    init,
    render
};