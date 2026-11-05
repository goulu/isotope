import React from 'react';
import { LevelData, DecayMode } from '../types/isotope';
import { getDecayColor } from '../utils/physics';
import { ArrowRight, Trophy, AlertOctagon, HelpCircle, Atom } from 'lucide-react';

interface LevelBarProps {
  currentLevel: LevelData | null;
  levelIndex: number;
  totalLevels: number;
  isSandbox: boolean;
  onToggleSandbox: () => void;
  onOpenStory: () => void;
  onOpenLevelSelector?: () => void;
  isGameOver: boolean;
  isVictory: boolean;
  isotopesDB: Record<string, { protons: number; neutrons: number; halfLife: number; decayMode: DecayMode; name: string }>;
}

export const LevelBar: React.FC<LevelBarProps> = ({
  currentLevel,
  levelIndex,
  totalLevels,
  isSandbox,
  onToggleSandbox,
  onOpenStory,
  onOpenLevelSelector,
  isGameOver,
  isVictory,
  isotopesDB,
}) => {
  if (isSandbox) {
    return (
      <div className="bg-zinc-900/90 border border-purple-500/40 rounded-2xl p-2.5 sm:p-3.5 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold">
            ⚛
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-extrabold text-purple-400 tracking-wider">Mode Libre</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-950 text-purple-200 border border-purple-800">Bac à sable</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-white">
              Expérimentation libre sur 3 557 isotopes
            </div>
          </div>
        </div>

        <button
          onClick={onToggleSandbox}
          className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
        >
          <span>Retour aux Niveaux</span>
        </button>
      </div>
    );
  }

  if (!currentLevel) return null;

  const startIsoData = isotopesDB[currentLevel.startIsotope];
  const targetIsoData = isotopesDB[currentLevel.targetIsotope];

  const startStyle = getDecayColor(startIsoData?.decayMode || 'None');
  const targetStyle = getDecayColor(targetIsoData?.decayMode || 'None');

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-2.5 sm:p-3.5 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-2 sm:gap-3">
      {/* Left: Level title and ID */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onOpenLevelSelector}
          className="flex-shrink-0 px-2 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center gap-1 text-zinc-200 font-mono text-xs font-bold transition-colors"
          title="Choisir un niveau"
        >
          <Atom className="w-3.5 h-3.5 text-sky-400" />
          <span>{levelIndex + 1}/{totalLevels}</span>
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] sm:text-[11px] font-bold text-sky-400 uppercase tracking-wider">
              Niveau {currentLevel.id}
            </span>
            {isGameOver && isVictory && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                <Trophy className="w-3 h-3" /> Gagné !
              </span>
            )}
            {isGameOver && !isVictory && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold">
                <AlertOctagon className="w-3 h-3" /> Échec
              </span>
            )}
          </div>
          <h1 className="text-xs sm:text-sm font-bold text-white truncate">
            {currentLevel.title}
          </h1>
        </div>
      </div>

      {/* Right / Center: Mission Path (Start -> Target) & Details button */}
      <div className="flex items-center gap-2 ml-auto">
        <div className="flex items-center gap-1.5 sm:gap-2.5 bg-zinc-950/80 px-2.5 py-1 rounded-xl border border-zinc-800/80">
          {/* Start Isotope */}
          <div className="flex items-center gap-1">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] shadow-sm border"
              style={{
                backgroundColor: startStyle.hex,
                color: startIsoData?.decayMode === 'None' ? '#fff' : '#000',
                borderColor: 'rgba(255,255,255,0.3)',
              }}
            >
              {currentLevel.startIsotope.split('-')[0]}
            </div>
            <span className="text-[11px] font-mono font-bold text-zinc-200">{currentLevel.startIsotope}</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />

          {/* Target Isotope */}
          <div className="flex items-center gap-1">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] shadow-sm border ring-1 ring-amber-400"
              style={{
                backgroundColor: targetStyle.hex,
                color: targetIsoData?.decayMode === 'None' ? '#fff' : '#000',
                borderColor: 'rgba(255,255,255,0.3)',
              }}
            >
              {currentLevel.targetIsotope.split('-')[0]}
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-300">{currentLevel.targetIsotope}</span>
          </div>
        </div>

        <button
          onClick={onOpenStory}
          className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-medium transition-colors flex items-center gap-1"
          title="Consulter l'explication physique de ce niveau"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline text-[11px]">Détails</span>
        </button>
      </div>
    </div>
  );
};
