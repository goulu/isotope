import { creerPastilleIsotope } from "./pastille";

/**
 * Affiche toutes les pastilles d'isotopes dans un tableau HTML avec X=Z et Y=A.
 * @param data Données JSON des isotopes (tableau d'éléments)
 * @param container Élément HTML où insérer le tableau
 */
export function displayIsotopeTable(data: any[], container: HTMLElement) {
  // Trouver les bornes pour Z et A
  let minZ = Infinity, maxZ = -Infinity, minA = Infinity, maxA = -Infinity;
  for (const el of data) {
    for (const iso of el.isotopes) {
      if (iso.Z < minZ) minZ = iso.Z;
      if (iso.Z > maxZ) maxZ = iso.Z;
      if (iso.A < minA) minA = iso.A;
      if (iso.A > maxA) maxA = iso.A;
    }
  }
  const rows = maxA - minA + 1;
  const cols = maxZ - minZ + 1;
  // Créer le tableau
  const table = document.createElement('table');
  table.style.borderCollapse = 'collapse';
  for (let a = maxA; a >= minA; a--) {
    const tr = document.createElement('tr');
    for (let z = minZ; z <= maxZ; z++) {
      const td = document.createElement('td');
      td.style.width = '72px';
      td.style.height = '72px';
      td.style.textAlign = 'center';
      td.style.verticalAlign = 'middle';
      td.style.padding = '0';
      // Chercher l'isotope correspondant
      let found = null;
      for (const el of data) {
        found = el.isotopes.find((iso: any) => iso.A === a && iso.Z === z);
        if (found) break;
      }
      if (found) {
        td.appendChild(creerPastilleIsotope(found));
      }
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  container.innerHTML = '';
  container.appendChild(table);
}
