"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HiOutlineBolt,
  HiOutlineSignal,
  HiOutlineShieldCheck,
  HiOutlineEye,
  HiOutlineCog6Tooth,
  HiOutlinePlay,
  HiOutlineInformationCircle,
  HiOutlineWifi,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineCpuChip,
  HiOutlineLockClosed,
} from "react-icons/hi2";
import { TbAtom2 } from "react-icons/tb";
import type { SimulationRequest } from "@/lib/api";

interface ControlPanelProps {
  params: SimulationRequest;
  onChange: (params: SimulationRequest) => void;
  onRun: () => void;
  loading: boolean;
  researchMode?: boolean;
}

/* ── Editable Slider Row with Input ──────────────────────────────────────── */

function SliderInputRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  icon,
  tooltip,
  formatDisplay,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
  icon?: React.ReactNode;
  tooltip?: string;
  formatDisplay?: (v: number) => string;
}) {
  const [inputValue, setInputValue] = useState(value.toString());
  const [isFocused, setIsFocused] = useState(false);

  // Sync input when slider changes (but not when input is focused)
  const displayValue = formatDisplay ? formatDisplay(value) : value.toString();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed));
      const stepped = Math.round(clamped / step) * step;
      onChange(stepped);
      setInputValue(stepped.toString());
    } else {
      setInputValue(value.toString());
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    setInputValue(value.toString());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  // Keep input in sync when value changes from slider
  const handleSliderChange = useCallback(
    ([v]: number[]) => {
      onChange(v);
      if (!isFocused) {
        setInputValue(v.toString());
      }
    },
    [onChange, isFocused]
  );

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <Label className="text-sm font-medium">{label}</Label>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HiOutlineInformationCircle className="h-3 w-3 text-muted-foreground/50 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[200px] text-xs">
                  {tooltip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={isFocused ? inputValue : displayValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            className="w-20 h-7 px-2 text-xs tabular-nums font-mono text-right 
                       bg-muted/50 border border-border rounded-md
                       focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                       hover:bg-muted transition-colors"
          />
          {unit && (
            <span className="text-[10px] text-muted-foreground w-10">{unit}</span>
          )}
        </div>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={handleSliderChange}
        className="py-1"
      />
    </div>
  );
}

/* ── Section Header ──────────────────────────────────────────────────────── */

function SectionHeader({
  icon,
  title,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
}) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-primary">{icon}</span>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      {badge && (
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
          {badge}
        </Badge>
      )}
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────────────────── */

