import React, { useState, useMemo } from 'react';
import { Isotope, DecaySettings, Language } from '../types/isotope';
import { calculateGameDecayTime, formatHalfLife, getElementName } from '../utils/physics';
import { X, Sliders, Calculator, BookOpen } from 'lucide-react';
import { useI18n } from '../i18n';

import frManual from '../i18n/manual/fr.md?raw';
import enManual from '../i18n/manual/en.md?raw';
import esManual from '../i18n/manual/es.md?raw';
import zhManual from '../i18n/manual/zh.md?raw';

const MANUALS: Record<Language, string> = {
  fr: frManual,
  en: enManual,
  es: esManual,
  zh: zhManual,
};

interface LogarithmicVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentIsotope: Isotope;
  settings: DecaySettings;
  onUpdateSettings?: (newSettings: DecaySettings) => void;
}

interface ParsedManual {
  title: string;
  intro: string;
  chapters: Array<{
    heading: string;
    body: string;
  }>;
}

function parseManualMarkdown(md: string): ParsedManual {
  const lines = md.split(/\r?\n/);
  let title = 'ISOThOPE';
  const introLines: string[] = [];
  const chapters: Array<{ heading: string; bodyLines: string[] }> = [];
  let currentChapter: { heading: string; bodyLines: string[] } | null = null;

  for (const line of lines) {
    if (line.startsWith('# ')) {
      title = line.slice(2).trim();
    } else if (line.startsWith('## ')) {
      if (currentChapter) {
        chapters.push(currentChapter);
      }
      currentChapter = {
        heading: line.slice(3).trim(),
        bodyLines: [],
      };
    } else if (currentChapter) {
      currentChapter.bodyLines.push(line);
    } else if (line.trim()) {
      introLines.push(line.trim());
    }
  }
  if (currentChapter) {
    chapters.push(currentChapter);
  }

  return {
    title,
    intro: introLines.join(' '),
    chapters: chapters.map((c) => ({
      heading: c.heading,
      body: c.bodyLines.join('\n').trim(),
    })),
  };
}

/**
 * Renders inline Markdown formatting: **bold**, *italic*, `code`
 */
