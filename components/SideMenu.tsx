import React from 'react';
import { RotateCcw, Info, Settings, Save, FolderOpen } from 'lucide-react';
import { PROJECTION_MODES } from '../constants';
import type { ProjectionModeId } from '../types';

interface SideMenuProps {
  isOpen: boolean;
  functionInput: string;
  setFunctionInput: (value: string) => void;
  currentMode: ProjectionModeId;
  setCurrentMode: (modeId: ProjectionModeId) => void;
  closeMenu: () => void;
  resetView: () => void;
  openHelp: () => void;
  openAppSettings: () => void;
  saveState: () => void;
  loadState: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  functionInput,
  setFunctionInput,
  currentMode,
  setCurrentMode,
  closeMenu,
  resetView,
  openHelp,
  openAppSettings,
  saveState,
  loadState,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-[60px] left-0 right-0 bottom-0 z-40 bg-gray-900/95 backdrop-blur-sm overflow-y-auto">
      <div className="p-4 max-w-md mx-auto">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-300">Function f(x, t, a, b, c)</label>
          <input
            type="text"
            value={functionInput}
            onChange={(e) => setFunctionInput(e.target.value)}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="e.g., a * sin(b * x + t)"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-3 text-gray-300">Projection Mode</label>
          <div className="grid grid-cols-2 gap-3">
            {PROJECTION_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  setCurrentMode(mode.id);
                  closeMenu();
                }}
                className={`p-3 rounded-lg border transition-colors text-left ${
                  currentMode === mode.id
                    ? 'bg-cyan-600 border-cyan-500'
                    : 'bg-gray-800 border-gray-600 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <mode.icon size={16} />
                  <span className="font-medium text-sm">{mode.name}</span>
                </div>
                <p className="text-xs text-gray-400 leading-tight">{mode.description}</p>
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
            <button
                onClick={() => { saveState(); closeMenu(); }}
                className="flex items-center justify-center gap-2 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
                <Save size={16} />
                Save Workspace
            </button>
            <button
                onClick={() => { loadState(); closeMenu(); }}
                className="flex items-center justify-center gap-2 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
                <FolderOpen size={16} />
                Load Workspace
            </button>
        </div>
        
         <div className="pt-4 border-t border-gray-700 grid grid-cols-3 gap-2">
            <button
                onClick={() => { resetView(); closeMenu(); }}
                className="flex items-center justify-center gap-2 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
                <RotateCcw size={16} />
                Reset
            </button>
             <button
                onClick={() => { openAppSettings(); closeMenu(); }}
                className="flex items-center justify-center gap-2 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
                <Settings size={16} />
                Settings
            </button>
            <button
                onClick={() => { openHelp(); closeMenu(); }}
                className="flex items-center justify-center gap-2 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
            >
                <Info size={16} />
                Help
            </button>
         </div>

      </div>
    </div>
  );
};