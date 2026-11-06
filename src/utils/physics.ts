import { DecayMode, DecaySettings, Isotope, Language } from '../types/isotope';

export const ELEMENT_SYMBOLS: Record<
  number,
  { symbol: string; nameFr: string; nameEn: string; nameEs: string; nameZh: string }
> = {
  1: { symbol: 'H', nameFr: 'Hydrogène', nameEn: 'Hydrogen', nameEs: 'Hidrógeno', nameZh: '氢' },
  2: { symbol: 'He', nameFr: 'Hélium', nameEn: 'Helium', nameEs: 'Helio', nameZh: '氦' },
  3: { symbol: 'Li', nameFr: 'Lithium', nameEn: 'Lithium', nameEs: 'Litio', nameZh: '锂' },
  4: { symbol: 'Be', nameFr: 'Béryllium', nameEn: 'Beryllium', nameEs: 'Berilio', nameZh: '铍' },
  5: { symbol: 'B', nameFr: 'Bore', nameEn: 'Boron', nameEs: 'Boro', nameZh: '硼' },
  6: { symbol: 'C', nameFr: 'Carbone', nameEn: 'Carbon', nameEs: 'Carbono', nameZh: '碳' },
  7: { symbol: 'N', nameFr: 'Azote', nameEn: 'Nitrogen', nameEs: 'Nitrógeno', nameZh: '氮' },
  8: { symbol: 'O', nameFr: 'Oxygène', nameEn: 'Oxygen', nameEs: 'Oxígeno', nameZh: '氧' },
  9: { symbol: 'F', nameFr: 'Fluor', nameEn: 'Fluorine', nameEs: 'Flúor', nameZh: '氟' },
  10: { symbol: 'Ne', nameFr: 'Néon', nameEn: 'Neon', nameEs: 'Neón', nameZh: '氖' },
  11: { symbol: 'Na', nameFr: 'Sodium', nameEn: 'Sodium', nameEs: 'Sodio', nameZh: '钠' },
  12: { symbol: 'Mg', nameFr: 'Magnésium', nameEn: 'Magnesium', nameEs: 'Magnesio', nameZh: '镁' },
  13: { symbol: 'Al', nameFr: 'Aluminium', nameEn: 'Aluminium', nameEs: 'Aluminio', nameZh: '铝' },
  14: { symbol: 'Si', nameFr: 'Silicium', nameEn: 'Silicon', nameEs: 'Silicio', nameZh: '硅' },
  15: { symbol: 'P', nameFr: 'Phosphore', nameEn: 'Phosphorus', nameEs: 'Fósforo', nameZh: '磷' },
  16: { symbol: 'S', nameFr: 'Soufre', nameEn: 'Sulfur', nameEs: 'Azufre', nameZh: '硫' },
  17: { symbol: 'Cl', nameFr: 'Chlore', nameEn: 'Chlorine', nameEs: 'Cloro', nameZh: '氯' },
  18: { symbol: 'Ar', nameFr: 'Argon', nameEn: 'Argon', nameEs: 'Argón', nameZh: '氩' },
  19: { symbol: 'K', nameFr: 'Potassium', nameEn: 'Potassium', nameEs: 'Potasio', nameZh: '钾' },
  20: { symbol: 'Ca', nameFr: 'Calcium', nameEn: 'Calcium', nameEs: 'Calcio', nameZh: '钙' },
  21: { symbol: 'Sc', nameFr: 'Scandium', nameEn: 'Scandium', nameEs: 'Escandio', nameZh: '钪' },
  22: { symbol: 'Ti', nameFr: 'Titane', nameEn: 'Titanium', nameEs: 'Titanio', nameZh: '钛' },
  23: { symbol: 'V', nameFr: 'Vanadium', nameEn: 'Vanadium', nameEs: 'Vanadio', nameZh: '钒' },
  24: { symbol: 'Cr', nameFr: 'Chrome', nameEn: 'Chromium', nameEs: 'Cromo', nameZh: '铬' },
  25: { symbol: 'Mn', nameFr: 'Manganèse', nameEn: 'Manganese', nameEs: 'Manganeso', nameZh: '锰' },
  26: { symbol: 'Fe', nameFr: 'Fer', nameEn: 'Iron', nameEs: 'Hierro', nameZh: '铁' },
  27: { symbol: 'Co', nameFr: 'Cobalt', nameEn: 'Cobalt', nameEs: 'Cobalto', nameZh: '钴' },
  28: { symbol: 'Ni', nameFr: 'Nickel', nameEn: 'Nickel', nameEs: 'Níquel', nameZh: '镍' },
  29: { symbol: 'Cu', nameFr: 'Cuivre', nameEn: 'Copper', nameEs: 'Cobre', nameZh: '铜' },
  30: { symbol: 'Zn', nameFr: 'Zinc', nameEn: 'Zinc', nameEs: 'Zinc', nameZh: '锌' },
  31: { symbol: 'Ga', nameFr: 'Gallium', nameEn: 'Gallium', nameEs: 'Galio', nameZh: '镓' },
  32: { symbol: 'Ge', nameFr: 'Germanium', nameEn: 'Germanium', nameEs: 'Germanio', nameZh: '锗' },
  33: { symbol: 'As', nameFr: 'Arsenic', nameEn: 'Arsenic', nameEs: 'Arsénico', nameZh: '砷' },
  34: { symbol: 'Se', nameFr: 'Sélénium', nameEn: 'Selenium', nameEs: 'Selenio', nameZh: '硒' },
  35: { symbol: 'Br', nameFr: 'Brome', nameEn: 'Bromine', nameEs: 'Bromo', nameZh: '溴' },
  36: { symbol: 'Kr', nameFr: 'Krypton', nameEn: 'Krypton', nameEs: 'Kriptón', nameZh: '氪' },
  37: { symbol: 'Rb', nameFr: 'Rubidium', nameEn: 'Rubidium', nameEs: 'Rubidio', nameZh: '铷' },
  38: { symbol: 'Sr', nameFr: 'Strontium', nameEn: 'Strontium', nameEs: 'Estroncio', nameZh: '锶' },
  39: { symbol: 'Y', nameFr: 'Yttrium', nameEn: 'Yttrium', nameEs: 'Itrio', nameZh: '钇' },
  40: { symbol: 'Zr', nameFr: 'Zirconium', nameEn: 'Zirconium', nameEs: 'Circonio', nameZh: '锆' },
  41: { symbol: 'Nb', nameFr: 'Niobium', nameEn: 'Niobium', nameEs: 'Niobio', nameZh: '铌' },
  42: { symbol: 'Mo', nameFr: 'Molybdène', nameEn: 'Molybdenum', nameEs: 'Molibdeno', nameZh: '钼' },
  43: { symbol: 'Tc', nameFr: 'Technétium', nameEn: 'Technetium', nameEs: 'Tecnecio', nameZh: '锝' },
  44: { symbol: 'Ru', nameFr: 'Ruthénium', nameEn: 'Ruthenium', nameEs: 'Rutenio', nameZh: '钌' },
  45: { symbol: 'Rh', nameFr: 'Rhodium', nameEn: 'Rhodium', nameEs: 'Rodio', nameZh: '铑' },
  46: { symbol: 'Pd', nameFr: 'Palladium', nameEn: 'Palladium', nameEs: 'Paladio', nameZh: '钯' },
  47: { symbol: 'Ag', nameFr: 'Argent', nameEn: 'Silver', nameEs: 'Plata', nameZh: '银' },
  48: { symbol: 'Cd', nameFr: 'Cadmium', nameEn: 'Cadmium', nameEs: 'Cadmio', nameZh: '镉' },
  49: { symbol: 'In', nameFr: 'Indium', nameEn: 'Indium', nameEs: 'Indio', nameZh: '铟' },
  50: { symbol: 'Sn', nameFr: 'Étain', nameEn: 'Tin', nameEs: 'Estaño', nameZh: '锡' },
  51: { symbol: 'Sb', nameFr: 'Antimoine', nameEn: 'Antimony', nameEs: 'Antimonio', nameZh: '锑' },
  52: { symbol: 'Te', nameFr: 'Tellure', nameEn: 'Tellurium', nameEs: 'Telurio', nameZh: '碲' },
  53: { symbol: 'I', nameFr: 'Iode', nameEn: 'Iodine', nameEs: 'Yodo', nameZh: '碘' },
  54: { symbol: 'Xe', nameFr: 'Xénon', nameEn: 'Xenon', nameEs: 'Xenón', nameZh: '氙' },
  55: { symbol: 'Cs', nameFr: 'Césium', nameEn: 'Caesium', nameEs: 'Cesio', nameZh: '铯' },
  56: { symbol: 'Ba', nameFr: 'Baryum', nameEn: 'Barium', nameEs: 'Bario', nameZh: '钡' },
  57: { symbol: 'La', nameFr: 'Lanthane', nameEn: 'Lanthanum', nameEs: 'Lantano', nameZh: '镧' },
  58: { symbol: 'Ce', nameFr: 'Cérium', nameEn: 'Cerium', nameEs: 'Cerio', nameZh: '铈' },
  59: { symbol: 'Pr', nameFr: 'Praséodyme', nameEn: 'Praseodymium', nameEs: 'Praseodimio', nameZh: '镨' },
  60: { symbol: 'Nd', nameFr: 'Néodyme', nameEn: 'Neodymium', nameEs: 'Neodimio', nameZh: '钕' },
  61: { symbol: 'Pm', nameFr: 'Prométhium', nameEn: 'Promethium', nameEs: 'Prometio', nameZh: '钷' },
  62: { symbol: 'Sm', nameFr: 'Samarium', nameEn: 'Samarium', nameEs: 'Samario', nameZh: '钐' },
  63: { symbol: 'Eu', nameFr: 'Europium', nameEn: 'Europium', nameEs: 'Europio', nameZh: '铕' },
  64: { symbol: 'Gd', nameFr: 'Gadolinium', nameEn: 'Gadolinium', nameEs: 'Gadolinio', nameZh: '钆' },
  65: { symbol: 'Tb', nameFr: 'Terbium', nameEn: 'Terbium', nameEs: 'Terbio', nameZh: '铽' },
  66: { symbol: 'Dy', nameFr: 'Dysprosium', nameEn: 'Dysprosium', nameEs: 'Disprosio', nameZh: '镝' },
  67: { symbol: 'Ho', nameFr: 'Holmium', nameEn: 'Holmium', nameEs: 'Holmio', nameZh: '钬' },
  68: { symbol: 'Er', nameFr: 'Erbium', nameEn: 'Erbium', nameEs: 'Erbio', nameZh: '铒' },
  69: { symbol: 'Tm', nameFr: 'Thulium', nameEn: 'Thulium', nameEs: 'Tulio', nameZh: '铥' },
  70: { symbol: 'Yb', nameFr: 'Ytterbium', nameEn: 'Ytterbium', nameEs: 'Iterbio', nameZh: '镱' },
  71: { symbol: 'Lu', nameFr: 'Lutécium', nameEn: 'Lutetium', nameEs: 'Lutecio', nameZh: '镥' },
  72: { symbol: 'Hf', nameFr: 'Hafnium', nameEn: 'Hafnium', nameEs: 'Hafnio', nameZh: '铪' },
  73: { symbol: 'Ta', nameFr: 'Tantale', nameEn: 'Tantalum', nameEs: 'Tántalo', nameZh: '钽' },
  74: { symbol: 'W', nameFr: 'Tungstène', nameEn: 'Tungsten', nameEs: 'Wolframio', nameZh: '钨' },
  75: { symbol: 'Re', nameFr: 'Rhénium', nameEn: 'Rhenium', nameEs: 'Renio', nameZh: '铼' },
  76: { symbol: 'Os', nameFr: 'Osmium', nameEn: 'Osmium', nameEs: 'Osmio', nameZh: '锇' },
  77: { symbol: 'Ir', nameFr: 'Iridium', nameEn: 'Iridium', nameEs: 'Iridio', nameZh: '铱' },
  78: { symbol: 'Pt', nameFr: 'Platine', nameEn: 'Platinum', nameEs: 'Platino', nameZh: '铂' },
  79: { symbol: 'Au', nameFr: 'Or', nameEn: 'Gold', nameEs: 'Oro', nameZh: '金' },
  80: { symbol: 'Hg', nameFr: 'Mercure', nameEn: 'Mercury', nameEs: 'Mercurio', nameZh: '汞' },
  81: { symbol: 'Tl', nameFr: 'Thallium', nameEn: 'Thallium', nameEs: 'Talio', nameZh: '铊' },
  82: { symbol: 'Pb', nameFr: 'Plomb', nameEn: 'Lead', nameEs: 'Plomo', nameZh: '铅' },
  83: { symbol: 'Bi', nameFr: 'Bismuth', nameEn: 'Bismuth', nameEs: 'Bismuto', nameZh: '铋' },
  84: { symbol: 'Po', nameFr: 'Polonium', nameEn: 'Polonium', nameEs: 'Polonio', nameZh: '钋' },
  85: { symbol: 'At', nameFr: 'Astate', nameEn: 'Astatine', nameEs: 'Astato', nameZh: '砹' },
  86: { symbol: 'Rn', nameFr: 'Radon', nameEn: 'Radon', nameEs: 'Radón', nameZh: '氡' },
  87: { symbol: 'Fr', nameFr: 'Francium', nameEn: 'Francium', nameEs: 'Francio', nameZh: '钫' },
  88: { symbol: 'Ra', nameFr: 'Radium', nameEn: 'Radium', nameEs: 'Radio', nameZh: '镭' },
  89: { symbol: 'Ac', nameFr: 'Actinium', nameEn: 'Actinium', nameEs: 'Actinio', nameZh: '锕' },
  90: { symbol: 'Th', nameFr: 'Thorium', nameEn: 'Thorium', nameEs: 'Torio', nameZh: '钍' },
  91: { symbol: 'Pa', nameFr: 'Protactinium', nameEn: 'Protactinium', nameEs: 'Protactinio', nameZh: '镤' },
  92: { symbol: 'U', nameFr: 'Uranium', nameEn: 'Uranium', nameEs: 'Uranio', nameZh: '铀' },
  93: { symbol: 'Np', nameFr: 'Neptunium', nameEn: 'Neptunium', nameEs: 'Neptunio', nameZh: '镎' },
  94: { symbol: 'Pu', nameFr: 'Plutonium', nameEn: 'Plutonium', nameEs: 'Plutonio', nameZh: '钚' },
  95: { symbol: 'Am', nameFr: 'Américium', nameEn: 'Americium', nameEs: 'Americio', nameZh: '镅' },
  96: { symbol: 'Cm', nameFr: 'Curium', nameEn: 'Curium', nameEs: 'Curio', nameZh: '锔' },
  97: { symbol: 'Bk', nameFr: 'Berkélium', nameEn: 'Berkelium', nameEs: 'Berkelio', nameZh: '锫' },
  98: { symbol: 'Cf', nameFr: 'Californium', nameEn: 'Californium', nameEs: 'Californio', nameZh: '锎' },
  99: { symbol: 'Es', nameFr: 'Einsteinium', nameEn: 'Einsteinium', nameEs: 'Einstenio', nameZh: '锿' },
  100: { symbol: 'Fm', nameFr: 'Fermium', nameEn: 'Fermium', nameEs: 'Fermio', nameZh: '镄' },
  101: { symbol: 'Md', nameFr: 'Mendélévium', nameEn: 'Mendelevium', nameEs: 'Mendelevio', nameZh: '钔' },
  102: { symbol: 'No', nameFr: 'Nobélium', nameEn: 'Nobelium', nameEs: 'Nobelio', nameZh: '锘' },
  103: { symbol: 'Lr', nameFr: 'Lawrencium', nameEn: 'Lawrencium', nameEs: 'Lawrencio', nameZh: '铹' },
  104: { symbol: 'Rf', nameFr: 'Rutherfordium', nameEn: 'Rutherfordium', nameEs: 'Rutherfordio', nameZh: '𬬻' },
  105: { symbol: 'Db', nameFr: 'Dubnium', nameEn: 'Dubnium', nameEs: 'Dubnio', nameZh: '𬭊' },
  106: { symbol: 'Sg', nameFr: 'Seaborgium', nameEn: 'Seaborgium', nameEs: 'Seaborgio', nameZh: '𬭳' },
  107: { symbol: 'Bh', nameFr: 'Bohrium', nameEn: 'Bohrium', nameEs: 'Bohrio', nameZh: '𬭛' },
  108: { symbol: 'Hs', nameFr: 'Hassium', nameEn: 'Hassium', nameEs: 'Hasio', nameZh: '𬭶' },
  109: { symbol: 'Mt', nameFr: 'Meitnerium', nameEn: 'Meitnerium', nameEs: 'Meitnerio', nameZh: '鿏' },
  110: { symbol: 'Ds', nameFr: 'Darmstadtium', nameEn: 'Darmstadtium', nameEs: 'Darmstatio', nameZh: '𫟼' },
  111: { symbol: 'Rg', nameFr: 'Roentgenium', nameEn: 'Roentgenium', nameEs: 'Roentgenio', nameZh: '𬬭' },
  112: { symbol: 'Cn', nameFr: 'Copernicium', nameEn: 'Copernicium', nameEs: 'Copernicio', nameZh: '鿔' },
  113: { symbol: 'Nh', nameFr: 'Nihonium', nameEn: 'Nihonium', nameEs: 'Nihonio', nameZh: '鿭' },
  114: { symbol: 'Fl', nameFr: 'Flérovium', nameEn: 'Flerovium', nameEs: 'Flerovio', nameZh: '𫓧' },
  115: { symbol: 'Mc', nameFr: 'Moscovium', nameEn: 'Moscovium', nameEs: 'Moscovio', nameZh: '镆' },
  116: { symbol: 'Lv', nameFr: 'Livermorium', nameEn: 'Livermorium', nameEs: 'Livermorio', nameZh: '𫟷' },
  117: { symbol: 'Ts', nameFr: 'Tennessine', nameEn: 'Tennessine', nameEs: 'Teneso', nameZh: '鿬' },
  118: { symbol: 'Og', nameFr: 'Oganesson', nameEn: 'Oganesson', nameEs: 'Oganesón', nameZh: '鿫' },
};

