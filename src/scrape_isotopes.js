import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function scrapeWikipedia() {
    try {
        console.log("Fetching Wikipedia List of radioactive isotopes by half-life...");
        const { data } = await axios.get('https://en.wikipedia.org/wiki/List_of_radioactive_isotopes_by_half-life');
        const $ = cheerio.load(data);

        const isotopes = {};

        // Find tables
        $('table.wikitable tbody tr').each((i, row) => {
            const cols = $(row).find('td');
            if (cols.length >= 4) {
                // We need to parse: Isotope, Half-life, Decay mode
                const isoNameRaw = $(cols[0]).text().trim();
                const halfLifeRaw = $(cols[1]).text().trim();
                const decayModeRaw = $(cols[3]).text().trim();

                // isoNameRaw often like "Carbon-14", "Uranium-235"
                if (isoNameRaw) {
                    isotopes[isoNameRaw] = {
                        halfLife: halfLifeRaw,
                        decayModes: [decayModeRaw.split(' ')[0]], // roughly
                        isStable: false
                    };
                }
            }
        });

        console.log(`Parsed ${Object.keys(isotopes).length} unstable isotopes from Wikipedia.`);

        // This is not complete (missing protons/neutrons/electrons)
        // A much better and structured way is to rely on an existing JSON database like "periodic-table" which has isotopes.

    } catch (err) {
        console.error(err);
    }
}

// Alternatively, let's use a known dedicated isotope JSON from a chemistry API
async function fetchFromChemistryAPI() {
    // Actually, there's a fantastic repo: "Bowserinator/Periodic-Table-JSON"
    // He doesn't have isotopes directly in the main file but there are a few extensions.

    // Instead of spending 30 minutes scraping and cleaning, we can generate our own deterministic JSON for the game.
    // The user wants: "un fichier local contenant tous les isotopes connus avec : le nombre de protons, le nombre d'électrons, la demi-vie et le mode de désintégration principal"
    // Let's use the Python `mendeleev` or `periodictable` package again. I will write a simple Python script and run it properly without breaking.
    console.log("Switching back to Python to use the robust `periodictable` package.");
}

fetchFromChemistryAPI();
