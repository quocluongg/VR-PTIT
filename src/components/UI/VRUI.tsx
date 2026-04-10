"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { useStore, EventMode } from "@/store/useStore";
import { useController } from "@react-three/xr";

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

function TimeSlider({ position }: { position: [number, number, number] }) {
  const { timeScale, setTimeScale } = useStore();

  const handlePointerDown = (e: any) => {
    const u = e.uv?.x;
    if (u !== undefined) {
      // u range [0, 1]. Map to [0, 40] scale (only forward time)
      let newScale = u * 40;
      
      // Fix snapping logic overlap
      if (newScale < 0.6) {
        newScale = 0.0; // Snap to 0 (pauses Earth rotation completely)
      } else if (Math.abs(newScale - 1.0) < 0.6) {
        newScale = 1.0; // Snap to normal time
      }
      
      setTimeScale(newScale);
    }
  };

  const normalizedU = Math.min(Math.max(timeScale / 40, 0), 1);

  return (
    <group position={position}>
      <Text position={[0, 0.3, 0]} fontSize={0.16} color="#00ffcc" anchorX="center" anchorY="bottom">
        ĐIỀU KHIỂN TỐC ĐỘ: {timeScale.toFixed(1)}x
      </Text>

      {/* Slider Track */}
      <mesh onPointerDown={handlePointerDown} position={[0, 0, 0]}>
        <planeGeometry args={[2.2, 0.3]} />
        <meshBasicMaterial color="#111111" />
      </mesh>
      {/* Progress Bar inside track */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[2.0, 0.05]} />
        <meshBasicMaterial color="#555555" />
      </mesh>

      {/* Marker Center (Normal Time = 1) */}
      <mesh position={[((1.0 / 40) - 0.5) * 2.0, 0, 0.02]}>
        <planeGeometry args={[0.02, 0.1]} />
        <meshBasicMaterial color="#aaaaaa" />
      </mesh>

      {/* Slider Thumb */}
      <mesh position={[(normalizedU - 0.5) * 2.0, 0, 0.03]}>
        <circleGeometry args={[0.1, 32]} />
        <meshBasicMaterial color="#00ffcc" />
      </mesh>
    </group>
  );
}

export default function VRUI() {
  const { eventMode } = useStore();
  const [isVisible, setIsVisible] = useState(true);
  const rightController = useController('right');
  const prevAPressed = useRef(false);

  useFrame(() => {
    const gamepad = rightController?.inputSource?.gamepad;
    if (gamepad) {
      // Nút A trên Quest thường ở gamepad.buttons[4]
      const aPressed = gamepad.buttons[4]?.pressed || false;
      if (aPressed && !prevAPressed.current) {
        setIsVisible((v) => !v);
      }
      prevAPressed.current = aPressed;
    }
  });

  if (!isVisible) return null;

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

      <TimeSlider position={[0, -1.8, 0]} />

      {/* Description Panel */}
      <group position={[0, -2.8, 0]}>
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
