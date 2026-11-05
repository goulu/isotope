import { DecayMode, DecaySettings, Isotope } from '../types/isotope';

export const ELEMENT_SYMBOLS: Record<number, { symbol: string; nameFr: string; nameEn: string }> = {
  1: { symbol: 'H', nameFr: 'Hydrogène', nameEn: 'Hydrogen' },
  2: { symbol: 'He', nameFr: 'Hélium', nameEn: 'Helium' },
  3: { symbol: 'Li', nameFr: 'Lithium', nameEn: 'Lithium' },
  4: { symbol: 'Be', nameFr: 'Béryllium', nameEn: 'Beryllium' },
  5: { symbol: 'B', nameFr: 'Bore', nameEn: 'Boron' },
  6: { symbol: 'C', nameFr: 'Carbone', nameEn: 'Carbon' },
  7: { symbol: 'N', nameFr: 'Azote', nameEn: 'Nitrogen' },
  8: { symbol: 'O', nameFr: 'Oxygène', nameEn: 'Oxygen' },
  9: { symbol: 'F', nameFr: 'Fluor', nameEn: 'Fluorine' },
  10: { symbol: 'Ne', nameFr: 'Néon', nameEn: 'Neon' },
  11: { symbol: 'Na', nameFr: 'Sodium', nameEn: 'Sodium' },
  12: { symbol: 'Mg', nameFr: 'Magnésium', nameEn: 'Magnesium' },
  13: { symbol: 'Al', nameFr: 'Aluminium', nameEn: 'Aluminium' },
  14: { symbol: 'Si', nameFr: 'Silicium', nameEn: 'Silicon' },
  15: { symbol: 'P', nameFr: 'Phosphore', nameEn: 'Phosphorus' },
  16: { symbol: 'S', nameFr: 'Soufre', nameEn: 'Sulfur' },
  17: { symbol: 'Cl', nameFr: 'Chlore', nameEn: 'Chlorine' },
  18: { symbol: 'Ar', nameFr: 'Argon', nameEn: 'Argon' },
  19: { symbol: 'K', nameFr: 'Potassium', nameEn: 'Potassium' },
  20: { symbol: 'Ca', nameFr: 'Calcium', nameEn: 'Calcium' },
  21: { symbol: 'Sc', nameFr: 'Scandium', nameEn: 'Scandium' },
  22: { symbol: 'Ti', nameFr: 'Titane', nameEn: 'Titanium' },
  23: { symbol: 'V', nameFr: 'Vanadium', nameEn: 'Vanadium' },
  24: { symbol: 'Cr', nameFr: 'Chrome', nameEn: 'Chromium' },
  25: { symbol: 'Mn', nameFr: 'Manganèse', nameEn: 'Manganese' },
  26: { symbol: 'Fe', nameFr: 'Fer', nameEn: 'Iron' },
  27: { symbol: 'Co', nameFr: 'Cobalt', nameEn: 'Cobalt' },
  28: { symbol: 'Ni', nameFr: 'Nickel', nameEn: 'Nickel' },
  29: { symbol: 'Cu', nameFr: 'Cuivre', nameEn: 'Copper' },
  30: { symbol: 'Zn', nameFr: 'Zinc', nameEn: 'Zinc' },
  31: { symbol: 'Ga', nameFr: 'Gallium', nameEn: 'Gallium' },
  32: { symbol: 'Ge', nameFr: 'Germanium', nameEn: 'Germanium' },
  33: { symbol: 'As', nameFr: 'Arsenic', nameEn: 'Arsenic' },
  34: { symbol: 'Se', nameFr: 'Sélénium', nameEn: 'Selenium' },
  35: { symbol: 'Br', nameFr: 'Brome', nameEn: 'Bromine' },
  36: { symbol: 'Kr', nameFr: 'Krypton', nameEn: 'Krypton' },
  37: { symbol: 'Rb', nameFr: 'Rubidium', nameEn: 'Rubidium' },
  38: { symbol: 'Sr', nameFr: 'Strontium', nameEn: 'Strontium' },
  39: { symbol: 'Y', nameFr: 'Yttrium', nameEn: 'Yttrium' },
  40: { symbol: 'Zr', nameFr: 'Zirconium', nameEn: 'Zirconium' },
  41: { symbol: 'Nb', nameFr: 'Niobium', nameEn: 'Niobium' },
  42: { symbol: 'Mo', nameFr: 'Molybdène', nameEn: 'Molybdenum' },
  43: { symbol: 'Tc', nameFr: 'Technétium', nameEn: 'Technetium' },
  44: { symbol: 'Ru', nameFr: 'Ruthénium', nameEn: 'Ruthenium' },
  45: { symbol: 'Rh', nameFr: 'Rhodium', nameEn: 'Rhodium' },
  46: { symbol: 'Pd', nameFr: 'Palladium', nameEn: 'Palladium' },
  47: { symbol: 'Ag', nameFr: 'Argent', nameEn: 'Silver' },
  48: { symbol: 'Cd', nameFr: 'Cadmium', nameEn: 'Cadmium' },
  49: { symbol: 'In', nameFr: 'Indium', nameEn: 'Indium' },
  50: { symbol: 'Sn', nameFr: 'Étain', nameEn: 'Tin' },
  51: { symbol: 'Sb', nameFr: 'Antimoine', nameEn: 'Antimony' },
  52: { symbol: 'Te', nameFr: 'Tellure', nameEn: 'Tellurium' },
  53: { symbol: 'I', nameFr: 'Iode', nameEn: 'Iodine' },
  54: { symbol: 'Xe', nameFr: 'Xénon', nameEn: 'Xenon' },
  55: { symbol: 'Cs', nameFr: 'Césium', nameEn: 'Caesium' },
  56: { symbol: 'Ba', nameFr: 'Baryum', nameEn: 'Barium' },
  57: { symbol: 'La', nameFr: 'Lanthane', nameEn: 'Lanthanum' },
  58: { symbol: 'Ce', nameFr: 'Cérium', nameEn: 'Cerium' },
  59: { symbol: 'Pr', nameFr: 'Praséodyme', nameEn: 'Praseodymium' },
  60: { symbol: 'Nd', nameFr: 'Néodyme', nameEn: 'Neodymium' },
  61: { symbol: 'Pm', nameFr: 'Prométhium', nameEn: 'Promethium' },
  62: { symbol: 'Sm', nameFr: 'Samarium', nameEn: 'Samarium' },
  63: { symbol: 'Eu', nameFr: 'Europium', nameEn: 'Europium' },
  64: { symbol: 'Gd', nameFr: 'Gadolinium', nameEn: 'Gadolinium' },
  65: { symbol: 'Tb', nameFr: 'Terbium', nameEn: 'Terbium' },
  66: { symbol: 'Dy', nameFr: 'Dysprosium', nameEn: 'Dysprosium' },
  67: { symbol: 'Ho', nameFr: 'Holmium', nameEn: 'Holmium' },
  68: { symbol: 'Er', nameFr: 'Erbium', nameEn: 'Erbium' },
  69: { symbol: 'Tm', nameFr: 'Thulium', nameEn: 'Thulium' },
  70: { symbol: 'Yb', nameFr: 'Ytterbium', nameEn: 'Ytterbium' },
  71: { symbol: 'Lu', nameFr: 'Lutécium', nameEn: 'Lutetium' },
  72: { symbol: 'Hf', nameFr: 'Hafnium', nameEn: 'Hafnium' },
  73: { symbol: 'Ta', nameFr: 'Tantale', nameEn: 'Tantalum' },
  74: { symbol: 'W', nameFr: 'Tungstène', nameEn: 'Tungsten' },
  75: { symbol: 'Re', nameFr: 'Rhénium', nameEn: 'Rhenium' },
  76: { symbol: 'Os', nameFr: 'Osmium', nameEn: 'Osmium' },
  77: { symbol: 'Ir', nameFr: 'Iridium', nameEn: 'Iridium' },
  78: { symbol: 'Pt', nameFr: 'Platine', nameEn: 'Platinum' },
  79: { symbol: 'Au', nameFr: 'Or', nameEn: 'Gold' },
  80: { symbol: 'Hg', nameFr: 'Mercure', nameEn: 'Mercury' },
  81: { symbol: 'Tl', nameFr: 'Thallium', nameEn: 'Thallium' },
  82: { symbol: 'Pb', nameFr: 'Plomb', nameEn: 'Lead' },
  83: { symbol: 'Bi', nameFr: 'Bismuth', nameEn: 'Bismuth' },
  84: { symbol: 'Po', nameFr: 'Polonium', nameEn: 'Polonium' },
  85: { symbol: 'At', nameFr: 'Astate', nameEn: 'Astatine' },
  86: { symbol: 'Rn', nameFr: 'Radon', nameEn: 'Radon' },
  87: { symbol: 'Fr', nameFr: 'Francium', nameEn: 'Francium' },
  88: { symbol: 'Ra', nameFr: 'Radium', nameEn: 'Radium' },
  89: { symbol: 'Ac', nameFr: 'Actinium', nameEn: 'Actinium' },
  90: { symbol: 'Th', nameFr: 'Thorium', nameEn: 'Thorium' },
  91: { symbol: 'Pa', nameFr: 'Protactinium', nameEn: 'Protactinium' },
  92: { symbol: 'U', nameFr: 'Uranium', nameEn: 'Uranium' },
  93: { symbol: 'Np', nameFr: 'Neptunium', nameEn: 'Neptunium' },
  94: { symbol: 'Pu', nameFr: 'Plutonium', nameEn: 'Plutonium' },
  95: { symbol: 'Am', nameFr: 'Américium', nameEn: 'Americium' },
  96: { symbol: 'Cm', nameFr: 'Curium', nameEn: 'Curium' },
  97: { symbol: 'Bk', nameFr: 'Berkélium', nameEn: 'Berkelium' },
  98: { symbol: 'Cf', nameFr: 'Californium', nameEn: 'Californium' },
  99: { symbol: 'Es', nameFr: 'Einsteinium', nameEn: 'Einsteinium' },
  100: { symbol: 'Fm', nameFr: 'Fermium', nameEn: 'Fermium' },
  101: { symbol: 'Md', nameFr: 'Mendélévium', nameEn: 'Mendelevium' },
  102: { symbol: 'No', nameFr: 'Nobélium', nameEn: 'Nobelium' },
  103: { symbol: 'Lr', nameFr: 'Lawrencium', nameEn: 'Lawrencium' },
};