function renderInline(text: string): React.ReactNode {
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(tokenRegex);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-bold text-white">
          {renderInline(part.slice(2, -2))}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={idx} className="italic text-amber-200/90">
          {renderInline(part.slice(1, -1))}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-sky-300 font-mono text-[11px]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

/**
 * Renders block-level Markdown inside a chapter: paragraphs, bullet lists, blockquotes, tables, code formulas
 */
function renderMarkdownBlocks(body: string): React.ReactNode {
  const lines = body.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i++;
      continue;
    }

    // Table block
    if (line.startsWith('|') && line.endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      const rows = tableLines
        .filter((r) => !/^\|[\s:-]+\|/.test(r.replace(/\|/g, '|')))
        .filter((r) => !r.split('|').slice(1, -1).every((cell) => /^[\s:-]+$/.test(cell)))
        .map((r) =>
          r
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim())
        );

      if (rows.length > 0) {
        const header = rows[0];
        const dataRows = rows.slice(1);
        elements.push(
          <div key={`tbl-${i}`} className="overflow-x-auto my-2 rounded-xl border border-zinc-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-900/90 border-b border-zinc-800 text-zinc-300">
                  {header.map((h, cIdx) => (
                    <th key={cIdx} className="py-2 px-3 font-bold">
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70 bg-zinc-950/60">
                {dataRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-zinc-900/40">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="py-2 px-3 text-zinc-300">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // Bullet list block
    if (line.startsWith('- ')) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        listItems.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="space-y-1.5 my-2 pl-4 list-disc text-xs sm:text-sm text-zinc-300">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        <blockquote
          key={`bq-${i}`}
          className="my-2 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs leading-relaxed"
        >
          {renderInline(quoteLines.join(' '))}
        </blockquote>
      );
      continue;
    }

    // Standalone formula line wrapped in backticks
    if (line.startsWith('`') && line.endsWith('`') && line.slice(1, -1).includes('=')) {
      elements.push(
        <div
          key={`eq-${i}`}
          className="my-2 p-2.5 rounded-xl bg-black/60 border border-sky-500/30 font-mono text-center text-xs sm:text-sm font-bold text-sky-300 tracking-wide"
        >
          {line.slice(1, -1)}
        </div>
      );
      i++;
      continue;
    }

    // Paragraph
    elements.push(
      <p key={`p-${i}`} className="text-xs sm:text-sm leading-relaxed text-zinc-300 my-1.5">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return elements;
}

export const LogarithmicVerificationModal: React.FC<LogarithmicVerificationModalProps> = ({
  isOpen,
  onClose,
  currentIsotope,
  settings,
  onUpdateSettings,
}) => {
  const { t, lang } = useI18n();
  const [testHalfLife, setTestHalfLife] = useState<number>(currentIsotope.halfLife > 0 ? currentIsotope.halfLife : 10);
  const [tempSettings, setTempSettings] = useState<DecaySettings>({ ...settings });
  const [activeChapter, setActiveChapter] = useState<number | null>(null);

  const manual = useMemo(() => {
    const raw = MANUALS[lang] || MANUALS.fr;
    return parseManualMarkdown(raw);
  }, [lang]);

  if (!isOpen) return null;

  // Key benchmarks for demonstration
  const benchmarks = [
    { z: 8, mass: 12, sym: 'O', hl: 1e-3 },
    { z: 18, mass: 30, sym: 'Ar', hl: 1.0 },
    { z: 8, mass: 19, sym: 'O', hl: 26.47 },
    { z: 82, mass: 209, sym: 'Pb', hl: 11646 },
    { z: 20, mass: 47, sym: 'Ca', hl: 391824 },
    { z: 1, mass: 3, sym: 'H', hl: 388500000 },
    { z: 6, mass: 14, sym: 'C', hl: 1.8e11 },
    { z: 92, mass: 238, sym: 'U', hl: 1.4e17 },
  ];

  const simulatedGameTime = calculateGameDecayTime(testHalfLife, tempSettings);
  const logVal = Math.log10(testHalfLife > 0 ? testHalfLife : 1);

  // SVG Graph parameters
  const minLog = -4;
  const maxLog = 12;
  const graphWidth = 560;
  const graphHeight = 190;
  const padding = { left: 45, right: 25, top: 20, bottom: 30 };

  const toSvgX = (log: number) => {
    return padding.left + ((log - minLog) / (maxLog - minLog)) * (graphWidth - padding.left - padding.right);
  };

  const toSvgY = (gameSeconds: number) => {
    return graphHeight - padding.bottom - (gameSeconds / 9.0) * (graphHeight - padding.top - padding.bottom);
  };

  const curvePoints: string[] = [];
  for (let l = minLog; l <= maxLog; l += 0.5) {
    const hl = Math.pow(10, l);
    const gt = calculateGameDecayTime(hl, { ...tempSettings, isStochastic: false });
    curvePoints.push(`${toSvgX(l).toFixed(1)},${toSvgY(gt).toFixed(1)}`);
  }

  const currentLog = currentIsotope.halfLife > 0 ? Math.log10(currentIsotope.halfLife) : null;
  const currentGameTime =
    currentIsotope.halfLife > 0
      ? calculateGameDecayTime(currentIsotope.halfLife, { ...tempSettings, isStochastic: false })
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white truncate">{manual.title}</h2>
              <p className="text-[11px] sm:text-xs text-zinc-400 line-clamp-1">{ renderInline(manual.intro) }</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chapter quick-filter pills */}
        <div className="px-4 sm:px-6 py-2 bg-zinc-950/50 border-b border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto flex-shrink-0">
          <button
            onClick={() => setActiveChapter(null)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
              activeChapter === null
                ? 'bg-sky-500 text-black'
                : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            ∞
          </button>
          {manual.chapters.map((chap, idx) => (
            <button
              key={idx}
              onClick={() => setActiveChapter(activeChapter === idx ? null : idx)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                activeChapter === idx
                  ? 'bg-sky-500 text-black font-bold'
                  : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {chap.heading}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {manual.chapters.map((chapter, idx) => {
            if (activeChapter !== null && activeChapter !== idx) return null;
            const isLogChapter = idx === manual.chapters.length - 1;

            return (
              <section
                key={idx}
                className="bg-zinc-950/50 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 space-y-3"
              >
                <h3 className="text-sm sm:text-base font-extrabold text-sky-400 border-b border-zinc-800/80 pb-2">
                  {chapter.heading}
                </h3>

                <div className="space-y-2">{renderMarkdownBlocks(chapter.body)}</div>

                {/* Interactive Logarithmic Law Widget inside the last chapter */}
                {isLogChapter && (
                  <div className="pt-3 space-y-4">
                    {/* Interactive SVG Semi-Log Graph */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                          <Calculator className="w-4 h-4 text-sky-400" />
                          {t('logCurveTitle')}
                        </span>
                        <span className="text-xs font-mono text-zinc-400">
                          {t('logSlopeConst', { slope: tempSettings.slope })}
                        </span>
                      </div>

                      <div className="w-full overflow-x-auto">
                        <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-auto select-none">
                          {[-3, 0, 3, 6, 9, 12].map((log) => {
                            const x = toSvgX(log);
                            return (
                              <g key={log}>
                                <line
                                  x1={x}
                                  y1={padding.top}
                                  x2={x}
                                  y2={graphHeight - padding.bottom}
                                  stroke="#27272a"
                                  strokeDasharray="3,3"
                                />
                                <text
                                  x={x}
                                  y={graphHeight - 10}
                                  textAnchor="middle"
                                  fill="#71717a"
                                  fontSize="10"
                                  fontFamily="monospace"
                                >
                                  10^{log}s
                                </text>
                              </g>
                            );
                          })}

                          {[2, 4, 6, 8].map((s) => {
                            const y = toSvgY(s);
                            return (
                              <g key={s}>
                                <line
                                  x1={padding.left}
                                  y1={y}
                                  x2={graphWidth - padding.right}
                                  y2={y}
                                  stroke="#27272a"
                                  strokeDasharray="3,3"
                                />
                                <text
                                  x={padding.left - 8}
                                  y={y + 3}
                                  textAnchor="end"
                                  fill="#71717a"
                                  fontSize="10"
                                  fontFamily="monospace"
                                >
                                  {s}s
                                </text>
                              </g>
                            );
                          })}

                          <line
                            x1={padding.left}
                            y1={padding.top}
                            x2={padding.left}
                            y2={graphHeight - padding.bottom}
                            stroke="#52525b"
                            strokeWidth="1.5"
                          />
                          <line
                            x1={padding.left}
                            y1={graphHeight - padding.bottom}
                            x2={graphWidth - padding.right}
                            y2={graphHeight - padding.bottom}
                            stroke="#52525b"
                            strokeWidth="1.5"
                          />

                          <polyline
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={curvePoints.join(' ')}
                          />

                          {currentLog !== null && currentGameTime !== null && (
                            <g>
                              <circle
                                cx={toSvgX(currentLog)}
                                cy={toSvgY(currentGameTime)}
                                r="6"
                                fill="#ef4444"
                                className="animate-pulse"
                              />
                              <text
                                x={toSvgX(currentLog)}
                                y={toSvgY(currentGameTime) - 10}
                                textAnchor="middle"
                                fill="#fca5a5"
                                fontSize="10"
                                fontWeight="bold"
                              >
                                {currentIsotope.id} ({currentGameTime.toFixed(2)}s)
                              </text>
                            </g>
                          )}

                          {testHalfLife > 0 && (
                            <g>
                              <circle cx={toSvgX(logVal)} cy={toSvgY(simulatedGameTime)} r="5" fill="#eab308" />
                              <text
                                x={toSvgX(logVal)}
                                y={toSvgY(simulatedGameTime) + 15}
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
                    </div>

                    {/* Interactive Simulator Slider */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                          <Sliders className="w-4 h-4 text-amber-400" />
                          {t('logSimTitle')}
                        </span>
                        <span className="text-xs font-mono text-amber-400 font-bold">
                          T½ = {formatHalfLife(testHalfLife, lang)} ➔ {simulatedGameTime.toFixed(2)} s
                        </span>
                      </div>

                      <input
                        type="range"
                        min="-3"
                        max="10"
                        step="0.1"
                        value={logVal}
                        onChange={(e) => setTestHalfLife(Math.pow(10, parseFloat(e.target.value)))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        {benchmarks.slice(0, 4).map((item, bIdx) => {
                          const gameSec = calculateGameDecayTime(item.hl, { ...tempSettings, isStochastic: false });
                          const isSelected = Math.abs(testHalfLife - item.hl) < 0.001;
                          return (
                            <button
                              key={bIdx}
                              onClick={() => setTestHalfLife(item.hl)}
                              className={`text-left p-2 rounded-xl border transition-all ${
                                isSelected
                                  ? 'bg-sky-950/60 border-sky-400 text-white'
                                  : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
                              }`}
                            >
                              <div className="text-[11px] font-bold text-white truncate">
                                {getElementName(item.z, lang)}-{item.mass}
                              </div>
                              <div className="flex items-center justify-between text-[10px] font-mono mt-0.5">
                                <span className="text-zinc-400">{formatHalfLife(item.hl, lang)}</span>
                                <span className="text-sky-400 font-bold">{gameSec.toFixed(1)}s</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-end gap-2 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-black shadow-lg shadow-sky-500/20 transition-all"
          >
            {t('closeBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};
