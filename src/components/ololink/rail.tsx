'use client';

import {
  Globe2,
  Satellite,
  Network,
  RadioTower,
  CloudSun,
  BrainCircuit,
  Route,
  BarChart3,
  TriangleAlert,
  Settings2,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RailId } from '@/hooks/use-ololink';

export const RAIL_ITEMS: { id: RailId; label: string; icon: LucideIcon }[] = [
  { id: 'overview', label: 'Overview', icon: Globe2 },
  { id: 'assets', label: 'Assets', icon: Satellite },
  { id: 'network', label: 'Network', icon: Network },
  { id: 'links', label: 'Communication Links', icon: RadioTower },
  { id: 'weather', label: 'Weather', icon: CloudSun },
  { id: 'ai', label: 'AI Intelligence', icon: BrainCircuit },
  { id: 'planning', label: 'Mission Planning', icon: Route },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'alerts', label: 'Alerts', icon: TriangleAlert },
  { id: 'settings', label: 'Settings', icon: Settings2 },
];

export function Rail({
  active,
  onToggle,
  alertCount,
}: {
  active: RailId | null;
  onToggle: (id: RailId) => void;
  alertCount: number;
}) {
  return (
    <nav className="pointer-events-auto absolute left-0 top-14 bottom-0 z-30 flex w-14 flex-col items-center gap-1 border-r border-white/[0.06] bg-[#05070e]/70 py-3 backdrop-blur-xl">
      {RAIL_ITEMS.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onToggle(id)}
            aria-label={label}
            aria-pressed={isActive}
            className={cn(
              'group relative flex h-10 w-10 items-center justify-center rounded-[9px] transition-colors',
              isActive
                ? 'bg-sky-500/12 text-sky-300'
                : 'text-muted-foreground/70 hover:bg-white/[0.04] hover:text-foreground'
            )}
          >
            <Icon className="h-[17px] w-[17px]" strokeWidth={1.6} />
            {isActive && (
              <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r bg-sky-400" />
            )}
            {id === 'alerts' && alertCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
            )}
            <span className="pointer-events-none absolute left-12 z-40 whitespace-nowrap rounded-md border border-white/[0.08] bg-[#0a0f1c] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground opacity-0 transition-opacity group-hover:opacity-100">
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
