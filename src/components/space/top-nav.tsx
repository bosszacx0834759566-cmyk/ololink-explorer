'use client';

import { Activity, Satellite, CloudRain, Cpu, ShieldCheck, Radio, AlertTriangle, Clock } from 'lucide-react';
import { StatusDot } from '@/components/space/status-dot';
import { formatT } from '@/hooks/use-simulation';
import type { Scenario, ScenarioId } from '@/lib/scenarios';

const SCENARIO_TONE: Record<ScenarioId, 'green' | 'amber' | 'blue' | 'red'> = {
  clear: 'green',
  cloud: 'amber',
  rain: 'blue',
  storm: 'red',
};

const SCENARIO_LABEL: Record<ScenarioId, string> = {
  clear: 'CLEAR SKY',
  cloud: 'CLOUD COVER',
  rain: 'HEAVY RAIN',
  storm: 'SEVERE STORM',
};

export function TopNav({
  scenario,
  scenarioId,
  missionTime,
  aiProcessing,
  telemetry,
}: {
  scenario: Scenario;
  scenarioId: ScenarioId;
  missionTime: number;
  aiProcessing: boolean;
  telemetry: Scenario['telemetry'];
}) {
  const av = telemetry.availability.toFixed(1);
  const health = scenarioId === 'storm' ? 'DEGRADED' : scenarioId === 'rain' ? 'STABLE' : 'NOMINAL';
  const healthTone = scenarioId === 'storm' ? 'red' : scenarioId === 'rain' ? 'amber' : 'green';

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="flex h-14 items-center gap-4 px-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-sky-500 to-blue-700 shadow-[0_0_14px_rgba(56,189,248,0.5)]">
            <Satellite className="h-4 w-4 text-white" />
          </div>
          <div className="leading-none">
            <div className="text-sm font-bold tracking-[0.2em] text-foreground">OLOLINK</div>
            <div className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
              Global Network Control
            </div>
          </div>
        </div>

        <div className="hidden h-8 w-px bg-border/60 md:block" />

        {/* Status pills */}
        <div className="flex flex-1 items-center gap-2 overflow-x-auto">
          <Pill icon={<Activity className="h-3.5 w-3.5" />} label="Mission" value="ACTIVE" tone="green" />
          <Pill
            icon={<Clock className="h-3.5 w-3.5" />}
            label="MET"
            value={formatT(missionTime)}
            tone="blue"
            mono
          />
          <Pill
            icon={<Cpu className="h-3.5 w-3.5" />}
            label="AI"
            value={aiProcessing ? 'PROCESSING' : 'NOMINAL'}
            tone={aiProcessing ? 'amber' : 'green'}
          />
          <Pill
            icon={<CloudRain className="h-3.5 w-3.5" />}
            label="Weather"
            value={SCENARIO_LABEL[scenarioId]}
            tone={SCENARIO_TONE[scenarioId]}
          />
          <Pill
            icon={<ShieldCheck className="h-3.5 w-3.5" />}
            label="System"
            value={health}
            tone={healthTone}
          />
          <Pill
            icon={<Radio className="h-3.5 w-3.5" />}
            label="Comms"
            value={`${av}%`}
            tone={parseFloat(av) >= 95 ? 'green' : parseFloat(av) >= 88 ? 'amber' : 'red'}
          />
        </div>

        {/* Alerts */}
        <div className="hidden items-center gap-2 rounded-md border border-border/60 bg-background/50 px-2.5 py-1 lg:flex">
          <AlertTriangle
            className={`h-3.5 w-3.5 ${scenarioId === 'storm' || scenarioId === 'rain' ? 'text-amber-400' : 'text-emerald-400'}`}
          />
          <span className="text-[11px] font-medium text-muted-foreground">
            {scenarioId === 'storm'
              ? '2 active alerts'
              : scenarioId === 'rain'
                ? '1 active alert'
                : 'No active alerts'}
          </span>
        </div>
      </div>
    </header>
  );
}

function Pill({
  icon,
  label,
  value,
  tone,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: 'green' | 'blue' | 'amber' | 'red';
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background/50 px-2.5 py-1">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <StatusDot tone={tone} />
      <span className={mono ? 'font-mono-tel text-[11px] font-semibold text-foreground' : 'text-[11px] font-semibold text-foreground'}>
        {value}
      </span>
    </div>
  );
}
