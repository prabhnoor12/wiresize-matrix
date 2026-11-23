const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

// ============================================================================
// 1. NEC TABLE 310.16 & CHAPTER 9 TABLE 5/8 MASTER AWG WIRE SPECIFICATIONS
// ============================================================================
const AWG_TABLE = [
  { awg: '14', slug: '14-awg', cu60C: 15, cu75C: 20, cu90C: 25, al75C: 0, maxBreakerCu: 15, ohmPer1kCu: 3.07, ohmPer1kAl: 5.06, areaSqInThhn: 0.0097, minConduit4Wire: '1/2"', groundAwg: '14 AWG', costPerFtCu4W: 0.95, costPerFtAl4W: 0, typicalUse: '15A Lighting & General Bedroom/Living Room Branch Circuits' },
  { awg: '12', slug: '12-awg', cu60C: 20, cu75C: 25, cu90C: 30, al75C: 20, maxBreakerCu: 20, ohmPer1kCu: 1.93, ohmPer1kAl: 3.18, areaSqInThhn: 0.0133, minConduit4Wire: '1/2"', groundAwg: '12 AWG', costPerFtCu4W: 1.35, costPerFtAl4W: 0.75, typicalUse: '20A Kitchen, Bathroom, Garage & Outdoor GFCI Receptacles' },
  { awg: '10', slug: '10-awg', cu60C: 30, cu75C: 35, cu90C: 40, al75C: 30, maxBreakerCu: 30, ohmPer1kCu: 1.21, ohmPer1kAl: 2.00, areaSqInThhn: 0.0211, minConduit4Wire: '1/2"', groundAwg: '10 AWG', costPerFtCu4W: 2.15, costPerFtAl4W: 1.10, typicalUse: '30A Electric Clothes Dryers, 30A RV TT-30 Outlets, Water Heaters & AC Condensers' },
  { awg: '8', slug: '8-awg', cu60C: 40, cu75C: 50, cu90C: 55, al75C: 40, maxBreakerCu: 50, ohmPer1kCu: 0.764, ohmPer1kAl: 1.26, areaSqInThhn: 0.0366, minConduit4Wire: '3/4"', groundAwg: '10 AWG', costPerFtCu4W: 3.40, costPerFtAl4W: 1.55, typicalUse: '40A Electric Ranges, 40A EV Chargers (Romex capped at 40A; THHN in conduit rated 50A)' },
  { awg: '6', slug: '6-awg', cu60C: 55, cu75C: 65, cu90C: 75, al75C: 50, maxBreakerCu: 60, ohmPer1kCu: 0.491, ohmPer1kAl: 0.808, areaSqInThhn: 0.0507, minConduit4Wire: '3/4"', groundAwg: '10 AWG', costPerFtCu4W: 4.95, costPerFtAl4W: 2.10, typicalUse: '50A Hot Tubs, 50A NEMA 14-50 RV/EV Outlets, 60A Hardwired EV Chargers (THHN only for 60A)' },
  { awg: '4', slug: '4-awg', cu60C: 70, cu75C: 85, cu90C: 95, al75C: 65, maxBreakerCu: 85, ohmPer1kCu: 0.308, ohmPer1kAl: 0.508, areaSqInThhn: 0.0824, minConduit4Wire: '1"', groundAwg: '8 AWG', costPerFtCu4W: 7.40, costPerFtAl4W: 2.65, typicalUse: '60A–80A Garage Subpanels, 48A–60A Long-Run EV Chargers, 70A–80A Tankless Water Heaters' },
  { awg: '3', slug: '3-awg', cu60C: 85, cu75C: 100, cu90C: 115, al75C: 75, maxBreakerCu: 100, ohmPer1kCu: 0.245, ohmPer1kAl: 0.403, areaSqInThhn: 0.0973, minConduit4Wire: '1-1/4"', groundAwg: '8 AWG', costPerFtCu4W: 9.10, costPerFtAl4W: 3.10, typicalUse: '100A Main-Lug Indoor/Detached Subpanels (Copper THHN in Conduit)' },
  { awg: '2', slug: '2-awg', cu60C: 95, cu75C: 115, cu90C: 130, al75C: 90, maxBreakerCu: 115, ohmPer1kCu: 0.194, ohmPer1kAl: 0.319, areaSqInThhn: 0.1158, minConduit4Wire: '1-1/4"', groundAwg: '8 AWG', costPerFtCu4W: 11.20, costPerFtAl4W: 2.85, typicalUse: '90A Aluminum Mobile Home Feeder (2-2-2-4 MHF/SER) & 100A–115A Heavy Copper Feeders' },
  { awg: '1', slug: '1-awg', cu60C: 110, cu75C: 130, cu90C: 145, al75C: 100, maxBreakerCu: 125, ohmPer1kCu: 0.154, ohmPer1kAl: 0.253, areaSqInThhn: 0.1562, minConduit4Wire: '1-1/2"', groundAwg: '6 AWG', costPerFtCu4W: 13.80, costPerFtAl4W: 3.45, typicalUse: '100A Full-Rated Aluminum Subpanel Feeder (1-1-1-3 SER) & 125A Copper Subpanels' },
  { awg: '1/0', slug: '1-0-awg', cu60C: 125, cu75C: 150, cu90C: 170, al75C: 120, maxBreakerCu: 150, ohmPer1kCu: 0.122, ohmPer1kAl: 0.201, areaSqInThhn: 0.1855, minConduit4Wire: '1-1/2"', groundAwg: '6 AWG', costPerFtCu4W: 16.50, costPerFtAl4W: 4.15, typicalUse: '125A–150A Copper Service Feeders & 12V 2,000W Off-Grid Inverter Battery Cables' },
  { awg: '2/0', slug: '2-0-awg', cu60C: 145, cu75C: 175, cu90C: 195, al75C: 135, maxBreakerCu: 175, ohmPer1kCu: 0.0967, ohmPer1kAl: 0.159, areaSqInThhn: 0.2223, minConduit4Wire: '2"', groundAwg: '6 AWG', costPerFtCu4W: 20.40, costPerFtAl4W: 4.95, typicalUse: '200A Residential Copper Service Entrance (NEC 310.12 83% Dwelling Rule) & 125A–150A Aluminum Feeders' },
  { awg: '3/0', slug: '3-0-awg', cu60C: 165, cu75C: 200, cu90C: 225, al75C: 155, maxBreakerCu: 200, ohmPer1kCu: 0.0766, ohmPer1kAl: 0.126, areaSqInThhn: 0.2679, minConduit4Wire: '2"', groundAwg: '4 AWG', costPerFtCu4W: 25.10, costPerFtAl4W: 5.90, typicalUse: '200A Commercial/Non-Dwelling Full-Rated Copper Service & Long 150A Aluminum Barn Feeders' },
  { awg: '4/0', slug: '4-0-awg', cu60C: 195, cu75C: 230, cu90C: 260, al75C: 180, maxBreakerCu: 225, ohmPer1kCu: 0.0608, ohmPer1kAl: 0.100, areaSqInThhn: 0.3237, minConduit4Wire: '2-1/2"', groundAwg: '4 AWG', costPerFtCu4W: 31.00, costPerFtAl4W: 6.85, typicalUse: '200A Residential Aluminum Service Entrance (4/0-4/0-2/0-4 SER/URD) & 12V 3,000W+ Inverter Cables' }
];

