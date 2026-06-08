"use client";

import React, { useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import SceneGraph from './SceneGraph';
import { useViewerStore } from '@/lib/store/useViewerStore';
import { transformArchitectureToGraph } from '@/lib/graphUtils';
import { Loader2 } from 'lucide-react';

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
      <div className="flex justify-center items-center h-full w-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (graphData.nodes.length === 0) {
    return (
      <div className="flex justify-center items-center h-full w-full min-h-[400px]">
        <p className="text-gray-400">No architecture data available for this version.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#09090b] relative">
      <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
        <color attach="background" args={['#09090b']} />
        <SceneGraph graphData={graphData} />
      </Canvas>
      
      {/* HUD overlay for current version */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <h4 className="text-white text-xl font-semibold drop-shadow-md">
          Version {currentVersion?.version_number || 1}
        </h4>
        <p className="text-white/70 text-sm">
          {graphData.nodes.length} Nodes • {graphData.edges.length} Dependencies
        </p>
      </div>
    </div>
  );
}
