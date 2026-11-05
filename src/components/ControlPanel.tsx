import React from 'react';
import { RotateCcw, ArrowRight, Sparkles, BookOpen, Atom } from 'lucide-react';

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
  const canShootNeutron = !isGameOver && (isSandbox || remainingNeutrons > 0);
  const canShootElectron = !isGameOver && (isSandbox || remainingElectrons > 0);
  const canShootProton = !isGameOver && (isSandbox || remainingProtons > 0);

  return (
    <div className="bg-zinc-900/95 border border-zinc-800 rounded-3xl p-3 sm:p-5 shadow-2xl backdrop-blur-md">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Quick Guide & Level Selector Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
          <button
            onClick={onOpenLevelSelector}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold transition-all"
            title="Choisir un niveau"
          >
            <Atom className="w-4 h-4 text-sky-400" />
            <span>Niveaux</span>
          </button>

          <button
            onClick={onOpenStory}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold transition-all"
            title="Contexte historique et physique nucléaire du niveau"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Guide & Histoire</span>
          </button>

          <button
            onClick={onRestart}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-semibold transition-all"
            title="Recommencer ce niveau (R)"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Recommencer</span>
          </button>
        </div>

        {/* Center/Right: Particle Bombardment Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-4 w-full md:w-auto justify-center">
          {/* Neutron Button (⚛ +n) */}
          {(maxNeutrons > 0 || isSandbox) && (
            <button
              onClick={onShootNeutron}
              disabled={!canShootNeutron}
              className={`flex-1 sm:flex-initial min-w-[120px] sm:min-w-[140px] px-3 sm:px-5 py-3 rounded-2xl flex flex-col items-center justify-center transition-all shadow-lg active:scale-95 ${
                canShootNeutron
                  ? 'bg-gradient-to-b from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white shadow-sky-600/30 ring-1 ring-sky-400 cursor-pointer'
                  : 'bg-zinc-800/60 text-zinc-500 border border-zinc-800 cursor-not-allowed opacity-50'
              }`}
              title="Bombarder avec un neutron : N augmente de 1 (Touche N)"
            >
              <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base">
                <span className="text-base sm:text-lg">⚛</span>
                <span>+ Neutron</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-sky-100 font-mono mt-0.5">
                <span>(N + 1)</span>
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
              className={`flex-1 sm:flex-initial min-w-[120px] sm:min-w-[140px] px-3 sm:px-5 py-3 rounded-2xl flex flex-col items-center justify-center transition-all shadow-lg active:scale-95 ${
                canShootElectron
                  ? 'bg-gradient-to-b from-fuchsia-600 to-fuchsia-700 hover:from-fuchsia-500 hover:to-fuchsia-600 text-white shadow-fuchsia-600/30 ring-1 ring-fuchsia-400 cursor-pointer'
                  : 'bg-zinc-800/60 text-zinc-500 border border-zinc-800 cursor-not-allowed opacity-50'
              }`}
              title="Capture Électronique : p + e⁻ ➔ n + ν (Z - 1, N + 1) (Touche E)"
            >
              <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base">
                <span className="text-base sm:text-lg">⚡</span>
                <span>+ Électron</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-fuchsia-100 font-mono mt-0.5">
                <span>(Z-1, N+1)</span>
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
              className={`flex-1 sm:flex-initial min-w-[110px] sm:min-w-[130px] px-3 sm:px-4 py-3 rounded-2xl flex flex-col items-center justify-center transition-all shadow-lg active:scale-95 ${
                canShootProton
                  ? 'bg-gradient-to-b from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white shadow-orange-600/30 ring-1 ring-orange-400 cursor-pointer'
                  : 'bg-zinc-800/60 text-zinc-500 border border-zinc-800 cursor-not-allowed opacity-50'
              }`}
              title="Ajouter un proton : Z augmente de 1 (Touche P)"
            >
              <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base">
                <span className="text-base sm:text-lg">🔴</span>
                <span>+ Proton</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-orange-100 font-mono mt-0.5">
                <span>(Z + 1)</span>
                <span>•</span>
                <span className="font-bold">{isSandbox ? '∞' : `${remainingProtons}/${maxProtons}`}</span>
              </div>
            </button>
          )}

          {/* Victory Next Level Button */}
          {isGameOver && isVictory && hasNextLevel && (
            <button
              onClick={onNextLevel}
              className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 ring-2 ring-emerald-300 animate-bounce active:scale-95"
            >
              <Sparkles className="w-5 h-5 fill-current" />
              <span>Niveau Suivant</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
