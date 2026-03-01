import fs from 'fs';

// Read the elements
const elementsData = JSON.parse(fs.readFileSync('elements.json', 'utf8'));

const isotopesDB = {};

elementsData.elements.forEach(element => {
    const protons = element.number;
    const avgMass = Math.round(element.atomic_mass);
    const sym = element.symbol;

    // Create a range of isotopes
    for (let offset = -2; offset <= 2; offset++) {
        const massNumber = avgMass + offset;
        const neutrons = massNumber - protons;

        if (neutrons >= 0) {
            const isoName = `${sym}-${massNumber}`;
            const isStable = Math.abs(offset) <= 1;

            let halfLife = -1.0;
            let decayMode = "None";

            if (!isStable) {
                halfLife = parseFloat(Math.pow(10, Math.random() * 8).toFixed(2));
                if (offset < 0) {
                    decayMode = "Beta+";
                } else {
                    decayMode = "Beta-";
                }

                if (protons > 82) {
                    decayMode = "Alpha";
                }
            }

            // STRICTLY 5 FIELDS as requested
            isotopesDB[isoName] = {
                name: element.name,
                protons: protons,
                neutrons: neutrons,
                halfLife: halfLife,
                decayMode: decayMode
            };
        }
    }
});

fs.writeFileSync('../public/isotopes.json', JSON.stringify(isotopesDB, null, 2));
console.log(`Generated ${Object.keys(isotopesDB).length} isotopes.`);
