'use client';

import React from 'react';

export default function LogoCube() {
  return (
    <div className="w-6 h-6 flex items-center justify-center cursor-pointer select-none" style={{ perspective: '400px' }}>
      <div
        className="w-4.5 h-4.5 relative"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateX(-25deg) rotateY(45deg)',
        }}
      >
        {/* Front Face: Solid Orange */}
        <div
          className="absolute inset-0 bg-charcoal border border-charcoal/20 p-[1px] rounded-[2px]"
          style={{ transform: 'rotateY(0deg) translateZ(9px)', backfaceVisibility: 'visible' }}
        >
          <div className="grid grid-cols-3 gap-[0.5px] w-full h-full">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-cube-orange rounded-[0.5px]" />
            ))}
          </div>
        </div>

        {/* Right Face: Solid Blue */}
        <div
          className="absolute inset-0 bg-charcoal border border-charcoal/20 p-[1px] rounded-[2px]"
          style={{ transform: 'rotateY(90deg) translateZ(9px)', backfaceVisibility: 'visible' }}
        >
          <div className="grid grid-cols-3 gap-[0.5px] w-full h-full">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-cube-blue rounded-[0.5px]" />
            ))}
          </div>
        </div>

        {/* Back Face: Solid Yellow */}
        <div
          className="absolute inset-0 bg-charcoal border border-charcoal/20 p-[1px] rounded-[2px]"
          style={{ transform: 'rotateY(180deg) translateZ(9px)', backfaceVisibility: 'visible' }}
        >
          <div className="grid grid-cols-3 gap-[0.5px] w-full h-full">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-cube-yellow rounded-[0.5px]" />
            ))}
          </div>
        </div>

        {/* Left Face: Solid Red */}
        <div
          className="absolute inset-0 bg-charcoal border border-charcoal/20 p-[1px] rounded-[2px]"
          style={{ transform: 'rotateY(-90deg) translateZ(9px)', backfaceVisibility: 'visible' }}
        >
          <div className="grid grid-cols-3 gap-[0.5px] w-full h-full">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-cube-red rounded-[0.5px]" />
            ))}
          </div>
        </div>

        {/* Top Face: Solid Green */}
        <div
          className="absolute inset-0 bg-charcoal border border-charcoal/20 p-[1px] rounded-[2px]"
          style={{ transform: 'rotateX(90deg) translateZ(9px)', backfaceVisibility: 'visible' }}
        >
          <div className="grid grid-cols-3 gap-[0.5px] w-full h-full">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-cube-green rounded-[0.5px]" />
            ))}
          </div>
        </div>

        {/* Bottom Face: Solid White */}
        <div
          className="absolute inset-0 bg-charcoal border border-charcoal/20 p-[1px] rounded-[2px]"
          style={{ transform: 'rotateX(-90deg) translateZ(9px)', backfaceVisibility: 'visible' }}
        >
          <div className="grid grid-cols-3 gap-[0.5px] w-full h-full">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-cube-white rounded-[0.5px]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
