"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useXR } from "@react-three/xr";
import * as THREE from "three";

export default function VRControllerInteraction() {
  const { controllers, isPresenting } = useXR();
  const rotationRef = useRef({ x: 0, y: 0 });
  const { camera } = useThree();
  const targetGroupRef = useRef<THREE.Group | null>(null);

  // Get the target group from the scene
  useEffect(() => {
    const targetGroup = camera.parent;
    if (targetGroup) {
      targetGroupRef.current = targetGroup as THREE.Group;
    }
  }, [camera]);

  useFrame(() => {
    if (!isPresenting || controllers.length < 2) return;

    const leftController = controllers[0];
    const rightController = controllers[1];

    if (!leftController || !rightController) return;

    // Get analog stick input for rotation (usually on thumbstick)
    const leftInput = leftController.inputSource?.gamepad;
    const rightInput = rightController.inputSource?.gamepad;

    if (leftInput && leftInput.axes.length >= 2) {
      // Left controller thumbstick for rotation
      rotationRef.current.x += leftInput.axes[0] * 0.02; // Horizontal rotation
      rotationRef.current.y += leftInput.axes[1] * 0.02; // Vertical rotation
    }

    if (rightInput && rightInput.axes.length >= 2) {
      // Right controller thumbstick for zoom (optional)
      // This can be enhanced for zooming functionality
    }

    // Left controller buttons for direct rotation
    if (leftInput && leftInput.buttons) {
      if (leftInput.buttons[4]?.pressed) {
        // Left grip button - rotate left
        rotationRef.current.x -= 0.05;
      }
      if (leftInput.buttons[5]?.pressed) {
        // Right grip button - rotate right
        rotationRef.current.x += 0.05;
      }
    }

    // Right controller buttons for vertical rotation
    if (rightInput && rightInput.buttons) {
      if (rightInput.buttons[4]?.pressed) {
        // Left grip button - rotate up
        rotationRef.current.y -= 0.05;
      }
      if (rightInput.buttons[5]?.pressed) {
        // Right grip button - rotate down
        rotationRef.current.y += 0.05;
      }
    }

    // Apply rotation to the scene's target group
    if (targetGroupRef.current) {
      targetGroupRef.current.rotation.y = rotationRef.current.x;
      targetGroupRef.current.rotation.x = rotationRef.current.y;
    }
  });

  return null;
}
