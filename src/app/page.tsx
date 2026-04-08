import dynamic from 'next/dynamic';
import HUD from '@/components/UI/HUD';

// Dynamically import the Scene component to disable SSR, 
// as Three.js depends on the browser's window and navigator objects
const Scene = dynamic(() => import('@/components/Scene/Scene'), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="relative w-screen h-screen">
      <div id="canvas-container">
        <Scene />
      </div>
      <HUD />
    </main>
  );
}
