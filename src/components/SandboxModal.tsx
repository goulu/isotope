import React, { useState, useMemo } from 'react';
import { DecayMode } from '../types/isotope';
import { getDecayColor, formatHalfLife } from '../utils/physics';
import { X, Search, Sparkles, Filter } from 'lucide-react';

interface SandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIsotope: (isoId: string) => void;
  isotopesDB: Record<string, { protons: number; neutrons: number; halfLife: number; decayMode: DecayMode; name: string }>;
}

export const SandboxModal: React.FC<SandboxModalProps> = ({
  isOpen,
  onClose,
  onSelectIsotope,
  isotopesDB,
}) => {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<string>('all');

  const filteredIsotopes = useMemo(() => {
    const q = search.trim().toLowerCase();
    const entries = Object.entries(isotopesDB);

    return entries
      .filter(([id, data]) => {
        if (filterMode !== 'all' && data.decayMode !== filterMode) return false;
        if (!q) return true;
        return (
          id.toLowerCase().includes(q) ||
          data.name.toLowerCase().includes(q) ||
          `z=${data.protons}`.includes(q) ||
          `n=${data.neutrons}`.includes(q)
        );
      })
      .slice(0, 80); // limit to 80 for high performance
  }, [search, filterMode, isotopesDB]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Explorateur d'Isotopes</h2>
              <p className="text-xs text-zinc-400">Rechercher parmi plus de 3 500 nucléides réels</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-6 border-b border-zinc-800 space-y-3 bg-zinc-950/40">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Rechercher par symbole, nom ou Z (ex: U-238, Or, Pb-208, Z=92)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-500 mr-1 flex-shrink-0" />
            {[
              { id: 'all', label: 'Tous' },
              { id: 'None', label: 'Stables' },
              { id: 'Beta-', label: 'Bêta⁻' },
              { id: 'Beta+', label: 'Bêta⁺' },
              { id: 'Alpha', label: 'Alpha' },
              { id: 'Proton', label: 'Proton' },
              { id: 'Neutron', label: 'Neutron' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterMode(f.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${
                  filterMode === f.id
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Isotope Grid */}
        <div className="p-6 max-h-[50vh] overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {filteredIsotopes.map(([isoId, data]) => {
            const sym = isoId.split('-')[0];
            const mass = isoId.split('-')[1];
            const style = getDecayColor(data.decayMode);

            return (
              <button
                key={isoId}
                onClick={() => {
                  onSelectIsotope(isoId);
                  onClose();
                }}
                className="p-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-850 hover:bg-zinc-800 text-left transition-all flex items-center gap-2.5 group cursor-pointer"
              >
                <div
                  className="w-9 h-9 rounded-lg flex flex-col items-center justify-center flex-shrink-0 shadow-sm border"
                  style={{ backgroundColor: style.hex, borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  <span
                    className={`font-black text-xs leading-none ${
                      data.decayMode === 'None' ? 'text-white' : 'text-zinc-950'
                    }`}
                  >
                    {sym}
                  </span>
                  <span
                    className={`font-mono text-[9px] font-bold leading-none mt-0.5 ${
                      data.decayMode === 'None' ? 'text-zinc-400' : 'text-zinc-800'
                    }`}
                  >
                    {mass}
                  </span>
                </div>

                <div className="overflow-hidden">
                  <div className="font-bold text-xs text-white truncate group-hover:text-purple-300">
                    {data.name}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono truncate">
                    {formatHalfLife(data.halfLife)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
