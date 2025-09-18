import type { VisualizationModule, VisualizationRenderParams } from '../types';

const render = (params: VisualizationRenderParams) => {
    const { ctx, t, f, p, zoom, algorithm } = params;

    const allBranchEndpoints: {x: number, y: number}[] = [];
                
    const drawSynapticBranch = (x: number, y: number, angle: number, length: number, depth: number, thickness: number) => {
        if (depth <= 0 || length < 1) return;

        const x2 = x + Math.cos(angle) * length;
        const y2 = y + Math.sin(angle) * length;
        
        let isSynapsing = false;
        for (const endpoint of allBranchEndpoints) {
            if (Math.hypot(x2 - endpoint.x, y2 - endpoint.y) < p.synapseRadius) {
                isSynapsing = true;
                break;
            }
        }
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = thickness / zoom;
        
        if (isSynapsing) {
             ctx.strokeStyle = `hsl(${(t * 150) % 360}, 90%, 80%)`;
             ctx.lineWidth = (thickness + 1) / zoom;
        } else {
            const funcVal = f(length / 10, t, 1, 1, 1);
            ctx.strokeStyle = `hsl(${(200 + funcVal * 50) % 360}, 80%, 60%)`;
        }
        ctx.stroke();
        allBranchEndpoints.push({x: x2, y: y2});

        const funcVal = f(depth, t, 1, 1, 1);
        const angleMod = funcVal * Math.PI / 4;

        if (algorithm === 'v1') { // Asymmetric Growth
            const asymmetry = p.asymmetry || 0.6;
            drawSynapticBranch(x2, y2, angle - angleMod, length * 0.85 * (1 + asymmetry * funcVal), depth - 1, thickness * 0.9);
            drawSynapticBranch(x2, y2, angle + angleMod, length * 0.85 * (1 - asymmetry * funcVal), depth - 1, thickness * 0.9);
        } else if (algorithm === 'v2') { // Biometric Growth
            const thicknessMod = Math.abs(funcVal);
            drawSynapticBranch(x2, y2, angle - angleMod, length * 0.85, depth - 1, thickness * 0.9 * (1 + thicknessMod));
            drawSynapticBranch(x2, y2, angle + angleMod, length * 0.85, depth - 1, thickness * 0.9 * (1 - thicknessMod));
        } else { // V0 - Symmetric
            drawSynapticBranch(x2, y2, angle - angleMod, length * 0.85, depth - 1, thickness * 0.9);
            drawSynapticBranch(x2, y2, angle + angleMod, length * 0.85, depth - 1, thickness * 0.9);
        }
    };

    const initialBranches = p.branches || 6;
    const baseLength = p.growth || 40;
    const maxDepth = p.depth || 5;
    const baseThickness = p.thickness || 4;
    const symmetry = p.symmetry || 0;

    const drawSymmetric = () => {
         for (let i = 0; i < initialBranches; i++) {
            const angle = (i / initialBranches) * Math.PI * 2;
            drawSynapticBranch(0, 0, angle, baseLength, maxDepth, baseThickness);
        }
    }
    
    drawSymmetric();
    if (symmetry === 1) { // X-Axis
        ctx.save();
        ctx.scale(1, -1);
        drawSymmetric();
        ctx.restore();
    } else if (symmetry === 2) { // Y-Axis
        ctx.save();
        ctx.scale(-1, 1);
        drawSymmetric();
        ctx.restore();
    } else if (symmetry === 3) { // Origin
        ctx.save();
        ctx.scale(1, -1);
        drawSymmetric();
        ctx.restore();
        ctx.save();
        ctx.scale(-1, 1);
        drawSymmetric();
        ctx.restore();
        ctx.save();
        ctx.scale(-1, -1);
        drawSymmetric();
        ctx.restore();
    }
};

export const synapticGrowth: VisualizationModule = {
    init: () => ({}),
    render
};