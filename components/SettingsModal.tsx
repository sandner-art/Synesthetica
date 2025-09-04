import React from 'react';
import { EQUATION_PRESETS } from '../constants';
import type { EquationPreset } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (equation: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSelectPreset }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full border border-gray-600 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Equation Presets</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div className="overflow-y-auto pr-2 space-y-2">
          {EQUATION_PRESETS.map((preset: EquationPreset) => (
            <button
              key={preset.name}
              onClick={() => onSelectPreset(preset.equation)}
              className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
            >
              <p className="font-semibold text-gray-200">{preset.name}</p>
              <p className="font-mono text-xs text-cyan-400">{preset.equation}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};