// Helper to calculate exact NEC wire gauge for given amps, distance (ft), voltage, and max drop %
function computeNecWireRecommendation(amps, distanceFt, voltage = 240, maxDropPct = 3.0, isContinuous = false) {
  const requiredAmpacity = isContinuous ? Math.ceil(amps * 1.25) : amps;

  // 1. Base Ampacity Gauge (75C Copper, 60C Romex Copper, 75C Aluminum)
  const baseCu75 = AWG_TABLE.find((w) => w.cu75C >= requiredAmpacity) || AWG_TABLE[AWG_TABLE.length - 1];
  const baseCu60 = AWG_TABLE.find((w) => w.cu60C >= requiredAmpacity) || AWG_TABLE[AWG_TABLE.length - 1];
  const baseAl75 = AWG_TABLE.find((w) => w.al75C >= requiredAmpacity) || AWG_TABLE[AWG_TABLE.length - 1];

  // 2. Voltage Drop Upsized Gauge (V_drop = 2 * L * I * R / 1000)
  const distCu75 =
    AWG_TABLE.find((w) => {
      if (w.cu75C < requiredAmpacity) return false;
      const vDrop = (2 * distanceFt * amps * w.ohmPer1kCu) / 1000;
      return (vDrop / voltage) * 100 <= maxDropPct;
    }) || AWG_TABLE[AWG_TABLE.length - 1];

  const distAl75 =
    AWG_TABLE.find((w) => {
      if (w.al75C < requiredAmpacity) return false;
      const vDrop = (2 * distanceFt * amps * w.ohmPer1kAl) / 1000;
      return (vDrop / voltage) * 100 <= maxDropPct;
    }) || AWG_TABLE[AWG_TABLE.length - 1];

  const actualDropV = (2 * distanceFt * amps * distCu75.ohmPer1kCu) / 1000;
  const actualDropPct = (actualDropV / voltage) * 100;

  return {
    requiredAmpacity,
    baseCu75: baseCu75.awg,
    baseCu60: baseCu60.awg,
    baseAl75: baseAl75.awg,
    recommendedCuAwg: distCu75.awg,
    recommendedAlAwg: distAl75.awg,
    upsizedForDistance: distCu75.awg !== baseCu75.awg,
    actualDropV: Number(actualDropV.toFixed(2)),
    actualDropPct: Number(actualDropPct.toFixed(2)),
    minConduit: distCu75.minConduit4Wire,
    groundAwg: distCu75.groundAwg,
    estCostCu: Math.round(distanceFt * distCu75.costPerFtCu4W),
    estCostAl: Math.round(distanceFt * distAl75.costPerFtAl4W)
  };
}

// ============================================================================
// 2. 84 HIGH-VOLUME BREAKER AMPERAGE × DISTANCE PAGES (/breakers/[slug]/)
// ============================================================================
const BREAKER_AMPS = [15, 20, 30, 40, 50, 60, 70, 80, 100, 125, 150, 200];
const BREAKER_VARIANTS = [
  { suffix: 'wire-size', label: 'NEC Wire Size Chart (50ft to 300ft)', distFt: 50, voltage: 240, is12v: false },
  { suffix: 'wire-size-50-feet', label: 'at 50 Feet (Copper vs Aluminum)', distFt: 50, voltage: 240, is12v: false },
  { suffix: 'wire-size-100-feet', label: 'at 100 Feet (3% Voltage Drop Chart)', distFt: 100, voltage: 240, is12v: false },
  { suffix: 'wire-size-150-feet', label: 'at 150 Feet (Long-Run Subpanel / Feeder)', distFt: 150, voltage: 240, is12v: false },
  { suffix: 'wire-size-200-feet', label: 'at 200 Feet (Underground Feeder & Voltage Drop)', distFt: 200, voltage: 240, is12v: false },
  { suffix: 'wire-size-300-feet', label: 'at 300 Feet (Extreme Distance Upsize Guide)', distFt: 300, voltage: 240, is12v: false },
  { suffix: '12v-dc-wire-size', label: '12V DC Automotive, Solar & RV Wire Gauge Chart', distFt: 20, voltage: 12, is12v: true }
];

const BREAKERS_DATASET = [];
for (const amps of BREAKER_AMPS) {
  for (const v of BREAKER_VARIANTS) {
    const rec = computeNecWireRecommendation(amps, v.distFt, v.voltage, 3.0, false);
    BREAKERS_DATASET.push({
      slug: `${amps}-amp-${v.suffix}`,
      amps,
      distanceFt: v.distFt,
      voltage: v.voltage,
      is12v: v.is12v,
      title: v.is12v
        ? `${amps} Amp 12V DC Wire Size Chart (10ft to 50ft Voltage Drop)`
        : `${amps} Amp Wire Size ${v.label}`,
      rec
    });
  }
}

