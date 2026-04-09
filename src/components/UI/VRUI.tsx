"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree, createPortal } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useXR } from "@react-three/xr";
import * as THREE from "three";
import { useStore, EventMode } from "@/store/useStore";

interface ButtonProps {
  position: [number, number, number];
  label: string;
  color: string;
  modeId: EventMode;
  active: boolean;
}

function VRButton({ position, label, color, modeId, active }: ButtonProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef<THREE.Mesh>(null);
  const geomRef = useRef<THREE.PlaneGeometry>(null);
  const timeInfo = useRef({ time: 0, hovered: false });
  const setEventMode = useStore((state) => state.setEventMode);

  const { camera } = useThree();
  const { controllers } = useXR();
  const raycaster = useRef(new THREE.Raycaster());

  const DWELL_TIME = 1.5;

  useEffect(() => {
    // Translate geometry so scaling starts exactly from the left edge towards the right
    geomRef.current?.translate(0.75, 0, 0);
  }, []);

  const handleClick = () => {
    setEventMode(modeId);
    timeInfo.current.time = 0;
    timeInfo.current.hovered = false;
  };

  useFrame((_, delta) => {
    let isGazeHovered = false;
    
    // Create a manual raycaster exactly from the camera's center to catch Phone VR gaze
    if (meshRef.current) {
      raycaster.current.setFromCamera(new THREE.Vector2(0, 0), camera);
      const intersects = raycaster.current.intersectObject(meshRef.current);
      if (intersects.length > 0) {
        isGazeHovered = true;
      }
    }

    // Check for controller raycasting
    let isControllerHovered = false;
    if (meshRef.current && controllers.length > 0) {
      controllers.forEach((controller) => {
        if (controller) {
          raycaster.current.ray.origin.copy(controller.position);
          raycaster.current.ray.direction.copy(
            new THREE.Vector3(0, 0, -1).applyQuaternion(controller.quaternion)
          );
          const intersects = raycaster.current.intersectObject(meshRef.current!);
          if (intersects.length > 0) {
            isControllerHovered = true;
          }
        }
      });
    }

    const currentlyHovered = isGazeHovered || isControllerHovered || timeInfo.current.hovered;

    if (currentlyHovered && !active) {
      timeInfo.current.time += delta;
      if (timeInfo.current.time >= DWELL_TIME) {
        handleClick();
      }
    } else {
      // Animate backwards if user looks away
      timeInfo.current.time = Math.max(0, timeInfo.current.time - delta * 3);
    }

    // Visual updates outside of React state loop for ultra performance
    if (progressRef.current) {
      const p = Math.min(1, Math.max(0.001, timeInfo.current.time / DWELL_TIME));
      progressRef.current.scale.x = p;
    }

    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      if (active) {
        mat.color.set(color);
      } else if (currentlyHovered) {
        mat.color.set("#444444");
      } else {
        mat.color.set("#222222");
      }
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => { timeInfo.current.hovered = true; }}
        onPointerLeave={() => { timeInfo.current.hovered = false; }}
        onClick={handleClick}
      >
        <planeGeometry args={[0.8, 0.22]} />
        <meshBasicMaterial color={active ? color : "#222222"} transparent opacity={0.8} />
      </mesh>
      
      {/* Loading Progress Bar */}
      <mesh ref={progressRef} position={[-0.4, -0.1, 0.01]}>
        <planeGeometry ref={geomRef} args={[0.8, 0.01]} />
        <meshBasicMaterial color="#00ffcc" transparent opacity={0.9} />
      </mesh>

      <Text 
        position={[0, 0, 0.02]} 
        fontSize={0.08} 
        color={active ? "white" : "#cccccc"} 
        anchorX="center" 
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

export default function VRUI() {
  const { eventMode } = useStore();
  const { camera } = useThree();
  
  const events: { id: EventMode; label: string; color: string }[] = [
    { id: 'normal', label: 'Bình Thường', color: '#6b7280' },
    { id: 'solar_eclipse', label: 'Nhật Thực', color: '#eab308' },
    { id: 'lunar_eclipse', label: 'Nguyệt Thực', color: '#a855f7' },
    { id: 'blood_moon', label: 'Trăng Máu', color: '#ef4444' },
  ];

  const eventDescriptions: Record<EventMode, string> = {
    normal: "Trái Đất và Mặt Trăng quay tự nhiên trên quỹ đạo của mình.",
    solar_eclipse: "Mặt Trăng nằm giữa Trái Đất và Mặt Trời, che khuất ánh sáng và đổ bóng đen hoàn toàn lên bề mặt Trái Đất.",
    lunar_eclipse: "Trái Đất nằm giữa che khuất ánh sáng từ Mặt Trời, khiến Mặt Trăng chìm hoàn toàn vào bóng tối.",
    blood_moon: "Trong Nguyệt Thực toàn phần, ánh sáng xuyên qua khí quyển Trái Đất bị tán xạ đỏ khiến Mặt Trăng có màu đỏ.",
  };

  // Render UI in camera space instead of world space - positioned at bottom right
  return createPortal(
    <group position={[0.8, -0.8, -2.5]}>
      {/* Title */}
      <Text position={[0, 0.5, 0]} fontSize={0.12} color="white" anchorX="center" anchorY="middle">
        MENU SỰ KIỆN
      </Text>
      
      {events.map((evt, idx) => (
        <VRButton 
          key={evt.id}
          modeId={evt.id}
          label={evt.label}
          color={evt.color}
          position={[0, 0.2 - idx * 0.25, 0]}
          active={eventMode === evt.id}
        />
      ))}

      {/* Description Panel */}
      <group position={[0, -1.0, 0]}>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[1.3, 0.65]} />
          <meshBasicMaterial color="#111111" transparent opacity={0.8} />
        </mesh>
        <Text
          position={[0, 0.25, 0]}
          fontSize={0.07}
          color="#00ffcc"
          anchorX="center"
          anchorY="top"
        >
          THÔNG TIN
        </Text>
        <Text
          position={[0, 0.1, 0]}
          fontSize={0.055}
          lineHeight={1.4}
          color="#cccccc"
          maxWidth={1.15}
          textAlign="center"
          anchorX="center"
          anchorY="top"
        >
          {eventDescriptions[eventMode]}
        </Text>
      </group>
    </group>,
    camera
  );
}
