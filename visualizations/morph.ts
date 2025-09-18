import type { VisualizationModule, VisualizationRenderParams } from '../types';

const render = (params: VisualizationRenderParams) => {
    const { ctx, t, f, p, zoom, algorithm } = params;
    
    const drawBranch = (x: number, y: number, angle: number, length: number, depth: number, thickness: number) => {
        if (depth <= 0 || length < 1 || thickness < 0.2) return;
        
        const x2 = x + Math.cos(angle) * length;
        const y2 = y + Math.sin(angle) * length;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = thickness / zoom;
        const funcVal = f(length / 10, t, 1, 1, 1);
        ctx.strokeStyle = `hsl(${(120 + funcVal * 40) % 360}, 80%, 60%)`;
        ctx.stroke();

        if (algorithm === 'v2') {
            const asymmetry = p.asymmetry || 0.5;
            const angleMod = funcVal * Math.PI / 4;
            drawBranch(x2, y2, angle - angleMod, length * 0.8 * (1 + asymmetry * Math.sin(t)), depth - 1, thickness * 0.8);
            drawBranch(x2, y2, angle + angleMod, length * 0.8 * (1 - asymmetry * Math.sin(t)), depth - 1, thickness * 0.8);
        } else if (algorithm === 'v3') {
            const angleMod = Math.PI / 4;
            const thicknessMod = Math.abs(funcVal);
            drawBranch(x2, y2, angle - angleMod, length * 0.8, depth - 1, thickness * 0.8 * (1 + thicknessMod));
            drawBranch(x2, y2, angle + angleMod, length * 0.8, depth - 1, thickness * 0.8 * (1 - thicknessMod));
        } else { // v0
            const angleMod = funcVal * Math.PI / 4;
            drawBranch(x2, y2, angle - angleMod, length * 0.8, depth - 1, thickness * 0.8);
            drawBranch(x2, y2, angle + angleMod, length * 0.8, depth - 1, thickness * 0.8);
        }
    };

    const baseThickness = p.thickness || 2;
    const numBranches = p.branches || 8;

    for (let i = 0; i < numBranches; i++) {
        const angle = (i / numBranches) * Math.PI * 2;
        drawBranch(0, 0, angle, 50 + (p.growth||20), 5, baseThickness);
    }
};

export const morph: VisualizationModule = {
    init: () => ({}),
    render
};