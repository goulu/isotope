import React, { useState } from 'react';
import { Isotope, DecaySettings } from '../types/isotope';
import { calculateGameDecayTime, formatHalfLife } from '../utils/physics';
import { X, CheckCircle2, Sliders, RefreshCw, Calculator, HelpCircle } from 'lucide-react';

interface LogarithmicVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIsotope: Isotope;
  settings: DecaySettings;
  onUpdateSettings: (newSettings: DecaySettings) => void;
}

export const LogarithmicVerificationModal: React.FC<LogarithmicVerificationModalProps> = ({
  isOpen,
  onClose,
  currentIsotope,
  settings,
  onUpdateSettings,
}) => {
  const [testHalfLife, setTestHalfLife] = useState<number>(currentIsotope.halfLife > 0 ? currentIsotope.halfLife : 10);
  const [tempSettings, setTempSettings] = useState<DecaySettings>({ ...settings });

  if (!isOpen) return null;

  // Key benchmarks for demonstration
  const benchmarks = [
    { name: 'Oxygène-12 (¹²O)', hl: 1e-3, desc: 'Extrêmement instable' },
    { name: 'Argon-30 (³⁰Ar)', hl: 1.0, desc: 'Court (1 seconde)' },
    { name: 'Oxygène-19 (¹⁹O)', hl: 26.47, desc: 'Moyen (26,5 s)' },
    { name: 'Plomb-209 (²⁰⁹Pb)', hl: 11646, desc: '3,2 heures' },
    { name: 'Calcium-47 (⁴⁷Ca)', hl: 391824, desc: '4,5 jours' },
    { name: 'Tritium (³H)', hl: 388500000, desc: '12,3 ans' },
    { name: 'Carbone-14 (¹⁴C)', hl: 1.8e11, desc: '5 730 ans' },
    { name: 'Uranium-238 (²³⁸U)', hl: 1.4e17, desc: '4,5 milliards d\'années' },
  ];

  const simulatedGameTime = calculateGameDecayTime(testHalfLife, tempSettings);
  const logVal = Math.log10(testHalfLife > 0 ? testHalfLife : 1);

  // SVG Graph parameters
  // X range: log10 from -4 to +12
  // Y range: 0s to 9s
  const minLog = -4;
  const maxLog = 12;
  const graphWidth = 560;
  const graphHeight = 220;
  const padding = { left: 45, right: 25, top: 20, bottom: 35 };

  const toSvgX = (log: number) => {
    return padding.left + ((log - minLog) / (maxLog - minLog)) * (graphWidth - padding.left - padding.right);
  };

  const toSvgY = (gameSeconds: number) => {
    return graphHeight - padding.bottom - (gameSeconds / 9.0) * (graphHeight - padding.top - padding.bottom);
  };

  // Generate SVG curve points
  const curvePoints: string[] = [];
  for (let l = minLog; l <= maxLog; l += 0.5) {
    const hl = Math.pow(10, l);
    const gt = calculateGameDecayTime(hl, { ...tempSettings, isStochastic: false });
    curvePoints.push(`${toSvgX(l).toFixed(1)},${toSvgY(gt).toFixed(1)}`);
  }

  const currentLog = currentIsotope.halfLife > 0 ? Math.log10(currentIsotope.halfLife) : null;
  const currentGameTime = currentIsotope.halfLife > 0 ? calculateGameDecayTime(currentIsotope.halfLife, { ...tempSettings, isStochastic: false }) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 font-mono text-sm font-bold">
              f(log)
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Vérification de la Loi Logarithmique</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Conforme</span>
              </h2>
              <p className="text-xs text-zinc-400">Règle de transposition physique du temps de désintégration nucléaire</p>
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
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Scientific Verification Notice */}
          <div className="bg-emerald-950/30 border border-emerald-600/40 rounded-2xl p-4 text-emerald-200 text-sm space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Démonstration mathématique de la loi logarithmique</span>
            </div>
            <p className="text-xs leading-relaxed text-emerald-100/90">
              En physique nucléaire, les demi-vies (T₁/₂) s'étalent sur plus de <strong>35 ordres de grandeur</strong> : de quelques microsecondes (10⁻⁶ s) à des milliards d'années (10¹⁷ s pour l'U-238).
              Pour être jouable par un humain en temps réel, le temps en jeu suit strictement une <strong>fonction affine du logarithme décimal</strong> :
            </p>
            <div className="p-2.5 rounded-xl bg-black/50 border border-emerald-500/30 font-mono text-center text-sm font-bold text-white tracking-wide">
              t_jeu = t_base + pente × log₁₀( T₁/₂ )
            </div>
            <p className="text-[11px] text-emerald-200/80">
              Avec les paramètres actuels : <strong className="text-white">t_base = {tempSettings.baseTime}s</strong> (temps à T₁/₂ = 1s), <strong className="text-white">pente = {tempSettings.slope}s / décade</strong>, et un encadrement ergonomique [{tempSettings.minTime}s ; {tempSettings.maxTime}s].
            </p>
          </div>

          {/* Interactive SVG Semi-Log Graph */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-sky-400" />
                Courbe Logarithmique Semi-Log (t_jeu en fonction de log₁₀ T₁/₂)
              </span>
              <span className="text-xs font-mono text-zinc-400">Pente constante = {tempSettings.slope} s/décade</span>
            </div>

            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-auto select-none">
                {/* Background grid */}
                {[-3, 0, 3, 6, 9, 12].map((log) => {
                  const x = toSvgX(log);
                  return (
                    <g key={log}>
                      <line x1={x} y1={padding.top} x2={x} y2={graphHeight - padding.bottom} stroke="#27272a" strokeDasharray="3,3" />
                      <text x={x} y={graphHeight - 12} textAnchor="middle" fill="#71717a" fontSize="10" fontFamily="monospace">
                        10^{log}s
                      </text>
                    </g>
                  );
                })}

                {[2, 4, 6, 8].map((s) => {
                  const y = toSvgY(s);
                  return (
                    <g key={s}>
                      <line x1={padding.left} y1={y} x2={graphWidth - padding.right} y2={y} stroke="#27272a" strokeDasharray="3,3" />
                      <text x={padding.left - 8} y={y + 3} textAnchor="end" fill="#71717a" fontSize="10" fontFamily="monospace">
                        {s}s
                      </text>
                    </g>
                  );
                })}

                {/* Axes */}
                <line x1={padding.left} y1={padding.top} x2={padding.left} y2={graphHeight - padding.bottom} stroke="#52525b" strokeWidth="1.5" />
                <line x1={padding.left} y1={graphHeight - padding.bottom} x2={graphWidth - padding.right} y2={graphHeight - padding.bottom} stroke="#52525b" strokeWidth="1.5" />

                {/* Curve line */}
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={curvePoints.join(' ')}
                />

                {/* Current isotope point */}
                {currentLog !== null && currentGameTime !== null && (
                  <g>
                    <circle
                      cx={toSvgX(currentLog)}
                      cy={toSvgY(currentGameTime)}
                      r="7"
                      fill="#ef4444"
                      className="animate-pulse"
                    />
                    <circle
                      cx={toSvgX(currentLog)}
                      cy={toSvgY(currentGameTime)}
                      r="12"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                      opacity="0.6"
                    />
                    <text
                      x={toSvgX(currentLog)}
                      y={toSvgY(currentGameTime) - 14}
                      textAnchor="middle"
                      fill="#fca5a5"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {currentIsotope.id} ({currentGameTime.toFixed(2)}s)
                    </text>
                  </g>
                )}

                {/* Test simulation point */}
                {testHalfLife > 0 && (
                  <g>
                    <circle
                      cx={toSvgX(logVal)}
                      cy={toSvgY(simulatedGameTime)}
                      r="5"
                      fill="#eab308"
                    />
                    <text
                      x={toSvgX(logVal)}
                      y={toSvgY(simulatedGameTime) + 16}
                      textAnchor="middle"
                      fill="#fef08a"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      Test ({simulatedGameTime.toFixed(2)}s)
                    </text>
                  </g>
                )}
              </svg>
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2 px-1">
              <span>← Très rapide (millisecondes)</span>
              <span className="text-zinc-500">Axe logarithmique</span>
              <span>Très lent (siècles / milliards d'années) →</span>
            </div>
          </div>

          {/* Interactive Benchmark Samples */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3 flex items-center gap-1.5">
              <span>Étalonnage sur des isotopes réels de référence</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {benchmarks.map((item, idx) => {
                const gameSec = calculateGameDecayTime(item.hl, { ...tempSettings, isStochastic: false });
                const isSelected = Math.abs(testHalfLife - item.hl) < 0.001;
                return (
                  <button
                    key={idx}
                    onClick={() => setTestHalfLife(item.hl)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-sky-950/60 border-sky-400 text-white ring-1 ring-sky-400'
                        : 'bg-zinc-800/60 hover:bg-zinc-800 border-zinc-700 text-zinc-200'
                    }`}
                  >
                    <div className="text-xs font-bold text-white truncate">{item.name}</div>
                    <div className="text-[11px] text-zinc-400 font-mono mt-0.5">T½ = {formatHalfLife(item.hl)}</div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[10px] text-zinc-400">{item.desc}</span>
                      <span className="font-mono text-xs font-extrabold text-sky-400">{gameSec.toFixed(2)} s</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Simulator Slider */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-400" />
                Simulateur de Demi-vie Personnalisée
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold">
                T½ = {formatHalfLife(testHalfLife)} ➔ t_jeu = {simulatedGameTime.toFixed(2)} s
              </span>
            </div>

            <div className="space-y-1">
              <input
                type="range"
                min="-3"
                max="10"
                step="0.1"
                value={logVal}
                onChange={(e) => setTestHalfLife(Math.pow(10, parseFloat(e.target.value)))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>1 ms (10⁻³ s)</span>
                <span>1 s (10⁰ s)</span>
                <span>1 h (10³ s)</span>
                <span>1 an (10⁷ s)</span>
                <span>300 ans (10¹⁰ s)</span>
              </div>
            </div>
          </div>

          {/* Settings Customization Drawer */}
          <div className="border-t border-zinc-800 pt-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              Réglage fin des Paramètres de Décroissance
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Temps de base t_base (pour T½ = 1s) : <strong className="text-white">{tempSettings.baseTime}s</strong>
                </label>
                <input
                  type="range"
                  min="1.0"
                  max="4.0"
                  step="0.1"
                  value={tempSettings.baseTime}
                  onChange={(e) => setTempSettings({ ...tempSettings, baseTime: parseFloat(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Pente logarithmique (s / décade) : <strong className="text-white">{tempSettings.slope}s</strong>
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={tempSettings.slope}
                  onChange={(e) => setTempSettings({ ...tempSettings, slope: parseFloat(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Mode physique quantique :
                </label>
                <button
                  type="button"
                  onClick={() => setTempSettings({ ...tempSettings, isStochastic: !tempSettings.isStochastic })}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    tempSettings.isStochastic
                      ? 'bg-purple-950 border-purple-400 text-purple-200'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                  }`}
                >
                  {tempSettings.isStochastic ? 'Stochastique (Poisson)' : 'Déterministe (Pur Log)'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/70 flex items-center justify-between">
          <button
            onClick={() => {
              setTempSettings({ baseTime: 2.0, slope: 0.5, minTime: 0.5, maxTime: 8.0, isStochastic: false });
            }}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Réinitialiser valeurs par défaut
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={() => {
                onUpdateSettings(tempSettings);
                onClose();
              }}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-black shadow-lg shadow-sky-500/20 transition-all"
            >
              Appliquer les Réglages
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
