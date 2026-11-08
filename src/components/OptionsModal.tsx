import React, { useState, useEffect } from 'react';
import { DecaySettings, Language } from '../types/isotope';
import { Volume2, VolumeX, Sliders, RefreshCw, X, Grid, Globe, Check } from 'lucide-react';
import { useI18n, LANGUAGES } from '../i18n';

interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  gridSpan: number;
  onSetGridSpan: (span: number) => void;
  lang: Language;
  onSetLang: (lang: Language) => void;
  settings: DecaySettings;
  onUpdateSettings: (newSettings: DecaySettings) => void;
}

export const OptionsModal: React.FC<OptionsModalProps> = ({
  isOpen,
  onClose,
  isMuted,
  onToggleMute,
  gridSpan,
  onSetGridSpan,
  lang,
  onSetLang,
  settings,
  onUpdateSettings,
}) => {
  const { t } = useI18n();
  const [tempSettings, setTempSettings] = useState<DecaySettings>({ ...settings });
  const [showAppliedToast, setShowAppliedToast] = useState(false);

  // Sync temp settings when modal opens or settings change
  useEffect(() => {
    if (isOpen) {
      setTempSettings({ ...settings });
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleApply = () => {
    onUpdateSettings(tempSettings);
    setShowAppliedToast(true);
    setTimeout(() => {
      setShowAppliedToast(false);
      onClose();
    }, 400);
  };

  const handleResetDecay = () => {
    setTempSettings({
      baseTime: 2.0,
      slope: 0.5,
      minTime: 0.5,
      maxTime: 8.0,
      isStochastic: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">{t('optionsTitle')}</h2>
              <p className="text-[11px] sm:text-xs text-zinc-400">{t('subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label={t('closeBtn')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-zinc-200">
          {/* 1. Interface & Controls Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              {t('generalSettings')}
            </h3>

            {/* Sound Toggle */}
            <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl border ${
                  isMuted
                    ? 'bg-rose-950/40 border-rose-800/60 text-rose-400'
                    : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                }`}>
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white">{t('soundTitle')}</div>
                  <div className="text-[11px] text-zinc-400">
                    {isMuted ? t('soundOff') : t('soundOn')}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onToggleMute}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  isMuted
                    ? 'bg-rose-950/60 hover:bg-rose-900/60 border-rose-500/60 text-rose-300'
                    : 'bg-emerald-950/60 hover:bg-emerald-900/60 border-emerald-500/60 text-emerald-300'
                }`}
              >
                {isMuted ? t('unmute') : t('mute')}
              </button>
            </div>

            {/* Grid Format (7x7 / 5x5 / 9x9) */}
            <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center gap-2 text-zinc-300">
                <Grid className="w-4 h-4 text-sky-400" />
                <span className="text-xs sm:text-sm font-bold text-white">{t('gridSizeTitle')}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[5, 7, 9].map((span) => {
                  const isSelected = gridSpan === span;
                  return (
                    <button
                      key={span}
                      type="button"
                      onClick={() => onSetGridSpan(span)}
                      className={`py-2 px-3 rounded-xl font-mono text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-sky-500 text-black border-sky-400 shadow-md shadow-sky-500/20'
                          : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      <span>{span}×{span}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language Selection */}
            <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center gap-2 text-zinc-300">
                <Globe className="w-4 h-4 text-amber-400" />
                <span className="text-xs sm:text-sm font-bold text-white">{t('languageTitle')}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {LANGUAGES.map((l) => {
                  const isSelected = lang === l.code;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => onSetLang(l.code as Language)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      <span>{l.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Exponential Decay Time Settings (Moved from player manual) */}
          <div className="space-y-3 pt-2 border-t border-zinc-800/80">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4" />
                  {t('decaySettingsTitle')}
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                  t_jeu = t_base + pente × log₁₀(T½)
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetDecay}
                className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors bg-zinc-800/60 hover:bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-700/60"
                title={t('logResetBtn')}
              >
                <RefreshCw className="w-3 h-3" />
                <span>{t('logResetBtn')}</span>
              </button>
            </div>

            <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 space-y-4">
              {/* Base Time Slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-zinc-300 font-semibold">{t('logBaseTimeLabel')}</span>
                  <span className="font-mono font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60">
                    {tempSettings.baseTime.toFixed(1)}s
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="4.0"
                  step="0.1"
                  value={tempSettings.baseTime}
                  onChange={(e) =>
                    setTempSettings({ ...tempSettings, baseTime: parseFloat(e.target.value) })
                  }
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-0.5">
                  <span>1.0s (Rapide)</span>
                  <span>4.0s (Lent)</span>
                </div>
              </div>

              {/* Slope Slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-zinc-300 font-semibold">{t('logSlopeLabel')}</span>
                  <span className="font-mono font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60">
                    {tempSettings.slope.toFixed(2)}s / décade
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={tempSettings.slope}
                  onChange={(e) =>
                    setTempSettings({ ...tempSettings, slope: parseFloat(e.target.value) })
                  }
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-0.5">
                  <span>0.20s (Écart faible)</span>
                  <span>1.00s (Écart élevé)</span>
                </div>
              </div>

              {/* Quantum Mode Toggle */}
              <div>
                <label className="text-xs text-zinc-300 font-semibold block mb-1.5">
                  {t('logQuantumModeLabel')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTempSettings({ ...tempSettings, isStochastic: false })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      !tempSettings.isStochastic
                        ? 'bg-purple-950 border-purple-400 text-purple-200 shadow-md shadow-purple-500/20'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {t('logDeterministic')}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTempSettings({ ...tempSettings, isStochastic: true })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      tempSettings.isStochastic
                        ? 'bg-purple-950 border-purple-400 text-purple-200 shadow-md shadow-purple-500/20'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {t('logStochastic')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-end gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            {t('closeBtn')}
          </button>
          <button
            type="button"
            onClick={handleApply}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              showAppliedToast
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-sky-500 hover:bg-sky-400 text-black shadow-lg shadow-sky-500/20'
            }`}
          >
            {showAppliedToast ? '✓ OK !' : t('applySettingsBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};
