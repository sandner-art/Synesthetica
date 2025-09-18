import React, { useRef } from 'react';
import type { ProjectionMode, SonificationEngineId } from '../types';
import { SONIFICATION_ENGINES, MUSICAL_SCALES } from '../constants';
import { ChevronDown, ChevronUp, Upload, X } from 'lucide-react';

interface BottomControlsProps {
  isMuted: boolean;
  volume: number;
  setVolume: (value: number) => void;
  currentModeInfo: ProjectionMode | undefined;
  parameters: Record<string, number>;
  setParameters: (params: Record<string, number>) => void;
  algorithm: string;
  setAlgorithm: (alg: string) => void;
  sonificationEngineId: SonificationEngineId;
  setSonificationEngineId: (id: SonificationEngineId) => void;
  sonificationParams: Record<string, number>;
  setSonificationParams: (params: Record<string, number>) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  showExperimentalEngines: boolean;
  onSampleLoad: (file: File) => void;
  userSampleName: string | null;
  clearUserSample: () => void;
  showEditableEquation: boolean;
  functionInput: string;
  setFunctionInput: (value: string) => void;
}

const Waveforms: OscillatorType[] = ['sine', 'square', 'triangle', 'sawtooth'];
const SymmetryOptions = ['None', 'X-Axis', 'Y-Axis', 'Origin'];
const NoiseOptions = ['White', 'Pink', 'Brown'];
const QuantizeOptions = ['Off', '1/16', '1/8', '1/4'];
const ToneTypeOptions = ['Sine', 'Grain', 'Pluck', 'Complementary', 'Hybrid'];
const PaletteOptions = ['Plasma', 'Fire', 'Ocean', 'Neon'];
const EvolveOptions = ['Off', 'On'];
const GrowthModeOptions = ['Organic', 'Radial'];
const RenderStyleOptions = ['Branch', 'Particle'];
const QuantumRenderStyleOptions = ['Vertical', 'Normal'];
const TunnelingOptions = ['Off', 'On'];


