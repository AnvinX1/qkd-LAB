"use client";

import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  HiOutlineExclamationTriangle,
  HiOutlineShieldCheck,
  HiOutlineShieldExclamation,
  HiOutlineKey,
  HiOutlineBolt,
} from "react-icons/hi2";
import { TbPercentage } from "react-icons/tb";
import type { SimulationResponse } from "@/lib/api";

interface MetricsBarProps {
  result: SimulationResponse | null;
}

function Stat({ 
  label, 
  value, 
  icon,
  highlight 
}: { 
  label: string; 
  value: string;
  icon?: React.ReactNode;
  highlight?: "success" | "danger" | "warning";
}) {
  const highlightClass = highlight === "success" 
    ? "text-emerald-500" 
    : highlight === "danger" 
    ? "text-red-500" 
    : highlight === "warning"
    ? "text-amber-500"
    : "";

  return (
    <div className="flex flex-col items-center gap-0.5 px-4">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
        {icon}
        {label}
      </span>
      <span className={`text-sm font-semibold tabular-nums font-mono ${highlightClass}`}>
        {value}
      </span>
    </div>
  );
}

export default memo(function MetricsBar({ result }: MetricsBarProps) {
  if (!result) {
    return (
      <div className="flex h-14 items-center justify-center border-t bg-card/50 backdrop-blur-sm text-sm text-muted-foreground gap-2">
        <HiOutlineBolt className="h-4 w-4" />
        Run a simulation to see metrics
      </div>
    );
  }

  // 11% theoretical security threshold for BB84
  const SECURITY_THRESHOLD = 0.11;
  
  const qberPct = (result.qber * 100).toFixed(2);
  const skrFmt = result.skr.toFixed(4);
  const exceedsThreshold = result.qber > SECURITY_THRESHOLD;
  const secure = result.security_status === "SECURE" && !exceedsThreshold;

  return (
    <div className="flex h-14 items-center justify-between border-t bg-card/50 backdrop-blur-sm px-4">
      <div className="flex items-center">
        <Stat 
          label="QBER" 
          value={`${qberPct}%`}
          icon={<TbPercentage className="h-3 w-3" />}
          highlight={exceedsThreshold ? "danger" : result.qber > 0.08 ? "warning" : undefined}
        />
        <Separator orientation="vertical" className="h-8 mx-1" />
        <Stat 
          label="SKR" 
          value={skrFmt}
          highlight={result.skr > 0 ? "success" : "danger"}
        />
        <Separator orientation="vertical" className="h-8 mx-1" />
        <Stat 
          label="Sifted" 
          value={result.sifted_key_length.toLocaleString()}
          icon={<HiOutlineKey className="h-3 w-3" />}
        />
        <Separator orientation="vertical" className="h-8 mx-1" />
        <Stat label="Final Key" value={result.final_key_length.toLocaleString()} />
        <Separator orientation="vertical" className="h-8 mx-1" />
        <Stat label="Mismatches" value={result.mismatches.toLocaleString()} highlight={result.mismatches > 0 ? "warning" : undefined} />
        <Separator orientation="vertical" className="h-8 mx-1" />
        <Stat label="Photons" value={result.total_photons.toLocaleString()} />
      </div>

      <div className="flex items-center gap-2">
        {exceedsThreshold && (
          <Badge
            variant="outline"
            className="text-[10px] px-2 py-0.5 border-red-500 text-red-500 bg-red-500/10 gap-1"
          >
            <HiOutlineExclamationTriangle className="h-3 w-3" />
            QBER &gt; 11%
          </Badge>
        )}
        <Badge
          className={`text-xs px-3 py-1.5 gap-1.5 ${
            secure
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {secure ? (
            <HiOutlineShieldCheck className="h-3.5 w-3.5" />
          ) : (
            <HiOutlineShieldExclamation className="h-3.5 w-3.5" />
          )}
          {exceedsThreshold ? "COMPROMISED" : result.security_status}
        </Badge>
      </div>
    </div>
  );
});
