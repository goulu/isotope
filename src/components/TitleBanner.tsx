import React from 'react';
import { getDecayColor, getElementName } from '../utils/physics';
import { DecayMode } from '../types/isotope';
import { useI18n } from '../i18n';

interface TitleBannerProps {
  onInspectIsotope?: (isoId: string) => void;
  isotopesDB: Record<string, { protons: number; neutrons: number; halfLife: number; decayMode: DecayMode; name: string }>;
}

export const TitleBanner: React.FC<TitleBannerProps> = ({ onInspectIsotope, isotopesDB }) => {
  const { t, lang } = useI18n();
  // Unstable (colored) isotopes that spell "I - S - O - Th - O - P - E"
  const bannerTiles: { id: string; sym: string; mass: number; z: number; fallbackMode: DecayMode }[] = [
    { id: 'I-109', sym: 'I', mass: 109, z: 53, fallbackMode: 'Proton' },
    { id: 'S-35', sym: 'S', mass: 35, z: 16, fallbackMode: 'Beta-' },
    { id: 'O-15', sym: 'O', mass: 15, z: 8, fallbackMode: 'Beta+' },
    { id: 'Th-232', sym: 'Th', mass: 232, z: 90, fallbackMode: 'Alpha' },
    { id: 'O-25', sym: 'O', mass: 25, z: 8, fallbackMode: 'Neutron' },
    { id: 'P-32', sym: 'P', mass: 32, z: 15, fallbackMode: 'Beta-' },
    { id: 'Es-252', sym: 'E', mass: 252, z: 99, fallbackMode: 'Alpha' },
  ];

  return (
    <div className="flex flex-col items-center justify-center my-0.5 select-none">
      <div className="flex items-center gap-1 sm:gap-1.5">
        {bannerTiles.map((tile, idx) => {
          const raw = isotopesDB[tile.id];
          const decayMode: DecayMode = raw && raw.decayMode !== 'None' ? raw.decayMode : tile.fallbackMode;
          const style = getDecayColor(decayMode);
          const elName = getElementName(tile.z, lang, raw?.name);

          return (
            <div
              key={`${tile.id}-${idx}`}
              onClick={() => onInspectIsotope && onInspectIsotope(tile.id)}
              className="w-7 h-7 sm:w-11 sm:h-11 rounded-lg sm:rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 shadow-md border"
              style={{
                backgroundColor: style.hex,
                borderColor: 'rgba(255,255,255,0.35)',
              }}
              title={`${tile.id} (${elName}) - ${t('clickToInspect')}`}
            >
              <span className="font-black text-[11px] sm:text-base leading-none tracking-tight text-zinc-950">
                {tile.sym}
              </span>
              <span className="font-mono text-[7px] sm:text-[10px] font-bold leading-none mt-0.5 text-zinc-800">
                {tile.mass}
              </span>
            </div>
          );
        })}
      </div>
      <div className="hidden sm:block text-[10px] sm:text-xs text-zinc-400 font-mono tracking-widest uppercase mt-1">
        {t('subtitle')}
      </div>
    </div>
  );
};
