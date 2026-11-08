export type DecayMode = 'None' | 'Beta-' | 'Beta+' | 'Alpha' | 'Proton' | 'Neutron';

export interface IsotopeData {
  name: string;
  protons: number;
  neutrons: number;
  halfLife: number; // in seconds (-1 for stable)
  decayMode: DecayMode;
}

export interface Isotope extends IsotopeData {
  id: string; // e.g. "O-19"
  symbol: string; // e.g. "O"
  mass: number; // protons + neutrons, e.g. 19
}

export interface CompressedIsotopeElement {
  z: number;
  name: string;
  n0: number;
  iso: [number | null, number][]; // [halfLife (or log10(T1/2) in seconds, null for stable), decayModeIndex]
}

export interface CompressedIsotopesFile {
  logHalfLife?: boolean;
  modes: DecayMode[];
  elements: Record<string, CompressedIsotopeElement>;
}

export type Language = 'fr' | 'en' | 'es' | 'zh';

export interface LevelTranslation {
  title: string;
  description: string;
}

export interface LevelData {
  id: number;
  title: string;
  description: string;
  startIsotope: string;
  targetIsotope: string;
  maxNeutrons: number;
  maxElectrons: number;
  maxProtons?: number;
  i18n?: Partial<Record<Language, LevelTranslation>>;
}

export interface DecaySettings {
  baseTime: number; // baseline game time in seconds (default 2.0s)
  slope: number; // seconds per decade of half-life (default 0.5s / decade)
  minTime: number; // minimum reaction time (default 0.5s)
  maxTime: number; // maximum game decay wait (default 8.0s)
  isStochastic: boolean; // if true, uses exponential Poisson survival distribution around mean
}

export interface DecayEvent {
  fromIsotope: string;
  toIsotope: string;
  decayMode: DecayMode;
  emittedParticle: string;
  timestamp: number;
}
