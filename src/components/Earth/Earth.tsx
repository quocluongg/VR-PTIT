"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Clouds from "./Clouds";
import Atmosphere from "./Atmosphere";

// Sun world-space position — shared with Clouds.tsx, Sun.tsx, Moon.tsx
export const SUN_POSITION = new THREE.Vector3(20, 10, -50);

export default function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);

  const [dayMap,    setDayMap]    = useState<THREE.Texture | null>(null);
  const [nightMap,  setNightMap]  = useState<THREE.Texture | null>(null);
  const [cloudsMap, setCloudsMap] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load("/textures/2k_earth_daymap.jpg",  setDayMap);
    loader.load("/textures/2k_earth_nightmap.jpg", setNightMap);
    loader.load("/textures/2k_earth_clouds.jpg",   setCloudsMap);
  }, []);

  // ── Uniforms ─────────────────────────────────────────────────────────────
  const uniforms = useMemo(
    () => ({
      dayTexture:   { value: null as THREE.Texture | null },
      nightTexture: { value: null as THREE.Texture | null },
      sunPosition:  { value: SUN_POSITION.clone() },
    }),
    []
  );

  useEffect(() => { uniforms.dayTexture.value   = dayMap;   }, [dayMap,   uniforms]);
  useEffect(() => { uniforms.nightTexture.value = nightMap; }, [nightMap, uniforms]);

  // ── Earth rotation ────────────────────────────────────────────────────────
  useFrame(({ clock }) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  // ── GLSL shaders ──────────────────────────────────────────────────────────
  // NOTE: We CANNOT use inverse()/transpose() in WebGL 1.0 GLSL.
  // Since Earth is a uniform-scale sphere, mat3(modelMatrix)*normal is equivalent
  // to the full inverse-transpose form and is safe to use.
  const vertexShader = /* glsl */`
    varying vec2 vUv;
    varying vec3 vWorldNormal;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;

      // World-space normal — valid for uniform-scale objects (sphere)
      // Avoids inverse()/transpose() which are not in WebGL 1.0 GLSL
      vWorldNormal = normalize(mat3(modelMatrix) * normal);

      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = /* glsl */`
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;
    uniform vec3 sunPosition;

    varying vec2 vUv;
    varying vec3 vWorldNormal;
    varying vec3 vWorldPosition;

    void main() {
      // World-space direction from surface point → Sun
      vec3 sunDir = normalize(sunPosition - vWorldPosition);

      // +1 = fully lit (day), -1 = fully dark (night)
      float NdotL = dot(vWorldNormal, sunDir);

      // Smooth terminator band (dawn / dusk)
      float dayFactor = smoothstep(-0.12, 0.12, NdotL);

      vec4 dayColor   = texture2D(dayTexture,   vUv);
      vec4 nightColor = texture2D(nightTexture, vUv);

      // Blend day ↔ night. On night-side, multiply by 1.5 to make
      // city lights pop; on day-side use full day texture.
      vec4 color = mix(nightColor * 1.5, dayColor, dayFactor);

      // Subtle specular shimmer on ocean (day side)
      float spec = pow(max(0.0, NdotL), 48.0) * 0.3 * dayFactor;
      color.rgb += vec3(0.3, 0.5, 1.0) * spec;

      gl_FragColor = color;
    }
  `;

  const shaderMaterial = useMemo(
    () => new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uniforms]
  );

  return (
    <group rotation={[0, 0, (23.5 * Math.PI) / 180]}>
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 64, 64]} />
        {dayMap && nightMap ? (
          <primitive object={shaderMaterial} attach="material" />
        ) : (
          <meshStandardMaterial color="#1a5b82" />
        )}
      </mesh>
      
      {/* Invisible shadow receiver shell slightly larger than Earth's surface */}
      <mesh receiveShadow>
        <sphereGeometry args={[1.005, 64, 64]} />
        <shadowMaterial transparent opacity={0.7} />
      </mesh>

      <Atmosphere />
      <Clouds cloudsMap={cloudsMap} />
    </group>
  );
}
