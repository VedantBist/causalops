const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(base + path, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  if (!response.ok) {
    let detail = '';
    try { detail = await response.text(); } catch { /* ignore */ }
    throw new Error(`CausalOps API ${response.status}: ${detail}`);
  }
  return response.status === 204 ? (undefined as T) : (response.json() as Promise<T>);
}

export interface ServiceSummary {
  id: string;
  name: string;
  displayName: string;
  type: string;
  status: 'healthy' | 'degraded' | 'critical' | 'warning';
  latencyP99: number;
  baselineLatency: number;
  errorRate: number;
  throughput: string;
  causalRole: string;
}

export interface TopologyEdge {
  id: string;
  source: string;
  target: string;
  direction: string;
  type: string;
}

export interface TopologyData {
  nodes: ServiceSummary[];
  edges: TopologyEdge[];
}

export interface ActiveIncident {
  id: string;
  incidentKey: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
  openedAt: string;
  summary: string;
  affectedServices: string; // JSON text from DB
}

export interface RcaAnalysis {
  analysis: {
    id: string;
    incident_id: string;
    completed_at: string;
    methodology: string;
    root_cause: string;
    confidence: number;
    evidence: string;
  };
  candidates: {
    service: string;
    score: number;
    signals: string;
  }[];
}

export interface Prediction {
  id: string;
  service: string;
  probability: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'LOW';
  horizonSeconds: number;
  factors: string;
  createdAt: string;
}

export interface TelemetrySample {
  service: string;
  timestamp: string;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  errorRate: number;
  requestRate: number;
  dbLatency?: number;
  poolUtilization?: number;
  anomalyScore: number;
}

export interface MetricsResponse {
  service: string | null;
  samples: TelemetrySample[];
}

export interface SimulationResult {
  id: string;
  methodology: string;
  results: {
    service: string;
    baseline: number;
    counterfactual: number;
    classification: string;
    label: string;
  }[];
}

export interface OverviewData {
  systemStatus: string;
  activeIncidents: ActiveIncident[];
  services: ServiceSummary[];
  topology: TopologyData;
}

export const causalOpsApi = {
  overview: () => request<OverviewData>('/overview'),
  topology: () => request<TopologyData>('/topology'),
  services: () => request<ServiceSummary[]>('/services'),
  service: (id: string) => request<ServiceSummary>(`/services/${id}`),

  incidents: () => request<ActiveIncident[]>('/incidents/active'),
  incidentHistory: () => request<ActiveIncident[]>('/incidents/history'),
  incident: (id: string) => request<ActiveIncident>(`/incidents/${id}`),
  incidentRca: (id: string) => request<RcaAnalysis>(`/incidents/${id}/root-cause`),

  predictions: () => request<Prediction[]>('/predictions'),
  prediction: (serviceId: string) => request<Prediction[]>(`/predictions/${serviceId}`),

  metrics: (service?: string) =>
    request<MetricsResponse>(`/metrics${service ? `?service=${encodeURIComponent(service)}` : ''}`),

  logs: () => request<unknown[]>('/logs'),
  traces: () => request<unknown[]>('/traces'),

  injectFault: (fault: {
    type: string;
    target: string;
    severity: string;
    durationSeconds: number;
    parameters: Record<string, unknown>;
  }) => request<unknown>('/faults', { method: 'POST', body: JSON.stringify(fault) }),

  clearFaults: () => request<void>('/faults/clear', { method: 'POST' }),

  simulate: (input: { target: string; reductionPercent: number }) =>
    request<SimulationResult>('/simulations', { method: 'POST', body: JSON.stringify(input) }),

  events: (onEvent: (event: unknown) => void): (() => void) => {
    const stream = new EventSource(base + '/events/stream');
    stream.onmessage = (event) => {
      try { onEvent(JSON.parse(event.data)); } catch { /* ignore malformed */ }
    };
    stream.onerror = () => { /* reconnection handled by browser */ };
    return () => stream.close();
  },
};
