/**
 * OloLink orchestration domain model.
 * Software-defined intelligent communication orchestration across
 * LEO satellites, HAPS, relay drones, ground stations and customer networks.
 */

export type ScenarioId = 'clear' | 'cloud' | 'rain' | 'storm';

export type AssetKind = 'satellite' | 'haps' | 'drone' | 'ground' | 'customer';

export type Tech = 'OPTICAL' | 'FSO' | 'MICROWAVE' | 'RF';

export type Health = 'NOMINAL' | 'DEGRADED' | 'OFFLINE';

export interface Asset {
  id: string;
  name: string;
  kind: AssetKind;
  /** degrees */
  lat: number;
  lon: number;
  /** kilometres above sea level */
  altKm: number;
  role: string;
  region: string;
  health: Health;
}

export interface Segment {
  id: string;
  from: string;
  to: string;
  tech: Tech;
}

export interface WeatherCell {
  id: string;
  name: string;
  lat: number;
  lon: number;
  /** relative radius on the globe */
  size: number;
  /** 0-100 */
  severity: number;
  kind: 'CLOUD' | 'RAIN' | 'STORM';
}

export const TECH_META: Record<
  Tech,
  { label: string; color: string; desc: string; family: 'optical' | 'radio' }
> = {
  OPTICAL: {
    label: 'Optical Laser',
    color: '#38bdf8',
    desc: 'Coherent laser downlink, highest capacity, weather sensitive',
    family: 'optical',
  },
  FSO: {
    label: 'Free-Space Optical',
    color: '#22d3ee',
    desc: 'Directed optical through atmosphere, cloud sensitive',
    family: 'optical',
  },
  MICROWAVE: {
    label: 'Microwave',
    color: '#fbbf24',
    desc: 'Weather-resilient microwave relay, moderate capacity',
    family: 'radio',
  },
  RF: {
    label: 'Radio Frequency',
    color: '#f59e0b',
    desc: 'Adaptive RF backbone, all-weather, lower capacity',
    family: 'radio',
  },
};

export const KIND_META: Record<AssetKind, { label: string; plural: string }> = {
  satellite: { label: 'LEO Satellite', plural: 'LEO Satellites' },
  haps: { label: 'HAPS Platform', plural: 'HAPS Platforms' },
  drone: { label: 'Relay Drone', plural: 'Relay Drones' },
  ground: { label: 'Ground Station', plural: 'Ground Stations' },
  customer: { label: 'Customer Network', plural: 'Customer Networks' },
};

