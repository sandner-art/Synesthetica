import type { VisualizationModule, VisualizationInitParams, VisualizationRenderParams } from '../types';
import { getDerivative } from '../services/functionParser';
import { PALETTES } from './utils';

const init = (params: VisualizationInitParams) => {
    const { canvas, parameters: p, algorithm } = params;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    let staticNetwork: any = null;
    if (algorithm === 'v2') { // Pulse
        const density = p.density || 10;
        const network = { nodes: [] as any[], edges: [] as any[] };
        const R = Math.min(width, height) * 0.4;
        for(let i=0; i < density * 10; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = Math.sqrt(Math.random()) * R;
            network.nodes.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, neighbors: [] });
        }
        network.nodes.forEach((nodeA, i) => {
            const sorted = [...network.nodes].sort((b,c) => Math.hypot(nodeA.x-b.x, nodeA.y-b.y) - Math.hypot(nodeA.x-c.x, nodeA.y-c.y));
            for(let j=1; j<4; j++) {
                const nodeB = sorted[j];
                const bIndex = network.nodes.indexOf(nodeB);
                if(i < bIndex) {
                    network.edges.push([i, bIndex]);
                    nodeA.neighbors.push(bIndex);
                    nodeB.neighbors.push(i);
                }
            }
        });
        staticNetwork = network;
    }
    
    return {
        lastScanTime: 0,
        systems: [],
        staticNetwork: staticNetwork
    };
};

