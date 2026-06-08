"use client";

import React, { useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useViewerStore } from '@/lib/store/useViewerStore';

export default function PlaybackControls() {
  const versions = useViewerStore((state) => state.versions);
  const currentIndex = useViewerStore((state) => state.currentVersionIndex);
  const setVersionIndex = useViewerStore((state) => state.setVersionIndex);
  const isPlaying = useViewerStore((state) => state.isPlaying);
  const togglePlayback = useViewerStore((state) => state.togglePlayback);
  const setPlayback = useViewerStore((state) => state.setPlayback);

  // Auto-playback logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setVersionIndex((currentIndex + 1) % versions.length);
      }, 3000); // 3 seconds per version
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentIndex, versions.length, setVersionIndex]);

  if (versions.length <= 1) return null;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[400px] rounded-[32px] shadow-lg p-4 flex flex-col gap-4 z-10 bg-white/10 backdrop-blur-md border border-white/10 text-white">
      <div className="flex items-center justify-center gap-4">
        <button 
          onClick={() => {
            setPlayback(false);
            setVersionIndex((currentIndex - 1 + versions.length) % versions.length);
          }}
          className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <SkipBack size={20} />
        </button>
        
        <button 
          onClick={togglePlayback}
          className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-colors shadow-md"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        
        <button 
          onClick={() => {
            setPlayback(false);
            setVersionIndex((currentIndex + 1) % versions.length);
          }}
          className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <SkipForward size={20} />
        </button>
      </div>

      <div className="px-4 pb-2">
        <input 
          type="range" 
          min={0} 
          max={versions.length - 1} 
          step={1} 
          value={currentIndex}
          onChange={(e) => {
            setPlayback(false);
            setVersionIndex(parseInt(e.target.value));
          }}
          className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex justify-between mt-2 px-1">
          {versions.map((v, i) => (
            <span key={i} className={`text-[10px] font-medium ${i === currentIndex ? 'text-indigo-400' : 'text-gray-400'}`}>
              V{v.version_number}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
