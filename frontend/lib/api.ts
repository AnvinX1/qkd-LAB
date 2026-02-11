/**
 * API client for the QKD-Lab BB84 simulation backend.
 */

// Try multiple possible backend URLs for flexibility
const API_URLS = [
  process.env.NEXT_PUBLIC_API_URL,
  "http://localhost:8000",
  "http://127.0.0.1:8000",
].filter(Boolean) as string[];

let API_BASE = API_URLS[0];

// ── Connection status ───────────────────────────────────────────────────────

export type ConnectionStatus = "connected" | "disconnected" | "checking";

let connectionStatus: ConnectionStatus = "checking";
const connectionListeners: Set<(status: ConnectionStatus) => void> = new Set();

export function getConnectionStatus(): ConnectionStatus {
  return connectionStatus;
}

export function onConnectionStatusChange(
  callback: (status: ConnectionStatus) => void
): () => void {
  connectionListeners.add(callback);
  return () => connectionListeners.delete(callback);
}

function setConnectionStatus(status: ConnectionStatus) {
  connectionStatus = status;
  connectionListeners.forEach((cb) => cb(status));
}

// ── Health check with auto-discovery and retry logic ─────────────────────────

const HEALTH_CHECK_TIMEOUT = 60000; // 60 seconds total timeout
const HEALTH_CHECK_INTERVAL = 500; // Check every 500ms
const MAX_RETRIES = 120; // 120 * 500ms = 60 seconds

