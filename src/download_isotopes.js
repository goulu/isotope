import https from 'https';
import fs from 'fs';

// A well-known robust JSON parser of Wikipedia's table of isotopes that provides half-life, decay mode, etc.
// Often found in specific Gists or repos. Let's try downloading from a known compilation of NuDat 3 or similar
// Or write a small parser for the CSV from IAEA/NNDC if we can find a direct link...

// Actually, fetching from a ready-made JSON is best.
const ISOTOPES_URL = 'https://raw.githubusercontent.com/tlorimer/Isotopes/master/isotopes.json';

https.get(ISOTOPES_URL, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            console.log(`Successfully downloaded and parsed ${Object.keys(parsed).length || parsed.length} isotopes.`);
            fs.writeFileSync('isotopes.json', JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.error("Failed to parse JSON", e);
            // fallback: Try another source
            fetchFromAnotherSource();
        }
    });
}).on('error', err => {
    console.error('Error fetching: ', err);
    fetchFromAnotherSource();
});

function fetchFromAnotherSource() {
    console.log("Trying alternative source: periodictable.com / wolfram");
    // Alternatively, I can generate a subset of the main isotopes we care about just to unblock the game
    // For a game, we might not need all 3000+, but maybe the first 118 elements' main isotopes 
    // Let's generate a basic set of stable isotopes + some common unstable ones if we still fail.
}
