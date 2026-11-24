const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

const SITE_URL = 'https://wiresizematrix.com';
const SITE_NAME = 'WireSizeMatrix';

const awgTable = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'awg_table.json'), 'utf8'));
const breakers = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'breakers.json'), 'utf8'));
const projects = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'projects.json'), 'utf8'));
const conduits = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'conduits.json'), 'utf8'));
const wirePages = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'wire_comparisons.json'), 'utf8'));

const rawCss = fs.readFileSync(path.join(SRC_DIR, 'styles.css'), 'utf8');
const rawJs = fs.readFileSync(path.join(SRC_DIR, 'app.js'), 'utf8');

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>~])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

function minifyJs(js) {
  return js
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('//'))
    .join('\n');
}

const criticalCss = minifyCss(rawCss);
const minifiedJs = minifyJs(rawJs);
const jsHash = crypto.createHash('sha256').update(minifiedJs).digest('hex').slice(0, 8);
const hashedJsFilename = `app.${jsHash}.js`;

const fmt = new Intl.NumberFormat('en-US');

// Global Quick-Jump Datalist
const quickJumpOptionsHtml = [
  ...breakers.filter((b) => b.slug.endsWith('wire-size')).map((b) => `<option value="⚡ ${b.amps} Amp Breaker Wire Size Chart" data-url="/breakers/${b.slug}/"></option>`),
  ...projects.map((p) => `<option value="🔌 ${p.name}" data-url="/projects/${p.slug}/"></option>`),
  ...wirePages.slice(0, 20).map((w) => `<option value="📏 ${w.title.split(':')[0]}" data-url="/wire-gauge/${w.slug}/"></option>`)
].join('');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writePage(relUrlPath, htmlContent, sitemapUrls) {
  const cleanRel = relUrlPath.replace(/^\/+|\/+$/g, '');
  const outDir = cleanRel ? path.join(DIST_DIR, cleanRel) : DIST_DIR;
  ensureDir(outDir);
  fs.writeFileSync(path.join(outDir, 'index.html'), htmlContent, 'utf8');
  const canonicalUrl = cleanRel ? `${SITE_URL}/${cleanRel}/` : `${SITE_URL}/`;
  sitemapUrls.push(canonicalUrl);
}

// Live SVG Conduit Cross-Section & Voltage-Drop Blueprint
function renderWireBlueprintSvg({ cuAwg, alAwg, conduit, amps, distFt, voltage, dropPct }) {
  const deliveredV = (voltage * (1 - dropPct / 100)).toFixed(1);
  return `
  <div class="rig-schematic-box" aria-label="Live Conduit Cross-Section & Voltage-Drop Blueprint">
    <svg class="rig-svg" viewBox="0 0 760 138" role="img" aria-labelledby="wire-svg-title">
      <title id="wire-svg-title">NEC Chapter 9 Conduit Fill Cross-Section and Voltage Drop Schematic</title>
      
      <!-- 1. CONDUIT PIPE CROSS-SECTION (40% NEC FILL ZONE) -->
      <g>
        <rect x="14" y="14" width="175" height="110" rx="6" fill="#090d16" stroke="#475569" stroke-width="1.5"/>
        <text id="svg-conduit-txt" x="101" y="30" fill="#fbbf24" font-family="monospace" font-size="9.5" font-weight="bold" text-anchor="middle">${conduit} CONDUIT (≤40% NEC FILL)</text>
        <!-- Outer Conduit Pipe Wall -->
        <circle cx="101" cy="76" r="38" fill="#1e293b" stroke="#94a3b8" stroke-width="5"/>
        <!-- 40% NEC Max Fill Boundary Ring -->
        <circle cx="101" cy="76" r="24" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="3 2"/>
        <!-- 4 Conductors (L1 Black, L2 Red, Neutral White, Ground Green) -->
        <circle id="svg-wire-c1" cx="89" cy="68" r="11" fill="#0f172a" stroke="#f8fafc" stroke-width="1.5"/>
        <circle id="svg-wire-c2" cx="113" cy="68" r="11" fill="#dc2626" stroke="#f8fafc" stroke-width="1.5"/>
        <circle id="svg-wire-c3" cx="91" cy="89" r="11" fill="#e2e8f0" stroke="#475569" stroke-width="1.5"/>
        <circle id="svg-wire-c4" cx="112" cy="89" r="8" fill="#16a34a" stroke="#ffffff" stroke-width="1.5"/>
      </g>

      <!-- 2. VOLTAGE DROP & HEAT LOSS TRANSMISSION LINE -->
      <g>
        <rect x="204" y="14" width="332" height="110" rx="6" fill="#090d16" stroke="#475569" stroke-width="1.5"/>
        <text x="370" y="32" fill="#94a3b8" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">NEC 210.19 VOLTAGE DROP & CONDUCTOR SIZING</text>

        <!-- Copper Conductor Bar -->
        <line x1="226" y1="54" x2="514" y2="54" stroke="#d97706" stroke-width="7" stroke-linecap="round"/>
        <line x1="226" y1="68" x2="514" y2="68" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" stroke-dasharray="10 4"/>

        <rect id="svg-drop-pill" x="235" y="42" width="270" height="22" rx="3" fill="#16a34a"/>
        <text id="svg-vdrop-txt" x="370" y="57" fill="#ffffff" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">${voltage}V → ${distFt}ft → ${deliveredV}V (${dropPct}% Drop)</text>

        <rect x="235" y="88" width="270" height="22" rx="3" fill="#1e293b"/>
        <text id="svg-cost-txt" x="370" y="103" fill="#38bdf8" font-family="monospace" font-size="10.5" font-weight="bold" text-anchor="middle">Copper vs. Aluminum Cost Analysis Active</text>
      </g>

      <!-- 3. RECOMMENDED NEC WIRE GAUGE CALLOUT -->
      <g>
        <rect x="550" y="14" width="196" height="110" rx="6" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>
        <text x="648" y="34" fill="#94a3b8" font-family="monospace" font-size="9.5" text-anchor="middle">RECOMMENDED NEC GAUGE</text>
        <text id="svg-cu-awg" x="648" y="64" fill="#fbbf24" font-family="monospace" font-size="19" font-weight="bold" text-anchor="middle">${cuAwg} AWG COPPER</text>
        <text id="svg-al-awg" x="648" y="86" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">OR ${alAwg} AWG ALUM</text>
        <text x="648" y="108" fill="#4ade80" font-family="monospace" font-size="9.5" text-anchor="middle">NEC Table 310.16 Verified</text>
      </g>
    </svg>
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;font-family:var(--font-mono);font-size:0.75rem;margin-block-start:0.35rem;color:var(--text-muted);">
      <span>CODE STATUS: <strong id="svg-status-badge" style="color:var(--text);">NEC 310.16 & ≤3% VOLTAGE DROP COMPLIANT</strong></span>
      <span>Load: ${amps}A @ ${voltage}V (${distFt} ft One-Way)</span>
    </div>
  </div>`;
}

