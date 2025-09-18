import type { VisualizationModule, VisualizationRenderParams } from '../types';

const render = (params: VisualizationRenderParams) => {
    const { ctx, t, f, p, width, height, zoom, algorithm } = params;

    const gridSize = p.gridSize || 30;
    if (algorithm === 'v3') { // Limited Grid
        const deformation = p.deformation || 5;
        for (let i = -8; i <= 8; i++) { // Fixed 17x17 grid
            for (let j = -8; j <= 8; j++) {
                const x0 = i * gridSize;
                const y0 = j * gridSize;
                const funcVal = f(x0 / 100, t + y0 / 100, 1, 1, 1);

                const x = x0 + Math.sin(t + j) * funcVal * deformation;
                const y = y0 + Math.cos(t + i) * funcVal * deformation;
                ctx.fillStyle = `hsla(${270 + (i + j) * 10}, 60%, 70%, 0.9)`;
                ctx.beginPath();
                ctx.arc(x, y, 2 / zoom, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    } else {
        const num = Math.floor(Math.max(width, height) / gridSize / 2 / zoom);
        for (let i = -num; i <= num; i++) {
            for (let j = -num; j <= num; j++) {
                const x0 = i * gridSize;
                const y0 = j * gridSize;
                const funcVal = f(x0 / 100, t + y0/100, 1, 1, 1);
                
                if (algorithm === 'v1') { // Size Modulation
                    const sizeFactor = p.sizeFactor || 8;
                    const size = Math.abs(funcVal) * sizeFactor;
                    ctx.fillStyle = `hsla(${270 + (i + j) * 10 + funcVal * 20}, 60%, 70%, 0.9)`;
                    ctx.beginPath();
                    ctx.arc(x0, y0, Math.max(0, size) / zoom, 0, Math.PI * 2);
                    ctx.fill();
                } else if (algorithm === 'v2') { // Rotational Field
                    const rotationFactor = p.rotationFactor || 1.57;
                    const angle = funcVal * rotationFactor;
                    const lineLength = gridSize * 0.4;
                    ctx.strokeStyle = `hsla(${270 + (i + j) * 10 + funcVal * 20}, 60%, 70%, 0.9)`;
                    ctx.lineWidth = 2 / zoom;
                    ctx.beginPath();
                    ctx.moveTo(x0 - Math.cos(angle) * lineLength, y0 - Math.sin(angle) * lineLength);
                    ctx.lineTo(x0 + Math.cos(angle) * lineLength, y0 + Math.sin(angle) * lineLength);
                    ctx.stroke();
                } else { // v0 - Deformation
                    const deformation = p.deformation || 5;
                    const x = x0 + Math.sin(t + j) * funcVal * deformation;
                    const y = y0 + Math.cos(t + i) * funcVal * deformation;
                    ctx.fillStyle = `hsla(${270 + (i + j) * 10}, 60%, 70%, 0.9)`;
                    ctx.beginPath();
                    ctx.arc(x, y, 2 / zoom, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
};

export const crystal: VisualizationModule = {
    init: () => ({}),
    render
};