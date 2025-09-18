import type { VisualizationModule, VisualizationInitParams, VisualizationRenderParams } from '../types';
import { PALETTES } from './utils';

type Point = { x: number; y: number; id: number; };
type Edge = { i: number; j: number; dist: number; };

const init = (params: VisualizationInitParams) => {
    const { canvas, parameters: p, algorithm } = params;
    const rect = canvas.getBoundingClientRect();

    if (algorithm === 'v1') { // Density Cloud
        const numPoints = p.points || 50;
        const range = 200; // Keep this internal range consistent
        const particles: Point[] = [];
        for (let i = 0; i < numPoints; i++) {
            particles.push({
                x: (Math.random() - 0.5) * range * 2,
                y: (Math.random() - 0.5) * range * 2,
                id: i,
            });
        }
        return { particles };
    }

    if (algorithm === 'v3') { // Persistence Barcodes
        const numPoints = p.points || 40;
        const noise = p.noise || 0.1;
        const points: Point[] = [];
        for (let i = 0; i < numPoints; i++) {
            const x = (Math.random() - 0.5) * rect.width * 0.8;
            const y = (Math.random() - 0.5) * rect.height * 0.8;
            points.push({ x: x + (Math.random()-0.5) * noise * 200, y: y + (Math.random()-0.5) * noise * 200, id: i });
        }

        // --- Simplified Persistence Algorithm ---
        const edges: Edge[] = [];
        for (let i = 0; i < numPoints; i++) {
            for (let j = i + 1; j < numPoints; j++) {
                edges.push({ i, j, dist: Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y) });
            }
        }
        edges.sort((a, b) => a.dist - b.dist);

        const parent = Array.from({ length: numPoints }, (_, i) => i);
        const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
        const union = (i: number, j: number) => {
            const rootI = find(i);
            const rootJ = find(j);
            if (rootI !== rootJ) parent[rootI] = rootJ;
        };

        const barcodes0: { birth: number, death: number }[] = Array.from({ length: numPoints }, () => ({ birth: 0, death: Infinity }));
        const barcodes1: { birth: number, death: number }[] = [];

        edges.forEach(edge => {
            const rootI = find(edge.i);
            const rootJ = find(edge.j);
            if (rootI !== rootJ) {
                const deathTime = edge.dist;
                // The component born later dies first
                if (barcodes0[rootI].birth < barcodes0[rootJ].birth) {
                    barcodes0[rootJ].death = deathTime;
                } else {
                    barcodes0[rootI].death = deathTime;
                }
                union(edge.i, edge.j);
            } else {
                // This edge creates a cycle (H1 feature)
                 barcodes1.push({ birth: edge.dist, death: edge.dist + (p.maxRadius || 100) * (0.2 + Math.random() * 0.8) }); // Fake death time for visualization
            }
        });
        
        return { points, barcodes0, barcodes1 };
    }
    
    // For V0, V2
    return {};
};