// ============================================================================
// 3. 52 HIGH-INTENT PROJECT & APPLIANCE WIRING GUIDES (/projects/[slug]/)
// ============================================================================
const RAW_PROJECTS = [
  // EV Chargers & Garage Subpanels
  { slug: '48-amp-ev-charger-60-amp-breaker-wire-size', name: '48A Hardwired Level 2 EV Charger (60A Breaker)', category: 'EV Chargers & Garage', amps: 48, breakerAmps: 60, voltage: 240, defaultDistFt: 50, isContinuous: true, note: 'Under NEC 625.41, a 48A continuous EV charger requires a 60A circuit (48A × 1.25). Because indoor Romex (NM-B) is limited to the 60°C column (55A max for 6 AWG), you MUST use 6 AWG Copper THHN in conduit or upsize to 4 AWG Romex.' },
  { slug: 'tesla-wall-connector-gen-3-wire-size', name: 'Tesla Gen 3 Wall Connector (48A Output / 60A Breaker)', category: 'EV Chargers & Garage', amps: 48, breakerAmps: 60, voltage: 240, defaultDistFt: 45, isContinuous: true, note: 'Tesla Wall Connector terminals accept 6 AWG to 4 AWG Copper (75°C rated). Never use 6 AWG NM-B Romex at full 48A continuous output.' },
  { slug: '40-amp-nema-14-50-ev-charger-outlet-wire-size', name: '40A Plug-In EV Charger (NEMA 14-50 Outlet on 50A Breaker)', category: 'EV Chargers & Garage', amps: 40, breakerAmps: 50, voltage: 240, defaultDistFt: 50, isContinuous: true, note: 'A 50A circuit safely supports 40A continuous EV charging (80% rule) using 6 AWG Copper Romex NM-B or 6 AWG THHN in 3/4" conduit.' },
  { slug: '32-amp-level-2-ev-charger-40-amp-breaker-wire-size', name: '32A Mobile EV Charger (40A Breaker Circuit)', category: 'EV Chargers & Garage', amps: 32, breakerAmps: 40, voltage: 240, defaultDistFt: 50, isContinuous: true, note: 'Requires 8 AWG Copper Romex NM-B (40A @ 60°C) or 8 AWG THHN up to 75 feet.' },
  { slug: '80-amp-ford-charge-station-pro-100a-breaker-wire-size', name: '80A High-Power EV Charger (Ford Charge Station Pro / 100A Breaker)', category: 'EV Chargers & Garage', amps: 80, breakerAmps: 100, voltage: 240, defaultDistFt: 50, isContinuous: true, note: 'Requires 100A continuous-rated circuit (80A × 1.25 = 100A) using 3 AWG Copper THHN or 2 AWG Copper.' },
  { slug: '100-amp-detached-garage-subpanel-wire-size', name: '100A Detached Garage / Workshop Subpanel Feeder', category: 'Subpanels & Service', amps: 100, breakerAmps: 100, voltage: 240, defaultDistFt: 100, isContinuous: false, note: '1 AWG Aluminum SER/MHF (or 2-2-2-4 Aluminum at 90A) saves over $450 compared to 3 AWG Copper on a 100-foot underground run.' },
  { slug: '60-amp-detached-garage-subpanel-wire-size', name: '60A Detached Garage or Shed Subpanel Feeder', category: 'Subpanels & Service', amps: 60, breakerAmps: 60, voltage: 240, defaultDistFt: 100, isContinuous: false, note: 'At 100 feet, 6 AWG Copper or 4 AWG Aluminum keeps voltage drop under the 3% NEC recommendation.' },
  { slug: '125-amp-workshop-barn-subpanel-wire-size', name: '125A Pole Barn / Metal Shop Subpanel Feeder', category: 'Subpanels & Service', amps: 125, breakerAmps: 125, voltage: 240, defaultDistFt: 150, isContinuous: false, note: 'Requires 1 AWG Copper or 2/0 AWG Aluminum (upsized to 3/0 Aluminum at 150+ feet for <3% voltage drop).' },
  { slug: '150-amp-guest-house-adu-subpanel-wire-size', name: '150A ADU / Guest House Underground Subpanel Feeder', category: 'Subpanels & Service', amps: 150, breakerAmps: 150, voltage: 240, defaultDistFt: 150, isContinuous: false, note: 'Uses 1/0 AWG Copper or 3/0 AWG Aluminum URD/SER (upsized for 150-ft distance).' },
  { slug: '200-amp-main-service-entrance-wire-size', name: '200A Residential Main Service Entrance & Meter Feeder', category: 'Subpanels & Service', amps: 200, breakerAmps: 200, voltage: 240, defaultDistFt: 50, isContinuous: false, note: 'Under NEC 310.12 (83% Residential Dwelling Rule), a 200A whole-home service permits 2/0 AWG Copper or 4/0 AWG Aluminum.' },
  { slug: '50-amp-shed-subpanel-underground-wire-size', name: '50A Backyard Shed / Studio Underground Subpanel', category: 'Subpanels & Service', amps: 50, breakerAmps: 50, voltage: 240, defaultDistFt: 100, isContinuous: false, note: 'Use 6 AWG Copper THWN-2 in 3/4" Schedule 40 PVC conduit buried 18 inches deep.' },
  { slug: '30-amp-shed-120v-240v-subpanel-wire-size', name: '30A Utility Shed 240V 4-Wire Subpanel', category: 'Subpanels & Service', amps: 30, breakerAmps: 30, voltage: 240, defaultDistFt: 100, isContinuous: false, note: '10 AWG Copper up to 85 feet; upsize to 8 AWG Copper at 100–150 feet.' },

  // RV, Camper, Boat & Off-Grid Solar (Direct Synergy with TownMatrix & WattSurgeMatrix)
  { slug: '50-amp-rv-outlet-nema-14-50-wire-size', name: '50A RV Pedestal / NEMA 14-50 Camper Hookup', category: 'RV, Solar & Marine', amps: 50, breakerAmps: 50, voltage: 240, defaultDistFt: 100, isContinuous: false, note: 'A 50A RV pedestal uses two 120V legs (L1, L2, Neutral, Ground). Use 6 AWG Copper up to 80 ft, or 4 AWG Copper / 2 AWG Aluminum at 100–150 ft.' },
  { slug: '30-amp-rv-outlet-tt-30-wire-size', name: '30A RV Camper Outlet (120V NEMA TT-30R Receptacle)', category: 'RV, Solar & Marine', amps: 30, breakerAmps: 30, voltage: 120, defaultDistFt: 75, isContinuous: false, note: 'CRITICAL: A 30A RV TT-30 outlet is 120 Volts (NOT 240V!). Because voltage drop is twice as fast at 120V, 10 AWG Copper drops over 3% past 48 feet—upsize to 8 AWG at 75 ft or 6 AWG at 120 ft!' },
  { slug: '12v-1000w-inverter-battery-cable-size', name: '1,000W 12V DC Pure Sine Inverter Battery Cables', category: 'RV, Solar & Marine', amps: 98, breakerAmps: 125, voltage: 12, defaultDistFt: 6, isContinuous: true, note: '1,000W at 12V DC draws ~98 Amps (with 85% inverter efficiency). Requires 2 AWG or 4 AWG pure copper welding/marine battery cables under 6 feet.' },
  { slug: '12v-2000w-inverter-battery-cable-size', name: '2,000W 12V DC LiFePO4 Inverter Battery Cables', category: 'RV, Solar & Marine', amps: 196, breakerAmps: 250, voltage: 12, defaultDistFt: 5, isContinuous: true, note: '2,000W at 12V DC draws nearly 200 Amps! Requires 2/0 AWG pure copper battery cables with a 250A Class-T fuse.' },
  { slug: '12v-3000w-inverter-battery-cable-size', name: '3,000W 12V DC Off-Grid Inverter Battery Cables', category: 'RV, Solar & Marine', amps: 294, breakerAmps: 350, voltage: 12, defaultDistFt: 5, isContinuous: true, note: '3,000W at 12V draws ~294 Amps. Requires 4/0 AWG pure copper cables kept under 5 feet (or upgrade system to 24V/48V).' },
  { slug: '24v-3000w-solar-inverter-cable-size', name: '3,000W 24V DC Solar Inverter Battery Cables', category: 'RV, Solar & Marine', amps: 147, breakerAmps: 175, voltage: 24, defaultDistFt: 6, isContinuous: true, note: 'Doubling battery bank voltage to 24V cuts current in half (147A), allowing 1/0 AWG or 2/0 AWG copper cables.' },
  { slug: '48v-5000w-solar-hybrid-inverter-cable-size', name: '5,000W 48V DC Hybrid Solar Inverter Battery Cables', category: 'RV, Solar & Marine', amps: 122, breakerAmps: 150, voltage: 48, defaultDistFt: 8, isContinuous: true, note: '48V server-rack battery architecture draws 122A at 5,000W, running cool on 2 AWG or 1/0 AWG copper.' },
  { slug: '12v-50-amp-dc-to-dc-rv-battery-charger-wire-size', name: '50A 12V DC-to-DC Alternator RV/Van Battery Charger', category: 'RV, Solar & Marine', amps: 50, breakerAmps: 60, voltage: 12, defaultDistFt: 20, isContinuous: true, note: 'At 20 feet from truck alternator to camper house battery, 12V 50A requires 4 AWG Copper to prevent voltage drop.' },
  { slug: '24v-80lb-thrust-trolling-motor-wire-size', name: '24V 80-lb Thrust Boat Trolling Motor (Minn Kota / Garmin)', category: 'RV, Solar & Marine', amps: 56, breakerAmps: 60, voltage: 24, defaultDistFt: 20, isContinuous: false, note: 'Requires 6 AWG Marine Tin-Plated Copper wire with a 60A waterproof manual-reset breaker.' },
  { slug: '36v-112lb-thrust-trolling-motor-wire-size', name: '36V 112-lb Thrust Trolling Motor Wiring', category: 'RV, Solar & Marine', amps: 52, breakerAmps: 60, voltage: 36, defaultDistFt: 22, isContinuous: false, note: '6 AWG ABYC Marine Tinned Copper ensures <2% voltage drop from bow to stern.' },
  { slug: '7-way-trailer-electric-brake-controller-wire-size', name: '7-Way RV Trailer Electric Brake & 12V Charge Line', category: 'RV, Solar & Marine', amps: 30, breakerAmps: 30, voltage: 12, defaultDistFt: 25, isContinuous: false, note: 'Use 10 AWG Copper for dual-axle electric trailer brakes and 8 AWG or 10 AWG for the 12V auxiliary battery charge pin.' },
  { slug: '12v-diesel-heater-glow-plug-wire-size', name: '12V 5kW Chinese Diesel Heater (15A Startup Glow Plug)', category: 'RV, Solar & Marine', amps: 15, breakerAmps: 20, voltage: 12, defaultDistFt: 15, isContinuous: false, note: 'Undersized wire causes the classic E-08 / Low-Voltage error during the 13A glow-plug startup. Use 10 AWG Copper beyond 10 feet!' },
  { slug: '12v-2000w-car-audio-amplifier-wire-size', name: '2,000W RMS 12V Car Audio Subwoofer Amplifier Power Wire', category: 'RV, Solar & Marine', amps: 165, breakerAmps: 200, voltage: 12, defaultDistFt: 16, isContinuous: false, note: 'Requires 1/0 AWG 100% Oxygen-Free Copper (OFC)—avoid cheap Copper-Clad Aluminum (CCA) which overheats.' },
  { slug: '400w-12v-solar-panel-array-to-mppt-wire-size', name: '400W 12V/24V Roof Solar Array to MPPT Charge Controller', category: 'RV, Solar & Marine', amps: 30, breakerAmps: 40, voltage: 24, defaultDistFt: 25, isContinuous: true, note: '10 AWG PV Wire works for series strings (40V–80V); use 8 AWG if panels are wired in 12V parallel.' },

  // Hot Tubs, HVAC, Well Pumps & Home Appliances
  { slug: '50-amp-hot-tub-spa-gfci-wire-size', name: '50A Hot Tub / Jacuzzi Outdoor GFCI Subpanel', category: 'Home, HVAC & Pumps', amps: 50, breakerAmps: 50, voltage: 240, defaultDistFt: 75, isContinuous: false, note: 'NEC Article 680 requires 6 AWG Copper THWN-2 with an insulated copper ground inside conduit for outdoor spas (Aluminum and bare ground not permitted on the load side in corrosive spa environments).' },
  { slug: '60-amp-hot-tub-swim-spa-wire-size', name: '60A Large Hot Tub / Swim Spa GFCI Circuit', category: 'Home, HVAC & Pumps', amps: 60, breakerAmps: 60, voltage: 240, defaultDistFt: 75, isContinuous: false, note: 'Requires 6 AWG Copper THWN-2 in 3/4" conduit (up to 75 ft) or 4 AWG Copper beyond 80 ft.' },
  { slug: '50-amp-electric-range-oven-wire-size', name: '50A Kitchen Electric Range / Double Wall Oven (NEMA 14-50)', category: 'Home, HVAC & Pumps', amps: 50, breakerAmps: 50, voltage: 240, defaultDistFt: 45, isContinuous: false, note: 'Standard 6/3 Romex NM-B with ground (rated 55A @ 60°C) or 6 AWG THHN.' },
  { slug: '40-amp-electric-cooktop-range-wire-size', name: '40A Electric Cooktop / Slide-In Range', category: 'Home, HVAC & Pumps', amps: 40, breakerAmps: 40, voltage: 240, defaultDistFt: 45, isContinuous: false, note: 'Uses 8/3 Romex NM-B w/ Ground (rated 40A @ 60°C).' },
  { slug: '30-amp-electric-clothes-dryer-nema-14-30-wire-size', name: '30A Electric Clothes Dryer (4-Prong NEMA 14-30 Outlet)', category: 'Home, HVAC & Pumps', amps: 30, breakerAmps: 30, voltage: 240, defaultDistFt: 40, isContinuous: false, note: 'Requires 10/3 Romex NM-B w/ Ground (4 wires: Hot L1, Hot L2, Neutral, Ground).' },
  { slug: '30-amp-electric-water-heater-4500w-wire-size', name: '4,500W / 5,500W 240V Tank Electric Water Heater (30A Breaker)', category: 'Home, HVAC & Pumps', amps: 23, breakerAmps: 30, voltage: 240, defaultDistFt: 50, isContinuous: true, note: 'Water heaters are treated as continuous loads under NEC 422.13 (4,500W ÷ 240V = 18.75A × 1.25 = 23.4A), requiring 10/2 Romex NM-B on a 30A double-pole breaker.' },
  { slug: '18kw-tankless-electric-water-heater-wire-size', name: '18kW Whole-House Electric Tankless Water Heater (2x 40A Breakers)', category: 'Home, HVAC & Pumps', amps: 75, breakerAmps: 80, voltage: 240, defaultDistFt: 45, isContinuous: false, note: 'Draws 75A across two separate 40A double-pole breakers using two runs of 8/2 Romex NM-B.' },
  { slug: '27kw-tankless-electric-water-heater-wire-size', name: '27kW Electric Tankless Water Heater (3x 40A Breakers / 112.5A)', category: 'Home, HVAC & Pumps', amps: 113, breakerAmps: 120, voltage: 240, defaultDistFt: 45, isContinuous: false, note: 'Requires a 200A main service panel and three separate 40A 240V circuits (3x 8/2 Romex runs).' },
  { slug: '240v-1-2-hp-submersible-deep-well-pump-wire-size', name: '1/2 HP 240V Submersible Deep Well Pump (150–300 ft Depth)', category: 'Home, HVAC & Pumps', amps: 6, breakerAmps: 15, voltage: 240, defaultDistFt: 200, isContinuous: false, note: 'At 200 feet total wire length (house to wellhead + drop pipe depth), 12 AWG Copper submersible pump cable keeps voltage drop under 3%.' },
  { slug: '240v-1-hp-deep-well-pump-wire-size', name: '1 HP 240V Deep Well Submersible Water Pump (250 ft Total Run)', category: 'Home, HVAC & Pumps', amps: 10, breakerAmps: 20, voltage: 240, defaultDistFt: 250, isContinuous: false, note: 'Per Franklin Electric & NEC motor tables, a 1 HP 240V well pump at 250 ft requires 10 AWG Copper (or 8 AWG beyond 300 ft).' },
  { slug: '240v-2-hp-deep-well-irrigation-pump-wire-size', name: '2 HP 240V Deep Well / Agricultural Irrigation Pump (300 ft)', category: 'Home, HVAC & Pumps', amps: 15, breakerAmps: 30, voltage: 240, defaultDistFt: 300, isContinuous: false, note: 'At 300 feet, 15A motor current requires upsizing from 12 AWG to 8 AWG Copper to protect the pump windings from low-voltage heat failure.' },
  { slug: '12000-btu-mini-split-heat-pump-wire-size', name: '12,000 BTU (1-Ton) Ductless Mini-Split AC & Heat Pump', category: 'Home, HVAC & Pumps', amps: 12, breakerAmps: 20, voltage: 240, defaultDistFt: 50, isContinuous: false, note: 'Typically wired with 14/2 or 12/2 Romex to outdoor disconnect box, plus a 14/4 whip to the indoor air handler.' },
  { slug: '24000-btu-2-ton-mini-split-wire-size', name: '24,000 BTU (2-Ton) 240V Multi-Zone Mini-Split Condenser', category: 'Home, HVAC & Pumps', amps: 20, breakerAmps: 30, voltage: 240, defaultDistFt: 60, isContinuous: false, note: 'Uses 10 AWG Copper (10/2 NM-B or 10 AWG THWN-2 in Liquidtight whip).' },
  { slug: '3-ton-central-ac-condenser-wire-size', name: '3-Ton (36,000 BTU) Central Air Conditioner Outdoor Condenser', category: 'Home, HVAC & Pumps', amps: 24, breakerAmps: 35, voltage: 240, defaultDistFt: 50, isContinuous: false, note: 'Nameplate Minimum Circuit Ampacity (MCA) ~22–25A allows 10 AWG Copper on a 30A–35A breaker per NEC Article 440.' },
  { slug: '4-ton-5-ton-central-ac-heat-pump-wire-size', name: '4-Ton / 5-Ton Central AC & Heat Pump Condenser (40A–50A)', category: 'Home, HVAC & Pumps', amps: 36, breakerAmps: 45, voltage: 240, defaultDistFt: 60, isContinuous: false, note: 'Requires 8 AWG Copper Romex/THHN for ~35–40A MCA ratings.' },
  { slug: '15kw-electric-furnace-heat-strips-wire-size', name: '15kW Air Handler Emergency Heat Strips (60A + 30A Circuits)', category: 'Home, HVAC & Pumps', amps: 60, breakerAmps: 60, voltage: 240, defaultDistFt: 45, isContinuous: true, note: '15kW heat kits split into a 10kW bank (60A breaker w/ 6 AWG THHN or 4 AWG Romex) and a 5kW bank (30A breaker w/ 10 AWG Copper).' },
  { slug: '9kw-home-sauna-heater-wire-size', name: '9kW Finnish Electric Sauna Stove Heater (50A 240V)', category: 'Home, HVAC & Pumps', amps: 38, breakerAmps: 50, voltage: 240, defaultDistFt: 60, isContinuous: true, note: '9,000W ÷ 240V = 37.5A continuous load (× 1.25 = 46.9A), requiring 6 AWG Copper rated for 90°C inside the sauna wall.' },
  { slug: '1-5-hp-inground-swimming-pool-pump-wire-size', name: '1.5 HP / 2 HP In-Ground Swimming Pool Filter Pump (240V)', category: 'Home, HVAC & Pumps', amps: 12, breakerAmps: 20, voltage: 240, defaultDistFt: 85, isContinuous: true, note: 'NEC 680.21 requires an insulated 12 AWG Copper equipment ground in conduit (NM-B Romex is prohibited outdoors/underground for pool pumps).' },

  // Shop Tools, Welders, Generators & Compressors
  { slug: '50-amp-240v-welder-outlet-nema-6-50-wire-size', name: '50A 240V MIG/TIG Welder Outlet (NEMA 6-50R Garage Circuit)', category: 'Shop, Welders & Generators', amps: 50, breakerAmps: 50, voltage: 240, defaultDistFt: 50, isContinuous: false, note: 'Requires 6/2 Romex NM-B or 6 AWG THHN in 3/4" EMT conduit (NEMA 6-50 uses Hot-Hot-Ground with no neutral).' },
  { slug: '5-hp-240v-80-gallon-shop-air-compressor-wire-size', name: '5 HP 240V 60/80-Gallon Stationary Shop Air Compressor', category: 'Shop, Welders & Generators', amps: 23, breakerAmps: 30, voltage: 240, defaultDistFt: 50, isContinuous: false, note: 'True 5 HP 240V motors draw 22–24 FLA; wire with 10 AWG Copper (or 8 AWG if FLA is 28A+).' },
  { slug: '7-5-hp-240v-commercial-air-compressor-wire-size', name: '7.5 HP 240V Single-Phase Commercial Air Compressor', category: 'Shop, Welders & Generators', amps: 36, breakerAmps: 50, voltage: 240, defaultDistFt: 60, isContinuous: false, note: 'Requires 8 AWG or 6 AWG Copper THHN in conduit with a magnetic motor starter.' },
  { slug: '30-amp-generator-inlet-box-l14-30-wire-size', name: '30A Portable Generator Power Inlet Box (NEMA L14-30P to Interlock)', category: 'Shop, Welders & Generators', amps: 30, breakerAmps: 30, voltage: 240, defaultDistFt: 35, isContinuous: false, note: 'Supports up to 7,500W 240V generators using 10/3 Romex NM-B or four 10 AWG THWN-2 wires in 1/2" or 3/4" conduit.' },
  { slug: '50-amp-generator-inlet-box-cs6364-ss2-50-wire-size', name: '50A 12,000W Generator Inlet Box (SS2-50 / CS6364 to Transfer Switch)', category: 'Shop, Welders & Generators', amps: 50, breakerAmps: 50, voltage: 240, defaultDistFt: 40, isContinuous: false, note: 'Requires 6/3 Romex NM-B (indoor) or 6 AWG Copper THWN-2 + 10 AWG Ground in 3/4" conduit.' },
  { slug: '24kw-generac-standby-generator-wire-size', name: '22kW / 24kW Whole-House Standby Generator to 200A ATS', category: 'Shop, Welders & Generators', amps: 100, breakerAmps: 100, voltage: 240, defaultDistFt: 40, isContinuous: false, note: '24kW ÷ 240V = 100A output; wire with 3 AWG Copper or 1/0 AWG Aluminum (or 2/0 Cu / 4/0 Al for full 200A service-rated utility side).' },
  { slug: '20-amp-dedicated-garage-freezer-gfci-wire-size', name: '20A Dedicated Garage Freezer / Power Tool Circuit (100 ft)', category: 'Shop, Welders & Generators', amps: 16, breakerAmps: 20, voltage: 120, defaultDistFt: 100, isContinuous: false, note: 'At 100 feet on a 120V circuit, 12 AWG Copper drops 5.1% voltage! Upsize to 10 AWG Copper so compressor startups do not brown out.' },
  { slug: 'landscape-low-voltage-12v-lighting-wire-size', name: '12V 300W Outdoor Landscape Lighting Transformer Run (150 ft)', category: 'Shop, Welders & Generators', amps: 20, breakerAmps: 25, voltage: 12, defaultDistFt: 150, isContinuous: true, note: 'Low-voltage 12V landscape lighting suffers massive voltage drop over 100 ft—use 10/2 or 8/2 direct-burial landscape wire or a 15V multi-tap transformer.' }
];

