"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { Interactive } from "@react-three/xr";

function latLongToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));

  return new THREE.Vector3(x, y, z);
}

export default function ISS() {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef<THREE.Vector3>(new THREE.Vector3(1.2, 0, 0));
  const [hovered, setHovered] = useState(false);
  const [data, setData] = useState({ lat: 0, lon: 0, alt: 0, vel: 0 });

  useEffect(() => {
    let mounted = true;

    const fetchISS = async () => {
      try {
        const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
        const json = await res.json();
        if (mounted) {
          // Calculate target position - slightly above Earth's surface
          // Convert altitude to scale (Earth is radius 1, ISS is ~400km above 6371km radius, so ~ 1.06)
          const radius = 1.0 + (json.altitude / 6371.0) * 1.0; 
          targetPos.current = latLongToVector3(json.latitude, json.longitude, radius);
          setData({ lat: json.latitude, lon: json.longitude, alt: json.altitude, vel: json.velocity });
        }
      } catch (err) {
        console.error("Failed to fetch ISS data", err);
      }
    };

    fetchISS();
    const interval = setInterval(fetchISS, 4000); // Fetch every 4 seconds
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Lerp ISS position to target for smooth movement
      groupRef.current.position.lerp(targetPos.current, delta * 1.5);
      
      // Face outward or towards movement
      groupRef.current.lookAt(new THREE.Vector3(0, 0, 0));
      // Optionally rotate the model itself to face trajectory direction, but simpler:
      groupRef.current.rotateX(Math.PI / 2); // align with tangent
    }
  });

  return (
    <group ref={groupRef}>
      <Interactive
        onHover={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        onSelect={() => setHovered(!hovered)}
      >
        <group 
          onPointerOver={() => setHovered(true)} 
          onPointerOut={() => setHovered(false)}
          onClick={() => setHovered(!hovered)}
        >
          {/* Simple Satellite Mesh */}
          {/* Body */}
          <mesh castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.08, 16]} />
            <meshStandardMaterial color="#eeeeee" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Solar Panels */}
          <mesh position={[0.04, 0, 0]} castShadow>
            <boxGeometry args={[0.06, 0.005, 0.04]} />
            <meshStandardMaterial color="#1f4ab8" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[-0.04, 0, 0]} castShadow>
            <boxGeometry args={[0.06, 0.005, 0.04]} />
            <meshStandardMaterial color="#1f4ab8" metalness={0.9} roughness={0.1} />
          </mesh>

          {/* Blink Light */}
          <mesh position={[0, 0.045, 0]}>
            <sphereGeometry args={[0.004, 8, 8]} />
            <meshBasicMaterial color="#ff0000" />
          </mesh>
        </group>
      </Interactive>
      
      {hovered && (
        <Html distanceFactor={2} position={[0, 0.1, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-blue-900/90 text-white p-3 rounded shadow-lg border border-yellow-400 w-56 pointer-events-none select-none">
            <h3 className="font-bold text-lg text-yellow-300 m-0">Trạm ISS</h3>
            <div className="text-sm mt-2 grids grids-cols-2 gap-1">
              <div><strong>Vĩ độ:</strong> {data.lat.toFixed(2)}°</div>
              <div><strong>Kinh độ:</strong> {data.lon.toFixed(2)}°</div>
              <div><strong>Độ cao:</strong> {data.alt.toFixed(0)} km</div>
              <div><strong>Vận tốc:</strong> {data.vel.toFixed(0)} km/h</div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
