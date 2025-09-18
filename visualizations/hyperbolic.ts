import type { VisualizationModule, VisualizationRenderParams } from '../types';

const render = (params: VisualizationRenderParams) => {
    const { ctx, t, f, p, width, height, zoom, algorithm } = params;

    if (algorithm === 'v1') { // Poincaré Twist
        const scale = p.scale || 100;
        const numPoints = p.points || 250;
        const twist = p.twist || 1.0;
        for(let i = 0; i < numPoints; i++) {
            const baseAngle = i * (Math.PI * (3 - Math.sqrt(5)));
            const r = Math.sqrt(i / numPoints) * scale;
            const funcVal = f(r / scale, t, 1, 1, 1);
            const angle = baseAngle + funcVal * twist;
            
            // Project to Poincaré disk
            const z = 1.5;
            const hx = (r * Math.cos(angle)) / z;
            const hy = (r * Math.sin(angle)) / z;

            ctx.fillStyle = `hsl(${(i * 0.5 + t * 20) % 360}, 80%, 70%)`;
            ctx.beginPath();
            ctx.arc(hx, hy, 1.5 / zoom, 0, 2 * Math.PI);
            ctx.fill();
        }
    } else if (algorithm === 'v2') { // Upper Half-Plane
        const gridSize = p.gridSize || 20;
        const amplitude = p.amplitude || 50;
        const numX = Math.floor(width / gridSize / zoom);
        const numY = Math.floor(height / gridSize / zoom);

        ctx.save();
        ctx.translate(0, -height/3 / zoom); // Shift view to focus on the upper plane

        for (let i = -numX; i <= numX; i++) {
            for (let j = 1; j <= numY * 2; j++) {
                const x0 = i * gridSize;
                const y0 = j * gridSize;
                const y = y0 + f(x0 / 100, t, 1, 1, 1) * amplitude;
                
                if (y <= 0) continue; // Skip points not in the upper half-plane

                // Hyperbolic metric: size decreases with height (y)
                const radius = (gridSize / 2) / (y / 50 + 1);

                ctx.fillStyle = `hsl(${(180 + x0 / width * 180 + t * 20) % 360}, 80%, 70%)`;
                ctx.beginPath();
                // We draw at -y because canvas y-axis is inverted
                ctx.arc(x0, -y, radius / zoom, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
        ctx.restore();
    } else if (algorithm === 'v3') { // Warped Grid
        const rings = p.rings || 10;
        const spokes = p.spokes || 24;
        const warp = p.warp || 0.2;
        const maxR = Math.min(width, height) / 2 * 0.9 / zoom;
        
        const points: {x:number, y:number}[][] = Array.from({length: rings + 1}, () => Array(spokes));

        for (let i = 0; i <= rings; i++) {
            for (let j = 0; j < spokes; j++) {
                const rNorm = i / rings;
                const angleNorm = j / spokes;
                
                const funcValR = f(angleNorm * 2 - 1, t, 1, 1, 1);
                const funcValAngle = f(rNorm * 2 - 1, t + 0.5, 1, 1, 1);

                const r = rNorm * maxR * (1 + funcValR * warp);
                const angle = angleNorm * Math.PI * 2 + funcValAngle * warp * Math.PI;
                
                points[i][j] = {
                    x: r * Math.cos(angle),
                    y: r * Math.sin(angle)
                };
            }
        }

        // Draw radial lines
        for (let j = 0; j < spokes; j++) {
            ctx.beginPath();
            for (let i = 0; i <= rings; i++) {
                const pt = points[i][j];
                if (i === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            }
            ctx.strokeStyle = `hsla(${(j/spokes * 360 + t * 50) % 360}, 80%, 70%, 0.7)`;
            ctx.lineWidth = 1 / zoom;
            ctx.stroke();
        }

        // Draw ring lines
        for (let i = 1; i <= rings; i++) {
            ctx.beginPath();
            for (let j = 0; j < spokes; j++) {
                const pt = points[i][j];
                if (j === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            }
            ctx.closePath();
            ctx.strokeStyle = `hsla(${(i/rings * 180 + t * 50) % 360}, 80%, 70%, 0.7)`;
            ctx.lineWidth = 1 / zoom;
            ctx.stroke();
        }
    } else { // v0 - Poincaré Depth
        const scale = p.scale || 100;
        const numPoints = p.points || 200;

        for(let i = 0; i < numPoints; i++) {
            const angle = i * (Math.PI * (3 - Math.sqrt(5))); // Golden angle spiral
            const r = Math.sqrt(i / numPoints) * scale;
            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);
            
            // Function modulates z-coordinate before stereographic projection
            const z = f(Math.hypot(x,y)/scale, t, 1, 1, 1) + 1.5;
            const hx = x / z;
            const hy = y / z;

            ctx.fillStyle = `hsl(${(i * 0.5 + t * 20) % 360}, 80%, 70%)`;
            ctx.beginPath();
            ctx.arc(hx, hy, 1.5 / zoom, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
};

export const hyperbolic: VisualizationModule = {
    init: () => ({}),
    render
};