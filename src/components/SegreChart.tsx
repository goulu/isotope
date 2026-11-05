import React, { useRef, useState, useEffect } from 'react';
import { Isotope, DecayMode } from '../types/isotope';
import { getDecayColor, ELEMENT_SYMBOLS, formatHalfLife } from '../utils/physics';
import { Target, Compass, Maximize2, Minimize2 } from 'lucide-react';

interface SegreChartProps {
  currentIsotope: Isotope;
  targetIsotopeId: string | null;
  startIsotopeId: string | null;
  isotopesDB: Record<string, { protons: number; neutrons: number; halfLife: number; decayMode: DecayMode; name: string }>;
  decayTimeLeft: number;
  decayTimeTotal: number;
  decayFlash: boolean;
  onSelectIsotope?: (isoId: string) => void;
  projectileAnim: { type: 'neutron' | 'electron' | 'proton'; active: boolean } | null;
}

export const SegreChart: React.FC<SegreChartProps> = ({
  currentIsotope,
  targetIsotopeId,
  startIsotopeId,
  isotopesDB,
  decayTimeLeft,
  decayTimeTotal,
  decayFlash,
  onSelectIsotope,
  projectileAnim,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gridSpan, setGridSpan] = useState<number>(7); // 7x7 standard or 9x9 expanded
  const [hoveredIso, setHoveredIso] = useState<Isotope | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Auto-adjust grid span on mobile vs large desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setGridSpan(5); // 5x5 for compact phones
      } else if (window.innerWidth < 1024) {
        setGridSpan(7); // 7x7 for tablets
      } else {
        setGridSpan(7); // 7x7 standard
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const halfSpan = Math.floor(gridSpan / 2);
  const currP = currentIsotope.protons;
  const currN = currentIsotope.neutrons;

  // Build grid row indices (protons Z, top to bottom: currP + halfSpan down to currP - halfSpan)
  const pRows: number[] = [];
  for (let dP = halfSpan; dP >= -halfSpan; dP--) {
    pRows.push(currP + dP);
  }

  // Build grid col indices (neutrons N, left to right: currN - halfSpan up to currN + halfSpan)
  const nCols: number[] = [];
  for (let dN = -halfSpan; dN <= halfSpan; dN++) {
    nCols.push(currN + dN);
  }

  const handleCellHover = (iso: Isotope | null, e: React.MouseEvent) => {
    if (!iso) {
      setHoveredIso(null);
      setTooltipPos(null);
      return;
    }
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({
        x: Math.min(e.clientX - rect.left + 15, rect.width - 240),
        y: Math.max(10, e.clientY - rect.top - 120),
      });
    }
    setHoveredIso(iso);
  };

  const isCurrentUnstable = currentIsotope.halfLife !== -1;
  const progressRatio = decayTimeTotal > 0 ? Math.max(0, Math.min(1, decayTimeLeft / decayTimeTotal)) : 0;

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-3xl bg-zinc-950/90 border border-zinc-800/80 p-3 sm:p-5 shadow-2xl backdrop-blur-md overflow-hidden select-none transition-all duration-200 ${
        decayFlash ? 'ring-4 ring-red-500/80 bg-red-950/30' : ''
      }`}
    >
      {/* Background Subtle Tech Grid & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf812_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-50" />

      {/* Header controls: Coordinate axes legend & zoom toggle */}
      <div className="relative z-10 flex items-center justify-between mb-3 text-xs text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-mono text-[11px] bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <strong className="text-zinc-200">Carte de Segrè</strong> (Z ↑ vertical, N → horizontal)
          </span>
          <span className="hidden sm:inline font-mono text-[11px] text-zinc-400">
            Centre : <span className="text-sky-300 font-bold">{currentIsotope.symbol}-{currentIsotope.mass}</span> (Z={currP}, N={currN})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setGridSpan(gridSpan === 7 ? 9 : 7)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[11px] transition-colors"
            title="Ajuster la taille du champ de vision"
          >
            {gridSpan === 7 ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            <span>Grille {gridSpan}×{gridSpan}</span>
          </button>
        </div>
      </div>

      {/* Main Segre Chart Grid */}
      <div className="relative z-10 flex flex-col items-center justify-center overflow-x-auto py-2">
        <div className="inline-block">
          {pRows.map((z) => {
            const elInfo = ELEMENT_SYMBOLS[z];
            return (
              <div key={z} className="flex items-center gap-1 sm:gap-1.5 my-1 sm:my-1.5">
                {/* Y Axis Label (Z / Protons and Chemical Symbol) */}
                <div
                  className={`w-10 sm:w-12 text-right pr-2 font-mono text-[11px] flex-shrink-0 flex flex-col items-end leading-tight ${
                    z === currP ? 'text-sky-400 font-bold' : 'text-zinc-400'
                  }`}
                >
                  <span className="font-sans font-bold text-xs">{elInfo?.symbol || `Z${z}`}</span>
                  <span className="text-[9px] opacity-70">Z={z}</span>
                </div>

                {/* Nuclide Cells in Row */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {nCols.map((n) => {
                    const mass = z + n;
                    const sym = elInfo?.symbol || 'X';
                    const isoId = `${sym}-${mass}`;
                    const rawData = isotopesDB[isoId];
                    const isCenter = z === currP && n === currN;
                    const isTarget = targetIsotopeId === isoId;
                    const isStart = startIsotopeId === isoId;

                    if (!rawData || z < 1 || n < 0) {
                      // Empty / unbound nuclide state
                      return (
                        <div
                          key={`${z}-${n}`}
                          className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl border border-zinc-800/40 bg-zinc-900/30 flex items-center justify-center opacity-30 text-[9px] font-mono text-zinc-700"
                        >
                          ·
                        </div>
                      );
                    }

                    const iso: Isotope = {
                      id: isoId,
                      symbol: sym,
                      mass,
                      protons: z,
                      neutrons: n,
                      halfLife: rawData.halfLife,
                      decayMode: rawData.decayMode,
                      name: rawData.name,
                    };

                    const decayStyle = getDecayColor(iso.decayMode);

                    return (
                      <div
                        key={isoId}
                        onClick={() => onSelectIsotope && onSelectIsotope(isoId)}
                        onMouseEnter={(e) => handleCellHover(iso, e)}
                        onMouseLeave={() => handleCellHover(null, {} as React.MouseEvent)}
                        className={`relative w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-150 transform hover:scale-105 active:scale-95 ${
                          isCenter
                            ? 'ring-4 ring-sky-400 shadow-lg shadow-sky-500/40 z-20 scale-105'
                            : isTarget
                            ? 'ring-3 ring-amber-400 shadow-md shadow-amber-500/30 z-10'
                            : 'hover:ring-2 hover:ring-zinc-400 z-0'
                        }`}
                        style={{
                          backgroundColor: decayStyle.hex,
                          borderWidth: isCenter ? '2px' : isTarget ? '2px' : '1px',
                          borderColor: isCenter ? '#38bdf8' : isTarget ? '#f59e0b' : 'rgba(255,255,255,0.25)',
                        }}
                      >
                        {/* Target badge indicator */}
                        {isTarget && (
                          <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black rounded-full p-0.5 shadow-md">
                            <Target className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}

                        {/* Start badge indicator */}
                        {isStart && !isTarget && !isCenter && (
                          <div className="absolute -top-1.5 -left-1.5 bg-emerald-500 text-black rounded-full px-1 py-0.2 text-[8px] font-bold shadow-md">
                            DÉPART
                          </div>
                        )}

                        {/* Active Cell: Live Countdown Progress Aura */}
                        {isCenter && isCurrentUnstable && (
                          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5">
                            <circle
                              cx="50%"
                              cy="50%"
                              r="42%"
                              stroke="rgba(255,255,255,0.2)"
                              strokeWidth="3"
                              fill="none"
                            />
                            <circle
                              cx="50%"
                              cy="50%"
                              r="42%"
                              stroke={decayTimeLeft <= 1.0 ? '#ef4444' : '#ffffff'}
                              strokeWidth="3"
                              fill="none"
                              strokeDasharray="260"
                              strokeDashoffset={260 * (1 - progressRatio)}
                              strokeLinecap="round"
                              className="transition-all duration-75"
                            />
                          </svg>
                        )}

                        {/* Cell Content: Element Symbol & Mass Number */}
                        <span
                          className={`font-black text-xs sm:text-sm tracking-tight leading-none ${
                            iso.decayMode === 'None' ? 'text-white' : 'text-zinc-950'
                          }`}
                        >
                          {iso.symbol}
                        </span>
                        <span
                          className={`font-mono text-[9px] sm:text-[11px] font-bold leading-none mt-0.5 ${
                            iso.decayMode === 'None' ? 'text-zinc-300' : 'text-zinc-900'
                          }`}
                        >
                          {iso.mass}
                        </span>

                        {/* If center & unstable: mini rapid countdown on tile */}
                        {isCenter && isCurrentUnstable && (
                          <span className="absolute -bottom-2 bg-red-600 text-white font-mono text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-md animate-pulse">
                            {decayTimeLeft.toFixed(1)}s
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* X Axis Label (N / Neutrons) */}
          <div className="flex items-center gap-1 sm:gap-1.5 mt-2">
            <div className="w-10 sm:w-12 text-right pr-2 font-mono text-[10px] text-zinc-400 flex-shrink-0">
              N →
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              {nCols.map((n) => (
                <div
                  key={n}
                  className={`w-10 sm:w-14 text-center font-mono text-[10px] ${
                    n === currN ? 'text-sky-400 font-bold' : 'text-zinc-400'
                  }`}
                >
                  {n}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Particle Beam Shoot Animation */}
      {projectileAnim && projectileAnim.active && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div
            className={`w-4 h-4 rounded-full animate-ping shadow-2xl ${
              projectileAnim.type === 'neutron'
                ? 'bg-sky-400 ring-4 ring-sky-300'
                : projectileAnim.type === 'electron'
                ? 'bg-fuchsia-400 ring-4 ring-fuchsia-300'
                : 'bg-orange-400 ring-4 ring-orange-300'
            }`}
          />
        </div>
      )}

      {/* Floating Hover Tooltip */}
      {hoveredIso && tooltipPos && (
        <div
          className="absolute z-40 bg-zinc-900/95 border border-zinc-700 p-3 rounded-2xl shadow-2xl backdrop-blur-md pointer-events-none w-60 text-xs"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-800">
            <span className="font-bold text-white text-sm">
              {hoveredIso.name} ({hoveredIso.symbol}-{hoveredIso.mass})
            </span>
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-bold"
              style={{
                backgroundColor: `${getDecayColor(hoveredIso.decayMode).hex}33`,
                color: getDecayColor(hoveredIso.decayMode).hex,
              }}
            >
              {hoveredIso.decayMode === 'None' ? 'Stable' : hoveredIso.decayMode}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 text-[11px] text-zinc-300 font-mono mb-2">
            <div>Protons (Z) : <strong className="text-white">{hoveredIso.protons}</strong></div>
            <div>Neutrons (N) : <strong className="text-white">{hoveredIso.neutrons}</strong></div>
            <div>Masse (A) : <strong className="text-white">{hoveredIso.mass}</strong></div>
            <div>Électrons : <strong className="text-white">{hoveredIso.protons}</strong></div>
          </div>

          <div className="pt-1.5 border-t border-zinc-800 text-[11px] space-y-0.5">
            <div className="text-zinc-400">
              Demi-vie réelle : <span className="text-sky-300 font-mono font-medium">{formatHalfLife(hoveredIso.halfLife)}</span>
            </div>
            {hoveredIso.halfLife !== -1 && (
              <div className="text-zinc-400">
                Mode de décroissance : <span className="text-amber-300 font-medium">{getDecayColor(hoveredIso.decayMode).nameFr}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decay Mode Color Legend (Integrated at bottom of chart) */}
      <div className="mt-3 pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px] text-zinc-300">
        <span className="text-zinc-400 font-medium text-[10px] uppercase tracking-wider">Modes :</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-black border border-zinc-500" />
          <span>Stable</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-sky-400" />
          <span>Bêta⁻ (β⁻)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-pink-400" />
          <span>Bêta⁺ (β⁺)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-yellow-300" />
          <span>Alpha (α)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-orange-400" />
          <span>Proton (p)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-purple-400" />
          <span>Neutron (n)</span>
        </div>
      </div>
    </div>
  );
};
