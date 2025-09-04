import { useState, useRef, useEffect, useCallback } from 'react';
import { AUDIO_SETTINGS } from '../settings';
import { getDerivative, type EvaluatedFunction } from '../services/functionParser';
import type { SonificationEngineId, WaveformType } from '../types';

interface AudioParams {
    isPlaying: boolean;
    volume: number;
    isMuted: boolean;
    parsedFunction: EvaluatedFunction | null;
    engineId: SonificationEngineId;
    engineParams: Record<string, number>;
    visParams: Record<string, number>; // Visualization parameters
    userSample: AudioBuffer | null;
}

// A simple state store for audio nodes to avoid complex ref management
interface AudioNodeStore {
    [key: string]: any;
    masterGain?: GainNode;
}

const WAVEFORM_MAP: WaveformType[] = ['sine', 'square', 'triangle', 'sawtooth'];

export const useAudio = ({ 
    isPlaying, 
    volume, 
    isMuted, 
    parsedFunction, 
    engineId, 
    engineParams, 
    visParams,
    userSample,
}: AudioParams) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<AudioNodeStore>({});
  const [isAudioReady, setIsAudioReady] = useState(false);
  const lastEventTimeRef = useRef<{ [key:string]: number }>({});
  const noiseBuffersRef = useRef<{ [key:string]: AudioBuffer | null }>({
      white: null, pink: null, brown: null
  });

  const cleanupAudioGraph = useCallback(() => {
    Object.values(nodesRef.current).forEach(node => {
        if (node instanceof AudioScheduledSourceNode) {
            try { node.stop(); } catch (e) {}
        }
        if (node.disconnect) node.disconnect();
    });
    nodesRef.current = {};
  }, []);

  const createNoiseBuffer = (context: AudioContext, type: 'white' | 'pink' | 'brown'): AudioBuffer => {
      const bufferSize = context.sampleRate * 2; // 2 seconds of noise
      const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
      const output = buffer.getChannelData(0);
      
      if (type === 'white') {
          for (let i = 0; i < bufferSize; i++) {
              output[i] = Math.random() * 2 - 1;
          }
      } else if (type === 'pink') {
          let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
          for (let i = 0; i < bufferSize; i++) {
              const white = Math.random() * 2 - 1;
              b0 = 0.99886 * b0 + white * 0.0555179;
              b1 = 0.99332 * b1 + white * 0.0750759;
              b2 = 0.96900 * b2 + white * 0.1538520;
              b3 = 0.86650 * b3 + white * 0.3104856;
              b4 = 0.55000 * b4 + white * 0.5329522;
              b5 = -0.7616 * b5 - white * 0.0168980;
              output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
              output[i] *= 0.11;
              b6 = white * 0.115926;
          }
      } else if (type === 'brown') {
          let lastOut = 0;
          for (let i = 0; i < bufferSize; i++) {
              const white = Math.random() * 2 - 1;
              output[i] = (lastOut + (0.02 * white)) / 1.02;
              lastOut = output[i];
              output[i] *= 3.5; // Rescale
          }
      }
      return buffer;
  }

  const setupAudio = useCallback(() => {
    if (isAudioReady && audioContextRef.current) {
        cleanupAudioGraph();
    }

    const context = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = context;
    const masterGain = context.createGain();
    masterGain.connect(context.destination);
    nodesRef.current.masterGain = masterGain;

    if (!noiseBuffersRef.current.pink) {
        noiseBuffersRef.current.white = createNoiseBuffer(context, 'white');
        noiseBuffersRef.current.pink = createNoiseBuffer(context, 'pink');
        noiseBuffersRef.current.brown = createNoiseBuffer(context, 'brown');
    }

    switch (engineId) {
        case 'fm': {
            const carrier = context.createOscillator();
            const modulator = context.createOscillator();
            const modulatorGain = context.createGain();
            carrier.type = 'sine';
            carrier.frequency.setValueAtTime(AUDIO_SETTINGS.minFreq, context.currentTime);
            modulator.type = 'sine';
            modulator.frequency.setValueAtTime(AUDIO_SETTINGS.minFreq, context.currentTime);
            modulator.connect(modulatorGain);
            modulatorGain.connect(carrier.frequency);
            carrier.connect(masterGain);
            carrier.start();
            modulator.start();
            nodesRef.current = { ...nodesRef.current, carrier, modulator, modulatorGain };
            break;
        }
        case 'classic': {
            const oscillator = context.createOscillator();
            const waveform = WAVEFORM_MAP[Math.floor(engineParams.waveform)] || 'sine';
            oscillator.type = waveform;
            oscillator.frequency.setValueAtTime(AUDIO_SETTINGS.minFreq, context.currentTime);
            oscillator.connect(masterGain);
            oscillator.start();
            nodesRef.current = { ...nodesRef.current, oscillator };
            break;
        }
        case 'grains': {
            const harmonics = Math.floor(engineParams.harmonics) || 6;
            const oscillators = Array.from({length: harmonics}, () => context.createOscillator());
            const gains = Array.from({length: harmonics}, () => context.createGain());
            oscillators.forEach((osc, i) => {
                const gain = gains[i];
                osc.connect(gain);
                gain.connect(masterGain);
                gain.gain.setValueAtTime(0, context.currentTime);
                osc.start();
            });
            nodesRef.current = { ...nodesRef.current, oscillators, gains };
            break;
        }
        case 'sculpture': {
            const harmonics = Math.floor(engineParams.harmonics) || 6;
            const oscillators = Array.from({length: harmonics}, () => context.createOscillator());
            const gains = Array.from({length: harmonics}, () => context.createGain());
            const sourceMixer = context.createGain();
            
            oscillators.forEach((osc, i) => {
                const gain = gains[i];
                osc.connect(gain);
                gain.connect(sourceMixer);
                gain.gain.setValueAtTime(0, context.currentTime);
                osc.start();
            });

            const convolver = context.createConvolver();
            const wetGain = context.createGain();
            const dryGain = context.createGain();

            sourceMixer.connect(convolver);
            sourceMixer.connect(dryGain);
            convolver.connect(wetGain);
            wetGain.connect(masterGain);
            dryGain.connect(masterGain);

            nodesRef.current = { ...nodesRef.current, oscillators, gains, convolver, wetGain, dryGain };
            break;
        }
        case 'stochastic':
            break;
        case 'resonator': {
            const continuousSource = context.createBufferSource();
            const noiseType = ['white', 'pink', 'brown'][engineParams.noiseType || 1] as 'white'|'pink'|'brown';
            continuousSource.buffer = userSample || noiseBuffersRef.current[noiseType];
            continuousSource.loop = true;

            const convolver = context.createConvolver();
            const continuousGain = context.createGain();
            const pulseGain = context.createGain();
            const wetGain = context.createGain();
            const dryGain = context.createGain();

            continuousSource.connect(continuousGain);
            continuousGain.connect(convolver);
            pulseGain.connect(convolver);
            convolver.connect(wetGain);

            continuousSource.connect(dryGain); // Dry path for continuous source

            wetGain.connect(masterGain);
            dryGain.connect(masterGain);
            
            continuousSource.start();
            nodesRef.current = { ...nodesRef.current, continuousSource, convolver, continuousGain, pulseGain, wetGain, dryGain };
            break;
        }
        case 'fluid': {
            const noiseSource = context.createBufferSource();
            noiseSource.buffer = noiseBuffersRef.current.brown;
            noiseSource.loop = true;
            const filter = context.createBiquadFilter();
            filter.type = 'bandpass';
            noiseSource.connect(filter);
            filter.connect(masterGain);
            noiseSource.start();
            nodesRef.current = { ...nodesRef.current, noiseSource, filter };
            break;
        }
        case 'rhythm':
            break;
    }
    
    if (!isAudioReady) {
        setIsAudioReady(true);
    }
  }, [isAudioReady, cleanupAudioGraph, engineId, engineParams, userSample]);
  
  useEffect(() => {
    if (isAudioReady) {
        setupAudio();
    }
  }, [engineId, engineParams.harmonics, engineParams.waveform, userSample, isAudioReady, setupAudio]);


  useEffect(() => {
    const context = audioContextRef.current;
    if (context) {
      if (isPlaying && context.state === 'suspended') {
        context.resume().catch(console.error);
      } else if (!isPlaying && context.state === 'running') {
        context.suspend().catch(console.error);
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (nodesRef.current.masterGain) {
      const finalVolume = isMuted ? 0 : volume * AUDIO_SETTINGS.maxAmplitude;
      nodesRef.current.masterGain.gain.setTargetAtTime(finalVolume, audioContextRef.current?.currentTime ?? 0, 0.01);
    }
  }, [volume, isMuted]);

  useEffect(() => {
    let animationFrameId: number;

    const updateAudio = () => {
        const context = audioContextRef.current;
        const func = parsedFunction;
        if (!isPlaying || !context || !func) {
            animationFrameId = requestAnimationFrame(updateAudio);
            return;
        }

        const t = context.currentTime;
        const x = Math.sin(t * 0.5); 

        switch (engineId) {
            case 'fm':
            case 'classic':
            case 'grains':
            case 'rhythm':
            case 'stochastic':
            case 'fluid': {
                // Keep existing logic for these engines
                const { carrier, modulator, modulatorGain, oscillator, oscillators, gains, filter } = nodesRef.current;
                 if (engineId === 'fm' && carrier && modulator && modulatorGain) {
                    const { harmonicity = 1.0, modulation = 0.2 } = engineParams;
                    const funcValue = func(x, t, 1, 1, 1);
                    const normalizedValue = isFinite(funcValue) ? (funcValue % 5) : 0;
                    const baseCarrierFreq = AUDIO_SETTINGS.minFreq;
                    const baseModulatorFreq = baseCarrierFreq * harmonicity;
                    carrier.frequency.setTargetAtTime(baseCarrierFreq, t, 0.01);
                    const modulatorFreq = baseModulatorFreq + normalizedValue * 100;
                    modulator.frequency.setTargetAtTime(Math.max(0, modulatorFreq), t, 0.01);
                    const modulationAmount = modulation * 500;
                    modulatorGain.gain.setTargetAtTime(modulationAmount, t, 0.01);
                 } else if (engineId === 'classic' && oscillator) {
                    const { modDepth = 200, waveform: waveformIndex = 0 } = engineParams;
                    const funcValue = func(x, t, 1, 1, 1);
                    const normalizedValue = isFinite(funcValue) ? (funcValue % 5) : 0;
                    const targetFreq = AUDIO_SETTINGS.minFreq + normalizedValue * modDepth;
                    oscillator.frequency.setTargetAtTime(Math.max(20, Math.min(targetFreq, AUDIO_SETTINGS.maxFreq)), t, 0.01);
                    const waveform = WAVEFORM_MAP[Math.floor(waveformIndex)] || 'sine';
                    if (oscillator.type !== waveform) oscillator.type = waveform;
                 } else if (engineId === 'grains' && oscillators && gains) {
                    const { spread = 1.0 } = engineParams;
                    for (let i = 0; i < oscillators.length; i++) {
                        const harmonic = i + 1;
                        oscillators[i].frequency.value = AUDIO_SETTINGS.minFreq * harmonic;
                        const sampleX = (i / oscillators.length - 0.5) * 2 * spread;
                        const funcValue = func(sampleX, t, 1, 1, 1);
                        const targetGain = isFinite(funcValue) ? Math.pow(Math.abs(Math.sin(funcValue)), 2) / oscillators.length : 0;
                        gains[i].gain.setTargetAtTime(targetGain, t, 0.05);
                    }
                 } else if (engineId === 'rhythm') {
                    const slope = Math.abs(getDerivative(func, x, t, 1, 1, 1));
                    const { rate = 20 } = engineParams;
                    const pulseRate = Math.min(isFinite(slope) ? slope : 0, 100) * rate;
                    if (pulseRate > 0 && t > (lastEventTimeRef.current['rhythm'] || 0) + (1 / pulseRate)) {
                        lastEventTimeRef.current['rhythm'] = t;
                        const funcValue = func(x, t, 1, 1, 1);
                        const normalizedValue = isFinite(funcValue) ? Math.abs(funcValue % 2) - 1 : 0;
                        const frequency = AUDIO_SETTINGS.minFreq + (normalizedValue * AUDIO_SETTINGS.modulationRange);
                        const pulseOsc = context.createOscillator();
                        const pulseGain = context.createGain();
                        pulseOsc.connect(pulseGain);
                        pulseGain.connect(nodesRef.current.masterGain);
                        pulseOsc.frequency.value = Math.max(AUDIO_SETTINGS.minFreq, Math.min(frequency, AUDIO_SETTINGS.maxFreq));
                        const { decay = 0.05 } = engineParams;
                        pulseGain.gain.setValueAtTime(1, t);
                        pulseGain.gain.exponentialRampToValueAtTime(0.001, t + decay);
                        pulseOsc.start(t);
                        pulseOsc.stop(t + decay + 0.1);
                    }
                 } else if (engineId === 'stochastic') {
                    const { density = 0.05, pitchVar = 300, duration = 0.1 } = engineParams;
                    const funcValue = Math.min(Math.abs(func(x,t,1,1,1)), 10);
                    if (Math.random() < funcValue * density) {
                        const slope = getDerivative(func, x, t, 1, 1, 1);
                        const pitch = AUDIO_SETTINGS.minFreq + Math.abs(funcValue) * 100 + (Math.random() - 0.5) * Math.abs(slope) * pitchVar;
                        const grain = context.createOscillator();
                        const grainGain = context.createGain();
                        grain.connect(grainGain);
                        grainGain.connect(nodesRef.current.masterGain);
                        grain.type = 'sine';
                        grain.frequency.value = Math.max(20, Math.min(pitch, AUDIO_SETTINGS.maxFreq));
                        grainGain.gain.setValueAtTime(0.5, t);
                        grainGain.gain.exponentialRampToValueAtTime(0.001, t + duration);
                        grain.start(t);
                        grain.stop(t + duration + 0.1);
                    }
                 } else if (engineId === 'fluid' && filter) {
                    const { turbulence = 5.0, viscosity = 500, forcing = 1.0 } = engineParams;
                    const funcValue = func(x, t, 1, 1, 1);
                    const normalizedValue = isFinite(funcValue) ? funcValue : 0;
                    const slope = getDerivative(func, x, t, 1, 1, 1);
                    const normalizedSlope = isFinite(slope) ? Math.min(Math.abs(slope), 50) : 0;
                    const targetFreq = 100 + (Math.abs(normalizedValue) * forcing * viscosity);
                    filter.frequency.setTargetAtTime(Math.max(50, Math.min(targetFreq, AUDIO_SETTINGS.maxFreq * 2)), t, 0.02);
                    const targetQ = 0.1 + normalizedSlope * turbulence;
                    filter.Q.setTargetAtTime(Math.max(0.1, targetQ), t, 0.02);
                 }
                break;
            }
            case 'sculpture': {
                const { oscillators, gains, convolver, wetGain, dryGain } = nodesRef.current;
                if (!oscillators || !gains || !convolver || !wetGain || !dryGain) break;

                // Update harmonic grains (source)
                const { spread = 1.0 } = engineParams;
                for (let i = 0; i < oscillators.length; i++) {
                    const harmonic = i + 1;
                    oscillators[i].frequency.value = AUDIO_SETTINGS.minFreq * harmonic;
                    const sampleX = (i / oscillators.length - 0.5) * 2 * spread;
                    const funcValue = func(sampleX, t, 1, 1, 1);
                    const targetGain = isFinite(funcValue) ? Math.pow(Math.abs(Math.sin(funcValue)), 2) / oscillators.length : 0;
                    gains[i].gain.setTargetAtTime(targetGain, t, 0.05);
                }

                // Update resonant body (space)
                const { wetDryMix = 0.8 } = engineParams;
                wetGain.gain.setTargetAtTime(wetDryMix, t, 0.02);
                dryGain.gain.setTargetAtTime(1 - wetDryMix, t, 0.02);
                
                if (t > (lastEventTimeRef.current['sculpture_ir'] || 0) + 0.1) {
                    lastEventTimeRef.current['sculpture_ir'] = t;
                    const { decayMod = 4.0, dampingMod = 0.5, stereoSpread: stereoSpreadMod = 0.8 } = engineParams;

                    const funcValue = func(x, t, 1, 1, 1);
                    const slope = getDerivative(func, x, t, 1, 1, 1);
                    const offsetValue = func(x + 0.1, t, 1, 1, 1);

                    const normalizedValue = (Math.tanh(funcValue) + 1) / 2;
                    const decayTime = mapToLogRange(normalizedValue, 0.1, 8.0) * (decayMod / 4.0);
                    const normalizedSlope = Math.min(1, Math.abs(slope) / 10);
                    const damping = 0.05 + normalizedSlope * dampingMod;
                    const normalizedOffset = (Math.tanh(offsetValue) + 1) / 2;
                    const stereoSpread = normalizedOffset * stereoSpreadMod;
                    
                    convolver.buffer = createImpulseResponse(context, decayTime, damping, stereoSpread);
                }
                break;
            }
            case 'resonator': {
                const { convolver, continuousGain, pulseGain, wetGain, dryGain } = nodesRef.current;
                if (!convolver || !continuousGain || !pulseGain || !wetGain || !dryGain) break;

                const { excitationMix = 0.2, pulseRateMod = 5, decayMod = 4.0, dampingMod = 0.5, stereoSpread: stereoSpreadMod = 0.8, wetDryMix = 1.0 } = engineParams;

                // Set gain for continuous vs pulse excitation
                continuousGain.gain.setTargetAtTime(1 - excitationMix, t, 0.02);
                
                // Update wet/dry mix
                wetGain.gain.setTargetAtTime(wetDryMix, t, 0.02);
                dryGain.gain.setTargetAtTime(1 - wetDryMix, t, 0.02);

                // Re-trigger pulses
                const slope = Math.abs(getDerivative(func, x, t, 1, 1, 1));
                const pulseRate = (isFinite(slope) ? slope : 0) * pulseRateMod;
                if (pulseRate > 0 && excitationMix > 0 && t > (lastEventTimeRef.current['resonator_pulse'] || 0) + (1 / pulseRate)) {
                    lastEventTimeRef.current['resonator_pulse'] = t;
                    const funcValue = func(x, t, 1, 1, 1);
                    const pulseLoudness = Math.min(Math.abs(funcValue), 5) / 5;
                    
                    const impulse = context.createBufferSource();
                    impulse.buffer = createImpulse(context, 0.05); // Short sharp click
                    
                    const impulseGain = context.createGain();
                    impulseGain.gain.setValueAtTime(pulseLoudness * excitationMix, t);
                    
                    impulse.connect(impulseGain);
                    impulseGain.connect(pulseGain);
                    impulse.start(t);
                }
                
                // Continuously update the impulse response for the convolver
                if (t > (lastEventTimeRef.current['resonator_ir'] || 0) + 0.1) {
                    lastEventTimeRef.current['resonator_ir'] = t;
                    
                    // 1. Get values from function
                    const funcValue = func(x, t, 1, 1, 1);
                    const slope = getDerivative(func, x, t, 1, 1, 1);
                    const offsetValue = func(x + 0.1, t, 1, 1, 1);

                    // 2. Map values to acoustic properties
                    const normalizedValue = (Math.tanh(funcValue) + 1) / 2;
                    const decayTime = mapToLogRange(normalizedValue, 0.1, 8.0) * (decayMod / 4.0);

                    const normalizedSlope = Math.min(1, Math.abs(slope) / 10);
                    const damping = 0.05 + normalizedSlope * dampingMod;

                    const normalizedOffset = (Math.tanh(offsetValue) + 1) / 2;
                    const stereoSpread = normalizedOffset * stereoSpreadMod;

                    // 3. Create and set the new IR
                    const ir = createImpulseResponse(context, decayTime, damping, stereoSpread);
                    convolver.buffer = ir;
                }
                break;
            }
        }
        animationFrameId = requestAnimationFrame(updateAudio);
    };

    updateAudio();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, parsedFunction, engineId, engineParams]);

  useEffect(() => {
    return () => {
      audioContextRef.current?.close().catch(console.error);
    };
  }, []);

  return { setupAudio, isAudioReady };
};

function createImpulse(context: AudioContext, duration: number): AudioBuffer {
    const sampleRate = context.sampleRate;
    const length = sampleRate * duration;
    const impulse = context.createBuffer(1, length, sampleRate);
    const impulseData = impulse.getChannelData(0);
    for (let i = 0; i < length; i++) {
        impulseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
    }
    return impulse;
}

const mapToLogRange = (value: number, min: number, max: number): number => {
    // Assumes value is normalized between 0 and 1
    const logMin = Math.log10(min);
    const logMax = Math.log10(max);
    return Math.pow(10, logMin + value * (logMax - logMin));
};

function createImpulseResponse(context: AudioContext, duration: number, damping: number, stereoSpread: number): AudioBuffer {
    const sampleRate = context.sampleRate;
    const length = Math.max(sampleRate * 0.01, sampleRate * duration);
    const impulse = context.createBuffer(2, length, sampleRate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
        const progress = i / length;

        // Overall decay envelope
        const decay = Math.pow(1 - progress, 2);

        // Damping controls how fast high frequencies die out
        // using a secondary, steeper envelope for the noise.
        const dampingEnvelope = Math.pow(1 - progress, 1 + damping * 10);

        // Generate stereo noise
        const noiseL = (Math.random() * 2 - 1) * dampingEnvelope;
        const noiseR = (Math.random() * 2 - 1) * dampingEnvelope;
        
        // Mono noise for spread control
        const monoNoise = (noiseL + noiseR) * 0.5;

        // Apply spread and main decay
        impulseL[i] = (monoNoise * (1 - stereoSpread) + noiseL * stereoSpread) * decay;
        impulseR[i] = (monoNoise * (1 - stereoSpread) + noiseR * stereoSpread) * decay;
    }
    return impulse;
}