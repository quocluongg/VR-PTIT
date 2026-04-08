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
import { Suspense } from "react";

export default function Scene() {
  return (
    <>
      <VRButton />
      <Canvas
        camera={{ position: [0, 0, 0], fov: 45 }}
        gl={{ antialias: true }}
      >
        <XR>
          <Controllers />
          <VRCursor />
          
          <color attach="background" args={["#000000"]} />
          <ambientLight intensity={0.15} />
          
          {/* We offset the universe in Z so the user in VR (who starts at 0,0,0) is correctly distanced from the Earth */}
          <group position={[0, 0, -5]}>
            <Suspense fallback={null}>
              <Sun />
              <Earth />
              <Moon />
              <Starfield />
              <VRUI />
            </Suspense>
          </group>

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
