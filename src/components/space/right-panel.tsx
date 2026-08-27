'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Gauge,
  Activity,
  Waves,
  Signal,
  CloudRain,
  Cpu,
  ListTree,
  Radio,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
  Tooltip as RTooltip,
} from 'recharts';
import { Panel } from '@/components/space/panel';
import { Metric } from '@/components/space/metric';
import { StatusDot } from '@/components/space/status-dot';
import {
  COMMS_MODES,
  COMMS_META,
  type Scenario,
  type CommsMode,
  type CommsStatus,
  type LogEntry,
  type Telemetry,
} from '@/lib/scenarios';
import { formatT } from '@/hooks/use-simulation';
import { cn } from '@/lib/utils';

const STATUS_TONE: Record<CommsStatus, 'green' | 'amber' | 'red'> = {
  ONLINE: 'green',
  STANDBY: 'amber',
  UNAVAILABLE: 'red',
};

export function RightPanel({
  scenario,
  telemetry,
  logs,
  aiProcessing,
  missionTime,
}: {
  scenario: Scenario;
  telemetry: Telemetry;
  logs: LogEntry[];
  aiProcessing: boolean;
  missionTime: number;
}) {
  return (
    <div className="flex h-full flex-col gap-3">
      {/* Telemetry */}
      <Panel title="Telemetry" icon={<Gauge className="h-3.5 w-3.5" />}>
        <div className="grid grid-cols-2 gap-2 p-3">
          <Metric label="Bandwidth" value={telemetry.bandwidth.toFixed(2)} unit="Gbps" tone="text-sky-400" />
          <Metric label="Latency" value={Math.round(telemetry.latency)} unit="ms" tone="text-foreground" />
          <Metric
            label="Packet Loss"
            value={telemetry.packetLoss.toFixed(2)}
            unit="%"
            tone={telemetry.packetLoss > 3 ? 'text-rose-400' : telemetry.packetLoss > 1 ? 'text-amber-400' : 'text-emerald-400'}
          />
          <Metric
            label="Signal"
            value={Math.round(telemetry.signalStrength)}
            unit="%"
            tone={telemetry.signalStrength > 70 ? 'text-emerald-400' : telemetry.signalStrength > 45 ? 'text-amber-400' : 'text-rose-400'}
          />
          <Metric
            label="Availability"
            value={telemetry.availability.toFixed(1)}
            unit="%"
            tone={telemetry.availability > 95 ? 'text-emerald-400' : telemetry.availability > 88 ? 'text-amber-400' : 'text-rose-400'}
          />
          <Metric
            label="Weather Sev."
            value={Math.round(telemetry.weatherSeverity)}
            unit="%"
            tone={telemetry.weatherSeverity > 70 ? 'text-rose-400' : telemetry.weatherSeverity > 35 ? 'text-amber-400' : 'text-emerald-400'}
          />
        </div>
      </Panel>

      {/* Link status chart */}
      <Panel title="Link Status" icon={<Activity className="h-3.5 w-3.5" />}>
        <div className="h-28 w-full p-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData(telemetry)} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id="sigGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(56,189,248,0.5)" />
                  <stop offset="100%" stopColor="rgba(56,189,248,0)" />
                </linearGradient>
              </defs>
              <YAxis hide domain={[0, 100]} />
              <RTooltip
                contentStyle={{
                  background: 'hsl(222 40% 7%)',
                  border: '1px solid hsl(222 30% 16%)',
                  borderRadius: 6,
                  fontSize: 10,
                }}
                labelStyle={{ display: 'none' }}
              />
              <Area
                type="monotone"
                dataKey="signal"
                stroke="#38bdf8"
                strokeWidth={1.5}
                fill="url(#sigGrad)"
                isAnimationActive={false}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* Communication status */}
      <Panel title="Communication Layer" icon={<Waves className="h-3.5 w-3.5" />}>
        <div className="grid grid-cols-2 gap-2 p-3">
          {COMMS_MODES.map((m) => (
            <CommsCard key={m} mode={m} status={scenario.comms[m]} />
          ))}
        </div>
      </Panel>

      {/* AI Decision */}
      <Panel title="AI Decision" icon={<Cpu className="h-3.5 w-3.5" />}>
        <div className="p-3">
          <div className="flex items-center gap-2">
            <StatusDot tone={aiProcessing ? 'amber' : 'green'} pulse={aiProcessing} />
            <span
              className={cn(
                'text-[10px] font-semibold uppercase tracking-wider',
                aiProcessing ? 'text-amber-400' : 'text-emerald-400'
              )}
            >
              {aiProcessing ? 'Processing' : 'Decision Locked'}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-foreground">{scenario.aiDecision}</p>
        </div>
      </Panel>

      {/* Event log */}
      <Panel
        title="Mission Events"
        icon={<ListTree className="h-3.5 w-3.5" />}
        bodyClassName="panel-scroll max-h-64 overflow-y-auto"
      >
        <div className="p-2">
          <AnimatePresence initial={false}>
            {logs.slice(-18).map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-start gap-2 rounded px-1.5 py-1 hover:bg-background/40"
              >
                <span className="font-mono-tel text-[10px] text-muted-foreground">{log.time}</span>
                <LogBadge level={log.level} />
                <span className="text-[11px] leading-tight text-foreground/90">{log.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="mt-1 flex items-center gap-1.5 px-1.5 text-[10px] text-muted-foreground">
            <span className="font-mono-tel">{formatT(missionTime)}</span>
            <span className="animate-pulse">▌</span>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function CommsCard({ mode, status }: { mode: CommsMode; status: CommsStatus }) {
  const tone = STATUS_TONE[status];
  const meta = COMMS_META[mode];
  return (
    <div
      className={cn(
        'rounded-md border px-2.5 py-2',
        status === 'ONLINE'
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : status === 'STANDBY'
            ? 'border-amber-500/30 bg-amber-500/5'
            : 'border-rose-500/30 bg-rose-500/5'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-foreground">{mode}</span>
        <StatusDot tone={tone} pulse={status === 'ONLINE'} />
      </div>
      <div className="mt-0.5 text-[9px] text-muted-foreground">{meta.label}</div>
      <div
        className={cn(
          'mt-1 text-[9px] font-semibold uppercase tracking-wider',
          status === 'ONLINE'
            ? 'text-emerald-400'
            : status === 'STANDBY'
              ? 'text-amber-400'
              : 'text-rose-400'
        )}
      >
        {status}
      </div>
    </div>
  );
}

function LogBadge({ level }: { level: LogEntry['level'] }) {
  const map = {
    INFO: 'text-sky-400',
    OK: 'text-emerald-400',
    WARN: 'text-amber-400',
    ALERT: 'text-rose-400',
  };
  const icon =
    level === 'ALERT' ? <Zap className="h-2.5 w-2.5" /> : level === 'WARN' ? <CloudRain className="h-2.5 w-2.5" /> : level === 'OK' ? <Signal className="h-2.5 w-2.5" /> : <Radio className="h-2.5 w-2.5" />;
  return <span className={cn('mt-0.5', map[level])}>{icon}</span>;
}

function chartData(t: Telemetry) {
  return Array.from({ length: 20 }, (_, i) => ({
    t: i,
    signal: Math.max(20, Math.min(100, t.signalStrength + (Math.random() * 2 - 1) * 6)),
  }));
}
