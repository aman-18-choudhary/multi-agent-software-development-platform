"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

// A single floating shape
function Shape({
  position,
  rotation,
  scale,
  geometry,
  color,
  floatIntensity,
  floatSpeed,
}: any) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Float
      speed={floatSpeed}
      rotationIntensity={1}
      floatIntensity={floatIntensity}
    >
      <mesh
        ref={meshRef}
        position={position}
        rotation={rotation}
        scale={scale}
        geometry={geometry}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={color}
          roughness={0.1}
          metalness={0.8}
          transmission={0.5}
          thickness={0.5}
          ior={1.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </Float>
  );
}

export default function FloatingShapes() {
  const geometries = useMemo(
    () => ({
      torus: new THREE.TorusGeometry(1, 0.4, 32, 100),
      icosahedron: new THREE.IcosahedronGeometry(1, 0),
      sphere: new THREE.SphereGeometry(1, 32, 32),
      cylinder: new THREE.CylinderGeometry(0.5, 0.5, 2, 32),
    }),
    []
  );

  const colors = ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"];

  return (
    <div className="absolute inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={2}
          castShadow
        />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#8b5cf6" />

        <Shape
          geometry={geometries.torus}
          color={colors[0]}
          position={[-6, 3, -2]}
          rotation={[Math.PI / 4, Math.PI / 4, 0]}
          scale={1.5}
          floatIntensity={2}
          floatSpeed={2}
        />

        <Shape
          geometry={geometries.icosahedron}
          color={colors[1]}
          position={[5, -2, -4]}
          rotation={[0, Math.PI / 3, 0]}
          scale={1.8}
          floatIntensity={3}
          floatSpeed={1.5}
        />

        <Shape
          geometry={geometries.sphere}
          color={colors[2]}
          position={[-4, -4, 0]}
          rotation={[0, 0, 0]}
          scale={1.2}
          floatIntensity={1.5}
          floatSpeed={2.5}
        />

        <Shape
          geometry={geometries.cylinder}
          color={colors[3]}
          position={[7, 4, -1]}
          rotation={[Math.PI / 4, 0, Math.PI / 6]}
          scale={1.4}
          floatIntensity={2.5}
          floatSpeed={1.8}
        />

        <Shape
          geometry={geometries.torus}
          color={colors[4]}
          position={[0, 6, -5]}
          rotation={[Math.PI / 2, 0, Math.PI / 4]}
          scale={1}
          floatIntensity={2}
          floatSpeed={3}
        />

        <Environment preset="city" />
        <ContactShadows
          position={[0, -8, 0]}
          opacity={0.4}
          scale={40}
          blur={2}
          far={9}
        />
      </Canvas>
    </div>
  );
}
