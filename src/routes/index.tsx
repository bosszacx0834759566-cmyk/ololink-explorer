import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

import { useSimulation } from "@/hooks/use-simulation";
import { TopNav } from "@/components/space/top-nav";
import { LeftPanel } from "@/components/space/left-panel";
import { CenterView } from "@/components/space/center-view";
import { RightPanel } from "@/components/space/right-panel";
import { ScenarioBar } from "@/components/space/scenario-bar";
import { ArchitectureStrip } from "@/components/space/architecture-strip";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SSpace — Mission Control" },
      {
        name: "description",
        content:
          "SSpace operational concept demonstration: adaptive space-to-Earth communication infrastructure for adverse weather conditions.",
      },
      { property: "og:title", content: "SSpace — Mission Control" },
      {
        property: "og:description",
        content:
          "Adaptive space-to-Earth communication infrastructure concept: watch the AI reroute satellite links through HAPS and relay drones when weather strikes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const sim = useSimulation();

  return (
    <div className="flex h-screen flex-col bg-background">
      <TopNav
        scenario={sim.scenario}
        scenarioId={sim.scenarioId}
        missionTime={sim.missionTime}
        aiProcessing={sim.aiProcessing}
        telemetry={sim.telemetry}
      />

      {/* Control bar */}
      <div className="flex flex-col gap-2 border-b border-border/70 bg-background/60 px-4 py-2.5">
        <ScenarioBar active={sim.scenarioId} onSelect={sim.setScenario} disabled={sim.aiProcessing} />
        <ArchitectureStrip />
      </div>

      {/* Main 3-column layout */}
      <main className="grid flex-1 grid-cols-1 gap-3 overflow-hidden p-3 lg:grid-cols-[260px_1fr_320px]">
        {/* Left */}
        <div className="hidden overflow-hidden lg:block">
          <LeftPanel scenario={sim.scenario} />
        </div>

        {/* Center */}
        <div className="min-h-[420px]">
          <CenterView scenario={sim.scenario} />
        </div>

        {/* Right */}
        <div className="hidden overflow-hidden lg:block">
          <RightPanel
            scenario={sim.scenario}
            telemetry={sim.telemetry}
            logs={sim.logs}
            aiProcessing={sim.aiProcessing}
            missionTime={sim.missionTime}
          />
        </div>
      </main>

      {/* Mobile stacked panels */}
      <div className="flex flex-col gap-3 p-3 lg:hidden">
        <LeftPanel scenario={sim.scenario} />
        <RightPanel
          scenario={sim.scenario}
          telemetry={sim.telemetry}
          logs={sim.logs}
          aiProcessing={sim.aiProcessing}
          missionTime={sim.missionTime}
        />
      </div>

      {/* Disclaimer footer */}
      <footer className="border-t border-border/70 bg-background/80 px-4 py-2">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <AlertTriangle className="h-3 w-3 text-warning/70" />
          <span>
            This prototype is a conceptual operational demonstration for system architecture and
            workflow. It is not a validated engineering implementation.
          </span>
          <span className="ml-auto hidden font-mono-tel text-muted-foreground/60 sm:block">
            OloLink · Mission Control Concept v1.0
          </span>
        </div>
      </footer>
    </div>
  );
}
