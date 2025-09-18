// FIX: Import EvaluatedFunction from types.ts
import type { VisualizationModule, VisualizationInitParams, VisualizationRenderParams, EvaluatedFunction } from '../types';
import { getDerivative } from '../services/functionParser';

type Particle = {
    x: number; y: number;
    vx: number; vy: number;
    life: number;
    trail?: { x: number, y: number }[];
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
        case 'v4':
        case 'v5': { // Curl & Divergence, Topological Portrait
            const particles: Particle[] = [];
            const count = p.particleCount || 150;
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: (Math.random() - 0.5) * width,
                    y: (Math.random() - 0.5) * height,
                    vx: 0, vy: 0, life: 1,
                    trail: []
                });
            }
            return { particles };
        }
        default: { // v0, v1, v2
            const particles: Particle[] = [];
            const count = p.particleCount || 200;
            let wells: any[] = [];
            if (algorithm === 'v2') { // Gravity Wells
                for(let i=0; i < (p.numWells || 5); i++) {
                    wells.push({ x: (i / ((p.numWells || 5) -1) - 0.5) * width * 0.8, y: 0 });
                }
            }
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: (Math.random() - 0.5) * width,
                    y: (Math.random() - 0.5) * height,
                    vx: 0, vy: 0,
                    life: Math.random() * 200,
                    trail: [],
                });
            }
            return { particles, wells };
        }
    }
};

