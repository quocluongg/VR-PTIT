"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { VRButton, XR, Controllers, useXR } from "@react-three/xr";
import * as THREE from "three";
import Earth from "@/components/Earth/Earth";
import Starfield from "@/components/Space/Starfield";
import Moon from "@/components/Space/Moon";
import Sun from "@/components/Space/Sun";
import VRUI from "@/components/UI/VRUI";
import VRCursor from "@/components/UI/VRCursor";
import { useStore } from "@/store/useStore";
import { Suspense, useRef, useEffect } from "react";

// VR Controller rotation component
function VRControlRotation() {
  const { controllers, isPresenting } = useXR();
  const { scene } = useThree();
  const { toggleMenu } = useStore();
  const rotationRef = useRef({ x: 0, y: 0 });
  const sceneGroupRef = useRef<THREE.Group | null>(null);
  const controllerStateRef = useRef<{
    [controllerIdx: number]: {
      lastPos: THREE.Vector3 | null;
      gripPressed: boolean;
      buttonAPressed: boolean;
    };
  }>({});

  // Find the scene group
  useEffect(() => {
    const group = scene.children.find((child: any) => child.position.z === -5);
    if (group) {
      sceneGroupRef.current = group as THREE.Group;
    }
  }, [scene]);

  useFrame(() => {
    if (!isPresenting || controllers.length < 1 || !sceneGroupRef.current) return;

    controllers.forEach((controller, idx) => {
      if (!controller) return;

      const input = controller.inputSource?.gamepad;
      if (!input) return;

      if (!controllerStateRef.current[idx]) {
        controllerStateRef.current[idx] = {
          lastPos: null,
          gripPressed: false,
          buttonAPressed: false,
        };
      }

      const state = controllerStateRef.current[idx];

      // Button A - toggle menu
      const buttonAPressed = input.buttons[4]?.pressed || false;
      if (buttonAPressed && !state.buttonAPressed) {
        toggleMenu();
      }
      state.buttonAPressed = buttonAPressed;

      // Thumbstick rotation
      if (input.axes.length >= 2) {
        rotationRef.current.x += input.axes[0] * 0.02;
        rotationRef.current.y += input.axes[1] * 0.02;
      }

      // Grip button + drag rotation
      const gripPressed = input.buttons[1]?.pressed || false;

      if (gripPressed) {
        if (!state.gripPressed) {
          state.lastPos = controller.position.clone();
        } else if (state.lastPos) {
          const currentPos = controller.position;
          const deltaX = currentPos.x - state.lastPos.x;
          const deltaY = currentPos.y - state.lastPos.y;

          rotationRef.current.x += deltaX * 1.5;
          rotationRef.current.y -= deltaY * 1.5;

          state.lastPos = currentPos.clone();
        }
      } else {
        state.lastPos = null;
      }

      state.gripPressed = gripPressed;
    });

    // Apply rotation to scene group
    if (sceneGroupRef.current) {
      sceneGroupRef.current.rotation.y = rotationRef.current.x;
      sceneGroupRef.current.rotation.x = rotationRef.current.y;
    }
  });

  return null;
}

export default function Scene() {
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
          <VRControlRotation />

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
