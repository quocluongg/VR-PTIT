"use client";

import { useThree, createPortal } from "@react-three/fiber";

export default function VRCursor() {
  const { camera } = useThree();

  // Center dot removed - using VR controllers for interaction instead
  return createPortal(null, camera);
}