// Reusable Interactive Calculator Block
function renderInteractiveCalculator({ amps, distFt, voltage, isContinuous = false, rec }) {
  return `
  <section class="panel isolated-widget" id="wire-calculator">
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:0.5rem;margin-block-end:0.5rem;">
      <h2 style="border:none;margin:0;padding:0;">Interactive NEC Wire Gauge, Voltage Drop & Conduit Fill Calculator</h2>
      <div style="display:flex;flex-wrap:wrap;gap:0.4rem;">
        <button type="button" id="btn-save-circuit" class="binder-btn">📌 Save to Project Binder</button>
        <button type="button" id="btn-copy-wire-link" class="preset-btn">Copy Shareable Spec Link</button>
        <button type="button" id="btn-print-worksheet" class="preset-btn">⎙ Print NEC Wiring Sheet</button>
      </div>
    </div>

    <div class="nec-rule-bar">
      <label class="nec-rule-label">
        <input type="checkbox" id="toggle-continuous-load" ${isContinuous ? 'checked' : ''}>
        <span>⚡ Apply NEC 80% / 125% Continuous Load Rule (EV Chargers, Solar, Water Heaters & Lighting >3 Hours)</span>
      </label>
      <span style="font-family:var(--font-mono);font-size:0.76rem;">Multiplies minimum wire ampacity by 1.25x</span>
    </div>

    ${renderWireBlueprintSvg({
      cuAwg: rec.recommendedCuAwg,
      alAwg: rec.recommendedAlAwg,
      conduit: rec.minConduit,
      amps,
      distFt,
      voltage,
      dropPct: rec.actualDropPct
    })}

    <div class="preset-pills" role="group" aria-label="Quick Electrical Circuit Presets">
      <button type="button" class="preset-btn" data-preset-amps="48" data-preset-dist="50" data-preset-volt="240" data-preset-cont="1">48A EV Charger (60A Brkr)</button>
      <button type="button" class="preset-btn" data-preset-amps="50" data-preset-dist="100" data-preset-volt="240" data-preset-cont="0">50A RV / Hot Tub @ 100ft</button>
      <button type="button" class="preset-btn" data-preset-amps="100" data-preset-dist="125" data-preset-volt="240" data-preset-cont="0">100A Garage Subpanel @ 125ft</button>
      <button type="button" class="preset-btn" data-preset-amps="30" data-preset-dist="75" data-preset-volt="120" data-preset-cont="0">30A 120V RV TT-30 @ 75ft</button>
      <button type="button" class="preset-btn" data-preset-amps="50" data-preset-dist="20" data-preset-volt="12" data-preset-cont="1">12V 50A DC Solar / Trolling</button>
      <button type="button" class="preset-btn" data-preset-amps="200" data-preset-dist="60" data-preset-volt="240" data-preset-cont="0">200A Main Service</button>
    </div>

    <div class="calc-grid">
      <div class="control-group">
        <div class="control-header">
          <label for="input-amps">1. Circuit Load / Breaker Amps (5A – 250A)</label>
          <span id="readout-amps" class="control-readout">${amps} A</span>
        </div>
        <input type="range" id="input-amps" min="5" max="250" step="5" value="${amps}">
      </div>

      <div class="control-group">
        <div class="control-header">
          <label for="input-distance-ft">2. One-Way Wire Run Length (5 – 450 ft)</label>
          <span id="readout-distance" class="control-readout">${fmt.format(distFt)} ft</span>
        </div>
        <input type="range" id="input-distance-ft" min="5" max="450" step="5" value="${distFt}">
      </div>

      <div class="control-group">
        <label for="input-voltage" style="font-weight:700;font-size:0.83rem;display:block;margin-block-end:0.3rem;">3. System Voltage (AC / DC)</label>
        <select id="input-voltage">
          <option value="240" ${voltage === 240 ? 'selected' : ''}>240V AC Single-Phase (Subpanels, EV, Dryers, Ranges, 50A RV)</option>
          <option value="120" ${voltage === 120 ? 'selected' : ''}>120V AC Single-Phase (30A TT-30 RV, Outlets, Sump Pumps)</option>
          <option value="12" ${voltage === 12 ? 'selected' : ''}>12V DC Automotive, RV House Battery & Trolling Motors</option>
          <option value="24" ${voltage === 24 ? 'selected' : ''}>24V DC Off-Grid Solar & Marine</option>
          <option value="48" ${voltage === 48 ? 'selected' : ''}>48V DC Server-Rack Solar Battery Bank</option>
        </select>
      </div>

      <div class="control-group">
        <label for="input-cable-type" style="font-weight:700;font-size:0.83rem;display:block;margin-block-end:0.3rem;">4. Cable & Insulation Rating (NEC 310.16)</label>
        <select id="input-cable-type">
          <option value="thhn75">75°C Column — THHN / THWN-2 in Conduit or Aluminum SER / MHF</option>
          <option value="romex60">60°C Column — Indoor Romex (NM-B) or UF-B Direct Burial (NEC 334.80)</option>
        </select>
      </div>
    </div>

    ${renderAdUnit('midtool', 'calc-mid-ad', 0)}

    <div class="verdict-banner" id="verdict-banner" data-status="safe" role="status" aria-live="polite">
      <div class="verdict-title">
        <span id="verdict-title-text">Evaluating NEC Table 310.16 & Voltage Drop...</span>
        <span class="badge badge-safe" id="verdict-badge">CALCULATING</span>
      </div>
      <p id="verdict-desc" style="margin:0;font-size:0.88rem;"></p>
    </div>

    <div class="gauge-list">
      <div class="gauge-row">
        <div class="gauge-top">
          <span>1. VOLTAGE DROP BUDGET (Target ≤ 3.0% Branch Circuit Loss)</span>
          <span id="gauge-txt-vdrop">--</span>
        </div>
        <div class="gauge-track"><div class="gauge-fill" id="gauge-bar-vdrop"></div></div>
      </div>

      <div class="gauge-row">
        <div class="gauge-top">
          <span>2. NEC TABLE 310.16 AMPACITY UTILIZATION (Design Amps vs Rated Wire Ceiling)</span>
          <span id="gauge-txt-ampacity">--</span>
        </div>
        <div class="gauge-track"><div class="gauge-fill" id="gauge-bar-ampacity"></div></div>
      </div>

      <div class="gauge-row">
        <div class="gauge-top">
          <span>3. NEC CHAPTER 9 CONDUIT FILL (Max 40% Cross-Section Fill for 3+ Conductors)</span>
          <span id="gauge-txt-conduit">--</span>
        </div>
        <div class="gauge-track"><div class="gauge-fill" id="gauge-bar-conduit"></div></div>
      </div>
    </div>

    <div class="spec-kpi-grid" style="margin-block-end:0;">
      <div class="kpi-box highlight">
        <span class="kpi-label">Min Copper Wire</span>
        <span class="kpi-value" id="out-cu-awg">${rec.recommendedCuAwg} AWG</span>
        <span class="kpi-sub">Ground: ${rec.groundAwg}</span>
      </div>
      <div class="kpi-box highlight">
        <span class="kpi-label">Aluminum Equivalent</span>
        <span class="kpi-value" id="out-al-awg">${rec.recommendedAlAwg} AWG</span>
        <span class="kpi-sub">75°C SER / MHF / XHHW</span>
      </div>
      <div class="kpi-box">
        <span class="kpi-label">Actual Voltage Drop</span>
        <span class="kpi-value" id="out-vdrop-pct">${rec.actualDropPct}%</span>
        <span class="kpi-sub">Min Conduit: ${rec.minConduit}</span>
      </div>
      <div class="kpi-box">
        <span class="kpi-label">Material Cost Delta</span>
        <span class="kpi-value" id="out-al-savings">$${fmt.format(rec.estCostCu)}</span>
        <span class="kpi-sub">Al: ~$${fmt.format(rec.estCostAl)}</span>
      </div>
    </div>

    <div class="subpanel-adder" id="subpanel-load-adder">
      <h3>⚡ Multi-Circuit Subpanel Load Adder (Stack Circuits to Size Feeder)</h3>
      <p style="margin:0;font-size:0.8rem;color:var(--text-muted);">Click loads below to add them to your garage/shop subpanel—combined demand amps automatically update the NEC wire gauge calculator above.</p>
      <div class="adder-chips">
        <button type="button" class="adder-chip" data-load-name="48A EV Charger" data-load-amps="48">+ 48A EV Charger</button>
        <button type="button" class="adder-chip" data-load-name="30A Mini-Split" data-load-amps="20">+ 20A Mini-Split</button>
        <button type="button" class="adder-chip" data-load-name="20A Shop Outlets" data-load-amps="16">+ 16A Shop Outlets</button>
        <button type="button" class="adder-chip" data-load-name="50A Welder" data-load-amps="35">+ 35A Welder</button>
        <button type="button" class="adder-chip" data-load-name="15A LED Lights" data-load-amps="8">+ 8A LED Lights</button>
        <button type="button" class="adder-chip" data-load-name="20A Air Compressor" data-load-amps="15">+ 15A Compressor</button>
        <button type="button" class="adder-chip" id="btn-clear-stack" style="border-style:dashed;">Clear Stack</button>
      </div>
      <div class="adder-stack-list" id="adder-stack-list"></div>
      <div style="font-family:var(--font-mono);font-size:0.8rem;font-weight:700;" id="adder-summary">Stacked Load: 0A (Click any circuit above to stack)</div>
    </div>

    <div class="bom-checklist" id="wire-bom-checklist">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-block-end:0.4rem;">
        <h3 style="margin:0;font-size:0.92rem;">🛒 Interactive Permit-Day Shopping &amp; Materials Checklist (Auto-Saved)</h3>
        <span style="font-size:0.75rem;font-family:var(--font-mono);color:var(--text-muted);">Edit prices for your local store • Saves in browser</span>
      </div>
      <div id="bom-items-wrap">
        <div class="bom-row" data-bom-id="wire"><input type="checkbox" id="bom-chk-wire"><label for="bom-chk-wire"><strong id="bom-lbl-wire">${distFt} ft of ${rec.recommendedCuAwg} AWG Copper Conductors</strong></label><input class="bom-price-input" type="number" min="0" value="${rec.estCostCu}" aria-label="Wire cost USD"></div>
        <div class="bom-row" data-bom-id="conduit"><input type="checkbox" id="bom-chk-conduit"><label for="bom-chk-conduit">${Math.ceil(distFt / 10)} × 10-ft Sticks of ${rec.minConduit} Schedule 40 PVC / EMT Conduit</label><input class="bom-price-input" type="number" min="0" value="${Math.ceil(distFt / 10) * 14}" aria-label="Conduit cost USD"></div>
        <div class="bom-row" data-bom-id="breaker"><input type="checkbox" id="bom-chk-breaker"><label for="bom-chk-breaker">${amps}A Circuit Breaker + Weatherproof Disconnect / Subpanel</label><input class="bom-price-input" type="number" min="0" value="${amps >= 60 ? 145 : 42}" aria-label="Breaker cost USD"></div>
        <div class="bom-row" data-bom-id="ground"><input type="checkbox" id="bom-chk-ground"><label for="bom-chk-ground">${rec.groundAwg} Equipment Ground Wire + Grounding Clamps / Noalox</label><input class="bom-price-input" type="number" min="0" value="38" aria-label="Grounding cost USD"></div>
      </div>
      <div class="bom-total-bar">
        <span id="bom-progress-txt">0 / 4 Items Checked</span>
        <span>Est. Project Total: <strong id="bom-grand-total">$0</strong></span>
      </div>
    </div>
  </section>`;
}

