import type { ProjectionMode, EquationPreset, SonificationEngine } from './types';
import { GitBranch, Waves, Grid3x3, Activity, Globe, Zap, Compass, Atom, GitMerge, Orbit, Wind, BrainCircuit, Layers, Share2 } from 'lucide-react';

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
      { id: 'v0', name: 'V0', parameters: [
        { id: 'particleCount', name: 'Particles', min: 50, max: 500, step: 10, defaultValue: 200 },
        { id: 'flowSpeed', name: 'Flow Speed', min: 0.1, max: 5, step: 0.1, defaultValue: 1.5 },
        { id: 'noise', name: 'Noise', min: 0, max: 2, step: 0.1, defaultValue: 0.5 },
      ]},
      { id: 'v1', name: 'V1', parameters: [
        { id: 'particleCount', name: 'Particles', min: 50, max: 500, step: 10, defaultValue: 200 },
        { id: 'vortexStrength', name: 'Vortex Strength', min: 0, max: 10, step: 0.1, defaultValue: 5 },
        { id: 'radialForce', name: 'Radial Force', min: -5, max: 5, step: 0.1, defaultValue: 1 },
      ]},
      { id: 'v2', name: 'V2', parameters: [
        { id: 'particleCount', name: 'Particles', min: 50, max: 500, step: 10, defaultValue: 200 },
        { id: 'numWells', name: 'Gravity Wells', min: 1, max: 10, step: 1, defaultValue: 5 },
        { id: 'gravityStrength', name: 'Gravity Strength', min: 0, max: 100, step: 1, defaultValue: 50 },
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
    id: 'quantum', name: 'Quantum Harmonic', icon: Waves, description: 'Audio interference patterns from wavefunctions.',
    algorithms: [{ id: 'default', name: 'Default', parameters: [
      { id: 'frequency', name: 'Base Frequency', min: 0.05, max: 0.5, step: 0.01, defaultValue: 0.1 },
      { id: 'particles', name: 'Particle Count', min: 50, max: 200, step: 1, defaultValue: 100 },
    ]}]
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
    algorithms: [{ id: 'default', name: 'Default', parameters: [
      { id: 'particles', name: 'Particles', min: 10, max: 50, step: 1, defaultValue: 20 },
      { id: 'radius', name: 'Base Radius', min: 50, max: 150, step: 1, defaultValue: 80 },
    ]}]
  },
  { 
    id: 'graph', name: 'Graph Evolution', icon: Zap, description: 'Dynamic network topology changes.',
    algorithms: [{ id: 'default', name: 'Default', parameters: [
      { id: 'nodes', name: 'Nodes', min: 8, max: 24, step: 1, defaultValue: 12 },
      { id: 'connectivity', name: 'Connectivity', min: 0.1, max: 0.9, step: 0.05, defaultValue: 0.4 },
    ]}]
  },
  { 
    id: 'hyperbolic', name: 'Hyperbolic', icon: Compass, description: 'Projection in a hyperbolic plane.',
    algorithms: [{ id: 'default', name: 'Default', parameters: [
      { id: 'scale', name: 'Scale', min: 50, max: 200, step: 5, defaultValue: 100 },
      { id: 'points', name: 'Points', min: 100, max: 500, step: 10, defaultValue: 200 },
    ]}]
  },
  { 
    id: 'zeta', name: 'Zeta Scattering', icon: Atom, description: 'Zeros of the Riemann Zeta function as resonant states.',
    algorithms: [{ id: 'default', name: 'Default', parameters: [
      { id: 'density', name: 'Density', min: 100, max: 1000, step: 10, defaultValue: 400 },
      { id: 'spread', name: 'Spread', min: 1, max: 10, step: 0.5, defaultValue: 5 },
    ]}]
  },
  {
    id: 'homology', name: 'Persistent Homology', icon: GitMerge, description: 'Topological features persisting across scales.',
    algorithms: [{ id: 'default', name: 'Default', parameters: [
      { id: 'points', name: 'Points', min: 20, max: 100, step: 1, defaultValue: 50 },
      { id: 'filtrationSpeed', name: 'Filtration Speed', min: 5, max: 50, step: 1, defaultValue: 20 },
    ]}]
  }
];

export const EQUATION_PRESETS: EquationPreset[] = [
    { name: 'Parabola', equation: 'a * x^2' },
    { name: 'Sine Wave', equation: 'a * sin(b * x + t)' },
    { name: 'Wavy Tan', equation: 'a * cos(b*x + t)/tan(x)' },
    { name: 'Interference', equation: 'a * (sin(b*x+t) + cos(c*x*0.5))' },
    { name: 'Bessel-like', equation: 'a * cos(sqrt(x*x + b*b) - t)' },
    { name: 'Hyperbola', equation: 'a / x' },
    { name: 'Damped Cosine', equation: 'a * exp(-b*abs(x)) * cos(c*x - t)' },
    { name: 'Moving Sigmoid', equation: 'a * (1 / (1 + exp(-b * (x - sin(t)))))' },
    { name: 'Gated Sine', equation: 'a * (floor(b*x+t) % 2 ? 1 : -1) * sin(c*x)' },
    { name: 'Square Wave', equation: 'floor(b*x+t) % 2 == 0 ? a : -a' },
    { name: 'Step Function', equation: 'x > sin(t) ? a : -a' },
    { name: 'Noise', equation: '(random() - 0.5) * a' },
    { name: 'Chaotic', equation: 'a * sin(t) * x * (1-x)' },
    { name: 'Rectifier Pulse', equation: 'a * (sin(b*x*t*2) > 0.8 ? 1 : 0)' },
    { name: 'Complex Steps', equation: 'a * floor(sin(t)*5*x) / 5' },
    { name: 'Gated Noise', equation: 'a * sin(b*x+t) * (random() > 0.5 ? 1 : -1)'},
];

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
    }
];