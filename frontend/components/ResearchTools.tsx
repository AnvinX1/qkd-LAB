"use client";

import { useState, useCallback, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import type {
  SimulationRequest,
  SimulationResponse,
  SweepPoint,
  MonteCarloResponse,
  MonteCarloStats,
  SweepableParam,
} from "@/lib/api";
import { runMonteCarlo, runGenericSweep, SWEEPABLE_PARAMS } from "@/lib/api";
import { exportAllCSV, exportMonteCarloCSV, exportSweepCSV } from "@/lib/csv";

// ── Types ───────────────────────────────────────────────────────────────────

interface ResearchToolsProps {
  params: SimulationRequest;
  result: SimulationResponse | null;
  distanceSweep: SweepPoint[];
  noiseSweep: SweepPoint[];
}

// ── Spinner icon ────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

// ── Stat display helper ─────────────────────────────────────────────────────

function StatBlock({
  label,
  stats,
  pct,
  isInt,
}: {
  label: string;
  stats: MonteCarloStats;
  pct?: boolean;
  isInt?: boolean;
}) {
  const fmt = (v: number) => {
    if (pct) return `${(v * 100).toFixed(2)}%`;
    if (isInt) return Math.round(v).toLocaleString();
    return v.toFixed(5);
  };

  return (
    <div className="space-y-0.5">
      <p className="font-semibold text-foreground text-xs">{label}</p>
      <p className="text-muted-foreground text-xs font-mono">
        {fmt(stats.mean)}{" "}
        <span className="text-[10px] text-muted-foreground/70">
          &plusmn; {fmt(stats.std)}
        </span>
      </p>
      <p className="text-muted-foreground/60 text-[10px]">
        [{fmt(stats.min_val)} &hellip; {fmt(stats.max_val)}]
      </p>
    </div>
  );
}

// ── Monte Carlo Section ─────────────────────────────────────────────────────

function MonteCarloSection({ params }: { params: SimulationRequest }) {
  const [trials, setTrials] = useState(20);
  const [mcResult, setMcResult] = useState<MonteCarloResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await runMonteCarlo(params, trials);
      setMcResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [params, trials]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-violet-600 text-[10px] font-bold text-white">
            MC
          </span>
          Monte Carlo Averaging
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Trials</Label>
              <span className="text-xs tabular-nums text-muted-foreground font-mono">
                {trials}
              </span>
            </div>
            <Slider
              min={2}
              max={100}
              step={1}
              value={[trials]}
              onValueChange={([v]) => setTrials(v)}
            />
          </div>
          <Button
            onClick={handleRun}
            disabled={loading}
            size="sm"
            className="shrink-0"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <Spinner /> Running&hellip;
              </span>
            ) : (
              "Run MC"
            )}
          </Button>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        {mcResult && (
          <div className="space-y-3">
            <div className="rounded-md border bg-muted/30 p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                Results &mdash; {mcResult.trials} trials
              </p>
              <div className="grid grid-cols-2 gap-3">
                <StatBlock label="QBER" stats={mcResult.qber} pct />
                <StatBlock label="Secret Key Rate" stats={mcResult.skr} />
                <StatBlock
                  label="Sifted Key Length"
                  stats={mcResult.sifted_key_length}
                  isInt
                />
                <StatBlock
                  label="Final Key Length"
                  stats={mcResult.final_key_length}
                  isInt
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => exportMonteCarloCSV(mcResult)}
            >
              Export MC Results as CSV
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Auto Sweep Section ──────────────────────────────────────────────────────

function AutoSweepSection({ params }: { params: SimulationRequest }) {
  const [sweepParam, setSweepParam] = useState<SweepableParam>("distance");
  const [sweepPoints, setSweepPoints] = useState<SweepPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paramInfo = SWEEPABLE_PARAMS.find((p) => p.value === sweepParam)!;

  const handleRun = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const info = SWEEPABLE_PARAMS.find((p) => p.value === sweepParam)!;
      const res = await runGenericSweep(
        params,
        sweepParam,
        info.defaultMin,
        info.defaultMax,
        30
      );
      setSweepPoints(res.points);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [params, sweepParam]);

  const chartData = sweepPoints.map((p) => ({
    x: +p.x.toFixed(4),
    qber: +(p.qber * 100).toFixed(3),
    skr: +p.skr.toFixed(6),
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-amber-600 text-[10px] font-bold text-white">
            &harr;
          </span>
          Auto Parameter Sweep
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Label className="text-sm mb-1.5 block">Sweep Parameter</Label>
            <select
              value={sweepParam}
              onChange={(e) => {
                setSweepParam(e.target.value as SweepableParam);
                setSweepPoints([]);
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {SWEEPABLE_PARAMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                  {p.unit ? ` (${p.unit})` : ""}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={handleRun}
            disabled={loading}
            size="sm"
            className="shrink-0 mt-6"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <Spinner /> Sweeping&hellip;
              </span>
            ) : (
              "Run Sweep"
            )}
          </Button>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        {chartData.length > 0 && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  QBER vs {paramInfo.label}
                </p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 15, bottom: 5, left: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="x"
                      tick={{
                        fontSize: 10,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                    />
                    <YAxis
                      tick={{
                        fontSize: 10,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                      formatter={(value?: number | string) => [
                        `${value ?? 0}%`,
                        "QBER",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="qber"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  SKR vs {paramInfo.label}
                </p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 15, bottom: 5, left: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="x"
                      tick={{
                        fontSize: 10,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                    />
                    <YAxis
                      tick={{
                        fontSize: 10,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                      formatter={(value?: number | string) => [
                        Number(value ?? 0).toFixed(5),
                        "SKR",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="skr"
                      stroke="#34d399"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => exportSweepCSV(sweepPoints, paramInfo.label)}
            >
              Export Sweep as CSV
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── Export Section ───────────────────────────────────────────────────────────

function ExportSection({
  result,
  distanceSweep,
  noiseSweep,
}: {
  result: SimulationResponse | null;
  distanceSweep: SweepPoint[];
  noiseSweep: SweepPoint[];
}) {
  const hasData =
    !!result || distanceSweep.length > 0 || noiseSweep.length > 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-emerald-600 text-[10px] font-bold text-white">
            &darr;
          </span>
          Data Export
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasData}
          onClick={() => exportAllCSV(result, distanceSweep, noiseSweep)}
          className="w-full"
        >
          Export All Simulation Data as CSV
        </Button>
        {!hasData && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Run a simulation first to enable export.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Intercept Probability Sweep with Theoretical Overlay ─────────────────────

/**
 * Theoretical QBER from intercept-resend attack in BB84:
 * 
 * When Eve intercepts with probability p:
 * - She picks wrong basis 50% of the time
 * - In wrong basis cases, she introduces 50% errors
 * - Plus existing channel noise ε
 * 
 * Theoretical QBER = ε + p * 0.25 * (1 - ε)
 * 
 * At p=1 (full intercept): QBER ≈ 25% (the BB84 signature of eavesdropping)
 */
function theoreticalQber(interceptProb: number, baseNoise: number): number {
  return baseNoise + interceptProb * 0.25 * (1 - baseNoise);
}

function InterceptSweepSection({ params }: { params: SimulationRequest }) {
  const [sweepPoints, setSweepPoints] = useState<SweepPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const SECURITY_THRESHOLD = 11; // 11% QBER threshold

  const handleRun = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await runGenericSweep(
        { ...params, eve_enabled: true },
        "eve_probability",
        0,
        1,
        25
      );
      setSweepPoints(res.points);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [params]);

  // Prepare chart data with both simulated and theoretical values
  const chartData = sweepPoints.map((p) => {
    const interceptProb = p.x;
    const simulatedQber = p.qber * 100;
    const theoretical = theoreticalQber(interceptProb, params.noise) * 100;
    
    return {
      x: +(interceptProb * 100).toFixed(1), // Convert to percentage
      simulated: +simulatedQber.toFixed(2),
      theoretical: +theoretical.toFixed(2),
      skr: +p.skr.toFixed(6),
      finalKey: p.final_key_length,
    };
  });

  // Find the critical intercept probability where security is compromised
  const criticalPoint = chartData.find((d) => d.simulated > SECURITY_THRESHOLD);
  const theoreticalCritical = chartData.find((d) => d.theoretical > SECURITY_THRESHOLD);

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-red-600 text-[10px] font-bold text-white">
            ⚡
          </span>
          Intercept Probability Sweep — Threat Analysis
          <span className="ml-auto text-[10px] font-normal text-muted-foreground">
            Simulated vs Theoretical Comparison
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground max-w-lg">
            Sweeps Eve&apos;s intercept probability from 0% to 100% and compares 
            simulated QBER against the theoretical BB84 model. The theoretical 
            curve follows <code className="text-[10px] bg-muted px-1 rounded">QBER = ε + p·0.25·(1-ε)</code> where 
            ε is base noise and p is intercept probability.
          </p>
          <Button
            onClick={handleRun}
            disabled={loading}
            size="sm"
            variant="destructive"
            className="shrink-0"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <Spinner /> Analyzing&hellip;
              </span>
            ) : (
              "Run Threat Analysis"
            )}
          </Button>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        {chartData.length > 0 && (
          <>
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Main QBER comparison chart */}
              <div className="lg:col-span-2">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  QBER vs Intercept Probability — Simulated vs Theoretical
                </p>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 30, bottom: 5, left: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="x"
                      tick={{
                        fontSize: 10,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      label={{
                        value: "Intercept Probability (%)",
                        position: "insideBottom",
                        offset: -2,
                        fontSize: 10,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                    />
                    <YAxis
                      tick={{
                        fontSize: 10,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      label={{
                        value: "QBER (%)",
                        angle: -90,
                        position: "insideLeft",
                        fontSize: 10,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      domain={[0, 30]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                      formatter={(value, name) => [
                        `${(value as number)?.toFixed(2) ?? 0}%`,
                        name === "simulated" ? "Simulated QBER" : "Theoretical QBER",
                      ]}
                      labelFormatter={(v) => `Intercept: ${v}%`}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 10 }}
                      formatter={(value) =>
                        value === "simulated" ? "Simulated" : "Theoretical (BB84)"
                      }
                    />
                    {/* Security threshold line */}
                    <ReferenceLine
                      y={SECURITY_THRESHOLD}
                      stroke="#ef4444"
                      strokeWidth={2}
                      strokeDasharray="8 4"
                      label={{
                        value: "Security Bound (11%)",
                        position: "insideTopRight",
                        fill: "#ef4444",
                        fontSize: 9,
                        fontWeight: 500,
                      }}
                    />
                    {/* Theoretical curve */}
                    <Line
                      type="monotone"
                      dataKey="theoretical"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      strokeDasharray="5 3"
                      dot={false}
                      name="theoretical"
                    />
                    {/* Simulated curve */}
                    <Line
                      type="monotone"
                      dataKey="simulated"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ r: 2, fill: "#ef4444" }}
                      activeDot={{ r: 4 }}
                      name="simulated"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Key collapse visualization */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Final Key Length Collapse
                </p>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 15, bottom: 5, left: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="x"
                      tick={{
                        fontSize: 10,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      label={{
                        value: "Intercept %",
                        position: "insideBottom",
                        offset: -2,
                        fontSize: 9,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                    />
                    <YAxis
                      tick={{
                        fontSize: 10,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      label={{
                        value: "Final Key (bits)",
                        angle: -90,
                        position: "insideLeft",
                        fontSize: 9,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                      formatter={(value) => [
                        (value as number)?.toLocaleString() ?? 0,
                        "Final Key Bits",
                      ]}
                      labelFormatter={(v) => `Intercept: ${v}%`}
                    />
                    <Line
                      type="monotone"
                      dataKey="finalKey"
                      stroke="#34d399"
                      strokeWidth={2}
                      dot={{ r: 2, fill: "#34d399" }}
                      activeDot={{ r: 4 }}
                    />
                    {/* Zero line showing key collapse */}
                    <ReferenceLine
                      y={0}
                      stroke="#ef4444"
                      strokeWidth={1}
                      strokeDasharray="4 2"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Analysis summary */}
            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Critical Intercept (Simulated)
                </p>
                <p className="text-lg font-bold text-red-500 font-mono">
                  {criticalPoint ? `${criticalPoint.x}%` : "> 100%"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {criticalPoint ? "Security compromised" : "Always secure"}
                </p>
              </div>
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Critical Intercept (Theory)
                </p>
                <p className="text-lg font-bold text-slate-400 font-mono">
                  {theoreticalCritical ? `${theoreticalCritical.x}%` : "> 100%"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Theoretical prediction
                </p>
              </div>
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  QBER @ 100% Intercept
                </p>
                <p className="text-lg font-bold text-amber-500 font-mono">
                  {chartData[chartData.length - 1]?.simulated.toFixed(1)}%
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Theory predicts ~25%
                </p>
              </div>
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Model Accuracy
                </p>
                <p className="text-lg font-bold text-emerald-500 font-mono">
                  {(() => {
                    const simMax = chartData[chartData.length - 1]?.simulated ?? 25;
                    const theoMax = chartData[chartData.length - 1]?.theoretical ?? 25;
                    const diff = Math.abs(simMax - theoMax);
                    const accuracy = Math.max(0, 100 - (diff / theoMax) * 100);
                    return `${accuracy.toFixed(1)}%`;
                  })()}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Simulation vs Theory
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                const csv = [
                  ["Intercept %", "Simulated QBER %", "Theoretical QBER %", "SKR", "Final Key Length"],
                  ...chartData.map((d) => [d.x, d.simulated, d.theoretical, d.skr, d.finalKey]),
                ]
                  .map((row) => row.join(","))
                  .join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `intercept-sweep-${Date.now()}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export Threat Analysis as CSV
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main export ─────────────────────────────────────────────────────────────

const ResearchTools = memo(function ResearchTools({
  params,
  result,
  distanceSweep,
  noiseSweep,
}: ResearchToolsProps) {
  return (
    <div className="space-y-4">
      <Separator />
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">
          Research Mode
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Threat Analysis - Full Width */}
      <InterceptSweepSection params={params} />

      <div className="grid gap-4 lg:grid-cols-2">
        <MonteCarloSection params={params} />
        <AutoSweepSection params={params} />
      </div>

      <ExportSection
        result={result}
        distanceSweep={distanceSweep}
        noiseSweep={noiseSweep}
      />
    </div>
  );
});

export default ResearchTools;