export async function checkBackendHealth(
  maxRetries: number = MAX_RETRIES,
  intervalMs: number = HEALTH_CHECK_INTERVAL
): Promise<boolean> {
  setConnectionStatus("checking");

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    for (const url of API_URLS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(`${url}/health`, {
          method: "GET",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          API_BASE = url; // Use this working URL
          setConnectionStatus("connected");
          console.log(`✓ Backend health check passed on ${url}`);
          return true;
        }
      } catch {
        // Try next URL
      }
    }

    // If this isn't the last attempt, wait before retrying
    if (attempt < maxRetries - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  setConnectionStatus("disconnected");
  console.warn(
    `⚠ Backend health check failed after ${maxRetries} retries (${(maxRetries * intervalMs) / 1000}s)`
  );
  return false;
}

// Auto-check on module load with retry
if (typeof window !== "undefined") {
  // Start health check with timeout, but don't block page load
  const healthCheckPromise = checkBackendHealth(3, 500); // Quick 3 attempts for initial check

  // Also schedule a background retry in case backend is slow to start
  healthCheckPromise.then((connected) => {
    if (!connected) {
      console.log("Initial health check failed, scheduling background retry...");
      // Retry in background every 5 seconds for up to 2 minutes
      const retryInterval = setInterval(async () => {
        const connected = await checkBackendHealth(1, 0);
        if (connected) {
          clearInterval(retryInterval);
          console.log("✓ Background retry successful");
        }
      }, 5000);

      // Clear interval after 2 minutes
      setTimeout(() => clearInterval(retryInterval), 120000);
    }
  });
}

// ── Request / Response types ────────────────────────────────────────────────

export interface SimulationRequest {
  photons: number;
  distance: number;
  attenuation: number;
  noise: number;
  detector_efficiency: number;
  eve_enabled: boolean;
  eve_probability: number;
  qber_threshold: number;
  ec_efficiency: number;
  seed: number | null;
}

export interface SimulationResponse {
  qber: number;
  skr: number;
  total_photons: number;
  sifted_key_length: number;
  final_key_length: number;
  raw_bits_sample: number[];
  bob_bits_sample: number[];
  mismatches: number;
  security_status: "SECURE" | "COMPROMISED";
}

export interface SweepRequest {
  photons: number;
  attenuation: number;
  noise: number;
  detector_efficiency: number;
  eve_enabled: boolean;
  eve_probability: number;
  qber_threshold: number;
  ec_efficiency: number;
  seed: number | null;
  distance_min: number;
  distance_max: number;
  distance_steps: number;
  noise_min: number;
  noise_max: number;
  noise_steps: number;
}

export interface SweepPoint {
  x: number;
  qber: number;
  skr: number;
  sifted_key_length: number;
  final_key_length: number;
}

export interface SweepResponse {
  distance_sweep: SweepPoint[];
  noise_sweep: SweepPoint[];
}

// ── Monte Carlo types ─────────────────────────────────────────────────────────

export interface MonteCarloRequest {
  photons: number;
  distance: number;
  attenuation: number;
  noise: number;
  detector_efficiency: number;
  eve_enabled: boolean;
  eve_probability: number;
  qber_threshold: number;
  ec_efficiency: number;
  trials: number;
  base_seed: number | null;
}

export interface MonteCarloStats {
  mean: number;
  std: number;
  min_val: number;
  max_val: number;
}

export interface MonteCarloResponse {
  trials: number;
  qber: MonteCarloStats;
  skr: MonteCarloStats;
  sifted_key_length: MonteCarloStats;
  final_key_length: MonteCarloStats;
}

// ── Generic sweep types ───────────────────────────────────────────────────────

export type SweepableParam =
  | "distance"
  | "noise"
  | "attenuation"
  | "detector_efficiency"
  | "eve_probability";

export interface GenericSweepRequest {
  photons: number;
  distance: number;
  attenuation: number;
  noise: number;
  detector_efficiency: number;
  eve_enabled: boolean;
  eve_probability: number;
  qber_threshold: number;
  ec_efficiency: number;
  seed: number | null;
  sweep_param: SweepableParam;
  sweep_min: number;
  sweep_max: number;
  sweep_steps: number;
}

export interface GenericSweepResponse {
  sweep_param: string;
  points: SweepPoint[];
}

// ── Default parameters ──────────────────────────────────────────────────────

export const DEFAULT_PARAMS: SimulationRequest = {
  photons: 10_000,
  distance: 50,
  attenuation: 0.2,
  noise: 0.01,
  detector_efficiency: 0.9,
  eve_enabled: false,
  eve_probability: 0.0,
  qber_threshold: 0.11,
  ec_efficiency: 1.0,
  seed: null,
};

// ── API calls ───────────────────────────────────────────────────────────────

class BackendConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackendConnectionError";
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit
): Promise<T> {
  // Check if we're connected first
  if (connectionStatus === "disconnected") {
    // Try to reconnect
    const connected = await checkBackendHealth();
    if (!connected) {
      throw new BackendConnectionError(
        "Cannot connect to backend server. Please ensure the backend is running (./start-backend.sh or start-backend.bat)"
      );
    }
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, options);

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Request failed (${res.status}): ${detail}`);
    }

    return res.json() as Promise<T>;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      setConnectionStatus("disconnected");
      throw new BackendConnectionError(
        "Lost connection to backend server. Please check if the server is still running."
      );
    }
    throw error;
  }
}

export async function runSimulation(
  params: SimulationRequest
): Promise<SimulationResponse> {
  return apiRequest<SimulationResponse>("/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}

export async function runSweep(
  params: SimulationRequest
): Promise<SweepResponse> {
  const body: SweepRequest = {
    photons: params.photons,
    attenuation: params.attenuation,
    noise: params.noise,
    detector_efficiency: params.detector_efficiency,
    eve_enabled: params.eve_enabled,
    eve_probability: params.eve_probability,
    qber_threshold: params.qber_threshold,
    ec_efficiency: params.ec_efficiency,
    seed: params.seed,
    distance_min: 0,
    distance_max: Math.min(Math.max(params.distance * 2, 20), 1000),
    distance_steps: 25,
    noise_min: 0,
    noise_max: Math.min(Math.max(params.noise * 4, 0.15), 0.5),
    noise_steps: 25,
  };

  return apiRequest<SweepResponse>("/sweep", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Monte Carlo ─────────────────────────────────────────────────────────────

export async function runMonteCarlo(
  params: SimulationRequest,
  trials: number = 10
): Promise<MonteCarloResponse> {
  const body: MonteCarloRequest = {
    photons: params.photons,
    distance: params.distance,
    attenuation: params.attenuation,
    noise: params.noise,
    detector_efficiency: params.detector_efficiency,
    eve_enabled: params.eve_enabled,
    eve_probability: params.eve_probability,
    qber_threshold: params.qber_threshold,
    ec_efficiency: params.ec_efficiency,
    trials,
    base_seed: params.seed,
  };

  return apiRequest<MonteCarloResponse>("/monte-carlo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Generic parameter sweep ───────────────────────────────────────────────────

export const SWEEPABLE_PARAMS: {
  value: SweepableParam;
  label: string;
  unit: string;
  defaultMin: number;
  defaultMax: number;
}[] = [
  { value: "distance", label: "Distance", unit: "km", defaultMin: 0, defaultMax: 200 },
  { value: "noise", label: "Noise", unit: "", defaultMin: 0, defaultMax: 0.5 },
  { value: "attenuation", label: "Attenuation", unit: "dB/km", defaultMin: 0, defaultMax: 2 },
  { value: "detector_efficiency", label: "Detector Efficiency", unit: "", defaultMin: 0.01, defaultMax: 1 },
  { value: "eve_probability", label: "Eve Intercept Prob.", unit: "", defaultMin: 0, defaultMax: 1 },
];

export async function runGenericSweep(
  params: SimulationRequest,
  sweepParam: SweepableParam,
  sweepMin: number,
  sweepMax: number,
  sweepSteps: number = 30
): Promise<GenericSweepResponse> {
  const body: GenericSweepRequest = {
    photons: params.photons,
    distance: params.distance,
    attenuation: params.attenuation,
    noise: params.noise,
    detector_efficiency: params.detector_efficiency,
    eve_enabled: params.eve_enabled,
    eve_probability: params.eve_probability,
    qber_threshold: params.qber_threshold,
    ec_efficiency: params.ec_efficiency,
    seed: params.seed,
    sweep_param: sweepParam,
    sweep_min: sweepMin,
    sweep_max: sweepMax,
    sweep_steps: sweepSteps,
  };

  return apiRequest<GenericSweepResponse>("/sweep/param", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
