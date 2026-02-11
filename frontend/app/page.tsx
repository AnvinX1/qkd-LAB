"use client";

import { useState } from "react";
import ControlPanel from "@/components/ControlPanel";
import MetricsBar from "@/components/MetricsBar";
import BitVisualizer from "@/components/BitVisualizer";
import GraphSection from "@/components/GraphSection";
import ResearchTools from "@/components/ResearchTools";
import DocumentationPanel from "@/components/DocumentationPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HiOutlineBookOpen,
  HiOutlineBeaker,
  HiOutlineCube,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { TbAtom2Filled } from "react-icons/tb";
import { RiGithubFill } from "react-icons/ri";
import {
  DEFAULT_PARAMS,
  runSimulation,
  runSweep,
  type SimulationRequest,
  type SimulationResponse,
  type SweepPoint,
} from "@/lib/api";

export default function Home() {
  const [params, setParams] = useState<SimulationRequest>(DEFAULT_PARAMS);
  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [distanceSweep, setDistanceSweep] = useState<SweepPoint[]>([]);
  const [noiseSweep, setNoiseSweep] = useState<SweepPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [researchMode, setResearchMode] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);

  async function handleRun() {
    setLoading(true);
    setError(null);
    try {
      // Run single simulation + sweep in parallel
      const [simResult, sweepResult] = await Promise.all([
        runSimulation(params),
        runSweep(params),
      ]);
      setResult(simResult);
      setDistanceSweep(sweepResult.distance_sweep);
      setNoiseSweep(sweepResult.noise_sweep);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* ══════════════════════════════════════════════════════════════════════
          HEADER
          ══════════════════════════════════════════════════════════════════════ */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 dark:from-sky-400 dark:via-cyan-500 dark:to-blue-600 text-white shadow-lg shadow-orange-500/25 dark:shadow-sky-500/25">
              <TbAtom2Filled className="h-5 w-5" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-card" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-foreground">
                QKD-Lab
              </h1>
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-medium">
                v1.0
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5 flex items-center gap-1">
              <HiOutlineShieldCheck className="h-3 w-3" />
              BB84 Quantum Key Distribution
            </p>
          </div>
        </div>

        {/* Center Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-muted-foreground font-medium">System Ready</span>
          </div>
          <Separator orientation="vertical" className="h-3" />
          <span className="text-[10px] text-muted-foreground">
            <HiOutlineCube className="h-3 w-3 inline mr-1" />
            Photon Engine Active
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* GitHub */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                    <RiGithubFill className="h-4 w-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View on GitHub</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="h-6" />

          {/* Docs Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDocsOpen(true)}
                  className="h-8 gap-1.5 text-xs"
                >
                  <HiOutlineBookOpen className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Docs</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open Documentation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="h-6" />

          {/* Research Mode Toggle */}
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-muted/50 border">
            <HiOutlineBeaker className={`h-4 w-4 transition-colors ${researchMode ? "text-violet-500" : "text-muted-foreground"}`} />
            <Label htmlFor="research-toggle" className="text-xs text-muted-foreground cursor-pointer hidden sm:inline">
              Research
            </Label>
            <Switch
              id="research-toggle"
              checked={researchMode}
              onCheckedChange={setResearchMode}
              className="scale-90"
            />
            {researchMode && (
              <Badge className="bg-violet-500/10 text-violet-500 border-violet-500/20 text-[9px] px-1.5 py-0">
                <HiOutlineSparkles className="h-2.5 w-2.5 mr-0.5" />
                ON
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 shrink-0 overflow-y-auto border-r">
          <ControlPanel
            params={params}
            onChange={setParams}
            onRun={handleRun}
            loading={loading}
            researchMode={researchMode}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-background">
          {/* Error banner */}
          {error && (
            <div className="rounded-md border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
              <span className="font-semibold">Error: </span>
              {error}
            </div>
          )}

          {/* Graphs */}
          <GraphSection
            result={result}
            distanceSweep={distanceSweep}
            noiseSweep={noiseSweep}
          />

          {/* Bit stream visualizer */}
          <BitVisualizer result={result} />

          {/* Research mode tools */}
          {researchMode && (
            <ResearchTools
              params={params}
              result={result}
              distanceSweep={distanceSweep}
              noiseSweep={noiseSweep}
            />
          )}
        </main>
      </div>

      {/* ── Bottom Metrics Bar ───────────────────────────────────────────── */}
      <MetricsBar result={result} />

      {/* ── Documentation Panel ─────────────────────────────────────────── */}
      <DocumentationPanel open={docsOpen} onClose={() => setDocsOpen(false)} />
    </div>
  );
}