function renderAdUnit(slotType, slotId, initialCreativeIdx = 0) {
  const creatives = [
    {
      sponsor: 'Southwire Electrical Supply • CPM Bid: $68.40',
      title: 'Southwire SIMpull® THHN & Romex® NM-B Copper Bulk Spools (6 AWG – 2/0 AWG)',
      desc: 'No-lube SIMpull jacket pulls 50% easier through EMT & Schedule 40 PVC conduit.',
      cta: 'Check Per-Foot Price →'
    },
    {
      sponsor: 'ChargePoint & Tesla EV • CPM Bid: $79.20',
      title: 'ChargePoint Home Flex Level 2 EV Charger (Up to 50A / 60A Hardwired)',
      desc: 'UL-Listed 75°C terminal block accepts 6 AWG and 4 AWG Copper THHN directly.',
      cta: 'Claim $150 Rebate →'
    },
    {
      sponsor: 'Square D by Schneider Electric • CPM Bid: $64.90',
      title: 'Square D QO™ 100A & 125A Outdoor/Indoor Main-Lug Subpanel Load Centers',
      desc: 'Includes isolated ground bar for detached garages, pole barns, and workshops.',
      cta: 'View Subpanel Kits →'
    },
    {
      sponsor: 'Siemens Spa & Hot Tub Panels • CPM Bid: $71.50',
      title: 'Siemens 50A & 60A 2-Pole Outdoor GFCI Spa Disconnect Panel',
      desc: 'NEC Article 680 compliant weatherproof disconnect for hot tubs, pools & RV pads.',
      cta: 'Check Stock →'
    }
  ];
  const ad = creatives[initialCreativeIdx % creatives.length];

  if (slotType === 'anchor') {
    return `
  <aside class="ad-slot-anchor" data-ad-slot="${slotId}" aria-label="Sponsored Advertisement">
    <div style="max-inline-size:1280px;inline-size:100%;display:flex;align-items:center;justify-content:space-between;gap:1rem;color:#f8fafc;font-size:0.82rem;">
      <div>
        <span style="background:#d97706;color:#090d16;font-family:var(--font-mono);font-size:0.68rem;padding:0.1rem 0.35rem;font-weight:800;margin-inline-end:0.5rem;">AD • <span class="js-ad-refresh-count">Auction #1</span></span>
        <strong class="js-ad-title" style="color:#fff;">${ad.title}</strong>
        <span class="js-ad-desc" style="color:#cbd5e1;margin-inline-start:0.5rem;">${ad.desc}</span>
      </div>
      <a href="#wire-calculator" class="ad-creative-cta js-ad-cta" style="white-space:nowrap;background:#fbbf24;color:#090d16;">${ad.cta}</a>
    </div>
  </aside>`;
  }

  const sizeClass =
    slotType === 'leaderboard'
      ? 'ad-slot-leaderboard'
      : slotType === 'skyscraper'
      ? 'ad-slot-skyscraper'
      : 'ad-slot-midtool';

  const dimLabel =
    slotType === 'leaderboard'
      ? '728x90 / Resp Leaderboard'
      : slotType === 'skyscraper'
      ? '300x600 Sticky Rail'
      : '300x250 Action Unit';

  return `
  <aside class="ad-container ${sizeClass}" data-ad-slot="${slotId}" aria-label="Advertisement">
    <div class="ad-label-bar">
      <span>Sponsored • ${dimLabel} (Zero-CLS)</span>
      <span class="js-ad-refresh-count">Auction #1</span>
    </div>
    <div class="ad-creative-mock">
      <div>
        <div class="ad-creative-header">
          <span class="js-ad-sponsor">${ad.sponsor}</span>
          <span>IAB Active-View</span>
        </div>
        <div class="ad-creative-title js-ad-title">${ad.title}</div>
        <p class="ad-creative-desc js-ad-desc">${ad.desc}</p>
      </div>
      <a href="#wire-calculator" class="ad-creative-cta js-ad-cta">${ad.cta}</a>
    </div>
    <div class="ad-refresh-progress" title="35s Active-View Ad Refresh Timer">
      <div class="ad-refresh-bar"></div>
    </div>
  </aside>`;
}

