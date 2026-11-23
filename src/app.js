(function () {
  'use strict';

  const fmtNum = new Intl.NumberFormat('en-US');
  const fmtCurrency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  });
  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  const supportsAccentColor =
    typeof CSS !== 'undefined' && CSS.supports && CSS.supports('accent-color', '#b45309');

  // Official NEC Table 310.16 & Chapter 9 Table 5/8 Lookup Matrix
  const AWG_SPECS = [
    { awg: '14', cu60: 15, cu75: 20, al75: 0, ohmCu: 3.07, ohmAl: 5.06, areaThhn: 0.0097, conduit: '1/2"', ground: '14 AWG', costCu: 0.95, costAl: 0, svgRadius: 6 },
    { awg: '12', cu60: 20, cu75: 25, al75: 20, ohmCu: 1.93, ohmAl: 3.18, areaThhn: 0.0133, conduit: '1/2"', ground: '12 AWG', costCu: 1.35, costAl: 0.75, svgRadius: 7 },
    { awg: '10', cu60: 30, cu75: 35, al75: 30, ohmCu: 1.21, ohmAl: 2.00, areaThhn: 0.0211, conduit: '1/2"', ground: '10 AWG', costCu: 2.15, costAl: 1.10, svgRadius: 8.5 },
    { awg: '8', cu60: 40, cu75: 50, al75: 40, ohmCu: 0.764, ohmAl: 1.26, areaThhn: 0.0366, conduit: '3/4"', ground: '10 AWG', costCu: 3.40, costAl: 1.55, svgRadius: 10 },
    { awg: '6', cu60: 55, cu75: 65, al75: 50, ohmCu: 0.491, ohmAl: 0.808, areaThhn: 0.0507, conduit: '3/4"', ground: '10 AWG', costCu: 4.95, costAl: 2.10, svgRadius: 11.5 },
    { awg: '4', cu60: 70, cu75: 85, al75: 65, ohmCu: 0.308, ohmAl: 0.508, areaThhn: 0.0824, conduit: '1"', ground: '8 AWG', costCu: 7.40, costAl: 2.65, svgRadius: 13 },
    { awg: '3', cu60: 85, cu75: 100, al75: 75, ohmCu: 0.245, ohmAl: 0.403, areaThhn: 0.0973, conduit: '1-1/4"', ground: '8 AWG', costCu: 9.10, costAl: 3.10, svgRadius: 14 },
    { awg: '2', cu60: 95, cu75: 115, al75: 90, ohmCu: 0.194, ohmAl: 0.319, areaThhn: 0.1158, conduit: '1-1/4"', ground: '8 AWG', costCu: 11.20, costAl: 2.85, svgRadius: 15 },
    { awg: '1', cu60: 110, cu75: 130, al75: 100, ohmCu: 0.154, ohmAl: 0.253, areaThhn: 0.1562, conduit: '1-1/2"', ground: '6 AWG', costCu: 13.80, costAl: 3.45, svgRadius: 16.5 },
    { awg: '1/0', cu60: 125, cu75: 150, al75: 120, ohmCu: 0.122, ohmAl: 0.201, areaThhn: 0.1855, conduit: '1-1/2"', ground: '6 AWG', costCu: 16.50, costAl: 4.15, svgRadius: 17.5 },
    { awg: '2/0', cu60: 145, cu75: 175, al75: 135, ohmCu: 0.0967, ohmAl: 0.159, areaThhn: 0.2223, conduit: '2"', ground: '6 AWG', costCu: 20.40, costAl: 4.95, svgRadius: 19 },
    { awg: '3/0', cu60: 165, cu75: 200, al75: 155, ohmCu: 0.0766, ohmAl: 0.126, areaThhn: 0.2679, conduit: '2"', ground: '4 AWG', costCu: 25.10, costAl: 5.90, svgRadius: 20 },
    { awg: '4/0', cu60: 195, cu75: 230, al75: 180, ohmCu: 0.0608, ohmAl: 0.100, areaThhn: 0.3237, conduit: '2-1/2"', ground: '4 AWG', costCu: 31.00, costAl: 6.85, svgRadius: 21.5 }
  ];

  // =========================================================================
  // 1. ADAPTIVE DARK / LIGHT MODE TOGGLE (dark-mode & dark-mode-toggle)
  // =========================================================================
  function initThemeToggle() {
    const meta = document.querySelector('meta[name="color-scheme"]');
    const btn = document.getElementById('theme-toggle-btn');
    if (!meta || !btn) return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');

    function getSystemScheme() {
      return mql.matches ? 'dark' : 'light';
    }

    function getRenderedScheme() {
      const content = meta.getAttribute('content') || 'light dark';
      if (content === 'dark' || content === 'light') return content;
      return getSystemScheme();
    }

    function updateButtonLabel() {
      const current = getRenderedScheme();
      btn.textContent = current === 'dark' ? '☀ Light' : '☾ Dark';
      btn.setAttribute(
        'aria-label',
        current === 'dark' ? 'Switch to light color scheme' : 'Switch to dark color scheme'
      );
    }

    btn.addEventListener('click', () => {
      const sys = getSystemScheme();
      const current = getRenderedScheme();
      const target = current === 'dark' ? 'light' : 'dark';

      try {
        if (target !== sys) {
          localStorage.setItem('color-scheme', target);
          meta.setAttribute('content', target);
        } else {
          localStorage.removeItem('color-scheme');
          meta.setAttribute('content', 'light dark');
        }
      } catch (e) {
        meta.setAttribute('content', target !== sys ? target : 'light dark');
      }
      updateButtonLabel();
    });

    mql.addEventListener('change', updateButtonLabel);
    window.addEventListener('storage', (e) => {
      if (e.key === 'color-scheme') {
        meta.setAttribute('content', e.newValue ?? 'light dark');
        updateButtonLabel();
      }
    });

    updateButtonLabel();
  }

  // =========================================================================
  // 2. GLOBAL FUZZY QUICK-JUMP FINDER (<search> + <datalist>)
  // =========================================================================
  function initQuickJumpSearch() {
    const input = document.getElementById('global-wire-jump');
    const datalist = document.getElementById('global-wire-datalist');
    if (!input || !datalist) return;

    const urlMap = new Map();
    for (const opt of datalist.options) {
      if (opt.dataset.url) {
        urlMap.set(opt.value.toLowerCase(), opt.dataset.url);
      }
    }

    function tryJump() {
      const val = input.value.trim().toLowerCase();
      if (urlMap.has(val)) {
        window.location.href = urlMap.get(val);
      }
    }

    input.addEventListener('change', tryJump);
    input.addEventListener('keydown', (e) => {
      if (e.isComposing) return;
      if (e.key === 'Enter') {
        const val = input.value.trim().toLowerCase();
        if (urlMap.has(val)) {
          e.preventDefault();
          window.location.href = urlMap.get(val);
        }
      }
    });
  }

  // =========================================================================
  // 3. INTERACTIVE NEC WIRE GAUGE, VOLTAGE DROP & CONDUIT FILL SIMULATOR
  // =========================================================================
  function initNecWireCalculator() {
    const calcRoot = document.getElementById('wire-calculator');
    if (!calcRoot) return;

    const inputAmps = document.getElementById('input-amps');
    const inputDist = document.getElementById('input-distance-ft');
    const inputVolt = document.getElementById('input-voltage');
    const inputCableType = document.getElementById('input-cable-type');
    const toggleContinuous = document.getElementById('toggle-continuous-load');

    if (!inputAmps || !inputDist || !inputVolt || !inputCableType) return;

    const dom = {
      rAmps: document.getElementById('readout-amps'),
      rDist: document.getElementById('readout-distance'),
      barDrop: document.getElementById('gauge-bar-vdrop'),
      txtDrop: document.getElementById('gauge-txt-vdrop'),
      barAmpacity: document.getElementById('gauge-bar-ampacity'),
      txtAmpacity: document.getElementById('gauge-txt-ampacity'),
      barConduit: document.getElementById('gauge-bar-conduit'),
      txtConduit: document.getElementById('gauge-txt-conduit'),
      outCuAwg: document.getElementById('out-cu-awg'),
      outAlAwg: document.getElementById('out-al-awg'),
      outVdrop: document.getElementById('out-vdrop-pct'),
      outSavings: document.getElementById('out-al-savings'),
      verdictBanner: document.getElementById('verdict-banner'),
      verdictTitle: document.getElementById('verdict-title-text'),
      verdictBadge: document.getElementById('verdict-badge'),
      verdictDesc: document.getElementById('verdict-desc'),
      // Live SVG Conduit Cross-Section & Transmission Nodes
      svgCuAwg: document.getElementById('svg-cu-awg'),
      svgAlAwg: document.getElementById('svg-al-awg'),
      svgVdropTxt: document.getElementById('svg-vdrop-txt'),
      svgConduitTxt: document.getElementById('svg-conduit-txt'),
      svgCostTxt: document.getElementById('svg-cost-txt'),
      svgStatusBadge: document.getElementById('svg-status-badge'),
      svgDropPill: document.getElementById('svg-drop-pill'),
      c1: document.getElementById('svg-wire-c1'),
      c2: document.getElementById('svg-wire-c2'),
      c3: document.getElementById('svg-wire-c3'),
      c4: document.getElementById('svg-wire-c4')
    };

    const params = new URLSearchParams(window.location.search);
    if (params.has('amps')) inputAmps.value = params.get('amps');
    if (params.has('dist')) inputDist.value = params.get('dist');
    if (params.has('volt')) inputVolt.value = params.get('volt');
    if (params.has('cable')) inputCableType.value = params.get('cable');
    if (params.has('cont') && toggleContinuous) {
      toggleContinuous.checked = params.get('cont') === '1';
    }

    function updateRangeProgressFallback(slider) {
      if (supportsAccentColor || !slider || slider.type !== 'range') return;
      const min = Number(slider.min || 0);
      const max = Number(slider.max || 100);
      const val = Number(slider.value || 0);
      const pct = Math.round(((val - min) / Math.max(1, max - min)) * 100);
      slider.style.setProperty('--progress', pct + '%');
    }

    function setGauge(bar, txt, pct, usedText) {
      if (bar) {
        const clamped = Math.min(100, Math.max(0, pct));
        bar.style.inlineSize = clamped + '%';
        bar.dataset.level = pct > 100 ? 'danger' : pct >= 80 ? 'warn' : 'safe';
      }
      if (txt) {
        txt.textContent = usedText;
      }
    }

    function computeNecSizing() {
      const loadAmps = Number(inputAmps.value);
      const distFt = Number(inputDist.value);
      const voltage = Number(inputVolt.value);
      const cableMode = inputCableType.value; // 'thhn75' or 'romex60'
      const isContinuous = toggleContinuous ? toggleContinuous.checked : false;

      const requiredAmpacity = isContinuous ? Math.ceil(loadAmps * 1.25) : loadAmps;
      const is60C = cableMode === 'romex60';

      if (dom.rAmps) {
        dom.rAmps.textContent =
          loadAmps + ' A' + (isContinuous ? ' (' + requiredAmpacity + 'A NEC 125%)' : '');
      }
      if (dom.rDist) dom.rDist.textContent = fmtNum.format(distFt) + ' ft (One-Way)';

      // 1. Base Ampacity Wire (without distance upsizing)
      const baseCuSpec =
        AWG_SPECS.find((w) => (is60C ? w.cu60 : w.cu75) >= requiredAmpacity) ||
        AWG_SPECS[AWG_SPECS.length - 1];
      const baseAlSpec =
        AWG_SPECS.find((w) => w.al75 >= requiredAmpacity) || AWG_SPECS[AWG_SPECS.length - 1];

      // Check what voltage drop happens if user only uses the base ampacity gauge!
      const baseDropV = (2 * distFt * loadAmps * baseCuSpec.ohmCu) / 1000;
      const baseDropPct = (baseDropV / voltage) * 100;

      // 2. Find Distance-Upsized Wire that keeps Voltage Drop <= 3.0%
      const recCuSpec =
        AWG_SPECS.find((w) => {
          const cap = is60C ? w.cu60 : w.cu75;
          if (cap < requiredAmpacity) return false;
          const vDrop = (2 * distFt * loadAmps * w.ohmCu) / 1000;
          return (vDrop / voltage) * 100 <= 3.0;
        }) || AWG_SPECS[AWG_SPECS.length - 1];

      const recAlSpec =
        AWG_SPECS.find((w) => {
          if (w.al75 < requiredAmpacity) return false;
          const vDrop = (2 * distFt * loadAmps * w.ohmAl) / 1000;
          return (vDrop / voltage) * 100 <= 3.0;
        }) || AWG_SPECS[AWG_SPECS.length - 1];

      const actualDropV = (2 * distFt * loadAmps * recCuSpec.ohmCu) / 1000;
      const actualDropPct = (actualDropV / voltage) * 100;
      const deliveredVoltage = Math.max(0, voltage - actualDropV);
      const wattsLostHeat = Math.round(loadAmps * actualDropV);

      const estCostCu = Math.round(distFt * recCuSpec.costCu);
      const estCostAl = recAlSpec.costAl > 0 ? Math.round(distFt * recAlSpec.costAl) : estCostCu;
      const alSavings = Math.max(0, estCostCu - estCostAl);

      const ratedCapCu = is60C ? recCuSpec.cu60 : recCuSpec.cu75;
      const ampacityUtilPct = Math.round((requiredAmpacity / ratedCapCu) * 100);
      // 3% NEC Voltage drop target = 100% of recommended drop budget
      const dropBudgetPct = Math.round((actualDropPct / 3.0) * 100);

      setGauge(
        dom.barDrop,
        dom.txtDrop,
        dropBudgetPct,
        actualDropPct.toFixed(2) + '% Drop (' + deliveredVoltage.toFixed(1) + 'V Delivered • ' + wattsLostHeat + 'W Heat Loss)'
      );
      setGauge(
        dom.barAmpacity,
        dom.txtAmpacity,
        ampacityUtilPct,
        requiredAmpacity + 'A Required / ' + ratedCapCu + 'A Rated (' + recCuSpec.awg + ' AWG @ ' + (is60C ? '60°C Romex' : '75°C THHN') + ')'
      );
      setGauge(
        dom.barConduit,
        dom.txtConduit,
        32,
        'Min Conduit: ' + recCuSpec.conduit + ' EMT/PVC (4-Wire + ' + recCuSpec.ground + ' Ground)'
      );

      if (dom.outCuAwg) dom.outCuAwg.textContent = recCuSpec.awg + ' AWG Cu';
      if (dom.outAlAwg) {
        dom.outAlAwg.textContent =
          recAlSpec.al75 >= requiredAmpacity ? recAlSpec.awg + ' AWG Al' : 'Copper Only';
      }
      if (dom.outVdrop) {
        dom.outVdrop.textContent =
          actualDropPct.toFixed(2) + '% (' + deliveredVoltage.toFixed(1) + 'V)';
      }
      if (dom.outSavings) {
        dom.outSavings.textContent =
          alSavings > 25 && voltage >= 120
            ? 'Save $' + fmtNum.format(alSavings) + ' w/ Al'
            : '$' + fmtNum.format(estCostCu) + ' Est. Cu';
      }

      // Update Live SVG Conduit Cross-Section & Voltage-Drop Blueprint
      if (dom.svgCuAwg) dom.svgCuAwg.textContent = recCuSpec.awg + ' AWG COPPER';
      if (dom.svgAlAwg) {
        dom.svgAlAwg.textContent =
          'OR ' + recAlSpec.awg + ' AWG ALUM (' + recCuSpec.conduit + ' CONDUIT)';
      }
      if (dom.svgVdropTxt) {
        dom.svgVdropTxt.textContent =
          voltage + 'V → ' + distFt + 'ft → ' + deliveredVoltage.toFixed(1) + 'V (' + actualDropPct.toFixed(2) + '% Drop)';
      }
      if (dom.svgConduitTxt) {
        dom.svgConduitTxt.textContent = recCuSpec.conduit + ' CONDUIT (≤40% NEC FILL)';
      }
      if (dom.svgCostTxt) {
        dom.svgCostTxt.textContent =
          alSavings > 25 && voltage >= 120
            ? 'Cu: $' + fmtNum.format(estCostCu) + ' vs Al: $' + fmtNum.format(estCostAl) + ' (Save $' + fmtNum.format(alSavings) + ')'
            : 'Est. Wire Material: $' + fmtNum.format(estCostCu) + ' (' + distFt + ' ft)';
      }
      if (dom.svgDropPill) {
        dom.svgDropPill.setAttribute(
          'fill',
          actualDropPct > 3.0 ? '#dc2626' : recCuSpec.awg !== baseCuSpec.awg ? '#ca8a04' : '#16a34a'
        );
      }

      // Scale the 4 conductor circles inside the SVG conduit cross-section
      const r = recCuSpec.svgRadius || 11;
      [dom.c1, dom.c2, dom.c3].forEach((c) => {
        if (c) c.setAttribute('r', String(r));
      });
      if (dom.c4) dom.c4.setAttribute('r', String(Math.max(5, Math.round(r * 0.75))));

      // Verdict Banner Logic (Exposes the 3% Distance Upsize Trap & 60°C Romex Trap!)
      const upsizedForDistance = recCuSpec.awg !== baseCuSpec.awg;
      const romex60Trap =
        is60C &&
        AWG_SPECS.find((w) => w.cu75 >= requiredAmpacity)?.awg !== baseCuSpec.awg;

      if (dom.verdictBanner && dom.verdictTitle && dom.verdictDesc) {
        if (actualDropPct > 3.5) {
          dom.verdictBanner.dataset.status = 'danger';
          if (dom.verdictBadge) dom.verdictBadge.textContent = 'EXCESSIVE VOLTAGE DROP (' + actualDropPct.toFixed(1) + '%)';
          dom.verdictTitle.textContent =
            'VOLTAGE DROP ALERT: ' +
            distFt +
            '-Ft Run Exceeds 3% NEC Drop Even on ' +
            recCuSpec.awg +
            ' AWG (' +
            actualDropPct.toFixed(2) +
            '% Loss)';
          dom.verdictDesc.textContent =
            'At ' +
            distFt +
            ' feet and ' +
            loadAmps +
            ' Amps (' +
            voltage +
            'V), even 4/0 AWG drops ' +
            actualDropV.toFixed(1) +
            'V (' +
            wattsLostHeat +
            'W wasted as cable heat). Parallel two conductors per phase or step up system voltage.';
          if (dom.svgStatusBadge) dom.svgStatusBadge.textContent = 'EXCEEDS 3% NEC VOLTAGE DROP';
        } else if (upsizedForDistance || romex60Trap) {
          dom.verdictBanner.dataset.status = 'warning';
          if (dom.verdictBadge) {
            dom.verdictBadge.textContent = upsizedForDistance
              ? 'DISTANCE UPSIZE REQUIRED (' + baseCuSpec.awg + ' → ' + recCuSpec.awg + ' AWG)'
              : 'NEC 334.80 ROMEX 60°C UPSIZE';
          }
          if (upsizedForDistance) {
            dom.verdictTitle.textContent =
              '3% VOLTAGE DROP TRAP: Must Upsize from ' +
              baseCuSpec.awg +
              ' AWG to ' +
              recCuSpec.awg +
              ' AWG Copper (or ' +
              recAlSpec.awg +
              ' AWG Aluminum) at ' +
              distFt +
              ' Feet!';
            dom.verdictDesc.textContent =
              'While ' +
              baseCuSpec.awg +
              ' AWG Copper handles ' +
              requiredAmpacity +
              'A on short runs, running it ' +
              distFt +
              ' feet drops ' +
              baseDropPct.toFixed(2) +
              '% voltage (' +
              baseDropV.toFixed(1) +
              'V lost)—violating the NEC 3% branch-circuit recommendation. Upsizing to ' +
              recCuSpec.awg +
              ' AWG Copper (or ' +
              recAlSpec.awg +
              ' AWG Aluminum, saving $' +
              fmtNum.format(alSavings) +
              ') cuts voltage drop to ' +
              actualDropPct.toFixed(2) +
              '%.';
          } else {
            dom.verdictTitle.textContent =
              'NEC 334.80 ROMEX TRAP: 60°C NM-B Rating Forces Upsize to ' +
              recCuSpec.awg +
              ' AWG Copper!';
            dom.verdictDesc.textContent =
              'Under NEC 334.80, indoor Romex (NM-B) and UF-B cable must be sized using the 60°C ampacity column rather than the 75°C THHN column. For your ' +
              requiredAmpacity +
              'A design load, you must use ' +
              recCuSpec.awg +
              ' AWG Romex (or switch to 75°C THHN in ' +
              recCuSpec.conduit +
              ' conduit).';
          }
          if (dom.svgStatusBadge) {
            dom.svgStatusBadge.textContent =
              'UPSIZED TO ' + recCuSpec.awg + ' AWG CU FOR ' + distFt + ' FT RUN';
          }
        } else {
          dom.verdictBanner.dataset.status = 'safe';
          if (dom.verdictBadge) dom.verdictBadge.textContent = 'NEC 310.16 & <3% DROP COMPLIANT';
          dom.verdictTitle.textContent =
            'NEC COMPLIANT: Use ' +
            recCuSpec.awg +
            ' AWG Copper (or ' +
            recAlSpec.awg +
            ' AWG Aluminum) in ' +
            recCuSpec.conduit +
            ' Conduit';
          dom.verdictDesc.textContent =
            'For ' +
            loadAmps +
            ' Amps at ' +
            distFt +
            ' feet (' +
            voltage +
            'V), ' +
            recCuSpec.awg +
            ' AWG Copper delivers ' +
            deliveredVoltage.toFixed(1) +
            'V with only ' +
            actualDropPct.toFixed(2) +
            '% voltage drop. Equipment ground required: ' +
            recCuSpec.ground +
            ' (NEC Table 250.122).';
          if (dom.svgStatusBadge) {
            dom.svgStatusBadge.textContent =
              'NEC COMPLIANT • ' + actualDropPct.toFixed(2) + '% VOLTAGE DROP';
          }
        }
      }
    }

    [inputAmps, inputDist, inputVolt, inputCableType].forEach((el) => {
      updateRangeProgressFallback(el);
      el.addEventListener('input', () => {
        updateRangeProgressFallback(el);
        computeNecSizing();
      });
    });

    if (toggleContinuous) {
      toggleContinuous.addEventListener('change', computeNecSizing);
    }

    document.querySelectorAll('[data-preset-amps]').forEach((btn) => {
      btn.addEventListener('click', () => {
        inputAmps.value = btn.dataset.presetAmps;
        if (btn.dataset.presetDist) inputDist.value = btn.dataset.presetDist;
        if (btn.dataset.presetVolt) inputVolt.value = btn.dataset.presetVolt;
        if (toggleContinuous && btn.dataset.presetCont) {
          toggleContinuous.checked = btn.dataset.presetCont === '1';
        }
        [inputAmps, inputDist].forEach(updateRangeProgressFallback);
        computeNecSizing();
      });
    });

    const shareBtn = document.getElementById('btn-copy-wire-link');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const url = new URL(window.location.href);
        url.searchParams.set('amps', inputAmps.value);
        url.searchParams.set('dist', inputDist.value);
        url.searchParams.set('volt', inputVolt.value);
        url.searchParams.set('cable', inputCableType.value);
        if (toggleContinuous && toggleContinuous.checked) {
          url.searchParams.set('cont', '1');
        } else {
          url.searchParams.delete('cont');
        }
        window.history.replaceState({}, '', url.toString());
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url.toString());
        }
        shareBtn.textContent = '✓ Wire Spec URL Copied!';
        setTimeout(() => {
          shareBtn.textContent = 'Copy Shareable Spec Link';
        }, 2200);
      });
    }

    const printBtn = document.getElementById('btn-print-worksheet');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    computeNecSizing();
  }

  // =========================================================================
  // 4. MODERN ACCESSIBLE SORTABLE DATA TABLES (sortable-table & dynamic-sort)
  // =========================================================================
  function reorderRows(tbody, orderedRows) {
    const move = Object.hasOwn(Element.prototype, 'moveBefore')
      ? (node) => tbody.moveBefore(node, null)
      : (node) => tbody.append(node);

    for (const row of orderedRows) {
      move(row);
    }
  }

  function reorderWithTransition(table, tbody, orderedRows) {
    const update = () => reorderRows(tbody, orderedRows);
    if (orderedRows.length > 200) {
      update();
      return;
    }
    if (table.startViewTransition) {
      table.startViewTransition(update);
    } else if (document.startViewTransition) {
      document.startViewTransition(update);
    } else {
      update();
    }
  }

  function sortRows(rows, index, type, direction) {
    const factor = direction === 'ascending' ? 1 : -1;
    const mapped = rows.map((row) => {
      const cell = row.cells[index];
      const raw = cell ? (cell.dataset.value ?? cell.textContent.trim()) : '';
      return {
        row,
        val: type === 'number' ? Number(raw) : raw
      };
    });

    mapped.sort((a, b) =>
      factor * (type === 'number' ? a.val - b.val : collator.compare(String(a.val), String(b.val)))
    );

    return mapped.map((item) => item.row);
  }

  function handleTableSort(table, button) {
    const th = button.closest('th');
    const tbody = table.tBodies[0];
    if (!th || !tbody) return;

    const direction = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';

    for (const header of table.tHead.rows[0].cells) {
      header.removeAttribute('aria-sort');
    }
    th.setAttribute('aria-sort', direction);

    const rows = sortRows([...tbody.rows], th.cellIndex, th.dataset.type || 'text', direction);
    reorderWithTransition(table, tbody, rows);

    const status = document.getElementById('table-sort-status');
    if (status) {
      const colLabel = button.textContent.replace(/[▲▼⇅]/g, '').trim();
      status.textContent = `Sorted by ${colLabel}, ${direction}, ${rows.length} rows`;
    }
  }

  function initSortableTables() {
    document.querySelectorAll('table.sortable-spec-table').forEach((table) => {
      let handledByCommand = false;

      table.addEventListener('command', (event) => {
        if (event.command !== '--sort') return;
        handledByCommand = true;
        handleTableSort(table, event.source);
      });

      table.querySelectorAll('thead th > button').forEach((btn) => {
        btn.addEventListener('click', () => {
          setTimeout(() => {
            if (!handledByCommand) {
              handleTableSort(table, btn);
            }
            handledByCommand = false;
          }, 0);
        });
      });
    });
  }

  // =========================================================================
  // 5. ACTIVE-VIEW AD REFRESH & HIGH-RPM ELECTRICAL / EV TELEMETRY ENGINE
  // =========================================================================
  const AD_CREATIVES = [
    {
      sponsor: 'Southwire Electrical Supply • CPM Bid: $68.40',
      title: 'Southwire SIMpull® THHN & Romex® NM-B Copper Bulk Spools (6 AWG – 2/0 AWG)',
      desc: 'No-lube SIMpull jacket pulls 50% easier through EMT & Schedule 40 PVC conduit.',
      cta: 'Check Per-Foot Pricing →'
    },
    {
      sponsor: 'ChargePoint & Tesla EV • CPM Bid: $79.20',
      title: 'ChargePoint Home Flex Level 2 EV Charger (Up to 50A / 60A Hardwired)',
      desc: 'UL-Listed 75°C terminal block accepts 6 AWG and 4 AWG Copper THHN directly.',
      cta: 'Claim $150 Utility Rebate →'
    },
    {
      sponsor: 'Square D by Schneider Electric • CPM Bid: $64.90',
      title: 'Square D QO™ 100A & 125A Outdoor/Indoor Main-Lug Subpanel Load Centers',
      desc: 'Includes isolated ground bar for detached garages, pole barns, and workshops.',
      cta: 'View Subpanel Kits →'
    },
    {
      sponsor: 'WindyNation Pure Copper • CPM Bid: $62.10',
      title: 'Ultra-Flex 2 AWG, 1/0 & 4/0 AWG Pure Copper Inverter & RV Battery Cables',
      desc: '100% fine-strandedUSA annealed copper with pre-crimped tinned marine lugs.',
      cta: 'Calculate Cable Kit →'
    },
    {
      sponsor: 'Siemens Spa & Hot Tub Panels • CPM Bid: $71.50',
      title: 'Siemens 50A & 60A 2-Pole Outdoor GFCI Spa Disconnect Panel',
      desc: 'NEC Article 680 compliant weatherproof disconnect for hot tubs, pools & RV pads.',
      cta: 'Check Stock & Price →'
    }
  ];

  function initAdOpsEngine() {
    const slots = document.querySelectorAll('[data-ad-slot]');
    if (!slots.length) return;

    const REFRESH_INTERVAL_SEC = 35;
    let lastUserActivityTs = Date.now();
    let totalImpressions = slots.length;
    let totalRevenueCents = slots.length * 6.9;
    let creativeCursor = 0;

    const hudImp = document.getElementById('hud-impressions');
    const hudRev = document.getElementById('hud-revenue');
    const hudState = document.getElementById('hud-view-state');

    const slotStates = new Map();
    slots.forEach((slot) => {
      slotStates.set(slot, {
        inView: true,
        activeSec: 0,
        refreshes: 0,
        bar: slot.querySelector('.ad-refresh-bar'),
        sponsorEl: slot.querySelector('.js-ad-sponsor'),
        titleEl: slot.querySelector('.js-ad-title'),
        descEl: slot.querySelector('.js-ad-desc'),
        ctaEl: slot.querySelector('.js-ad-cta'),
        countEl: slot.querySelector('.js-ad-refresh-count')
      });
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const st = slotStates.get(entry.target);
            if (st) st.inView = entry.isIntersecting;
          });
        },
        { threshold: 0.5 }
      );
      slots.forEach((s) => observer.observe(s));
    }

    const markActive = () => {
      lastUserActivityTs = Date.now();
    };
    ['pointerdown', 'keydown', 'input', 'scroll'].forEach((evt) => {
      window.addEventListener(evt, markActive, { passive: true });
    });

    function refreshSlotCreative(state) {
      creativeCursor = (creativeCursor + 1) % AD_CREATIVES.length;
      const ad = AD_CREATIVES[creativeCursor];
      if (state.sponsorEl) state.sponsorEl.textContent = ad.sponsor;
      if (state.titleEl) state.titleEl.textContent = ad.title;
      if (state.descEl) state.descEl.textContent = ad.desc;
      if (state.ctaEl) state.ctaEl.textContent = ad.cta;
      if (state.countEl) state.countEl.textContent = 'Auction #' + (state.refreshes + 1);
    }

    setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      const secondsSinceInput = (Date.now() - lastUserActivityTs) / 1000;
      const userIsEngaged = secondsSinceInput <= 45;

      if (userIsEngaged) {
        slotStates.forEach((st) => {
          if (!st.inView) return;
          st.activeSec += 1;
          if (st.bar) {
            const pct = Math.min(100, Math.round((st.activeSec / REFRESH_INTERVAL_SEC) * 100));
            st.bar.style.inlineSize = pct + '%';
          }

          if (st.activeSec >= REFRESH_INTERVAL_SEC) {
            st.activeSec = 0;
            st.refreshes += 1;
            totalImpressions += 1;
            totalRevenueCents += 6.9;
            refreshSlotCreative(st);
          }
        });
      }

      if (hudImp) hudImp.textContent = String(totalImpressions);
      if (hudRev) hudRev.textContent = fmtCurrency.format(totalRevenueCents / 100);
      if (hudState) {
        hudState.textContent = userIsEngaged ? 'ACTIVE VIEW (TIMER RUNNING)' : 'IDLE (PAUSED)';
      }
    }, 1000);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initQuickJumpSearch();
    initNecWireCalculator();
    initSortableTables();
    initAdOpsEngine();
  });
})();
