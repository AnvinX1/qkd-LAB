/**
 * Client-side CSV generation and download utilities for QKD-Lab.
 */

import type { SimulationResponse, SweepPoint, MonteCarloResponse } from "./api";

// ── Helpers ─────────────────────────────────────────────────────────────────

function downloadBlob(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Individual exports ──────────────────────────────────────────────────────

export function exportSimulationCSV(result: SimulationResponse) {
  const rows = [
    "Metric,Value",
    `QBER,${result.qber}`,
    `SKR,${result.skr}`,
    `Total Photons,${result.total_photons}`,
    `Sifted Key Length,${result.sifted_key_length}`,
    `Final Key Length,${result.final_key_length}`,
    `Mismatches,${result.mismatches}`,
    `Security Status,${result.security_status}`,
  ];
  downloadBlob("qkd-simulation.csv", rows.join("\n"));
}

export function exportSweepCSV(points: SweepPoint[], paramName: string) {
  const header = `${paramName},QBER,SKR,Sifted Key Length,Final Key Length`;
  const rows = points.map(
    (p) =>
      `${p.x},${p.qber},${p.skr},${p.sifted_key_length},${p.final_key_length}`
  );
  downloadBlob(`qkd-sweep-${paramName}.csv`, [header, ...rows].join("\n"));
}

export function exportMonteCarloCSV(mc: MonteCarloResponse) {
  const rows = [
    "Metric,Mean,Std Dev,Min,Max",
    `QBER,${mc.qber.mean},${mc.qber.std},${mc.qber.min_val},${mc.qber.max_val}`,
    `SKR,${mc.skr.mean},${mc.skr.std},${mc.skr.min_val},${mc.skr.max_val}`,
    `Sifted Length,${mc.sifted_key_length.mean},${mc.sifted_key_length.std},${mc.sifted_key_length.min_val},${mc.sifted_key_length.max_val}`,
    `Final Length,${mc.final_key_length.mean},${mc.final_key_length.std},${mc.final_key_length.min_val},${mc.final_key_length.max_val}`,
  ];
  downloadBlob("qkd-monte-carlo.csv", rows.join("\n"));
}

// ── Combined export ─────────────────────────────────────────────────────────

export function exportAllCSV(
  result: SimulationResponse | null,
  distanceSweep: SweepPoint[],
  noiseSweep: SweepPoint[]
) {
  const sections: string[] = [];

  if (result) {
    sections.push(
      "=== Simulation Results ===",
      "Metric,Value",
      `QBER,${result.qber}`,
      `SKR,${result.skr}`,
      `Total Photons,${result.total_photons}`,
      `Sifted Key Length,${result.sifted_key_length}`,
      `Final Key Length,${result.final_key_length}`,
      `Mismatches,${result.mismatches}`,
      `Security Status,${result.security_status}`,
      ""
    );
  }

  if (distanceSweep.length > 0) {
    sections.push(
      "=== Distance Sweep ===",
      "Distance (km),QBER,SKR,Sifted Key Length,Final Key Length",
      ...distanceSweep.map(
        (p) =>
          `${p.x},${p.qber},${p.skr},${p.sifted_key_length},${p.final_key_length}`
      ),
      ""
    );
  }

  if (noiseSweep.length > 0) {
    sections.push(
      "=== Noise Sweep ===",
      "Noise,QBER,SKR,Sifted Key Length,Final Key Length",
      ...noiseSweep.map(
        (p) =>
          `${p.x},${p.qber},${p.skr},${p.sifted_key_length},${p.final_key_length}`
      ),
      ""
    );
  }

  if (sections.length === 0) return;
  downloadBlob("qkd-lab-export.csv", sections.join("\n"));
}
