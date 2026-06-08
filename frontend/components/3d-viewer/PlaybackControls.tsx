"use client";

import React, { useEffect } from 'react';
import { Sheet, Box, IconButton, Typography, Slider } from '@mui/joy';
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
    <Sheet
      sx={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 400,
        borderRadius: '32px',
        boxShadow: 'lg',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <IconButton 
          size="sm" 
          variant="plain" 
          onClick={() => {
            setPlayback(false);
            setVersionIndex((currentIndex - 1 + versions.length) % versions.length);
          }}
        >
          <SkipBack size={18} />
        </IconButton>
        
        <IconButton 
          size="lg" 
          variant="solid" 
          color="primary" 
          sx={{ borderRadius: '50%' }}
          onClick={togglePlayback}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </IconButton>
        
        <IconButton 
          size="sm" 
          variant="plain" 
          onClick={() => {
            setPlayback(false);
            setVersionIndex((currentIndex + 1) % versions.length);
          }}
        >
          <SkipForward size={18} />
        </IconButton>
      </Box>

      <Box sx={{ px: 2 }}>
        <Slider
          min={0}
          max={versions.length - 1}
          step={1}
          value={currentIndex}
          onChange={(_, value) => {
            setPlayback(false);
            setVersionIndex(value as number);
          }}
          marks={versions.map((v, i) => ({ value: i, label: `V${v.version_number}` }))}
          valueLabelDisplay="off"
          sx={{
            '--Slider-markActiveColor': 'white',
          }}
        />
      </Box>
    </Sheet>
  );
}
