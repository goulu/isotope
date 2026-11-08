import json
from scripts.engine import solve, db

with open('public/levels.json') as f:
    levels = json.load(f)

print(f"Loaded {len(levels)} levels.")
for lvl in levels:
    s = lvl["startIsotope"]
    t = lvl["targetIsotope"]
    n = lvl.get("maxNeutrons", 0)
    e = lvl.get("maxElectrons", 0)
    p = lvl.get("maxProtons", 0)
    
    start_iso = db.get(s)
    target_iso = db.get(t)
    assert start_iso is not None, f"Level {lvl['id']}: Start {s} not found"
    assert target_iso is not None, f"Level {lvl['id']}: Target {t} not found"
    
    sols, traps = solve(s, t, n, e, p)
    print(f"L{lvl['id']:02d}: {s} -> {t} (n={n}, e={e}, p={p}) | sols={len(sols)}, traps={len(traps)}")
    assert len(sols) >= 1, f"Level {lvl['id']} has no solution!"

print("\nALL 23 LEVELS ARE SOLVABLE AND VERIFIED!")