function renderLayout({ title, description, canonicalPath, breadcrumbs, schemaJson, mainContent, sidebarLinks = [], totalPagesCount = 241 }) {
  const canonicalUrl = canonicalPath ? `${SITE_URL}/${canonicalPath.replace(/^\/+|\/+$/g, '')}/` : `${SITE_URL}/`;

  const breadcrumbHtml = breadcrumbs && breadcrumbs.length
    ? `<nav class="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          ${breadcrumbs
            .map((b, i) =>
              i === breadcrumbs.length - 1
                ? `<li aria-current="page"><strong>${b.label}</strong></li>`
                : `<li><a href="${b.url}">${b.label}</a></li>`
            )
            .join('')}
        </ol>
      </nav>`
    : '';

  const breadcrumbSchema = breadcrumbs && breadcrumbs.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: b.label,
          item: b.url.startsWith('http') ? b.url : `${SITE_URL}${b.url}`
        }))
      }
    : null;

  const schemas = [breadcrumbSchema, ...(Array.isArray(schemaJson) ? schemaJson : schemaJson ? [schemaJson] : [])].filter(Boolean);

  const speculationRulesJson = JSON.stringify({
    prefetch: [
      {
        tag: 'matrix-prefetch',
        where: {
          and: [{ href_matches: '/*' }, { not: { href_matches: '/sitemap.xml' } }]
        },
        eagerness: 'moderate'
      }
    ],
    prerender: [
      {
        tag: 'matrix-prerender',
        where: {
          and: [{ href_matches: '/*' }, { not: { href_matches: '/sitemap.xml' } }]
        },
        eagerness: 'conservative'
      }
    ]
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <script>try{document.querySelector('meta[name="color-scheme"]').content=localStorage.getItem("color-scheme")??"light dark"}catch(e){}</script>
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="dns-prefetch" href="//securepubads.g.doubleclick.net">
  <link rel="dns-prefetch" href="//pagead2.googlesyndication.com">
  <style>${criticalCss}</style>
  <link rel="expect" href="#hero-panel" blocking="render">
  ${schemas.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n  ')}
  <script type="speculationrules">${speculationRulesJson}</script>
</head>
<body>
  <div class="adops-bar" role="region" aria-label="Publisher Ad-Ops Telemetry">
    <div class="adops-inner">
      <div><strong>AD-OPS ENGINE:</strong> ${totalPagesCount} High-Volume NEC Pages • Prebid Active-View 35s Refresh</div>
      <div class="adops-metrics">
        <span class="adops-pill live-dot">Status: <strong id="hud-view-state">ACTIVE VIEW (TIMER RUNNING)</strong></span>
        <span class="adops-pill">Impressions: <strong id="hud-impressions">4</strong></span>
        <span class="adops-pill">RPM: <strong>$69.20</strong></span>
        <span class="adops-pill">Session Yield: <strong id="hud-revenue">$0.28</strong></span>
      </div>
    </div>
  </div>

  <header class="site-header">
    <div class="header-inner">
      <a href="/" class="brand-logo">
        <span>WIRESIZEMATRIX</span>
        <span class="brand-badge">NEC 310.16 & CONDUIT</span>
      </a>
      <div class="header-tools">
        <search class="quick-search-box" aria-label="Quick Jump to Any Breaker, Project or Wire Gauge">
          <label for="global-wire-jump" class="visually-hidden">Quick jump to breaker size, EV charger, subpanel, or AWG wire</label>
          <input type="search" id="global-wire-jump" list="global-wire-datalist" autocorrect="off" autocapitalize="none" spellcheck="false" enterkeyhint="go" placeholder="⚡ Quick Jump: 50A, 100A Subpanel, 6 AWG...">
          <datalist id="global-wire-datalist">${quickJumpOptionsHtml}</datalist>
        </search>
        <nav class="site-nav" aria-label="Primary Navigation">
          <a href="/">Master Chart</a>
          <a href="/breakers/30-amp-wire-size/">30A</a>
          <a href="/breakers/50-amp-wire-size/">50A</a>
          <a href="/breakers/60-amp-wire-size/">60A</a>
          <a href="/breakers/100-amp-wire-size/">100A</a>
          <a href="/breakers/200-amp-wire-size/">200A</a>
          <a href="/projects/48-amp-ev-charger-60-amp-breaker-wire-size/">EV Charger</a>
          <a href="/conduit-fill/how-many-6-awg-wires-in-3-4-inch-conduit/">Conduit Fill</a>
          <button type="button" id="btn-open-binder" class="binder-btn" aria-label="Open saved circuits binder">📌 Binder (<span id="binder-count">0</span>)</button>
          <button type="button" id="theme-toggle-btn" class="theme-btn" aria-label="Switch color scheme">☾ Dark</button>
        </nav>
      </div>
    </div>
  </header>

  ${breadcrumbHtml}

  <div style="padding: 0 1rem;">
    ${renderAdUnit('leaderboard', 'top-leaderboard', 0)}
  </div>

  <div class="layout-shell">
    <main id="main-content">
      ${mainContent}
      <section class="sister-widget deferred-section" aria-label="Sister Engineering Calculators">
        <h3 style="margin:0;font-size:0.95rem;">🔗 Complete Your Build — Sister Engineering Calculators</h3>
        <div class="sister-grid">
          <a class="sister-card" href="https://slabyardmatrix.com" rel="noopener"><strong>🧱 SlabYardMatrix.com</strong>Pouring a garage, RV pad, or shed slab? Calculate exact cubic yards, 80lb bags &amp; #4 rebar →</a>
          <a class="sister-card" href="https://minisplitbtumatrix.com" rel="noopener"><strong>❄️ MiniSplitBTUMatrix.com</strong>Wiring a garage or shop mini-split? Size exact BTU, tonnage &amp; 230V breaker →</a>
          <a class="sister-card" href="https://wattsurgematrix.com" rel="noopener"><strong>🔋 WattSurgeMatrix.com</strong>Backup power planning? Check appliance starting surge watts &amp; battery runtime →</a>
        </div>
      </section>
    </main>

    <aside class="ad-rail-sticky" aria-label="Sidebar Calculations & Sponsored Units">
      ${renderAdUnit('skyscraper', 'sidebar-skyscraper', 1)}
      <div class="panel" style="margin:0;">
        <h3 style="margin-block-start:0;">Quick Breaker Wire Charts</h3>
        <div style="display:flex;flex-wrap:wrap;gap:0.3rem;margin-block-end:0.85rem;">
          ${[15, 20, 30, 40, 50, 60, 70, 80, 100, 125, 150, 200]
            .map((a) => `<a href="/breakers/${a}-amp-wire-size/" class="year-pill">${a}A</a>`)
            .join('')}
        </div>
        <h3 style="margin-block-start:0;">Top Wiring Projects</h3>
        <ul style="padding-inline-start:1.1rem;margin:0;font-size:0.82rem;display:grid;gap:0.35rem;">
          ${projects
            .slice(0, 8)
            .map((p) => `<li><a href="/projects/${p.slug}/">${p.name}</a></li>`)
            .join('')}
        </ul>
        ${
          sidebarLinks.length
            ? `<h3 style="margin-block-start:1rem;">Related Distance & Conduit Guides</h3>
               <ul style="padding-inline-start:1.1rem;margin:0;font-size:0.8rem;display:grid;gap:0.35rem;">
                 ${sidebarLinks.map((l) => `<li><a href="${l.url}">${l.label}</a></li>`).join('')}
               </ul>`
            : ''
        }
      </div>
    </aside>
  </div>

  <footer class="site-footer">
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:1rem;">
      <div>
        <strong>${SITE_NAME} — NEC Table 310.16 Wire Gauge, Subpanel, EV Charger, Conduit Fill & Voltage Drop Reference</strong>
        <p style="margin:0.35rem 0 0;">Sister Engineering Portals: <a href="https://townmatrix.com" rel="noopener">TownMatrix.com (Truck & RV Towing Payload Matrix)</a> • <a href="https://wattsurgematrix.com" rel="noopener">WattSurgeMatrix.com (Appliance Surge & Power Station Runtime)</a>.</p>
      </div>
      <div style="font-family:var(--font-mono);font-size:0.76rem;">
        <div>Total Indexed Matrix Pages: <strong>${totalPagesCount} High-Volume Static Endpoints</strong></div>
        <div><a href="/about/">NEC Methodology</a> • <a href="/privacy-policy/">Privacy Policy</a> • <a href="/terms/">Terms & Electrical Disclaimer</a> • <a href="/contact/">Contact</a> • <a href="/sitemap.xml">XML Sitemap</a></div>
      </div>
    </div>
  </footer>

  ${renderAdUnit('anchor', 'bottom-sticky-anchor', 2)}

  <div class="binder-backdrop" id="binder-backdrop"></div>
  <aside class="binder-drawer" id="project-binder-drawer" aria-label="Saved Project Circuits Binder">
    <div style="display:flex;justify-content:space-between;align-items:center;border-block-end:2px solid var(--text);padding-block-end:0.6rem;margin-block-end:0.8rem;">
      <strong style="font-family:var(--font-mono);font-size:0.95rem;">📌 My Saved Circuits Binder</strong>
      <button type="button" id="btn-close-binder" class="theme-btn">✕ Close</button>
    </div>
    <p style="font-size:0.8rem;color:var(--text-muted);margin-block-start:0;">Saved locally in your browser so you can pull up your exact wire gauges &amp; shopping list at the hardware store.</p>
    <div id="binder-items-list"></div>
  </aside>

  <script defer src="/assets/${hashedJsFilename}"></script>
</body>
</html>`;
}

// ============================================================================
// 1. BUILD 84 BREAKER AMPERAGE × DISTANCE PAGES (/breakers/[slug]/)
// ============================================================================
function buildBreakerPages(sitemapUrls, totalPagesCount) {
  const distances = [25, 50, 75, 100, 125, 150, 200, 250, 300];

  for (const b of breakers) {
    const { amps, distanceFt, voltage, is12v, title, rec, slug } = b;
    const sameAmpVariants = breakers.filter((other) => other.amps === amps);

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `What size wire do I need for a ${amps} amp breaker at ${distanceFt} feet?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `For a ${amps} amp circuit at ${distanceFt} feet (${voltage}V), NEC Table 310.16 and the 3% voltage drop rule recommend ${rec.recommendedCuAwg} AWG Copper (75°C THHN) or ${rec.recommendedAlAwg} AWG Aluminum, paired with a ${rec.groundAwg} equipment grounding conductor inside ${rec.minConduit} conduit.`
          }
        }
      ]
    };

    const mainContent = `
      <article id="hero-panel" class="panel isolated-widget">
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:0.5rem;margin-block-end:0.35rem;">
          <span class="brand-badge">${amps} AMP BREAKER • ${voltage}V • ${distanceFt}-FT RUN</span>
          <span style="font-family:var(--font-mono);font-size:0.78rem;color:var(--text-muted);">NEC Table 310.16 & 250.122 Compliant</span>
        </div>
        <h1>${title}</h1>
        <p class="subtitle">Verified NEC wire gauge sizing for a <strong>${amps}-Amp circuit at ${distanceFt} feet (${voltage}V)</strong>. Compares <strong>75°C Copper THHN</strong> vs. <strong>60°C Indoor Romex (NM-B)</strong> vs. <strong>75°C Aluminum Feeder</strong> with 3% voltage-drop upsizing.</p>

        <div class="year-pill-bar" role="navigation" aria-label="Switch Distance for ${amps} Amp Breaker">
          <strong style="font-family:var(--font-mono);font-size:0.74rem;margin-inline-end:0.25rem;">${amps}A DISTANCES:</strong>
          ${sameAmpVariants
            .map(
              (v) =>
                `<a href="/breakers/${v.slug}/" class="year-pill ${v.slug === slug ? 'active' : ''}">${
                  v.is12v ? '12V DC' : v.slug.endsWith('wire-size') ? 'Overview' : v.distanceFt + ' ft'
                }</a>`
            )
            .join('')}
        </div>

        <div class="spec-kpi-grid">
          <div class="kpi-box highlight">
            <span class="kpi-label">Copper THHN (75°C)</span>
            <span class="kpi-value">${rec.recommendedCuAwg} AWG</span>
            <span class="kpi-sub">${rec.upsizedForDistance ? `Upsized from ${rec.baseCu75} AWG for ${distanceFt}ft` : 'Base NEC 310.16 Rating'}</span>
          </div>
          <div class="kpi-box highlight">
            <span class="kpi-label">Aluminum (75°C SER)</span>
            <span class="kpi-value">${rec.recommendedAlAwg} AWG</span>
            <span class="kpi-sub">Save ~$${fmt.format(Math.max(0, rec.estCostCu - rec.estCostAl))} on ${distanceFt}ft</span>
          </div>
          <div class="kpi-box">
            <span class="kpi-label">Romex NM-B (60°C)</span>
            <span class="kpi-value">${rec.baseCu60} AWG</span>
            <span class="kpi-sub">NEC 334.80 60°C Limit</span>
          </div>
          <div class="kpi-box">
            <span class="kpi-label">Min Conduit & Ground</span>
            <span class="kpi-value">${rec.minConduit}</span>
            <span class="kpi-sub">${rec.groundAwg} Cu Ground</span>
          </div>
        </div>
      </article>

      ${renderInteractiveCalculator({ amps, distFt: distanceFt, voltage, isContinuous: false, rec })}

      <section class="panel deferred-section">
        <h2>${amps} Amp Wire Size Chart by Distance (25 ft to 300 ft @ ${voltage}V)</h2>
        <p class="subtitle">Shows exact wire gauge upsizing required to keep voltage drop under the 3.0% NEC recommendation:</p>
        <p id="table-sort-status" role="status" class="visually-hidden"></p>
        <div tabindex="0" role="region" aria-labelledby="dist-cap" class="table-wrapper">
          <table id="dist-table" class="sortable-spec-table" style="--label-2:'Copper AWG';--label-3:'Aluminum AWG';--label-4:'Voltage Drop';--label-5:'Conduit';--label-6:'Est Cu Cost';">
            <caption id="dist-cap">${amps} Amp Circuit Wire Gauge & Voltage Drop Schedule (${voltage}V)</caption>
            <thead>
              <tr>
                <th scope="col">One-Way Distance</th>
                <th scope="col">Copper (75°C THHN)</th>
                <th scope="col">Aluminum (75°C SER)</th>
                <th scope="col" data-type="number">
                  <button type="button" commandfor="dist-table" command="--sort">Voltage Drop % <span class="sort-icon" aria-hidden="true"></span></button>
                </th>
                <th scope="col">Min Conduit (4-Wire)</th>
                <th scope="col" data-type="number">
                  <button type="button" commandfor="dist-table" command="--sort">Est. Copper Cost <span class="sort-icon" aria-hidden="true"></span></button>
                </th>
              </tr>
            </thead>
            <tbody>
              ${distances
                .map((d) => {
                  const actualD = is12v ? Math.round(d / 5) : d;
                  const baseCu = awgTable.find((w) => w.cu75C >= amps) || awgTable[awgTable.length - 1];
                  const dCu =
                    awgTable.find((w) => {
                      if (w.cu75C < amps) return false;
                      const vd = (2 * actualD * amps * w.ohmPer1kCu) / 1000;
                      return (vd / voltage) * 100 <= 3.0;
                    }) || awgTable[awgTable.length - 1];
                  const dAl =
                    awgTable.find((w) => {
                      if (w.al75C < amps) return false;
                      const vd = (2 * actualD * amps * w.ohmPer1kAl) / 1000;
                      return (vd / voltage) * 100 <= 3.0;
                    }) || awgTable[awgTable.length - 1];
                  const vdV = (2 * actualD * amps * dCu.ohmPer1kCu) / 1000;
                  const vdPct = ((vdV / voltage) * 100).toFixed(2);
                  const cost = Math.round(actualD * dCu.costPerFtCu4W);
                  return `<tr>
                    <th scope="row">${actualD} Feet (One-Way)</th>
                    <td><strong>${dCu.awg} AWG Copper</strong> ${dCu.awg !== baseCu.awg ? '<span class="badge badge-warn">Upsized</span>' : ''}</td>
                    <td>${dAl.al75C >= amps ? dAl.awg + ' AWG Aluminum' : 'Copper Only'}</td>
                    <td data-value="${vdPct}">${vdPct}% (${(voltage - vdV).toFixed(1)}V)</td>
                    <td>${dCu.minConduit4Wire} EMT / PVC</td>
                    <td data-value="${cost}">~$${fmt.format(cost)}</td>
                  </tr>`;
                })
                .join('')}
            </tbody>
          </table>
        </div>
      </section>
    `;

    const html = renderLayout({
      title: `${title} — Copper vs. Aluminum NEC 310.16 & Voltage Drop Calculator`,
      description: `What size wire for a ${amps} amp breaker at ${distanceFt} feet? Verified NEC 310.16 copper (${rec.recommendedCuAwg} AWG) and aluminum (${rec.recommendedAlAwg} AWG) wire gauge chart, conduit size, and 3% voltage drop calculator.`,
      canonicalPath: `breakers/${slug}`,
      breadcrumbs: [
        { label: 'Home', url: '/' },
        { label: `${amps}A Wire Size`, url: `/breakers/${amps}-amp-wire-size/` },
        { label: title, url: `/breakers/${slug}/` }
      ],
      schemaJson: faqSchema,
      mainContent,
      sidebarLinks: sameAmpVariants.map((v) => ({
        url: `/breakers/${v.slug}/`,
        label: v.title
      })),
      totalPagesCount
    });

    writePage(`breakers/${slug}`, html, sitemapUrls);
  }
}

