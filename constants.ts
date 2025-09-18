import type { ProjectionMode, SonificationEngine } from './types';
import { GitBranch, Waves, Grid3x3, Activity, Globe, Zap, Compass, Atom, GitMerge, Orbit, Wind, BrainCircuit, Layers, Share2, Flower2, Infinity } from 'lucide-react';

export const PROJECTION_MODES: ProjectionMode[] = [
  { 
    id: 'fiber', name: 'Fiber Bundle', icon: GitBranch, description: 'Functions as twisted ribbons in space.',
    algorithms: [
      { id: 'v0', name: 'V0', parameters: [
        { id: 'amplitude', name: 'Amplitude', min: 10, max: 100, step: 1, defaultValue: 40 },
        { id: 'points', name: 'Points', min: 50, max: 400, step: 10, defaultValue: 200 },
      ]},
      { id: 'v1', name: 'V1', parameters: [
        { id: 'twist', name: 'Twist', min: 0, max: 20, step: 0.1, defaultValue: 5 },
        { id: 'amplitude', name: 'Amplitude', min: 10, max: 100, step: 1, defaultValue: 40 },
      ]},
      { id: 'v2', name: 'V2', parameters: [
        { id: 'twist', name: 'Ribbon Twist', min: 0.1, max: 10, step: 0.1, defaultValue: 2.0 },
        { id: 'amplitude', name: 'Amplitude', min: 10, max: 100, step: 1, defaultValue: 30 },
      ]},
    ]
  },
  { 
    id: 'marbleFlow', name: 'Marble Flow', icon: Orbit, description: 'Simulates marbles rolling on the function curve.',
    algorithms: [{ id: 'default', name: 'Default', parameters: [
        { id: 'marbles', name: 'Marbles', min: 5, max: 50, step: 1, defaultValue: 20 },
        { id: 'gravity', name: 'Gravity', min: 0, max: 1, step: 0.01, defaultValue: 0.2 },
        { id: 'damping', name: 'Damping', min: 0.01, max: 0.2, step: 0.01, defaultValue: 0.05 },
    ]}]
  },
  { 
    id: 'fluidField', name: 'Fluid Field', icon: Wind, description: 'Visualizes the function gradient as a vector field.',
    algorithms: [
      { id: 'v0', name: 'Classic', parameters: [
        { id: 'particleCount', name: 'Particles', min: 50, max: 500, step: 10, defaultValue: 200 },
        { id: 'flowSpeed', name: 'Flow Speed', min: 0.1, max: 5, step: 0.1, defaultValue: 1.5 },
        { id: 'noise', name: 'Noise', min: 0, max: 2, step: 0.1, defaultValue: 0.5 },
        { id: 'trailLength', name: 'Trail Length', min: 0, max: 50, step: 1, defaultValue: 10 },
        { id: 'glow', name: 'Glow', min: 0, max: 1, step: 1, defaultValue: 1 },
      ]},
      { id: 'v1', name: 'Vortex', parameters: [
        { id: 'particleCount', name: 'Particles', min: 50, max: 500, step: 10, defaultValue: 200 },
        { id: 'vortexStrength', name: 'Vortex Strength', min: 0, max: 10, step: 0.1, defaultValue: 5 },
        { id: 'radialForce', name: 'Radial Force', min: -5, max: 5, step: 0.1, defaultValue: 1 },
        { id: 'trailLength', name: 'Trail Length', min: 0, max: 50, step: 1, defaultValue: 15 },
        { id: 'glow', name: 'Glow', min: 0, max: 1, step: 1, defaultValue: 1 },
      ]},
      { id: 'v2', name: 'Gravity Wells', parameters: [
        { id: 'particleCount', name: 'Particles', min: 100, max: 2000, step: 50, defaultValue: 500 },
        { id: 'numWells', name: 'Gravity Wells', min: 1, max: 10, step: 1, defaultValue: 5 },
        { id: 'gravityStrength', name: 'Gravity Strength', min: 0, max: 100, step: 1, defaultValue: 50 },
        { id: 'trailLength', name: 'Trail Length', min: 0, max: 30, step: 1, defaultValue: 5 },
      ]},
      { id: 'v3', name: 'Lattice Deformation', parameters: [
        { id: 'gridDensity', name: 'Grid Density', min: 10, max: 40, step: 1, defaultValue: 20 },
        { id: 'deformationScale', name: 'Deformation Scale', min: 0.1, max: 5, step: 0.1, defaultValue: 1.5 },
        { id: 'damping', name: 'Damping', min: 0.8, max: 0.99, step: 0.01, defaultValue: 0.92 },
      ]},
      { id: 'v4', name: 'Curl & Divergence', parameters: [
        { id: 'particleCount', name: 'Particles', min: 50, max: 300, step: 10, defaultValue: 150 },
        { id: 'trailLength', name: 'Trail Length', min: 5, max: 30, step: 1, defaultValue: 15 },
        { id: 'fieldStrength', name: 'Field Strength', min: 0.5, max: 5, step: 0.1, defaultValue: 2.0 },
        { id: 'glow', name: 'Glow', min: 0, max: 1, step: 1, defaultValue: 1 },
      ]},
      { id: 'v5', name: 'Topological Portrait', parameters: [
        { id: 'particleCount', name: 'Particles', min: 50, max: 300, step: 10, defaultValue: 150 },
        { id: 'streamlineLength', name: 'Streamline Length', min: 10, max: 100, step: 2, defaultValue: 40 },
        { id: 'fieldStrength', name: 'Field Strength', min: 0.5, max: 5, step: 0.1, defaultValue: 2.0 },
        { id: 'colorizeSpeed', name: 'Colorize Speed', min: 0, max: 1, step: 1, defaultValue: 1 },
      ]},
    ]
  },
  { 
    id: 'neural', name: 'Neural Synapses', icon: BrainCircuit, description: 'Function as activation in a neural network.',
    algorithms: [
      { id: 'v0', name: 'V0', parameters: [
        { id: 'layers', name: 'Layers', min: 3, max: 7, step: 1, defaultValue: 4 },
        { id: 'neurons', name: 'Neurons/Layer', min: 4, max: 12, step: 1, defaultValue: 8 },
        { id: 'signalSpeed', name: 'Signal Speed', min: 0.5, max: 5, step: 0.1, defaultValue: 2.0 },
      ]},
      { id: 'v1', name: 'V1', parameters: [
        { id: 'rings', name: 'Rings', min: 2, max: 6, step: 1, defaultValue: 3 },
        { id: 'neuronsPerRing', name: 'Neurons/Ring', min: 6, max: 20, step: 1, defaultValue: 12 },
        { id: 'signalSpeed', name: 'Signal Speed', min: 0.5, max: 5, step: 0.1, defaultValue: 2.0 },
      ]},
      { id: 'v2', name: 'V2', parameters: [
        { id: 'layers', name: 'Layers', min: 3, max: 7, step: 1, defaultValue: 4 },
        { id: 'neurons', name: 'Neurons/Layer', min: 4, max: 12, step: 1, defaultValue: 8 },
        { id: 'signalSpeed', name: 'Signal Speed', min: 0.5, max: 5, step: 0.1, defaultValue: 2.0 },
        { id: 'recoilStrength', name: 'Recoil Strength', min: 0, max: 10, step: 0.5, defaultValue: 5 },
        { id: 'jitter', name: 'Jitter', min: 0, max: 50, step: 1, defaultValue: 10 },
      ]},
      { id: 'v3', name: 'V3', parameters: [
        { id: 'nodes', name: 'Nodes', min: 3, max: 20, step: 1, defaultValue: 6 },
        { id: 'signalSpeed', name: 'Signal Speed', min: 0.5, max: 5, step: 0.1, defaultValue: 2.0 },
        { id: 'recoilStrength', name: 'Recoil Strength', min: 0, max: 10, step: 0.5, defaultValue: 5 },
        { id: 'jitter', name: 'Jitter', min: 0, max: 20, step: 1, defaultValue: 2 },
      ]},
    ]
  },
  { 
    id: 'origami', name: 'Origami Fold', icon: Layers, description: 'Function defines a dynamic 2D paper fold.',
    algorithms: [
      { id: 'v0', name: 'V0', parameters: [
        { id: 'segments', name: 'Segments', min: 10, max: 80, step: 1, defaultValue: 40 },
        { id: 'foldStrength', name: 'Fold Strength', min: 0.1, max: 2, step: 0.1, defaultValue: 1.0 },
        { id: 'foldInertia', name: 'Fold Inertia', min: 0.8, max: 0.99, step: 0.01, defaultValue: 0.95 },
      ]},
      { id: 'v1', name: 'V1', parameters: [
        { id: 'arms', name: 'Arms', min: 3, max: 16, step: 1, defaultValue: 8 },
        { id: 'segments', name: 'Segments', min: 5, max: 40, step: 1, defaultValue: 20 },
        { id: 'foldStrength', name: 'Fold Strength', min: 0.1, max: 4, step: 0.1, defaultValue: 2.0 },
      ]},
      { id: 'v2', name: 'V2', parameters: [
        { id: 'depth', name: 'Depth', min: 2, max: 6, step: 1, defaultValue: 4 },
        { id: 'branchAngle', name: 'Branch Angle', min: 0, max: 1.5, step: 0.05, defaultValue: 0.8 },
        { id: 'foldStrength', name: 'Fold Strength', min: 0.1, max: 4, step: 0.1, defaultValue: 1.5 },
      ]},
    ]
  },
   { 
    id: 'eventGrowth', name: 'Event Growth', icon: Flower2, description: 'Function events trigger generative growth.',
    algorithms: [
      { id: 'v0', name: 'Forest', parameters: [
        { id: 'decay', name: 'Decay', min: 0.95, max: 0.999, step: 0.001, defaultValue: 0.99 },
        { id: 'length', name: 'Length', min: 5, max: 50, step: 1, defaultValue: 20 },
        { id: 'angle', name: 'Angle', min: 0.1, max: 1.5, step: 0.05, defaultValue: 0.5 },
        { id: 'palette', name: 'Palette', min: 0, max: 3, step: 1, defaultValue: 0 }, // 0:Plasma, 1:Fire, 2:Ocean, 3:Neon
        { id: 'evolve', name: 'Evolve', min: 0, max: 1, step: 1, defaultValue: 1 }, // 0:Off, 1:On
        { id: 'growthMode', name: 'Growth Mode', min: 0, max: 1, step: 1, defaultValue: 0 }, // 0:Organic, 1:Radial
        { id: 'renderStyle', name: 'Render Style', min: 0, max: 1, step: 1, defaultValue: 0 }, // 0:Branch, 1:Particle
      ]},
      { id: 'v1', name: 'Vines', parameters: [
        { id: 'speed', name: 'Speed', min: 0.5, max: 5, step: 0.1, defaultValue: 2 },
        { id: 'curvature', name: 'Curvature', min: 0, max: 0.5, step: 0.01, defaultValue: 0.1 },
        { id: 'length', name: 'Max Length', min: 50, max: 300, step: 5, defaultValue: 150 },
        { id: 'palette', name: 'Palette', min: 0, max: 3, step: 1, defaultValue: 1 },
        { id: 'evolve', name: 'Evolve', min: 0, max: 1, step: 1, defaultValue: 0 },
      ]},
      { id: 'v2', name: 'Pulse', parameters: [
        { id: 'density', name: 'Density', min: 5, max: 20, step: 1, defaultValue: 10 },
        { id: 'pulseSpeed', name: 'Pulse Speed', min: 1, max: 10, step: 0.2, defaultValue: 4 },
        { id: 'pulseWidth', name: 'Pulse Width', min: 10, max: 100, step: 2, defaultValue: 40 },
        { id: 'palette', name: 'Palette', min: 0, max: 3, step: 1, defaultValue: 3 },
        { id: 'evolve', name: 'Evolve', min: 0, max: 1, step: 1, defaultValue: 1 },
      ]},
    ]
  },
  { 
    id: 'quantum', name: 'Quantum Harmonic', icon: Waves, description: 'Visual representations of wavefunction behavior.',
    algorithms: [
      { id: 'v0', name: 'Interference', parameters: [
        { id: 'frequency', name: 'Base Frequency', min: 0.05, max: 0.5, step: 0.01, defaultValue: 0.1 },
        { id: 'particles', name: 'Particle Count', min: 50, max: 400, step: 10, defaultValue: 200 },
      ]},
      { id: 'v1', name: 'Probability Cloud', parameters: [
        { id: 'particles', name: 'Particle Count', min: 500, max: 5000, step: 50, defaultValue: 2000 },
        { id: 'amplitude', name: 'Wave Amplitude', min: 10, max: 150, step: 5, defaultValue: 80 },
        { id: 'jitter', name: 'Cloud Spread', min: 0, max: 50, step: 1, defaultValue: 10 },
      ]},
      { id: 'v2', name: 'Phase Orbits', parameters: [
        { id: 'gridSize', name: 'Grid Size', min: 3, max: 15, step: 1, defaultValue: 8 },
        { id: 'orbitSize', name: 'Orbit Size', min: 5, max: 50, step: 1, defaultValue: 25 },
        { id: 'trailLength', name: 'Trail Length', min: 5, max: 50, step: 1, defaultValue: 20 },
      ]},
      { id: 'v3', name: 'Wave Packet', parameters: [
        { id: 'packetWidth', name: 'Packet Width', min: 10, max: 200, step: 2, defaultValue: 80 },
        { id: 'speed', name: 'Base Speed', min: 0.5, max: 10, step: 0.1, defaultValue: 4 },
        { id: 'amplitude', name: 'Potential Amp', min: 10, max: 150, step: 5, defaultValue: 60 },
        { id: 'renderStyle', name: 'Render Style', min: 0, max: 1, step: 1, defaultValue: 0 }, // 0: Vertical, 1: Normal
        { id: 'tunneling', name: 'Tunneling', min: 0, max: 1, step: 1, defaultValue: 1 }, // 0: Off, 1: On
      ]},
    ]
  },
  { 
    id: 'crystal', name: 'Crystal Lattice', icon: Grid3x3, description: 'Functions as crystalline deformations.',
    algorithms: [
      { id: 'v0', name: 'V0', parameters: [
        { id: 'gridSize', name: 'Grid Size', min: 20, max: 60, step: 1, defaultValue: 30 },
        { id: 'deformation', name: 'Deformation', min: 1, max: 20, step: 1, defaultValue: 5 },
      ]},
      { id: 'v1', name: 'V1', parameters: [
        { id: 'gridSize', name: 'Grid Size', min: 20, max: 60, step: 1, defaultValue: 30 },
        { id: 'sizeFactor', name: 'Size Factor', min: 1, max: 15, step: 0.5, defaultValue: 8 },
      ]},
      { id: 'v2', name: 'V2', parameters: [
        { id: 'gridSize', name: 'Grid Size', min: 20, max: 60, step: 1, defaultValue: 30 },
        { id: 'rotationFactor', name: 'Rotation Factor', min: 0, max: 3.14, step: 0.05, defaultValue: 1.57 },
      ]},
      { id: 'v3', name: 'Limited Grid', parameters: [
        { id: 'gridSize', name: 'Grid Size', min: 20, max: 60, step: 1, defaultValue: 30 },
        { id: 'deformation', name: 'Deformation', min: 1, max: 20, step: 1, defaultValue: 5 },
      ]},
    ]
  },
  { 
    id: 'morph', name: 'Morphogenetic', icon: Activity, description: 'Functions as organic growth patterns.',
    algorithms: [
        { id: 'v0', name: 'V0', parameters: [
          { id: 'branches', name: 'Branches', min: 3, max: 12, step: 1, defaultValue: 8 },
          { id: 'growth', name: 'Growth Factor', min: 10, max: 50, step: 1, defaultValue: 20 },
        ]},
        { id: 'v2', name: 'V2', parameters: [
          { id: 'branches', name: 'Branches', min: 3, max: 12, step: 1, defaultValue: 6 },
          { id: 'growth', name: 'Growth', min: 10, max: 50, step: 1, defaultValue: 30 },
          { id: 'asymmetry', name: 'Asymmetry', min: -1, max: 1, step: 0.1, defaultValue: 0.5 },
        ]},
        { id: 'v3', name: 'V3', parameters: [
          { id: 'branches', name: 'Branches', min: 3, max: 12, step: 1, defaultValue: 7 },
          { id: 'growth', name: 'Growth', min: 10, max: 50, step: 1, defaultValue: 25 },
          { id: 'thickness', name: 'Thickness', min: 1, max: 5, step: 0.25, defaultValue: 2 },
        ]},
    ]
  },
  { 
    id: 'synapticGrowth', name: 'Synaptic Growth', icon: Share2, description: 'Generative growth with synaptic firing.',
    algorithms: [
        { id: 'v0', name: 'V0', parameters: [
            { id: 'branches', name: 'Branches', min: 2, max: 12, step: 1, defaultValue: 6 },
            { id: 'growth', name: 'Growth', min: 10, max: 60, step: 1, defaultValue: 40 },
            { id: 'depth', name: 'Depth', min: 3, max: 8, step: 1, defaultValue: 5 },
            { id: 'synapseRadius', name: 'Synapse Radius', min: 1, max: 30, step: 1, defaultValue: 15 },
            { id: 'symmetry', name: 'Symmetry', min: 0, max: 3, step: 1, defaultValue: 0 }, // 0: None, 1: X, 2: Y, 3: Origin
        ]},
        { id: 'v1', name: 'V1', parameters: [
            { id: 'branches', name: 'Branches', min: 2, max: 12, step: 1, defaultValue: 5 },
            { id: 'growth', name: 'Growth', min: 10, max: 60, step: 1, defaultValue: 45 },
            { id: 'depth', name: 'Depth', min: 3, max: 8, step: 1, defaultValue: 6 },
            { id: 'asymmetry', name: 'Asymmetry', min: -1, max: 1, step: 0.1, defaultValue: 0.6 },
            { id: 'synapseRadius', name: 'Synapse Radius', min: 1, max: 30, step: 1, defaultValue: 15 },
            { id: 'symmetry', name: 'Symmetry', min: 0, max: 3, step: 1, defaultValue: 0 },
        ]},
        { id: 'v2', name: 'V2', parameters: [
            { id: 'branches', name: 'Branches', min: 2, max: 12, step: 1, defaultValue: 7 },
            { id: 'growth', name: 'Growth', min: 10, max: 60, step: 1, defaultValue: 35 },
            { id: 'depth', name: 'Depth', min: 3, max: 8, step: 1, defaultValue: 5 },
            { id: 'thickness', name: 'Thickness', min: 1, max: 8, step: 0.25, defaultValue: 4 },
            { id: 'synapseRadius', name: 'Synapse Radius', min: 1, max: 30, step: 1, defaultValue: 15 },
            { id: 'symmetry', name: 'Symmetry', min: 0, max: 3, step: 1, defaultValue: 0 },
        ]}
    ]
  },
  { 
    id: 'phase', name: 'Phase Choreography', icon: Globe, description: 'Particle swarms dancing through phase space.',
    algorithms: [
      { id: 'v0', name: 'Polar Orbits', parameters: [
        { id: 'particles', name: 'Particles', min: 10, max: 100, step: 1, defaultValue: 20 },
        { id: 'radius', name: 'Base Radius', min: 50, max: 200, step: 1, defaultValue: 80 },
      ]},
      { id: 'v1', name: 'Lissajous Field', parameters: [
        { id: 'gridSize', name: 'Grid Size', min: 2, max: 10, step: 1, defaultValue: 5 },
        { id: 'baseFreq', name: 'Base Frequency', min: 1, max: 5, step: 0.1, defaultValue: 2.0 },
        { id: 'amplitude', name: 'Amplitude', min: 10, max: 100, step: 1, defaultValue: 40 },
      ]},
      { id: 'v2', name: 'Phase Portrait', parameters: [
        { id: 'particles', name: 'Particles', min: 20, max: 200, step: 5, defaultValue: 100 },
        { id: 'stiffness', name: 'Stiffness (k)', min: 0, max: 2, step: 0.05, defaultValue: 1.0 },
        { id: 'damping', name: 'Damping (d)', min: 0, max: 1, step: 0.01, defaultValue: 0.1 },
        { id: 'force', name: 'Function Force', min: 0, max: 5, step: 0.1, defaultValue: 1.0 },
      ]},
      { id: 'v3', name: 'Coupled Oscillators', parameters: [
        { id: 'oscillators', name: 'Oscillators', min: 10, max: 100, step: 1, defaultValue: 30 },
        { id: 'coupling', name: 'Coupling (K)', min: 0, max: 2, step: 0.05, defaultValue: 0.5 },
        { id: 'freqMod', name: 'Frequency Mod', min: 0, max: 3, step: 0.1, defaultValue: 1.0 },
      ]},
    ]
  },
  { 
    id: 'graph', name: 'Graph Evolution', icon: Zap, description: 'Dynamic network topology changes.',
    algorithms: [
      { id: 'v0', name: 'Dynamic Topology', parameters: [
        { id: 'nodes', name: 'Nodes', min: 8, max: 24, step: 1, defaultValue: 12 },
        { id: 'connectivity', name: 'Connectivity', min: 0.1, max: 0.9, step: 0.05, defaultValue: 0.4 },
      ]},
      { id: 'v1', name: 'Force-Directed', parameters: [
        { id: 'nodes', name: 'Nodes', min: 10, max: 40, step: 1, defaultValue: 20 },
        { id: 'stiffness', name: 'Stiffness', min: 0.001, max: 0.1, step: 0.001, defaultValue: 0.02 },
        { id: 'repulsion', name: 'Repulsion', min: 10, max: 500, step: 10, defaultValue: 200 },
        { id: 'lengthMod', name: 'Length Mod', min: 0, max: 2, step: 0.1, defaultValue: 1.0 },
      ]},
      { id: 'v2', name: 'Preferential Attachment', parameters: [
        { id: 'initialNodes', name: 'Initial Nodes', min: 2, max: 5, step: 1, defaultValue: 3 },
        { id: 'growthRate', name: 'Growth Rate (s)', min: 0.5, max: 5, step: 0.1, defaultValue: 2.0 },
        { id: 'edgesPerNode', name: 'Edges per Node', min: 1, max: 4, step: 1, defaultValue: 2 },
        { id: 'attractionMod', name: 'Attraction Mod', min: 0, max: 5, step: 0.1, defaultValue: 1.0 },
      ]},
      { id: 'v3', name: 'Small-World', parameters: [
        { id: 'nodes', name: 'Nodes', min: 10, max: 50, step: 1, defaultValue: 30 },
        { id: 'neighbors', name: 'Neighbors (k)', min: 2, max: 8, step: 2, defaultValue: 4 },
        { id: 'rewireProb', name: 'Base Rewire', min: 0, max: 0.5, step: 0.01, defaultValue: 0.1 },
        { id: 'rewireMod', name: 'Rewire Mod', min: 0, max: 0.5, step: 0.01, defaultValue: 0.2 },
      ]},
    ]
  },
  { 
    id: 'hyperbolic', name: 'Hyperbolic', icon: Compass, description: 'Projection in a hyperbolic plane.',
    algorithms: [
      { id: 'v0', name: 'Poincaré Depth', parameters: [
        { id: 'scale', name: 'Scale', min: 50, max: 200, step: 5, defaultValue: 100 },
        { id: 'points', name: 'Points', min: 100, max: 500, step: 10, defaultValue: 200 },
      ]},
      { id: 'v1', name: 'Poincaré Twist', parameters: [
        { id: 'scale', name: 'Scale', min: 50, max: 200, step: 5, defaultValue: 100 },
        { id: 'points', name: 'Points', min: 100, max: 500, step: 10, defaultValue: 250 },
        { id: 'twist', name: 'Twist', min: 0.1, max: 5, step: 0.1, defaultValue: 1.0 },
      ]},
      { id: 'v2', name: 'Upper Half-Plane', parameters: [
        { id: 'gridSize', name: 'Grid Size', min: 10, max: 50, step: 1, defaultValue: 20 },
        { id: 'amplitude', name: 'Amplitude', min: 10, max: 100, step: 1, defaultValue: 50 },
      ]},
      { id: 'v3', name: 'Warped Grid', parameters: [
        { id: 'rings', name: 'Rings', min: 3, max: 20, step: 1, defaultValue: 10 },
        { id: 'spokes', name: 'Spokes', min: 6, max: 48, step: 1, defaultValue: 24 },
        { id: 'warp', name: 'Warp', min: 0, max: 0.5, step: 0.01, defaultValue: 0.2 },
      ]},
    ]
  },
  { 
    id: 'zeta', name: 'Zeta Scattering', icon: Atom, description: 'Zeros of the Riemann Zeta function as resonant states.',
    algorithms: [
      { id: 'v0', name: 'Point Scattering', parameters: [
        { id: 'density', name: 'Density', min: 100, max: 1000, step: 10, defaultValue: 400 },
        { id: 'spread', name: 'Spread', min: 1, max: 10, step: 0.5, defaultValue: 5 },
      ]},
      { id: 'v1', name: 'Resonant String', parameters: [
        { id: 'numZeros', name: 'Zeros', min: 5, max: 50, step: 1, defaultValue: 20 },
        { id: 'amplitude', name: 'Amplitude', min: 10, max: 150, step: 1, defaultValue: 80 },
        { id: 'spread', name: 'Spread', min: 1, max: 10, step: 0.5, defaultValue: 5 },
      ]},
      { id: 'v2', name: 'Scattering Landscape', parameters: [
        { id: 'particles', name: 'Particles', min: 20, max: 100, step: 1, defaultValue: 50 },
        { id: 'potentialAmp', name: 'Potential Amp', min: 10, max: 150, step: 1, defaultValue: 50 },
        { id: 'energyScale', name: 'Energy Scale', min: 0.1, max: 2, step: 0.05, defaultValue: 1.0 },
      ]},
      { id: 'v3', name: 'Phase Shift Resonances', parameters: [
        { id: 'numZeros', name: 'Zeros', min: 3, max: 15, step: 1, defaultValue: 8 },
        { id: 'spread', name: 'Spread', min: 10, max: 40, step: 1, defaultValue: 20 },
        { id: 'phaseMod', name: 'Phase Mod', min: 0, max: 5, step: 0.1, defaultValue: 2.0 },
      ]},
    ]
  },
  {
    id: 'homology', name: 'Persistent Homology', icon: GitMerge, description: 'Topological features persisting across scales.',
    algorithms: [
      { id: 'v0', name: 'Classic Graph', parameters: [
        { id: 'points', name: 'Points', min: 20, max: 100, step: 1, defaultValue: 60 },
        { id: 'filtrationSpeed', name: 'Filtration Speed', min: 5, max: 50, step: 1, defaultValue: 25 },
        { id: 'amplitude', name: 'Amplitude', min: 10, max: 100, step: 1, defaultValue: 50 },
        { id: 'range', name: 'X-Axis Range', min: 50, max: 400, step: 10, defaultValue: 200 },
      ]},
      { id: 'v1', name: 'Density Cloud', parameters: [
        { id: 'points', name: 'Points', min: 20, max: 100, step: 1, defaultValue: 50 },
        { id: 'filtrationSpeed', name: 'Filtration Speed', min: 5, max: 50, step: 1, defaultValue: 20 },
        { id: 'updateRate', name: 'Update Rate', min: 1, max: 50, step: 1, defaultValue: 10 },
      ]},
      { id: 'v2', name: 'Level Set Filtration', parameters: [
        { id: 'gridSize', name: 'Grid Size', min: 20, max: 80, step: 2, defaultValue: 50 },
        { id: 'filtrationSpeed', name: 'Filtration Speed', min: 5, max: 50, step: 1, defaultValue: 20 },
        { id: 'noise', name: 'Noise', min: 0, max: 1, step: 0.05, defaultValue: 0.2 },
        { id: 'palette', name: 'Palette', min: 0, max: 3, step: 1, defaultValue: 0 },
      ]},
      { id: 'v3', name: 'Persistence Barcodes', parameters: [
        { id: 'points', name: 'Points', min: 20, max: 80, step: 1, defaultValue: 40 },
        { id: 'noise', name: 'Noise', min: 0, max: 1, step: 0.05, defaultValue: 0.1 },
        { id: 'maxRadius', name: 'Max Radius', min: 20, max: 200, step: 5, defaultValue: 100 },
      ]},
    ]
  },
  { 
    id: 'attractor', name: 'Chaotic Attractor', icon: Infinity, description: 'Function perturbs the parameters of a chaotic attractor.',
    algorithms: [
      { id: 'v0', name: 'Lorenz', parameters: [
        { id: 'sigma', name: 'Sigma (σ)', min: 1, max: 20, step: 0.1, defaultValue: 10 },
        { id: 'rho', name: 'Rho (ρ)', min: 1, max: 50, step: 0.1, defaultValue: 28 },
        { id: 'beta', name: 'Beta (β)', min: 0.1, max: 5, step: 0.01, defaultValue: 2.667 },
        { id: 'points', name: 'Trail Length', min: 100, max: 2000, step: 10, defaultValue: 1000 },
      ]},
      { id: 'v1', name: 'Rössler', parameters: [
        { id: 'a', name: 'a', min: 0.1, max: 0.5, step: 0.01, defaultValue: 0.2 },
        { id: 'b', name: 'b', min: 0.1, max: 0.5, step: 0.01, defaultValue: 0.2 },
        { id: 'c', name: 'c', min: 1, max: 15, step: 0.1, defaultValue: 5.7 },
        { id: 'points', name: 'Trail Length', min: 100, max: 2000, step: 10, defaultValue: 1000 },
      ]},
      { id: 'v2', name: 'De Jong', parameters: [
        { id: 'a', name: 'a', min: -3, max: 3, step: 0.01, defaultValue: 1.4 },
        { id: 'b', name: 'b', min: -3, max: 3, step: 0.01, defaultValue: -2.3 },
        { id: 'c', name: 'c', min: -3, max: 3, step: 0.01, defaultValue: 2.4 },
        { id: 'd', name: 'd', min: -3, max: 3, step: 0.01, defaultValue: -2.1 },
        { id: 'points', name: 'Particles', min: 500, max: 5000, step: 50, defaultValue: 2000 },
      ]},
    ]
  },
];

