import { cn } from '@/lib/utils';

export function Metric({
  label,
  value,
  unit,
  tone = 'text-foreground',
  className,
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  tone?: string;
  className?: string;
}) {
  return (
    <div className={cn('rounded-md border border-border/50 bg-background/40 px-3 py-2', className)}>
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className={cn('mt-0.5 font-mono-tel text-lg font-semibold leading-tight', tone)}>
        {value}
        {unit && <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}