export const ASSETS: Asset[] = [
  // LEO constellation (orchestrated, not owned)
  { id: 'sat-01', name: 'OL-SAT-01', kind: 'satellite', lat: 16, lon: 102, altKm: 550, role: 'Optical downlink', region: 'APAC', health: 'NOMINAL' },
  { id: 'sat-02', name: 'OL-SAT-02', kind: 'satellite', lat: -4, lon: 118, altKm: 585, role: 'Capacity relay', region: 'APAC', health: 'NOMINAL' },
  { id: 'sat-03', name: 'OL-SAT-03', kind: 'satellite', lat: 44, lon: 12, altKm: 610, role: 'Optical downlink', region: 'EMEA', health: 'NOMINAL' },
  { id: 'sat-04', name: 'OL-SAT-04', kind: 'satellite', lat: 34, lon: -108, altKm: 540, role: 'Standby capacity', region: 'AMER', health: 'DEGRADED' },

  // HAPS
  { id: 'haps-01', name: 'HAPS-01', kind: 'haps', lat: 13.4, lon: 100.9, altKm: 18, role: 'Relay', region: 'Thailand', health: 'NOMINAL' },
  { id: 'haps-02', name: 'HAPS-02', kind: 'haps', lat: 1.9, lon: 104.2, altKm: 20, role: 'Relay', region: 'Singapore', health: 'NOMINAL' },
  { id: 'haps-03', name: 'HAPS-03', kind: 'haps', lat: 49.4, lon: 8.9, altKm: 19, role: 'Standby', region: 'Europe', health: 'NOMINAL' },

  // Relay drones
  { id: 'drn-a', name: 'Drone Alpha', kind: 'drone', lat: 13.0, lon: 100.2, altKm: 4, role: 'Low-altitude relay', region: 'Thailand', health: 'NOMINAL' },
  { id: 'drn-b', name: 'Drone Beta', kind: 'drone', lat: 1.5, lon: 103.2, altKm: 3, role: 'Low-altitude relay', region: 'Singapore', health: 'NOMINAL' },
  { id: 'drn-c', name: 'Drone Gamma', kind: 'drone', lat: 50.4, lon: 8.1, altKm: 4, role: 'Standby', region: 'Europe', health: 'NOMINAL' },

  // Ground stations
  { id: 'gs-sg', name: 'GS Singapore', kind: 'ground', lat: 1.35, lon: 103.82, altKm: 0, role: 'Primary gateway', region: 'Singapore', health: 'NOMINAL' },
  { id: 'gs-th', name: 'GS Bangkok', kind: 'ground', lat: 13.75, lon: 100.52, altKm: 0, role: 'Gateway', region: 'Thailand', health: 'NOMINAL' },
  { id: 'gs-eu', name: 'GS Frankfurt', kind: 'ground', lat: 50.11, lon: 8.68, altKm: 0, role: 'Gateway', region: 'Europe', health: 'NOMINAL' },
  { id: 'gs-us', name: 'GS San Jose', kind: 'ground', lat: 37.34, lon: -121.89, altKm: 0, role: 'Gateway', region: 'Americas', health: 'NOMINAL' },

  // Customer networks
  { id: 'cus-sg', name: 'SG Core Network', kind: 'customer', lat: 1.28, lon: 103.9, altKm: 0, role: 'Fiber handoff', region: 'Singapore', health: 'NOMINAL' },
  { id: 'cus-th', name: 'TH Enterprise Edge', kind: 'customer', lat: 13.85, lon: 100.7, altKm: 0, role: 'Fiber handoff', region: 'Thailand', health: 'NOMINAL' },
  { id: 'cus-eu', name: 'EU Data Corridor', kind: 'customer', lat: 50.2, lon: 8.5, altKm: 0, role: 'Fiber handoff', region: 'Europe', health: 'NOMINAL' },
];

export const ASSET_BY_ID: Record<string, Asset> = Object.fromEntries(
  ASSETS.map((a) => [a.id, a])
);

export interface LinkState {
  segment: Segment;
  status: 'ACTIVE' | 'STANDBY' | 'BLOCKED';
  bandwidth: number;
  latency: number;
  loss: number;
  signal: number;
  weatherImpact: string;
}

function seg(id: string, from: string, to: string, tech: Tech): Segment {
  return { id, from, to, tech };
}

/** Every orchestrated path OloLink can choose from. */
export const SEGMENTS: Segment[] = [
  seg('s-sat1-gsth', 'sat-01', 'gs-th', 'OPTICAL'),
  seg('s-sat2-gssg', 'sat-02', 'gs-sg', 'OPTICAL'),
  seg('s-sat3-gseu', 'sat-03', 'gs-eu', 'OPTICAL'),
  seg('s-sat1-haps1', 'sat-01', 'haps-01', 'FSO'),
  seg('s-sat2-haps2', 'sat-02', 'haps-02', 'FSO'),
  seg('s-haps1-drna', 'haps-01', 'drn-a', 'MICROWAVE'),
  seg('s-haps2-drnb', 'haps-02', 'drn-b', 'MICROWAVE'),
  seg('s-drna-gsth', 'drn-a', 'gs-th', 'RF'),
  seg('s-drnb-gssg', 'drn-b', 'gs-sg', 'RF'),
  seg('s-haps1-gsth', 'haps-01', 'gs-th', 'RF'),
  seg('s-gsth-custh', 'gs-th', 'cus-th', 'RF'),
  seg('s-gssg-cussg', 'gs-sg', 'cus-sg', 'RF'),
  seg('s-gseu-cuseu', 'gs-eu', 'cus-eu', 'RF'),
  seg('s-sat3-haps3', 'sat-03', 'haps-03', 'FSO'),
  seg('s-sat4-gsus', 'sat-04', 'gs-us', 'OPTICAL'),
];

