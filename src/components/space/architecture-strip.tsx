'use client';

import { Satellite, Plane, Radio, CircuitBoard, Network, ArrowDown, Cpu, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

const STAGES = [
  { icon: <Satellite className="h-3.5 w-3.5" />, label: 'LEO Satellite', sub: '550 km' },
  { icon: <ArrowDown className="h-3 w-3" />, label: 'Optical Laser', sub: 'Downlink', link: true },
  { icon: <Plane className="h-3.5 w-3.5" />, label: 'HAPS', sub: '18–20 km' },
  { icon: <Cpu className="h-3.5 w-3.5" />, label: 'AI Controller', sub: 'Adaptive' },
  { icon: <Layers className="h-3.5 w-3.5" />, label: 'Adaptive Layer', sub: 'RF · MW · FSO' },
  { icon: <Radio className="h-3.5 w-3.5" />, label: 'Relay Drone', sub: '2–5 km' },
  { icon: <ArrowDown className="h-3 w-3" />, label: 'Optical', sub: 'High-speed', link: true },
  { icon: <CircuitBoard className="h-3.5 w-3.5" />, label: 'Ground Station', sub: 'Earth' },
  { icon: <Network className="h-3.5 w-3.5" />, label: 'Customer Network', sub: 'Fiber' },
];

export function ArchitectureStrip() {
  return (
    <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border/70 bg-card/40 px-3 py-2">
      {STAGES.map((s, i) => (
        <div key={i} className="flex items-center gap-1">
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-1.5 rounded-md border px-2 py-1 ${
              s.link
                ? 'border-transparent text-muted-foreground'
                : 'border-border/50 bg-background/40'
            }`}
          >
            <span className={s.link ? 'text-sky-400/60' : 'text-sky-400'}>{s.icon}</span>
            <div className="leading-tight">
              <div className="text-[10px] font-semibold text-foreground">{s.label}</div>
              <div className="font-mono-tel text-[8px] text-muted-foreground">{s.sub}</div>
            </div>
          </motion.div>
          {i < STAGES.length - 1 && !s.link && (
            <span className="text-sky-400/30">›</span>
          )}
        </div>
      ))}
    </div>
  );
}