export const MUSICAL_SCALES = {
    major: { name: 'Major', intervals: [0, 2, 4, 5, 7, 9, 11] },
    minor: { name: 'Minor', intervals: [0, 2, 3, 5, 7, 8, 10] },
    pentatonic: { name: 'Pentatonic', intervals: [0, 2, 4, 7, 9] },
    blues: { name: 'Blues', intervals: [0, 3, 5, 6, 7, 10] },
    dorian: { name: 'Dorian', intervals: [0, 2, 3, 5, 7, 9, 10] },
    phrygian: { name: 'Phrygian', intervals: [0, 1, 3, 5, 7, 8, 10] },
};

export const SONIFICATION_ENGINES: SonificationEngine[] = [
    {
        id: 'fm',
        name: 'FM Synthesis',
        description: 'Function modulates the frequency of a carrier oscillator.',
        parameters: [
            { id: 'harmonicity', name: 'Harmonicity', min: 0.1, max: 8, step: 0.01, defaultValue: 1.0 },
            { id: 'modulation', name: 'FM Depth', min: 0, max: 1, step: 0.01, defaultValue: 0.2 },
        ],
        category: 'standard'
    },
    {
        id: 'classic',
        name: 'Waveform Synth',
        description: 'Function directly controls the pitch of a classic oscillator.',
        parameters: [
            { id: 'waveform', name: 'Waveform', min: 0, max: 3, step: 1, defaultValue: 0 }, // 0:sine, 1:square, 2:triangle, 3:sawtooth
            { id: 'modDepth', name: 'Mod Depth', min: 0, max: 1000, step: 10, defaultValue: 200 },
        ],
        category: 'standard'
    },
    {
        id: 'grains',
        name: 'Harmonic Grains',
        description: 'Function shape controls the amplitude of multiple harmonics.',
        parameters: [
            { id: 'harmonics', name: 'Harmonics', min: 2, max: 12, step: 1, defaultValue: 6 },
            { id: 'spread', name: 'Spread', min: 0.1, max: 2, step: 0.1, defaultValue: 1.0 },
        ],
        category: 'standard'
    },
    {
        id: 'rhythm',
        name: 'Rhythmic Pulses',
        description: 'Function value sets pulse pitch, derivative sets the rate.',
        parameters: [
            { id: 'rate', name: 'Max Rate', min: 5, max: 40, step: 1, defaultValue: 20 },
            { id: 'decay', name: 'Decay', min: 0.01, max: 0.2, step: 0.01, defaultValue: 0.05 },
        ],
        category: 'standard'
    },
    {
        id: 'stochastic',
        name: 'Stochastic Grains',
        description: 'Function controls density and pitch of a probabilistic sound cloud.',
        parameters: [
            { id: 'density', name: 'Density', min: 0.0, max: 0.2, step: 0.005, defaultValue: 0.05 },
            { id: 'pitchVar', name: 'Pitch Variance', min: 0, max: 1000, step: 10, defaultValue: 300 },
            { id: 'duration', name: 'Duration', min: 0.01, max: 0.3, step: 0.01, defaultValue: 0.1 },
        ],
        category: 'experimental'
    },
    {
        id: 'resonator',
        name: 'Resonant Body',
        description: 'Function morphs a virtual acoustic space excited by noise or samples.',
        parameters: [
            { id: 'noiseType', name: 'Noise Type', min: 0, max: 2, step: 1, defaultValue: 1 }, // 0: White, 1: Pink, 2: Brown
            { id: 'excitationMix', name: 'Excitation Mix', min: 0, max: 1, step: 0.01, defaultValue: 0.2 },
            { id: 'pulseRateMod', name: 'Pulse Rate Mod', min: 0, max: 20, step: 0.5, defaultValue: 5 },
            { id: 'decayMod', name: 'Decay Mod', min: 0, max: 8, step: 0.1, defaultValue: 4.0 },
            { id: 'dampingMod', name: 'Damping Mod', min: 0, max: 1, step: 0.01, defaultValue: 0.5 },
            { id: 'stereoSpread', name: 'Stereo Spread', min: 0, max: 1, step: 0.01, defaultValue: 0.8 },
            { id: 'wetDryMix', name: 'Wet/Dry Mix', min: 0, max: 1, step: 0.01, defaultValue: 1.0 },
        ],
        category: 'experimental'
    },
    {
        id: 'fluid',
        name: 'Fluid Dynamics',
        description: 'Simulates a turbulent fluid soundscape using filtered noise.',
        parameters: [
            { id: 'turbulence', name: 'Turbulence (Q)', min: 0.1, max: 30, step: 0.1, defaultValue: 5.0 },
            { id: 'viscosity', name: 'Viscosity', min: 100, max: 2000, step: 10, defaultValue: 500 },
            { id: 'forcing', name: 'Forcing', min: 0.1, max: 2, step: 0.1, defaultValue: 1.0 },
        ],
        category: 'experimental'
    },
    {
        id: 'sculpture',
        name: 'Acoustic Sculpture',
        description: 'Hybrid: tonal grains shaped by a resonant body.',
        parameters: [
            { id: 'harmonics', name: 'Harmonics', min: 2, max: 16, step: 1, defaultValue: 8 },
            { id: 'spread', name: 'Harmonic Spread', min: 0.1, max: 2, step: 0.1, defaultValue: 1.0 },
            { id: 'decayMod', name: 'Decay Mod', min: 0, max: 8, step: 0.1, defaultValue: 4.0 },
            { id: 'dampingMod', name: 'Damping Mod', min: 0, max: 1, step: 0.01, defaultValue: 0.5 },
            { id: 'stereoSpread', name: 'Stereo Spread', min: 0, max: 1, step: 0.01, defaultValue: 0.8 },
            { id: 'wetDryMix', name: 'Wet/Dry Mix', min: 0, max: 1, step: 0.01, defaultValue: 0.8 },
        ],
        category: 'experimental'
    },
    {
        id: 'melodicEvents',
        name: 'Melodic Events',
        description: 'Function crossings trigger quantized musical notes.',
        parameters: [
            { id: 'tempo', name: 'Tempo (BPM)', min: 60, max: 240, step: 1, defaultValue: 120 },
            { id: 'threshold', name: 'Threshold', min: -1, max: 1, step: 0.05, defaultValue: 0.0 },
            { id: 'scale', name: 'Scale', min: 0, max: 5, step: 1, defaultValue: 0 }, // Major, Minor, Pentatonic, Blues, Dorian, Phrygian
            { id: 'quantize', name: 'Quantize', min: 0, max: 3, step: 1, defaultValue: 1 }, // 0: Off, 1: 1/16, 2: 1/8, 3: 1/4
            { id: 'toneType', name: 'Tone Type', min: 0, max: 4, step: 1, defaultValue: 0 }, // 0: Sine, 1: Grain, 2: Pluck, 3: Complementary, 4: Hybrid
        ],
        category: 'experimental'
    }
];