import json
import urllib.request
import urllib.error

# NNDC provides Web API, but the JSON dump is often available from alternative sources like periodictable.com, NIST or Wikipedia parsed datasets
# Let's try to get a comprehensive JSON from a known repository, like the 'Bowserinator/Periodic-Table-JSON' or raw wiki data 

# Instead of relying on an obscure API, let's create a robust python script to fetch from Wikipedia's List of isotopes pages or use a bundled known dataset if available.
# Actually, the quickest way to get a clean dataset of *all* isotopes with half-life and decay modes is to use the `mendeleev` or `periodictable` python packages.

def install_and_extract():
    import subprocess
    import sys
    
    print("Installing mendeleev package...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "mendeleev"])
    
    from mendeleev.fetch import fetch_table
    import pandas as pd
    
    print("Fetching isotopes table...")
    # mendeleev uses pandas under the hood to fetch tables from its sqlite db
    isotopes = fetch_table('isotopes')
    elements = fetch_table('elements')
    
    # We need: protons (atomic_number), neutrons (mass_number - atomic_number) / or electrons (same as protons for neutral atom), half-life, decay mode
    # Let's merge elements for symbol/name
    
    # Actually, mendeleev stores half-life. Decay modes are in `isotope_decay_modes`
    decay_modes = fetch_table('isotope_decay_modes')
    
    # Let's build the JSON
    result = {}
    
    # Merge isotopes with elements to get atomic number (Z) and Symbol
    # isotopes columns: id, element_id, mass_number, abundance, half_life, ...
    # elements columns: atomic_number, symbol, ...
    
    elements_map = {row['atomic_number']: row['symbol'] for _, row in elements.iterrows()}
    
    # Map decay modes
    # isotope_decay_modes columns: id, isotope_id, decay_mode, intensity, ...
    decay_map = {}
    if decay_modes is not None and not decay_modes.empty:
        for _, row in decay_modes.iterrows():
            iso_id = row['isotope_id']
            mode = row['decay_mode']
            if iso_id not in decay_map:
                decay_map[iso_id] = []
            decay_map[iso_id].append(mode)
    
    for _, row in isotopes.iterrows():
        iso_id = row['id']
        atomic_number = row['atomic_number'] # number of protons (and electrons)
        mass_number = row['mass_number']
        half_life = row.get('half_life', None)
        
        # some isotopes are stable, they might have half_life as NaN, None, or infinity
        
        symbol = elements_map.get(atomic_number, str(atomic_number))
        isotope_name = f"{symbol}-{mass_number}"
        
        modes = decay_map.get(iso_id, [])
        is_stable = half_life is None or pd.isna(half_life) or str(half_life).lower() == 'stable'
        
        if is_stable and not modes:
            modes = ["Stable"]
            
        hl_val = None if pd.isna(half_life) else half_life
        
        result[isotope_name] = {
            "protons": int(atomic_number),
            "neutrons": int(mass_number - atomic_number),
            "electrons": int(atomic_number), # assuming neutral
            "massNumber": int(mass_number),
            "halfLife": hl_val, # in seconds usually
            "decayModes": modes,
            "isStable": is_stable
        }

    with open('isotopes.json', 'w') as f:
        json.dump(result, f, indent=2)
        
    print(f"Successfully exported {len(result)} isotopes to isotopes.json")

if __name__ == "__main__":
    install_and_extract()