const PROJECTS_DATASET = RAW_PROJECTS.map((p) => ({
  ...p,
  rec: computeNecWireRecommendation(p.amps, p.defaultDistFt, p.voltage, 3.0, p.isContinuous)
}));

// ============================================================================
// 4. 60 NEC CHAPTER 9 CONDUIT FILL PAGES (/conduit-fill/[slug]/)
// ============================================================================
const CONDUIT_PIPES = [
  { size: '1/2"', slug: '1-2-inch', emtArea40: 0.122, pvc40Area40: 0.114, pvc80Area40: 0.087, innerDiaIn: 0.622 },
  { size: '3/4"', slug: '3-4-inch', emtArea40: 0.213, pvc40Area40: 0.203, pvc80Area40: 0.164, innerDiaIn: 0.824 },
  { size: '1"', slug: '1-inch', emtArea40: 0.346, pvc40Area40: 0.333, pvc80Area40: 0.275, innerDiaIn: 1.049 },
  { size: '1-1/4"', slug: '1-1-4-inch', emtArea40: 0.598, pvc40Area40: 0.581, pvc80Area40: 0.495, innerDiaIn: 1.380 },
  { size: '1-1/2"', slug: '1-1-2-inch', emtArea40: 0.814, pvc40Area40: 0.794, pvc80Area40: 0.684, innerDiaIn: 1.610 },
  { size: '2"', slug: '2-inch', emtArea40: 1.342, pvc40Area40: 1.316, pvc80Area40: 1.150, innerDiaIn: 2.067 }
];

