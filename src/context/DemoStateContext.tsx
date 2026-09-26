import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  ServiceNode,
  TopologyEdge,
  IncidentData,
  SimulationScenario,
  LogEntry,
  TraceSpan,
  FailurePredictionItem,
  ActiveIncidentItem,
} from '../types';
import {
  BASE_SERVICES,
  AUTH_FAIL_SERVICES,
  BASE_TOPOLOGY_EDGES,
  AUTH_FAIL_TOPOLOGY_EDGES,
  BASE_ACTIVE_INCIDENTS,
  AUTH_FAIL_ACTIVE_INCIDENTS,
  CORE_INCIDENT,
  AUTH_INCIDENT,
  BASE_MOCK_LOGS,
  AUTH_FAIL_MOCK_LOGS,
  BASE_MOCK_TRACE_SPANS,
  AUTH_FAIL_MOCK_TRACE_SPANS,
  BASE_PREDICTIONS,
  AUTH_FAIL_PREDICTIONS,
  BASE_HISTORICAL_INCIDENTS,
  AUTH_FAIL_HISTORICAL_INCIDENTS,
  BASE_SIMULATION_SCENARIOS,
  AUTH_FAIL_SIMULATION_SCENARIOS,
  applyMockFault,
} from '../data/mockData';

export interface DemoStateContextValue {
  activeFault: string | null;
  status: 'HEALTHY' | 'CRITICAL';
  services: ServiceNode[];
  edges: TopologyEdge[];
  activeIncidents: ActiveIncidentItem[];
  currentIncident: IncidentData;
  logs: LogEntry[];
  traces: TraceSpan[];
  predictions: FailurePredictionItem[];
  historicalIncidents: typeof BASE_HISTORICAL_INCIDENTS;
  simulationScenarios: SimulationScenario[];
  triggerFault: (target: string) => Promise<void>;
  restoreBaseline: () => Promise<void>;
}

const DemoStateContext = createContext<DemoStateContextValue | null>(null);

export const DemoStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeFault, setActiveFault] = useState<string | null>(null);

  const syncState = useCallback(async () => {
    try {
      const res = await fetch(`/demo-state.json?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const fault = data.activeFault ?? null;
        setActiveFault(fault);
        applyMockFault(fault);
      }
    } catch {
      // In case fetch fails, retain current state
    }
  }, []);

  useEffect(() => {
    syncState();
    const interval = setInterval(syncState, 800);
    return () => clearInterval(interval);
  }, [syncState]);

  const triggerFault = async (target: string) => {
    setActiveFault(target);
    applyMockFault(target);
    try {
      await fetch('http://localhost:8080/api/faults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SERVICE_LATENCY',
          target,
          severity: 'CRITICAL',
          durationSeconds: 600,
          parameters: { latencyMs: 1450, errorRate: 18.5 },
        }),
      });
    } catch {}
  };

  const restoreBaseline = async () => {
    setActiveFault(null);
    applyMockFault(null);
    try {
      await fetch('http://localhost:8080/api/faults/clear', { method: 'POST' });
    } catch {}
  };

  const isAuthFail = activeFault === 'auth-gateway';

  const value: DemoStateContextValue = {
    activeFault,
    status: isAuthFail ? 'CRITICAL' : 'HEALTHY',
    services: isAuthFail ? AUTH_FAIL_SERVICES : BASE_SERVICES,
    edges: isAuthFail ? AUTH_FAIL_TOPOLOGY_EDGES : BASE_TOPOLOGY_EDGES,
    activeIncidents: isAuthFail ? AUTH_FAIL_ACTIVE_INCIDENTS : BASE_ACTIVE_INCIDENTS,
    currentIncident: isAuthFail ? AUTH_INCIDENT : CORE_INCIDENT,
    logs: isAuthFail ? AUTH_FAIL_MOCK_LOGS : BASE_MOCK_LOGS,
    traces: isAuthFail ? AUTH_FAIL_MOCK_TRACE_SPANS : BASE_MOCK_TRACE_SPANS,
    predictions: isAuthFail ? AUTH_FAIL_PREDICTIONS : BASE_PREDICTIONS,
    historicalIncidents: isAuthFail ? AUTH_FAIL_HISTORICAL_INCIDENTS : BASE_HISTORICAL_INCIDENTS,
    simulationScenarios: isAuthFail ? AUTH_FAIL_SIMULATION_SCENARIOS : BASE_SIMULATION_SCENARIOS,
    triggerFault,
    restoreBaseline,
  };

  return <DemoStateContext.Provider value={value}>{children}</DemoStateContext.Provider>;
};

export const useDemoState = () => {
  const context = useContext(DemoStateContext);
  if (!context) {
    throw new Error('useDemoState must be used within a DemoStateProvider');
  }
  return context;
};
