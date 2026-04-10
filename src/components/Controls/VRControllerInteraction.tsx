"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useController, useXR } from "@react-three/xr";
import * as THREE from "three";


// Meta Quest 3 Controller button mapping:
// buttons[0] = Trigger (index finger)
// buttons[1] = Grip/Squeeze (middle finger)
// buttons[2] = unused
// buttons[3] = Thumbstick press
// buttons[4] = A/X button
// buttons[5] = B/Y button
// axes[2] = Thumbstick X
// axes[3] = Thumbstick Y

export default function VRControllerInteraction({
  targetRef,
}: {
  targetRef: React.RefObject<THREE.Group>;
}) {
  const { isPresenting } = useXR();
  const leftController = useController("left");
  const rightController = useController("right");


  const scaleRef = useRef(1.0);

  // State tracking for right controller
  const rightState = useRef({
    prevTriggerPressed: false,
    prevGripPressed: false,

    lastGripPos: new THREE.Vector3(),
    lastTriggerPos: new THREE.Vector3(),
  });

  // State tracking for left controller
  const leftState = useRef({
    prevTriggerPressed: false,
    prevGripPressed: false,
    lastGripPos: new THREE.Vector3(),
    lastTriggerPos: new THREE.Vector3(),
  });

  // Pinch-to-zoom state (using both controllers)
  const pinchState = useRef({
    active: false,
    lastDistance: 0,
  });

  const tempVec = useRef(new THREE.Vector3());
  const tempVec2 = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!isPresenting || !targetRef.current) return;

    const rightGamepad = rightController?.inputSource?.gamepad;
    const leftGamepad = leftController?.inputSource?.gamepad;

    // ==========================================
    // RIGHT CONTROLLER
    // ==========================================
    if (rightController && rightGamepad) {
      const grip = rightController.grip;

      // Get current world position of right grip
      const rightPos = tempVec.current;
      grip.getWorldPosition(rightPos);

      // --- Thumbstick: Zoom (Y axis) & Rotate (X axis) ---
      // Quest 3 thumbstick axes are at index 2 (X) and 3 (Y)
      const thumbX = rightGamepad.axes[2] ?? rightGamepad.axes[0] ?? 0;
      const thumbY = rightGamepad.axes[3] ?? rightGamepad.axes[1] ?? 0;

      // Deadzone
      if (Math.abs(thumbY) > 0.15) {
        // Push forward (negative Y) = zoom in, pull back (positive Y) = zoom out
        scaleRef.current += (-thumbY) * 0.03;
        scaleRef.current = Math.max(0.2, Math.min(scaleRef.current, 5.0));
      }

      if (Math.abs(thumbX) > 0.15) {
        targetRef.current.rotation.y += thumbX * 0.03;
      }

      // --- Trigger (button 0): Hold + drag to zoom ---
      const triggerPressed = rightGamepad.buttons[0]?.pressed || false;
      if (triggerPressed) {
        if (!rightState.current.prevTriggerPressed) {
          // Just pressed - save initial position
          rightState.current.lastTriggerPos.copy(rightPos);
        } else {
          // Held - calculate movement delta
          const deltaY = rightPos.y - rightState.current.lastTriggerPos.y;
          const deltaZ = rightPos.z - rightState.current.lastTriggerPos.z;

          // Moving hand up or pushing forward = zoom in
          const movement = deltaY - deltaZ;
          scaleRef.current += movement * 3.0;
          scaleRef.current = Math.max(0.2, Math.min(scaleRef.current, 5.0));

          rightState.current.lastTriggerPos.copy(rightPos);
        }
      }
      rightState.current.prevTriggerPressed = triggerPressed;

      // --- Grip (button 1): Hold + drag to rotate ---
      const gripPressed = rightGamepad.buttons[1]?.pressed || false;
      if (gripPressed) {
        if (!rightState.current.prevGripPressed) {
          rightState.current.lastGripPos.copy(rightPos);
        } else {
          const deltaX = rightPos.x - rightState.current.lastGripPos.x;
          const deltaY = rightPos.y - rightState.current.lastGripPos.y;

          targetRef.current.rotation.y += deltaX * 2.0;
          targetRef.current.rotation.x -= deltaY * 2.0;

          rightState.current.lastGripPos.copy(rightPos);
        }
      }
      rightState.current.prevGripPressed = gripPressed;
    }

    // ==========================================
    // LEFT CONTROLLER
    // ==========================================
    if (leftController && leftGamepad) {
      const grip = leftController.grip;
      const leftPos = tempVec2.current;
      grip.getWorldPosition(leftPos);

      // --- Left Thumbstick: Zoom (Y) & Rotate (X) ---
      const thumbX = leftGamepad.axes[2] ?? leftGamepad.axes[0] ?? 0;
      const thumbY = leftGamepad.axes[3] ?? leftGamepad.axes[1] ?? 0;

      if (Math.abs(thumbY) > 0.15) {
        scaleRef.current += (-thumbY) * 0.03;
        scaleRef.current = Math.max(0.2, Math.min(scaleRef.current, 5.0));
      }

      if (Math.abs(thumbX) > 0.15) {
        targetRef.current.rotation.y += thumbX * 0.03;
      }

      // --- Trigger (button 0): Hold + drag to zoom ---
      const triggerPressed = leftGamepad.buttons[0]?.pressed || false;
      if (triggerPressed) {
        if (!leftState.current.prevTriggerPressed) {
          leftState.current.lastTriggerPos.copy(leftPos);
        } else {
          const deltaY = leftPos.y - leftState.current.lastTriggerPos.y;
          const deltaZ = leftPos.z - leftState.current.lastTriggerPos.z;

          const movement = deltaY - deltaZ;
          scaleRef.current += movement * 3.0;
          scaleRef.current = Math.max(0.2, Math.min(scaleRef.current, 5.0));

          leftState.current.lastTriggerPos.copy(leftPos);
        }
      }
      leftState.current.prevTriggerPressed = triggerPressed;

      // --- Grip (button 1): Hold + drag to rotate ---
      const gripPressed = leftGamepad.buttons[1]?.pressed || false;
      if (gripPressed) {
        if (!leftState.current.prevGripPressed) {
          leftState.current.lastGripPos.copy(leftPos);
        } else {
          const deltaX = leftPos.x - leftState.current.lastGripPos.x;
          const deltaY = leftPos.y - leftState.current.lastGripPos.y;

          targetRef.current.rotation.y += deltaX * 2.0;
          targetRef.current.rotation.x -= deltaY * 2.0;

          leftState.current.lastGripPos.copy(leftPos);
        }
      }
      leftState.current.prevGripPressed = gripPressed;
    }

    // ==========================================
    // TWO-HANDED PINCH TO ZOOM
    // ==========================================
    if (rightController && leftController && rightGamepad && leftGamepad) {
      const rightGripPressed = rightGamepad.buttons[1]?.pressed || false;
      const leftGripPressed = leftGamepad.buttons[1]?.pressed || false;

      if (rightGripPressed && leftGripPressed) {
        // Both grips held - pinch to zoom
        const rightPos = new THREE.Vector3();
        const leftPos = new THREE.Vector3();
        rightController.grip.getWorldPosition(rightPos);
        leftController.grip.getWorldPosition(leftPos);

        const currentDistance = rightPos.distanceTo(leftPos);

        if (!pinchState.current.active) {
          // Just started pinching
          pinchState.current.active = true;
          pinchState.current.lastDistance = currentDistance;
        } else {
          // Update scale based on distance change
          const delta = currentDistance - pinchState.current.lastDistance;
          scaleRef.current += delta * 3.0;
          scaleRef.current = Math.max(0.2, Math.min(scaleRef.current, 5.0));

          pinchState.current.lastDistance = currentDistance;
        }
      } else {
        pinchState.current.active = false;
      }
    } else {
      pinchState.current.active = false;
    }

    // ==========================================
    // APPLY SCALE
    // ==========================================
    if (targetRef.current) {
      targetRef.current.scale.setScalar(scaleRef.current);
    }
  });

  return null;
}