// ============================================================================
// 2. BUILD 52 HIGH-INTENT PROJECT & APPLIANCE WIRING PAGES (/projects/[slug]/)
// ============================================================================
function buildProjectPages(sitemapUrls, totalPagesCount) {
  for (const p of projects) {
    const { slug, name, category, amps, breakerAmps, voltage, defaultDistFt, isContinuous, note, rec } = p;
    const relatedProjects = projects.filter((other) => other.category === category && other.slug !== slug).slice(0, 6);

    const mainContent = `
      <article id="hero-panel" class="panel isolated-widget">
        <span class="brand-badge">${category.toUpperCase()} • NEC WIRING & BREAKER SPECIFICATION</span>
        <h1>${name} Wire Size, Breaker & Conduit Guide</h1>
        <p class="subtitle">${note}</p>

        <div class="spec-kpi-grid">
          <div class="kpi-box highlight">
            <span class="kpi-label">Min Copper Wire</span>
            <span class="kpi-value">${rec.recommendedCuAwg} AWG</span>
            <span class="kpi-sub">@ ${defaultDistFt} ft (75°C THHN)</span>
          </div>
          <div class="kpi-box highlight">
            <span class="kpi-label">Required Breaker</span>
            <span class="kpi-value">${breakerAmps} Amp</span>
            <span class="kpi-sub">${isContinuous ? `125% of ${amps}A Continuous` : `${voltage}V Circuit`}</span>
          </div>
          <div class="kpi-box">
            <span class="kpi-label">Romex NM-B (60°C)</span>
            <span class="kpi-value">${rec.baseCu60} AWG</span>
            <span class="kpi-sub">NEC 334.80 Indoor Rule</span>
          </div>
          <div class="kpi-box">
            <span class="kpi-label">Min Conduit & Ground</span>
            <span class="kpi-value">${rec.minConduit}</span>
            <span class="kpi-sub">${rec.groundAwg} Ground</span>
          </div>
        </div>
      </article>

      ${renderInteractiveCalculator({ amps, distFt: defaultDistFt, voltage, isContinuous, rec })}

      <section class="panel deferred-section">
        <h2>Related ${category} Wiring Guides</h2>
        <div class="link-cluster-grid">
          ${relatedProjects
            .map(
              (r) => `<a href="/projects/${r.slug}/" class="cluster-card">
                <span class="cluster-card-title">${r.name}</span>
                <span class="cluster-card-meta">${r.breakerAmps}A Breaker • ${r.rec.recommendedCuAwg} AWG Cu @ ${r.defaultDistFt}ft</span>
              </a>`
            )
            .join('')}
        </div>
      </section>
    `;

    const html = renderLayout({
      title: `${name} Wire Size (${rec.recommendedCuAwg} AWG), Breaker (${breakerAmps}A) & Conduit Chart`,
      description: `Complete NEC wire size and breaker calculator for ${name}. Compares 75°C THHN in conduit vs 60°C Romex NM-B and 3% voltage drop up to 300 feet.`,
      canonicalPath: `projects/${slug}`,
      breadcrumbs: [
        { label: 'Home', url: '/' },
        { label: name, url: `/projects/${slug}/` }
      ],
      schemaJson: null,
      mainContent,
      totalPagesCount
    });

    writePage(`projects/${slug}`, html, sitemapUrls);
  }
}

