"use client";

import React, { useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import SceneGraph from './SceneGraph';
import { useViewerStore } from '@/lib/store/useViewerStore';
import { transformArchitectureToGraph } from '@/lib/graphUtils';
import { Box, Typography, CircularProgress } from '@mui/joy';

export default function ArchitectureViewer() {
  const versions = useViewerStore((state) => state.versions);
  const currentVersionIndex = useViewerStore((state) => state.currentVersionIndex);
  
  const currentVersion = versions[currentVersionIndex];
  
  const graphData = useMemo(() => {
    if (!currentVersion?.architect_output) return { nodes: [], edges: [] };
    return transformArchitectureToGraph(currentVersion.architect_output);
  }, [currentVersion]);

  if (!versions.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (graphData.nodes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
        <Typography>No architecture data available for this version.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%', background: '#09090b', position: 'relative' }}>
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <color attach="background" args={['#09090b']} />
        <SceneGraph graphData={graphData} />
      </Canvas>
      
      {/* HUD overlay for current version */}
      <Box sx={{ position: 'absolute', top: 16, left: 16, pointerEvents: 'none' }}>
        <Typography level="h4" sx={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          Version {currentVersion?.version_number || 1}
        </Typography>
        <Typography level="body-sm" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          {graphData.nodes.length} Nodes • {graphData.edges.length} Dependencies
        </Typography>
      </Box>
    </Box>
  );
}
