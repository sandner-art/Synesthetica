
import React from 'react';
import { Menu, Play, Pause, Volume2, VolumeX, Maximize, Minimize, List, Shuffle } from 'lucide-react';
import type { ProjectionMode } from '../types';

interface HeaderProps {
  isMenuOpen: boolean;
  toggleMenu: () => void;
  currentModeInfo: ProjectionMode | undefined;
  isPlaying: boolean;
  togglePlay: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  isAudioReady: boolean;
  openPresets: () => void;
  cycleMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isMenuOpen,
  toggleMenu,
  currentModeInfo,
  isPlaying,
  togglePlay,
  isMuted,
  toggleMute,
  isFullscreen,
  toggleFullscreen,
  isAudioReady,
  openPresets,
  cycleMode,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMenu}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            {currentModeInfo && <currentModeInfo.icon size={18} className="text-cyan-400" />}
            <span className="font-medium text-sm">{currentModeInfo?.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={openPresets}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Open equation presets"
          >
            <List size={18} />
          </button>
           <button
            onClick={cycleMode}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Next projection mode"
          >
            <Shuffle size={18} />
          </button>
          <button
            onClick={togglePlay}
            className={`p-2 hover:bg-gray-800 rounded-lg transition-colors ${!isAudioReady ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            disabled={!isAudioReady}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button
            onClick={toggleMute}
            className={`p-2 hover:bg-gray-800 rounded-lg transition-colors ${!isAudioReady ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            disabled={!isAudioReady}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors hidden sm:block"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};
