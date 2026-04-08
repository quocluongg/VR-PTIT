"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SUN_POSITION } from "@/components/Earth/Earth";

export default function Sun() {
  const sunRef  = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [sunTexture, setSunTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load("/textures/2k_sun.jpg", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setSunTexture(tex);
    });
  }, []);

  // ── Glow (corona) shader ─────────────────────────────────────────────────
  const glowMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: /* glsl */`
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */`
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.55 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.5);
            gl_FragColor = vec4(1.0, 0.7, 0.2, 1.0) * intensity;
          }
        `,
        blending:    THREE.AdditiveBlending,
        side:        THREE.BackSide,
        transparent: true,
        depthWrite:  false,
      }),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (sunRef.current)  sunRef.current.rotation.y  = t * 0.008;
    if (glowRef.current) glowRef.current.rotation.y = t * 0.008;
  });

  return (
    <group position={SUN_POSITION.toArray()}>
      {/* Corona glow — slightly larger than the Sun sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[5.8, 32, 32]} />
        <primitive object={glowMaterial} attach="material" />
      </mesh>

      {/* Sun surface */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[5, 64, 64]} />
        {sunTexture ? (
          <meshBasicMaterial map={sunTexture} />
        ) : (
          <meshBasicMaterial color="#ffcc00" />
        )}
      </mesh>

      {/* Point light that illuminates Earth, Moon, etc. */}
      <pointLight
        intensity={6000}
        distance={300}
        decay={2}
        color="#fff5e0"
      />
    </group>
  );
}
