import { useRef, useEffect, useState, useCallback } from 'react';
import type { ProjectionModeId } from '../types';
import { getDerivative, type EvaluatedFunction } from '../services/functionParser';

interface VisualizationParams {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  mode: ProjectionModeId;
  algorithm: string;
  parameters: Record<string, number>;
  isPlaying: boolean;
  parsedFunction: EvaluatedFunction | null;
  useAdaptiveCentering: boolean;
  controlsHeight: number;
}

export const useVisualization = ({ canvasRef, mode, algorithm, parameters, isPlaying, parsedFunction, useAdaptiveCentering, controlsHeight }: VisualizationParams) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const animationFrameId = useRef<number | null>(null);
  const timeRef = useRef(0);
  const particleStateRef = useRef<any>({ particles: [] });

  const resetView = useCallback(() => {
    setRotation({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  const handleInteractionStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
  }, []);
  
  const handleInteractionMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;
    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;
    setRotation(prev => ({
      x: prev.x + deltaY * 0.005,
      y: prev.y + deltaX * 0.005
    }));
    setDragStart({ x: clientX, y: clientY });
  }, [isDragging, dragStart]);

  const handleInteractionEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.2, Math.min(5, prev * delta)));
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMouseDown = (e: MouseEvent) => handleInteractionStart(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => handleInteractionMove(e.clientX, e.clientY);
    const onMouseUp = () => handleInteractionEnd();
    const onTouchStart = (e: TouchEvent) => e.touches.length === 1 && handleInteractionStart(e.touches[0].clientX, e.touches[0].clientY);
    const onTouchMove = (e: TouchEvent) => e.touches.length === 1 && handleInteractionMove(e.touches[0].clientX, e.touches[0].clientY);
    const onTouchEnd = () => handleInteractionEnd();

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleInteractionStart, handleInteractionMove, handleInteractionEnd, handleWheel, canvasRef]);

  // Effect for initializing stateful visualizations like particle systems
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const p = parameters;

    const initializeState = () => {
        particleStateRef.current = {}; // Reset state
        if (mode === 'marbleFlow') {
            const marbles = [];
            const count = p.marbles || 20;
            for (let i = 0; i < count; i++) {
                marbles.push({
                    x: (Math.random() - 0.5) * width * 0.8,
                    vx: (Math.random() - 0.5) * 1,
                    y: 0,
                    color: `hsl(${i * (360 / count)}, 80%, 70%)`,
                });
            }
            particleStateRef.current = { particles: marbles };
        } else if (mode === 'fluidField') {
            const particles = [];
            const count = p.particleCount || 200;
            if (algorithm === 'v2') { // Gravity Wells
                const wells = [];
                for(let i=0; i < (p.numWells || 5); i++) {
                    wells.push({ x: (i / ((p.numWells || 5) -1) - 0.5) * width * 0.8, y: 0 });
                }
                particleStateRef.current = { wells };
            }

            for (let i = 0; i < count; i++) {
                particles.push({
                    x: (Math.random() - 0.5) * width,
                    y: (Math.random() - 0.5) * height,
                    vx: 0, vy: 0,
                    life: Math.random() * 200,
                });
            }
            particleStateRef.current.particles = particles;
        } else if (mode === 'neural') {
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
            particleStateRef.current = { network, signalCounter: 0 };
        } else if (mode === 'origami' && algorithm === 'v0') {
            const segments = p.segments || 40;
            const strip = { points: [], angles: [] };
            for(let i=0; i < segments; i++) {
                strip.points.push({x:0, y:0});
                strip.angles.push(0);
            }
            particleStateRef.current = { strip };
        }
    };
    
    initializeState();
  }, [mode, algorithm, parameters, canvasRef]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const render = (time: number) => {
        if (isPlaying) {
            timeRef.current = time * 0.001;
        }
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const yOffset = useAdaptiveCentering ? -controlsHeight / 2 : 0;

        ctx.save();
        ctx.translate(rect.width / 2, rect.height / 2 + yOffset);
        ctx.scale(zoom, zoom);
        ctx.rotate(rotation.y);
        
        const t = timeRef.current;
        const p = parameters;
        const f = parsedFunction || (() => 0);
        
        switch (mode) {
            case 'marbleFlow': {
                const particles = particleStateRef.current.particles || [];
                const w = rect.width / zoom;
                const gravity = p.gravity || 0.2;
                const damping = 1 - (p.damping || 0.05);

                // Draw the function curve
                ctx.beginPath();
                ctx.strokeStyle = `hsla(200, 50%, 50%, 0.5)`;
                ctx.lineWidth = 1 / zoom;
                const step = 5;
                for (let i = -w / 2; i <= w / 2; i += step) {
                    const y = f(i / 100, t, 1, 1, 1) * 50;
                    if (i === -w / 2) {
                        ctx.moveTo(i, y);
                    } else {
                        ctx.lineTo(i, y);
                    }
                }
                ctx.stroke();

                // Update and draw marbles
                particles.forEach((marble: any) => {
                    const slope = getDerivative(f, marble.x / 100, t, 1, 1, 1);
                    const angle = Math.atan(slope);
                    const force_x = gravity * Math.sin(angle) * Math.cos(angle);
                    
                    marble.vx += force_x;
                    marble.vx *= damping;
                    marble.x += marble.vx;

                    marble.y = f(marble.x / 100, t, 1, 1, 1) * 50;

                    if (marble.x < -w / 2 || marble.x > w / 2) {
                        marble.x = (Math.random() - 0.5) * w * 0.8;
                        marble.vx = (Math.random() - 0.5) * 1;
                    }

                    ctx.beginPath();
                    ctx.arc(marble.x, marble.y, 4 / zoom, 0, Math.PI * 2);
                    ctx.fillStyle = marble.color;
                    ctx.fill();
                });
                break;
            }
            case 'fluidField': {
                const particles = particleStateRef.current.particles || [];
                const w = rect.width / zoom;
                const h = rect.height / zoom;

                if (algorithm === 'v1') { // Vortex
                    const vortexStrength = (p.vortexStrength || 5);
                    const radialForce = (p.radialForce || 1);
                    particles.forEach((pt: any) => {
                        const dx = pt.x;
                        const dy = pt.y;
                        const dist = Math.hypot(dx, dy) || 1;
                        const angle = Math.atan2(dy, dx);
                        
                        const funcVal = f(dist / 100, t, 1, 1, 1);
                        
                        const tangentialVel = vortexStrength * funcVal / dist;
                        const radialVel = radialForce * (1 - dist / (Math.max(w,h)/2));
                        
                        pt.x += Math.cos(angle + Math.PI/2) * tangentialVel + Math.cos(angle) * radialVel;
                        pt.y += Math.sin(angle + Math.PI/2) * tangentialVel + Math.sin(angle) * radialVel;

                        if (dist > Math.max(w, h) / 2) {
                            pt.x = (Math.random() - 0.5) * 20; pt.y = (Math.random() - 0.5) * 20;
                        }
                        
                        ctx.beginPath();
                        ctx.arc(pt.x, pt.y, 1 / zoom, 0, Math.PI * 2);
                        ctx.fillStyle = `hsla(${(dist + t * 50) % 360}, 70%, 60%, 0.8)`;
                        ctx.fill();
                    });

                } else if (algorithm === 'v2') { // Gravity Wells
                    const wells = particleStateRef.current.wells || [];
                    const gravityStrength = (p.gravityStrength || 50) / 1000;
                    
                    wells.forEach((well:any, i:number) => {
                       well.mass = f(i, t, 1, 1, 1);
                    });

                    particles.forEach((pt: any) => {
                        let fx = 0, fy = 0;
                        wells.forEach((well:any) => {
                            const dx = well.x - pt.x;
                            const dy = well.y - pt.y;
                            const distSq = dx * dx + dy * dy + 100; // +100 to avoid singularity
                            const force = gravityStrength * well.mass / distSq;
                            fx += force * dx;
                            fy += force * dy;
                        });
                        
                        pt.vx += fx; pt.vy += fy;
                        pt.vx *= 0.95; pt.vy *= 0.95; // Damping
                        pt.x += pt.vx; pt.y += pt.vy;

                        if (pt.x < -w/2 || pt.x > w/2 || pt.y < -h/2 || pt.y > h/2) {
                             pt.x = (Math.random() - 0.5) * w; pt.y = (Math.random() - 0.5) * h;
                             pt.vx = 0; pt.vy = 0;
                        }
                        
                        ctx.beginPath();
                        ctx.arc(pt.x, pt.y, 1 / zoom, 0, Math.PI * 2);
                        ctx.fillStyle = `hsla(${(pt.x / w * 100 + t * 50) % 360}, 70%, 60%, 0.8)`;
                        ctx.fill();
                    });
                } else { // v0
                    const flowSpeed = p.flowSpeed || 1.5;
                    const noise = (p.noise || 0.5) * 2;
                    particles.forEach((pt: any) => {
                        const slope = getDerivative(f, pt.x / 100, t, 1, 1, 1);
                        const angle = Math.atan(slope);
                        pt.x += Math.cos(angle) * flowSpeed + (Math.random() - 0.5) * noise;
                        pt.y += Math.sin(angle) * flowSpeed + (Math.random() - 0.5) * noise;
                        pt.life -= 1;
                        if (pt.x < -w/2 || pt.x > w/2 || pt.y < -h/2 || pt.y > h/2 || pt.life <= 0) {
                            pt.x = (Math.random() - 0.5) * w; pt.y = (Math.random() - 0.5) * h; pt.life = 200;
                        }
                        ctx.beginPath();
                        ctx.arc(pt.x, pt.y, 1 / zoom, 0, Math.PI * 2);
                        ctx.fillStyle = `hsla(${(pt.x / w * 100 + t * 50) % 360}, 70%, 60%, 0.8)`;
                        ctx.fill();
                    });
                }
                break;
            }
            case 'neural': {
                if (particleStateRef.current.network) {
                    const { network } = particleStateRef.current;
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
                                        particleStateRef.current.signalCounter++;
                                        network.signals.push({
                                            fromLayer: 0, fromNeuron: s.toNeuron,
                                            toLayer: 0, toNeuron: neighborIdx,
                                            progress: 0, activated: false,
                                            hue: (particleStateRef.current.signalCounter * 20) % 360,
                                        });
                                    }
                                });
                            } else if (s.toLayer < network.layers.length - 1) {
                                const nextLayerIdx = s.toLayer + 1;
                                const activationValue = f(s.toNeuron, t, 1, 1, 1);
                                
                                network.layers[nextLayerIdx].forEach((_:any, nextNeuronIdx:number) => {
                                    if (Math.random() < Math.abs(activationValue)) {
                                        particleStateRef.current.signalCounter++;
                                        network.signals.push({
                                            fromLayer: s.toLayer, fromNeuron: s.toNeuron,
                                            toLayer: nextLayerIdx, toNeuron: nextNeuronIdx,
                                            progress: 0, activated: false,
                                            hue: (particleStateRef.current.signalCounter * 20) % 360,
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

                    if (isPlaying && Math.random() < 0.02) {
                        if (algorithm === 'v3') {
                            const startNeuronIdx = Math.floor(Math.random() * network.layers[0].length);
                            const startNeuron = network.layers[0][startNeuronIdx];
                            if(t - startNeuron.lastActivationTime > 1.0) { // Longer cooldown for random trigger
                                startNeuron.activation = 1;
                                startNeuron.lastActivationTime = t;
                                const numNodes = network.layers[0].length;
                                const neighbors = [(startNeuronIdx + 1) % numNodes, (startNeuronIdx - 1 + numNodes) % numNodes];
                                neighbors.forEach(neighborIdx => {
                                    particleStateRef.current.signalCounter++;
                                    network.signals.push({
                                        fromLayer: 0, fromNeuron: startNeuronIdx,
                                        toLayer: 0, toNeuron: neighborIdx,
                                        progress: 0, activated: false,
                                        hue: (particleStateRef.current.signalCounter * 20) % 360,
                                    });
                                });
                            }
                        } else {
                            const startNeuronIdx = Math.floor(Math.random() * network.layers[0].length);
                            network.layers[0][startNeuronIdx].activation = 1;
                            if (network.layers.length > 1) {
                                network.layers[1].forEach((_, nextNeuronIdx) => {
                                    particleStateRef.current.signalCounter++;
                                    network.signals.push({
                                        fromLayer: 0, fromNeuron: startNeuronIdx,
                                        toLayer: 1, toNeuron: nextNeuronIdx,
                                        progress: 0, activated: false,
                                        hue: (particleStateRef.current.signalCounter * 20) % 360,
                                    });
                                });
                            }
                        }
                    }
                }
                break;
            }
            case 'origami': {
                const foldStrength = p.foldStrength || 1.0;
                ctx.strokeStyle = `hsl(${(t * 50) % 360}, 80%, 70%)`;
                ctx.lineWidth = 2 / zoom;

                if (algorithm === 'v1') { // Radial
                    const arms = p.arms || 8;
                    const segments = p.segments || 20;
                    const segmentLength = (Math.min(rect.width, rect.height) * 0.4 / segments) / zoom;
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
                    if (particleStateRef.current.strip) {
                        const { strip } = particleStateRef.current;
                        const segments = p.segments || 40;
                        const segmentLength = (rect.width * 0.8 / segments) / zoom;
                        const inertia = p.foldInertia || 0.95;
                        strip.points[0] = { x: -rect.width * 0.4 / zoom, y: 0 };
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
                break;
            }
            case 'crystal': {
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
                    const num = Math.floor(Math.max(rect.width, rect.height) / gridSize / 2 / zoom);
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
                break;
            }
            case 'synapticGrowth': {
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
                break;
            }
            // All other cases remain unchanged...
            case 'quantum':
                for (let i = 0; i < (p.particles || 100); i++) {
                    const x = (i / (p.particles||100) - 0.5) * 400;
                    const y = f(x / 100, t, 1, 1, 1) * 50 + Math.sin(i * (p.frequency||0.1) + t) * 20;
                    ctx.fillStyle = `hsla(${200 + y}, 70%, 60%, 0.8)`;
                    ctx.beginPath();
                    ctx.arc(x, y, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
            
            case 'morph':
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
                for (let i = 0; i < (p.branches || 8); i++) {
                    const angle = (i / (p.branches||8)) * Math.PI * 2;
                    drawBranch(0, 0, angle, 50 + (p.growth||20), 5, baseThickness);
                }
                break;
            case 'phase':
                for (let i = 0; i < (p.particles||20); i++) {
                    const angle = (i / (p.particles||20)) * Math.PI * 2 + t;
                    const radius = (p.radius||80) + f(angle, t, 1, 1, 1) * 30;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    ctx.fillStyle = `hsla(${320 + i * 15}, 90%, 65%, 0.8)`;
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
            case 'graph':
                const nodes = [];
                for (let i = 0; i < (p.nodes||12); i++) {
                    const angle = (i / (p.nodes||12)) * Math.PI * 2;
                    const radius = 100 + f(i, t, 1, 1, 1) * 30;
                    nodes.push({ x: Math.cos(angle + t * 0.1) * radius, y: Math.sin(angle + t * 0.1) * radius });
                }
                ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
                ctx.lineWidth = 1;
                for (let i = 0; i < (p.nodes||12); i++) {
                    for (let j = i + 1; j < (p.nodes||12); j++) {
                        const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
                        if (dist < 100 * (p.connectivity || 0.4)) {
                            ctx.beginPath();
                            ctx.moveTo(nodes[i].x, nodes[i].y);
                            ctx.lineTo(nodes[j].x, nodes[j].y);
                            ctx.stroke();
                        }
                    }
                }
                nodes.forEach((pos, i) => {
                    ctx.fillStyle = `hsla(${180 + i * 25}, 70%, 60%, 0.9)`;
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
                    ctx.fill();
                });
                break;
            case 'hyperbolic':
                const scale = p.scale || 100;
                for(let i = 0; i < (p.points || 200); i++) {
                    const angle = i * (Math.PI * (3 - Math.sqrt(5)));
                    const r = Math.sqrt(i / (p.points||200)) * scale;
                    const x = r * Math.cos(angle);
                    const y = r * Math.sin(angle);
                    const z = f(Math.hypot(x,y)/scale, t, 1, 1, 1) + 1;
                    const hx = x / z;
                    const hy = y / z;

                    ctx.fillStyle = `hsl(${(i * 0.5 + t * 20) % 360}, 80%, 70%)`;
                    ctx.beginPath();
                    ctx.arc(hx, hy, 1.5, 0, 2 * Math.PI);
                    ctx.fill();
                }
                break;
            case 'zeta':
                const halfHeight = rect.height / 2 / zoom;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.lineWidth = 1 / zoom;
                ctx.beginPath();
                ctx.moveTo(0, -halfHeight);
                ctx.lineTo(0, halfHeight);
                ctx.stroke();

                const zeros = [14.13, 21.02, 25.01, 30.42, 32.93, 37.58, 40.91, 43.32, 48.00, 49.77];
                for (let i = 0; i < (p.density || 400); i++) {
                    const yDrift = Math.sin(t * 0.1 + i) * 10;
                    const baseZeroY = zeros[i % zeros.length] * (p.spread||5) * (1 + Math.floor(i / zeros.length) * 0.5);
                    const zeroY = baseZeroY + yDrift;
                    const x = f(zeroY / 100, t, 1, 1, 1) * 30;
                    const size = 2 + Math.sin(t * 2 + zeroY * 0.1) * 1.5;
                    
                    ctx.fillStyle = `hsla(${180 + zeroY % 180}, 80%, 70%, 0.8)`;
                    ctx.beginPath();
                    ctx.arc(x, zeroY, size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(x, -zeroY, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
            case 'homology':
                const points = [];
                const range = 200;
                for (let i=0; i < (p.points||50); i++) {
                    const x = (i / (p.points||50) - 0.5) * range * 2;
                    const y = f(x / 100, t, 1, 1, 1) * 50;
                    points.push({x, y, id: i});
                }

                const filtrationRadius = (Math.sin(t * 0.5 * ((p.filtrationSpeed||20) / 20)) * 0.5 + 0.5) * 80;
                
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
                            ctx.globalAlpha = 1;
                        }
                    }
                }
                
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
                break;
        }

        // Default case for fiber, to avoid breaking on render loop start
        if (mode === 'fiber') {
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
        }


        ctx.restore();
        animationFrameId.current = requestAnimationFrame(render);
    };

    render(0);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [mode, algorithm, parameters, isPlaying, parsedFunction, rotation, zoom, canvasRef, handleInteractionMove, useAdaptiveCentering, controlsHeight]);
  
  return { rotation, zoom, resetView };
};