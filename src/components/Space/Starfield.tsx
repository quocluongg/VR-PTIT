"use client";

import { useFrame } from "@react-three/fiber";
import { Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useRef } from "react";

export default function Starfield() {
  const bgRef = useRef<THREE.Mesh>(null);
  
  // useTexture uses React Suspense to ensure the texture is loaded before rendering
  const bgTexture = useTexture("/textures/2k_stars_milky_way.jpg");
  bgTexture.colorSpace = THREE.SRGBColorSpace;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (bgRef.current) bgRef.current.rotation.y = t * 0.003;
  });

  return (
    <>
      {/* Milky-way background sphere */}
      <mesh ref={bgRef}>
        <sphereGeometry args={[150, 64, 64]} />
        <meshBasicMaterial
          map={bgTexture}
          side={THREE.BackSide}
          color="#ffffff" 
        />
      </mesh>

      {/* Particle stars on top using drei's optimized Stars */}
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1} 
      />
    </>
  );
}
