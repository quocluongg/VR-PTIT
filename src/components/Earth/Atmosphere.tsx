"use client";

import { useMemo } from "react";
import * as THREE from "three";

export default function Atmosphere() {
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      // Vertex shader calculates the normal vector to view vector dot product
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      // Fragment shader colors the edges (fresnel effect) cyan/blue
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 3.0);
          gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  return (
    <mesh>
      {/* Slightly larger than Clouds (1.01) -> 1.1 */}
      <sphereGeometry args={[1.1, 64, 64]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
}
