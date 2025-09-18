import type { VisualizationModule, VisualizationRenderParams } from '../types';

const render = (params: VisualizationRenderParams) => {
    const { ctx, t, f, p, zoom, rotation, algorithm } = params;
    
    if (algorithm === 'v0') { // Original point-based
        for(let i = 0; i < (p.points || 200); i++) {
            const xNorm = (i / (p.points||200) - 0.5) * 2; // -1 to 1
            const x = xNorm * 150;
            const funcVal = f(xNorm, t, 1, 1, 1) * (p.amplitude||40);
            const angle = x * 0.05;
            const y_center = funcVal * Math.cos(angle);
            const z_rot_x = funcVal * Math.sin(angle) * 0.01 + rotation.x;
            const y_rotated = y_center * Math.cos(z_rot_x);

            ctx.beginPath();
            ctx.arc(x, y_rotated, 1.5 / zoom, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${(i * (360/(p.points||200)) + t * 50) % 360}, 70%, 60%)`;
            ctx.fill();
        }
    } else if (algorithm === 'v1') { // Simple line strip
        ctx.beginPath();
        for(let i = -100; i <= 100; i++) {
            const x = i * 3;
            const funcVal = f(x / 50, t, 1, 1, 1) * (p.amplitude||40);
            const angle = x * 0.05 * (p.twist||5);
            const y = funcVal * Math.cos(angle);
            const z_rot_x = funcVal * Math.sin(angle);
            
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(1, Math.cos(rotation.x + z_rot_x * 0.01));
            ctx.lineTo(0,0);
            ctx.restore();
        }
        ctx.strokeStyle = `hsl(${(t * 50) % 360}, 70%, 60%)`;
        ctx.lineWidth = 2 / zoom;
        ctx.stroke();
    } else { // V2 - Twisted Ribbon
        const ribbonWidth = 10;
        for (let i = -100; i < 100; i++) {
            const x1 = i * 3;
            const funcVal1 = f(x1 / 50, t, 1, 1, 1) * (p.amplitude||30);
            const angle1 = x1 * 0.05 * (p.twist||2);
            const y1_center = funcVal1 * Math.cos(angle1);
            const z_rot_x = funcVal1 * Math.sin(angle1) * 0.01 + rotation.x;
            const y_rotated = y1_center * Math.cos(z_rot_x);

            const x2 = (i + 1) * 3;
            const funcVal2 = f(x2 / 50, t, 1, 1, 1) * (p.amplitude||30);
            const angle2 = x2 * 0.05 * (p.twist||2);
            const y2_center = funcVal2 * Math.cos(angle2);
            
            ctx.fillStyle = `hsl(${(i * 2 + t * 50) % 360}, 70%, 60%)`;
            ctx.beginPath();
            ctx.moveTo(x1, y_rotated - (ribbonWidth/2)*Math.cos(z_rot_x));
            ctx.lineTo(x2, y2_center - (ribbonWidth/2)*Math.cos(z_rot_x));
            ctx.lineTo(x2, y2_center + (ribbonWidth/2)*Math.cos(z_rot_x));
            ctx.lineTo(x1, y_rotated + (ribbonWidth/2)*Math.cos(z_rot_x));
            ctx.closePath();
            ctx.fill();
        }
    }
};

export const fiber: VisualizationModule = {
    init: () => ({}),
    render
};