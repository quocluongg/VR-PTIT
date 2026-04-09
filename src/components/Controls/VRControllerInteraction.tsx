"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useXR } from "@react-three/xr";
import * as THREE from "three";
import { useStore } from "@/store/useStore";

export default function VRControllerInteraction() {
  const { controllers, isPresenting } = useXR();
  const { toggleMenu } = useStore();
  const rotationRef = useRef({ x: 0, y: 0 });
  const { camera } = useThree();
  const targetGroupRef = useRef<THREE.Group | null>(null);
  const controllerStateRef = useRef<{
    [controllerIdx: number]: {
      lastPos: THREE.Vector3 | null;
      gripPressed: boolean;
      buttonAPressed: boolean;
    };
  }>({});

  // Get the target group from the scene
  useEffect(() => {
    const targetGroup = camera.parent;
    if (targetGroup) {
      targetGroupRef.current = targetGroup as THREE.Group;
    }
  }, [camera]);

  useFrame(() => {
    if (!isPresenting || controllers.length < 1) return;

    controllers.forEach((controller, idx) => {
      if (!controller) return;

      const input = controller.inputSource?.gamepad;
      if (!input) return;

      // Initialize state for this controller if not exists
      if (!controllerStateRef.current[idx]) {
        controllerStateRef.current[idx] = {
          lastPos: null,
          gripPressed: false,
          buttonAPressed: false,
        };
      }

      const state = controllerStateRef.current[idx];

      // ===== Button A (toggle menu) =====
      // Button A is typically at index 4
      const buttonAPressed = input.buttons[4]?.pressed || false;
      
      // Detect button A press (transition from not pressed to pressed)
      if (buttonAPressed && !state.buttonAPressed) {
        toggleMenu();
      }
      state.buttonAPressed = buttonAPressed;

      // ===== Thumbstick rotation =====
      if (input.axes.length >= 2) {
        rotationRef.current.x += input.axes[0] * 0.02;
        rotationRef.current.y += input.axes[1] * 0.02;
      }

      // ===== Grip button + drag to rotate =====
      // Button 1 is typically the grip button
      const gripPressed = input.buttons[1]?.pressed || false;
      
      if (gripPressed) {
        if (!state.gripPressed) {
          // Grip just pressed - save starting position
          state.lastPos = controller.position.clone();
        } else if (state.lastPos) {
          // Grip held - calculate delta and rotate
          const currentPos = controller.position;
          const deltaX = currentPos.x - state.lastPos.x;
          const deltaY = currentPos.y - state.lastPos.y;
          
          // Apply rotation based on movement
          rotationRef.current.x += deltaX * 1.5;
          rotationRef.current.y -= deltaY * 1.5;
          
          // Update position for next frame
          state.lastPos = currentPos.clone();
        }
      } else {
        // Grip released
        state.lastPos = null;
      }

      state.gripPressed = gripPressed;
    });

    // Apply rotation to the scene's target group
    if (targetGroupRef.current) {
      targetGroupRef.current.rotation.y = rotationRef.current.x;
      targetGroupRef.current.rotation.x = rotationRef.current.y;
    }
  });

  return null;
}