export const DEFAULT_DECAY_SETTINGS: DecaySettings = {
  baseTime: 2.0, // 2.0s when half-life is 1 second (log10 = 0)
  slope: 0.5, // +0.5s per decade of half-life
  minTime: 0.5, // clamp floor so user can always see/react
  maxTime: 8.0, // clamp ceiling so user does not wait indefinitely
  isStochastic: false, // deterministic by default
};

/**
 * Calculates in-game decay time obeying a true logarithmic law:
 * t_game = clamp(baseTime + slope * log10(T_1/2), minTime, maxTime)
 *
 * Example calibrations:
 * - T_1/2 = 1 ms (10^-3 s):  t_game = 2.0 + 0.5 * (-3) = 0.50 s
 * - T_1/2 = 1 s (10^0 s):   t_game = 2.0 + 0.5 * (0)  = 2.00 s
 * - T_1/2 = 1000 s (10^3 s): t_game = 2.0 + 0.5 * (3)  = 3.50 s
 * - T_1/2 = 10^6 s (11 d):   t_game = 2.0 + 0.5 * (6)  = 5.00 s
 * - T_1/2 = 10^9 s (31 y):   t_game = 2.0 + 0.5 * (9)  = 6.50 s
 */
export function calculateGameDecayTime(
  halfLifeSeconds: number,
  settings: DecaySettings = DEFAULT_DECAY_SETTINGS
): number {
  if (halfLifeSeconds <= 0) return 0;

  const log10Val = Math.log10(halfLifeSeconds);
  const nominalSeconds = settings.baseTime + settings.slope * log10Val;
  const clamped = Math.max(settings.minTime, Math.min(settings.maxTime, nominalSeconds));

  if (settings.isStochastic) {
    // Quantum random decay time according to exponential survival probability P(t) = exp(-t / tau)
    // where tau = clamped / ln(2)
    const u = Math.max(1e-6, Math.random());
    const stochastic = -clamped * Math.log(u);
    return Math.max(0.3, Math.min(settings.maxTime * 1.5, stochastic));
  }

  return clamped;
}

