"use client";

import React from 'react';
import { Line } from '@react-three/drei';
import { GraphEdge as GraphEdgeType } from '@/lib/graphUtils';
import { useViewerStore } from '@/lib/store/useViewerStore';

interface GraphEdgeProps {
  edge: GraphEdgeType;
  start: [number, number, number];
  end: [number, number, number];
}

export default function GraphEdge({ edge, start, end }: GraphEdgeProps) {
  const selectedNode = useViewerStore((state) => state.selectedNode);
  
  // Highlight edge if it connects to the selected node
  const isHighlighted = selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id);
  const opacity = selectedNode ? (isHighlighted ? 0.8 : 0.1) : 0.4;
  const color = isHighlighted ? '#0B6BCB' : '#A1A1AA';

  return (
    <Line
      points={[start, end]}
      color={color}
      lineWidth={isHighlighted ? 3 : 1}
      transparent
      opacity={opacity}
      dashed={false}
    />
  );
}
