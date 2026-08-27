import { cn } from '@/lib/utils';

export function Panel({
  title,
  icon,
  actions,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        'flex flex-col rounded-lg border border-border/70 bg-card/60 backdrop-blur-sm',
        className
      )}
    >
      {title && (
        <header className="flex items-center justify-between border-b border-border/60 px-3 py-2">
          <div className="flex items-center gap-2">
            {icon && <span className="text-sky-400/80">{icon}</span>}
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {title}
            </h2>
          </div>
          {actions}
        </header>
      )}
      <div className={cn('flex-1', bodyClassName)}>{children}</div>
    </section>
  );
}
