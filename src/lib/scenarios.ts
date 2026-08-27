export type ScenarioId = 'clear' | 'cloud' | 'rain' | 'storm';

export type CommsMode = 'LASER' | 'RF' | 'MICROWAVE' | 'FSO';
export type CommsStatus = 'ONLINE' | 'STANDBY' | 'UNAVAILABLE';

export type NodeId =
  | 'satellite'
  | 'haps'
  | 'drone'
  | 'ground'
  | 'customer';

export interface NodeAsset {
  id: NodeId;
  label: string;
  alt: string;
  status: 'NOMINAL' | 'DEGRADED' | 'OFFLINE';
}

export interface CommsChannel {
  mode: CommsMode;
  label: string;
  status: CommsStatus;
  bandwidth: number; // Gbps
  latency: number; // ms
  loss: number; // %
  signal: number; // %
  desc: string;
}

export interface Telemetry {
  bandwidth: number; // Gbps
  latency: number; // ms
  packetLoss: number; // %
  signalStrength: number; // %
  availability: number; // %
  weatherSeverity: number; // 0-100
}

export interface AiModule {
  id: string;
  name: string;
  status: 'IDLE' | 'PROCESSING' | 'ACTIVE' | 'ALERT';
  confidence: number;
  desc: string;
}

export interface TimelineEvent {
  id: string;
  label: string;
  time: string;
  status: 'done' | 'active' | 'pending';
}

export interface LogEntry {
  id: string;
  time: string;
  message: string;
  level: 'INFO' | 'OK' | 'WARN' | 'ALERT';
}

export interface Scenario {
  id: ScenarioId;
  name: string;
  short: string;
  description: string;
  weatherSeverity: number;
  activePath: NodeId[];
  comms: Record<CommsMode, CommsStatus>;
  telemetry: Telemetry;
  aiDecision: string;
  aiModules: AiModule[];
  timeline: TimelineEvent[];
  logs: LogEntry[];
}

