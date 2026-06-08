"use client";

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { GraphNode as GraphNodeType } from '@/lib/graphUtils';
import { useViewerStore } from '@/lib/store/useViewerStore';

interface GraphNodeProps {
  node: GraphNodeType;
  position: [number, number, number];
}

export default function GraphNode({ node, position }: GraphNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const setSelectedNode = useViewerStore((state) => state.setSelectedNode);
  const selectedNode = useViewerStore((state) => state.selectedNode);
  
  const isSelected = selectedNode?.id === node.id;
  const opacity = selectedNode ? (isSelected ? 1 : 0.4) : 1;
  
  const getColor = () => {
    if (isSelected) return '#0B6BCB'; // Joy UI Primary
    switch (node.type) {
      case 'database': return '#12467B';
      case 'client': return '#0A6CFF';
      default: return '#737373';
    }
  };

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedNode(node);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
      >
        <boxGeometry args={[1.5, 1, 0.5]} />
        <meshStandardMaterial 
          color={getColor()} 
          transparent 
          opacity={opacity}
          emissive={hovered ? '#ffffff' : '#000000'}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </mesh>
      
      <Html position={[0, -0.8, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          fontFamily: 'Inter, sans-serif',
          opacity: opacity,
          transition: 'opacity 0.3s'
        }}>
          {node.label}
        </div>
      </Html>
    </group>
  );
}
