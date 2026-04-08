"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SUN_POSITION } from "@/components/Earth/Earth";
import { useStore } from "@/store/useStore";

const ORBIT_DISTANCE = 3.5;

// Sun direction (unit vector pointing from Earth toward Sun)
const SUN_DIR = SUN_POSITION.clone().normalize();

// Eclipse positions
const SOLAR_ECLIPSE_POS  = SUN_DIR.clone().multiplyScalar(ORBIT_DISTANCE);
const LUNAR_ECLIPSE_POS  = SUN_DIR.clone().multiplyScalar(-ORBIT_DISTANCE);

const NORMAL_COLOR    = new THREE.Color("#ffffff");
const BLOOD_COLOR     = new THREE.Color("#d11124");
const ECLIPSE_COLOR   = new THREE.Color("#111111");

export default function Moon() {
  const moonRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhongMaterial>(null);
  const [moonTexture, setMoonTexture] = useState<THREE.Texture | null>(null);

  const angleRef = useRef(0);
  const { eventMode } = useStore();

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load("/textures/2k_moon.jpg", setMoonTexture);
  }, []);

  useFrame((_, delta) => {
    if (!moonRef.current) return;

    // Accumulate orbit angle continuously
    angleRef.current += delta * 0.1;
    const a = angleRef.current;

    const normalX = Math.cos(a) * ORBIT_DISTANCE;
    const normalZ = Math.sin(a) * ORBIT_DISTANCE;
    const normalY = Math.sin(a * 0.5) * 0.3;

    let targetPos   = new THREE.Vector3(normalX, normalY, normalZ);
    let targetColor = NORMAL_COLOR;

    if (eventMode === "solar_eclipse") {
      targetPos = SOLAR_ECLIPSE_POS;
    } else if (eventMode === "lunar_eclipse") {
      targetPos   = LUNAR_ECLIPSE_POS;
      targetColor = ECLIPSE_COLOR;
    } else if (eventMode === "blood_moon") {
      targetPos   = LUNAR_ECLIPSE_POS;
      targetColor = BLOOD_COLOR;
    }

    // Smooth position interpolation
    moonRef.current.position.lerp(targetPos, delta * 1.5);

    // Face Earth (tidally locked): compute yaw angle in XZ plane
    const px = moonRef.current.position.x;
    const pz = moonRef.current.position.z;
    moonRef.current.rotation.y = Math.atan2(px, pz) + Math.PI;

    // Smooth color transition
    if (materialRef.current) {
      materialRef.current.color.lerp(targetColor, delta * 2.0);
    }
  });

  return (
    <mesh ref={moonRef}>
      <sphereGeometry args={[0.27, 32, 32]} />
      {moonTexture ? (
        <meshPhongMaterial
          ref={materialRef}
          map={moonTexture}
          shininess={5}
          color="#ffffff"
        />
      ) : (
        <meshStandardMaterial color="#888888" />
      )}
    </mesh>
  );
}
