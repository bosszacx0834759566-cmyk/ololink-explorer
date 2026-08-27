'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Satellite,
  Plane,
  Cpu,
  Radio,
  CloudSun,
  Network,
  Brain,
  ListOrdered,
  Settings,
  ChevronRight,
  Activity,
  Gauge,
  CircuitBoard,
  Workflow,
  HeartPulse,
  Boxes,
  Route,
  Lightbulb,
} from 'lucide-react';
import { Panel } from '@/components/space/panel';
import { StatusDot } from '@/components/space/status-dot';
import { NODES, type Scenario, type NodeId, type AiModule } from '@/lib/scenarios';
import { cn } from '@/lib/utils';

type Tab = 'overview' | 'timeline' | 'settings';

const ASSET_ICONS: Record<NodeId, React.ReactNode> = {
  satellite: <Satellite className="h-3.5 w-3.5" />,
  haps: <Plane className="h-3.5 w-3.5" />,
  drone: <Radio className="h-3.5 w-3.5" />,
  ground: <CircuitBoard className="h-3.5 w-3.5" />,
  customer: <Network className="h-3.5 w-3.5" />,
};

const AI_ICONS: Record<string, React.ReactNode> = {
  weather: <CloudSun className="h-3.5 w-3.5" />,
  link: <Activity className="h-3.5 w-3.5" />,
  network: <Gauge className="h-3.5 w-3.5" />,
  mission: <Workflow className="h-3.5 w-3.5" />,
  health: <HeartPulse className="h-3.5 w-3.5" />,
  resource: <Boxes className="h-3.5 w-3.5" />,
  routing: <Route className="h-3.5 w-3.5" />,
  engine: <Lightbulb className="h-3.5 w-3.5" />,
};

const AI_TONE: Record<AiModule['status'], 'green' | 'blue' | 'amber' | 'red' | 'slate'> = {
  IDLE: 'slate',
  PROCESSING: 'amber',
  ACTIVE: 'blue',
  ALERT: 'red',
};

export function LeftPanel({ scenario }: { scenario: Scenario }) {
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <div className="flex h-full flex-col gap-3">
      <Panel title="Mission Control" icon={<Brain className="h-3.5 w-3.5" />}>
        <div className="flex border-b border-border/60">
          {(['overview', 'timeline', 'settings'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors',
                tab === t
                  ? 'text-sky-400'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t === 'overview' && <Cpu className="h-3 w-3" />}
              {t === 'timeline' && <ListOrdered className="h-3 w-3" />}
              {t === 'settings' && <Settings className="h-3 w-3" />}
              {t}
            </button>
          ))}
        </div>

        <div className="panel-scroll max-h-[calc(100vh-15rem)] overflow-y-auto p-3">
          <AnimatePresence mode="wait">
            {tab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <AssetList scenario={scenario} />
                <AiModules modules={scenario.aiModules} />
              </motion.div>
            )}
            {tab === 'timeline' && <TimelineView scenario={scenario} />}
            {tab === 'settings' && <SettingsView />}
          </AnimatePresence>
        </div>
      </Panel>
    </div>
  );
}

function AssetList({ scenario }: { scenario: Scenario }) {
  const order: NodeId[] = ['satellite', 'haps', 'drone', 'ground', 'customer'];
  const active = new Set(scenario.activePath);
  return (
    <div>
      <SectionLabel>System Assets</SectionLabel>
      <div className="space-y-1.5">
        {order.map((id) => {
          const node = NODES[id];
          const isActive = active.has(id);
          return (
            <div
              key={id}
              className={cn(
                'flex items-center justify-between rounded-md border px-2.5 py-2 transition-colors',
                isActive
                  ? 'border-sky-500/40 bg-sky-500/5'
                  : 'border-border/40 bg-background/30 opacity-60'
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-sky-400' : 'text-muted-foreground'}>
                  {ASSET_ICONS[id]}
                </span>
                <div className="leading-tight">
                  <div className="text-xs font-medium text-foreground">{node.label}</div>
                  <div className="font-mono-tel text-[10px] text-muted-foreground">{node.alt}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {isActive ? 'ACTIVE' : 'STBY'}
                </span>
                <StatusDot tone={isActive ? 'green' : 'slate'} pulse={isActive} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AiModules({ modules }: { modules: AiModule[] }) {
  return (
    <div>
      <SectionLabel>AI Modules</SectionLabel>
      <div className="space-y-1.5">
        {modules.map((m) => (
          <div
            key={m.id}
            className="group rounded-md border border-border/40 bg-background/30 px-2.5 py-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sky-400/80">{AI_ICONS[m.id]}</span>
                <span className="text-xs font-medium text-foreground">{m.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono-tel text-[10px] text-muted-foreground">
                  {m.confidence}%
                </span>
                <StatusDot tone={AI_TONE[m.status]} />
              </div>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{m.desc}</span>
              <span
                className={cn(
                  'text-[9px] font-semibold uppercase tracking-wider',
                  m.status === 'ALERT'
                    ? 'text-rose-400'
                    : m.status === 'PROCESSING'
                      ? 'text-amber-400'
                      : m.status === 'ACTIVE'
                        ? 'text-sky-400'
                        : 'text-muted-foreground'
                )}
              >
                {m.status}
              </span>
            </div>
            <div className="mt-1.5 h-0.5 w-full overflow-hidden rounded-full bg-border/50">
              <motion.div
                className={cn(
                  'h-full rounded-full',
                  m.status === 'ALERT'
                    ? 'bg-rose-500'
                    : m.status === 'PROCESSING'
                      ? 'bg-amber-400'
                      : m.status === 'ACTIVE'
                        ? 'bg-sky-400'
                        : 'bg-slate-500'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${m.confidence}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineView({ scenario }: { scenario: Scenario }) {
  return (
    <div>
      <SectionLabel>Mission Timeline</SectionLabel>
      <div className="relative ml-2 space-y-3 border-l border-border/60 pl-4">
        {scenario.timeline.map((ev, i) => (
          <div key={ev.id} className="relative">
            <span
              className={cn(
                'absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-background',
                ev.status === 'done'
                  ? 'bg-sky-400'
                  : ev.status === 'active'
                    ? 'bg-amber-400'
                    : 'bg-border'
              )}
            />
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  'text-xs font-medium',
                  ev.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'
                )}
              >
                {ev.label}
              </span>
              <span className="font-mono-tel text-[10px] text-muted-foreground">{ev.time}</span>
            </div>
            {ev.status === 'active' && (
              <motion.div
                className="mt-1 h-0.5 w-10 rounded-full bg-amber-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
            )}
            {i < scenario.timeline.length - 1 && ev.status === 'done' && (
              <ChevronRight className="absolute -left-[18px] top-3 h-3 w-3 text-sky-400/40" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsView() {
  const items = [
    'Telemetry stream',
    'AI autonomy level',
    'Weather scan interval',
    'Alert thresholds',
    'Data retention',
    'Display preferences',
  ];
  return (
    <div>
      <SectionLabel>System Settings</SectionLabel>
      <div className="space-y-1.5">
        {items.map((s) => (
          <div
            key={s}
            className="flex items-center justify-between rounded-md border border-border/40 bg-background/30 px-2.5 py-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <span>{s}</span>
            <ChevronRight className="h-3 w-3" />
          </div>
        ))}
      </div>
      <p className="mt-3 px-1 text-[10px] leading-relaxed text-muted-foreground">
        Settings are illustrative in this operational concept demonstration.
      </p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </div>
  );
}
