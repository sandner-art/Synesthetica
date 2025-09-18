import type { LucideProps } from 'lucide-react';
import type React from 'react';

// FIX: Define EvaluatedFunction here to break circular dependency with functionParser.ts
export type EvaluatedFunction = (x: number, t: number, a: number, b: number, c: number) => number;

export type ProjectionModeId = 'fiber' | 'quantum' | 'crystal' | 'morph' | 'phase' | 'graph' | 'hyperbolic' | 'zeta' | 'homology' | 'marbleFlow' | 'fluidField' | 'neural' | 'origami' | 'synapticGrowth' | 'eventGrowth' | 'attractor';
export type WaveformType = 'sine' | 'square' | 'triangle' | 'sawtooth';
export type SonificationEngineId = 'fm' | 'grains' | 'rhythm' | 'classic' | 'stochastic' | 'resonator' | 'fluid' | 'sculpture' | 'melodicEvents';

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
  category?: 'classic' | 'modified';
}

export interface SonificationEngine {
    id: SonificationEngineId;
    name: string;
    description: string;
    parameters: Parameter[];
    category: 'standard' | 'experimental';
}

// Types for the new modular visualization system
export interface VisualizationRenderParams {
  ctx: CanvasRenderingContext2D;
  t: number;
  f: EvaluatedFunction;
  p: Record<string, number>;
  state: any;
  width: number;
  height: number;
  zoom: number;
  rotation: { x: number, y: number };
  algorithm: string;
}

export interface VisualizationInitParams {
  canvas: HTMLCanvasElement;
  parameters: Record<string, number>;
  algorithm: string;
}

export interface VisualizationModule {
  init: (params: VisualizationInitParams) => any;
  render: (params: VisualizationRenderParams) => void;
}