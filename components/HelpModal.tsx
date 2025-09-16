import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full border border-gray-600 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex-shrink-0 flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Quick Help</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div className="overflow-y-auto pr-2">
            <div className="space-y-3 text-sm text-gray-300">
                <p><strong>Mouse/Touch Drag:</strong> Rotate visualization.</p>
                <p><strong>Mouse Wheel/Pinch:</strong> Zoom in and out.</p>
                <p><strong>Play/Pause:</strong> Start or stop the animation and sonification.</p>
                <p><strong>f(x, t, a, b, c):</strong> Enter a javascript math expression. Use variables 'x' (space), 't' (time), and 'a', 'b', 'c' (preset constants, initially 1).</p>
                <div className="pt-2 border-t border-gray-600">
                    <strong>Syntax Examples:</strong>
                    <div className="font-mono text-xs text-cyan-300 mt-2 bg-gray-900 p-2 rounded">
                    <p>a*x^2 + b*x + c</p>
                    <p>sin(b*x + t)</p>
                    <p>a*exp(-abs(x))*cos(t)</p>
                    </div>
                </div>
            </div>
        </div>
        <div className="flex-shrink-0 mt-6 pt-4 border-t border-gray-700 text-center text-xs text-gray-400">
            <p className="mb-2">Copyright © Daniel Sandner, 2025</p>
            <div className="flex justify-center items-center gap-4 flex-wrap">
                <a href="https://sandner.art/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Articles</a>
                <a href="https://eigensound.com/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Sonification Experiments</a>
                <a href="https://github.com/sandner-art/Synesthetica" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Code, Docs, License</a>
            </div>
        </div>
      </div>
    </div>
  );
};