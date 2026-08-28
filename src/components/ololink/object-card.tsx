'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X, Crosshair } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ASSET_BY_ID, KIND_META, TECH_META, type LinkState } from '@/lib/ololink';
import type { OloLinkState } from '@/hooks/use-ololink';

function Line({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-white/[0.04] py-1.5 last:border-0">
      <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">{label}</span>
      <span className={cn('font-mono text-[11px] tabular-nums text-foreground', tone)}>{value}</span>
    </div>
  );
}

function AssetBody({ state, id }: { state: OloLinkState; id: string }) {
  const asset = ASSET_BY_ID[id];
  if (!asset) return null;
  const onRoute = state.profile.route.includes(id);
  const related = state.links.filter((l) => l.segment.from === id || l.segment.to === id);
  const available = Array.from(new Set(related.map((l) => l.segment.tech)));
  const active = related.find((l) => l.status === 'ACTIVE');

  return (
    <>
      <Line label="Class" value={KIND_META[asset.kind].label} />
      <Line
        label="Status"
        value={onRoute ? 'ACTIVE' : asset.health}
        tone={onRoute ? 'text-emerald-300' : asset.health === 'NOMINAL' ? 'text-emerald-300' : 'text-amber-300'}
      />
      <Line label="Altitude" value={asset.altKm > 0 ? `${asset.altKm} km` : 'Surface'} />
      <Line label="Current role" value={onRoute ? 'Relay' : asset.role} />
      <Line label="Region" value={asset.region} />
      <Line label="Bandwidth" value={`${(active?.bandwidth ?? state.telemetry.bandwidth).toFixed(2)} Gbps`} />
      <Line label="Latency" value={`${active?.latency ?? state.telemetry.latency} ms`} />

      <div className="mt-3">
        <div className="text-[9px] uppercase tracking-[0.24em] text-muted-foreground/60">AI routing</div>
        <div className={cn('mt-1 text-[11px]', onRoute ? 'text-sky-300' : 'text-muted-foreground')}>
          {onRoute ? 'Adaptive route active through this node' : 'Held in reserve pool'}
        </div>
      </div>

      <div className="mt-3">
        <div className="text-[9px] uppercase tracking-[0.24em] text-muted-foreground/60">Available links</div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {available.length === 0 && <span className="text-[11px] text-muted-foreground">None</span>}
          {available.map((t) => {
            const off = state.profile.blockedTech.includes(t);
            return (
              <span
                key={t}
                className={cn(
                  'rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em]',
                  off ? 'border-rose-500/25 text-rose-400/80 line-through' : 'border-white/[0.09] text-foreground/85'
                )}
              >
                {TECH_META[t].label}
              </span>
            );
          })}
        </div>
      </div>
    </>
  );
}

function LinkBody({ link, state }: { link: LinkState; state: OloLinkState }) {
  const meta = TECH_META[link.segment.tech];
  return (
    <>
      <Line label="Technology" value={meta.label} />
      <Line
        label="Route status"
        value={link.status}
        tone={link.status === 'ACTIVE' ? 'text-emerald-300' : link.status === 'BLOCKED' ? 'text-rose-300' : 'text-sky-300'}
      />
      <Line label="Bandwidth" value={`${link.bandwidth.toFixed(2)} Gbps`} />
      <Line label="Latency" value={`${link.latency} ms`} />
      <Line label="Signal quality" value={`${link.signal} %`} />
      <Line label="Packet loss" value={`${link.loss.toFixed(2)} %`} />
      <div className="mt-3">
        <div className="text-[9px] uppercase tracking-[0.24em] text-muted-foreground/60">Weather impact</div>
        <p className="mt-1 text-[11px] leading-snug text-foreground/85">{link.weatherImpact}</p>
      </div>
      <p className="mt-3 text-[10px] leading-snug text-muted-foreground">{meta.desc}</p>
      <div className="mt-3 flex gap-1.5">
        {[link.segment.from, link.segment.to].map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => state.select({ type: 'asset', id })}
            className="flex-1 rounded border border-white/[0.09] px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
          >
            {ASSET_BY_ID[id]?.name}
          </button>
        ))}
      </div>
    </>
  );
}

export function ObjectCard({ state }: { state: OloLinkState }) {
  const sel = state.selection;
  const link = sel?.type === 'link' ? state.links.find((l) => l.segment.id === sel.id) : undefined;
  const title =
    sel?.type === 'asset'
      ? ASSET_BY_ID[sel.id]?.name
      : link
        ? `${ASSET_BY_ID[link.segment.from]?.name} → ${ASSET_BY_ID[link.segment.to]?.name}`
        : undefined;

  return (
    <AnimatePresence>
      {sel && title && (
        <motion.div
          key={`${sel.type}-${sel.id}`}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          className="pointer-events-auto absolute right-4 top-20 z-30 w-[286px] rounded-xl border border-white/[0.08] bg-[#070b14]/88 p-4 shadow-[0_16px_50px_-16px_rgba(0,0,0,0.9)] backdrop-blur-xl"
        >
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.24em] text-sky-400">
                <Crosshair className="h-3 w-3" />
                {sel.type === 'asset' ? 'Asset' : 'Communication link'}
              </div>
              <h3 className="mt-1 text-[13px] font-semibold tracking-wide text-foreground">{title}</h3>
            </div>
            <button
              type="button"
              onClick={() => state.select(null)}
              aria-label="Close details"
              className="rounded p-1 text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          {sel.type === 'asset' ? (
            <AssetBody state={state} id={sel.id} />
          ) : link ? (
            <LinkBody link={link} state={state} />
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
