"use client";

import { useThree, createPortal } from "@react-three/fiber";

export default function VRCursor() {
  const { camera } = useThree();

  // Attach a small ring right in front of the camera using createPortal
  return createPortal(
    <mesh position={[0, 0, -1.5]}>
      <ringGeometry args={[0.015, 0.025, 32]} />
      <meshBasicMaterial color="white" transparent opacity={0.6} depthTest={false} />
    </mesh>,
    camera
  );
}