export interface ScenarioProfile {
  id: ScenarioId;
  name: string;
  short: string;
  summary: string;
  severity: number;
  networkHealth: 'NOMINAL' | 'STABLE' | 'DEGRADED';
  systemMode: string;
  telemetry: {
    bandwidth: number;
    latency: number;
    packetLoss: number;
    signal: number;
    availability: number;
  };
  /** ordered asset ids of the AI-selected primary route */
  route: string[];
  blockedTech: Tech[];
  weather: WeatherCell[];
  ai: {
    analysis: string[];
    recommendation: string[];
    confidence: number;
    action: string;
  };
  alerts: { id: string; level: 'INFO' | 'WARN' | 'CRITICAL'; text: string }[];
}

const CLOUD_CELLS: WeatherCell[] = [
  { id: 'w1', name: 'Cloud deck TH-4', lat: 13, lon: 101, size: 0.16, severity: 46, kind: 'CLOUD' },
  { id: 'w2', name: 'Cloud deck SG-2', lat: 2, lon: 104, size: 0.12, severity: 38, kind: 'CLOUD' },
];

const RAIN_CELLS: WeatherCell[] = [
  { id: 'w1', name: 'Monsoon band TH', lat: 13.5, lon: 100.8, size: 0.2, severity: 74, kind: 'RAIN' },
  { id: 'w2', name: 'Rain cell SG', lat: 1.8, lon: 103.6, size: 0.15, severity: 66, kind: 'RAIN' },
  { id: 'w3', name: 'Cloud deck EU', lat: 49, lon: 9, size: 0.12, severity: 30, kind: 'CLOUD' },
];

const STORM_CELLS: WeatherCell[] = [
  { id: 'w1', name: 'Storm cell TH-9', lat: 13.6, lon: 100.6, size: 0.24, severity: 93, kind: 'STORM' },
  { id: 'w2', name: 'Storm cell SG-5', lat: 1.6, lon: 103.7, size: 0.19, severity: 84, kind: 'STORM' },
  { id: 'w3', name: 'Rain band APAC', lat: 8, lon: 102, size: 0.22, severity: 61, kind: 'RAIN' },
];

export const SCENARIOS: Record<ScenarioId, ScenarioProfile> = {
  clear: {
    id: 'clear',
    name: 'Clear Sky',
    short: 'CLEAR',
    summary: 'Atmosphere transparent. Direct optical downlink at full capacity.',
    severity: 8,
    networkHealth: 'NOMINAL',
    systemMode: 'DIRECT OPTICAL',
    telemetry: { bandwidth: 10.0, latency: 14, packetLoss: 0.02, signal: 98, availability: 99.98 },
    route: ['sat-01', 'gs-th', 'cus-th'],
    blockedTech: [],
    weather: [],
    ai: {
      analysis: ['Atmospheric clarity optimal', 'Optical margin +7.4 dB', 'No obstruction forecast (90 min)'],
      recommendation: ['Hold direct optical path', 'Keep adaptive layer on standby'],
      confidence: 99,
      action: 'HOLD ROUTE',
    },
    alerts: [],
  },
  cloud: {
    id: 'cloud',
    name: 'Cloud Cover',
    short: 'CLOUD',
    summary: 'Cloud deck at 12 km degrades optical. Adaptive relay engaged via HAPS.',
    severity: 42,
    networkHealth: 'STABLE',
    systemMode: 'ADAPTIVE RELAY',
    telemetry: { bandwidth: 6.4, latency: 38, packetLoss: 0.9, signal: 71, availability: 97.2 },
    route: ['sat-01', 'haps-01', 'drn-a', 'gs-th', 'cus-th'],
    blockedTech: ['OPTICAL'],
    weather: CLOUD_CELLS,
    ai: {
      analysis: ['Cloud layer detected at 12 km', 'Direct laser link unavailable', 'FSO viable above cloud deck'],
      recommendation: ['Reroute via HAPS-01', 'Drone Alpha microwave hop', 'Terminate at GS Bangkok'],
      confidence: 94,
      action: 'REROUTE VIA HAPS',
    },
    alerts: [{ id: 'a1', level: 'WARN', text: 'Optical downlink degraded over Thailand' }],
  },
  rain: {
    id: 'rain',
    name: 'Heavy Rain',
    short: 'RAIN',
    summary: 'Precipitation blocks optical paths. Microwave / RF backbone carrying traffic.',
    severity: 74,
    networkHealth: 'STABLE',
    systemMode: 'RF BACKBONE',
    telemetry: { bandwidth: 3.1, latency: 62, packetLoss: 2.4, signal: 54, availability: 92.4 },
    route: ['sat-02', 'haps-02', 'drn-b', 'gs-sg', 'cus-sg'],
    blockedTech: ['OPTICAL', 'FSO'],
    weather: RAIN_CELLS,
    ai: {
      analysis: ['Rain attenuation 11.2 dB/km', 'Optical and FSO unavailable', 'Microwave margin acceptable'],
      recommendation: ['Shift traffic to HAPS-02', 'Drone Beta microwave hop', 'Terminate at GS Singapore'],
      confidence: 96,
      action: 'ENGAGE MICROWAVE',
    },
    alerts: [
      { id: 'a1', level: 'WARN', text: 'Optical layer unavailable across APAC' },
      { id: 'a2', level: 'INFO', text: 'Bandwidth ceiling reduced to 3.1 Gbps' },
    ],
  },
  storm: {
    id: 'storm',
    name: 'Severe Storm',
    short: 'SEVERE STORM',
    summary: 'Severe convective cells across region. Continuous route recalculation active.',
    severity: 93,
    networkHealth: 'DEGRADED',
    systemMode: 'ADAPTIVE ROUTING',
    telemetry: { bandwidth: 1.62, latency: 85, packetLoss: 4.8, signal: 38, availability: 86.1 },
    route: ['sat-02', 'haps-01', 'drn-a', 'gs-th', 'cus-th'],
    blockedTech: ['OPTICAL', 'FSO'],
    weather: STORM_CELLS,
    ai: {
      analysis: ['Severe storm detected over Thailand', 'All optical links unavailable', 'Route recalculating every 30 s'],
      recommendation: ['HAPS-01', 'Relay Drone Alpha', 'Microwave link', 'Ground Station Bangkok'],
      confidence: 96,
      action: 'AUTO REROUTE',
    },
    alerts: [
      { id: 'a1', level: 'CRITICAL', text: 'Storm cell TH-9 — optical blackout' },
      { id: 'a2', level: 'WARN', text: 'Packet loss above 4% on RF backbone' },
    ],
  },
};