export const NODES: Record<NodeId, NodeAsset> = {
  satellite: { id: 'satellite', label: 'LEO Satellite', alt: '550 km', status: 'NOMINAL' },
  haps: { id: 'haps', label: 'HAPS Platform', alt: '18–20 km', status: 'NOMINAL' },
  drone: { id: 'drone', label: 'Relay Drone', alt: '2–5 km', status: 'NOMINAL' },
  ground: { id: 'ground', label: 'Ground Station', alt: '0 km', status: 'NOMINAL' },
  customer: { id: 'customer', label: 'Customer Network', alt: 'Fiber', status: 'NOMINAL' },
};

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  clear: {
    id: 'clear',
    name: 'Clear Sky',
    short: 'Clear',
    description:
      'Direct optical laser downlink. Nominal atmospheric conditions allow full-bandwidth free-space optical communication.',
    weatherSeverity: 8,
    activePath: ['satellite', 'ground', 'customer'],
    comms: {
      LASER: 'ONLINE',
      RF: 'STANDBY',
      MICROWAVE: 'STANDBY',
      FSO: 'ONLINE',
    },
    telemetry: {
      bandwidth: 10.0,
      latency: 14,
      packetLoss: 0.02,
      signalStrength: 98,
      availability: 99.98,
      weatherSeverity: 8,
    },
    aiDecision:
      'Atmospheric clarity optimal. Direct optical laser path maintained. Adaptive layer on standby.',
    aiModules: defaultAiModules('IDLE'),
    timeline: [
      { id: 't1', label: 'Mission Start', time: 'T+00:00', status: 'done' },
      { id: 't2', label: 'Weather Analysis', time: 'T+00:04', status: 'done' },
      { id: 't3', label: 'Cloud Detection', time: 'T+00:08', status: 'done' },
      { id: 't4', label: 'Decision', time: 'T+00:10', status: 'active' },
      { id: 't5', label: 'Routing', time: '—', status: 'pending' },
      { id: 't6', label: 'Relay', time: '—', status: 'pending' },
      { id: 't7', label: 'Ground Reception', time: '—', status: 'pending' },
      { id: 't8', label: 'Mission Complete', time: '—', status: 'pending' },
    ],
    logs: [
      { id: 'l1', time: 'T+00:00', message: 'Mission started', level: 'INFO' },
      { id: 'l2', time: 'T+00:02', message: 'Satellite connected', level: 'OK' },
      { id: 'l3', time: 'T+00:04', message: 'Weather scan complete — clear', level: 'OK' },
      { id: 'l4', time: 'T+00:08', message: 'No cloud obstruction detected', level: 'INFO' },
      { id: 'l5', time: 'T+00:10', message: 'AI: maintain direct laser path', level: 'OK' },
      { id: 'l6', time: 'T+00:12', message: 'Mission stable', level: 'OK' },
    ],
  },
  cloud: {
    id: 'cloud',
    name: 'Cloudy Sky',
    short: 'Cloud',
    description:
      'Cloudy sky without rain. Cloud layer partially degrades the optical laser; AI activates adaptive routing via HAPS and relay drone.',
    weatherSeverity: 38,
    activePath: ['satellite', 'haps', 'drone', 'ground', 'customer'],
    comms: {
      LASER: 'UNAVAILABLE',
      RF: 'ONLINE',
      MICROWAVE: 'STANDBY',
      FSO: 'STANDBY',
    },
    telemetry: {
      bandwidth: 6.4,
      latency: 38,
      packetLoss: 0.9,
      signalStrength: 71,
      availability: 97.2,
      weatherSeverity: 42,
    },
    aiDecision:
      'Cloud layer detected at ~12 km. Optical laser degraded. Adaptive routing activated: Satellite → HAPS → Drone → Ground.',
    aiModules: defaultAiModules('PROCESSING'),
    timeline: [
      { id: 't1', label: 'Mission Start', time: 'T+00:00', status: 'done' },
      { id: 't2', label: 'Weather Analysis', time: 'T+00:04', status: 'done' },
      { id: 't3', label: 'Cloud Detection', time: 'T+00:08', status: 'done' },
      { id: 't4', label: 'Decision', time: 'T+00:10', status: 'done' },
      { id: 't5', label: 'Routing', time: 'T+00:12', status: 'active' },
      { id: 't6', label: 'Relay', time: '—', status: 'pending' },
      { id: 't7', label: 'Ground Reception', time: '—', status: 'pending' },
      { id: 't8', label: 'Mission Complete', time: '—', status: 'pending' },
    ],
    logs: [
      { id: 'l1', time: 'T+00:00', message: 'Mission started', level: 'INFO' },
      { id: 'l2', time: 'T+00:02', message: 'Satellite connected', level: 'OK' },
      { id: 'l3', time: 'T+00:04', message: 'Weather scan complete', level: 'INFO' },
      { id: 'l4', time: 'T+00:08', message: 'Cloud layer detected at 12 km', level: 'WARN' },
      { id: 'l5', time: 'T+00:09', message: 'AI evaluating conditions', level: 'INFO' },
      { id: 'l6', time: 'T+00:10', message: 'Alternative path selected', level: 'OK' },
      { id: 'l7', time: 'T+00:12', message: 'HAPS relay activated', level: 'OK' },
      { id: 'l8', time: 'T+00:14', message: 'Communication restored', level: 'OK' },
      { id: 'l9', time: 'T+00:16', message: 'Mission stable', level: 'OK' },
    ],
  },
  rain: {
    id: 'rain',
    name: 'Heavy Rain',
    short: 'Rain',
    description:
      'Optical path severely degraded by precipitation. AI recommends adaptive RF/Microwave layer through relay drone.',
    weatherSeverity: 74,
    activePath: ['satellite', 'haps', 'drone', 'ground', 'customer'],
    comms: {
      LASER: 'UNAVAILABLE',
      RF: 'ONLINE',
      MICROWAVE: 'ONLINE',
      FSO: 'UNAVAILABLE',
    },
    telemetry: {
      bandwidth: 3.1,
      latency: 62,
      packetLoss: 2.4,
      signalStrength: 54,
      availability: 92.4,
      weatherSeverity: 74,
    },
    aiDecision:
      'Heavy precipitation. FSO and laser unavailable. Adaptive RF/Microwave layer engaged through HAPS → Drone relay.',
    aiModules: defaultAiModules('ACTIVE'),
    timeline: [
      { id: 't1', label: 'Mission Start', time: 'T+00:00', status: 'done' },
      { id: 't2', label: 'Weather Analysis', time: 'T+00:04', status: 'done' },
      { id: 't3', label: 'Cloud Detection', time: 'T+00:08', status: 'done' },
      { id: 't4', label: 'Decision', time: 'T+00:10', status: 'done' },
      { id: 't5', label: 'Routing', time: 'T+00:12', status: 'done' },
      { id: 't6', label: 'Relay', time: 'T+00:14', status: 'active' },
      { id: 't7', label: 'Ground Reception', time: '—', status: 'pending' },
      { id: 't8', label: 'Mission Complete', time: '—', status: 'pending' },
    ],
    logs: [
      { id: 'l1', time: 'T+00:00', message: 'Mission started', level: 'INFO' },
      { id: 'l2', time: 'T+00:02', message: 'Satellite connected', level: 'OK' },
      { id: 'l3', time: 'T+00:04', message: 'Weather scan complete', level: 'INFO' },
      { id: 'l4', time: 'T+00:06', message: 'Heavy rain detected', level: 'WARN' },
      { id: 'l5', time: 'T+00:08', message: 'Optical path degraded', level: 'ALERT' },
      { id: 'l6', time: 'T+00:09', message: 'AI evaluating conditions', level: 'INFO' },
      { id: 'l7', time: 'T+00:10', message: 'RF/Microwave layer engaged', level: 'OK' },
      { id: 'l8', time: 'T+00:12', message: 'Relay activated', level: 'OK' },
      { id: 'l9', time: 'T+00:14', message: 'Communication restored', level: 'OK' },
      { id: 'l10', time: 'T+00:16', message: 'Mission stable', level: 'OK' },
    ],
  },
  storm: {
    id: 'storm',
    name: 'Severe Storm',
    short: 'Storm',
    description:
      'Severe weather across region. AI recalculates alternative route; mission continues conceptually on resilient RF backbone.',
    weatherSeverity: 93,
    activePath: ['satellite', 'haps', 'drone', 'ground', 'customer'],
    comms: {
      LASER: 'UNAVAILABLE',
      RF: 'ONLINE',
      MICROWAVE: 'ONLINE',
      FSO: 'UNAVAILABLE',
    },
    telemetry: {
      bandwidth: 1.6,
      latency: 88,
      packetLoss: 4.8,
      signalStrength: 38,
      availability: 86.1,
      weatherSeverity: 93,
    },
    aiDecision:
      'Severe storm. All optical paths unavailable. Full adaptive RF/Microwave backbone active. Continuous route recalculation.',
    aiModules: defaultAiModules('ALERT'),
    timeline: [
      { id: 't1', label: 'Mission Start', time: 'T+00:00', status: 'done' },
      { id: 't2', label: 'Weather Analysis', time: 'T+00:04', status: 'done' },
      { id: 't3', label: 'Cloud Detection', time: 'T+00:08', status: 'done' },
      { id: 't4', label: 'Decision', time: 'T+00:10', status: 'done' },
      { id: 't5', label: 'Routing', time: 'T+00:12', status: 'done' },
      { id: 't6', label: 'Relay', time: 'T+00:14', status: 'done' },
      { id: 't7', label: 'Ground Reception', time: 'T+00:16', status: 'active' },
      { id: 't8', label: 'Mission Complete', time: '—', status: 'pending' },
    ],
    logs: [
      { id: 'l1', time: 'T+00:00', message: 'Mission started', level: 'INFO' },
      { id: 'l2', time: 'T+00:02', message: 'Satellite connected', level: 'OK' },
      { id: 'l3', time: 'T+00:04', message: 'Weather scan complete', level: 'INFO' },
      { id: 'l4', time: 'T+00:06', message: 'Severe storm detected', level: 'ALERT' },
      { id: 'l5', time: 'T+00:08', message: 'All optical paths unavailable', level: 'ALERT' },
      { id: 'l6', time: 'T+00:09', message: 'AI recalculating route', level: 'WARN' },
      { id: 'l7', time: 'T+00:10', message: 'Alternative route selected', level: 'OK' },
      { id: 'l8', time: 'T+00:12', message: 'RF backbone engaged', level: 'OK' },
      { id: 'l9', time: 'T+00:14', message: 'Relay activated', level: 'OK' },
      { id: 'l10', time: 'T+00:16', message: 'Mission continues conceptually', level: 'OK' },
    ],
  },
};

