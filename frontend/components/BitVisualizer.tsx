"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HiOutlineKey, HiOutlineUser, HiOutlineExclamationTriangle } from "react-icons/hi2";
import { TbBinary } from "react-icons/tb";
import type { SimulationResponse } from "@/lib/api";

interface BitVisualizerProps {
  result: SimulationResponse | null;
}

/**
 * Renders a compact grid of bit cells, color-coded by value and
 * highlighting mismatches between Alice and Bob.
 */
function BitGrid({
  title,
  icon,
  bits,
  compareTo,
  color,
}: {
  title: string;
  icon: React.ReactNode;
  bits: number[];
  compareTo?: number[];
  color: "sky" | "violet";
}) {
  if (bits.length === 0) {
    return (
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-1.5">
          {icon}
          {title}
        </p>
        <p className="text-xs text-muted-foreground italic">No data</p>
      </div>
    );
  }

  const mismatchCount = compareTo 
    ? bits.filter((bit, i) => compareTo[i] !== undefined && compareTo[i] !== bit).length 
    : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          {icon}
          {title}
        </p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
            {bits.length} bits
          </Badge>
          {mismatchCount > 0 && (
            <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4 gap-0.5">
              <HiOutlineExclamationTriangle className="h-2.5 w-2.5" />
              {mismatchCount} errors
            </Badge>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-[3px] p-2 rounded-lg bg-muted/30 border">
        {bits.map((bit, i) => {
          const mismatch = compareTo !== undefined && compareTo[i] !== undefined && compareTo[i] !== bit;
          return (
            <span
              key={i}
              className={`
                inline-flex h-6 w-6 items-center justify-center rounded text-[10px] font-mono font-bold transition-all
                ${
                  mismatch
                    ? "bg-red-500 text-white ring-2 ring-red-400 scale-110 z-10"
                    : bit === 1
                    ? color === "sky" 
                      ? "bg-sky-500/80 text-white" 
                      : "bg-violet-500/80 text-white"
                    : "bg-muted text-muted-foreground border border-border"
                }
              `}
              title={mismatch ? `Mismatch at position ${i}` : `Bit ${i}: ${bit}`}
            >
              {bit}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default memo(function BitVisualizer({ result }: BitVisualizerProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <TbBinary className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base">Bit Stream Preview</CardTitle>
            <CardDescription className="text-[11px]">
              Visual comparison of Alice&apos;s and Bob&apos;s key bits
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {result ? (
          <>
            <BitGrid 
              title="Alice — Raw Key (first 64 bits)" 
              icon={<HiOutlineUser className="h-3 w-3" />}
              bits={result.raw_bits_sample}
              color="sky"
            />
            <BitGrid
              title="Bob — Sifted Key (first 64 bits)"
              icon={<HiOutlineKey className="h-3 w-3" />}
              bits={result.bob_bits_sample}
              compareTo={result.raw_bits_sample.slice(0, result.bob_bits_sample.length)}
              color="violet"
            />
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-2 border-t">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded bg-sky-500/80" />
                <span>1 (Alice)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded bg-violet-500/80" />
                <span>1 (Bob)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded bg-muted border border-border" />
                <span>0</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded bg-red-500 ring-2 ring-red-400" />
                <span>Mismatch</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
            <TbBinary className="h-8 w-8 opacity-50" />
            <p className="text-sm">Run a simulation to preview bit streams</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
