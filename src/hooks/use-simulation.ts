'use client';

import { useEffect, useRef, useState } from 'react';
import {
  SCENARIOS,
  type Scenario,
  type ScenarioId,
  type Telemetry,
  type LogEntry,
} from '@/lib/scenarios';

const SEED_LOGS: Record<ScenarioId, string[]> = {
  clear: ['Telemetry nominal', 'Laser link locked', 'No atmospheric obstruction'],
  cloud: ['Cloud layer tracking', 'HAPS handoff stable', 'Adaptive layer armed'],
  rain: ['RF backbone nominal', 'Microwave relay stable', 'Rain attenuation tracked'],
  storm: ['Route recalculation ongoing', 'RF backbone resilient', 'Storm cell tracking active'],
};

function jitter(base: number, pct: number) {
  const delta = (base * pct) / 100;
  return +(base + (Math.random() * 2 - 1) * delta).toFixed(2);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export interface SimState {
  scenario: Scenario;
  scenarioId: ScenarioId;
  missionTime: number; // seconds since start
  telemetry: Telemetry;
  logs: LogEntry[];
  aiProcessing: boolean;
  setScenario: (id: ScenarioId) => void;
}

export function useSimulation(): SimState {
  const [scenarioId, setScenarioId] = useState<ScenarioId>('clear');
  const [missionTime, setMissionTime] = useState(0);
  const [telemetry, setTelemetry] = useState<Telemetry>(SCENARIOS.clear.telemetry);
  const [logs, setLogs] = useState<LogEntry[]>(SCENARIOS.clear.logs);
  const [aiProcessing, setAiProcessing] = useState(false);
  const logCounter = useRef(1000);

  // Mission clock
  useEffect(() => {
    const t = setInterval(() => setMissionTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Telemetry jitter
  useEffect(() => {
    const base = SCENARIOS[scenarioId].telemetry;
    const t = setInterval(() => {
      setTelemetry({
        bandwidth: clamp(jitter(base.bandwidth, 4), 0.5, 12),
        latency: clamp(jitter(base.latency, 6), 8, 120),
        packetLoss: clamp(jitter(base.packetLoss, 12), 0, 8),
        signalStrength: clamp(jitter(base.signalStrength, 3), 20, 100),
        availability: clamp(jitter(base.availability, 0.4), 80, 100),
        weatherSeverity: clamp(jitter(base.weatherSeverity, 3), 0, 100),
      });
    }, 1500);
    return () => clearInterval(t);
  }, [scenarioId]);

  // Periodic ambient log entries
  useEffect(() => {
    const t = setInterval(() => {
      const pool = SEED_LOGS[scenarioId];
      const msg = pool[Math.floor(Math.random() * pool.length)]!;
      const entry: LogEntry = {
        id: `auto-${logCounter.current++}`,
        time: formatT(missionTime),
        message: msg,
        level: scenarioId === 'storm' ? 'WARN' : 'INFO',
      };
      setLogs((prev) => [...prev.slice(-40), entry]);
    }, 7000);
    return () => clearInterval(t);
  }, [scenarioId, missionTime]);

  const setScenario = (id: ScenarioId) => {
    setAiProcessing(true);
    setTimeout(() => {
      setScenarioId(id);
      setLogs((prev) => [
        ...prev.slice(-30),
        {
          id: `auto-${logCounter.current++}`,
          time: formatT(missionTime),
          message: `Scenario switched → ${SCENARIOS[id].name}`,
          level: 'INFO',
        },
        ...SCENARIOS[id].logs.filter((l) => !prev.some((p) => p.message === l.message)).slice(0, 4),
      ]);
      setAiProcessing(false);
    }, 1100);
  };

  return {
    scenario: SCENARIOS[scenarioId],
    scenarioId,
    missionTime,
    telemetry,
    logs,
    aiProcessing,
    setScenario,
  };
}

export function formatT(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `T+${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
