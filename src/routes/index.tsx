import { createFileRoute } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import { useOloLink } from '@/hooks/use-ololink';
import { TopBar } from '@/components/ololink/top-bar';
import { Rail } from '@/components/ololink/rail';
import { ContextPanel } from '@/components/ololink/context-panel';
import { ObjectCard } from '@/components/ololink/object-card';
import { Dock } from '@/components/ololink/dock';

const GlobeScene = lazy(() =>
  import('@/components/ololink/globe-scene').then((m) => ({ default: m.GlobeScene }))
);

export const Route = createFileRoute('/')({
  ssr: false,
  head: () => ({
    meta: [
      { title: 'OloLink Explorer — Spatial Network Operations' },
      {
        name: 'description',
        content:
          'OloLink Explorer: a spatial operating environment for intelligent communication orchestration across LEO satellites, HAPS, relay drones and ground stations.',
      },
      { property: 'og:title', content: 'OloLink Explorer — Spatial Network Operations' },
      {
        property: 'og:description',
        content:
          'Operate the global communication network from a live 3D Earth: adaptive routing, weather intelligence and AI decisions in one spatial environment.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: Explorer,
});

function Explorer() {
  const state = useOloLink();

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#05070e] text-foreground">
      {/* LEVEL 1 — spatial environment */}
      <div className="absolute inset-0">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center">
              <span className="animate-pulse font-mono text-[10px] uppercase tracking-[0.3em] text-sky-400/70">
                Initialising spatial environment
              </span>
            </div>
          }
        >
          <GlobeScene state={state} />
        </Suspense>
      </div>

      {/* command status layer */}
      <TopBar state={state} />

      {/* LEVEL 2 — navigation rail */}
      <Rail
        active={state.panel}
        onToggle={state.togglePanel}
        alertCount={state.profile.alerts.length}
      />

      {/* LEVEL 3 — contextual side panel */}
      <ContextPanel state={state} />

      {/* LEVEL 4 — object-specific information */}
      <ObjectCard state={state} />

      {/* compact command dock */}
      <Dock state={state} />

      {/* ambient hint */}
      {!state.selection && !state.panel && (
        <div className="pointer-events-none absolute bottom-16 left-1/2 z-20 -translate-x-1/2 text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/50">
            Drag to orbit · click an asset or link to inspect
          </p>
        </div>
      )}
    </div>
  );
}
