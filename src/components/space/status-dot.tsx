import { cn } from '@/lib/utils';

type Tone = 'green' | 'blue' | 'amber' | 'red' | 'slate';

const toneMap: Record<Tone, { dot: string; text: string; glow: string }> = {
  green: { dot: 'bg-emerald-400', text: 'text-emerald-400', glow: 'shadow-[0_0_8px_rgba(52,211,153,0.7)]' },
  blue: { dot: 'bg-sky-400', text: 'text-sky-400', glow: 'shadow-[0_0_8px_rgba(56,189,248,0.7)]' },
  amber: { dot: 'bg-amber-400', text: 'text-amber-400', glow: 'shadow-[0_0_8px_rgba(251,191,36,0.7)]' },
  red: { dot: 'bg-rose-500', text: 'text-rose-400', glow: 'shadow-[0_0_8px_rgba(244,63,94,0.7)]' },
  slate: { dot: 'bg-slate-500', text: 'text-slate-400', glow: '' },
};

export function StatusDot({
  tone,
  pulse = true,
  className,
}: {
  tone: Tone;
  pulse?: boolean;
  className?: string;
}) {
  const t = toneMap[tone];
  return (
    <span className={cn('relative inline-flex h-2 w-2', className)}>
      {pulse && (
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-60',
            t.dot,
            'animate-ping'
          )}
        />
      )}
      <span className={cn('relative inline-flex h-2 w-2 rounded-full', t.dot, t.glow)} />
    </span>
  );
}

export const toneText = (tone: Tone) => toneMap[tone].text;