const CONDUIT_WIRES = AWG_TABLE.filter((w) =>
  ['14', '12', '10', '8', '6', '4', '2', '1/0', '2/0', '4/0'].includes(w.awg)
);

const CONDUITS_DATASET = [];
for (const w of CONDUIT_WIRES) {
  for (const c of CONDUIT_PIPES) {
    const maxEmt = Math.floor(c.emtArea40 / w.areaSqInThhn);
    const maxPvc40 = Math.floor(c.pvc40Area40 / w.areaSqInThhn);
    const maxPvc80 = Math.floor(c.pvc80Area40 / w.areaSqInThhn);
    const fourWireFillPctPvc40 = Math.round(((w.areaSqInThhn * 4) / c.pvc40Area40) * 40);

    CONDUITS_DATASET.push({
      slug: `how-many-${w.slug}-wires-in-${c.slug}-conduit`,
      awg: w.awg,
      awgSlug: w.slug,
      wireAreaSqIn: w.areaSqInThhn,
      conduitSize: c.size,
      conduitSlug: c.slug,
      emtArea40: c.emtArea40,
      pvc40Area40: c.pvc40Area40,
      pvc80Area40: c.pvc80Area40,
      maxEmt,
      maxPvc40,
      maxPvc80,
      fourWireFillPctPvc40,
      fits4WiresPvc40: maxPvc40 >= 4,
      title: `How Many ${w.awg} AWG THHN Wires Fit in ${c.size} Conduit? (EMT, PVC Sch 40 & Sch 80)`
    });
  }
}

