import json

with open('public/isotopes.json') as f:
    raw_data = json.load(f)

modes = raw_data['modes']
elements = raw_data['elements']
log_half = raw_data.get('logHalfLife', False)

db = {}
z_to_sym = {}
real_stables = []

for sym, el in elements.items():
    z = el['z']
    z_to_sym[z] = sym
    n0 = el['n0']
    for i, iso in enumerate(el['iso']):
        neutrons = n0 + i
        mass = z + neutrons
        iso_id = f"{sym}-{mass}"
        val, mode_idx = iso
        if val is None or val == -1:
            hl = -1
        elif log_half:
            hl = 10**val
        else:
            hl = val
        mode = modes[mode_idx]
        db[iso_id] = {
            'id': iso_id,
            'z': z,
            'n': neutrons,
            'mass': mass,
            'halfLife': hl,
            'decayMode': mode,
            'sym': sym
        }
        if hl == -1:
            real_stables.append(iso_id)

def get_iso_by_zn(z, n):
    sym = z_to_sym.get(z)
    if not sym:
        return None
    return db.get(f"{sym}-{z+n}")

def decay(iso_id):
    iso = db.get(iso_id)
    if not iso or iso['halfLife'] == -1:
        return None
    z, n = iso['z'], iso['n']
    mode = iso['decayMode']
    if mode == 'Alpha':
        z -= 2; n -= 2
    elif mode == 'Beta-':
        z += 1; n -= 1
    elif mode == 'Beta+':
        z -= 1; n += 1
    elif mode == 'Proton':
        z -= 1
    elif mode == 'Neutron':
        n -= 1
    else:
        return None
    target = get_iso_by_zn(z, n)
    return target['id'] if target else None

def solve(start_iso, target_iso, max_n, max_e, max_p, max_steps=14):
    solutions = []
    traps = []
    queue = [(start_iso, max_n, max_e, max_p, [start_iso])]
    
    while queue:
        iso, n, e, p, hist = queue.pop(0)
        if len(hist) > max_steps:
            continue
        cur = db.get(iso)
        if not cur:
            continue
        is_stable = (cur['halfLife'] == -1)
        if iso == target_iso and is_stable:
            solutions.append(hist)
            if len(solutions) > 5:
                break
            continue
        if is_stable and iso != target_iso and n == 0 and e == 0 and p == 0:
            traps.append((hist, iso))
            continue
            
        # Particles
        if n > 0:
            nxt = get_iso_by_zn(cur['z'], cur['n'] + 1)
            if nxt:
                queue.append((nxt['id'], n - 1, e, p, hist + [f"(+n){nxt['id']}"]))
        if e > 0:
            nxt = get_iso_by_zn(cur['z'] - 1, cur['n'] + 1)
            if nxt:
                queue.append((nxt['id'], n, e - 1, p, hist + [f"(+e){nxt['id']}"]))
        if p > 0:
            nxt = get_iso_by_zn(cur['z'] + 1, cur['n'])
            if nxt:
                queue.append((nxt['id'], n, e, p - 1, hist + [f"(+p){nxt['id']}"]))
        if not is_stable:
            d = decay(iso)
            if d:
                queue.append((d, n, e, p, hist + [f"[{cur['decayMode']}]{d}"]))
                
    return solutions, traps