const render = (params: VisualizationRenderParams) => {
    const { ctx, t, f, p, state, width, height, zoom, algorithm } = params;

    switch(algorithm) {
        case 'v0': { // Classic Graph
            const points: Point[] = [];
            const range = p.range || 200;
            const numPoints = p.points || 60;
            const amplitude = p.amplitude || 50;

            for (let i = 0; i < numPoints; i++) {
                const x = (i / (numPoints-1) - 0.5) * range;
                const y = f(x / 100, t, 1, 1, 1) * amplitude;
                points.push({ x, y, id: i });
            }
            renderFiltration(ctx, t, p, points);
            break;
        }
        case 'v1': { // Density Cloud
            if (!state.particles) {
                const numPoints = p.points || 50;
                state.particles = Array.from({length: numPoints}, (_, i) => ({x: 0, y: 0, id: i}));
            }
            
            const particles: Point[] = state.particles;
            const range = 200;
            const updateCount = p.updateRate || 10;

            for(let i = 0; i < updateCount; i++) {
                if (particles.length > 0) {
                    const idx = Math.floor(Math.random() * particles.length);
                    const x = (Math.random() - 0.5) * range * 2;
                    const yNorm = Math.abs(f(x / 100, t, 1, 1, 1));
                    const y = (Math.random() - 0.5) * range * (2 - Math.min(1.9, yNorm)); // Clamp yNorm to prevent zero range
                    particles[idx] = { x, y, id: idx };
                }
            }
            
            renderFiltration(ctx, t, p, particles);
            break;
        }
        case 'v2': { // Level Set Filtration
            const gridSize = p.gridSize || 50;
            const noise = p.noise || 0.2;
            const field = [];
            
            for(let i=0; i < gridSize; i++) {
                const row = [];
                for(let j=0; j < gridSize; j++) {
                    const xNorm = i / gridSize - 0.5;
                    const yNorm = j / gridSize - 0.5;
                    const val = f(xNorm * 2, t + Math.hypot(xNorm, yNorm), 1, 1, 1) + (Math.random()-0.5) * noise;
                    row.push(val);
                }
                field.push(row);
            }

            const threshold = Math.sin(t * (p.filtrationSpeed || 20) / 20);

            const cellW = width / gridSize / zoom;
            const cellH = height / gridSize / zoom;

            for(let i=0; i < gridSize; i++) {
                for(let j=0; j < gridSize; j++) {
                    if (field[i][j] > threshold) {
                        const x = (i/gridSize - 0.5) * width / zoom;
                        const y = (j/gridSize - 0.5) * height / zoom;
                        
                        const v = Math.min(1, (field[i][j] - threshold) * 0.5);
                        const color = PALETTES[p.palette || 0](v, t);
                        ctx.fillStyle = `${color.slice(0, -1)}, 0.8)`;
                        ctx.fillRect(x - cellW/2, y - cellH/2, cellW, cellH);
                    }
                }
            }
            break;
        }
        case 'v3': { // Persistence Barcodes
            const { points, barcodes0, barcodes1 } = state;
            if (!points || !barcodes0 || !barcodes1) return;

            const maxRadius = p.maxRadius || 100;
            const filtrationRadius = (Math.sin(t * 0.2) * 0.5 + 0.5) * maxRadius;

            // 1. Draw point cloud and filtration
            renderFiltration(ctx, t, { filtrationSpeed: 10, ...p }, points, filtrationRadius);

            // 2. Draw barcode plot on the side
            ctx.save();
            ctx.translate(width/2 / zoom * 0.8, -height/2 / zoom * 0.8);
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, 200, 300);
            ctx.strokeStyle = 'gray';
            ctx.strokeRect(0, 0, 200, 300);

            // Draw H0 (components)
            barcodes0.forEach((bar: any, i: number) => {
                const y = 10 + i * 4;
                if (y > 140) return;
                const startX = bar.birth / maxRadius * 190;
                const endX = Math.min(bar.death, maxRadius) / maxRadius * 190;
                ctx.strokeStyle = `hsl(200, 80%, 70%)`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(5 + startX, y);
                ctx.lineTo(5 + endX, y);
                ctx.stroke();
            });

            // Draw H1 (loops)
            barcodes1.forEach((bar: any, i: number) => {
                 const y = 160 + i * 6;
                 if (y > 290) return;
                 const startX = bar.birth / maxRadius * 190;
                 const endX = Math.min(bar.death, maxRadius) / maxRadius * 190;
                 ctx.strokeStyle = `hsl(60, 80%, 70%)`;
                 ctx.lineWidth = 3;
                 ctx.beginPath();
                 ctx.moveTo(5 + startX, y);
                 ctx.lineTo(5 + endX, y);
                 ctx.stroke();
            });
            
            // Draw current filtration line
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1;
            const lineX = 5 + filtrationRadius / maxRadius * 190;
            ctx.beginPath();
            ctx.moveTo(lineX, 0);
            ctx.lineTo(lineX, 300);
            ctx.stroke();

            ctx.restore();
            break;
        }
        default: { // fallback to Classic Graph if something is wrong
            const points: Point[] = [];
            const range = p.range || 200;
            const numPoints = p.points || 60;
            const amplitude = p.amplitude || 50;

            for (let i = 0; i < numPoints; i++) {
                const x = (i / (numPoints-1) - 0.5) * range;
                const y = f(x / 100, t, 1, 1, 1) * amplitude;
                points.push({ x, y, id: i });
            }
            renderFiltration(ctx, t, p, points);
            break;
        }
    }
};

const renderFiltration = (ctx: CanvasRenderingContext2D, t: number, p: Record<string, number>, points: Point[], fixedRadius?: number) => {
    const filtrationRadius = fixedRadius ?? (Math.sin(t * 0.5 * ((p.filtrationSpeed||20) / 20)) * 0.5 + 0.5) * 80;
    
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const dist = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
            if (dist < filtrationRadius * 2) {
                ctx.globalAlpha = 1 - (dist / (filtrationRadius * 2));
                ctx.beginPath();
                ctx.moveTo(points[i].x, points[i].y);
                ctx.lineTo(points[j].x, points[j].y);
                ctx.stroke();
            }
        }
    }
    ctx.globalAlpha = 1;
    
    points.forEach(pt => {
        ctx.fillStyle = `hsl(${(pt.x + t * 50) % 360}, 80%, 70%)`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.strokeStyle = `hsla(${(pt.x + t * 50) % 360}, 80%, 70%, 0.2)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, filtrationRadius, 0, 2 * Math.PI);
        ctx.stroke();
    });
};

export const homology: VisualizationModule = {
    init,
    render
};