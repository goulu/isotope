#!/usr/bin/env python3
"""
Compresses and calibrates isotopes.json with accurate physical half-lives:
- Converts mendeleev half_life units (ys, zs, ns, ms, sec, min, hour, day, year, Myear, Gyear) to SI seconds
- Stores log10(T1/2 in seconds) with 2 decimals (null for stable isotopes)
- Groups isotopes by element symbol with starting neutron number n0
- Dynamic key: ${symbol}-${protons + (n0 + idx)}
"""

import json
import math
import os
import sys

YEAR_SEC = 31557600.0  # Julian year in seconds
UNIT_FACTORS = {
    'ysec': 1e-24,
    'zsec': 1e-21,
    'asec': 1e-18,
    'psec': 1e-12,
    'nsec': 1e-9,
    'usec': 1e-6,
    'msec': 1e-3,
    'sec': 1.0,
    'minute': 60.0,
    'hour': 3600.0,
    'day': 86400.0,
    'year': YEAR_SEC,
    'kyear': 1e3 * YEAR_SEC,
    'Myear': 1e6 * YEAR_SEC,
    'Gyear': 1e9 * YEAR_SEC,
    'Tyear': 1e12 * YEAR_SEC,
    'Pyear': 1e15 * YEAR_SEC,
    'Eyear': 1e18 * YEAR_SEC,
    'Zyear': 1e21 * YEAR_SEC,
    'Yyear': 1e24 * YEAR_SEC,
}

MODES = ['None', 'Beta-', 'Beta+', 'Alpha', 'Proton', 'Neutron']
MODE_TO_IDX = {m: i for i, m in enumerate(MODES)}

def rebuild_and_compress(output_path: str = 'public/isotopes.json') -> None:
    from mendeleev.fetch import fetch_table

    print("Fetching Mendeleev isotopes and elements tables...")
    df_iso = fetch_table('isotopes')
    df_el = fetch_table('elements')

    sym_map = {int(row['atomic_number']): row['symbol'] for _, row in df_el.iterrows()}
    name_map = {int(row['atomic_number']): row['name'] for _, row in df_el.iterrows()}

    # Check if existing output exists to preserve categorized decay modes
    existing_modes = {}
    if os.path.exists(output_path):
        try:
            with open(output_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if 'elements' in data:
                    for s, el in data['elements'].items():
                        z = el['z']
                        n0 = el['n0']
                        for i, pair in enumerate(el['iso']):
                            m_idx = pair[1]
                            mass = z + n0 + i
                            existing_modes[f"{s}-{mass}"] = m_idx
        except Exception as e:
            print(f"Notice: could not read previous decay modes ({e})")

    elements = {}
    for _, row in df_iso.iterrows():
        z = int(row['atomic_number'])
        sym = sym_map[z]
        name = name_map[z]
        mass = int(row['mass_number'])
        n = mass - z
        iso_id = f"{sym}-{mass}"

        val = row['half_life']
        unit = row['half_life_unit']
        is_radio = bool(row['is_radioactive'])

        mode_idx = existing_modes.get(iso_id, 1)

        if val is None or math.isnan(val):
            if is_radio:
                log_val = 0.0  # 1.0 second fallback for unmeasured radioactive
            else:
                log_val = None
                mode_idx = 0
        else:
            sec = float(val) * UNIT_FACTORS.get(unit, 1.0)
            log_val = round(math.log10(sec), 2)
            if mode_idx == 0:
                mode_idx = 1

        elements.setdefault(z, {'sym': sym, 'name': name, 'z': z, 'isotopes': []})
        elements[z]['isotopes'].append((n, log_val, mode_idx))

    out = {'logHalfLife': True, 'modes': MODES, 'elements': {}}
    for z in sorted(elements.keys()):
        d = elements[z]
        d['isotopes'].sort(key=lambda x: x[0])
        n0 = d['isotopes'][0][0]
        out['elements'][d['sym']] = {
            'z': z,
            'name': d['name'],
            'n0': n0,
            'iso': [[v, m] for _, v, m in d['isotopes']]
        }

    lines = ['{', '  "logHalfLife": true,', '  "modes": ' + json.dumps(MODES) + ',', '  "elements": {']
    el_keys = list(out['elements'].keys())
    for i, sym in enumerate(el_keys):
        el = out['elements'][sym]
        comma = ',' if i < len(el_keys) - 1 else ''
        iso_compact = json.dumps(el['iso'], separators=(',', ':'))
        lines.append(f'    "{sym}": {{"z": {el["z"]}, "name": "{el["name"]}", "n0": {el["n0"]}, "iso": {iso_compact}}}{comma}')
    lines.append('  }')
    lines.append('}\n')

    output_str = '\n'.join(lines)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(output_str)

    size = os.path.getsize(output_path)
    print(f"Generated {output_path} with logHalfLife calibration: {size:,} bytes ({size / 1024:.1f} KB).")

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else 'public/isotopes.json'
    rebuild_and_compress(target)
