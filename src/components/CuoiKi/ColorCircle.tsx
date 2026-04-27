import { useColorGameStore } from '@/store/useColorGameStore';
import { Interactive } from '@react-three/xr';
import * as THREE from 'three';
import { playBeep } from './ColorBall';

export default function ColorCircle() {
  const { slots, balls, placeBall, activeBallId } = useColorGameStore();

  const radius = 0.8;

  return (
    <group position={[0, 1.3, -1.0]}>
      {/* Center decor */}
      <mesh>
        <torusGeometry args={[radius, 0.01, 16, 64]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.2} />
      </mesh>

      {slots.map((slot, index) => {
        const angle = (index / slots.length) * Math.PI * 2 - Math.PI / 2 + Math.PI; // Arrange circularly
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        const isFilled = slot.filledBy !== null;
        const filledColor = isFilled ? balls.find(b => b.id === slot.filledBy)?.color : null;

        const handleSelect = () => {
          if (!activeBallId || isFilled) return;
          
          const success = placeBall(slot.id);
          if (success) {
            playBeep(880, 'sine', 0.15); // Success high pitch
          } else {
            playBeep(150, 'sawtooth', 0.3); // Error low pitch
          }
        };

        return (
          <Interactive key={slot.id} onSelect={handleSelect}>
            <group position={[x, y, 0]} onClick={handleSelect}>
              {/* Slot ring */}
              <mesh>
                <torusGeometry args={[0.1, 0.01, 16, 32]} />
                <meshStandardMaterial 
                  color={activeBallId && !isFilled ? "#ffff00" : "#ffffff"} 
                  emissive={activeBallId && !isFilled ? "#ffff00" : "#000000"} 
                  emissiveIntensity={0.5} 
                  transparent
                  opacity={0.5}
                />
              </mesh>
              
              {/* Filled ball visual or placeholder */}
              {isFilled ? (
                <mesh>
                  <sphereGeometry args={[0.08, 32, 32]} />
                  <meshPhysicalMaterial color={filledColor!} roughness={0.1} metalness={0.5} clearcoat={1.0} />
                </mesh>
              ) : (
                <mesh>
                  <sphereGeometry args={[0.08, 32, 32]} />
                  <meshStandardMaterial color="#ffffff" transparent opacity={0.05} depthWrite={false} />
                </mesh>
              )}
            </group>
          </Interactive>
        );
      })}
    </group>
  );
}
