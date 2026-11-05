import React from 'react';
import { LevelData, DecayMode } from '../types/isotope';
import { getDecayColor } from '../utils/physics';
import { X, CheckCircle, ArrowRight, Atom } from 'lucide-react';

interface LevelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  levels: LevelData[];
  currentLevelIndex: number;
  completedLevels: Set<number>;
  onSelectLevel: (index: number) => void;
  isotopesDB: Record<string, { protons: number; neutrons: number; halfLife: number; decayMode: DecayMode; name: string }>;
}

export const LevelSelectorModal: React.FC<LevelSelectorModalProps> = ({
  isOpen,
  onClose,
  levels,
  currentLevelIndex,
  completedLevels,
  onSelectLevel,
  isotopesDB,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Atom className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Sélection des Niveaux</h2>
              <p className="text-xs text-zinc-400">Progression des transmutations ({completedLevels.size}/{levels.length} réussis)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level List */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-2.5">
          {levels.map((lvl, index) => {
            const isCurrent = index === currentLevelIndex;
            const isCompleted = completedLevels.has(lvl.id);
            const startData = isotopesDB[lvl.startIsotope];
            const targetData = isotopesDB[lvl.targetIsotope];

            const startStyle = getDecayColor(startData?.decayMode || 'None');
            const targetStyle = getDecayColor(targetData?.decayMode || 'None');

            return (
              <div
                key={lvl.id}
                onClick={() => {
                  onSelectLevel(index);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-sky-950/60 border-sky-400 ring-2 ring-sky-400/50 shadow-lg'
                    : isCompleted
                    ? 'bg-zinc-900/90 hover:bg-zinc-800/90 border-emerald-900/60'
                    : 'bg-zinc-900/50 hover:bg-zinc-800/60 border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 border ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : isCurrent
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : lvl.id}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white line-clamp-1">{lvl.title}</span>
                      {isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500 text-black font-bold">Actuel</span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                      Ressources : {lvl.maxNeutrons} ⚛ neutrons • {lvl.maxElectrons} ⚡ électrons
                    </div>
                  </div>
                </div>

                {/* Target isotope preview */}
                <div className="flex items-center gap-1.5 flex-shrink-0 bg-zinc-950 px-2.5 py-1 rounded-xl border border-zinc-800">
                  <span
                    className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold border"
                    style={{ backgroundColor: startStyle.hex, color: startData?.decayMode === 'None' ? '#fff' : '#000' }}
                  >
                    {lvl.startIsotope.split('-')[0]}
                  </span>
                  <ArrowRight className="w-3 h-3 text-zinc-500" />
                  <span
                    className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold border ring-1 ring-amber-400"
                    style={{ backgroundColor: targetStyle.hex, color: targetData?.decayMode === 'None' ? '#fff' : '#000' }}
                  >
                    {lvl.targetIsotope.split('-')[0]}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-300 ml-1">{lvl.targetIsotope}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