// ============================================================================
// 3. BUILD 60 NEC CHAPTER 9 CONDUIT FILL PAGES (/conduit-fill/[slug]/)
// ============================================================================
function buildConduitPages(sitemapUrls, totalPagesCount) {
  for (const c of conduits) {
    const sameWireConduits = conduits.filter((other) => other.awg === c.awg && other.slug !== c.slug);
    const samePipeConduits = conduits.filter((other) => other.conduitSize === c.conduitSize && other.slug !== c.slug);
    const wireSpec = awgTable.find((w) => w.awg === c.awg) || awgTable[4];
    const rec = {
      recommendedCuAwg: c.awg,
      recommendedAlAwg: c.awg,
      minConduit: c.conduitSize,
      groundAwg: wireSpec.groundAwg,
      actualDropPct: 1.85,
      estCostCu: 245,
      estCostAl: 110
    };

    const mainContent = `
      <article id="hero-panel" class="panel isolated-widget">
        <span class="brand-badge">NEC CHAPTER 9 TABLE 1 & ANNEX C CONDUIT FILL (40% MAX FILL)</span>
        <h1>${c.title}</h1>
        <p class="subtitle">Under NEC Chapter 9 Table 1, any conduit containing 3 or more conductors cannot exceed <strong>40% cross-sectional area fill</strong>. A single <strong>${c.awg} AWG THHN/THWN-2</strong> conductor occupies <strong>${c.wireAreaSqIn} sq. in.</strong></p>

        <div class="spec-kpi-grid">
          <div class="kpi-box highlight">
            <span class="kpi-label">EMT Metal (${c.conduitSize})</span>
            <span class="kpi-value">${c.maxEmt} Wires</span>
            <span class="kpi-sub">40% Area: ${c.emtArea40} in²</span>
          </div>
          <div class="kpi-box highlight">
            <span class="kpi-label">PVC Sch 40 (${c.conduitSize})</span>
            <span class="kpi-value">${c.maxPvc40} Wires</span>
            <span class="kpi-sub">40% Area: ${c.pvc40Area40} in²</span>
          </div>
          <div class="kpi-box highlight">
            <span class="kpi-label">PVC Sch 80 (${c.conduitSize})</span>
            <span class="kpi-value">${c.maxPvc80} Wires</span>
            <span class="kpi-sub">Heavy-Wall: ${c.pvc80Area40} in²</span>
          </div>
          <div class="kpi-box">
            <span class="kpi-label">4-Wire Subpanel Run</span>
            <span class="kpi-value">${c.fits4WiresPvc40 ? 'FITS SAFELY' : 'TOO SMALL'}</span>
            <span class="kpi-sub">${c.fourWireFillPctPvc40}% Fill in Sch 40</span>
          </div>
        </div>
      </article>

      ${renderInteractiveCalculator({ amps: wireSpec.cu75C, distFt: 75, voltage: 240, isContinuous: false, rec })}

      <section class="panel deferred-section">
        <h2>Other Conduit Sizes for ${c.awg} AWG THHN Wire</h2>
        <div class="link-cluster-grid">
          ${sameWireConduits
            .map(
              (s) => `<a href="/conduit-fill/${s.slug}/" class="cluster-card">
                <span class="cluster-card-title">${s.awg} AWG in ${s.conduitSize} Conduit</span>
                <span class="cluster-card-meta">EMT: ${s.maxEmt} Wires • PVC Sch 40: ${s.maxPvc40} • Sch 80: ${s.maxPvc80}</span>
              </a>`
            )
            .join('')}
        </div>

        <h3>Other Wire Gauges Inside ${c.conduitSize} Conduit</h3>
        <div class="link-cluster-grid">
          ${samePipeConduits
            .map(
              (s) => `<a href="/conduit-fill/${s.slug}/" class="cluster-card">
                <span class="cluster-card-title">${s.awg} AWG THHN in ${s.conduitSize} Conduit</span>
                <span class="cluster-card-meta">Max Wires: ${s.maxEmt} (EMT) / ${s.maxPvc40} (PVC Sch 40)</span>
              </a>`
            )
            .join('')}
        </div>
      </section>
    `;

    const html = renderLayout({
      title: `${c.title} — Max Conductors (${c.maxEmt} EMT / ${c.maxPvc40} PVC)`,
      description: `NEC Annex C conduit fill chart for ${c.awg} AWG THHN/THWN-2 wire in ${c.conduitSize} conduit: max ${c.maxEmt} wires in EMT, ${c.maxPvc40} wires in Schedule 40 PVC, and ${c.maxPvc80} wires in Schedule 80 PVC.`,
      canonicalPath: `conduit-fill/${c.slug}`,
      breadcrumbs: [
        { label: 'Home', url: '/' },
        { label: `${c.awg} AWG in ${c.conduitSize} Conduit`, url: `/conduit-fill/${c.slug}/` }
      ],
      schemaJson: null,
      mainContent,
      totalPagesCount
    });

    writePage(`conduit-fill/${c.slug}`, html, sitemapUrls);
  }
}

// ============================================================================
// 4. BUILD 40 AWG WIRE SPEC & COMPARISON PAGES (/wire-gauge/[slug]/)
// ============================================================================
function buildWireSpecAndComparePages(sitemapUrls, totalPagesCount) {
  for (const page of wirePages) {
    const specA = awgTable.find((w) => w.awg === (page.awg || page.awgA)) || awgTable[4];
    const specB = page.awgB ? awgTable.find((w) => w.awg === page.awgB) || awgTable[5] : specA;
    const rec = {
      recommendedCuAwg: specA.awg,
      recommendedAlAwg: specB.awg,
      minConduit: specA.minConduit4Wire,
      groundAwg: specA.groundAwg,
      actualDropPct: 2.1,
      estCostCu: Math.round(100 * specA.costPerFtCu4W),
      estCostAl: Math.round(100 * (specB.costPerFtAl4W || specA.costPerFtCu4W))
    };

    const mainContent = `
      <article id="hero-panel" class="panel isolated-widget">
        <span class="brand-badge">NEC TABLE 310.16 AMPACITY & RESISTANCE BREAKDOWN</span>
        <h1>${page.title}</h1>
        <p class="subtitle">${specA.typicalUse}. Compare 60°C Romex (NM-B) vs. 75°C THHN in Conduit vs. 75°C Aluminum feeder ratings and DC resistance per 1,000 feet.</p>

        <div class="spec-kpi-grid">
          <div class="kpi-box highlight">
            <span class="kpi-label">${specA.awg} AWG Copper (75°C)</span>
            <span class="kpi-value">${specA.cu75C} Amps</span>
            <span class="kpi-sub">60°C Romex: ${specA.cu60C}A</span>
          </div>
          <div class="kpi-box highlight">
            <span class="kpi-label">${specB.awg} AWG Spec</span>
            <span class="kpi-value">${specB.cu75C}A Cu / ${specB.al75C}A Al</span>
            <span class="kpi-sub">Conduit: ${specB.minConduit4Wire}</span>
          </div>
          <div class="kpi-box">
            <span class="kpi-label">DC Resistance (Cu)</span>
            <span class="kpi-value">${specA.ohmPer1kCu} Ω</span>
            <span class="kpi-sub">Per 1,000 Feet</span>
          </div>
          <div class="kpi-box">
            <span class="kpi-label">Min Conduit (4-Wire)</span>
            <span class="kpi-value">${specA.minConduit4Wire}</span>
            <span class="kpi-sub">Ground: ${specA.groundAwg}</span>
          </div>
        </div>
      </article>

      ${renderInteractiveCalculator({ amps: specA.cu75C, distFt: 100, voltage: 240, isContinuous: false, rec })}

      <section class="panel deferred-section">
        <h2>Related NEC Wire Gauge & Comparison Guides</h2>
        <div class="link-cluster-grid">
          ${wirePages
            .filter((w) => w.slug !== page.slug)
            .slice(0, 12)
            .map(
              (w) => `<a href="/wire-gauge/${w.slug}/" class="cluster-card">
                <span class="cluster-card-title">${w.title}</span>
                <span class="cluster-card-meta">NEC Table 310.16 & Voltage Drop →</span>
              </a>`
            )
            .join('')}
        </div>
      </section>
    `;

    const html = renderLayout({
      title: `${page.title} — NEC Table 310.16 Calculator`,
      description: `${page.title}. Includes interactive voltage drop simulator, 60°C Romex vs 75°C THHN ampacity ratings, and conduit fill chart.`,
      canonicalPath: `wire-gauge/${page.slug}`,
      breadcrumbs: [
        { label: 'Home', url: '/' },
        { label: page.title.split(':')[0], url: `/wire-gauge/${page.slug}/` }
      ],
      schemaJson: null,
      mainContent,
      totalPagesCount
    });

    writePage(`wire-gauge/${page.slug}`, html, sitemapUrls);
  }
}

