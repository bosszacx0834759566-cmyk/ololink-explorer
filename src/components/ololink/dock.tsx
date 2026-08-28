'use client';

import { Play, Pause, Layers, Camera, Clock, Search, Bell, TerminalSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SCENARIO_ORDER, SCENARIOS } from '@/lib/ololink';
import type { OloLinkState } from '@/hooks/use-ololink';

function DockButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'group relative flex h-8 w-8 items-center justify-center rounded-md transition-colors',
        active ? 'bg-sky-500/15 text-sky-300' : 'text-muted-foreground/70 hover:bg-white/[0.05] hover:text-foreground'
      )}
    >
      {children}
      <span className="pointer-events-none absolute -top-8 whitespace-nowrap rounded border border-white/[0.08] bg-[#0a0f1c] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.16em] opacity-0 transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </button>
  );
}

export function Dock({ state }: { state: OloLinkState }) {
  const { layers, toggleLayer, running, setRunning, scenarioId, setScenario, aiProcessing } = state;

  return (
    <div className="pointer-events-auto absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-white/[0.07] bg-[#05070e]/80 px-2 py-1.5 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.9)] backdrop-blur-xl">
      <DockButton label="Search" onClick={() => state.setPanel('assets')}>
        <Search className="h-4 w-4" strokeWidth={1.6} />
      </DockButton>
      <DockButton label="Command" onClick={() => state.setPanel('ai')}>
        <TerminalSquare className="h-4 w-4" strokeWidth={1.6} />
      </DockButton>
      <DockButton label="Timeline" onClick={() => state.setPanel('planning')}>
        <Clock className="h-4 w-4" strokeWidth={1.6} />
      </DockButton>

      <span className="mx-1 h-5 w-px bg-white/[0.08]" />

      {/* Simulation: weather states */}
      <div className="flex items-center gap-0.5 rounded-lg bg-white/[0.03] p-0.5">
        {SCENARIO_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            disabled={aiProcessing}
            onClick={() => setScenario(id)}
            className={cn(
              'rounded-[6px] px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] transition-colors disabled:opacity-50',
              scenarioId === id
                ? 'bg-sky-500/15 text-sky-300'
                : 'text-muted-foreground/70 hover:text-foreground'
            )}
          >
            {SCENARIOS[id].short}
          </button>
        ))}
      </div>

      <span className="mx-1 h-5 w-px bg-white/[0.08]" />

      <DockButton label={running ? 'Pause' : 'Play'} onClick={() => setRunning(!running)} active={!running}>
        {running ? <Pause className="h-4 w-4" strokeWidth={1.6} /> : <Play className="h-4 w-4" strokeWidth={1.6} />}
      </DockButton>
      <DockButton label="Weather layer" active={layers.weather} onClick={() => toggleLayer('weather')}>
        <Layers className="h-4 w-4" strokeWidth={1.6} />
      </DockButton>
      <DockButton label="Reset camera" onClick={() => state.select(null)}>
        <Camera className="h-4 w-4" strokeWidth={1.6} />
      </DockButton>
      <DockButton label="Notifications" onClick={() => state.setPanel('alerts')}>
        <Bell className="h-4 w-4" strokeWidth={1.6} />
        {state.profile.alerts.length > 0 && (
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
        )}
      </DockButton>
    </div>
  );
}
