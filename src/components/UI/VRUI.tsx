"use client";

import { useRef, useState } from "react";
import { useFrame, useThree, createPortal } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { useStore, EventMode } from "@/store/useStore";
import { useController, Interactive } from "@react-three/xr";

interface ButtonProps {
  position: [number, number, number];
  label: string;
  color: string;
  modeId: EventMode;
  active: boolean;
}

function VRMenuButton({ position, label, color, modeId, active }: ButtonProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const setEventMode = useStore((state) => state.setEventMode);

  const handleSelect = () => {
    setEventMode(modeId);
  };

  const bgColor = active ? color : hovered ? "#444444" : "#222222";

  return (
    <group position={position}>
      <Interactive
        onSelect={handleSelect}
        onHover={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        <mesh
          ref={meshRef}
          onClick={handleSelect}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          <planeGeometry args={[1.2, 0.3]} />
          <meshBasicMaterial
            color={bgColor}
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>
      </Interactive>

      <Text
        position={[0, 0, 0.01]}
        fontSize={0.12}
        color={active ? "white" : hovered ? "#ffffff" : "#cccccc"}
        anchorX="center"
        anchorY="middle"
        renderOrder={1}
      >
        {label}
      </Text>

      {/* Active indicator bar */}
      {active && (
        <mesh position={[-0.6, 0, 0.01]}>
          <planeGeometry args={[0.03, 0.25]} />
          <meshBasicMaterial color={color} />
        </mesh>
      )}
    </group>
  );
}

function TimeSliderVR({ position }: { position: [number, number, number] }) {
  const { timeScale, setTimeScale } = useStore();

  const handlePointerDown = (e: any) => {
    const u = e.uv?.x;
    if (u !== undefined) {
      let newScale = u * 40;

      if (newScale < 0.6) {
        newScale = 0.0;
      } else if (Math.abs(newScale - 1.0) < 0.6) {
        newScale = 1.0;
      }

      setTimeScale(newScale);
    }
  };

  const normalizedU = Math.min(Math.max(timeScale / 40, 0), 1);

  return (
    <group position={position}>
      <Text
        position={[0, 0.22, 0]}
        fontSize={0.09}
        color="#00ffcc"
        anchorX="center"
        anchorY="bottom"
      >
        {`TOC DO: ${timeScale.toFixed(1)}x`}
      </Text>

      {/* Slider Track */}
      <Interactive onSelect={() => {}}>
        <mesh onPointerDown={handlePointerDown} position={[0, 0, 0]}>
          <planeGeometry args={[1.6, 0.18]} />
          <meshBasicMaterial color="#111111" side={THREE.DoubleSide} />
        </mesh>
      </Interactive>

      {/* Progress Bar */}
      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[1.4, 0.03]} />
        <meshBasicMaterial color="#555555" />
      </mesh>

      {/* Marker for normal time (1x) */}
      <mesh position={[((1.0 / 40) - 0.5) * 1.4, 0, 0.01]}>
        <planeGeometry args={[0.015, 0.08]} />
        <meshBasicMaterial color="#aaaaaa" />
      </mesh>

      {/* Thumb */}
      <mesh position={[(normalizedU - 0.5) * 1.4, 0, 0.015]}>
        <circleGeometry args={[0.06, 32]} />
        <meshBasicMaterial color="#00ffcc" />
      </mesh>
    </group>
  );
}

const tempPos = new THREE.Vector3();
const tempDir = new THREE.Vector3();
const tempUiPos = new THREE.Vector3();

