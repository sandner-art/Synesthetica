import React, { useMemo } from 'react';
import { EQUATION_PRESETS } from '../equations/presets';
import type { EquationPreset } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (equation: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSelectPreset }) => {
  if (!isOpen) return null;

  const groupedPresets = useMemo(() => {
    return EQUATION_PRESETS.reduce((acc, preset) => {
      let categoryName: string;
      switch (preset.category) {
        case 'modified':
          // Group all new types of presets together for a richer exploration list
          categoryName = 'Modified & Advanced Presets';
          break;
        case 'classic':
        default:
          categoryName = 'Classic Presets';
      }
      
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(preset);
      return acc;
    }, {} as Record<string, EquationPreset[]>);
  }, []);

  const categoryOrder = ['Classic Presets', 'Modified & Advanced Presets'];

  return (
    <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full border border-gray-600 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Equation Presets</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div className="overflow-y-auto pr-2 space-y-3">
          {categoryOrder.map(category => (
            groupedPresets[category] && (
              <details key={category} open={category === 'Classic Presets'}>
                <summary className="font-semibold text-gray-300 cursor-pointer hover:text-white list-item">
                  {category}
                </summary>
                <div className="space-y-2 mt-2 pl-2 border-l-2 border-gray-700">
                  {groupedPresets[category].map((preset: EquationPreset) => (
                    <button
                      key={preset.name}
                      onClick={() => onSelectPreset(preset.equation)}
                      className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                    >
                      <p className="font-semibold text-gray-200 text-sm">{preset.name}</p>
                      <p className="font-mono text-xs text-cyan-400 mt-1">{preset.equation}</p>
                    </button>
                  ))}
                </div>
              </details>
            )
          ))}
        </div>
      </div>
    </div>
  );
};