// ============================================================================
// 5. 40 AWG WIRE GAUGE SPEC & COPPER-VS-ALUMINUM COMPARISON PAGES (/wire-gauge/[slug]/)
// ============================================================================
const WIRE_PAGES_DATASET = [
  // 13 Individual AWG Master Reference Pages
  ...AWG_TABLE.map((w) => ({
    slug: `${w.slug}-wire-ampacity-and-breaker-size`,
    type: 'awg-spec',
    awg: w.awg,
    spec: w,
    title: `${w.awg} AWG Wire Ampacity (${w.cu60C}A Romex vs ${w.cu75C}A THHN), Max Breaker & Voltage Drop Chart`
  })),
  // 27 High-Volume Copper vs Aluminum & Gauge-vs-Gauge Comparison Pages
  { slug: '14-awg-vs-12-awg-wire-ampacity-voltage-drop', type: 'compare', awgA: '14', awgB: '12', title: '14 AWG vs. 12 AWG Wire: 15A vs 20A Ampacity & Voltage Drop Comparison' },
  { slug: '12-awg-vs-10-awg-wire-voltage-drop-100-feet', type: 'compare', awgA: '12', awgB: '10', title: '12 AWG vs. 10 AWG Wire at 100 Feet: Voltage Drop & 20A/30A Breaker Guide' },
  { slug: '10-awg-vs-8-awg-wire-30-amp-40-amp', type: 'compare', awgA: '10', awgB: '8', title: '10 AWG vs. 8 AWG Wire: 30A RV, Dryer & 40A Range Ampacity Comparison' },
  { slug: '8-awg-vs-6-awg-wire-50-amp-breaker', type: 'compare', awgA: '8', awgB: '6', title: '8 AWG vs. 6 AWG Wire for 50 Amp Breaker: Romex 60°C vs THHN 75°C Rule' },
  { slug: '6-awg-vs-4-awg-wire-60-amp-ev-charger', type: 'compare', awgA: '6', awgB: '4', title: '6 AWG vs. 4 AWG Wire for 60A EV Charger & Subpanel (NEC 334.80 Explained)' },
  { slug: '4-awg-vs-2-awg-wire-subpanel-feeder', type: 'compare', awgA: '4', awgB: '2', title: '4 AWG vs. 2 AWG Wire: 70A–115A Subpanel Ampacity & Cost Comparison' },
  { slug: '3-awg-copper-vs-1-awg-aluminum-100-amp-subpanel', type: 'compare', awgA: '3', awgB: '1', title: '3 AWG Copper vs. 1 AWG Aluminum for 100A Subpanel: Ampacity & $450 Cost Savings' },
  { slug: '6-awg-copper-vs-4-awg-aluminum-50-amp-60-amp', type: 'compare', awgA: '6', awgB: '4', title: '6 AWG Copper vs. 4 AWG Aluminum: 50A/60A Subpanel Ampacity & Price Comparison' },
  { slug: '4-awg-copper-vs-2-awg-aluminum-subpanel-feeder', type: 'compare', awgA: '4', awgB: '2', title: '4 AWG Copper vs. 2 AWG Aluminum (2-2-2-4 SER/MHF): 90A Subpanel Showdown' },
  { slug: '2-awg-copper-vs-1-0-awg-aluminum-125-amp-feeder', type: 'compare', awgA: '2', awgB: '1/0', title: '2 AWG Copper vs. 1/0 AWG Aluminum: 120A–125A Subpanel Feeder Comparison' },
  { slug: '1-0-awg-vs-2-0-awg-wire-150-amp-200-amp', type: 'compare', awgA: '1/0', awgB: '2/0', title: '1/0 AWG vs. 2/0 AWG Wire: 150A & 200A Service Entrance Ampacity Chart' },
  { slug: '2-0-awg-copper-vs-4-0-awg-aluminum-200-amp-service', type: 'compare', awgA: '2/0', awgB: '4/0', title: '2/0 AWG Copper vs. 4/0 AWG Aluminum for 200A Main Service (NEC 310.12 Rule)' },
  { slug: '3-0-awg-vs-4-0-awg-copper-wire-ampacity', type: 'compare', awgA: '3/0', awgB: '4/0', title: '3/0 AWG vs. 4/0 AWG Copper Wire: 200A–230A Commercial & Inverter Cables' },
  { slug: '8-awg-romex-nm-b-vs-8-awg-thhn-ampacity', type: 'compare', awgA: '8', awgB: '6', title: 'Why 8 AWG Romex Is Only 40 Amps While 8 AWG THHN Is 50 Amps (NEC 334.80)' },
  { slug: '6-awg-romex-nm-b-vs-6-awg-thhn-60-amp-breaker', type: 'compare', awgA: '6', awgB: '4', title: 'Why 6 AWG Romex Is 55 Amps vs. 6 AWG THHN at 65 Amps (60A Breaker Guide)' },
  { slug: '2-2-2-4-aluminum-ser-vs-2-2-4-6-mhf-subpanel', type: 'compare', awgA: '2', awgB: '1', title: '2-2-2-4 Aluminum SER vs. 2-2-4-6 Mobile Home Feeder (MHF): 90A vs 100A Breaker' },
  { slug: '10-2-romex-vs-10-3-romex-dryer-water-heater', type: 'compare', awgA: '10', awgB: '8', title: '10/2 vs. 10/3 Romex Wire: When Do You Need a Neutral Wire on 240V Circuits?' },
  { slug: '6-2-romex-vs-6-3-romex-ev-charger-range', type: 'compare', awgA: '6', awgB: '4', title: '6/2 vs. 6/3 Wire for EV Chargers, Ranges & Hot Tubs (3-Wire vs 4-Wire 240V)' },
  { slug: 'uf-b-direct-burial-vs-thwn-2-in-pvc-conduit', type: 'compare', awgA: '6', awgB: '4', title: 'UF-B Direct Burial Cable vs. THWN-2 in PVC Conduit: Burial Depth & Ampacity' },
  { slug: 'pvc-schedule-40-vs-schedule-80-conduit-fill', type: 'compare', awgA: '6', awgB: '4', title: 'PVC Schedule 40 vs. Schedule 80 Conduit: Wall Thickness & Wire Fill Capacity' },
  { slug: 'emt-metal-conduit-vs-pvc-conduit-wire-fill', type: 'compare', awgA: '8', awgB: '6', title: 'EMT Metal Conduit vs. PVC Conduit: Grounding Rules & NEC Chapter 9 Wire Fill' },
  { slug: '12v-vs-24v-vs-48v-dc-wire-size-comparison', type: 'compare', awgA: '2/0', awgB: '2', title: '12V vs. 24V vs. 48V Solar Inverter Wire Gauge Comparison (Why Voltage Cuts Cable Cost 75%)' },
  { slug: 'ofc-oxygen-free-copper-vs-cca-copper-clad-aluminum', type: 'compare', awgA: '4', awgB: '2', title: 'OFC (Pure Copper) vs. CCA (Copper-Clad Aluminum) 12V Power Wire Resistance & Ampacity' },
  { slug: 'solid-vs-stranded-thhn-wire-ampacity-conduit', type: 'compare', awgA: '12', awgB: '10', title: 'Solid vs. Stranded THHN Wire in Conduit: Ampacity, Pulling Ease & Voltage Drop' },
  { slug: '3-percent-vs-5-percent-nec-voltage-drop-rule', type: 'compare', awgA: '6', awgB: '4', title: 'NEC 3% Branch Circuit vs. 5% Feeder + Branch Voltage Drop Rule Explained' },
  { slug: 'nec-250-122-equipment-grounding-conductor-chart', type: 'compare', awgA: '10', awgB: '8', title: 'NEC Table 250.122 Equipment Grounding Conductor Size Chart (15A to 400A Breakers)' },
  { slug: 'nec-310-16-wire-ampacity-chart-60c-75c-90c', type: 'compare', awgA: '6', awgB: '3', title: 'Complete NEC Table 310.16 Copper & Aluminum Ampacity Chart (60°C, 75°C & 90°C Columns)' }
];

