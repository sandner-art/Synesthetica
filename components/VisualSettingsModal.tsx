import React from 'react';

interface AppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showEquation: boolean;
  setShowEquation: (show: boolean) => void;
  useAdaptiveCentering: boolean;
  setUseAdaptiveCentering: (use: boolean) => void;
  showExperimentalEngines: boolean;
  setShowExperimentalEngines: (show: boolean) => void;
}

export const AppSettingsModal: React.FC<AppSettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    showEquation, 
    setShowEquation,
    useAdaptiveCentering,
    setUseAdaptiveCentering,
    showExperimentalEngines,
    setShowExperimentalEngines,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full border border-gray-600" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">App Settings</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div className="space-y-4">
            {/* Show Equation Toggle */}
            <div className="flex items-center justify-between">
                <label htmlFor="show-equation-toggle" className="text-gray-300">
                    Show Equation Overlay
                </label>
                <button
                    id="show-equation-toggle"
                    role="switch"
                    aria-checked={showEquation}
                    onClick={() => setShowEquation(!showEquation)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
                        showEquation ? 'bg-cyan-600' : 'bg-gray-600'
                    }`}
                >
                    <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
                            showEquation ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                </button>
            </div>
            
            {/* Adaptive Centering Toggle */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <label htmlFor="adaptive-centering-toggle" className="text-gray-300">
                   Adaptive Centering
                   <p className="text-xs text-gray-500">Center view in visible area</p>
                </label>
                <button
                    id="adaptive-centering-toggle"
                    role="switch"
                    aria-checked={useAdaptiveCentering}
                    onClick={() => setUseAdaptiveCentering(!useAdaptiveCentering)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
                        useAdaptiveCentering ? 'bg-cyan-600' : 'bg-gray-600'
                    }`}
                >
                    <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
                            useAdaptiveCentering ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                </button>
            </div>
            
            {/* Show Experimental Engines Toggle */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <label htmlFor="show-experimental-toggle" className="text-gray-300">
                   Show Experimental Engines
                   <p className="text-xs text-gray-500">Adds advanced engines to list</p>
                </label>
                <button
                    id="show-experimental-toggle"
                    role="switch"
                    aria-checked={showExperimentalEngines}
                    onClick={() => setShowExperimentalEngines(!showExperimentalEngines)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${
                        showExperimentalEngines ? 'bg-cyan-600' : 'bg-gray-600'
                    }`}
                >
                    <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
                            showExperimentalEngines ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                </button>
            </div>


        </div>
      </div>
    </div>
  );
};