export type ServiceStatus = 'healthy' | 'warning' | 'degraded' | 'critical' | 'predicted';
export type ServiceTier = 'tier-01' | 'tier-02' | 'tier-03' | 'tier-04';
export type ServiceType = 'Microservice' | 'Database' | 'Cache' | 'Queue' | 'Gateway';
export type CausalRole = 'incident_root' | 'affected' | 'downstream' | 'unaffected';

export interface ServiceNode {
  id: string;
  name: string;
  displayName: string;
  tier: ServiceTier;
  tierLabel: string;
  type: ServiceType;
  tech: string;
  host: string;
  region: string;
  status: ServiceStatus;
  latencyP99: number; // ms
  baselineLatency: number; // ms
  errorRate: number; // %
  throughput: string;
  podAllocation: {
    current: number;
    max: number;
  };
  causalRole: CausalRole;
  description: string;
  causalMechanism?: string;
  propagationDelay?: string;
  upstreamDeps: string[];
  downstreamDeps: string[];
  // 3D & 2D coordinates
  pos3D: [number, number, number];
  pos2D: [number, number];
  isIncidentPath?: boolean;
  incidentStep?: number;
  incidentStatusText?: string;
}

export type EdgeType = 'observed' | 'inferred' | 'predicted' | 'simulated';

export interface TopologyEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  isIncidentPath?: boolean;
  delayLabel?: string;
  status?: 'nominal' | 'critical' | 'predicted';
}

export interface IncidentStep {
  step: number;
  serviceId: string;
  serviceName: string;
  timestamp: string;
  offsetSeconds: string;
  summary: string;
  detail: string;
  metricLabel: string;
  metricValue: string;
  status: 'critical' | 'degraded' | 'warning';
  causalType: 'OBSERVED TELEMETRY' | 'INFERRED PROPAGATION' | 'PREDICTED CASCADE';
}

export interface IncidentData {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'RESOLVED' | 'INVESTIGATING';
  rootCauseCandidate: string;
  modelConfidence: number; // %
  posteriorProb: number;
  detectedAt: string;
  blastRadius: string;
  elapsedTime: string;
  engineState: string;
  slaExposure: string;
  dagPropagation: string;
  summary: string;
  recommendedIntervention: string;
  targetAddress: string;
  steps: IncidentStep[];
  fiveCriteria: {
    number: string;
    name: string;
    source: string;
    description: string;
    verified: boolean;
  }[];
  competingHypotheses: {
    serviceId: string;
    confidence: number;
    description: string;
  }[];
}

export interface SimulationScenario {
  id: string;
  label: string;
  description: string;
  modeledComponent: string;
  horizonSeconds: number;
  predictedPeakImpact: { from: number; to: number; delta: string };
  servicesRecovered: string;
  recoveryPercentageAt180: number;
  predictedP99Latency: { from: number; to: number; delta: string };
  predicted504ErrorRate: { from: number; to: number; delta: string };
  riskLabel: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO';
  service: string;
  traceId: string;
  spanId: string;
  causalAttribution: string;
  message: string;
  host: string;
  structuredAttributes: Record<string, string | number>;
  isIncidentAnchor?: boolean;
}

export interface TraceSpan {
  id: string;
  parentId?: string;
  service: string;
  operation: string;
  startOffsetMs: number;
  durationMs: number;
  status: 'OK' | 'ERROR' | 'CRITICAL' | 'WARN';
  selfTimeMs?: number;
  statusText: string;
  depth: number;
  isRootCause?: boolean;
  attributes: Record<string, string | number>;
}

export interface FailurePredictionItem {
  serviceId: string;
  serviceName: string;
  tech: string;
  currentState: string;
  predictedState: string;
  riskProbability: number; // %
  riskCategory: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'MODERATE' | 'LOW' | 'NOMINAL';
  eta: string;
  primaryCausalDriver: string;
  driverDetail: string;
}