export default function VRUI() {
  const { eventMode } = useStore();
  const { isMenuOpen, toggleMenu } = useStore();
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const rightController = useController("right");
  const prevBPressed = useRef(false);

  // Toggle menu with B button (index 5) on right controller
  useFrame(() => {
    const gamepad = rightController?.inputSource?.gamepad;
    if (gamepad) {
      // B button = index 5, A button = index 4
      const bPressed = gamepad.buttons[5]?.pressed || false;
      if (bPressed && !prevBPressed.current) {
        toggleMenu();
      }
      prevBPressed.current = bPressed;
    }

    // Make UI follow camera (head-locked) ONLY if open
    if (groupRef.current && isMenuOpen) {
      // Get camera world position and direction
      camera.getWorldPosition(tempPos);
      camera.getWorldDirection(tempDir);

      // Place UI 2.5m in front of camera
      tempUiPos.copy(tempPos).add(tempDir.multiplyScalar(2.5));

      // Smoothly interpolate position (lerp for smooth following)
      groupRef.current.position.lerp(tempUiPos, 0.08);

      // Make UI face the camera
      groupRef.current.lookAt(tempPos);
    }
  });

  const events: { id: EventMode; label: string; color: string }[] = [
    { id: "normal", label: "Binh Thuong", color: "#6b7280" },
    { id: "solar_eclipse", label: "Nhat Thuc", color: "#eab308" },
    { id: "lunar_eclipse", label: "Nguyet Thuc", color: "#a855f7" },
    { id: "blood_moon", label: "Trang Mau", color: "#ef4444" },
  ];

  const eventDescriptions: Record<EventMode, string> = {
    normal:
      "He Trai Dat va Mat Trang quay tu nhien tren quy dao cua minh.",
    solar_eclipse:
      "Mat Trang nam giua Trai Dat va Mat Troi, che khuat anh sang va do bong den hoan toan len be mat Trai Dat.",
    lunar_eclipse:
      "Trai Dat nam giua che khuat anh sang tu Mat Troi, khien Mat Trang chim hoan toan vao bong toi.",
    blood_moon:
      "Trong Nguyet Thuc TOAN PHAN, anh sang xuyen qua khi quyen Trai Dat bi tan xa doi mau khien Mat Trang co mau do.",
  };

  return (
    <group ref={groupRef} visible={isMenuOpen}>
      {/* Background panel */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[1.6, 2.2]} />
        <meshBasicMaterial
          color="#0a0a0a"
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Border glow */}
      <mesh position={[0, 0, -0.025]}>
        <planeGeometry args={[1.64, 2.24]} />
        <meshBasicMaterial
          color="#00ffcc"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Title */}
      <Text
        position={[0, 0.85, 0]}
        fontSize={0.14}
        color="white"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        MENU SU KIEN
      </Text>

      {/* Divider line under title */}
      <mesh position={[0, 0.72, 0.001]}>
        <planeGeometry args={[1.3, 0.005]} />
        <meshBasicMaterial color="#00ffcc" transparent opacity={0.5} />
      </mesh>

      {/* Event buttons */}
      {events.map((evt, idx) => (
        <VRMenuButton
          key={evt.id}
          modeId={evt.id}
          label={evt.label}
          color={evt.color}
          position={[0, 0.5 - idx * 0.35, 0]}
          active={eventMode === evt.id}
        />
      ))}

      {/* Time Slider */}
      <TimeSliderVR position={[0, -0.95, 0]} />

      {/* Description Panel */}
      <group position={[0, -0.55, 0]}>
        <Text
          position={[0, -0.68, 0]}
          fontSize={0.08}
          color="#00ffcc"
          anchorX="center"
          anchorY="top"
        >
          THONG TIN
        </Text>
        <Text
          position={[0, -0.78, 0]}
          fontSize={0.065}
          lineHeight={1.5}
          color="#cccccc"
          maxWidth={1.3}
          textAlign="center"
          anchorX="center"
          anchorY="top"
        >
          {eventDescriptions[eventMode]}
        </Text>
      </group>

      {/* Close hint */}
      <Text
        position={[0, -0.98, 0]}
        fontSize={0.06}
        color="#666666"
        anchorX="center"
        anchorY="middle"
      >
        [Nhan B de dong]
      </Text>
    </group>
  );
}