export function formatHalfLife(seconds: number): string {
  if (seconds === -1 || seconds === null || seconds === undefined) {
    return 'Stable (Infini)';
  }
  if (seconds < 1e-6) {
    return `${(seconds * 1e9).toFixed(1)} ns`;
  }
  if (seconds < 1e-3) {
    return `${(seconds * 1e6).toFixed(1)} µs`;
  }
  if (seconds < 1) {
    return `${(seconds * 1000).toFixed(1)} ms`;
  }
  if (seconds < 60) {
    return `${seconds.toFixed(2)} s`;
  }
  if (seconds < 3600) {
    return `${(seconds / 60).toFixed(1)} min`;
  }
  if (seconds < 86400) {
    return `${(seconds / 3600).toFixed(1)} h`;
  }
  if (seconds < 31557600) {
    return `${(seconds / 86400).toFixed(1)} jours`;
  }
  const years = seconds / 31557600;
  if (years < 1e6) {
    return `${years.toFixed(1)} ans`;
  }
  if (years < 1e9) {
    return `${(years / 1e6).toFixed(2)} Ma`;
  }
  return `${(years / 1e9).toFixed(2)} Ga (milliards d'années)`;
}

export function getDecayColor(mode: DecayMode): {
  bg: string;
  border: string;
  text: string;
  nameFr: string;
  hex: string;
} {
  switch (mode) {
    case 'None':
      return {
        bg: 'bg-black',
        border: 'border-zinc-500',
        text: 'text-white',
        nameFr: 'Stable',
        hex: '#09090b',
      };
    case 'Beta-':
      return {
        bg: 'bg-sky-400',
        border: 'border-sky-300',
        text: 'text-black',
        nameFr: 'Bêta-moins (β⁻)',
        hex: '#38bdf8',
      };
    case 'Beta+':
      return {
        bg: 'bg-pink-400',
        border: 'border-pink-300',
        text: 'text-black',
        nameFr: 'Bêta-plus (β⁺)',
        hex: '#f472b6',
      };
    case 'Alpha':
      return {
        bg: 'bg-yellow-300',
        border: 'border-yellow-200',
        text: 'text-black',
        nameFr: 'Alpha (α)',
        hex: '#fde047',
      };
    case 'Proton':
      return {
        bg: 'bg-orange-400',
        border: 'border-orange-300',
        text: 'text-black',
        nameFr: 'Émission Proton (p)',
        hex: '#fb923c',
      };
    case 'Neutron':
      return {
        bg: 'bg-purple-400',
        border: 'border-purple-300',
        text: 'text-black',
        nameFr: 'Émission Neutron (n)',
        hex: '#c084fc',
      };
    default:
      return {
        bg: 'bg-zinc-700',
        border: 'border-zinc-600',
        text: 'text-white',
        nameFr: 'Inconnu',
        hex: '#3f3f46',
      };
  }
}

