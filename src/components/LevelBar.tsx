import React from 'react';
import { LevelData, DecayMode } from '../types/isotope';
import { getDecayColor } from '../utils/physics';
import { ArrowRight, Trophy, AlertOctagon, HelpCircle, Shuffle } from 'lucide-react';

interface LevelBarProps {
  currentLevel: LevelData | null;
  levelIndex: number;
  totalLevels: number;
  isSandbox: boolean;
  onToggleSandbox: () => void;
  onOpenStory: () => void;
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
  isGameOver,
  isVictory,
  isotopesDB,
}) => {
  if (isSandbox) {
    return (
      <div className="bg-zinc-900/90 border border-purple-500/40 rounded-2xl p-3.5 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold">
            ⚛
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold text-purple-400 tracking-wider">Mode Libre & Laboratoire</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-200 border border-purple-800">Bac à sable</span>
            </div>
            <div className="text-sm font-bold text-white">
              Expérimentation libre sur plus de 3 500 isotopes
            </div>
          </div>
        </div>

        <button
          onClick={onToggleSandbox}
          className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
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
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3.5 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-3">
      {/* Left: Level title and ID */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 font-mono text-xs font-bold">
          {levelIndex + 1}/{totalLevels}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
              Niveau {currentLevel.id}
            </span>
            {isGameOver && isVictory && (
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                <Trophy className="w-3 h-3" /> Objectif Atteint !
              </span>
            )}
            {isGameOver && !isVictory && (
              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold">
                <AlertOctagon className="w-3 h-3" /> Échec (Ressources épuisées)
              </span>
            )}
          </div>
          <h1 className="text-sm sm:text-base font-bold text-white line-clamp-1">
            {currentLevel.title}
          </h1>
        </div>
      </div>

      {/* Center: Mission Path (Start -> Target) */}
      <div className="flex items-center gap-2 sm:gap-3 bg-zinc-950/80 px-3 py-1.5 rounded-xl border border-zinc-800/80">
        {/* Start Isotope */}
        <div className="flex items-center gap-1.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] shadow-sm border"
            style={{
              backgroundColor: startStyle.hex,
              color: startIsoData?.decayMode === 'None' ? '#fff' : '#000',
              borderColor: 'rgba(255,255,255,0.3)',
            }}
          >
            {currentLevel.startIsotope.split('-')[0]}
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase text-zinc-400 font-bold">Départ</span>
            <span className="text-xs font-mono font-bold text-zinc-200">{currentLevel.startIsotope}</span>
          </div>
        </div>

        <ArrowRight className="w-4 h-4 text-zinc-500" />

        {/* Target Isotope */}
        <div className="flex items-center gap-1.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] shadow-sm border ring-2 ring-amber-400"
            style={{
              backgroundColor: targetStyle.hex,
              color: targetIsoData?.decayMode === 'None' ? '#fff' : '#000',
              borderColor: 'rgba(255,255,255,0.3)',
            }}
          >
            {currentLevel.targetIsotope.split('-')[0]}
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase text-amber-400 font-bold">Cible</span>
            <span className="text-xs font-mono font-bold text-amber-300">{currentLevel.targetIsotope}</span>
          </div>
        </div>
      </div>

      {/* Right: Info / Sandbox buttons */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        <button
          onClick={onOpenStory}
          className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-medium transition-colors flex items-center gap-1"
          title="Consulter l'explication physique de ce niveau"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px]">Détails</span>
        </button>

        <button
          onClick={onToggleSandbox}
          className="px-2.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-200 border border-purple-800/60 text-xs font-medium transition-colors flex items-center gap-1"
          title="Passer en mode bac à sable libre"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span className="text-[11px]">Mode Libre</span>
        </button>
      </div>
    </div>
  );
};
