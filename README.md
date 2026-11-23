# WireSizeMatrix — NEC Table 310.16 Wire Gauge, Breaker, Subpanel, EV Charger & Conduit Fill Calculator

**WireSizeMatrix (`https://wiresizematrix.com`)** is a zero-dependency, 241-page static HTML/CSS/Vanilla JS programmatic SEO and display-ad monetization platform focused on the highest-search-volume electrical queries in North America: **NEC Table 310.16 Wire Sizing, 3% Voltage Drop at Distance, Subpanel Feeder Sizing, Level 2 EV Charger Circuits, and Chapter 9 40% Conduit Fill**.

## Architecture & Page Inventory (241 Pre-Rendered Static HTML Pages)

| Directory / Route | Count | Target Search Intent |
| :--- | :---: | :--- |
| `/breakers/{slug}/` | **84 Pages** | *"What size wire for a 100 amp subpanel 150 feet away?"*, *"50 amp breaker wire size at 100 ft"* |
| `/projects/{slug}/` | **52 Pages** | *"48A Tesla Wall Connector wire size"*, *"50A hot tub GFCI breaker wire gauge"*, *"14-50 RV outlet wire size"* |
| `/conduit/{slug}/` | **60 Pages** | *"How many 6 AWG THHN wires fit in 3/4 inch EMT conduit?"*, *"1 inch PVC Schedule 40 vs 80 wire fill"* |
| `/compare/{slug}/` | **40 Pages** | *"6 AWG Copper vs 4 AWG Aluminum wire ampacity & cost"*, *"Romex NM-B 60°C rule vs THHN 75°C"* |
| `/`, `/404.html`, `/about/`, `/privacy-policy/`, `/terms/`, `/contact/` | **5 Pages** | Master Interactive Hub + Google AdSense Trust & Compliance Pages |

## Key Engineering Highlights

1. **Interactive Above-the-Fold NEC 310.16 + 3% Voltage Drop Engine ([src/app.js](src/app.js))**:
   - Instant recalculation for any Breaker Amperage (`15A`–`200A`), One-Way Distance (`10 ft`–`500 ft`), System Voltage (`120V`, `240V`, `208V 3-Phase`, `480V 3-Phase`, `12V DC`), Conductor Metal (`Copper` vs `Aluminum`), and Wiring Method (`75°C THHN in Conduit` vs `60°C Romex NM-B` per NEC 334.80).
   - **NEC 210.19 / 625.41 Continuous Load Toggle**: Automatically applies the 125% continuous duty factor (80% breaker derating) for EV chargers, solar inverters, and electric heaters.
   - **Live SVG Dual Blueprint**: Side-by-side animated SVG schematic rendering real-time voltage at load terminals, copper vs aluminum material cost comparison, and Chapter 9 40% conduit fill cross-section.
2. **Complete Google Rich Result Schema ([src/build.js](src/build.js))**:
   - Every page outputs valid JSON-LD `@graph` with `WebApplication`, `Dataset` (including `creator`, `license`, and `isAccessibleForFree`), `FAQPage`, and `BreadcrumbList`.
3. **Zero-CLS Display Ad & Contextual Hardware Monetization**:
   - Reserved `min-height` ad containers (`Leaderboard`, `In-Content`, `Sticky Sidebar`, and `Mobile Adhesion`) with a 35-second Active-View IntersectionObserver + Page Visibility refresh engine.

## Commands

```bash
# 1. Regenerate verified NEC JSON datasets
npm run seed

# 2. Compile all 241 static HTML pages + sitemaps into ./dist
npm run build
```

## Cloudflare Workers / Pages Deployment

- **Build command**: `npm run build`
- **Deploy command**: `npx wrangler deploy` (or publish `./dist` directly on Cloudflare Pages)
