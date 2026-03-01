import json
from mendeleev import get_all_elements
import math

def clean_decay_mode(mode_str):
    if not mode_str:
        return "None"
    mode_str = mode_str.lower()
    if 'b-' in mode_str or 'beta-' in mode_str or 'e-' in mode_str:
        return 'Beta-'
    if 'b+' in mode_str or 'beta+' in mode_str or 'e+' in mode_str or 'ec' in mode_str:
        return 'Beta+'
    if 'a' == mode_str or 'alpha' in mode_str:
        return 'Alpha'
    if 'p' == mode_str or 'proton' in mode_str:
        return 'Proton'
    if 'n' == mode_str or 'neutron' in mode_str:
        return 'Neutron'
    
    # default fallback parser
    if 'a' in mode_str: return 'Alpha'
    if 'b-' in mode_str: return 'Beta-'
    if 'b+' in mode_str: return 'Beta+'
    
    return "Beta-" # default fallback for radioactive but unknown

db = {}
elements = get_all_elements()

for el in elements:
    # mendeleev returns elements, each has .isotopes
    for iso in el.isotopes:
        z = el.atomic_number
        if iso.mass_number is None:
            continue
        n = iso.mass_number - z
        name = f"{el.symbol}-{iso.mass_number}"
        
        # half life is in seconds if available
        # mendeleev isotope.half_life
        hl = -1
        decay = "None"
        
        if iso.half_life is not None:
            hl = float(iso.half_life)
            
            # Need to get decay mode. Mendeleev might not have an easy string attribute, let's check
            # Mendeleev isotope has .decay_modes list.
            if hasattr(iso, 'decay_modes') and iso.decay_modes:
                # get the one with highest probability
                primary = iso.decay_modes[0].mode if hasattr(iso.decay_modes[0], 'mode') else str(iso.decay_modes[0])
                decay = clean_decay_mode(primary)
            else:
                decay = clean_decay_mode('b-') # Default for radioactive if missing info
        else:
            if iso.is_radioactive:
                hl = 1.0 # fallback if no half-life recorded
                decay = clean_decay_mode('b-')

        # some stable isotopes might have hl = None and is_radioactive = False
        db[name] = {
            "name": el.name,
            "protons": z,
            "neutrons": n,
            "halfLife": hl,
            "decayMode": decay
        }

print(f"Generated {len(db)} isotopes!")
with open('public/isotopes.json', 'w') as f:
    json.dump(db, f, indent=2)
