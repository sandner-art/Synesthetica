import type { VisualizationModule, VisualizationInitParams, VisualizationRenderParams } from '../types';

const init = (params: VisualizationInitParams) => {
    const { canvas, parameters: p, algorithm } = params;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const network = { layers: [] as any[], signals: [] as any[] };
    const jitter = (algorithm === 'v2' || algorithm === 'v3') ? (p.jitter || 0) : 0;
    
    if (algorithm === 'v1') { // Circular
        const rings = Math.floor(p.rings || 3);
        const neuronsPerRing = Math.floor(p.neuronsPerRing || 12);
        const maxRadius = Math.min(width, height) * 0.4;
        for(let i=0; i < rings; i++) {
            const layer = [];
            const radius = (i + 1) * (maxRadius / (rings));
            for (let j = 0; j < neuronsPerRing; j++) {
                const angle = (j / neuronsPerRing) * Math.PI * 2;
                layer.push({
                    x: Math.cos(angle) * radius, y: Math.sin(angle) * radius,
                    ox: Math.cos(angle) * radius, oy: Math.sin(angle) * radius,
                    activation: 0,
                });
            }
            network.layers.push(layer);
        }
    } else if (algorithm === 'v3') { // Geometric
        const nodes = Math.floor(p.nodes || 6);
        const radius = Math.min(width, height) * 0.35;
        const layer = [];
        for (let i = 0; i < nodes; i++) {
            const angle = (i / nodes) * Math.PI * 2;
            const jx = jitter * (Math.random() - 0.5);
            const jy = jitter * (Math.random() - 0.5);
            const neuron = {
                ox: Math.cos(angle) * radius + jx,
                oy: Math.sin(angle) * radius + jy,
                x: 0, y: 0, vx: 0, vy: 0,
                activation: 0,
                lastActivationTime: -1,
            };
            neuron.x = neuron.ox;
            neuron.y = neuron.oy;
            layer.push(neuron);
        }
        network.layers.push(layer);
    } else { // v0 (Layered) & v2 (Reactive)
        const numLayers = Math.floor(p.layers || 4);
        const numNeurons = Math.floor(p.neurons || 8);
        const layerWidth = width * 0.8;
        for (let i = 0; i < numLayers; i++) {
            const layer = [];
            for (let j = 0; j < numNeurons; j++) {
                const jx = jitter * (Math.random() - 0.5);
                const jy = jitter * (Math.random() - 0.5);
                const neuron = {
                    ox: (i / (numLayers - 1) - 0.5) * layerWidth + jx,
                    oy: (j / (numNeurons - 1) - 0.5) * (height * 0.8) + jy,
                    x: 0, y: 0, vx: 0, vy: 0,
                    activation: 0,
                };
                neuron.x = neuron.ox;
                neuron.y = neuron.oy;
                layer.push(neuron);
            }
            network.layers.push(layer);
        }
    }
    return { network, signalCounter: 0 };
};