export const SCENARIO_ORDER: ScenarioId[] = ['clear', 'cloud', 'rain', 'storm'];

/** Derive per-segment link state for a scenario. */
export function linkStates(profile: ScenarioProfile): LinkState[] {
  const routeSet = new Set<string>();
  for (let i = 0; i < profile.route.length - 1; i++) {
    routeSet.add(`${profile.route[i]}>${profile.route[i + 1]}`);
  }

  return SEGMENTS.map((segment) => {
    const onRoute = routeSet.has(`${segment.from}>${segment.to}`);
    const blocked = profile.blockedTech.includes(segment.tech);
    const status: LinkState['status'] = blocked ? 'BLOCKED' : onRoute ? 'ACTIVE' : 'STANDBY';
    const optical = TECH_META[segment.tech].family === 'optical';
    const sev = profile.severity;
    const bandwidth = optical
      ? Math.max(0, +(10 - sev * 0.09).toFixed(2))
      : +(3.4 - sev * 0.012).toFixed(2);
    return {
      segment,
      status,
      bandwidth: status === 'BLOCKED' ? 0 : bandwidth,
      latency: Math.round((optical ? 14 : 42) + sev * 0.42),
      loss: +(status === 'BLOCKED' ? 100 : (optical ? 0.02 : 0.6) + sev * 0.04).toFixed(2),
      signal: Math.max(0, Math.round((optical ? 98 : 84) - sev * (optical ? 0.85 : 0.42))),
      weatherImpact: blocked
        ? 'Blocked by atmospheric obstruction'
        : sev > 60
          ? 'Elevated attenuation, margin reduced'
          : sev > 30
            ? 'Minor attenuation'
            : 'No measurable impact',
    };
  });
}

/** Convert lat/lon/altitude into a unit-sphere position (radius 1 = sea level). */
export function geoToVec(lat: number, lon: number, altKm: number, scale = 1): [number, number, number] {
  const r = (1 + altKm / 6371 / 0.55) * scale; // exaggerated altitude for legibility
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = lon * (Math.PI / 180);
  return [
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  ];
}
