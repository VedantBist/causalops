import React, { useState, useEffect, useCallback } from 'react';
import { Topology3D } from '../components/topology/Topology3D';
import { ServiceInspector } from '../components/topology/ServiceInspector';
import { AppPage } from '../components/layout/AppShell';
import { causalOpsApi, OverviewData } from '../api/client';
import { useDemoState } from '../context/DemoStateContext';

interface OverviewViewProps {
  onNavigate: (page: AppPage) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigate }) => {
  const { activeFault, services: demoServices, activeIncidents: demoIncidents } = useDemoState();
  const [selectedNodeId, setSelectedNodeId] = useState<string>('inventory-db');
  const [isIncidentIsolated, setIsIncidentIsolated] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [rightPanelMode, setRightPanelMode] = useState<'incident' | 'service'>('incident');

  // Live data state
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    try {
      const data = await causalOpsApi.overview();
      setOverview(data);
      setApiError(null);
    } catch (err) {
      setApiError('API unavailable — showing cached data');
    }
  }, []);

  useEffect(() => {
    loadOverview();
    // Refresh every 5 seconds to pick up telemetry changes
    const interval = setInterval(loadOverview, 5000);
    return () => clearInterval(interval);
  }, [loadOverview]);

  // Build the service list — prefer live data, fall back to mock
  const liveServices = overview?.services ?? null;

  // Map API service to mock format for existing ServiceInspector/Topology3D components
  const topologyServices = liveServices ?? demoServices;

  const selectedService =
    (demoServices.find((s) => s.id === selectedNodeId) ||
     demoServices.find((s) => s.id === 'inventory-db'))!;

  const activeIncidents = overview?.activeIncidents ?? demoIncidents;
  const systemStatus = overview?.systemStatus ?? (activeFault ? 'Degraded' : 'Operational');

  // Compute aggregated telemetry from live services
  const maxP99 = liveServices
    ? Math.max(...liveServices.map((s) => s.latencyP99))
    : 842;
  const maxErrorRate = liveServices
    ? Math.max(...liveServices.map((s) => s.errorRate))
    : 7.2;
  const degradedCount = liveServices
    ? liveServices.filter((s) => s.status !== 'healthy').length
    : 4;

  const handleSelectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setRightPanelMode('service');
  };

  const formatIncidentKey = (inc: typeof activeIncidents[0]) => {
    if ('incidentKey' in inc) return (inc as any).incidentKey;
    return (inc as any).id;
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F7F7F5] select-none font-sans text-[#171A19]">
      {/* COMMAND CENTER SUB-BAR & REAL-TIME REASONING PIPELINE */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-[#FFFFFF] border-b border-[#D9DCD8] text-[11px] font-code">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] font-semibold border ${
            systemStatus === 'Operational'
              ? 'bg-[#2F7D5C]/10 text-[#2F7D5C] border-[#2F7D5C]/30'
              : 'bg-[#B83A3A]/10 text-[#B83A3A] border-[#B83A3A]/30'
          }`}>
            {systemStatus !== 'Operational' && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#B83A3A] animate-pulse" />
            )}
            <span>COMMAND · {systemStatus.toUpperCase()}</span>
          </div>
          {apiError && (
            <span className="text-[10px] text-[#C47F17] bg-[#D9822B]/10 border border-[#D9822B]/30 px-2 py-0.5 rounded-[2px]">
              {apiError}
            </span>
          )}
          <span className="text-[#858C87] hidden sm:inline">
            &ldquo;What is happening across the system right now?&rdquo;
          </span>
        </div>

        {/* Core Product Reasoning Step Indicators */}
        <div className="flex items-center gap-1 font-code text-[10px]">
          <button
            onClick={() => onNavigate('active-incidents')}
            className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#B83A3A]/10 text-[#B83A3A] font-semibold hover:bg-[#B83A3A]/20 transition-colors cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#B83A3A]" />
            1. DETECT
          </button>
          <span className="text-[#858C87]">→</span>
          <button
            onClick={() => onNavigate('root-cause')}
            className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#00535f]/10 text-[#00535f] font-semibold hover:bg-[#00535f]/20 transition-colors cursor-pointer"
          >
            2. EXPLAIN
          </button>
          <span className="text-[#858C87]">→</span>
          <button
            onClick={() => onNavigate('predictions')}
            className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#7C6FA8]/10 text-[#7C6FA8] font-semibold hover:bg-[#7C6FA8]/20 transition-colors cursor-pointer"
          >
            3. PREDICT
          </button>
          <span className="text-[#858C87]">→</span>
          <button
            onClick={() => onNavigate('simulation')}
            className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#286B78]/10 text-[#286B78] font-semibold hover:bg-[#286B78]/20 transition-colors cursor-pointer"
          >
            4. SIMULATE
          </button>
        </div>
      </div>

      {/* COMPACT LIVE TELEMETRY STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 py-2 bg-[#F1F2F0] border-b border-[#D9DCD8] text-[11px] font-code">
        <div className="flex items-center justify-between p-2 bg-white rounded-[3px] border border-[#D9DCD8]">
          <span className="text-[#70797B] uppercase">Services</span>
          <span className="font-bold text-[#171A19]">
            {liveServices ? `${liveServices.length} Active` : '5 Active'}
          </span>
        </div>
        <div className="flex items-center justify-between p-2 bg-white rounded-[3px] border border-[#D9DCD8]">
          <span className="text-[#70797B] uppercase">P99 Latency</span>
          <span className={`font-bold ${maxP99 > 200 ? 'text-[#C47F17]' : 'text-[#2F7D5C]'}`}>
            {Math.round(maxP99)}ms
          </span>
        </div>
        <div className="flex items-center justify-between p-2 bg-white rounded-[3px] border border-[#D9DCD8]">
          <span className="text-[#70797B] uppercase">Error Rate</span>
          <span className={`font-bold ${maxErrorRate > 5 ? 'text-[#B83A3A]' : maxErrorRate > 1 ? 'text-[#C47F17]' : 'text-[#2F7D5C]'}`}>
            {maxErrorRate.toFixed(1)}%{maxErrorRate > 5 ? ' (SLO Breach)' : ''}
          </span>
        </div>
        <div className="flex items-center justify-between p-2 bg-white rounded-[3px] border border-[#D9DCD8]">
          <span className="text-[#70797B] uppercase">Active Queue</span>
          <span className={`font-bold ${activeIncidents.length > 0 ? 'text-[#B83A3A]' : 'text-[#2F7D5C]'}`}>
            {activeIncidents.length > 0 ? `${activeIncidents.length} Incident(s)` : 'All Clear'}
          </span>
        </div>
      </div>

      {/* PRIMARY WORKSPACE: HERO 3D TOPOLOGY + RIGHT PANEL */}
      <div className="flex flex-col xl:flex-row w-full flex-1 border-b border-[#D9DCD8]">
        {/* PROMINENT 3D TOPOLOGY */}
        <div className="flex-1 xl:w-[72%] relative flex flex-col bg-[#0D1113] border-r border-[#1E2428] min-h-[580px] h-[580px]">
          <Topology3D
            selectedNodeId={selectedNodeId}
            onSelectNode={handleSelectNode}
            isIncidentIsolated={isIncidentIsolated}
            onToggleIncidentIsolation={() => setIsIncidentIsolated(!isIncidentIsolated)}
            viewMode={viewMode}
            onToggleViewMode={setViewMode}
            onInvestigate={() => onNavigate('root-cause')}
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full xl:w-[28%] flex flex-col bg-[#FFFFFF] border-t xl:border-t-0 border-[#D9DCD8] min-h-[580px] max-h-[580px] overflow-hidden">
          {/* Header Switcher */}
          <div className="flex items-center border-b border-[#D9DCD8] bg-[#F1F2F0] px-2 pt-1.5 shrink-0">
            <button
              onClick={() => setRightPanelMode('incident')}
              className={`px-3 py-1.5 text-[11px] font-code font-semibold uppercase tracking-wider rounded-t-[3px] transition-colors border-t-2 ${
                rightPanelMode === 'incident'
                  ? 'bg-white text-[#B83A3A] border-[#B83A3A] shadow-xs'
                  : 'text-[#5E6561] border-transparent hover:text-[#171A19]'
              }`}
            >
              Active ({activeIncidents.length})
            </button>
            <button
              onClick={() => setRightPanelMode('service')}
              className={`px-3 py-1.5 text-[11px] font-code font-semibold uppercase tracking-wider rounded-t-[3px] transition-colors border-t-2 ${
                rightPanelMode === 'service'
                  ? 'bg-white text-[#286B78] border-[#286B78] shadow-xs'
                  : 'text-[#5E6561] border-transparent hover:text-[#171A19]'
              }`}
            >
              Service: {selectedService.displayName}
            </button>
          </div>

          {rightPanelMode === 'service' ? (
            <ServiceInspector
              service={selectedService}
              onInvestigateRootCause={() => onNavigate('root-cause')}
              onIsolateSubgraph={() => setIsIncidentIsolated(true)}
            />
          ) : (
            <div className="flex-1 flex flex-col justify-between overflow-y-auto p-4">
              <div>
                {activeIncidents.length === 0 ? (
                  <div className="p-4 bg-[#2F7D5C]/10 border border-[#2F7D5C]/30 rounded-[3px]">
                    <div className="font-code text-[12px] font-bold text-[#2F7D5C]">✓ All Systems Operational</div>
                    <p className="text-[11px] text-[#5E6561] mt-1">No active incidents. Telemetry within normal bounds.</p>
                  </div>
                ) : (
                  <>
                    {/* Active incidents list */}
                    {activeIncidents.slice(0, 2).map((inc) => (
                      <div key={formatIncidentKey(inc)} className="p-3 bg-[#F7F7F5] border border-[#D9DCD8] rounded-[3px] mb-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-code text-[10px] text-[#B83A3A] font-bold uppercase px-1.5 py-0.5 bg-[#B83A3A]/10 rounded-[2px] border border-[#B83A3A]/30">
                            {(inc as any).severity ?? 'HIGH'} · ACTIVE
                          </span>
                          <span className="font-code text-[10px] text-[#70797B]">
                            {(inc as any).openedAt
                              ? new Date((inc as any).openedAt).toLocaleTimeString()
                              : (inc as any).startTime}
                          </span>
                        </div>
                        <div className="font-code text-[12px] font-bold text-[#171A19]">
                          {formatIncidentKey(inc)} — {(inc as any).title}
                        </div>
                        <p className="text-[11px] text-[#5E6561] mt-1 leading-snug">
                          {(inc as any).summary}
                        </p>
                      </div>
                    ))}

                    {/* Impact summary */}
                    <div className="font-section text-[10px] text-[#70797B] font-semibold tracking-wider uppercase mb-1.5">
                      AFFECTED SERVICES
                    </div>
                    <div className="p-2.5 bg-[#F7F7F5] border border-[#D9DCD8] rounded-[3px] font-code text-[11px] space-y-1 mb-3">
                      {degradedCount > 0 ? (
                        liveServices?.filter(s => s.status !== 'healthy').map((s) => (
                          <div key={s.name} className="flex items-center justify-between">
                            <span className={`font-semibold ${s.status === 'critical' ? 'text-[#B83A3A]' : 'text-[#C47F17]'}`}>
                              {s.name}
                            </span>
                            <span className="text-[10px] text-[#70797B]">{Math.round(s.latencyP99)}ms p99</span>
                          </div>
                        )) ?? (
                          activeFault === 'auth-gateway' ? (
                            <>
                              <div className="flex items-center justify-between text-[#B83A3A] font-semibold">
                                <span>auth-gateway (Root JWKS Exhaustion)</span>
                                <span className="text-[10px] text-[#70797B]">1,450ms p99</span>
                              </div>
                              <div className="flex items-center justify-between text-[#B83A3A] font-semibold">
                                <span>inventory-db (Origin Lock Contention)</span>
                                <span className="text-[10px] text-[#70797B]">1,420ms p99</span>
                              </div>
                              <div className="flex items-center justify-between text-[#C47F17]">
                                <span>api-gateway (Downstream 502/504)</span>
                                <span className="text-[10px] text-[#70797B]">842ms p99</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center justify-between text-[#B83A3A] font-semibold">
                                <span>inventory-db (Origin Lock Contention)</span>
                                <span className="text-[10px] text-[#70797B]">1,420ms p99</span>
                              </div>
                              <div className="flex items-center justify-between text-[#C47F17]">
                                <span>order-service (gRPC Pool Saturation)</span>
                                <span className="text-[10px] text-[#70797B]">820ms p99</span>
                              </div>
                              <div className="flex items-center justify-between text-[#C47F17]">
                                <span>api-gateway (Downstream 504 Timeout)</span>
                                <span className="text-[10px] text-[#70797B]">842ms p99</span>
                              </div>
                            </>
                          )
                        )
                      ) : (
                        <div className="text-[#2F7D5C]">All services healthy</div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* CTAs */}
              <div className="pt-3 border-t border-[#D9DCD8] space-y-2">
                <button
                  onClick={() => onNavigate('active-incidents')}
                  className="w-full h-8 px-3 rounded-[3px] bg-white border border-[#D9DCD8] hover:bg-[#F1F2F0] text-[#171A19] font-code text-[11px] font-semibold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>View All Active Incidents ({activeIncidents.length})</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
                <button
                  onClick={() => onNavigate('root-cause')}
                  className="w-full h-8 px-3 rounded-[3px] bg-[#286B78] hover:bg-[#00535f] text-white font-code text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">troubleshoot</span>
                  <span>Investigate Root Cause →</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LOWER OPERATIONAL TELEMETRY RUNWAY */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-[#F1F2F0] border-t border-[#D9DCD8] text-[11px] font-code">
        <div className="flex items-center gap-2 flex-wrap">
          {activeIncidents.length > 0 ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#B83A3A] animate-pulse" />
              <span>
                Active Incident:{' '}
                <strong className="text-[#171A19] font-bold">
                  {formatIncidentKey(activeIncidents[0])} — {(activeIncidents[0] as any).title}
                </strong>
              </span>
              <span className="text-[#D9DCD8]">·</span>
              <span>
                Status:{' '}
                <strong className="text-[#C47F17] font-semibold">
                  {(activeIncidents[0] as any).status}
                </strong>
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-[#2F7D5C]" />
              <span className="text-[#2F7D5C] font-semibold">System Operational — No Active Incidents</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('root-cause')}
            className="px-2.5 py-1 text-[10.5px] bg-[#FFFFFF] border border-[#D9DCD8] text-[#171A19] hover:bg-[#EAECE8] rounded-[2px] transition-colors cursor-pointer font-medium"
          >
            Explain Root Cause →
          </button>
          <button
            onClick={() => onNavigate('simulation')}
            className="px-2.5 py-1 text-[10.5px] bg-[#286B78] hover:bg-[#00535f] text-white rounded-[2px] transition-colors cursor-pointer font-semibold shadow-xs"
          >
            Simulate Intervention →
          </button>
        </div>
      </div>
    </div>
  );
};
