/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Isotope, LevelData, DecaySettings, DecayMode, DecayEvent } from './types/isotope';
import {
  calculateGameDecayTime,
  DEFAULT_DECAY_SETTINGS,
  ELEMENT_SYMBOLS,
  getDecayReaction,
} from './utils/physics';
import { sound } from './utils/audio';
import { TitleBanner } from './components/TitleBanner';
import { LevelBar } from './components/LevelBar';
import { SegreChart } from './components/SegreChart';
import { ControlPanel } from './components/ControlPanel';
import { LogarithmicVerificationModal } from './components/LogarithmicVerificationModal';
import { LevelSelectorModal } from './components/LevelSelectorModal';
import { LevelStoryModal } from './components/LevelStoryModal';
import { SandboxModal } from './components/SandboxModal';
import { Volume2, VolumeX } from 'lucide-react';
import { useI18n, LANGUAGES } from './i18n';
import { Language } from './types/isotope';

export default function App() {
  const { t, lang, setLang } = useI18n();
  // Database state
  const [isotopesDB, setIsotopesDB] = useState<Record<string, { protons: number; neutrons: number; halfLife: number; decayMode: DecayMode; name: string }>>({});
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Gameplay state
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentIsotope, setCurrentIsotope] = useState<Isotope | null>(null);
  const [remainingNeutrons, setRemainingNeutrons] = useState(0);
  const [maxNeutrons, setMaxNeutrons] = useState(0);
  const [remainingElectrons, setRemainingElectrons] = useState(0);
  const [maxElectrons, setMaxElectrons] = useState(0);
  const [remainingProtons, setRemainingProtons] = useState(0);
  const [maxProtons, setMaxProtons] = useState(0);

  // Real-time decay countdown state
  const [decayTimeTotal, setDecayTimeTotal] = useState(0);
  const [decayTimeLeft, setDecayTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [decayFlash, setDecayFlash] = useState(false);

  // Game over & progression
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());
  const [gridSpan, setGridSpan] = useState<number>(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 5 : 7
  );
  const [isSandbox, setIsSandbox] = useState(false);

  // Settings & Logs
  const [decaySettings, setDecaySettings] = useState<DecaySettings>(DEFAULT_DECAY_SETTINGS);
  const [isMuted, setIsMuted] = useState(false);
  const [decayHistory, setDecayHistory] = useState<DecayEvent[]>([]);
  const [projectileAnim, setProjectileAnim] = useState<{ type: 'neutron' | 'electron' | 'proton'; active: boolean } | null>(null);

  // Modals
  const [isPhysicsModalOpen, setIsPhysicsModalOpen] = useState(false);
  const [isLevelSelectorOpen, setIsLevelSelectorOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isSandboxModalOpen, setIsSandboxModalOpen] = useState(false);

  // Geiger ticking timer reference
  const lastGeigerTickRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Load datasets on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [isoRes, lvlRes] = await Promise.all([
          fetch(`${import.meta.env.BASE_URL}isotopes.json`),
          fetch(`${import.meta.env.BASE_URL}levels.json`),
        ]);
        const isoData = await isoRes.json();
        const lvlData = await lvlRes.json();

        setIsotopesDB(isoData);
        setLevels(lvlData);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load nuclear datasets:', err);
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Set active isotope
  const setElement = useCallback(
    (isoId: string, customDecayTime?: number) => {
      const raw = isotopesDB[isoId];
      if (!raw) {
        console.warn(`Isotope ${isoId} not found in database.`);
        return;
      }

      const sym = isoId.split('-')[0];
      const mass = raw.protons + raw.neutrons;
      const iso: Isotope = {
        id: isoId,
        symbol: sym,
        mass,
        protons: raw.protons,
        neutrons: raw.neutrons,
        halfLife: raw.halfLife,
        decayMode: raw.decayMode,
        name: raw.name,
      };

      setCurrentIsotope(iso);

      if (raw.halfLife !== -1) {
        const tGame = customDecayTime ?? calculateGameDecayTime(raw.halfLife, decaySettings);
        setDecayTimeTotal(tGame);
        setDecayTimeLeft(tGame);
      } else {
        setDecayTimeTotal(0);
        setDecayTimeLeft(0);
      }
    },
    [isotopesDB, decaySettings]
  );

  // Initialize or restart level
  const loadLevel = useCallback(
    (index: number) => {
      if (!levels || levels.length === 0) return;
      const safeIndex = Math.max(0, Math.min(levels.length - 1, index));
      setCurrentLevelIndex(safeIndex);
      const lvl = levels[safeIndex];

      setIsGameOver(false);
      setIsVictory(false);
      setIsPaused(false);
      setMaxNeutrons(lvl.maxNeutrons ?? 0);
      setRemainingNeutrons(lvl.maxNeutrons ?? 0);
      setMaxElectrons(lvl.maxElectrons ?? 0);
      setRemainingElectrons(lvl.maxElectrons ?? 0);
      setMaxProtons(lvl.maxProtons ?? 0);
      setRemainingProtons(lvl.maxProtons ?? 0);
      setDecayHistory([]);

      setElement(lvl.startIsotope);
    },
    [levels, setElement]
  );

  // Initial load once database is available
  useEffect(() => {
    if (!isLoading && levels.length > 0 && Object.keys(isotopesDB).length > 0) {
      loadLevel(0);
    }
  }, [isLoading, levels, isotopesDB, loadLevel]);

  // Transmutation trigger
  const transmute = useCallback(
    (newProtons: number, newNeutrons: number, projectileType?: 'neutron' | 'electron' | 'proton') => {
      if (projectileType) {
        setProjectileAnim({ type: projectileType, active: true });
        setTimeout(() => setProjectileAnim(null), 250);
      }

      const sym = ELEMENT_SYMBOLS[newProtons]?.symbol || 'X';
      const mass = newProtons + newNeutrons;
      const nextId = `${sym}-${mass}`;

      if (isotopesDB[nextId]) {
        setElement(nextId);
      } else {
        console.warn(`Nuclide configuration ${nextId} is physically unviable/untracked!`);
      }
    },
    [isotopesDB, setElement]
  );

  // Automatic spontaneous decay trigger
  const triggerDecay = useCallback(() => {
    if (!currentIsotope || currentIsotope.halfLife === -1) return;

    sound.playDecayExplosion();
    setDecayFlash(true);
    setTimeout(() => setDecayFlash(false), 200);

    const reaction = getDecayReaction(currentIsotope, isotopesDB);

    setDecayHistory((prev) => [
      {
        fromIsotope: currentIsotope.id,
        toIsotope: reaction.nextIsotopeId,
        decayMode: currentIsotope.decayMode,
        emittedParticle: reaction.emittedParticle,
        timestamp: Date.now(),
      },
      ...prev.slice(0, 9),
    ]);

    transmute(reaction.nextProtons, reaction.nextNeutrons);
  }, [currentIsotope, isotopesDB, transmute]);

  // Check victory / failure conditions
  useEffect(() => {
    if (isSandbox || !currentIsotope || isGameOver || levels.length === 0) return;
    const currentLevel = levels[currentLevelIndex];
    if (!currentLevel) return;

    // Victory: Reached target isotope and it is stable!
    if (currentIsotope.id === currentLevel.targetIsotope && currentIsotope.halfLife === -1) {
      setIsGameOver(true);
      setIsVictory(true);
      sound.playVictory();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setCompletedLevels((prev) => new Set([...prev, currentLevel.id]));
      return;
    }

    // Failure: Isotope is stable, not target, and user has 0 resources left
    if (
      currentIsotope.halfLife === -1 &&
      currentIsotope.id !== currentLevel.targetIsotope &&
      remainingNeutrons === 0 &&
      remainingElectrons === 0 &&
      remainingProtons === 0
    ) {
      setIsGameOver(true);
      setIsVictory(false);
      sound.playDefeat();
    }
  }, [
    currentIsotope,
    currentLevelIndex,
    levels,
    remainingNeutrons,
    remainingElectrons,
    remainingProtons,
    isGameOver,
    isSandbox,
  ]);

  // 60FPS Game Loop for Rapid Countdown & Geiger clicks
  useEffect(() => {
    if (isPaused || isGameOver || !currentIsotope || currentIsotope.halfLife === -1) {
      lastTimeRef.current = null;
      return;
    }

    const updateFrame = (time: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }
      const rawDt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      const dt = Math.min(rawDt, 0.05) * speed;

      setDecayTimeLeft((prev) => {
        const next = prev - dt;

        // Accelerating Geiger click feedback as decay timer runs out
        const urgencyRatio = decayTimeTotal > 0 ? next / decayTimeTotal : 1;
        const tickIntervalMs = urgencyRatio < 0.25 ? 120 : urgencyRatio < 0.5 ? 280 : 600;
        if (time - lastGeigerTickRef.current > tickIntervalMs) {
          lastGeigerTickRef.current = time;
          sound.playGeigerClick(urgencyRatio < 0.25 ? 0.6 : 0.3);
        }

        if (next <= 0) {
          triggerDecay();
          return 0;
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(updateFrame);
    };

    animFrameRef.current = requestAnimationFrame(updateFrame);
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPaused, isGameOver, currentIsotope, speed, decayTimeTotal, triggerDecay]);

  // Action: Shoot Neutron (+n)
  const handleShootNeutron = () => {
    if (isGameOver || (!isSandbox && remainingNeutrons <= 0) || !currentIsotope) return;
    if (!isSandbox) setRemainingNeutrons((prev) => prev - 1);
    sound.playNeutronShoot();
    transmute(currentIsotope.protons, currentIsotope.neutrons + 1, 'neutron');
  };

  // Action: Capture Electron (+e-) -> p + e- -> n + nu
  const handleShootElectron = () => {
    if (isGameOver || (!isSandbox && remainingElectrons <= 0) || !currentIsotope) return;
    if (!isSandbox) setRemainingElectrons((prev) => prev - 1);
    sound.playElectronShoot();
    transmute(currentIsotope.protons - 1, currentIsotope.neutrons + 1, 'electron');
  };

  // Action: Shoot Proton (+p)
  const handleShootProton = () => {
    if (isGameOver || (!isSandbox && remainingProtons <= 0) || !currentIsotope) return;
    if (!isSandbox) setRemainingProtons((prev) => prev - 1);
    sound.playProtonShoot();
    transmute(currentIsotope.protons + 1, currentIsotope.neutrons, 'proton');
  };

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid if user is typing in search
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'n' || e.key === 'N' || e.key === 'ArrowRight') {
        handleShootNeutron();
      } else if (e.key === 'e' || e.key === 'E' || e.key === 'ArrowDown') {
        handleShootElectron();
      } else if (e.key === 'p' || e.key === 'P' || e.key === 'ArrowUp') {
        handleShootProton();
      } else if (e.key === 'r' || e.key === 'R') {
        loadLevel(currentLevelIndex);
      } else if (e.key === 'Escape') {
        setIsPhysicsModalOpen(false);
        setIsLevelSelectorOpen(false);
        setIsStoryModalOpen(false);
        setIsSandboxModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const currentLevel = levels[currentLevelIndex] || null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white font-mono">
        <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold">{t('loadingTitle')}</h2>
        <p className="text-xs text-zinc-500 mt-1">{t('loadingSubtitle')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col selection:bg-sky-500 selection:text-black">
      {/* Main Game Shell Container - 100% width on smartphone, identical width for all blocks */}
      <main className="w-full max-w-6xl mx-auto px-0 sm:px-3 py-1 sm:py-2 flex-1 flex flex-col gap-1.5 sm:gap-2.5 justify-start">
        {/* Top Navigation & Brand Header */}
        <header className="w-full border border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md rounded-2xl px-2.5 sm:px-4 py-1.5 sm:py-2 sticky top-0 z-30 shadow-lg">
          <div className="w-full flex items-center justify-between gap-1">
            <div className="flex items-center gap-2">
              <TitleBanner
                isotopesDB={isotopesDB}
                onInspectIsotope={(id) => {
                  if (isSandbox) setElement(id);
                }}
              />
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() =>
                  setGridSpan((prev) => (prev === 5 ? 7 : prev === 7 ? (window.innerWidth < 640 ? 5 : 9) : 7))
                }
                className="px-2 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[11px] sm:text-xs font-mono font-bold transition-colors flex items-center justify-center"
                title={t('adjustGridSize')}
              >
                <span>{gridSpan}×{gridSpan}</span>
              </button>

              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Language)}
                aria-label="Language"
                className="px-1.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-[11px] sm:text-xs font-mono font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  const nextMuted = !isMuted;
                  setIsMuted(nextMuted);
                  sound.setMuted(nextMuted);
                }}
                className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
                title={isMuted ? t('unmute') : t('mute')}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                onClick={() => setIsPhysicsModalOpen(true)}
                className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-sky-400 border border-sky-500/30 text-sm font-mono font-extrabold transition-all shadow-sm flex items-center justify-center"
                title="?"
              >
                ?
              </button>
            </div>
          </div>
        </header>

        {/* 1. Level Status & Objective Bar (Entre la barre de titre et la grille de jeu) */}
        <LevelBar
          currentLevel={currentLevel}
          levelIndex={currentLevelIndex}
          totalLevels={levels.length}
          isSandbox={isSandbox}
          onToggleSandbox={() => setIsSandbox((prev) => !prev)}
          onOpenStory={() => {
            if (isSandbox) {
              setIsSandboxModalOpen(true);
            } else {
              setIsStoryModalOpen(true);
            }
          }}
          onOpenLevelSelector={() => setIsLevelSelectorOpen(true)}
          isGameOver={isGameOver}
          isVictory={isVictory}
          isotopesDB={isotopesDB}
        />

        {/* 2. Central Segre Chart (Grille du jeu) */}
        {currentIsotope && (
          <SegreChart
            currentIsotope={currentIsotope}
            targetIsotopeId={isSandbox ? null : currentLevel?.targetIsotope || null}
            startIsotopeId={isSandbox ? null : currentLevel?.startIsotope || null}
            isotopesDB={isotopesDB}
            decayTimeLeft={decayTimeLeft}
            decayTimeTotal={decayTimeTotal}
            decayFlash={decayFlash}
            projectileAnim={projectileAnim}
            gridSpan={gridSpan}
            onSelectIsotope={(id) => {
              if (isSandbox) setElement(id);
            }}
          />
        )}

        {/* 3. Action & Bombardment Controls (Boutons d'action particules en dessous) */}
        <ControlPanel
          remainingNeutrons={remainingNeutrons}
          maxNeutrons={maxNeutrons}
          remainingElectrons={remainingElectrons}
          maxElectrons={maxElectrons}
          remainingProtons={remainingProtons}
          maxProtons={maxProtons}
          isGameOver={isGameOver}
          isVictory={isVictory}
          onShootNeutron={handleShootNeutron}
          onShootElectron={handleShootElectron}
          onShootProton={handleShootProton}
          onRestart={() => loadLevel(currentLevelIndex)}
          onNextLevel={() => loadLevel(currentLevelIndex + 1)}
          onOpenStory={() => setIsStoryModalOpen(true)}
          onOpenLevelSelector={() => setIsLevelSelectorOpen(true)}
          hasNextLevel={currentLevelIndex < levels.length - 1}
          isSandbox={isSandbox}
        />
      </main>

      {/* Modals */}
      {currentIsotope && (
        <LogarithmicVerificationModal
          isOpen={isPhysicsModalOpen}
          onClose={() => setIsPhysicsModalOpen(false)}
          currentIsotope={currentIsotope}
          settings={decaySettings}
          onUpdateSettings={(newSettings) => {
            setDecaySettings(newSettings);
            if (currentIsotope.halfLife !== -1) {
              const t = calculateGameDecayTime(currentIsotope.halfLife, newSettings);
              setDecayTimeTotal(t);
              setDecayTimeLeft(t);
            }
          }}
        />
      )}

      <LevelSelectorModal
        isOpen={isLevelSelectorOpen}
        onClose={() => setIsLevelSelectorOpen(false)}
        levels={levels}
        currentLevelIndex={currentLevelIndex}
        completedLevels={completedLevels}
        onSelectLevel={(idx) => {
          setIsSandbox(false);
          loadLevel(idx);
        }}
        isSandbox={isSandbox}
        onSelectSandbox={() => {
          setIsSandbox(true);
          setIsSandboxModalOpen(true);
        }}
        isotopesDB={isotopesDB}
      />

      {currentLevel && (
        <LevelStoryModal
          isOpen={isStoryModalOpen}
          onClose={() => setIsStoryModalOpen(false)}
          level={currentLevel}
          isotopesDB={isotopesDB}
        />
      )}

      <SandboxModal
        isOpen={isSandboxModalOpen}
        onClose={() => setIsSandboxModalOpen(false)}
        onSelectIsotope={(isoId) => setElement(isoId)}
        isotopesDB={isotopesDB}
      />
    </div>
  );
}