const render = (params: VisualizationRenderParams) => {
    const { ctx, t, f, p, state, zoom, algorithm } = params;
    
    const { systems } = state;
    const scanInterval = 0.1;
    
    // This check should ideally be in the hook, but for now we check here.
    if (t > state.lastScanTime + scanInterval) {
        state.lastScanTime = t;
        const scanPoints = 100;
        let lastVal = f(-1, t, 1, 1, 1);
        for (let i = 1; i < scanPoints; i++) {
            const scanX = (i / scanPoints) * 2 - 1;
            const currentVal = f(scanX, t, 1, 1, 1);
            if ((lastVal < 0 && currentVal >= 0) || (lastVal > 0 && currentVal <= 0)) {
                const slope = getDerivative(f, scanX, t, 1, 1, 1);
                const system = {
                    x: Math.cos(scanX * Math.PI) * 150,
                    y: Math.sin(scanX * Math.PI) * 150,
                    value: Math.abs(currentVal),
                    slope: slope,
                    life: 1.0,
                    branches: [] as any[],
                    algorithm: algorithm
                };
                if (algorithm === 'v0') { // Forest
                    let initialAngle = Math.atan2(slope, 1) + (Math.random() - 0.5) * 0.2; // Organic (default)
                    if(p.growthMode === 1) { // Radial
                        initialAngle = Math.atan2(system.y, system.x);
                    }
                    system.branches.push({
                        x: system.x, y: system.y,
                        angle: initialAngle,
                        length: (p.length || 20) * (1 + system.value),
                        depth: 5, life: 1.0, hue: (slope * 20 + 180) % 360
                    });
                } else if (algorithm === 'v1') { // Vines
                    system.x = 0; system.y = 0;
                    system.branches.push({
                        x: Math.cos(scanX * Math.PI * 2) * 20,
                        y: Math.sin(scanX * Math.PI * 2) * 20,
                        angle: scanX * Math.PI * 2,
                        length: 0,
                        hue: (scanX * 180 + t*50) % 360,
                        maxLength: p.length || 150,
                    });
                } else if (algorithm === 'v2') { // Pulse
                    const network = state.staticNetwork;
                    if(network && network.nodes.length > 0) {
                        const startNodeIndex = Math.floor(Math.random() * network.nodes.length);
                        system.branches.push({
                            currentNode: startNodeIndex,
                            progress: 0,
                            hue: (slope * 20 + t * 50) % 360,
                            path: [startNodeIndex],
                        });
                    }
                }
                systems.push(system);
            }
            lastVal = currentVal;
        }
    }
    
    ctx.globalCompositeOperation = 'lighter';
    
    if (algorithm === 'v2' && state.staticNetwork) {
         const network = state.staticNetwork;
         ctx.strokeStyle = `rgba(255, 255, 255, 0.1)`;
         ctx.lineWidth = 0.5 / zoom;
         ctx.beginPath();
         network.edges.forEach(([i,j]:[number,number]) => {
             ctx.moveTo(network.nodes[i].x, network.nodes[i].y);
             ctx.lineTo(network.nodes[j].x, network.nodes[j].y);
         });
         ctx.stroke();
    }

    systems.forEach((sys: any) => {
        if (sys.algorithm === 'v0') {
            const newBranches: any[] = [];
            const isParticleStyle = p.renderStyle === 1;
            sys.branches.forEach((b: any) => {
                const lengthMultiplier = isParticleStyle ? 0.1 : 1.0;
                const x2 = b.x + Math.cos(b.angle) * b.length * 0.1 * lengthMultiplier;
                const y2 = b.y + Math.sin(b.angle) * b.length * 0.1 * lengthMultiplier;
                const color = PALETTES[p.palette || 0](b.life, p.evolve ? t : 0);
                ctx.beginPath();
                ctx.moveTo(b.x, b.y);
                ctx.lineTo(x2, y2);
                ctx.lineWidth = (b.depth * 0.5 * b.life) / zoom;
                ctx.strokeStyle = `${color.slice(0, -1)}, ${b.life * 0.8})`;
                ctx.stroke();
                b.x = x2; b.y = y2;
                b.life *= isParticleStyle ? 0.98 : 0.995;
                
                if (b.depth > 0 && !isParticleStyle) {
                    const angleMod = (p.angle || 0.5) * (1 + f(b.depth, t, 1, 1, 1) * 0.2);
                    newBranches.push({ ...b, angle: b.angle - angleMod, length: b.length * 0.8, depth: b.depth - 1 });
                    newBranches.push({ ...b, angle: b.angle + angleMod, length: b.length * 0.8, depth: b.depth - 1 });
                    b.depth = 0; // stop this branch from branching again to avoid exponential explosion
                }
            });
            if (!isParticleStyle) {
                sys.branches.push(...newBranches);
            }
            sys.branches = sys.branches.filter((b:any) => b.life > 0.01);
        } else if (sys.algorithm === 'v1') {
             sys.branches.forEach((b: any) => {
                if (b.length < b.maxLength) {
                    const speed = p.speed || 2;
                    const curvature = (p.curvature || 0.1) * f(b.length / b.maxLength, t, 1, 1, 1);
                    b.angle += curvature;
                    const x2 = b.x + Math.cos(b.angle) * speed;
                    const y2 = b.y + Math.sin(b.angle) * speed;
                    const color = PALETTES[p.palette || 0]((b.length / b.maxLength), p.evolve ? t : 0);
                    ctx.beginPath();
                    ctx.moveTo(b.x, b.y);
                    ctx.lineTo(x2, y2);
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2 / zoom;
                    ctx.stroke();
                    b.x = x2; b.y = y2;
                    b.length += speed;
                }
             });
        } else if (sys.algorithm === 'v2' && state.staticNetwork) {
            const network = state.staticNetwork;
            const speed = p.pulseSpeed || 4;
            const pulseWidth = p.pulseWidth || 40;
            sys.branches.forEach((pulse:any) => {
                pulse.progress += speed;
                for(let i=0; i < pulse.path.length; i++) {
                    const nodeIdx = pulse.path[i];
                    const distFromHead = pulse.progress - i * 10;
                    if(distFromHead > 0 && distFromHead < pulseWidth) {
                        const intensity = Math.sin((distFromHead / pulseWidth) * Math.PI);
                        const color = PALETTES[p.palette || 0](intensity, p.evolve ? t : 0);
                        ctx.beginPath();
                        ctx.arc(network.nodes[nodeIdx].x, network.nodes[nodeIdx].y, intensity * 3 / zoom, 0, Math.PI * 2);
                        ctx.fillStyle = `${color.slice(0, -1)}, ${intensity * 0.8})`;
                        ctx.fill();
                    }
                }
                if (pulse.progress > pulse.path.length * 10) {
                    const lastNodeIdx = pulse.path[pulse.path.length - 1];
                    const neighbors = network.nodes[lastNodeIdx].neighbors;
                    if (neighbors.length > 0) {
                        const nextNode = neighbors[Math.floor(Math.random() * neighbors.length)];
                        if(!pulse.path.includes(nextNode)) {
                            pulse.path.push(nextNode);
                        }
                    }
                }
            });
        }
        sys.life *= (p.decay || 0.99);
    });
    state.systems = systems.filter((s:any) => s.life > 0.01 && s.branches.length > 0);
    
    ctx.globalCompositeOperation = 'source-over';
};

export const eventGrowth: VisualizationModule = {
    init,
    render
};