'use client';

import { useState, useEffect } from 'react';
import { Key } from 'lucide-react';
import { useGuestStore } from '@/lib/stores/guest-store';

interface DigitalKeyButtonProps {
  roomNumber: string;
}

export function DigitalKeyButton({ roomNumber }: DigitalKeyButtonProps) {
  const { isKeyActive, activateKey } = useGuestStore();
  const [ripples, setRipples] = useState<number[]>([]);

  const handleUnlock = () => {
    if (!isKeyActive) {
      activateKey();
      // Add ripple animation
      setRipples([Date.now()]);
    }
  };

  useEffect(() => {
    if (isKeyActive) {
      const interval = setInterval(() => {
        setRipples((prev) => [...prev, Date.now()]);
      }, 500);

      return () => {
        clearInterval(interval);
        setRipples([]);
      };
    }
  }, [isKeyActive]);

  return (
    <div className="flex flex-col items-center py-6">
      <button
        onClick={handleUnlock}
        disabled={isKeyActive}
        className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
          isKeyActive
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/50 scale-105'
            : 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95'
        }`}
      >
        {/* Ripple effects */}
        {ripples.map((id) => (
          <span
            key={id}
            className={`absolute inset-0 rounded-full border-4 animate-ping ${
              isKeyActive ? 'border-emerald-300' : 'border-amber-300'
            }`}
            style={{
              animationDuration: '1s',
              animationIterationCount: 1,
            }}
            onAnimationEnd={() => setRipples((prev) => prev.filter((r) => r !== id))}
          />
        ))}

        {/* Key icon */}
        <Key
          className={`h-12 w-12 text-white transition-transform duration-500 ${
            isKeyActive ? 'rotate-45' : ''
          }`}
        />
      </button>

      {/* Status text */}
      <p className="mt-4 text-sm text-white/60">
        {isKeyActive ? 'Door Unlocked!' : 'Tap to unlock your room'}
      </p>

      {/* Room badge */}
      <div className="mt-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/20">
        <span className="text-sm font-medium text-white/80">Room {roomNumber}</span>
      </div>
    </div>
  );
}

export default DigitalKeyButton;