// ============================================================================
// 5. MASTER HOMEPAGE (dist/index.html)
// ============================================================================
function buildHomepage(sitemapUrls, totalPagesCount) {
  const defaultRec = {
    recommendedCuAwg: '6',
    recommendedAlAwg: '4',
    minConduit: '3/4"',
    groundAwg: '10 AWG',
    actualDropPct: 2.05,
    estCostCu: 495,
    estCostAl: 210
  };

  const mainContent = `
    <article id="hero-panel" class="panel isolated-widget">
      <span class="brand-badge">NEC TABLE 310.16 WIRE GAUGE, CONDUIT FILL & 3% VOLTAGE DROP ENGINE (${totalPagesCount} PAGES)</span>
      <h1>NEC Wire Size, Subpanel, EV Charger & Conduit Fill Matrix</h1>
      <p class="subtitle">Avoid the <strong>NEC 334.80 60°C Romex Ampacity Trap</strong> and the <strong>3% Distance Voltage-Drop Violation</strong>. Test any circuit amperage (5A–250A), distance (5–450 ft), and voltage (12V DC / 120V / 240V AC) below or click any breaker/project guide.</p>
    </article>

    ${renderInteractiveCalculator({ amps: 50, distFt: 100, voltage: 240, isContinuous: false, rec: defaultRec })}

    <section class="panel">
      <h2>Master NEC Table 310.16 Copper & Aluminum Wire Ampacity Chart</h2>
      <p class="subtitle">Click any column header to sort wire gauges by 60°C Romex ampacity, 75°C THHN ampacity, or resistance:</p>
      <p id="table-sort-status" role="status" class="visually-hidden"></p>
      <div tabindex="0" role="region" aria-labelledby="nec-master-cap" class="table-wrapper">
        <table id="nec-master-table" class="sortable-spec-table" style="--label-2:'60°C Romex';--label-3:'75°C THHN Cu';--label-4:'75°C Alum';--label-5:'Conduit';--label-6:'Ground';">
          <caption id="nec-master-cap">NEC Table 310.16 Allowable Ampacities (Not More Than 3 Current-Carrying Conductors in Raceway/Cable)</caption>
          <thead>
            <tr>
              <th scope="col">Wire Gauge (AWG)</th>
              <th scope="col" data-type="number">
                <button type="button" commandfor="nec-master-table" command="--sort">60°C Copper (Romex NM-B) <span class="sort-icon" aria-hidden="true"></span></button>
              </th>
              <th scope="col" data-type="number" aria-sort="ascending">
                <button type="button" commandfor="nec-master-table" command="--sort">75°C Copper (THHN) <span class="sort-icon" aria-hidden="true"></span></button>
              </th>
              <th scope="col" data-type="number">
                <button type="button" commandfor="nec-master-table" command="--sort">75°C Aluminum (SER/MHF) <span class="sort-icon" aria-hidden="true"></span></button>
              </th>
              <th scope="col">Min Conduit (4-Wire)</th>
              <th scope="col">NEC 250.122 Ground</th>
            </tr>
          </thead>
          <tbody>
            ${awgTable
              .map(
                (w) => `<tr>
                  <th scope="row"><a href="/wire-gauge/${w.slug}-wire-ampacity-and-breaker-size/">${w.awg} AWG Wire</a></th>
                  <td data-value="${w.cu60C}"><strong>${w.cu60C} Amps</strong></td>
                  <td data-value="${w.cu75C}"><strong>${w.cu75C} Amps</strong></td>
                  <td data-value="${w.al75C}">${w.al75C > 0 ? w.al75C + ' Amps' : 'Not Permitted'}</td>
                  <td>${w.minConduit4Wire} EMT / PVC</td>
                  <td>${w.groundAwg} Cu</td>
                </tr>`
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </section>

    <section class="panel deferred-section">
      <h2>Wire Size by Breaker Amperage & Distance (15A to 200A)</h2>
      <div class="link-cluster-grid">
        ${breakers
          .slice(0, 36)
          .map(
            (b) => `<a href="/breakers/${b.slug}/" class="cluster-card">
              <span class="cluster-card-title">${b.title}</span>
              <span class="cluster-card-meta">Cu: ${b.rec.recommendedCuAwg} AWG • Al: ${b.rec.recommendedAlAwg} AWG • ${b.rec.minConduit} Conduit</span>
            </a>`
          )
          .join('')}
      </div>
    </section>

    <section class="panel deferred-section">
      <h2>High-Intent EV Charger, Subpanel, RV & Appliance Wiring Guides (52 Projects)</h2>
      <div class="link-cluster-grid">
        ${projects
          .map(
            (p) => `<a href="/projects/${p.slug}/" class="cluster-card">
              <span class="cluster-card-title">${p.name}</span>
              <span class="cluster-card-meta">${p.breakerAmps}A Breaker • ${p.rec.recommendedCuAwg} AWG Cu @ ${p.defaultDistFt}ft</span>
            </a>`
          )
          .join('')}
      </div>
    </section>

    <section class="panel deferred-section">
      <h2>NEC Chapter 9 Conduit Fill Charts (EMT, PVC Schedule 40 & Schedule 80)</h2>
      <div class="link-cluster-grid">
        ${conduits
          .slice(0, 24)
          .map(
            (c) => `<a href="/conduit-fill/${c.slug}/" class="cluster-card">
              <span class="cluster-card-title">How Many ${c.awg} AWG Wires in ${c.conduitSize} Conduit?</span>
              <span class="cluster-card-meta">EMT: ${c.maxEmt} • PVC Sch 40: ${c.maxPvc40} • Sch 80: ${c.maxPvc80}</span>
            </a>`
          )
          .join('')}
      </div>
    </section>
  `;

  const html = renderLayout({
    title: `${SITE_NAME} — NEC Wire Size, Voltage Drop, Subpanel, EV Charger & Conduit Fill Calculator`,
    description: `Calculate NEC Table 310.16 wire gauge (Copper vs Aluminum), 3% voltage drop by distance, 60°C Romex vs 75°C THHN ratings, and 40% conduit fill across ${totalPagesCount} engineering guides.`,
    canonicalPath: '',
    breadcrumbs: [],
    schemaJson: {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: 'NEC Table 310.16 Wire Gauge, Voltage Drop, and Chapter 9 Conduit Fill Matrix',
      description: 'Comprehensive electrical engineering dataset of copper and aluminum wire ampacities, conductor resistances, voltage drop tables, and 40% conduit fill limits.',
      url: `${SITE_URL}/`,
      license: 'https://creativecommons.org/licenses/by/4.0/',
      isAccessibleForFree: true,
      creator: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: `${SITE_URL}/`
      }
    },
    mainContent,
    totalPagesCount
  });

  writePage('', html, sitemapUrls);
}

