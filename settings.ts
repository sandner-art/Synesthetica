import type { SonificationEngineId } from "./types";

export const DEFAULT_SETTINGS = {
  volume: 0.5,
  functionInput: 'a * sin(b * x + t)',
  mode: 'fiber',
};

export const AUDIO_SETTINGS = {
  minFreq: 80.0, // A slightly higher base for clarity
  maxFreq: 2000.0, 
  maxAmplitude: 0.5, // Lowered max amplitude for safety
  modulationRange: 800,
  defaultSonificationEngine: 'fm' as SonificationEngineId,
};