import React from 'react';
import { RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
import { useI18n } from '../i18n';

interface ControlPanelProps {
  remainingNeutrons: number;
  maxNeutrons: number;
  remainingElectrons: number;
  maxElectrons: number;
  remainingProtons?: number;
  maxProtons?: number;
  isGameOver: boolean;
  isVictory: boolean;
  onShootNeutron: () => void;
  onShootElectron: () => void;
  onShootProton?: () => void;
  onRestart: () => void;
  onNextLevel: () => void;
  onOpenStory: () => void;
  onOpenLevelSelector: () => void;
  hasNextLevel: boolean;
  isSandbox: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  remainingNeutrons,
  maxNeutrons,
  remainingElectrons,
  maxElectrons,
  remainingProtons = 0,
  maxProtons = 0,
  isGameOver,
  isVictory,
  onShootNeutron,
  onShootElectron,
  onShootProton,
  onRestart,
  onNextLevel,
  onOpenStory,
  onOpenLevelSelector,
  hasNextLevel,
  isSandbox,
}) => {
  const { t } = useI18n();
  const canShootNeutron = !isGameOver && (isSandbox || remainingNeutrons > 0);
  const canShootElectron = !isGameOver && (isSandbox || remainingElectrons > 0);
  const canShootProton = !isGameOver && (isSandbox || remainingProtons > 0);

  return (
    <div className="w-full bg-zinc-900/95 border border-zinc-800 rounded-2xl p-2 sm:p-4 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
        {/* Neutron Button (⚛ +n) */}
        {(maxNeutrons > 0 || isSandbox) && (
          <button
            onClick={onShootNeutron}
            disabled={!canShootNeutron}
            className={`flex-1 sm:flex-initial min-w-[105px] sm:min-w-[140px] px-2.5 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all shadow-lg active:scale-95 ${
              canShootNeutron
                ? 'bg-gradient-to-b from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white shadow-sky-600/30 ring-1 ring-sky-400 cursor-pointer'
                : 'bg-zinc-800/60 text-zinc-500 border border-zinc-800 cursor-not-allowed opacity-50'
            }`}
            title={t('addNeutronTooltip')}
          >
            <div className="flex items-center gap-1 font-bold text-xs sm:text-base">
              <span className="text-sm sm:text-lg">⚛</span>
              <span>{t('addNeutron')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-sky-100 font-mono">
              <span>(N+1)</span>
              <span>•</span>
              <span className="font-bold">
                {isSandbox ? '∞' : `${remainingNeutrons}/${maxNeutrons}`}
              </span>
            </div>
          </button>
        )}

        {/* Electron Capture Button (⚡ +e-) */}
        {(maxElectrons > 0 || isSandbox) && (
          <button
            onClick={onShootElectron}
            disabled={!canShootElectron}
            className={`flex-1 sm:flex-initial min-w-[105px] sm:min-w-[140px] px-2.5 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all shadow-lg active:scale-95 ${
              canShootElectron
                ? 'bg-gradient-to-b from-fuchsia-600 to-fuchsia-700 hover:from-fuchsia-500 hover:to-fuchsia-600 text-white shadow-fuchsia-600/30 ring-1 ring-fuchsia-400 cursor-pointer'
                : 'bg-zinc-800/60 text-zinc-500 border border-zinc-800 cursor-not-allowed opacity-50'
            }`}
            title={t('addElectronTooltip')}
          >
            <div className="flex items-center gap-1 font-bold text-xs sm:text-base">
              <span className="text-sm sm:text-lg">⚡</span>
              <span>{t('addElectron')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-fuchsia-100 font-mono">
              <span>(Z-1,N+1)</span>
              <span>•</span>
              <span className="font-bold">
                {isSandbox ? '∞' : `${remainingElectrons}/${maxElectrons}`}
              </span>
            </div>
          </button>
        )}

        {/* Proton Button (si sandbox ou maxProtons > 0) */}
        {(maxProtons > 0 || isSandbox) && (
          <button
            onClick={onShootProton}
            disabled={!canShootProton}
            className={`flex-1 sm:flex-initial min-w-[100px] sm:min-w-[130px] px-2.5 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all shadow-lg active:scale-95 ${
              canShootProton
                ? 'bg-gradient-to-b from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white shadow-orange-600/30 ring-1 ring-orange-400 cursor-pointer'
                : 'bg-zinc-800/60 text-zinc-500 border border-zinc-800 cursor-not-allowed opacity-50'
            }`}
            title={t('addProtonTooltip')}
          >
            <div className="flex items-center gap-1 font-bold text-xs sm:text-base">
              <span className="text-sm sm:text-lg">🔴</span>
              <span>{t('addProton')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-orange-100 font-mono">
              <span>(Z+1)</span>
              <span>•</span>
              <span className="font-bold">{isSandbox ? '∞' : `${remainingProtons}/${maxProtons}`}</span>
            </div>
          </button>
        )}

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="px-3 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
          title={t('restartTooltip')}
        >
          <RotateCcw className="w-4 h-4" />
          <span className="hidden sm:inline">{t('restart')}</span>
        </button>

        {/* Victory Next Level Button */}
        {isGameOver && isVictory && hasNextLevel && (
          <button
            onClick={onNextLevel}
            className="px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xl shadow-emerald-500/30 ring-2 ring-emerald-300 animate-bounce active:scale-95"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>{t('next')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
