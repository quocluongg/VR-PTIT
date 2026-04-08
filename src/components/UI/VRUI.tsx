"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
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

    const currentlyHovered = isGazeHovered || timeInfo.current.hovered;

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
        <planeGeometry args={[1.5, 0.4]} />
        <meshBasicMaterial color={active ? color : "#222222"} transparent opacity={0.8} />
      </mesh>
      
      {/* Loading Progress Bar */}
      <mesh ref={progressRef} position={[-0.75, -0.19, 0.01]}>
        <planeGeometry ref={geomRef} args={[1.5, 0.02]} />
        <meshBasicMaterial color="#00ffcc" transparent opacity={0.9} />
      </mesh>

      <Text 
        position={[0, 0, 0.02]} 
        fontSize={0.15} 
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
  
  const events: { id: EventMode; label: string; color: string }[] = [
    { id: 'normal', label: 'Binh Thuong', color: '#6b7280' },
    { id: 'solar_eclipse', label: 'Nhat Thuc', color: '#eab308' },
    { id: 'lunar_eclipse', label: 'Nguyet Thuc', color: '#a855f7' },
    { id: 'blood_moon', label: 'Trang Mau', color: '#ef4444' },
  ];

  const eventDescriptions: Record<EventMode, string> = {
    normal: "He Trai Dat va Mat Trang quay tu nhien tren quy dao cua minh.",
    solar_eclipse: "Mat Trang nam giua Trai Dat va Mat Troi, che khuat anh sang va do bong den hoan toan len bề mặt Trai Dat.",
    lunar_eclipse: "Trai Dat nam giua che khuat anh sang tu Mat Troi, khien Mat Trang chim hoan toan vao bong toi.",
    blood_moon: "Trong Nguyet Thuc TOAN PHAN, anh sang xuyen qua khi quyen Trai Dat bi tan xa doi mau khien Mat Trang co mau do.",
  };

  return (
    // Put UI completely to the right so it doesn't overlap the Earth. 
    // The group in Scene.tsx is at Z=-5, so Z=0 relative is fine!
    <group position={[4, 0, 0]} rotation={[0, -Math.PI / 8, 0]}>
      {/* Title */}
      <Text position={[0, 1, 0]} fontSize={0.25} color="white" anchorX="center" anchorY="middle">
        MENU SU KIEN
      </Text>
      
      {events.map((evt, idx) => (
        <VRButton 
          key={evt.id}
          modeId={evt.id}
          label={evt.label}
          color={evt.color}
          position={[0, 0.4 - idx * 0.45, 0]}
          active={eventMode === evt.id}
        />
      ))}

      {/* Description Panel */}
      <group position={[0, -1.8, 0]}>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[2.5, 1.2]} />
          <meshBasicMaterial color="#111111" transparent opacity={0.8} />
        </mesh>
        <Text
          position={[0, 0.4, 0]}
          fontSize={0.14}
          color="#00ffcc"
          anchorX="center"
          anchorY="top"
        >
          THONG TIN
        </Text>
        <Text
          position={[0, 0.1, 0]}
          fontSize={0.11}
          lineHeight={1.5}
          color="#cccccc"
          maxWidth={2.2}
          textAlign="center"
          anchorX="center"
          anchorY="top"
        >
          {eventDescriptions[eventMode]}
        </Text>
      </group>
    </group>
  );
}