export function getElementName(z: number, lang: Language = 'fr', fallback: string = ''): string {
  const el = ELEMENT_SYMBOLS[z];
  if (!el) return fallback || `Z=${z}`;
  switch (lang) {
    case 'en':
      return el.nameEn;
    case 'es':
      return el.nameEs;
    case 'zh':
      return el.nameZh;
    case 'fr':
    default:
      return el.nameFr;
  }
}

export const DEFAULT_DECAY_SETTINGS: DecaySettings = {
  baseTime: 2.0, // 2.0s when half-life is 1 second (log10 = 0)
  slope: 0.5, // +0.5s per decade of half-life
  minTime: 0.5, // clamp floor so user can always see/react
  maxTime: 8.0, // clamp ceiling so user does not wait indefinitely
  isStochastic: false, // deterministic by default
};

export function calculateGameDecayTime(
  halfLifeSeconds: number,
  settings: DecaySettings = DEFAULT_DECAY_SETTINGS
): number {
  if (halfLifeSeconds <= 0) return 0;

  const log10Val = Math.log10(halfLifeSeconds);
  const nominalSeconds = settings.baseTime + settings.slope * log10Val;
  const clamped = Math.max(settings.minTime, Math.min(settings.maxTime, nominalSeconds));

  if (settings.isStochastic) {
    const u = Math.max(1e-6, Math.random());
    const stochastic = -clamped * Math.log(u);
    return Math.max(0.3, Math.min(settings.maxTime * 1.5, stochastic));
  }

  return clamped;
}

export function formatHalfLife(seconds: number, lang: Language = 'fr'): string {
  const units = {
    fr: { inf: 'Stable (Infini)', d: 'jours', y: 'ans', ga: "Ga (milliards d'années)" },
    en: { inf: 'Stable (Infinite)', d: 'days', y: 'yrs', ga: 'Ga (billion yrs)' },
    es: { inf: 'Estable (Infinito)', d: 'días', y: 'años', ga: 'Ga (mil M años)' },
    zh: { inf: '稳定 (无限)', d: '天', y: '年', ga: 'Ga (十亿年)' },
  }[lang];

  if (seconds === -1 || seconds === null || seconds === undefined) {
    return units.inf;
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
    return `${(seconds / 86400).toFixed(1)} ${units.d}`;
  }
  const years = seconds / 31557600;
  if (years < 1e6) {
    return `${years.toFixed(1)} ${units.y}`;
  }
  if (years < 1e9) {
    return `${(years / 1e6).toFixed(2)} Ma`;
  }
  return `${(years / 1e9).toFixed(2)} ${units.ga}`;
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
