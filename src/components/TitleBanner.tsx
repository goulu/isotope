import React from 'react';
import { getDecayColor } from '../utils/physics';
import { DecayMode } from '../types/isotope';

interface TitleBannerProps {
  onInspectIsotope?: (isoId: string) => void;
  isotopesDB: Record<string, { protons: number; neutrons: number; halfLife: number; decayMode: DecayMode; name: string }>;
}

export const TitleBanner: React.FC<TitleBannerProps> = ({ onInspectIsotope, isotopesDB }) => {
  // Isotopes that spell "I-S-O-Te-P-Es"
  const bannerTiles = [
    { id: 'I-127', sym: 'I', mass: 127, z: 53 },
    { id: 'S-32', sym: 'S', mass: 32, z: 16 },
    { id: 'O-16', sym: 'O', mass: 16, z: 8 },
    { id: 'Te-120', sym: 'Te', mass: 120, z: 52 },
    { id: 'P-31', sym: 'P', mass: 31, z: 15 },
    { id: 'Es-252', sym: 'Es', mass: 252, z: 99 },
  ];

  return (
    <div className="flex flex-col items-center justify-center my-1 select-none">
      <div className="flex items-center gap-1.5 sm:gap-2">
        {bannerTiles.map((tile) => {
          const raw = isotopesDB[tile.id];
          const decayMode: DecayMode = raw ? raw.decayMode : 'None';
          const style = getDecayColor(decayMode);

          return (
            <div
              key={tile.id}
              onClick={() => onInspectIsotope && onInspectIsotope(tile.id)}
              className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 shadow-md border"
              style={{
                backgroundColor: style.hex,
                borderColor: 'rgba(255,255,255,0.3)',
              }}
              title={`${tile.id} (${raw?.name || 'Nucléide'}) - Cliquer pour inspecter`}
            >
              <span
                className={`font-black text-xs sm:text-base leading-none tracking-tight ${
                  decayMode === 'None' ? 'text-white' : 'text-zinc-950'
                }`}
              >
                {tile.sym}
              </span>
              <span
                className={`font-mono text-[8px] sm:text-[10px] font-bold leading-none mt-0.5 ${
                  decayMode === 'None' ? 'text-zinc-400' : 'text-zinc-800'
                }`}
              >
                {tile.mass}
              </span>
            </div>
          );
        })}
      </div>
      <div className="text-[10px] sm:text-xs text-zinc-400 font-mono tracking-widest uppercase mt-1">
        Le Jeu de Transmutation Radioactive
      </div>
    </div>
  );
};
