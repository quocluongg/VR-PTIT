"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { VRButton, XR } from "@react-three/xr";
import Earth from "@/components/Earth/Earth";
import Starfield from "@/components/Space/Starfield";
import Moon from "@/components/Space/Moon";
import Sun from "@/components/Space/Sun";
import { Suspense } from "react";

export default function Scene() {
  return (
    <>
      <VRButton />
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true }}
      >
        <XR>
          <color attach="background" args={["#000000"]} />
          <ambientLight intensity={0.15} />
          
          <Suspense fallback={null}>
            <Sun />
            <Earth />
            <Moon />
            <Starfield />
          </Suspense>

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={2}
            maxDistance={15}
          />
        </XR>
      </Canvas>
    </>
  );
}
