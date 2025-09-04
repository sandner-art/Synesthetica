import type { LucideProps } from 'lucide-react';
import type React from 'react';

export type ProjectionModeId = 'fiber' | 'quantum' | 'crystal' | 'morph' | 'phase' | 'graph' | 'hyperbolic' | 'zeta' | 'homology' | 'marbleFlow' | 'fluidField' | 'neural' | 'origami' | 'synapticGrowth';
export type WaveformType = 'sine' | 'square' | 'triangle' | 'sawtooth';
export type SonificationEngineId = 'fm' | 'grains' | 'rhythm' | 'classic' | 'stochastic' | 'resonator' | 'fluid' | 'sculpture';

export interface Parameter {
  id: string;
  name: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

export interface ModeAlgorithm {
  id: string;
  name: string;
  parameters: Parameter[];
}

export interface ProjectionMode {
  id: ProjectionModeId;
  name: string;
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
  description: string;
  algorithms: ModeAlgorithm[];
}

export interface EquationPreset {
  name: string;
  equation: string;
}

export interface SonificationEngine {
    id: SonificationEngineId;
    name: string;
    description: string;
    parameters: Parameter[];
    category: 'standard' | 'experimental';
}