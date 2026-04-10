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
  const scaleRef = useRef(1.0);
  const { camera } = useThree();
  const targetGroupRef = useRef<THREE.Group | null>(null);
  const controllerStateRef = useRef<{
    [controllerIdx: number]: {
      lastPos: THREE.Vector3 | null;
      lastPosTrigger: THREE.Vector3 | null;
      gripPressed: boolean;
      triggerPressed: boolean;
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
          lastPosTrigger: null,
          gripPressed: false,
          triggerPressed: false,
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

      // ===== Trigger button + drag to zoom =====
      // Button 0 is typically the trigger button
      const triggerPressed = input.buttons[0]?.pressed || false;
      
      if (triggerPressed) {
        if (!state.triggerPressed) {
          // Trigger just pressed - save starting position
          state.lastPosTrigger = controller.position.clone();
        } else if (state.lastPosTrigger) {
          // Trigger held - calculate delta and zoom
          const currentPos = controller.position;
          // Calculate movement primarily along Y (vertical map to zoom) and Z (push/pull map to zoom)
          // We'll use pull down or towards yourself to zoom out, push up/away to zoom in
          const deltaY = currentPos.y - state.lastPosTrigger.y;
          const deltaZ = currentPos.z - state.lastPosTrigger.z;
          
          // Z axis in VR is negative forward. So -deltaZ is moving forward.
          // Add Y movement (up) as zoom in too.
          const movement = deltaY - deltaZ;
          
          scaleRef.current += movement * 2.5; // Sensitivity
          
          // Clamp scale to reasonable limits
          scaleRef.current = Math.max(0.2, Math.min(scaleRef.current, 5.0));
          
          // Update position for next frame
          state.lastPosTrigger = currentPos.clone();
        }
      } else {
        // Trigger released
        state.lastPosTrigger = null;
      }
      state.triggerPressed = triggerPressed;

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

    // Apply rotation and scale to the scene's target group
    if (targetGroupRef.current) {
      targetGroupRef.current.rotation.y = rotationRef.current.x;
      targetGroupRef.current.rotation.x = rotationRef.current.y;
      targetGroupRef.current.scale.setScalar(scaleRef.current);
    }
  });

  return null;
}
