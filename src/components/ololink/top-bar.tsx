'use client';

import { Satellite } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OloLinkState } from '@/hooks/use-ololink';
import { formatT } from '@/hooks/use-ololink';

type Tone = 'ok' | 'warn' | 'crit' | 'info';

const TONE: Record<Tone, string> = {
  ok: 'text-emerald-400',
  warn: 'text-amber-400',
  crit: 'text-rose-400',
  info: 'text-sky-400',
};

function Stat({
  label,
  value,
  tone,
  mono,
}: {
  label: string;
  value: string;
  tone?: Tone;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 leading-none">
      <span className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground/70">{label}</span>
      <span className="flex items-center gap-1.5">
        {tone && (
          <span className={cn('text-[8px]', TONE[tone])} aria-hidden>
            ●
          </span>
        )}
        <span
          className={cn(
            'text-[11px] font-medium tracking-wide text-foreground',
            mono && 'font-mono tabular-nums'
          )}
        >
          {value}
        </span>
      </span>
    </div>
  );
}

export function TopBar({ state }: { state: OloLinkState }) {
  const { profile, telemetry, missionTime, aiProcessing } = state;

  const netTone: Tone =
    profile.networkHealth === 'NOMINAL' ? 'ok' : profile.networkHealth === 'STABLE' ? 'warn' : 'crit';
  const wxTone: Tone = profile.severity > 60 ? 'crit' : profile.severity > 30 ? 'warn' : 'ok';

  return (
    <header className="pointer-events-auto absolute inset-x-0 top-0 z-30 flex h-14 items-center gap-8 border-b border-white/[0.06] bg-[#05070e]/70 px-5 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-[7px] border border-sky-400/30 bg-sky-500/10">
          <Satellite className="h-3.5 w-3.5 text-sky-300" />
        </span>
        <div className="leading-none">
          <div className="text-[13px] font-semibold tracking-[0.34em] text-foreground">OLOLINK</div>
          <div className="mt-1 text-[8px] uppercase tracking-[0.3em] text-muted-foreground/70">
            Mission • Active
          </div>
        </div>
      </div>

      <div className="h-6 w-px bg-white/[0.07]" />

      <div className="flex flex-1 items-center gap-8 overflow-x-auto">
        <Stat label="Network" value={profile.networkHealth} tone={netTone} />
        <Stat label="Weather" value={profile.short} tone={wxTone} />
        <Stat
          label="System"
          value={aiProcessing ? 'RECALCULATING' : profile.systemMode}
          tone={aiProcessing ? 'warn' : 'info'}
        />
        <Stat label="Comms" value={`${telemetry.bandwidth.toFixed(2)} Gbps`} mono />
        <Stat label="Latency" value={`${telemetry.latency} ms`} mono />
        <Stat label="Availability" value={`${telemetry.availability.toFixed(2)}%`} mono />
      </div>

      <div className="hidden items-center gap-2 md:flex">
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {formatT(missionTime)}
        </span>
        <span className={cn('text-[8px]', state.running ? 'animate-pulse text-sky-400' : 'text-muted-foreground')}>
          ●
        </span>
      </div>
    </header>
  );
}