export default function ControlPanel({
  params,
  onChange,
  onRun,
  loading,
  researchMode,
}: ControlPanelProps) {
  const set = <K extends keyof SimulationRequest>(
    key: K,
    value: SimulationRequest[K]
  ) => onChange({ ...params, [key]: value });

  return (
    <Card className="h-full border-r rounded-none bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <HiOutlineCog6Tooth className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base tracking-tight">
              Simulation Controls
            </CardTitle>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Configure BB84 parameters
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 overflow-y-auto pb-6 pt-4">
        {/* ── Photon Source ──────────────────────────────────────────── */}
        <SectionHeader icon={<HiOutlineBolt className="h-3.5 w-3.5" />} title="Source" />
        
        <SliderInputRow
          label="Photons"
          value={params.photons}
          min={100}
          max={500_000}
          step={100}
          icon={<TbAtom2 className="h-3.5 w-3.5" />}
          tooltip="Number of photons to transmit"
          formatDisplay={(v) => v.toLocaleString()}
          onChange={(v) => set("photons", v)}
        />

        <Separator className="my-4" />

        {/* ── Channel ────────────────────────────────────────────────── */}
        <SectionHeader
          icon={<HiOutlineSignal className="h-3.5 w-3.5" />}
          title="Quantum Channel"
        />

        <SliderInputRow
          label="Distance"
          value={params.distance}
          min={0}
          max={200}
          step={1}
          unit="km"
          icon={<HiOutlineWifi className="h-3.5 w-3.5" />}
          tooltip="Fiber optic channel length"
          onChange={(v) => set("distance", v)}
        />

        <SliderInputRow
          label="Attenuation (α)"
          value={params.attenuation}
          min={0}
          max={2}
          step={0.01}
          unit="dB/km"
          icon={<HiOutlineSignal className="h-3.5 w-3.5" />}
          tooltip="Fiber loss coefficient. Typical: 0.2 dB/km for telecom fiber"
          onChange={(v) => set("attenuation", v)}
        />

        <SliderInputRow
          label="Noise (ε)"
          value={params.noise}
          min={0}
          max={0.5}
          step={0.001}
          icon={<HiOutlineAdjustmentsHorizontal className="h-3.5 w-3.5" />}
          tooltip="Background bit-flip error rate"
          formatDisplay={(v) => (v * 100).toFixed(1) + "%"}
          onChange={(v) => set("noise", v)}
        />

        <SliderInputRow
          label="Detector Efficiency (η)"
          value={params.detector_efficiency}
          min={0.01}
          max={1}
          step={0.01}
          icon={<HiOutlineCpuChip className="h-3.5 w-3.5" />}
          tooltip="Single-photon detector efficiency. Commercial APDs: 10-25%"
          formatDisplay={(v) => (v * 100).toFixed(0) + "%"}
          onChange={(v) => set("detector_efficiency", v)}
        />

        <Separator className="my-4" />

        {/* ── Eavesdropper ───────────────────────────────────────────── */}
        <SectionHeader
          icon={<HiOutlineEye className="h-3.5 w-3.5" />}
          title="Eavesdropper"
          badge={params.eve_enabled ? "ACTIVE" : undefined}
        />

        <div className="flex items-center justify-between py-1 px-1 rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            <HiOutlineEye className={`h-4 w-4 ${params.eve_enabled ? "text-red-500" : "text-muted-foreground"}`} />
            <Label htmlFor="eve-toggle" className="text-sm cursor-pointer">
              Eve Active
            </Label>
          </div>
          <Switch
            id="eve-toggle"
            checked={params.eve_enabled}
            onCheckedChange={(v) => set("eve_enabled", v)}
          />
        </div>

        {params.eve_enabled && (
          <div className="pl-1 border-l-2 border-red-500/30 ml-2">
            <SliderInputRow
              label="Intercept Probability"
              value={params.eve_probability}
              min={0}
              max={1}
              step={0.01}
              icon={<HiOutlineEye className="h-3.5 w-3.5 text-red-500" />}
              tooltip="Fraction of photons Eve intercepts (0-100%)"
              formatDisplay={(v) => (v * 100).toFixed(0) + "%"}
              onChange={(v) => set("eve_probability", v)}
            />
          </div>
        )}

        <Separator className="my-4" />

        {/* ── Security ───────────────────────────────────────────────── */}
        <SectionHeader
          icon={<HiOutlineShieldCheck className="h-3.5 w-3.5" />}
          title="Security"
        />

        <SliderInputRow
          label="QBER Threshold"
          value={params.qber_threshold}
          min={0.01}
          max={0.25}
          step={0.01}
          icon={<HiOutlineLockClosed className="h-3.5 w-3.5" />}
          tooltip="Security abort threshold. Theoretical limit: 11%"
          formatDisplay={(v) => (v * 100).toFixed(0) + "%"}
          onChange={(v) => set("qber_threshold", v)}
        />

        {/* ── Research Mode ─────────────────────────────────────────── */}
        {researchMode && (
          <>
            <Separator className="my-4" />
            <SectionHeader
              icon={<HiOutlineCog6Tooth className="h-3.5 w-3.5 text-violet-500" />}
              title="Research"
              badge="ADVANCED"
            />
            <SliderInputRow
              label="EC Efficiency (f)"
              value={params.ec_efficiency}
              min={1.0}
              max={2.0}
              step={0.01}
              icon={<HiOutlineCog6Tooth className="h-3.5 w-3.5 text-violet-500" />}
              tooltip="Error correction overhead. Cascade: ~1.16"
              onChange={(v) => set("ec_efficiency", v)}
            />
          </>
        )}

        <Separator className="my-4" />

        {/* ── Run Button ─────────────────────────────────────────────── */}
        <Button
          className="w-full h-11 text-sm font-semibold gap-2 
                     bg-gradient-to-r from-primary to-primary/80
                     hover:from-primary/90 hover:to-primary/70
                     shadow-lg shadow-primary/20"
          size="lg"
          onClick={onRun}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
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
              Simulating…
            </span>
          ) : (
            <>
              <HiOutlinePlay className="h-4 w-4" />
              Run Simulation
            </>
          )}
        </Button>

        {/* Quick info */}
        <div className="text-[10px] text-center text-muted-foreground/60 pt-1">
          Click input fields to type exact values
        </div>
      </CardContent>
    </Card>
  );
}
