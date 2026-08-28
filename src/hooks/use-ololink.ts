'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  SCENARIOS,
  linkStates,
  type LinkState,
  type ScenarioId,
  type ScenarioProfile,
} from '@/lib/ololink';

export type RailId =
  | 'overview'
  | 'assets'
  | 'network'
  | 'links'
  | 'weather'
  | 'ai'
  | 'planning'
  | 'analytics'
  | 'alerts'
  | 'settings';

export interface Selection {
  type: 'asset' | 'link';
  id: string;
}

export interface Telemetry {
  bandwidth: number;
  latency: number;
  packetLoss: number;
  signal: number;
  availability: number;
}

export interface EventEntry {
  id: string;
  time: string;
  level: 'INFO' | 'OK' | 'WARN' | 'ALERT';
  text: string;
}

export function formatT(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `T+${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function jitter(base: number, pct: number, digits = 2) {
  const d = (base * pct) / 100;
  return +(base + (Math.random() * 2 - 1) * d).toFixed(digits);
}

export interface OloLinkState {
  scenarioId: ScenarioId;
  profile: ScenarioProfile;
  telemetry: Telemetry;
  links: LinkState[];
  missionTime: number;
  events: EventEntry[];
  panel: RailId | null;
  selection: Selection | null;
  aiProcessing: boolean;
  running: boolean;
  layers: { weather: boolean; orbits: boolean; labels: boolean; routes: boolean };
  setScenario: (id: ScenarioId) => void;
  setPanel: (id: RailId | null) => void;
  togglePanel: (id: RailId) => void;
  select: (s: Selection | null) => void;
  toggleLayer: (k: keyof OloLinkState['layers']) => void;
  setRunning: (v: boolean) => void;
  approve: () => void;
}

export function useOloLink(): OloLinkState {
  const [scenarioId, setScenarioId] = useState<ScenarioId>('clear');
  const [missionTime, setMissionTime] = useState(0);
  const [panel, setPanel] = useState<RailId | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [running, setRunning] = useState(true);
  const [layers, setLayers] = useState({ weather: true, orbits: true, labels: true, routes: true });
  const [telemetry, setTelemetry] = useState<Telemetry>(SCENARIOS.clear.telemetry);
  const [events, setEvents] = useState<EventEntry[]>([
    { id: 'e0', time: 'T+00:00', level: 'INFO', text: 'Orchestration session initialised' },
    { id: 'e1', time: 'T+00:02', level: 'OK', text: 'Constellation handshake complete' },
  ]);
  const counter = useRef(0);
  const clock = useRef(0);

  const profile = SCENARIOS[scenarioId];

  const push = useCallback((level: EventEntry['level'], text: string) => {
    setEvents((prev) => {
      counter.current += 1;
      const id = `e-${counter.current}-${Math.random().toString(36).slice(2, 8)}`;
      return [...prev.slice(-60), { id, time: formatT(clock.current), level, text }];
    });
  }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      clock.current += 1;
      setMissionTime(clock.current);
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const base = SCENARIOS[scenarioId].telemetry;
    const t = setInterval(() => {
      setTelemetry({
        bandwidth: Math.max(0.2, jitter(base.bandwidth, 4)),
        latency: Math.round(jitter(base.latency, 6, 0)),
        packetLoss: Math.max(0, jitter(base.packetLoss, 14)),
        signal: Math.round(jitter(base.signal, 3, 0)),
        availability: Math.min(99.99, +jitter(base.availability, 0.3).toFixed(2)),
      });
    }, 1600);
    return () => clearInterval(t);
  }, [scenarioId, running]);

  useEffect(() => {
    if (!running) return;
    const ambient: Record<ScenarioId, [EventEntry['level'], string][]> = {
      clear: [['OK', 'Optical margin nominal'], ['INFO', 'Constellation telemetry synced']],
      cloud: [['INFO', 'Cloud deck tracking update'], ['OK', 'HAPS relay stable']],
      rain: [['WARN', 'Rain attenuation increasing'], ['OK', 'Microwave relay holding']],
      storm: [['ALERT', 'Storm cell expansion detected'], ['WARN', 'Route recalculation cycle']],
    };
    const t = setInterval(() => {
      const pool = ambient[scenarioId];
      const pick = pool[Math.floor(Math.random() * pool.length)]!;
      push(pick[0], pick[1]);
    }, 8000);
    return () => clearInterval(t);
  }, [scenarioId, running, push]);

  const setScenario = useCallback(
    (id: ScenarioId) => {
      if (id === scenarioId) return;
      setAiProcessing(true);
      push('INFO', `Weather state change → ${SCENARIOS[id].name}`);
      setTimeout(() => {
        setScenarioId(id);
        setAiProcessing(false);
        push(
          SCENARIOS[id].severity > 60 ? 'ALERT' : 'OK',
          `AI decision: ${SCENARIOS[id].ai.action.toLowerCase()}`
        );
      }, 900);
    },
    [scenarioId, push]
  );

  const links = useMemo(() => linkStates(profile), [profile]);

  return {
    scenarioId,
    profile,
    telemetry,
    links,
    missionTime,
    events,
    panel,
    selection,
    aiProcessing,
    running,
    layers,
    setScenario,
    setPanel,
    togglePanel: (id) => setPanel((p) => (p === id ? null : id)),
    select: setSelection,
    toggleLayer: (k) => setLayers((l) => ({ ...l, [k]: !l[k] })),
    setRunning,
    approve: () => push('OK', `Operator approved: ${profile.ai.action}`),
  };
}
