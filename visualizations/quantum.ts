import type { VisualizationModule, VisualizationInitParams, VisualizationRenderParams } from '../types';
import { getDerivative } from '../services/functionParser';

type OrbitParticle = {
    cx: number;
    cy: number;
    trail: {x: number, y: number}[];
};

type WavePacket = {
    x: number;
    vx: number;
    amplitude: number;
    isTunneling: boolean;
};

const init = (params: VisualizationInitParams) => {
    const { canvas, parameters: p, algorithm } = params;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (algorithm === 'v2') { // Phase Orbits
        const gridSize = p.gridSize || 8;
        const particles: OrbitParticle[] = [];
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                particles.push({
                    cx: (i / (gridSize - 1) - 0.5) * width * 0.8,
                    cy: (j / (gridSize - 1) - 0.5) * height * 0.8,
                    trail: []
                });
            }
        }
        return { particles };
    }

    if (algorithm === 'v3') { // Wave Packet
        return { packet: { x: -width / 2, vx: p.speed || 4, amplitude: 50, isTunneling: false } };
    }

    return {}; // For v0 and v1 which are stateless
};

const render = (params: VisualizationRenderParams) => {
    const { ctx, t, f, p, state, width, height, zoom, algorithm } = params;

    switch (algorithm) {
        case 'v1': { // Probability Cloud
            const numParticles = p.particles || 2000;
            const amplitude = p.amplitude || 80;
            const jitter = p.jitter || 10;
            const rangeX = width / zoom;
            
            let maxProb = 0;
            // A quick scan to normalize probability
            for (let i = 0; i < 100; i++) {
                const scanX = (i / 99 - 0.5) * (rangeX / 100);
                maxProb = Math.max(maxProb, Math.pow(f(scanX, t, 1, 1, 1), 2));
            }
            if (maxProb === 0) maxProb = 1;

            for (let i = 0; i < numParticles; i++) {
                const x = (Math.random() - 0.5) * rangeX;
                const funcVal = f(x / 100, t, 1, 1, 1);
                const prob = Math.pow(funcVal, 2) / maxProb;

                if (Math.random() < prob) {
                    const y = -funcVal * amplitude + (Math.random() - 0.5) * jitter;
                    ctx.fillStyle = `hsla(${180 + funcVal * 50}, 80%, 70%, 0.5)`;
                    ctx.fillRect(x, y, 1.5 / zoom, 1.5 / zoom);
                }
            }
            break;
        }
        
        case 'v2': { // Phase Orbits
            const particles: OrbitParticle[] = state.particles || [];
            const orbitSize = p.orbitSize || 25;
            const trailLength = p.trailLength || 20;

            particles.forEach(pt => {
                const freqX = 2.0;
                const funcVal = f(pt.cx / 100, t, 1, 1, 1);
                const freqY = 2.0 + funcVal * 2.0;
                
                const x = pt.cx + Math.cos(t * freqX * 2) * orbitSize;
                const y = pt.cy + Math.sin(t * freqY * 2) * orbitSize;

                pt.trail.push({x, y});
                if (pt.trail.length > trailLength) {
                    pt.trail.shift();
                }

                ctx.beginPath();
                pt.trail.forEach((pos, index) => {
                    if (index === 0) {
                        ctx.moveTo(pos.x, pos.y);
                    } else {
                        ctx.lineTo(pos.x, pos.y);
                    }
                });
                ctx.strokeStyle = `hsla(${180 + funcVal * 100}, 80%, 70%, ${0.8 * (pt.trail.length/trailLength)})`;
                ctx.lineWidth = 1.5 / zoom;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(x, y, 2.5 / zoom, 0, Math.PI * 2);
                ctx.fillStyle = `hsl(${180 + funcVal * 100}, 80%, 70%)`;
                ctx.fill();
            });
            break;
        }

        case 'v3': { // Wave Packet
            const packet: WavePacket = state.packet;
            if (!packet) return;

            const potentialAmplitude = p.amplitude || 60;
            const rangeX = width / zoom;
            
            // 1. Draw potential landscape
            ctx.beginPath();
            ctx.moveTo(-rangeX / 2, -f(-rangeX / 200, t, 1, 1, 1) * potentialAmplitude);
            for(let x = -rangeX/2; x <= rangeX/2; x += 5) {
                const potentialY = -f(x / 100, t, 1, 1, 1) * potentialAmplitude;
                ctx.lineTo(x, potentialY);
            }
            ctx.strokeStyle = `rgba(100, 150, 255, 0.4)`;
            ctx.lineWidth = 1.5 / zoom;
            ctx.stroke();

            // 2. Update packet dynamics
            const baseSpeed = p.speed || 4;
            const packetEnergy = baseSpeed * 5; // A simple proxy for energy
            const potentialAtPacket = f(packet.x / 100, t, 1, 1, 1) * potentialAmplitude;
            
            // Tunneling and reflection logic
            if (p.tunneling && potentialAtPacket > packetEnergy && !packet.isTunneling) {
                 const prob = Math.exp(-0.1 * (potentialAtPacket - packetEnergy));
                 if (Math.random() < prob) {
                     packet.isTunneling = true; // Enter tunneling state to cross barrier
                     packet.amplitude *= 0.8; // Lose some energy
                 } else {
                     packet.vx = -packet.vx; // Reflect
                 }
            } else if (potentialAtPacket < packetEnergy) {
                 packet.isTunneling = false; // No longer tunneling
            }

            packet.vx = Math.sign(packet.vx) * baseSpeed * Math.max(0.1, (packetEnergy - potentialAtPacket) / packetEnergy);
            
            if (!packet.isTunneling && Math.abs(packet.vx) < 0.1) { // If stuck, reflect
                 packet.vx = -Math.sign(packet.vx) * baseSpeed * 0.5;
            }

            packet.x += packet.vx;
            
            if (packet.x > rangeX / 2 || packet.x < -rangeX / 2) {
                packet.x = -rangeX / 2;
                packet.vx = Math.abs(packet.vx);
                packet.amplitude = 50; // Reset amplitude
            }
            
            // 3. Drawing the packet
            ctx.beginPath();
            const packetWidth = p.packetWidth || 80;
            const packetWavelength = 20;
            
            let packetDrawn = false;
            for (let x_offset = -packetWidth * 2; x_offset <= packetWidth * 2; x_offset += 2) {
                const x = packet.x + x_offset;
                const envelope = Math.exp(-Math.pow(x_offset / packetWidth, 2));

                if (envelope > 0.01) {
                    const potentialY = -f(x / 100, t, 1, 1, 1) * potentialAmplitude;
                    const wave = Math.sin(x_offset / packetWavelength * Math.PI * 2) * packet.amplitude;
                    
                    let finalX = x;
                    let finalY = potentialY + wave;

                    if (p.renderStyle === 1) { // Normal rendering
                        const slope = getDerivative((_x) => -f(_x, t, 1, 1, 1) * potentialAmplitude, x, t, 1, 1, 1);
                        const tangentAngle = Math.atan(slope/100);
                        const normalAngle = tangentAngle + Math.PI / 2;
                        finalX = x + Math.cos(normalAngle) * wave * envelope;
                        finalY = potentialY + Math.sin(normalAngle) * wave * envelope;
                    }
                     
                    if (!packetDrawn) {
                        ctx.moveTo(finalX, finalY);
                        packetDrawn = true;
                    } else {
                        ctx.lineTo(finalX, finalY);
                    }
                }
            }
            ctx.strokeStyle = packet.isTunneling ? `rgba(255, 255, 100, 0.5)` : `hsl(60, 90%, 70%)`;
            ctx.lineWidth = 2 / zoom;
            ctx.stroke();
            break;
        }
        
        default: { // v0 - Interference
            const numParticles = p.particles || 200;
            const rangeX = Math.min(width, 800) / zoom;
            
            for (let i = 0; i < numParticles; i++) {
                const x = (i / (numParticles-1) - 0.5) * rangeX;
                const y = -f(x / 100, t, 1, 1, 1) * 50 - Math.sin(i * (p.frequency||0.1) + t*2) * 20;
                ctx.fillStyle = `hsla(${200 - y}, 70%, 60%, 0.8)`;
                ctx.beginPath();
                ctx.arc(x, y, 2 / zoom, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
        }
    }
};

export const quantum: VisualizationModule = {
    init,
    render
};