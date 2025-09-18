import type { VisualizationModule, VisualizationInitParams, VisualizationRenderParams } from '../types';

type Node = {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    degree: number;
};

type Edge = {
    source: number;
    target: number;
};

type Graph = {
    nodes: Node[];
    edges: Edge[];
};

const init = (params: VisualizationInitParams) => {
    const { canvas, parameters: p, algorithm } = params;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    switch (algorithm) {
        case 'v1': { // Force-Directed
            const numNodes = p.nodes || 20;
            const nodes: Node[] = [];
            for (let i = 0; i < numNodes; i++) {
                nodes.push({
                    id: i,
                    x: (Math.random() - 0.5) * width * 0.5,
                    y: (Math.random() - 0.5) * height * 0.5,
                    vx: 0, vy: 0, degree: 0,
                });
            }
             const edges: Edge[] = [];
             // Initial random connections
             for (let i = 0; i < numNodes; i++) {
                for (let j = i + 1; j < numNodes; j++) {
                   if(Math.random() < 0.2) {
                       edges.push({source: i, target: j})
                   }
                }
            }
            return { graph: { nodes, edges } };
        }
        case 'v2': { // Preferential Attachment
            const initialNodes = p.initialNodes || 3;
            const nodes: Node[] = [];
            const edges: Edge[] = [];
            for (let i = 0; i < initialNodes; i++) {
                nodes.push({
                    id: i,
                    x: Math.cos(i/initialNodes * Math.PI*2) * 50,
                    y: Math.sin(i/initialNodes * Math.PI*2) * 50,
                    vx: 0, vy: 0, degree: 0
                });
            }
            // Create a complete graph initially
            for (let i = 0; i < initialNodes; i++) {
                for (let j = i + 1; j < initialNodes; j++) {
                    edges.push({ source: i, target: j });
                    nodes[i].degree++;
                    nodes[j].degree++;
                }
            }
            return { graph: { nodes, edges }, lastGrowthTime: 0 };
        }
        case 'v3': { // Small-World
            const numNodes = p.nodes || 30;
            const k = p.neighbors || 4;
            const nodes: Node[] = [];
            const edges: Edge[] = [];
            const radius = Math.min(width, height) * 0.4;
            for (let i = 0; i < numNodes; i++) {
                const angle = (i / numNodes) * Math.PI * 2;
                nodes.push({
                    id: i,
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius,
                    vx: 0, vy: 0, degree: 0,
                });
            }
            // Create ring lattice
            for (let i = 0; i < numNodes; i++) {
                for (let j = 1; j <= k / 2; j++) {
                    const target = (i + j) % numNodes;
                    edges.push({ source: i, target });
                }
            }
            return { baseGraph: { nodes, edges } };
        }
        default: // v0
            return {};
    }
};