fs.writeFileSync(path.join(DATA_DIR, 'awg_table.json'), JSON.stringify(AWG_TABLE, null, 2), 'utf8');
fs.writeFileSync(path.join(DATA_DIR, 'breakers.json'), JSON.stringify(BREAKERS_DATASET, null, 2), 'utf8');
fs.writeFileSync(path.join(DATA_DIR, 'projects.json'), JSON.stringify(PROJECTS_DATASET, null, 2), 'utf8');
fs.writeFileSync(path.join(DATA_DIR, 'conduits.json'), JSON.stringify(CONDUITS_DATASET, null, 2), 'utf8');
fs.writeFileSync(path.join(DATA_DIR, 'wire_comparisons.json'), JSON.stringify(WIRE_PAGES_DATASET, null, 2), 'utf8');

console.log(
  `Seeded NEC Datasets: ${BREAKERS_DATASET.length} Breaker Pages + ${PROJECTS_DATASET.length} Project Pages + ${CONDUITS_DATASET.length} Conduit Fill Pages + ${WIRE_PAGES_DATASET.length} Wire Spec/Compare Pages = ${
    1 + BREAKERS_DATASET.length + PROJECTS_DATASET.length + CONDUITS_DATASET.length + WIRE_PAGES_DATASET.length + 4
  } Total Pages!`
);
