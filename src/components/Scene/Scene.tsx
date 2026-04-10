"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { VRButton, XR, Controllers } from "@react-three/xr";
import Earth from "@/components/Earth/Earth";
import Starfield from "@/components/Space/Starfield";
import Moon from "@/components/Space/Moon";
import Sun from "@/components/Space/Sun";
import VRUI from "@/components/UI/VRUI";
import VRCursor from "@/components/UI/VRCursor";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import VRControllerInteraction from "@/components/Controls/VRControllerInteraction";

export default function Scene() {
  const universeRef = useRef<THREE.Group>(null);
  return (
    <>
      <VRButton />
      <Canvas
        shadows
        camera={{ position: [0, 0, 0], fov: 45 }}
        gl={{ antialias: true }}
      >
        <XR>
          <Controllers />
          <VRCursor />
          
          <color attach="background" args={["#000000"]} />
          <ambientLight intensity={0.15} />
          
          <group position={[0, 0, -5]} ref={universeRef}>
            <Suspense fallback={null}>
              <Sun />
              <Earth />
              <Moon />
              <Starfield />
              <VRUI />
            </Suspense>
          </group>

          <VRControllerInteraction targetRef={universeRef} />

          <OrbitControls
            target={[0, 0, -5]}
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
