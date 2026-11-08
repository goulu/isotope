import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

const I18N_DIR = path.resolve('src/i18n');
const PUBLIC_DIR = path.resolve('public');

const LANGS = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'zh', label: '中文' },
];

const UI_TEXT = {
  fr: {
    backToGame: "← Jouer",
    manual: "📖 Manuel",
    levels: "🎯 Niveaux",
    footer: "ISOThOPE — Jeu scientifique interactif de physique nucléaire • Conçu par Philippe Guglielmetti (Dr. Goulu)",
    aboutArticle: "Article de présentation",
    githubRepo: "Code source GitHub"
  },
  en: {
    backToGame: "← Play Game",
    manual: "📖 Manual",
    levels: "🎯 Levels",
    footer: "ISOThOPE — Interactive nuclear physics game • Designed by Philippe Guglielmetti (Dr. Goulu)",
    aboutArticle: "About the game",
    githubRepo: "GitHub source"
  },
  es: {
    backToGame: "← Jugar",
    manual: "📖 Manual",
    levels: "🎯 Niveles",
    footer: "ISOThOPE — Juego científico interactivo de física nuclear • Creado por Philippe Guglielmetti (Dr. Goulu)",
    aboutArticle: "Artículo de presentación",
    githubRepo: "Código fuente GitHub"
  },
  zh: {
    backToGame: "← 返回游戏",
    manual: "📖 游戏手册",
    levels: "🎯 关卡指南",
    footer: "ISOThOPE — 互动核物理科学游戏 • 作者：Philippe Guglielmetti (Dr. Goulu)",
    aboutArticle: "游戏介绍文章",
    githubRepo: "GitHub 源码"
  }
};

const STYLES = `
  :root {
    --bg-main: #09090b;
    --bg-card: #121215;
    --bg-card-alt: #18181b;
    --border-color: #27272a;
    --border-accent: #38bdf8;
    --text-main: #f4f4f5;
    --text-muted: #a1a1aa;
    --text-heading: #ffffff;
    --accent-sky: #38bdf8;
    --accent-sky-hover: #7dd3fc;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background-color: var(--bg-main);
    color: var(--text-main);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    line-height: 1.65;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  a { color: var(--accent-sky); text-decoration: none; transition: color 0.15s; }
  a:hover { color: var(--accent-sky-hover); text-decoration: underline; }

  /* Navigation Bar */
  header.nav-header {
    position: sticky;
    top: 0;
    z-index: 50;
    background-color: rgba(9, 9, 11, 0.88);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border-color);
    padding: 0.75rem 1rem;
  }
  .nav-container {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }
  .nav-brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .brand-badge {
    font-weight: 800;
    font-size: 1.05rem;
    color: #fff;
    background: linear-gradient(135deg, #38bdf8 0%, #a855f7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .nav-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.4rem 0.75rem;
    border-radius: 0.75rem;
    font-size: 0.825rem;
    font-weight: 600;
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    color: var(--text-main);
    text-decoration: none !important;
    transition: all 0.15s;
  }
  .nav-btn:hover {
    background-color: var(--bg-card-alt);
    border-color: #3f3f46;
    color: #fff;
  }
  .nav-btn.active {
    background-color: #0284c7;
    border-color: #38bdf8;
    color: #fff;
  }
  .nav-group {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;
  }
  .lang-switcher {
    display: flex;
    align-items: center;
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 0.75rem;
    padding: 0.2rem;
    gap: 0.2rem;
  }
  .lang-btn {
    padding: 0.25rem 0.55rem;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
    text-decoration: none !important;
    transition: all 0.15s;
  }
  .lang-btn:hover {
    color: #fff;
  }
  .lang-btn.active {
    background-color: #27272a;
    color: var(--accent-sky);
  }

  /* Main Document Container */
  main.doc-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1.25rem 4rem;
    flex: 1;
    width: 100%;
  }

  /* Typography */
  h1 {
    font-size: 2rem;
    font-weight: 800;
    color: var(--text-heading);
    margin-bottom: 1.25rem;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.75rem;
  }
  h2 {
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--text-heading);
    margin-top: 2rem;
    margin-bottom: 0.75rem;
    border-bottom: 1px solid #1f1f23;
    padding-bottom: 0.4rem;
  }
  h3 {
    font-size: 1.15rem;
    font-weight: 700;
    color: #e4e4e7;
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
  }
  p {
    margin-bottom: 1rem;
    color: #d4d4d8;
  }
  ul, ol {
    margin-bottom: 1.25rem;
    padding-left: 1.5rem;
  }
  li {
    margin-bottom: 0.4rem;
    color: #d4d4d8;
  }
  hr {
    border: none;
    border-top: 1px solid var(--border-color);
    margin: 2rem 0;
  }
  code {
    background-color: #18181b;
    border: 1px solid var(--border-color);
    padding: 0.15rem 0.4rem;
    border-radius: 0.35rem;
    font-size: 0.85em;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    color: #38bdf8;
  }
  blockquote {
    border-left: 4px solid var(--border-accent);
    background-color: #0f172a;
    padding: 0.75rem 1rem;
    border-radius: 0 0.75rem 0.75rem 0;
    margin: 1.25rem 0;
    color: #cbd5e1;
  }
  blockquote p:last-child {
    margin-bottom: 0;
  }

  /* Tables */
  .table-wrapper {
    width: 100%;
    overflow-x: auto;
    margin: 1.5rem 0;
    border-radius: 0.75rem;
    border: 1px solid var(--border-color);
    background-color: var(--bg-card);
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
    text-align: left;
  }
  th {
    background-color: #1c1c21;
    color: #ffffff;
    font-weight: 700;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--border-color);
  }
  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #1c1c20;
    color: #d4d4d8;
  }
  tr:last-child td {
    border-bottom: none;
  }
  tr:nth-child(even) {
    background-color: rgba(255, 255, 255, 0.02);
  }

  /* Footer */
  footer.doc-footer {
    border-top: 1px solid var(--border-color);
    background-color: #060608;
    padding: 1.5rem 1rem;
    font-size: 0.85rem;
    color: var(--text-muted);
    text-align: center;
  }
  .footer-links {
    display: flex;
    justify-content: center;
    gap: 1.25rem;
    margin-top: 0.5rem;
  }
`;

