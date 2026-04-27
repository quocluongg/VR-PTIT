import { useEffect } from 'react';
import { useColorGameStore } from '@/store/useColorGameStore';
import ColorBall from './ColorBall';
import ColorCircle from './ColorCircle';
import UIPanel from './UIPanel';
import { Environment } from '@react-three/drei';

export default function VRGameScene() {
  const { mode, isPlaying, balls, tickTimer } = useColorGameStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && mode === 'hard') {
      interval = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, mode, tickTimer]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} />
      <Environment preset="night" background blur={0.5} />

      <UIPanel />

      {mode !== null && (
        <>
          <ColorCircle />
          
          {/* Balls Area */}
          <group position={[0, 1.0, -0.5]}>
            {balls.map((ball, index) => {
              if (ball.isPlaced) return null; // Don't render here if placed

              // Arrange balls in a small arc in front of the user
              const angle = (index / Math.max(balls.length - 1, 1)) * Math.PI - Math.PI / 2;
              const radius = 0.6;
              const x = Math.sin(angle) * radius;
              const z = Math.cos(angle) * radius * 0.3 - 0.2;
              // Add slight y variation based on index to avoid overlapping if many
              const y = (index % 2) * 0.1;
              
              return (
                <ColorBall 
                  key={ball.id} 
                  id={ball.id} 
                  color={ball.color} 
                  position={[x, y, z]} 
                />
              );
            })}
          </group>
        </>
      )}
    </>
  );
}