const render = (params: VisualizationRenderParams) => {
    const { ctx, t, f, p, state, zoom } = params;

    switch (params.algorithm) {
        case 'v1': { // Force-Directed
            const { graph } = state;
            if (!graph) return;
            
            const stiffness = p.stiffness || 0.02;
            const repulsion = p.repulsion || 200;
            const lengthMod = p.lengthMod || 1.0;
            
            // 1. Calculate forces
            graph.nodes.forEach((nodeA: Node) => {
                let fx = 0;
                let fy = 0;

                // Repulsion from other nodes
                graph.nodes.forEach((nodeB: Node) => {
                    if (nodeA.id === nodeB.id) return;
                    const dx = nodeA.x - nodeB.x;
                    const dy = nodeA.y - nodeB.y;
                    const distSq = dx * dx + dy * dy || 1;
                    const force = repulsion / distSq;
                    fx += (dx / Math.sqrt(distSq)) * force;
                    fy += (dy / Math.sqrt(distSq)) * force;
                });

                // Attraction from connected nodes
                graph.edges.forEach((edge: Edge) => {
                    let source, target;
                    if (edge.source === nodeA.id) { source = nodeA; target = graph.nodes[edge.target]; }
                    else if (edge.target === nodeA.id) { source = nodeA; target = graph.nodes[edge.source]; }
                    else return;

                    const dx = target.x - source.x;
                    const dy = target.y - source.y;
                    const dist = Math.hypot(dx, dy) || 1;
                    
                    const midX_norm = ( (source.x + target.x) / 2 ) / 200;
                    const funcVal = f(midX_norm, t, 1, 1, 1);
                    const idealLength = 100 * (1 + funcVal * lengthMod);
                    
                    const force = stiffness * (dist - idealLength);
                    fx += (dx / dist) * force;
                    fy += (dy / dist) * force;
                });

                // Central gravity
                fx -= nodeA.x * 0.001;
                fy -= nodeA.y * 0.001;

                // 2. Update physics
                nodeA.vx = (nodeA.vx + fx) * 0.95; // Damping
                nodeA.vy = (nodeA.vy + fy) * 0.95;
                nodeA.x += nodeA.vx;
                nodeA.y += nodeA.vy;
            });

            // 3. Draw
            drawGraph(ctx, graph, zoom);
            break;
        }
        case 'v2': { // Preferential Attachment
            const { graph } = state;
            if (!graph) return;

            const growthRate = p.growthRate || 2.0;
            const attractionMod = p.attractionMod || 1.0;

            if (t - state.lastGrowthTime > growthRate && graph.nodes.length < 150) {
                state.lastGrowthTime = t;
                const newNodeId = graph.nodes.length;
                const newNode: Node = {
                    id: newNodeId, x: 0, y: 0, vx: 0, vy: 0, degree: 0
                };
                graph.nodes.push(newNode);

                let totalAttractiveness = 0;
                graph.nodes.forEach((node: Node) => {
                    if (node.id === newNodeId) return;
                    const funcVal = f(node.x / 200, t, 1, 1, 1); // Attractiveness based on position
                    totalAttractiveness += node.degree + Math.max(0, funcVal * attractionMod * 5);
                });
                
                const edgesPerNode = p.edgesPerNode || 2;
                for (let i = 0; i < edgesPerNode; i++) {
                    let random = Math.random() * totalAttractiveness;
                    for (const node of graph.nodes) {
                        if (node.id === newNodeId) continue;
                        const funcVal = f(node.x / 200, t, 1, 1, 1);
                        const attractiveness = node.degree + Math.max(0, funcVal * attractionMod * 5);
                        if (random < attractiveness) {
                            if (!graph.edges.some((e: Edge) => (e.source === newNodeId && e.target === node.id) || (e.source === node.id && e.target === newNodeId))) {
                                graph.edges.push({ source: newNodeId, target: node.id });
                                newNode.degree++;
                                node.degree++;
                                break;
                            }
                        }
                        random -= attractiveness;
                    }
                }
            }

            simpleForceLayout(graph);
            drawGraph(ctx, graph, zoom);
            break;
        }
        case 'v3': { // Small-World
            const { baseGraph } = state;
            if (!baseGraph) return;

            const baseRewireProb = p.rewireProb || 0.1;
            const rewireMod = p.rewireMod || 0.2;
            
            baseGraph.edges.forEach((edge: Edge) => {
                const nodeA = baseGraph.nodes[edge.source];
                const nodeB = baseGraph.nodes[edge.target];
                const funcVal = f(nodeA.id / baseGraph.nodes.length * 2 - 1, t, 1, 1, 1);
                const localRewireProb = baseRewireProb + funcVal * rewireMod;

                if (Math.random() < localRewireProb) {
                    const randomNode = baseGraph.nodes[Math.floor(Math.random() * baseGraph.nodes.length)];
                    ctx.beginPath();
                    ctx.moveTo(nodeA.x, nodeA.y);
                    ctx.lineTo(randomNode.x, randomNode.y);
                    ctx.strokeStyle = `hsla(60, 80%, 70%, 0.7)`;
                    ctx.lineWidth = 1.5 / zoom;
                    ctx.stroke();
                } else {
                    ctx.beginPath();
                    ctx.moveTo(nodeA.x, nodeA.y);
                    ctx.lineTo(nodeB.x, nodeB.y);
                    ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
                    ctx.lineWidth = 1 / zoom;
                    ctx.stroke();
                }
            });

            baseGraph.nodes.forEach((node: Node) => {
                const funcVal = f(node.id / baseGraph.nodes.length * 2 - 1, t, 1, 1, 1);
                ctx.fillStyle = `hsla(${180 + funcVal * 50}, 70%, 60%, 0.9)`;
                ctx.beginPath();
                ctx.arc(node.x, node.y, 4 / zoom, 0, Math.PI * 2);
                ctx.fill();
            });
            break;
        }
        default: { // v0 - Dynamic Topology
            const nodes = [];
            const numNodes = p.nodes || 12;

            for (let i = 0; i < numNodes; i++) {
                const angle = (i / numNodes) * Math.PI * 2;
                const radius = 100 + f(i, t, 1, 1, 1) * 30;
                nodes.push({ x: Math.cos(angle + t * 0.1) * radius, y: Math.sin(angle + t * 0.1) * radius });
            }

            ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
            ctx.lineWidth = 1 / zoom;

            for (let i = 0; i < numNodes; i++) {
                for (let j = i + 1; j < numNodes; j++) {
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
                ctx.arc(pos.x, pos.y, 5 / zoom, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }
};

function simpleForceLayout(graph: Graph) {
    graph.nodes.forEach((nodeA: Node) => {
        let fx = -nodeA.x * 0.01;
        let fy = -nodeA.y * 0.01;
        
        graph.nodes.forEach((nodeB: Node) => {
             if(nodeA.id === nodeB.id) return;
             const dx = nodeA.x - nodeB.x;
             const dy = nodeA.y - nodeB.y;
             const distSq = dx*dx + dy*dy || 1;
             fx += (dx / distSq) * 50;
             fy += (dy / distSq) * 50;
        });

        graph.edges.forEach(edge => {
            let other;
            if (edge.source === nodeA.id) other = graph.nodes[edge.target];
            else if (edge.target === nodeA.id) other = graph.nodes[edge.source];
            else return;
            
            const dx = other.x - nodeA.x;
            const dy = other.y - nodeA.y;
            fx += dx * 0.01;
            fy += dy * 0.01;
        });

        nodeA.vx = (nodeA.vx + fx) * 0.9;
        nodeA.vy = (nodeA.vy + fy) * 0.9;
        nodeA.x += nodeA.vx;
        nodeA.y += nodeA.vy;
    });
}

function drawGraph(ctx: CanvasRenderingContext2D, graph: Graph, zoom: number) {
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
    ctx.lineWidth = 1 / zoom;
    graph.edges.forEach((edge: Edge) => {
        const source = graph.nodes[edge.source];
        const target = graph.nodes[edge.target];
        if (source && target) {
            ctx.beginPath();
            ctx.moveTo(source.x, source.y);
            ctx.lineTo(target.x, target.y);
            ctx.stroke();
        }
    });

    graph.nodes.forEach((node: Node) => {
        ctx.fillStyle = `hsla(${180 + node.degree * 25}, 70%, 60%, 0.9)`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, (4 + node.degree * 0.5) / zoom, 0, Math.PI * 2);
        ctx.fill();
    });
}

export const graph: VisualizationModule = {
    init,
    render
};