export const BottomControls: React.FC<BottomControlsProps> = ({
  isMuted,
  volume,
  setVolume,
  currentModeInfo,
  parameters,
  setParameters,
  algorithm,
  setAlgorithm,
  sonificationEngineId,
  setSonificationEngineId,
  sonificationParams,
  setSonificationParams,
  isCollapsed,
  setIsCollapsed,
  showExperimentalEngines,
  onSampleLoad,
  userSampleName,
  clearUserSample,
  showEditableEquation,
  functionInput,
  setFunctionInput,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleVisParamChange = (id: string, value: number) => {
    setParameters({ ...parameters, [id]: value });
  };
  
  const handleAudioParamChange = (id: string, value: number) => {
    setSonificationParams({ ...sonificationParams, [id]: value });
  };
  
  const currentAlgorithm = currentModeInfo?.algorithms.find(a => a.id === algorithm);
  const availableEngines = showExperimentalEngines ? SONIFICATION_ENGINES : SONIFICATION_ENGINES.filter(e => e.category === 'standard');
  const currentSonificationEngine = availableEngines.find(e => e.id === sonificationEngineId);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onSampleLoad(file);
    }
  };

  return (
    <div className={`absolute bottom-0 left-0 right-0 z-30 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700 transition-all duration-300 ease-in-out ${isCollapsed ? 'translate-y-[calc(100%-44px)]' : 'translate-y-0'}`}>
      <button onClick={() => setIsCollapsed(!isCollapsed)} className="absolute -top-6 right-2 bg-gray-800/80 p-1 rounded-t-md text-gray-300 hover:text-white">
        {isCollapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      <div className="p-4 space-y-3 max-h-[45vh] overflow-y-auto">
        {/* Editable Equation Input */}
        {showEditableEquation && (
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-400">f(x, t, a, b, c)</label>
            <input
              type="text"
              value={functionInput}
              onChange={(e) => setFunctionInput(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm font-mono"
              placeholder="e.g., a * sin(b * x + t)"
            />
          </div>
        )}
        
        {/* Audio Controls */}
        {!isMuted && currentSonificationEngine && (
          <div>
              <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm">Sonification</span>
                  <select value={sonificationEngineId} onChange={e => setSonificationEngineId(e.target.value as SonificationEngineId)} className="bg-gray-700 text-white p-1 rounded border border-gray-600 text-xs max-w-[50%]">
                    {availableEngines.map(engine => (
                        <option key={engine.id} value={engine.id}>
                            {engine.name} {engine.category === 'experimental' ? '[EXP]' : ''}
                        </option>
                    ))}
                  </select>
              </div>
               <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                 <div>
                    <label className="block mb-1 text-gray-400">Volume</label>
                    <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb" aria-label="Volume" />
                  </div>
                  {/* Dynamically render parameters for the current sonification engine */}
                  {currentSonificationEngine.parameters.map(param => (
                    <div key={param.id}>
                      <label className="block mb-1 text-gray-400">{param.name}</label>
                      {param.id === 'waveform' ? (
                         <select value={sonificationParams[param.id] ?? param.defaultValue} onChange={e => handleAudioParamChange(param.id, parseFloat(e.target.value))} className="w-full bg-gray-700 text-white p-1 rounded border border-gray-600 text-xs">
                            {Waveforms.map((w, i) => <option key={w} value={i}>{w.charAt(0).toUpperCase() + w.slice(1)}</option>)}
                         </select>
                      ) : param.id === 'noiseType' && currentSonificationEngine.id === 'resonator' ? (
                        <select value={sonificationParams[param.id] ?? param.defaultValue} onChange={e => handleAudioParamChange(param.id, parseFloat(e.target.value))} className="w-full bg-gray-700 text-white p-1 rounded border border-gray-600 text-xs">
                            {NoiseOptions.map((opt, i) => <option key={opt} value={i}>{opt}</option>)}
                        </select>
                      ) : param.id === 'scale' && currentSonificationEngine.id === 'melodicEvents' ? (
                        <select value={sonificationParams[param.id] ?? param.defaultValue} onChange={e => handleAudioParamChange(param.id, parseFloat(e.target.value))} className="w-full bg-gray-700 text-white p-1 rounded border border-gray-600 text-xs">
                            {Object.values(MUSICAL_SCALES).map((scale, i) => <option key={scale.name} value={i}>{scale.name}</option>)}
                        </select>
                      ) : param.id === 'quantize' && currentSonificationEngine.id === 'melodicEvents' ? (
                        <select value={sonificationParams[param.id] ?? param.defaultValue} onChange={e => handleAudioParamChange(param.id, parseFloat(e.target.value))} className="w-full bg-gray-700 text-white p-1 rounded border border-gray-600 text-xs">
                            {QuantizeOptions.map((opt, i) => <option key={opt} value={i}>{opt}</option>)}
                        </select>
                      ) : param.id === 'toneType' && currentSonificationEngine.id === 'melodicEvents' ? (
                        <select value={sonificationParams[param.id] ?? param.defaultValue} onChange={e => handleAudioParamChange(param.id, parseFloat(e.target.value))} className="w-full bg-gray-700 text-white p-1 rounded border border-gray-600 text-xs">
                            {ToneTypeOptions.map((opt, i) => <option key={opt} value={i}>{opt}</option>)}
                        </select>
                      ) : (
                        <input
                          type="range" min={param.min} max={param.max} step={param.step}
                          value={sonificationParams[param.id] ?? param.defaultValue}
                          onChange={(e) => handleAudioParamChange(param.id, parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                          aria-label={param.name}
                        />
                      )}
                    </div>
                  ))}
                  {currentSonificationEngine.id === 'resonator' && (
                    <div className="col-span-2">
                        <label className="block mb-1 text-gray-400">Sample Excitation</label>
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".wav,.mp3,.ogg" className="hidden"/>
                        {userSampleName ? (
                            <div className="flex items-center justify-between bg-gray-700 p-1.5 rounded-md">
                                <span className="truncate text-gray-300 text-xs">{userSampleName}</span>
                                <button onClick={clearUserSample} className="p-1 hover:bg-gray-600 rounded-full"><X size={12}/></button>
                            </div>
                        ) : (
                            <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
                                <Upload size={14}/> Load Sample
                            </button>
                        )}
                    </div>
                  )}
              </div>
          </div>
        )}

        {/* Mode Controls */}
        {currentModeInfo && (
          <div className="border-t border-gray-700 pt-3">
              <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm">{currentModeInfo.name}</span>
                  {currentModeInfo.algorithms.length > 1 && (
                      <div className="flex items-center gap-1 bg-gray-700 p-0.5 rounded-md">
                          {currentModeInfo.algorithms.map(alg => (
                              <button key={alg.id} onClick={() => setAlgorithm(alg.id)}
                                  className={`px-2 py-0.5 text-xs rounded ${algorithm === alg.id ? 'bg-cyan-600' : 'hover:bg-gray-600'}`}>
                                  {alg.name}
                              </button>
                          ))}
                      </div>
                  )}
              </div>
              {currentAlgorithm && currentAlgorithm.parameters.length > 0 && (
                   <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                   {currentAlgorithm.parameters.map(param => (
                     <div key={param.id}>
                       <label className="block mb-1 text-gray-400">{param.name}</label>
                       {param.id === 'symmetry' && currentModeInfo.id === 'synapticGrowth' ? (
                          <select value={parameters[param.id] ?? param.defaultValue} onChange={e => handleVisParamChange(param.id, parseFloat(e.target.value))} className="w-full bg-gray-700 text-white p-1 rounded border border-gray-600 text-xs">
                              {SymmetryOptions.map((opt, i) => <option key={opt} value={i}>{opt}</option>)}
                          </select>
                       ) : param.id === 'palette' && currentModeInfo.id === 'eventGrowth' ? (
                          <select value={parameters[param.id] ?? param.defaultValue} onChange={e => handleVisParamChange(param.id, parseFloat(e.target.value))} className="w-full bg-gray-700 text-white p-1 rounded border border-gray-600 text-xs">
                              {PaletteOptions.map((opt, i) => <option key={opt} value={i}>{opt}</option>)}
                          </select>
                       ) : param.id === 'palette' && currentModeInfo.id === 'homology' && algorithm === 'v2' ? (
                          <select value={parameters[param.id] ?? param.defaultValue} onChange={e => handleVisParamChange(param.id, parseFloat(e.target.value))} className="w-full bg-gray-700 text-white p-1 rounded border border-gray-600 text-xs">
                              {PaletteOptions.map((opt, i) => <option key={opt} value={i}>{opt}</option>)}
                          </select>
                       ) : param.id === 'evolve' && currentModeInfo.id === 'eventGrowth' ? (
                          <select value={parameters[param.id] ?? param.defaultValue} onChange={e => handleVisParamChange(param.id, parseFloat(e.target.value))} className="w-full bg-gray-700 text-white p-1 rounded border border-gray-600 text-xs">
                              {EvolveOptions.map((opt, i) => <option key={opt} value={i}>{opt}</option>)}
                          </select>
                       ) : param.id === 'growthMode' && currentModeInfo.id === 'eventGrowth' && algorithm === 'v0' ? (
                        <select value={parameters[param.id] ?? param.defaultValue} onChange={e => handleVisParamChange(param.id, parseFloat(e.target.value))} className="w-full bg-gray-700 text-white p-1 rounded border border-gray-600 text-xs">
                            {GrowthModeOptions.map((opt, i) => <option key={opt} value={i}>{opt}</option>)}
                        </select>
                     ) : param.id === 'renderStyle' && currentModeInfo.id === 'eventGrowth' && algorithm === 'v0' ? (
                        <select value={parameters[param.id] ?? param.defaultValue} onChange={e => handleVisParamChange(param.id, parseFloat(e.target.value))} className="w-full bg-gray-700 text-white p-1 rounded border border-gray-600 text-xs">
                            {RenderStyleOptions.map((opt, i) => <option key={opt} value={i}>{opt}</option>)}
                        </select>
                       ) : param.id === 'renderStyle' && currentModeInfo.id === 'quantum' && algorithm === 'v3' ? (
                        <select value={parameters[param.id] ?? param.defaultValue} onChange={e => handleVisParamChange(param.id, parseFloat(e.target.value))} className="w-full bg-gray-700 text-white p-1 rounded border border-gray-600 text-xs">
                            {QuantumRenderStyleOptions.map((opt, i) => <option key={opt} value={i}>{opt}</option>)}
                        </select>
                       ) : param.id === 'tunneling' && currentModeInfo.id === 'quantum' && algorithm === 'v3' ? (
                        <select value={parameters[param.id] ?? param.defaultValue} onChange={e => handleVisParamChange(param.id, parseFloat(e.target.value))} className="w-full bg-gray-700 text-white p-1 rounded border border-gray-600 text-xs">
                            {TunnelingOptions.map((opt, i) => <option key={opt} value={i}>{opt}</option>)}
                        </select>
                       ) : (
                         <input
                           type="range"
                           min={param.min}
                           max={param.max}
                           step={param.step}
                           value={parameters[param.id] ?? param.defaultValue}
                           onChange={(e) => handleVisParamChange(param.id, parseFloat(e.target.value))}
                           className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                           aria-label={param.name}
                         />
                       )}
                     </div>
                   ))}
                 </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};