function renderPage({ section, lang, title, bodyHtml, isIndex = false }) {
  const ui = UI_TEXT[lang] || UI_TEXT.fr;
  const isManual = section === 'manual';

  // Navigation Links
  const gameLink = '../';
  const manualLink = isManual ? (isIndex ? 'index.html' : `${lang}.html`) : `../manual/${lang}.html`;
  const levelsLink = !isManual ? (isIndex ? 'index.html' : `${lang}.html`) : `../levels/${lang}.html`;

  const langButtons = LANGS.map(l => {
    const active = l.code === lang ? 'active' : '';
    const href = `${l.code}.html`;
    return `<a href="${href}" class="lang-btn ${active}">${l.label}</a>`;
  }).join('');

  // Table wrapper transformation
  const processedBody = bodyHtml.replace(/<table>/g, '<div class="table-wrapper"><table>').replace(/<\/table>/g, '</table></div>');

  const fullTitle = title.includes('ISOThOPE') ? title : `${title} — ISOThOPE`;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fullTitle}</title>
  <meta name="description" content="${fullTitle} pour ISOThOPE, le jeu scientifique de transmutation nucléaire.">
  <link rel="icon" href="../favicon.ico">
  ${isIndex ? `
  <script>
    try {
      const saved = localStorage.getItem('isotope_lang');
      if (saved && saved !== '${lang}' && ['fr','en','es','zh'].includes(saved)) {
        window.location.replace(saved + '.html');
      }
    } catch(e) {}
  </script>` : ''}
  <style>
    ${STYLES}
  </style>
</head>
<body>
  <header class="nav-header">
    <div class="nav-container">
      <div class="nav-brand">
        <a href="${gameLink}" class="brand-badge">⚛ ISOThOPE</a>
        <a href="${gameLink}" class="nav-btn">${ui.backToGame}</a>
      </div>
      <div class="nav-group">
        <a href="${manualLink}" class="nav-btn ${isManual ? 'active' : ''}">${ui.manual}</a>
        <a href="${levelsLink}" class="nav-btn ${!isManual ? 'active' : ''}">${ui.levels}</a>
        <div class="lang-switcher">
          ${langButtons}
        </div>
      </div>
    </div>
  </header>

  <main class="doc-content">
    ${processedBody}
  </main>

  <footer class="doc-footer">
    <p>${ui.footer}</p>
    <div class="footer-links">
      <a href="https://drgoulu.com/en/2026/11/06/isothope-my-radioactive-game/" target="_blank" rel="noopener noreferrer">${ui.aboutArticle}</a>
      <span>•</span>
      <a href="https://github.com/goulu/isotope" target="_blank" rel="noopener noreferrer">${ui.githubRepo}</a>
      <span>•</span>
      <a href="${gameLink}">ISOThOPE Game</a>
    </div>
  </footer>
</body>
</html>`;
}

function buildSection(section) {
  const srcDir = path.join(I18N_DIR, section);
  const outDir = path.join(PUBLIC_DIR, section);

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const langObj of LANGS) {
    const lang = langObj.code;
    const mdPath = path.join(srcDir, `${lang}.md`);
    if (!fs.existsSync(mdPath)) {
      console.warn(`File not found: ${mdPath}`);
      continue;
    }

    const mdContent = fs.readFileSync(mdPath, 'utf-8');
    const bodyHtml = marked.parse(mdContent);

    // Extract title from first H1 if available
    const firstH1Match = mdContent.match(/^#\s+(.+)$/m);
    const title = firstH1Match ? firstH1Match[1].trim() : (section === 'manual' ? 'Manuel' : 'Niveaux');

    const html = renderPage({ section, lang, title, bodyHtml });
    const outPath = path.join(outDir, `${lang}.html`);
    fs.writeFileSync(outPath, html, 'utf-8');
    console.log(`Generated: ${outPath}`);

    // If French, also generate index.html as the primary landing page
    if (lang === 'fr') {
      const indexHtml = renderPage({ section, lang, title, bodyHtml, isIndex: true });
      const indexPath = path.join(outDir, 'index.html');
      fs.writeFileSync(indexPath, indexHtml, 'utf-8');
      console.log(`Generated: ${indexPath}`);
    }
  }
}

console.log("=== BUILDING STATIC HTML DOCUMENTATION ===");
buildSection('manual');
buildSection('levels');
console.log("=== BUILD COMPLETE ===");
