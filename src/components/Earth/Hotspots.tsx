"use client";

import { useMemo, useState } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
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
          <sphereGeometry args={[0.01, 16, 16]} />
          <meshBasicMaterial color={hovered ? "#ff0088" : "#00ffcc"} />
        </mesh>
      </Interactive>

      {hovered && (
        <Html distanceFactor={2} position={[0, 0.05, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-black/80 text-white p-3 rounded shadow-lg border border-cyan-500 w-48 pointer-events-none select-none">
            <h3 className="font-bold text-lg text-cyan-400 m-0">{city.name}</h3>
            <p className="text-sm m-0 mt-1">{city.info}</p>
          </div>
        </Html>
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
