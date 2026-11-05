import React from 'react';
import { LevelData, DecayMode } from '../types/isotope';
import { getDecayColor } from '../utils/physics';
import { X, BookOpen, Atom, ArrowRight, Lightbulb } from 'lucide-react';

interface LevelStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: LevelData;
  isotopesDB: Record<string, { protons: number; neutrons: number; halfLife: number; decayMode: DecayMode; name: string }>;
}

export const LevelStoryModal: React.FC<LevelStoryModalProps> = ({
  isOpen,
  onClose,
  level,
  isotopesDB,
}) => {
  if (!isOpen) return null;

  const startData = isotopesDB[level.startIsotope];
  const targetData = isotopesDB[level.targetIsotope];
  const startStyle = getDecayColor(startData?.decayMode || 'None');
  const targetStyle = getDecayColor(targetData?.decayMode || 'None');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                Niveau {level.id}
              </div>
              <h2 className="text-lg font-bold text-white">{level.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Objective Banner */}
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border"
                style={{ backgroundColor: startStyle.hex, color: startData?.decayMode === 'None' ? '#fff' : '#000' }}
              >
                {level.startIsotope.split('-')[0]}
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase font-bold">Départ</span>
                <span className="text-sm font-mono font-bold text-white">{level.startIsotope}</span>
              </div>
            </div>

            <ArrowRight className="w-5 h-5 text-zinc-500" />

            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border ring-2 ring-amber-400"
                style={{ backgroundColor: targetStyle.hex, color: targetData?.decayMode === 'None' ? '#fff' : '#000' }}
              >
                {level.targetIsotope.split('-')[0]}
              </div>
              <div>
                <span className="text-[10px] text-amber-400 block uppercase font-bold">Cible</span>
                <span className="text-sm font-mono font-bold text-amber-300">{level.targetIsotope}</span>
              </div>
            </div>
          </div>

          {/* Detailed Story / Pedagogical Note */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Explication & Stratégie Nucléaire
            </h3>
            <p className="text-sm leading-relaxed text-zinc-300 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/80">
              {level.description}
            </p>
          </div>

          {/* Resources & Rules */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <span className="text-zinc-400 block mb-1">Neutrons alloués :</span>
              <span className="font-mono font-bold text-sky-400 text-sm">
                {level.maxNeutrons} ⚛ ({level.maxNeutrons > 0 ? 'Disponible' : 'Aucun'})
              </span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <span className="text-zinc-400 block mb-1">Électrons alloués :</span>
              <span className="font-mono font-bold text-fuchsia-400 text-sm">
                {level.maxElectrons} ⚡ ({level.maxElectrons > 0 ? 'Disponible' : 'Aucun'})
              </span>
            </div>
          </div>

          {/* Hotkey reminder */}
          <div className="bg-sky-950/30 border border-sky-800/50 p-3 rounded-xl text-sky-200 text-xs flex items-center gap-2">
            <Atom className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span>
              <strong>Astuce :</strong> Utilisez la touche <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded font-mono text-[11px]">N</kbd> pour le neutron, <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded font-mono text-[11px]">E</kbd> pour l'électron, et <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded font-mono text-[11px]">Espace</kbd> pour la pause.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-black shadow-lg shadow-sky-500/20 transition-all"
          >
            Compris, c'est parti !
          </button>
        </div>
      </div>
    </div>
  );
};
