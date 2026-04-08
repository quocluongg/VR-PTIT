"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
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
  const [hovered, setHovered] = useState(false);
  const progressRef = useRef<THREE.Mesh>(null);
  const geomRef = useRef<THREE.PlaneGeometry>(null);
  const timeInfo = useRef({ time: 0 });
  const setEventMode = useStore((state) => state.setEventMode);

  const DWELL_TIME = 1.5;

  useEffect(() => {
    // Translate geometry so scaling starts exactly from the left edge towards the right
    geomRef.current?.translate(0.75, 0, 0);
  }, []);

  const handleClick = () => {
    setEventMode(modeId);
    setHovered(false);
    timeInfo.current.time = 0;
  };

  useFrame((_, delta) => {
    if (hovered && !active) {
      timeInfo.current.time += delta;
      if (timeInfo.current.time >= DWELL_TIME) {
        handleClick();
      }
    } else {
      // Animate backwards if user looks away
      timeInfo.current.time = Math.max(0, timeInfo.current.time - delta * 3);
    }

    if (progressRef.current) {
      const p = Math.min(1, Math.max(0.001, timeInfo.current.time / DWELL_TIME));
      progressRef.current.scale.x = p;
    }
  });

  return (
    <group position={position}>
      <mesh
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => { setHovered(false); }}
        onClick={handleClick}
      >
        <planeGeometry args={[1.5, 0.4]} />
        <meshBasicMaterial 
          color={active ? color : (hovered ? "#444" : "#222")} 
          transparent 
          opacity={0.8} 
        />
      </mesh>
      
      {/* Loading Progress Bar */}
      <mesh ref={progressRef} position={[-0.75, -0.19, 0.01]}>
        <planeGeometry ref={geomRef} args={[1.5, 0.02]} />
        <meshBasicMaterial color="#00ffcc" transparent opacity={0.9} />
      </mesh>

      <Text 
        position={[0, 0, 0.02]} 
        fontSize={0.15} 
        color={active ? "white" : "#ccc"} 
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

  return (
    <group position={[2.5, 0, -3]} rotation={[0, -Math.PI / 6, 0]}>
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
    </group>
  );
}
