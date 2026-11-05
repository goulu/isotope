import React from 'react';
import { Isotope, DecaySettings } from '../types/isotope';
import { getDecayColor, formatHalfLife } from '../utils/physics';
import { Play, Pause, AlertTriangle, Zap, Volume2, VolumeX, FastForward } from 'lucide-react';

interface RapidCountdownProps {
  currentIsotope: Isotope;
  decayTimeTotal: number; // in seconds
  decayTimeLeft: number; // in seconds
  isPaused: boolean;
  onTogglePause: () => void;
  speed: number;
  onChangeSpeed: (spd: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  settings: DecaySettings;
  onOpenPhysicsModal: () => void;
}

export const RapidCountdown: React.FC<RapidCountdownProps> = ({
  currentIsotope,
  decayTimeTotal,
  decayTimeLeft,
  isPaused,
  onTogglePause,
  speed,
  onChangeSpeed,
  isMuted,
  onToggleMute,
  onOpenPhysicsModal,
}) => {
  const isStable = currentIsotope.halfLife === -1;
  const decayColor = getDecayColor(currentIsotope.decayMode);

  if (isStable) {
    return (
      <div className="bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
            ✓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">État de Stabilité</span>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">Stable</span>
            </div>
            <div className="text-white text-base font-bold flex items-center gap-2">
              <span>{currentIsotope.name}</span>
              <span className="text-zinc-400 font-mono text-sm">({currentIsotope.symbol}-{currentIsotope.mass})</span>
            </div>
            <div className="text-xs text-zinc-400">Demi-vie infinie • Aucun risque de désintégration spontanée</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPhysicsModal}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors border border-zinc-700 flex items-center gap-1.5"
            title="Vérifier la loi logarithmique"
          >
            <span className="text-sky-400 font-mono text-xs">f(log T½)</span>
            <span>Loi Logarithmique</span>
          </button>
          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
            title={isMuted ? 'Activer le son' : 'Couper le son'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>
    );
  }

  // Radioactive: Calculate progress
  const progressRatio = decayTimeTotal > 0 ? Math.max(0, Math.min(1, decayTimeLeft / decayTimeTotal)) : 0;
  const percentage = Math.round(progressRatio * 100);

  // Determine urgency state
  const isCritical = decayTimeLeft <= 1.0 || progressRatio < 0.25;
  const isWarning = !isCritical && progressRatio < 0.55;

  const statusColor = isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-sky-400';
  const strokeColor = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#38bdf8';
  const ringBgColor = isCritical ? 'bg-red-500/10 border-red-500/30' : isWarning ? 'bg-amber-500/10 border-amber-500/30' : 'bg-sky-500/10 border-sky-500/30';

  // SVG circular radius
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div
      className={`rounded-2xl p-4 shadow-2xl backdrop-blur-md transition-all duration-300 border ${
        isCritical
          ? 'bg-red-950/40 border-red-500/60 shadow-red-500/20 ring-1 ring-red-500/30'
          : isWarning
          ? 'bg-amber-950/30 border-amber-500/50 shadow-amber-500/10'
          : 'bg-zinc-900/90 border-zinc-700/80 shadow-black/50'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Circular gauge & rapid countdown readout */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Circular Countdown Progress Ring */}
          <div className="relative flex-shrink-0 w-20 h-20 flex items-center justify-center">
            <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="#27272a"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke={strokeColor}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-75 ease-linear"
              />
            </svg>

            {/* Inner dynamic readout or warning icon */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {isCritical ? (
                <div className="flex flex-col items-center animate-pulse">
                  <AlertTriangle className="w-5 h-5 text-red-400 mb-0.5" />
                  <span className="text-[10px] font-black text-red-300 tracking-tighter">ALERTE</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-xs font-black font-mono text-zinc-100">{percentage}%</span>
                  <span className="text-[9px] text-zinc-400 font-mono">temps</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Rapid Countdown Text */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md ${ringBgColor} ${statusColor}`}>
                <Zap className="w-3 h-3" />
                DÉSINTÉGRATION IMMINENTE
              </span>
              <span
                className="px-2 py-0.5 text-[11px] font-bold rounded-md border"
                style={{
                  backgroundColor: `${decayColor.hex}22`,
                  color: decayColor.hex,
                  borderColor: `${decayColor.hex}66`,
                }}
              >
                Mode {currentIsotope.decayMode}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              {/* Millisecond precision timer */}
              <div className={`font-mono text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums ${statusColor}`}>
                {decayTimeLeft.toFixed(2)}
                <span className="text-lg font-semibold ml-1">s</span>
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                / {decayTimeTotal.toFixed(2)}s jeu
              </span>
            </div>

            <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5 flex-wrap">
              <span>Demi-vie réelle :</span>
              <span className="text-zinc-200 font-mono font-medium">{formatHalfLife(currentIsotope.halfLife)}</span>
              <span className="text-zinc-500">•</span>
              <button
                onClick={onOpenPhysicsModal}
                className="text-sky-400 hover:text-sky-300 underline font-mono text-xs flex items-center gap-1"
              >
                Loi log : 2.0 + 0.5×log₁₀(T½)
              </button>
            </div>
          </div>
        </div>

        {/* Right: Quick Ergonomic Controls (Pause, Speed, Mute, Law inspector) */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-800">
          {/* Pause / Resume button */}
          <button
            onClick={onTogglePause}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              isPaused
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-700/30 ring-2 ring-emerald-400'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
            }`}
            title="Mettre en pause (Espace)"
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
            <span>{isPaused ? 'Reprendre' : 'Pause'}</span>
          </button>

          {/* Speed toggles */}
          <div className="flex items-center bg-zinc-800 border border-zinc-700 rounded-xl p-0.5">
            {[0.5, 1.0, 2.0].map((spd) => (
              <button
                key={spd}
                onClick={() => onChangeSpeed(spd)}
                className={`px-2 py-1 text-xs font-mono rounded-lg transition-colors ${
                  speed === spd
                    ? 'bg-sky-600 text-white font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title={`Vitesse ${spd}x`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Sound Mute */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors"
            title={isMuted ? 'Activer le son' : 'Couper le son'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Physics verification button */}
          <button
            onClick={onOpenPhysicsModal}
            className="px-3 py-2 text-xs font-medium rounded-xl bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/60 transition-colors flex items-center gap-1"
            title="Inspecter la formule et la courbe logarithmique"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Vérifier</span> Loi
          </button>
        </div>
      </div>

      {/* Real-time horizontal countdown indicator stripe */}
      <div className="mt-3 w-full bg-zinc-800/80 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-75 ease-linear ${
            isCritical
              ? 'bg-gradient-to-r from-red-500 to-rose-400'
              : isWarning
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
              : 'bg-gradient-to-r from-sky-500 to-cyan-400'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
