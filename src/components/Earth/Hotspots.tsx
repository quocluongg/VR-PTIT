"use client";

import { useMemo, useState } from "react";
import * as THREE from "three";
import { Billboard, Text } from "@react-three/drei";
import { Interactive } from "@react-three/xr";

// Chuyển đổi Vĩ độ (Lat) và Kinh độ (Lon) sang tọa độ 3D trên mặt cầu (Bán kính = 1)
function latLongToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));

  return new THREE.Vector3(x, y, z);
}

const CITIES = [
  { name: "New York", lat: 40.7128, lon: -74.0060, info: "Thành phố đắc đỏ & năng động" },
  { name: "London", lat: 51.5074, lon: -0.1278, info: "Thủ đô cổ kính của nước Anh" },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503, info: "Siêu đô thị hiện đại" },
  { name: "Hanoi", lat: 21.0285, lon: 105.8542, info: "Thủ đô ngàn năm văn hiến" },
  { name: "Sydney", lat: -33.8688, lon: 151.2093, info: "Thành phố của những cánh buồm" }
];

function HotspotPin({ city }: { city: typeof CITIES[0] }) {
  const [hovered, setHovered] = useState(false);
  const position = useMemo(() => latLongToVector3(city.lat, city.lon, 1.02), [city]);
  
  // Custom rotation isn't needed for Billboard, but position is relative to parent group
  return (
    <group position={position}>
      <Interactive
        onHover={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        onSelect={() => setHovered(!hovered)}
      >
        <mesh
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={() => setHovered(!hovered)}
        >
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshBasicMaterial color={hovered ? "#ff0088" : "#00ffcc"} />
        </mesh>
      </Interactive>

      {hovered && (
        <Billboard position={[0, 0.1, 0]}>
          <group>
            {/* Background Panel */}
            <mesh position={[0, 0, -0.001]}>
              <planeGeometry args={[0.35, 0.15]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.8} />
            </mesh>
            {/* Border */}
            <mesh position={[0, 0, -0.002]}>
              <planeGeometry args={[0.36, 0.16]} />
              <meshBasicMaterial color="#00ffcc" />
            </mesh>
            {/* Text content */}
            <Text
              position={[0, 0.025, 0]}
              fontSize={0.04}
              color="#00ffcc"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              {city.name}
            </Text>
            <Text
              position={[0, -0.025, 0]}
              fontSize={0.02}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              maxWidth={0.32}
              textAlign="center"
            >
              {city.info}
            </Text>
          </group>
        </Billboard>
      )}
    </group>
  );
}

export default function Hotspots() {
  return (
    <group>
      {CITIES.map((c, i) => (
        <HotspotPin key={i} city={c} />
      ))}
    </group>
  );
}
