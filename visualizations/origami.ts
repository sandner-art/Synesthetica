import type { VisualizationModule, VisualizationInitParams, VisualizationRenderParams } from '../types';

const init = (params: VisualizationInitParams) => {
    const { parameters: p, algorithm } = params;
    if (algorithm === 'v0') {
        const segments = p.segments || 40;
        const strip = { points: [], angles: [] };
        for(let i=0; i < segments; i++) {
            strip.points.push({x:0, y:0});
            strip.angles.push(0);
        }
        return { strip };
    }
    return {};
};

const render = (params: VisualizationRenderParams) => {
    const { ctx, t, f, p, state, width, height, zoom, algorithm } = params;
    
    const foldStrength = p.foldStrength || 1.0;
    ctx.strokeStyle = `hsl(${(t * 50) % 360}, 80%, 70%)`;
    ctx.lineWidth = 2 / zoom;

    if (algorithm === 'v1') { // Radial
        const arms = p.arms || 8;
        const segments = p.segments || 20;
        const segmentLength = (Math.min(width, height) * 0.4 / segments) / zoom;
        for (let i = 0; i < arms; i++) {
            const baseAngle = (i / arms) * Math.PI * 2;
            let currentAngle = baseAngle;
            let lastPt = { x: 0, y: 0 };
            ctx.beginPath();
            ctx.moveTo(0,0);
            for(let j=1; j<segments; j++) {
                const targetFold = f(j / segments, t + i, 1, 1, 1) * Math.PI * 0.1 * foldStrength;
                currentAngle += targetFold;
                const newPt = {
                    x: lastPt.x + Math.cos(currentAngle) * segmentLength,
                    y: lastPt.y + Math.sin(currentAngle) * segmentLength
                };
                ctx.lineTo(newPt.x, newPt.y);
                lastPt = newPt;
            }
            ctx.stroke();
        }
    } else if (algorithm === 'v2') { // Branched
        const drawFoldedBranch = (pt: {x:number, y:number}, angle: number, length: number, depth: number) => {
            if (depth <= 0) return;
            const endPt = { x: pt.x + Math.cos(angle) * length, y: pt.y + Math.sin(angle) * length };
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(endPt.x, endPt.y);
            ctx.stroke();
            
            const funcVal = f(depth, t, 1, 1, 1);
            const angleMod = funcVal * p.branchAngle;

            drawFoldedBranch(endPt, angle - angleMod, length * 0.8, depth - 1);
            drawFoldedBranch(endPt, angle + angleMod, length * 0.8, depth - 1);
        }
        drawFoldedBranch({x:0, y:150}, -Math.PI/2, 40, p.depth || 4);

    } else { // v0 - Linear Strip
        if (state.strip) {
            const { strip } = state;
            const segments = p.segments || 40;
            const segmentLength = (width * 0.8 / segments) / zoom;
            const inertia = p.foldInertia || 0.95;
            strip.points[0] = { x: -width * 0.4 / zoom, y: 0 };
            let currentAngle = 0;
            for(let i=1; i<segments; i++) {
                const targetFold = f(i / segments, t, 1, 1, 1) * Math.PI * foldStrength;
                strip.angles[i] = strip.angles[i] * inertia + targetFold * (1 - inertia);
                currentAngle += strip.angles[i];
                const prev = strip.points[i-1];
                strip.points[i] = {
                    x: prev.x + Math.cos(currentAngle) * segmentLength,
                    y: prev.y + Math.sin(currentAngle) * segmentLength
                };
            }
            ctx.beginPath();
            strip.points.forEach((pt:any, i:number) => {
                if (i === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            });
            ctx.stroke();
        }
    }
};

export const origami: VisualizationModule = {
    init,
    render
};