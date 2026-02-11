"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SimulationResponse, SweepPoint } from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
  ReferenceLine,
} from "recharts";

// ── Types ───────────────────────────────────────────────────────────────────

interface GraphSectionProps {
  result: SimulationResponse | null;
  distanceSweep: SweepPoint[];
  noiseSweep: SweepPoint[];
}

// ── Placeholder when no data ────────────────────────────────────────────────

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-56 items-center justify-center rounded-md border border-dashed border-muted-foreground/25 bg-muted/20">
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  );
}

// ── QBER vs Distance ────────────────────────────────────────────────────────

// Security threshold constant (11% theoretical limit for BB84)
const SECURITY_THRESHOLD = 11;

function QberDistanceChart({ data }: { data: SweepPoint[] }) {
  if (data.length === 0) return <EmptyChart message="Run simulation to see QBER vs Distance" />;

  const formatted = data.map((p) => ({
    distance: p.x,
    qber: +(p.qber * 100).toFixed(2),
  }));

  // Check if any QBER value exceeds threshold
  const exceedsThreshold = formatted.some((p) => p.qber > SECURITY_THRESHOLD);

  return (
    <ResponsiveContainer width="100%" height={224}>
      <LineChart data={formatted} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="distance"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          label={{ value: "Distance (km)", position: "insideBottom", offset: -2, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          label={{ value: "QBER %", angle: -90, position: "insideLeft", fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          domain={[0, (dataMax: number) => Math.max(dataMax, SECURITY_THRESHOLD + 2)]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value?: number | string) => [`${value ?? 0}%`, "QBER"]}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          labelFormatter={(v: any) => `${v} km`}
        />
        <ReferenceLine
          y={SECURITY_THRESHOLD}
          stroke="#ef4444"
          strokeWidth={2}
          strokeDasharray="8 4"
          label={{
            value: "Security Bound (Theoretical Limit)",
            position: "insideTopRight",
            fill: "#ef4444",
            fontSize: 10,
            fontWeight: 500,
          }}
        />
        <Line
          type="monotone"
          dataKey="qber"
          stroke={exceedsThreshold ? "#ef4444" : "#38bdf8"}
          strokeWidth={2}
          dot={{ r: 2.5, fill: exceedsThreshold ? "#ef4444" : "#38bdf8" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── SKR vs Noise ────────────────────────────────────────────────────────────

function SkrNoiseChart({ data }: { data: SweepPoint[] }) {
  if (data.length === 0) return <EmptyChart message="Run simulation to see SKR vs Noise" />;

  const formatted = data.map((p) => ({
    noise: +(p.x * 100).toFixed(2),
    skr: +p.skr.toFixed(5),
  }));

  return (
    <ResponsiveContainer width="100%" height={224}>
      <LineChart data={formatted} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="noise"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          label={{ value: "Noise (%)", position: "insideBottom", offset: -2, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          label={{ value: "SKR", angle: -90, position: "insideLeft", fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value?: number | string) => [Number(value ?? 0).toFixed(5), "SKR"]}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          labelFormatter={(v: any) => `Noise: ${v}%`}
        />
        <Line
          type="monotone"
          dataKey="skr"
          stroke="#a78bfa"
          strokeWidth={2}
          dot={{ r: 2.5, fill: "#a78bfa" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Key Length Bar Chart ────────────────────────────────────────────────────

function KeyLengthChart({ result }: { result: SimulationResponse | null }) {
  if (!result) return <EmptyChart message="Run simulation to compare key lengths" />;

  const data = [
    { name: "Raw", value: result.total_photons, fill: "#64748b" },
    { name: "Sifted", value: result.sifted_key_length, fill: "#38bdf8" },
    { name: "Final", value: result.final_key_length, fill: "#34d399" },
  ];

  return (
    <ResponsiveContainer width="100%" height={224}>
      <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          label={{ value: "Bits", angle: -90, position: "insideLeft", fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(value?: number | string) => [Number(value ?? 0).toLocaleString(), "Bits"]}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="value" name="Key Length" radius={[4, 4, 0, 0]}>
          {data.map((entry, idx) => (
            <Cell key={idx} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Main export ─────────────────────────────────────────────────────────────

export default memo(function GraphSection({ result, distanceSweep, noiseSweep }: GraphSectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">QBER vs Distance</CardTitle>
        </CardHeader>
        <CardContent>
          <QberDistanceChart data={distanceSweep} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Secret Key Rate vs Noise</CardTitle>
        </CardHeader>
        <CardContent>
          <SkrNoiseChart data={noiseSweep} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Key Length Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <KeyLengthChart result={result} />
        </CardContent>
      </Card>
    </div>
  );
});
