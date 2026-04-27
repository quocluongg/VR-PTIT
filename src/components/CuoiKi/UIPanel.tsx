import { useColorGameStore } from '@/store/useColorGameStore';
import { Text } from '@react-three/drei';
import { Interactive } from '@react-three/xr';

export default function UIPanel() {
  const { mode, level, timeRemaining, isPlaying, isGameOver, isVictory, startGame, resetGame } = useColorGameStore();

  if (mode === null) {
    return (
      <group position={[0, 1.5, -1.2]}>
        <Text fontSize={0.2} position={[0, 0.3, 0]} color="#ffffff" anchorX="center" anchorY="middle">
          VR Color Circle
        </Text>
        <Text fontSize={0.08} position={[0, 0.1, 0]} color="#aaaaaa" anchorX="center" anchorY="middle">
          Select Difficulty
        </Text>
        
        <Interactive onSelect={() => startGame('easy')}>
          <group position={[-0.3, -0.2, 0]} onClick={() => startGame('easy')}>
            <mesh>
              <boxGeometry args={[0.4, 0.15, 0.05]} />
              <meshStandardMaterial color="#22c55e" />
            </mesh>
            <Text position={[0, 0, 0.026]} fontSize={0.08} color="white" anchorX="center" anchorY="middle">
              EASY
            </Text>
          </group>
        </Interactive>

        <Interactive onSelect={() => startGame('hard')}>
          <group position={[0.3, -0.2, 0]} onClick={() => startGame('hard')}>
            <mesh>
              <boxGeometry args={[0.4, 0.15, 0.05]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
            <Text position={[0, 0, 0.026]} fontSize={0.08} color="white" anchorX="center" anchorY="middle">
              HARD
            </Text>
          </group>
        </Interactive>
      </group>
    );
  }

  return (
    <group position={[0, 2.5, -1.5]}>
      {/* HUD Info */}
      <Text fontSize={0.15} position={[-0.8, 0, 0]} color="#ffffff" anchorX="left">
        Level {level}
      </Text>
      
      {mode === 'hard' && (
        <Text fontSize={0.15} position={[0.8, 0, 0]} color={timeRemaining < 10 ? "#ef4444" : "#ffffff"} anchorX="right">
          Time: {timeRemaining}s
        </Text>
      )}

      {/* Game Over / Victory Overlays */}
      {(isGameOver || isVictory) && (
        <group position={[0, -0.5, 0.5]}>
          <mesh>
            <planeGeometry args={[2, 1]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.8} />
          </mesh>
          <Text fontSize={0.2} position={[0, 0.2, 0.01]} color={isVictory ? "#22c55e" : "#ef4444"} anchorX="center">
            {isVictory ? "VICTORY!" : "GAME OVER"}
          </Text>
          
          <Interactive onSelect={resetGame}>
            <group position={[0, -0.2, 0.01]} onClick={resetGame}>
              <mesh>
                <boxGeometry args={[0.5, 0.15, 0.02]} />
                <meshStandardMaterial color="#3b82f6" />
              </mesh>
              <Text position={[0, 0, 0.011]} fontSize={0.08} color="white" anchorX="center" anchorY="middle">
                PLAY AGAIN
              </Text>
            </group>
          </Interactive>
        </group>
      )}
    </group>
  );
}
