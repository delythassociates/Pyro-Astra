'use client';

import React from 'react';
import { Combustion3DSimulator } from '@/components/Combustion3DSimulator';
import { Flame, Wind } from 'lucide-react';
import HoverTitleExplanation from '@/components/HoverTitleExplanation';

export default function PhysicsPage() {
  return (
    <div className="flex-1 w-full bg-[#F4F1EA] text-[#181615] py-8 px-4 sm:px-6 xl:px-10">
      <div className="w-full max-w-[1840px] mx-auto space-y-8">
        {/* Page Header */}
        <div className="border-b border-[#D5CFC2] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[#1D4ED8] uppercase tracking-wider font-semibold">
              <Flame className="w-4 h-4 text-[#C2410C]" />
              <span>Three.js WebGL Simulation · Microgravity Combustion Physics</span>
            </div>
            <HoverTitleExplanation
              title="3D Flame & Airflow Physics Engine"
              summary="Interact with real-time 3D combustion models. Explore the physics of buoyant convection on Earth (1g) versus pure diffusion in microgravity (0g), and test how cabin airflow speeds govern flame spread and blowoff extinction."
              badge="Three.js WebGL"
            />
          </div>

          <div className="text-right text-xs font-mono text-[#5A544A] shrink-0">
            <span className="block font-bold text-[#181615]">BASS / BASS-II / FLEX Validated</span>
            <span className="text-[11px] text-[#736B5E]">Full 3D OrbitControls</span>
          </div>
        </div>

        {/* 3D Simulator Component */}
        <Combustion3DSimulator />
      </div>
    </div>
  );
}
