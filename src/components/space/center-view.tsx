'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Satellite,
  Plane,
  Radio,
  CircuitBoard,
  Network,
  CloudRain,
  Cloud,
  Sun,
  Zap,
  Wind,
} from 'lucide-react';
import { NODES, type Scenario, type NodeId } from '@/lib/scenarios';
import { cn } from '@/lib/utils';

// SVG coordinate space: 0..1000 x, 0..680 y
// Ground baseline at y=540; nodes sit ON TOP of it.
const GROUND_Y = 540;

const POS: Record<NodeId, { x: number; y: number }> = {
  satellite: { x: 760, y: 60 },
  haps: { x: 260, y: 170 },
  drone: { x: 540, y: 410 },
  ground: { x: 360, y: GROUND_Y - 18 },
  customer: { x: 720, y: GROUND_Y - 18 },
};

const NODE_ICON: Record<NodeId, React.ReactNode> = {
  satellite: <Satellite className="h-4 w-4" />,
  haps: <Plane className="h-4 w-4" />,
  drone: <Radio className="h-4 w-4" />,
  ground: <CircuitBoard className="h-4 w-4" />,
  customer: <Network className="h-4 w-4" />,
};

// Altitude bands (y ranges)
const BANDS = {
  space: { top: 0, bottom: 100, label: 'UPPER ATMOSPHERE', alt: '> 100 km' },
  stratos: { top: 100, bottom: 240, label: 'STRATOSPHERE', alt: '18–20 km' },
  cloud: { top: 240, bottom: 360, label: 'CLOUD LAYER', alt: '8–12 km' },
  tropo: { top: 360, bottom: 520, label: 'TROPOSPHERE', alt: '2–5 km' },
  ground: { top: 520, bottom: 680, label: 'SURFACE', alt: '0 km' },
};

