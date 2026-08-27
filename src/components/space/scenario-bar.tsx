'use client';

import { motion } from 'framer-motion';
import { Sun, Cloud, CloudRain, CloudLightning, Zap } from 'lucide-react';
import type { ScenarioId } from '@/lib/scenarios';
import { cn } from '@/lib/utils';

const ITEMS: { id: ScenarioId; label: string; icon: React.ReactNode; tone: string }[] = [
  { id: 'clear', label: 'Clear Sky', icon: <Sun className="h-4 w-4" />, tone: 'from-amber-400 to-amber-600' },
  { id: 'cloud', label: 'Cloudy', icon: <Cloud className="h-4 w-4" />, tone: 'from-slate-300 to-slate-500' },
  { id: 'rain', label: 'Rain', icon: <CloudRain className="h-4 w-4" />, tone: 'from-blue-400 to-blue-600' },
  { id: 'storm', label: 'Storm', icon: <CloudLightning className="h-4 w-4" />, tone: 'from-rose-400 to-rose-600' },
];

export function ScenarioBar({
  active,
  onSelect,
  disabled,
}: {
  active: ScenarioId;
  onSelect: (id: ScenarioId) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Scenario
      </span>
      <div className="flex flex-wrap gap-2">
        {ITEMS.map((s) => {
          const isActive = s.id === active;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              disabled={disabled}
              className={cn(
                'group relative flex items-center gap-2 overflow-hidden rounded-md border px-3 py-1.5 text-xs font-semibold transition-all',
                isActive
                  ? 'border-sky-500/60 bg-sky-500/10 text-sky-300 shadow-[0_0_14px_rgba(56,189,248,0.25)]'
                  : 'border-border/60 bg-background/50 text-muted-foreground hover:border-sky-500/30 hover:text-foreground',
                disabled && 'cursor-not-allowed opacity-60'
              )}
            >
              <span className={cn('text-muted-foreground', isActive && 'text-sky-400')}>
                {s.icon}
              </span>
              {s.label}
              {isActive && (
                <motion.span
                  layoutId="scenario-underline"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-sky-400 to-cyan-400"
                />
              )}
            </button>
          );
        })}
      </div>
      <div className="ml-2 flex items-center gap-1.5 rounded-md border border-border/40 bg-background/40 px-2 py-1 text-[10px] text-muted-foreground">
        <Zap className="h-3 w-3 text-amber-400" />
        <span>Click a scenario to trigger adaptive routing</span>
      </div>
    </div>
  );
}