const render = (params: VisualizationRenderParams) => {
    const { ctx, t, f, p, state, zoom, algorithm } = params;
    
    if (state.network) {
        const { network } = state;
        const signalSpeed = p.signalSpeed || 2.0;
        
        // Update and draw signals
        network.signals = network.signals.filter((s:any) => s.progress < 1);
        network.signals.forEach((s:any) => {
            s.progress += 0.01 * signalSpeed;
            const start = network.layers[s.fromLayer][s.fromNeuron];
            const end = network.layers[s.toLayer][s.toNeuron];
            const x = start.x + (end.x - start.x) * s.progress;
            const y = start.y + (end.y - start.y) * s.progress;
            ctx.beginPath();
            ctx.arc(x, y, 3 / zoom, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${s.hue}, 90%, 70%, ${1 - s.progress})`;
            ctx.fill();

            if (s.progress >= 1 && !s.activated) {
                s.activated = true;
                const targetLayer = network.layers[s.toLayer];
                if (!targetLayer) return;
                const targetNeuron = targetLayer[s.toNeuron];
                if (!targetNeuron) return;
                
                targetNeuron.activation = 1;
                if (algorithm === 'v3') targetNeuron.lastActivationTime = t;

                if (algorithm === 'v2' || algorithm === 'v3') {
                    const recoilStrength = p.recoilStrength || 5;
                    const recoilAngle = f(s.fromNeuron, t, 1, 1, 1) * Math.PI;
                    targetNeuron.vx += Math.cos(recoilAngle) * recoilStrength;
                    targetNeuron.vy += Math.sin(recoilAngle) * recoilStrength;
                }
                
                // Signal Propagation
                if (algorithm === 'v3') {
                    const numNodes = network.layers[0].length;
                    const neighbors = [(s.toNeuron + 1) % numNodes, (s.toNeuron - 1 + numNodes) % numNodes];
                    neighbors.forEach(neighborIdx => {
                        const neighbor = network.layers[0][neighborIdx];
                        if (t - neighbor.lastActivationTime > 0.5) { // 0.5s cooldown
                            state.signalCounter++;
                            network.signals.push({
                                fromLayer: 0, fromNeuron: s.toNeuron,
                                toLayer: 0, toNeuron: neighborIdx,
                                progress: 0, activated: false,
                                hue: (state.signalCounter * 20) % 360,
                            });
                        }
                    });
                } else if (s.toLayer < network.layers.length - 1) {
                    const nextLayerIdx = s.toLayer + 1;
                    const activationValue = f(s.toNeuron, t, 1, 1, 1);
                    
                    network.layers[nextLayerIdx].forEach((_:any, nextNeuronIdx:number) => {
                        if (Math.random() < Math.abs(activationValue)) {
                            state.signalCounter++;
                            network.signals.push({
                                fromLayer: s.toLayer, fromNeuron: s.toNeuron,
                                toLayer: nextLayerIdx, toNeuron: nextNeuronIdx,
                                progress: 0, activated: false,
                                hue: (state.signalCounter * 20) % 360,
                            });
                        }
                    });
                }
            }
        });
        
        // Draw network structure and update neurons
        network.layers.forEach((layer: any, i: number) => {
            if (algorithm === 'v3') {
                 layer.forEach((neuron: any, j: number) => {
                     const nextNeuron = layer[(j + 1) % layer.length];
                     ctx.beginPath();
                     ctx.moveTo(neuron.x, neuron.y);
                     ctx.lineTo(nextNeuron.x, nextNeuron.y);
                     ctx.strokeStyle = `rgba(255, 255, 255, 0.1)`;
                     ctx.lineWidth = 0.5 / zoom;
                     ctx.stroke();
                 });
            }

            layer.forEach((neuron: any) => {
                if (algorithm === 'v2' || algorithm === 'v3') {
                    neuron.vx += (neuron.ox - neuron.x) * 0.1; // Spring back
                    neuron.vy += (neuron.oy - neuron.y) * 0.1;
                    neuron.vx *= 0.8; // Damping
                    neuron.vy *= 0.8;
                    neuron.x += neuron.vx;
                    neuron.y += neuron.vy;
                } else if (neuron.x !== neuron.ox || neuron.y !== neuron.oy) {
                    neuron.x = neuron.ox;
                    neuron.y = neuron.oy;
                }

                if (algorithm !== 'v3' && i < network.layers.length - 1) {
                    network.layers[i+1].forEach((nextNeuron: any) => {
                        ctx.beginPath();
                        ctx.moveTo(neuron.x, neuron.y);
                        ctx.lineTo(nextNeuron.x, nextNeuron.y);
                        ctx.strokeStyle = `rgba(255, 255, 255, 0.1)`;
                        ctx.lineWidth = 0.5 / zoom;
                        ctx.stroke();
                    });
                }
                
                ctx.beginPath();
                ctx.arc(neuron.x, neuron.y, 4 / zoom, 0, Math.PI * 2);
                neuron.activation *= 0.95;
                ctx.fillStyle = `hsla(180, 80%, 80%, ${0.2 + neuron.activation * 0.8})`;
                ctx.fill();
            });
        });

        if (Math.random() < 0.02) {
            if (algorithm === 'v3') {
                const startNeuronIdx = Math.floor(Math.random() * network.layers[0].length);
                const startNeuron = network.layers[0][startNeuronIdx];
                if(t - startNeuron.lastActivationTime > 1.0) { // Longer cooldown for random trigger
                    startNeuron.activation = 1;
                    startNeuron.lastActivationTime = t;
                    const numNodes = network.layers[0].length;
                    const neighbors = [(startNeuronIdx + 1) % numNodes, (startNeuronIdx - 1 + numNodes) % numNodes];
                    neighbors.forEach(neighborIdx => {
                        state.signalCounter++;
                        network.signals.push({
                            fromLayer: 0, fromNeuron: startNeuronIdx,
                            toLayer: 0, toNeuron: neighborIdx,
                            progress: 0, activated: false,
                            hue: (state.signalCounter * 20) % 360,
                        });
                    });
                }
            } else {
                const startNeuronIdx = Math.floor(Math.random() * network.layers[0].length);
                network.layers[0][startNeuronIdx].activation = 1;
                if (network.layers.length > 1) {
                    network.layers[1].forEach((_, nextNeuronIdx) => {
                        state.signalCounter++;
                        network.signals.push({
                            fromLayer: 0, fromNeuron: startNeuronIdx,
                            toLayer: 1, toNeuron: nextNeuronIdx,
                            progress: 0, activated: false,
                            hue: (state.signalCounter * 20) % 360,
                        });
                    });
                }
            }
        }
    }
};

export const neural: VisualizationModule = {
    init,
    render
};