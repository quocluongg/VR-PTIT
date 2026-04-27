import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Interactive } from '@react-three/xr';
import { useColorGameStore } from '@/store/useColorGameStore';
import * as THREE from 'three';

interface Props {
  id: string;
  color: string;
  position: [number, number, number];
}

// Simple audio helper
export const playBeep = (freq: number, type: OscillatorType, duration: number = 0.1) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Ignore if audio context not allowed yet
  }
};

export default function ColorBall({ id, color, position }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { activeBallId, setActiveBall } = useColorGameStore();
  const isActive = activeBallId === id;

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.05;
      
      // Pulse scale if active
      if (isActive) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
        meshRef.current.scale.set(scale, scale, scale);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  const handleSelect = () => {
    playBeep(440, 'sine');
    setActiveBall(isActive ? null : id);
  };

  return (
    <Interactive onSelect={handleSelect}>
      <mesh ref={meshRef} position={position} onClick={handleSelect}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshPhysicalMaterial 
          color={color} 
          emissive={isActive ? color : '#000000'}
          emissiveIntensity={isActive ? 0.8 : 0}
          roughness={0.1}
          metalness={0.5}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </Interactive>
  );
}