function defaultAiModules(status: AiModule['status']): AiModule[] {
  return [
    { id: 'weather', name: 'Weather AI', status, confidence: 94, desc: 'Cloud detection, rain prediction, wind & visibility analysis' },
    { id: 'link', name: 'Link Prediction', status, confidence: 91, desc: 'Predicts link degradation from atmospheric telemetry' },
    { id: 'network', name: 'Network Optimization', status, confidence: 88, desc: 'Balances load across adaptive communication layer' },
    { id: 'mission', name: 'Mission Planning', status, confidence: 90, desc: 'Plans routing to preserve mission continuity' },
    { id: 'health', name: 'Health Monitoring', status, confidence: 96, desc: 'Monitors asset health across the relay chain' },
    { id: 'resource', name: 'Resource Allocation', status, confidence: 87, desc: 'Allocates bandwidth and relay assets dynamically' },
    { id: 'routing', name: 'Communication Routing', status, confidence: 93, desc: 'Selects active path through the adaptive layer' },
    { id: 'engine', name: 'Decision Engine', status, confidence: 92, desc: 'Aggregates module outputs into routing decisions' },
  ];
}

export const COMMS_MODES: CommsMode[] = ['LASER', 'FSO', 'MICROWAVE', 'RF'];

export const COMMS_META: Record<CommsMode, { label: string; desc: string }> = {
  LASER: { label: 'Optical Laser', desc: 'High-capacity coherent laser downlink' },
  FSO: { label: 'Free Space Optical', desc: 'Directed optical through atmosphere' },
  MICROWAVE: { label: 'Microwave', desc: 'Weather-resilient microwave relay' },
  RF: { label: 'Radio Frequency', desc: 'Adaptive RF backbone layer' },
};
