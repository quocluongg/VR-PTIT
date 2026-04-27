"use client";

import { Canvas } from '@react-three/fiber';
import { VRButton, XR, Controllers, Hands } from '@react-three/xr';
import VRGameScene from '@/components/CuoiKi/VRGameScene';

export default function CuoiKiPage() {
  return (
    <main className="w-full h-screen bg-black overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 text-white space-y-2 pointer-events-none">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          VR Color Circle
        </h1>
        <div className="bg-black/50 p-4 rounded-lg backdrop-blur-sm border border-white/10 max-w-md">
          <p className="text-sm opacity-90 leading-relaxed">
            Nhấn nút <strong>Enter VR</strong> ở góc dưới màn hình để bắt đầu trải nghiệm.
          </p>
          <p className="text-sm opacity-90 leading-relaxed mt-2 text-yellow-300">
            <strong>Cách chơi:</strong><br/>
            1. Dùng tay cầm (Controller) chỉ tia vào quả cầu màu và bóp cò (Trigger) để chọn.<br/>
            2. Chỉ tia vào ô trống trên vòng tròn và bóp cò để đặt.<br/>
            3. Ghép đúng tất cả các màu để qua màn!
          </p>
        </div>
      </div>

      <VRButton />
      <Canvas camera={{ position: [0, 1.6, 2] }}>
        <XR>
          <Controllers />
          <Hands />
          <VRGameScene />
        </XR>
      </Canvas>
    </main>
  );
}