function buildComplianceAndEdgeFiles(sitemapUrls, totalPagesCount) {
  writePage(
    'about',
    renderLayout({
      title: `About ${SITE_NAME} — NEC Table 310.16 & Voltage Drop Engineering Methodology`,
      description: `How ${SITE_NAME} computes NEC Table 310.16 60°C vs 75°C ampacities, Chapter 9 Table 8 resistance voltage drops, and 40% conduit fill.`,
      canonicalPath: 'about',
      breadcrumbs: [{ label: 'Home', url: '/' }, { label: 'Methodology', url: '/about/' }],
      schemaJson: null,
      totalPagesCount,
      mainContent: `<article id="hero-panel" class="panel"><h1>About ${SITE_NAME} & NEC Calculation Methodology</h1><p>${SITE_NAME} models conductor sizing using National Electrical Code (NEC) Table 310.16 (60°C NM-B/UF-B vs. 75°C THHN/THWN-2/SER terminals), NEC 210.19 / 215.2 (3% branch circuit voltage drop), NEC 250.122 (Equipment Grounding Conductors), and NEC Chapter 9 Table 1 (40% max conduit fill for 3+ conductors).</p></article>`
    }),
    sitemapUrls
  );

  writePage(
    'privacy-policy',
    renderLayout({
      title: `Privacy Policy & Advertising Disclosure — ${SITE_NAME}`,
      description: `Privacy Policy and Google AdSense DART cookie disclosure for ${SITE_NAME}.`,
      canonicalPath: 'privacy-policy',
      breadcrumbs: [{ label: 'Home', url: '/' }, { label: 'Privacy Policy', url: '/privacy-policy/' }],
      schemaJson: null,
      totalPagesCount,
      mainContent: `<article id="hero-panel" class="panel"><h1>Privacy Policy & Advertising Cookie Disclosure</h1><p>All electrical wire gauge, conduit fill, and voltage drop calculations on ${SITE_NAME} execute 100% locally in your browser. Third-party advertising partners, including Google AdSense, use cookies (such as the DoubleClick DART cookie) to serve personalized or contextual advertisements. Users may opt out at <a href="https://myadcenter.google.com/" rel="nofollow noopener" target="_blank">Google Ads Settings</a>.</p></article>`
    }),
    sitemapUrls
  );

  writePage(
    'terms',
    renderLayout({
      title: `Terms of Use & Licensed Electrician Safety Disclaimer — ${SITE_NAME}`,
      description: `Terms of Use and electrical code disclaimer for ${SITE_NAME}.`,
      canonicalPath: 'terms',
      breadcrumbs: [{ label: 'Home', url: '/' }, { label: 'Terms & Disclaimer', url: '/terms/' }],
      schemaJson: null,
      totalPagesCount,
      mainContent: `<article id="hero-panel" class="panel"><h1>Terms of Use & Electrical Safety Disclaimer</h1><p>All wire size, breaker, and conduit calculations on ${SITE_NAME} are provided for informational and educational estimation only. Local electrical codes (AHJ amendments), ambient temperature derating (NEC 310.15(B)(1)), and conduit bundling (>3 current-carrying conductors) may require larger conductors. Always consult a licensed electrician and pull a local electrical permit before performing any wiring work.</p></article>`
    }),
    sitemapUrls
  );

  writePage(
    'contact',
    renderLayout({
      title: `Contact ${SITE_NAME}`,
      description: `Contact the ${SITE_NAME} electrical engineering data team.`,
      canonicalPath: 'contact',
      breadcrumbs: [{ label: 'Home', url: '/' }, { label: 'Contact', url: '/contact/' }],
      schemaJson: null,
      totalPagesCount,
      mainContent: `<article id="hero-panel" class="panel"><h1>Contact ${SITE_NAME}</h1><p>For specification questions or advertising inquiries, contact: <strong>data@wiresizematrix.com</strong></p></article>`
    }),
    sitemapUrls
  );

  const headersTxt = `/assets/*
  Cache-Control: public, max-age=31536000, immutable
  X-Content-Type-Options: nosniff

/sitemap.xml
  Cache-Control: public, max-age=3600, stale-while-revalidate=86400
  Content-Type: application/xml; charset=utf-8

/robots.txt
  Cache-Control: public, max-age=3600, stale-while-revalidate=86400
  Content-Type: text/plain; charset=utf-8

/*
  Cache-Control: public, max-age=0, must-revalidate
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
`;
  fs.writeFileSync(path.join(DIST_DIR, '_headers'), headersTxt, 'utf8');
  fs.writeFileSync(path.join(DIST_DIR, '_redirects'), '/calculators/* /breakers/:splat 301\n', 'utf8');
  fs.writeFileSync(
    path.join(DIST_DIR, 'ads.txt'),
    '# WireSizeMatrix Authorized Digital Sellers (IAB ads.txt)\n# google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0\n',
    'utf8'
  );

  const notFoundHtml = renderLayout({
    title: `404 Page Not Found — ${SITE_NAME}`,
    description: 'Return to the master NEC wire size and conduit fill directory.',
    canonicalPath: '404',
    breadcrumbs: [{ label: 'Home', url: '/' }, { label: '404', url: '/404/' }],
    schemaJson: null,
    totalPagesCount,
    mainContent: `<section id="hero-panel" class="panel"><h1>Wire or Breaker Guide Not Found</h1><p><a href="/">Open the Master NEC Wire Size & Voltage Drop Calculator →</a></p></section>`
  });
  fs.writeFileSync(path.join(DIST_DIR, '404.html'), notFoundHtml, 'utf8');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((u) => `  <url><loc>${u}</loc><changefreq>monthly</changefreq><priority>${u === SITE_URL + '/' ? '1.0' : '0.8'}</priority></url>`).join('\n')}
</urlset>`;
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf8');
  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`, 'utf8');

  fs.writeFileSync(
    path.join(DIST_DIR, 'wrangler.jsonc'),
    JSON.stringify({ name: 'wiresize-matrix', compatibility_date: '2026-11-01', assets: { directory: './', not_found_handling: '404-page' } }, null, 2),
    'utf8'
  );
  fs.writeFileSync(path.join(DIST_DIR, '.assetsignore'), 'wrangler.jsonc\nsrc\n', 'utf8');
  ensureDir(path.join(DIST_DIR, 'src'));
  fs.writeFileSync(
    path.join(DIST_DIR, 'src', 'build.js'),
    'console.log("[WireSizeMatrix] Static files already pre-built in dist/ — proceeding to Cloudflare deploy.");\n',
    'utf8'
  );
}

function runBuild() {
  const startTime = Date.now();
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
  }
  ensureDir(DIST_DIR);
  ensureDir(path.join(DIST_DIR, 'assets'));

  fs.writeFileSync(path.join(DIST_DIR, 'assets', hashedJsFilename), minifiedJs, 'utf8');
  fs.writeFileSync(path.join(DIST_DIR, 'assets', 'styles.css'), criticalCss, 'utf8');

  const sitemapUrls = [];
  const totalPagesCount = 5 + breakers.length + projects.length + conduits.length + wirePages.length;

  buildHomepage(sitemapUrls, totalPagesCount);
  buildBreakerPages(sitemapUrls, totalPagesCount);
  buildProjectPages(sitemapUrls, totalPagesCount);
  buildConduitPages(sitemapUrls, totalPagesCount);
  buildWireSpecAndComparePages(sitemapUrls, totalPagesCount);
  buildComplianceAndEdgeFiles(sitemapUrls, totalPagesCount);

  const elapsedMs = Date.now() - startTime;
  console.log(`[WireSizeMatrix SSG] Built ${sitemapUrls.length} high-volume static HTML pages in ${elapsedMs}ms!`);
  console.log(`  - 1 Master NEC Table 310.16 & Interactive Voltage-Drop Homepage`);
  console.log(`  - ${breakers.length} Breaker Amperage × Distance Wire Size Pages (/breakers/...)`);
  console.log(`  - ${projects.length} EV Charger, Subpanel, RV & Appliance Wiring Guides (/projects/...)`);
  console.log(`  - ${conduits.length} NEC Chapter 9 Conduit Fill Pages (/conduit-fill/...)`);
  console.log(`  - ${wirePages.length} AWG Wire Spec & Copper-vs-Aluminum Comparison Pages (/wire-gauge/...)`);
  console.log(`  - 4 AdSense & E-E-A-T Compliance Pages (/about/, /privacy-policy/, /terms/, /contact/)`);
}

runBuild();
