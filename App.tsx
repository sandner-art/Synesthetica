import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAudio } from './hooks/useAudio';
import { useVisualization } from './hooks/useVisualization';
import { parseFunction } from './services/functionParser';
import type { ProjectionModeId, SonificationEngineId } from './types';
import { PROJECTION_MODES, SONIFICATION_ENGINES } from './constants';
import { DEFAULT_SETTINGS, AUDIO_SETTINGS } from './settings';
import { Header } from './components/Header';
import { SideMenu } from './components/SideMenu';
import { BottomControls } from './components/BottomControls';
import { HelpModal } from './components/HelpModal';
import { SettingsModal } from './components/SettingsModal';
import { AppSettingsModal } from './components/AppSettingsModal';

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_SETTINGS.volume);
  const [isMuted, setIsMuted] = useState(false);
  const [currentMode, setCurrentMode] = useState<ProjectionModeId>(DEFAULT_SETTINGS.mode as ProjectionModeId);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  
  // Modal states
  const [showHelp, setShowHelp] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showAppSettings, setShowAppSettings] = useState(false);

  // App settings
  const [showEquation, setShowEquation] = useState(false);
  const [useAdaptiveCentering, setUseAdaptiveCentering] = useState(true);
  const [showExperimentalEngines, setShowExperimentalEngines] = useState(false);
  const [showEditableEquation, setShowEditableEquation] = useState(false);
  
  const [functionInput, setFunctionInput] = useState(DEFAULT_SETTINGS.functionInput);
  
  // State for visualization
  const [algorithm, setAlgorithm] = useState('v0');
  const [parameters, setParameters] = useState<Record<string, number>>({});
  
  // Unified state for sonification
  const [sonificationEngineId, setSonificationEngineId] = useState<SonificationEngineId>(AUDIO_SETTINGS.defaultSonificationEngine);
  const [sonificationParams, setSonificationParams] = useState<Record<string, number>>({});
  const [userSample, setUserSample] = useState<AudioBuffer | null>(null);
  const [userSampleName, setUserSampleName] = useState<string | null>(null);
  
  // UI State
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);
  const controlsRef = useRef<HTMLDivElement>(null);
  const [controlsHeight, setControlsHeight] = useState(0);

  const currentModeInfo = useMemo(() => PROJECTION_MODES.find(m => m.id === currentMode), [currentMode]);
  
  // Effect to update algorithm and parameters when mode changes
  useEffect(() => {
    const newAlgorithm = currentModeInfo?.algorithms[0]?.id || 'default';
    setAlgorithm(newAlgorithm);
  }, [currentMode, currentModeInfo]);

  // Effect to update parameters when algorithm changes
  useEffect(() => {
      const currentAlgorithmInfo = currentModeInfo?.algorithms.find(a => a.id === algorithm);
      const newParams: Record<string, number> = {};
      currentAlgorithmInfo?.parameters.forEach(p => {
          newParams[p.id] = p.defaultValue;
      });
      setParameters(newParams);
  }, [currentModeInfo, algorithm]);
  
  // Effect to update sonification parameters when engine changes
  useEffect(() => {
    const currentEngineInfo = SONIFICATION_ENGINES.find(e => e.id === sonificationEngineId);
    const newParams: Record<string, number> = {};
    currentEngineInfo?.parameters.forEach(p => {
        newParams[p.id] = p.defaultValue;
    });
    setSonificationParams(newParams);
  }, [sonificationEngineId]);


  useEffect(() => {
    if (controlsRef.current) {
        setControlsHeight(isControlsCollapsed ? 44 : controlsRef.current.clientHeight);
    }
  }, [isControlsCollapsed, controlsRef.current?.clientHeight]);
  
  const parsedFunction = useMemo(() => parseFunction(functionInput), [functionInput]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { setupAudio, isAudioReady } = useAudio({ 
    isPlaying, 
    volume, 
    isMuted, 
    parsedFunction, 
    engineId: sonificationEngineId, 
    engineParams: sonificationParams,
    visParams: parameters,
    userSample,
  });
  const { resetView } = useVisualization({ 
      canvasRef, 
      mode: currentMode, 
      algorithm, 
      parameters, 
      isPlaying, 
      parsedFunction, 
      useAdaptiveCentering, 
      controlsHeight
  });

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const handleSelectPreset = useCallback((equation: string) => {
    setFunctionInput(equation);
    setShowPresets(false);
  }, []);

  const handlePlayToggle = () => {
    if (!isAudioReady) {
        setupAudio();
    }
    setIsPlaying(prev => !prev);
  }

  const handleCycleMode = useCallback(() => {
    const currentIndex = PROJECTION_MODES.findIndex(m => m.id === currentMode);
    const nextIndex = (currentIndex + 1) % PROJECTION_MODES.length;
    setCurrentMode(PROJECTION_MODES[nextIndex].id);
  }, [currentMode]);

  const handleSampleLoad = useCallback(async (file: File) => {
    const tempAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    try {
        const arrayBuffer = await file.arrayBuffer();
        const decodedData = await tempAudioContext.decodeAudioData(arrayBuffer);
        setUserSample(decodedData);
        setUserSampleName(file.name);
    } catch (error) {
        console.error("Failed to load or decode audio file:", error);
        alert("Failed to load sample. Please try a different WAV, MP3, or OGG file.");
    } finally {
        tempAudioContext.close();
    }
  }, []);

  const clearUserSample = useCallback(() => {
    setUserSample(null);
    setUserSampleName(null);
  }, []);

  const saveState = useCallback(() => {
    const state = {
        functionInput,
        currentMode,
        algorithm,
        parameters,
        sonificationEngineId,
        sonificationParams,
        volume,
        isMuted,
        showEquation,
        useAdaptiveCentering,
        showExperimentalEngines,
        showEditableEquation,
    };
    try {
        localStorage.setItem('synesthetica_workspace', JSON.stringify(state));
        alert('Workspace saved!');
    } catch (error) {
        console.error("Failed to save workspace:", error);
        alert('Failed to save workspace.');
    }
  }, [functionInput, currentMode, algorithm, parameters, sonificationEngineId, sonificationParams, volume, isMuted, showEquation, useAdaptiveCentering, showExperimentalEngines, showEditableEquation]);

  const loadState = useCallback(() => {
      try {
          const savedStateJSON = localStorage.getItem('synesthetica_workspace');
          if (savedStateJSON) {
              const savedState = JSON.parse(savedStateJSON);
              setFunctionInput(savedState.functionInput || DEFAULT_SETTINGS.functionInput);
              setCurrentMode(savedState.currentMode || DEFAULT_SETTINGS.mode);
              setAlgorithm(savedState.algorithm || 'default');
              setParameters(savedState.parameters || {});
              setSonificationEngineId(savedState.sonificationEngineId || AUDIO_SETTINGS.defaultSonificationEngine);
              setSonificationParams(savedState.sonificationParams || {});
              setVolume(savedState.volume ?? DEFAULT_SETTINGS.volume);
              setIsMuted(savedState.isMuted ?? false);
              setShowEquation(savedState.showEquation ?? false);
              setUseAdaptiveCentering(savedState.useAdaptiveCentering ?? true);
              setShowExperimentalEngines(savedState.showExperimentalEngines ?? false);
              setShowEditableEquation(savedState.showEditableEquation ?? false);
              alert('Workspace loaded!');
          } else {
              alert('No saved workspace found.');
          }
      } catch (error) {
          console.error("Failed to load workspace:", error);
          alert('Failed to load workspace.');
      }
  }, []);

  return (
    <div className="h-screen w-screen bg-black text-white relative overflow-hidden font-sans">
      <Header
        isMenuOpen={isMenuOpen}
        toggleMenu={() => setIsMenuOpen(prev => !prev)}
        currentModeInfo={currentModeInfo}
        isPlaying={isPlaying}
        togglePlay={handlePlayToggle}
        isMuted={isMuted}
        toggleMute={() => setIsMuted(prev => !prev)}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        isAudioReady={isAudioReady}
        openPresets={() => setShowPresets(true)}
        cycleMode={handleCycleMode}
      />

      <SideMenu
        isOpen={isMenuOpen}
        functionInput={functionInput}
        setFunctionInput={setFunctionInput}
        currentMode={currentMode}
        setCurrentMode={setCurrentMode}
        closeMenu={() => setIsMenuOpen(false)}
        resetView={resetView}
        openHelp={() => setShowHelp(true)}
        openAppSettings={() => setShowAppSettings(true)}
        saveState={saveState}
        loadState={loadState}
      />
      
      <main className="absolute inset-0 top-[60px] h-[calc(100%-60px)]">
        {showEquation && (
          <div className="absolute top-4 left-4 z-10 bg-black/60 p-2 rounded font-mono text-cyan-300 text-sm max-w-[calc(100%-4rem)] break-all">
            {functionInput}
          </div>
        )}
        <canvas ref={canvasRef} className="w-full h-full" />
      </main>

      <div ref={controlsRef}>
        {!isMenuOpen && (
          <BottomControls
              isMuted={isMuted}
              volume={volume}
              setVolume={setVolume}
              currentModeInfo={currentModeInfo}
              parameters={parameters}
              setParameters={setParameters}
              algorithm={algorithm}
              setAlgorithm={setAlgorithm}
              sonificationEngineId={sonificationEngineId}
              setSonificationEngineId={setSonificationEngineId}
              sonificationParams={sonificationParams}
              setSonificationParams={setSonificationParams}
              isCollapsed={isControlsCollapsed}
              setIsCollapsed={setIsControlsCollapsed}
              showExperimentalEngines={showExperimentalEngines}
              onSampleLoad={handleSampleLoad}
              userSampleName={userSampleName}
              clearUserSample={clearUserSample}
              showEditableEquation={showEditableEquation}
              functionInput={functionInput}
              setFunctionInput={setFunctionInput}
          />
        )}
      </div>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <SettingsModal isOpen={showPresets} onClose={() => setShowPresets(false)} onSelectPreset={handleSelectPreset} />
      <AppSettingsModal 
        isOpen={showAppSettings} 
        onClose={() => setShowAppSettings(false)}
        showEquation={showEquation}
        setShowEquation={setShowEquation}
        useAdaptiveCentering={useAdaptiveCentering}
        setUseAdaptiveCentering={setUseAdaptiveCentering}
        showExperimentalEngines={showExperimentalEngines}
        setShowExperimentalEngines={setShowExperimentalEngines}
        showEditableEquation={showEditableEquation}
        setShowEditableEquation={setShowEditableEquation}
      />
      
      {!isAudioReady && (
        // FIX: The `setupAudio` function signature is not compatible with an onClick event handler. Wrapped it in an arrow function to resolve the type error.
        <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center cursor-pointer" onClick={() => setupAudio()}>
            <div className="text-center p-8 border border-gray-600 rounded-lg bg-gray-900 animate-pulse">
                <h2 className="text-2xl font-bold mb-4">Welcome to Synesthetica</h2>
                <p className="mb-6">Click anywhere to initialize the audio engine.</p>
                <div className="px-6 py-3 bg-cyan-600 text-white rounded-lg font-semibold transition-colors">
                    Start Exploration
                </div>
            </div>
        </div>
      )}
      
      <div className="absolute top-[70px] right-4 z-30 flex items-center gap-2 text-xs text-gray-400">
        <div className={`w-3 h-3 rounded-full ${isPlaying && isAudioReady ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
        <span>Audio</span>
      </div>

    </div>
  );
};

export default App;