// Helper for numerical derivatives in 2D
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
    const w = width / zoom;
    const h = height / zoom;

    // Use a light effect for trails
    ctx.globalCompositeOperation = 'lighter';

    switch (algorithm) {
        case 'v3': { // Lattice Deformation
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
        case 'v4': { // Curl & Divergence
            const particles: Particle[] = state.particles;
            if (!particles) return;
            
            const fieldStrength = p.fieldStrength || 2.0;
            const trailLength = p.trailLength || 15;
            const glow = p.glow ?? 0;
            const h_deriv = 0.01;

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
            
            // Update and draw particles
            particles.forEach(pt => {
                const xn = pt.x / w;
                const yn = pt.y / h;
                // Corrected particle movement physics
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
        case 'v5': { // Topological Portrait
            const particles: Particle[] = state.particles;
            if (!particles) return;
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
        default: { // Original v0, v1, v2
            const particles: Particle[] = state.particles || [];
            if (algorithm === 'v1') { // Vortex
                const vortexStrength = (p.vortexStrength || 5);
                const radialForce = (p.radialForce || 1);
                const trailLength = p.trailLength ?? 15;
                const glow = p.glow ?? 0;
                
                particles.forEach((pt) => {
                    const dx = pt.x;
                    const dy = pt.y;
                    const dist = Math.hypot(dx, dy) || 1;
                    const angle = Math.atan2(dy, dx);
                    
                    const funcVal = f(dist / 100, t, 1, 1, 1);
                    
                    const tangentialVel = vortexStrength * funcVal / dist;
                    const radialVel = radialForce * (1 - dist / (Math.max(w,h)/2));
                    
                    pt.x += Math.cos(angle + Math.PI/2) * tangentialVel + Math.cos(angle) * radialVel;
                    pt.y += Math.sin(angle + Math.PI/2) * tangentialVel + Math.sin(angle) * radialVel;

                    if (dist > Math.max(w, h) / 2) {
                        pt.x = (Math.random() - 0.5) * 20; pt.y = (Math.random() - 0.5) * 20;
                        pt.trail = [];
                    }
                    
                    if (trailLength > 0) {
                        pt.trail?.push({ x: pt.x, y: pt.y });
                        if (pt.trail && pt.trail.length > trailLength) pt.trail.shift();
                    } else {
                        pt.trail = [];
                    }

                    const color = `hsla(${(dist + t * 50) % 360}, 70%, 60%, 0.8)`;
                    if (glow > 0) {
                        ctx.shadowBlur = 8 / zoom;
                        ctx.shadowColor = color;
                    }

                    if (trailLength > 1 && pt.trail) {
                        ctx.beginPath();
                        pt.trail.forEach((p_trail, i) => {
                            if (i === 0) ctx.moveTo(p_trail.x, p_trail.y);
                            else ctx.lineTo(p_trail.x, p_trail.y);
                        });
                        ctx.strokeStyle = `hsla(${(dist + t * 50) % 360}, 70%, 60%, 0.5)`;
                        ctx.lineWidth = 1 / zoom;
                        ctx.stroke();
                    } else {
                        ctx.beginPath();
                        ctx.arc(pt.x, pt.y, 1 / zoom, 0, Math.PI * 2);
                        ctx.fillStyle = color;
                        ctx.fill();
                    }

                    if (glow > 0) ctx.shadowBlur = 0;
                });

            } else if (algorithm === 'v2') { // Gravity Wells
                const wells = state.wells || [];
                const gravityStrength = (p.gravityStrength || 50) / 1000;
                const trailLength = p.trailLength ?? 5;
                
                wells.forEach((well:any, i:number) => {
                   well.mass = f(i, t, 1, 1, 1);
                });

                particles.forEach((pt) => {
                    let fx = 0, fy = 0;
                    wells.forEach((well:any) => {
                        const dx = well.x - pt.x;
                        const dy = well.y - pt.y;
                        const distSq = dx * dx + dy * dy + 100;
                        const force = gravityStrength * well.mass / distSq;
                        fx += force * dx;
                        fy += force * dy;
                    });
                    
                    pt.vx += fx; pt.vy += fy;
                    pt.vx *= 0.95; pt.vy *= 0.95;
                    pt.x += pt.vx; pt.y += pt.vy;

                    if (pt.x < -w/2 || pt.x > w/2 || pt.y < -h/2 || pt.y > h/2) {
                         pt.x = (Math.random() - 0.5) * w; pt.y = (Math.random() - 0.5) * h;
                         pt.vx = 0; pt.vy = 0;
                         pt.trail = [];
                    }
                    
                    if (trailLength > 0) {
                        pt.trail?.push({ x: pt.x, y: pt.y });
                        if (pt.trail && pt.trail.length > trailLength) pt.trail.shift();
                    } else {
                        pt.trail = [];
                    }

                    if (trailLength > 1 && pt.trail) {
                        ctx.beginPath();
                        pt.trail.forEach((p_trail, i) => {
                            if (i === 0) ctx.moveTo(p_trail.x, p_trail.y);
                            else ctx.lineTo(p_trail.x, p_trail.y);
                        });
                        ctx.strokeStyle = `hsla(${(pt.x / w * 100 + t * 50) % 360}, 70%, 60%, 0.5)`;
                        ctx.lineWidth = 1 / zoom;
                        ctx.stroke();
                    } else {
                        ctx.beginPath();
                        ctx.arc(pt.x, pt.y, 1 / zoom, 0, Math.PI * 2);
                        ctx.fillStyle = `hsla(${(pt.x / w * 100 + t * 50) % 360}, 70%, 60%, 0.8)`;
                        ctx.fill();
                    }
                });
            } else { // v0 - Classic
                const flowSpeed = p.flowSpeed || 1.5;
                const noise = (p.noise || 0.5) * 2;
                const trailLength = p.trailLength ?? 10;
                const glow = p.glow ?? 0;

                particles.forEach((pt) => {
                    const slope = getDerivative(f, pt.x / 100, t, 1, 1, 1);
                    const angle = Math.atan(slope);
                    pt.x += Math.cos(angle) * flowSpeed + (Math.random() - 0.5) * noise;
                    pt.y += Math.sin(angle) * flowSpeed + (Math.random() - 0.5) * noise;
                    pt.life -= 1;

                    if (trailLength > 0) {
                        pt.trail?.push({ x: pt.x, y: pt.y });
                        if (pt.trail && pt.trail.length > trailLength) pt.trail.shift();
                    } else {
                        pt.trail = [];
                    }
                    
                    if (pt.x < -w/2 || pt.x > w/2 || pt.y < -h/2 || pt.y > h/2 || pt.life <= 0) {
                        pt.x = (Math.random() - 0.5) * w; pt.y = (Math.random() - 0.5) * h; pt.life = 200;
                        pt.trail = [];
                    }

                    const color = `hsla(${(pt.x / w * 100 + t * 50) % 360}, 70%, 60%, 0.8)`;
                    if (glow > 0) {
                        ctx.shadowBlur = 8 / zoom;
                        ctx.shadowColor = color;
                    }

                    if (trailLength > 1 && pt.trail) {
                        ctx.beginPath();
                        pt.trail.forEach((p_trail, i) => {
                            if (i === 0) ctx.moveTo(p_trail.x, p_trail.y);
                            else ctx.lineTo(p_trail.x, p_trail.y);
                        });
                        ctx.strokeStyle = `hsla(${(pt.x / w * 100 + t * 50) % 360}, 70%, 60%, 0.5)`;
                        ctx.lineWidth = 1 / zoom;
                        ctx.stroke();
                    } else {
                        ctx.beginPath();
                        ctx.arc(pt.x, pt.y, 1 / zoom, 0, Math.PI * 2);
                        ctx.fillStyle = color;
                        ctx.fill();
                    }
                    
                    if (glow > 0) ctx.shadowBlur = 0;
                });
            }
        }
    }
    // Reset composite operation for other UI elements
    ctx.globalCompositeOperation = 'source-over';
};

export const fluidField: VisualizationModule = {
    init,
    render
};