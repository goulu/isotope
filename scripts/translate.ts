/**
 * Automated build-time translation script using @google/genai (Option 3)
 * Usage:
 *   npm run translate          # Translates only new/missing strings & levels from French into EN, ES, ZH
 *   npm run translate -- --force # Re-translates all strings & levels from French into EN, ES, ZH
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const TARGET_LANGS = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'zh', name: 'Simplified Chinese' },
] as const;

const force = process.argv.includes('--force');
const rootDir = path.resolve(import.meta.dirname, '..');
const localesDir = path.join(rootDir, 'src', 'i18n', 'locales');
const levelsPath = path.join(rootDir, 'public', 'levels.json');

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  const frUi = JSON.parse(fs.readFileSync(path.join(localesDir, 'fr.json'), 'utf-8')) as Record<string, string>;
  const levels = JSON.parse(fs.readFileSync(levelsPath, 'utf-8')) as Array<{
    id: number;
    title: string;
    description: string;
    i18n?: Record<string, { title: string; description: string }>;
  }>;

  let ai: GoogleGenAI | null = null;
  const getAi = () => {
    if (!ai) {
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        throw new Error('GEMINI_API_KEY is required in .env to generate new translations.');
      }
      ai = new GoogleGenAI({ apiKey });
    }
    return ai;
  };

  // 1. Sync UI Locales
  for (const target of TARGET_LANGS) {
    const targetPath = path.join(localesDir, `${target.code}.json`);
    const existing: Record<string, string> = fs.existsSync(targetPath)
      ? JSON.parse(fs.readFileSync(targetPath, 'utf-8'))
      : {};

    const missingKeys = Object.keys(frUi).filter((k) => force || !(k in existing));
    if (missingKeys.length === 0) {
      console.log(`[i18n] UI locale '${target.code}' is up to date (${Object.keys(existing).length} keys).`);
      continue;
    }

    const toTranslate: Record<string, string> = {};
    for (const k of missingKeys) {
      toTranslate[k] = frUi[k];
    }

    console.log(`[i18n] Translating ${missingKeys.length} UI keys to ${target.name} (${target.code})...`);
    const response = await getAi().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Translate the following JSON dictionary from French to ${target.name} for a scientific nuclear physics game called "Isotope". Keep placeholders like {n}, {e}, {done}, {total}, {base}, {slope}, {min}, {max} intact. Return ONLY valid JSON.\n\n${JSON.stringify(toTranslate, null, 2)}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const translated = JSON.parse(response.text || '{}') as Record<string, string>;
    const merged: Record<string, string> = {};
    for (const k of Object.keys(frUi)) {
      merged[k] = translated[k] ?? existing[k] ?? frUi[k];
    }
    fs.writeFileSync(targetPath, JSON.stringify(merged, null, 2) + '\n', 'utf-8');
    console.log(`[i18n] Updated ${targetPath}`);
  }

  // 2. Sync Levels in public/levels.json
  let levelsUpdated = false;
  for (const lvl of levels) {
    if (!lvl.i18n) lvl.i18n = {};
    for (const target of TARGET_LANGS) {
      if (!force && lvl.i18n[target.code]?.title && lvl.i18n[target.code]?.description) {
        continue;
      }
      console.log(`[i18n] Translating Level ${lvl.id} to ${target.name} (${target.code})...`);
      const response = await getAi().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Translate this nuclear physics game level title and description from French to ${target.name}. Preserve scientific symbols (⚛, ⚡, Beta-, Alpha) and isotope symbols. Return ONLY valid JSON with "title" and "description" keys.\n\n${JSON.stringify({ title: lvl.title, description: lvl.description }, null, 2)}`,
        config: {
          responseMimeType: 'application/json',
        },
      });
      lvl.i18n[target.code] = JSON.parse(response.text || '{}');
      levelsUpdated = true;
    }
  }

  if (levelsUpdated) {
    fs.writeFileSync(levelsPath, JSON.stringify(levels, null, 2) + '\n', 'utf-8');
    console.log(`[i18n] Updated ${levelsPath}`);
  } else {
    console.log(`[i18n] All ${levels.length} levels in public/levels.json are up to date for EN, ES, ZH.`);
  }
}

main().catch((err) => {
  console.error('[i18n] Error:', err);
  process.exit(1);
});

