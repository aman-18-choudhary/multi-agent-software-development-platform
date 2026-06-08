"use client";

import React, { useMemo } from 'react';
import { OrbitControls, Environment } from '@react-three/drei';
import GraphNode from './GraphNode';
import GraphEdge from './GraphEdge';
import { GraphData } from '@/lib/graphUtils';
import { useViewerStore } from '@/lib/store/useViewerStore';

interface SceneGraphProps {
  graphData: GraphData;
}

export default function SceneGraph({ graphData }: SceneGraphProps) {
  const setSelectedNode = useViewerStore((state) => state.setSelectedNode);

  // Generate deterministic circular positions for nodes
  const nodePositions = useMemo(() => {
    const positions: Record<string, [number, number, number]> = {};
    const count = graphData.nodes.length;
    const radius = Math.max(5, count * 0.8);
    
    graphData.nodes.forEach((node, i) => {
      // Create a nice spiral or circle layout
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (i % 3) * 1.5 - 1.5; // Slight vertical variation
      
      positions[node.id] = [x, y, z];
    });
    
    return positions;
  }, [graphData.nodes]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <Environment preset="city" />
      
      {/* Background click to deselect */}
      <mesh visible={false} position={[0, 0, 0]} onPointerMissed={() => setSelectedNode(null)}>
        <sphereGeometry args={[100, 16, 16]} />
      </mesh>

      <group>
        {graphData.edges.map((edge) => {
          const start = nodePositions[edge.source];
          const end = nodePositions[edge.target];
          
          if (!start || !end) return null;
          
          return (
            <GraphEdge 
              key={edge.id} 
              edge={edge} 
              start={start} 
              end={end} 
            />
          );
        })}

        {graphData.nodes.map((node) => (
          <GraphNode 
            key={node.id} 
            node={node} 
            position={nodePositions[node.id] || [0, 0, 0]} 
          />
        ))}
      </group>

      <OrbitControls 
        makeDefault 
        minDistance={2} 
        maxDistance={50}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}