export function CenterView({ scenario }: { scenario: Scenario }) {
  const path = scenario.activePath;
  const links = useMemo(() => {
    const l: { from: NodeId; to: NodeId; key: string }[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      l.push({ from: path[i], to: path[i + 1], key: `${path[i]}-${path[i + 1]}` });
    }
    return l;
  }, [path]);

  const weather = scenario.weatherSeverity;
  const isClear = scenario.id === 'clear';
  const isCloudy = scenario.id === 'cloud';
  const isStorm = scenario.id === 'storm';
  const cloudOpacity = isClear ? 0 : Math.min(0.85, weather / 100 + 0.25);
  const rainIntensity = isCloudy ? 0 : scenario.id === 'rain' ? 0.7 : isStorm ? 1 : 0;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-border/70 bg-card/40">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1828] via-[#08111f] to-[#050d18]" />

      {/* Header */}
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Atmospheric Cross-Section
          </span>
          <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-sky-400">
            {scenario.name.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <Legend color="bg-cyan-400" label="Optical Laser" />
          <Legend color="bg-amber-400" label="RF / Microwave" />
          <Legend color="bg-emerald-400" label="Active Node" />
        </div>
      </div>

      <svg viewBox="0 0 1000 680" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0c1e36" />
            <stop offset="40%" stopColor="#0a1830" />
            <stop offset="75%" stopColor="#0a1320" />
            <stop offset="100%" stopColor="#070d18" />
          </linearGradient>
          <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d1a2e" />
            <stop offset="100%" stopColor="#050b16" />
          </linearGradient>
          <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(180,200,220,0.22)" />
            <stop offset="100%" stopColor="rgba(120,150,190,0.08)" />
          </linearGradient>
          <linearGradient id="laserGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="rfGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFA500" />
            <stop offset="100%" stopColor="#FF8C00" />
          </linearGradient>
          <linearGradient id="fiberGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sky background */}
        <rect x="0" y="0" width="1000" height={GROUND_Y} fill="url(#skyGrad)" />
        {/* Ground baseline */}
        <rect x="0" y={GROUND_Y} width="1000" height={680 - GROUND_Y} fill="url(#groundGrad)" />
        {/* Ground tech line */}
        <line x1="0" y1={GROUND_Y} x2="1000" y2={GROUND_Y} stroke="rgba(56,189,248,0.4)" strokeWidth="1.5" />
        <line x1="0" y1={GROUND_Y + 4} x2="1000" y2={GROUND_Y + 4} stroke="rgba(56,189,248,0.12)" strokeWidth="1" />

        {/* Altitude band guides */}
        {Object.values(BANDS).map((b, i) => (
          <g key={i}>
            <line
              x1="0"
              y1={b.top}
              x2="1000"
              y2={b.top}
              stroke="rgba(56,189,248,0.08)"
              strokeWidth="1"
              strokeDasharray="3 6"
            />
            <text x="12" y={b.top + 16} fill="rgba(148,163,184,0.5)" fontSize="9" fontFamily="monospace" letterSpacing="1.5">
              {b.label}
            </text>
            <text x="12" y={b.top + 28} fill="rgba(148,163,184,0.35)" fontSize="8" fontFamily="monospace">
              {b.alt}
            </text>
          </g>
        ))}

        {/* Stars in upper atmosphere (clear sky only) */}
        {isClear &&
          STARS.map((s, i) => (
            <motion.circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill="rgba(255,255,255,0.6)"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2 + (i % 4), repeat: Infinity, delay: i * 0.2 }}
            />
          ))}

        {/* Cloud layer band */}
        {!isClear && (
          <g>
            <rect
              x="0"
              y={BANDS.cloud.top}
              width="1000"
              height={BANDS.cloud.bottom - BANDS.cloud.top}
              fill="url(#cloudGrad)"
              opacity={cloudOpacity}
            />
            {/* Stylized vector cloud silhouettes */}
            {CLOUDS.map((c, i) => (
              <motion.g
                key={`c-${i}`}
                animate={{ x: [-18, 18, -18] }}
                transition={{ duration: 10 + i * 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <CloudShape
                  cx={c.x}
                  cy={c.y}
                  scale={c.scale}
                  fill={isStorm ? 'rgba(55,68,92,0.78)' : 'rgba(160,180,205,0.5)'}
                  stroke={isStorm ? 'rgba(80,92,118,0.5)' : 'rgba(190,210,235,0.4)'}
                />
              </motion.g>
            ))}
            {/* Cloud layer label badge */}
            <g>
              <rect x="848" y={BANDS.cloud.top + 8} width="132" height="20" rx="3" fill="rgba(10,20,35,0.75)" stroke="rgba(56,189,248,0.3)" strokeWidth="0.8" />
              <text x="858" y={BANDS.cloud.top + 21} fill="rgba(148,163,184,0.9)" fontSize="9" fontFamily="monospace" letterSpacing="1">
                {isStorm ? '⚠ STORM CELL' : '☁ CLOUD COVER'}
              </text>
            </g>
          </g>
        )}

        {/* Rain particles */}
        {rainIntensity > 0 && (
          <g opacity={rainIntensity}>
            {RAIN.map((r, i) => (
              <motion.line
                key={`r-${i}`}
                x1={r.x}
                y1={r.y}
                x2={r.x - 3}
                y2={r.y + 18}
                stroke="rgba(120,180,240,0.6)"
                strokeWidth="1.1"
                animate={{ y1: [BANDS.cloud.top - 10, GROUND_Y - 6], y2: [BANDS.cloud.top + 8, GROUND_Y + 12] }}
                transition={{ duration: 0.85 + (i % 6) * 0.1, repeat: Infinity, ease: 'linear' }}
              />
            ))}
          </g>
        )}

        {/* Wind streaks (storm) */}
        {isStorm && (
          <g opacity="0.5">
            {WIND.map((w, i) => (
              <motion.line
                key={`w-${i}`}
                x1={w.x}
                y1={w.y}
                x2={w.x + 40}
                y2={w.y}
                stroke="rgba(148,163,184,0.4)"
                strokeWidth="1"
                strokeDasharray="4 8"
                animate={{ x1: [w.x - 60, w.x + 60], x2: [w.x - 20, w.x + 100] }}
                transition={{ duration: 2.5 + (i % 3) * 0.5, repeat: Infinity, ease: 'linear' }}
              />
            ))}
          </g>
        )}

        {/* Lightning (storm) */}
        {isStorm && (
          <motion.path
            d="M 480 250 L 460 290 L 490 300 L 450 340"
            stroke="rgba(250,250,200,0.95)"
            strokeWidth="2.5"
            fill="none"
            filter="url(#glow)"
            animate={{ opacity: [0, 0, 1, 0, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, times: [0, 0.65, 0.7, 0.78, 1] }}
          />
        )}

        {/* Ground terrain silhouette (below baseline) */}
        <path
          d={`M 0 ${GROUND_Y + 20} L 80 ${GROUND_Y + 8} L 160 ${GROUND_Y + 18} L 240 ${GROUND_Y + 4} L 320 ${GROUND_Y + 16} L 400 ${GROUND_Y + 6} L 480 ${GROUND_Y + 18} L 560 ${GROUND_Y + 4} L 640 ${GROUND_Y + 16} L 720 ${GROUND_Y + 8} L 800 ${GROUND_Y + 18} L 880 ${GROUND_Y + 4} L 1000 ${GROUND_Y + 16} L 1000 680 L 0 680 Z`}
          fill="rgba(13,26,46,0.9)"
          stroke="rgba(56,189,248,0.2)"
          strokeWidth="0.8"
        />
        {/* Ground tech grid lines */}
        {[GROUND_Y + 40, GROUND_Y + 80, GROUND_Y + 120].map((y) => (
          <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="rgba(56,189,248,0.08)" strokeWidth="0.8" strokeDasharray="2 10" />
        ))}

        {/* Links */}
        {links.map((l) => {
          const a = POS[l.from];
          const b = POS[l.to];
          // Link type: laser (satellite→haps or satellite→ground in clear), rf (mid atmosphere), fiber (ground→customer)
          const isGroundFiber = l.from === 'ground' && l.to === 'customer';
          const isHapsToDrone = l.from === 'haps' && l.to === 'drone';
          const isOptical =
            (l.from === 'satellite' && l.to === 'ground') ||
            (l.from === 'satellite' && l.to === 'haps') ||
            (scenario.id === 'clear' && l.from === 'satellite') ||
            (scenario.id === 'cloud' && !isGroundFiber && !isHapsToDrone);
          const isRF = !isOptical && !isGroundFiber;

          if (isGroundFiber) {
            // Solid red fiber line along the surface
            return (
              <g key={l.key}>
                <line
                  x1={a.x}
                  y1={GROUND_Y - 2}
                  x2={b.x}
                  y2={GROUND_Y - 2}
                  stroke="url(#fiberGrad)"
                  strokeWidth="2.5"
                  filter="url(#glow)"
                />
                {/* Packets */}
                {[0, 0.5].map((delay) => (
                  <motion.circle
                    key={delay}
                    r="3"
                    fill="#ef4444"
                    filter="url(#glow)"
                    initial={{ cx: a.x, cy: GROUND_Y - 2, opacity: 0 }}
                    animate={{ cx: [a.x, b.x], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, delay, ease: 'linear' }}
                  />
                ))}
              </g>
            );
          }

          if (isOptical) {
            // Bright cyan/blue beam line (optical laser)
            const midX = (a.x + b.x) / 2 + (l.from === 'satellite' ? -30 : 20);
            const midY = (a.y + b.y) / 2;
            const pathD = `M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`;
            return (
              <g key={l.key}>
                <path
                  d={pathD}
                  fill="none"
                  stroke="url(#laserGrad)"
                  strokeWidth="2.5"
                  filter="url(#glow)"
                  style={{ animation: 'data-flow 1.2s linear infinite' }}
                  strokeDasharray="8 4"
                />
                {/* Packets */}
                {[0, 0.33, 0.66].map((delay) => (
                  <motion.circle
                    key={delay}
                    r="3.5"
                    fill="#22d3ee"
                    filter="url(#glow)"
                    initial={{ offsetDistance: '0%', opacity: 0 }}
                    animate={{ offsetDistance: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay, ease: 'linear' }}
                    style={{ offsetPath: `path('${pathD}')` } as React.CSSProperties}
                  />
                ))}
              </g>
            );
          }

          // RF / Microwave: wavy sine-wave beam
          const wavePath = buildSinePath(a.x, a.y, b.x, b.y, 10, 7);
          return (
            <g key={l.key}>
              <path
                d={wavePath}
                fill="none"
                stroke="url(#rfGrad)"
                strokeWidth="2"
                filter="url(#glow)"
                style={{ animation: 'data-flow 1.4s linear infinite' }}
                strokeDasharray="6 4"
              />
              {/* Packets */}
              {[0, 0.33, 0.66].map((delay) => (
                <motion.circle
                  key={delay}
                  r="3.5"
                  fill="#FF8C00"
                  filter="url(#glow)"
                  initial={{ offsetDistance: '0%', opacity: 0 }}
                  animate={{ offsetDistance: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay, ease: 'linear' }}
                  style={{ offsetPath: `path('${wavePath}')` } as React.CSSProperties}
                />
              ))}
            </g>
          );
        })}

        {/* RF wave arcs from active relay nodes */}
        {scenario.id !== 'clear' &&
          path.map((id) => {
            if (id === 'satellite' || id === 'ground' || id === 'customer') return null;
            const p = POS[id];
            return (
              <motion.circle
                key={`rf-${id}`}
                cx={p.x}
                cy={p.y}
                r="18"
                fill="none"
                stroke="rgba(255,140,0,0.5)"
                strokeWidth="1.2"
                animate={{ r: [18, 48], opacity: [0.6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
              />
            );
          })}
      </svg>

      {/* Nodes (HTML overlay) */}
      {(['satellite', 'haps', 'drone', 'ground', 'customer'] as NodeId[]).map((id) => {
        const p = POS[id];
        const isActive = path.includes(id);
        const xPct = (p.x / 1000) * 100;
        const yPct = (p.y / 680) * 100;
        return (
          <motion.div
            key={id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${xPct}%`, top: `${yPct}%` }}
            animate={isActive ? { scale: [1, 1.06, 1] } : { scale: 1 }}
            transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
          >
            <div
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border px-2.5 py-1.5 backdrop-blur-sm',
                isActive
                  ? 'border-sky-500/50 bg-sky-500/10 shadow-[0_0_18px_rgba(56,189,248,0.35)]'
                  : 'border-border/60 bg-background/70 opacity-60'
              )}
            >
              <div className={isActive ? 'text-sky-400' : 'text-muted-foreground'}>
                {NODE_ICON[id]}
              </div>
              <div className="text-[9px] font-semibold uppercase tracking-wider text-foreground">
                {NODES[id].label}
              </div>
              <div className="font-mono-tel text-[8px] text-muted-foreground">{NODES[id].alt}</div>
            </div>
            {isActive && (
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            )}
          </motion.div>
        );
      })}

      {/* Weather badge */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 rounded-md border border-border/60 bg-background/70 px-2.5 py-1.5 backdrop-blur-sm">
        {isClear ? (
          <Sun className="h-3.5 w-3.5 text-amber-400" />
        ) : isStorm ? (
          <CloudRain className="h-3.5 w-3.5 text-rose-400" />
        ) : (
          <Cloud className="h-3.5 w-3.5 text-sky-400" />
        )}
        <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground">
          {scenario.name}
        </span>
        <span className="font-mono-tel text-[10px] text-muted-foreground">
          Severity {Math.round(scenario.weatherSeverity)}%
        </span>
      </div>

      {/* Wind indicator (storm) */}
      {isStorm && (
        <div className="absolute bottom-3 left-44 z-20 flex items-center gap-1.5 rounded-md border border-border/60 bg-background/70 px-2 py-1.5 backdrop-blur-sm">
          <Wind className="h-3 w-3 text-sky-400" />
          <span className="font-mono-tel text-[10px] text-muted-foreground">WIND 42 kt</span>
        </div>
      )}

      {/* AI processing badge */}
      {scenario.id !== 'clear' && (
        <motion.div
          className="absolute right-3 top-14 z-20 flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-1"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          <Zap className="h-3 w-3 text-amber-400" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
            AI Adaptive Routing Active
          </span>
        </motion.div>
      )}
    </div>
  );
}

// Build a wavy sine-wave path between two points
function buildSinePath(x1: number, y1: number, x2: number, y2: number, segments: number, amplitude: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / len; // normal
  const ny = dx / len;
  let d = `M ${x1} ${y1}`;
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const bx = x1 + dx * t;
    const by = y1 + dy * t;
    const wave = Math.sin(t * Math.PI * 4) * amplitude;
    const px = bx + nx * wave;
    const py = by + ny * wave;
    d += ` L ${px} ${py}`;
  }
  return d;
}

// Stylized vector cloud silhouette
function CloudShape({
  cx,
  cy,
  scale,
  fill,
  stroke,
}: {
  cx: number;
  cy: number;
  scale: number;
  fill: string;
  stroke: string;
}) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
      <path
        d="M -70 8 q -28 0 -32 -22 q -2 -22 22 -26 q 4 -28 34 -24 q 16 -20 38 -8 q 22 -6 28 16 q 24 2 22 24 q -2 22 -26 22 z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1"
        filter="url(#softGlow)"
      />
      <path
        d="M -50 -6 q -10 -2 -12 -14 M -20 -22 q 8 -8 18 -4 M 20 -18 q 10 -2 14 8"
        fill="none"
        stroke={stroke}
        strokeWidth="0.8"
        opacity="0.5"
      />
    </g>
  );
}

const STARS = Array.from({ length: 30 }, (_, i) => ({
  x: 50 + (i * 137) % 950,
  y: 10 + (i * 53) % 90,
  r: (i % 3) * 0.4 + 0.6,
}));

const CLOUDS = [
  { x: 90, y: 300, scale: 0.95 },
  { x: 250, y: 280, scale: 1.15 },
  { x: 410, y: 300, scale: 1.25 },
  { x: 570, y: 285, scale: 1.1 },
  { x: 720, y: 305, scale: 1.2 },
  { x: 880, y: 290, scale: 1.0 },
  { x: 170, y: 335, scale: 0.85 },
  { x: 490, y: 340, scale: 0.9 },
  { x: 800, y: 335, scale: 0.95 },
];

const RAIN = Array.from({ length: 50 }, (_, i) => ({
  x: 120 + (i % 12) * 72 + (i % 5) * 10,
  y: BANDS.cloud.top + 10 + Math.floor(i / 12) * 20,
}));

const WIND = Array.from({ length: 6 }, (_, i) => ({
  x: 100 + i * 160,
  y: 200 + (i % 2) * 40,
}));

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn('h-1.5 w-3 rounded-full', color)} />
      {label}
    </span>
  );
}