export function getDecayReaction(
  currentIso: Isotope,
  db: Record<string, { protons: number; neutrons: number; halfLife: number; decayMode: DecayMode; name: string }>
): {
  nextProtons: number;
  nextNeutrons: number;
  nextIsotopeId: string;
  nextIsoData: Isotope | null;
  emittedParticle: string;
  reactionFormula: string;
} {
  let p = currentIso.protons;
  let n = currentIso.neutrons;
  let emitted = '';

  switch (currentIso.decayMode) {
    case 'Alpha':
      p -= 2;
      n -= 2;
      emitted = 'Noyau d\'Hélium-4 (²⁺α)';
      break;
    case 'Beta-':
      p += 1;
      n -= 1;
      emitted = 'Électron (e⁻) + Antineutrino (ν̄_e)';
      break;
    case 'Beta+':
      p -= 1;
      n += 1;
      emitted = 'Positron (e⁺) + Neutrino (ν_e)';
      break;
    case 'Proton':
      p -= 1;
      emitted = 'Proton libre (p)';
      break;
    case 'Neutron':
      n -= 1;
      emitted = 'Neutron libre (n)';
      break;
    default:
      break;
  }

  const sym = ELEMENT_SYMBOLS[p]?.symbol || 'X';
  const mass = p + n;
  const nextId = `${sym}-${mass}`;
  const raw = db[nextId];

  const nextIsoData: Isotope | null = raw
    ? {
        id: nextId,
        symbol: sym,
        mass,
        protons: p,
        neutrons: n,
        halfLife: raw.halfLife,
        decayMode: raw.decayMode,
        name: raw.name,
      }
    : null;

  const reactionFormula = `${currentIso.symbol}-${currentIso.mass} ➔ ${sym}-${mass} + ${emitted}`;

  return {
    nextProtons: p,
    nextNeutrons: n,
    nextIsotopeId: nextId,
    nextIsoData,
    emittedParticle: emitted,
    reactionFormula,
  };
}
