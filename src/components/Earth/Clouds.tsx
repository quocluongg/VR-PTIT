"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SUN_POSITION } from "./Earth";
import { useStore } from "@/store/useStore";

interface CloudsProps {
  cloudsMap: THREE.Texture | null;
}

export default function Clouds({ cloudsMap }: CloudsProps) {
  const cloudsRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      cloudsTexture: { value: null as THREE.Texture | null },
      sunPosition:   { value: SUN_POSITION.clone() },
    }),
    []
  );

  useEffect(() => {
    uniforms.cloudsTexture.value = cloudsMap;
  }, [cloudsMap, uniforms]);

  const { timeScale } = useStore();
  const cloudsRotationRef = useRef(0);

  useFrame((_, delta) => {
    cloudsRotationRef.current += delta * 0.06 * timeScale;
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = cloudsRotationRef.current;
      
      const parentGroup = cloudsRef.current.parent?.parent;
      if (parentGroup) {
        uniforms.sunPosition.value.copy(SUN_POSITION).applyMatrix4(parentGroup.matrixWorld);
      }
    }
  });

  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        // Same world-normal fix: use mat3(modelMatrix) not inverse/transpose
        vertexShader: /* glsl */`
          varying vec2 vUv;
          varying vec3 vWorldNormal;
          varying vec3 vWorldPosition;

          void main() {
            vUv = uv;
            vWorldNormal = normalize(mat3(modelMatrix) * normal);
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */`
          uniform sampler2D cloudsTexture;
          uniform vec3 sunPosition;

          varying vec2 vUv;
          varying vec3 vWorldNormal;
          varying vec3 vWorldPosition;

          void main() {
            vec3 sunDir = normalize(sunPosition - vWorldPosition);
            float NdotL = dot(vWorldNormal, sunDir);
            float dayFactor = smoothstep(-0.1, 0.3, NdotL);

            float cloudDensity = texture2D(cloudsTexture, vUv).r;
            float alpha  = cloudDensity * 0.85;
            float bright = dayFactor * 0.95 + 0.05;
            gl_FragColor = vec4(vec3(bright), alpha);
          }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uniforms]
  );

  return (
    <mesh ref={cloudsRef}>
      <sphereGeometry args={[1.01, 64, 64]} />
      {cloudsMap ? (
        <primitive object={shaderMaterial} attach="material" />
      ) : (
        <meshBasicMaterial transparent opacity={0} />
      )}
    </mesh>
  );
}
