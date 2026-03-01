import json
import subprocess
import sys

def install_and_run():
    # Install periodictable which contains isotope data
    subprocess.check_call([sys.executable, "-m", "pip", "install", "periodictable"])
    
    import periodictable as pt
    
    isotopes_data = {}
    
    for el in pt.elements:
        if el.symbol == 'n': continue # skip neutron element
        for iso in el:
            name = f"{el.symbol}-{iso.isotope}"
            
            # Extract data
            protons = el.number
            neutrons = iso.isotope - protons
            electrons = protons # neutral atom
            
            # periodictable doesn't natively expose half-life easily without parsing, but it has some mass data
            # Let's see if we can get half_life and decay mode.
            pass

install_and_run()
