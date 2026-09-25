import React, { useState } from 'react';
import { Topology3D } from '../components/topology/Topology3D';
import { ServiceInspector } from '../components/topology/ServiceInspector';
import { SERVICES, CORE_INCIDENT, ACTIVE_INCIDENTS } from '../data/mockData';
import { AppPage } from '../components/layout/AppShell';

interface OverviewViewProps {
  onNavigate: (page: AppPage) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigate }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('inventory-db');
  const [isIncidentIsolated, setIsIncidentIsolated] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [rightPanelMode, setRightPanelMode] = useState<'incident' | 'service'>('incident');

  const selectedService =
    SERVICES.find((s) => s.id === selectedNodeId) || SERVICES.find((s) => s.id === 'inventory-db')!;

  const handleSelectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setRightPanelMode('service');
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F7F7F5] select-none font-sans text-[#171A19]">
      {/* COMMAND CENTER SUB-BAR & REAL-TIME REASONING PIPELINE */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-[#FFFFFF] border-b border-[#D9DCD8] text-[11px] font-code">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#00535f]/10 text-[#00535f] font-semibold border border-[#00535f]/30">
            <span>COMMAND · FLEET OVERVIEW</span>
          </div>
          <span className="text-[#858C87] hidden sm:inline">
            &ldquo;What is happening across the system right now?&rdquo;
          </span>
        </div>

        {/* Core Product Reasoning Step Indicators */}
        <div className="flex items-center gap-1 font-code text-[10px]">
          <button
            onClick={() => onNavigate('active-incidents')}
            className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#B83A3A]/10 text-[#B83A3A] font-semibold hover:bg-[#B83A3A]/20 transition-colors cursor-pointer"
            title="Step 1: Detect Active Incidents"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#B83A3A]"></span>
            <span>1. DETECT (Active)</span>
          </button>
          <span className="text-[#858C87]">→</span>
          <button
            onClick={() => onNavigate('root-cause')}
            className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#00535f]/10 text-[#00535f] font-semibold hover:bg-[#00535f]/20 transition-colors cursor-pointer"
            title="Step 2: Explain Root Cause"
          >
            <span>2. EXPLAIN (Root Cause)</span>
          </button>
          <span className="text-[#858C87]">→</span>
          <button
            onClick={() => onNavigate('predictions')}
            className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#3B82F6]/10 text-[#3B82F6] font-semibold hover:bg-[#3B82F6]/20 transition-colors cursor-pointer"
            title="Step 3: Predict Cascades"
          >
            <span>3. PREDICT</span>
          </button>
          <span className="text-[#858C87]">→</span>
          <button
            onClick={() => onNavigate('simulation')}
            className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#EC4899]/10 text-[#EC4899] font-semibold hover:bg-[#EC4899]/20 transition-colors cursor-pointer"
            title="Step 4: Simulate Counterfactuals"
          >
            <span>4. SIMULATE</span>
          </button>
        </div>
      </div>

      {/* COMPACT TELEMETRY STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 py-2 bg-[#F1F2F0] border-b border-[#D9DCD8] text-[11px] font-code">
        <div className="flex items-center justify-between p-2 bg-white rounded-[3px] border border-[#D9DCD8]">
          <span className="text-[#70797B] uppercase">Fleet Services</span>
          <span className="font-bold text-[#171A19]">47 Monitored · 183 Deps</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-white rounded-[3px] border border-[#D9DCD8]">
          <span className="text-[#70797B] uppercase">P99 Latency</span>
          <span className="font-bold text-[#C47F17]">842ms (↑ 312%)</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-white rounded-[3px] border border-[#D9DCD8]">
          <span className="text-[#70797B] uppercase">Error Rate</span>
          <span className="font-bold text-[#B83A3A]">7.2% (SLO Breach)</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-white rounded-[3px] border border-[#D9DCD8]">
          <span className="text-[#70797B] uppercase">Active Queue</span>
          <span className="font-bold text-[#B83A3A]">3 Incidents (1 Critical)</span>
        </div>
      </div>

      {/* PRIMARY WORKSPACE: 72% HERO 3D TOPOLOGY + 28% SYSTEM INSPECTOR & INCIDENT SUMMARY */}
      <div className="flex flex-col xl:flex-row w-full flex-1 border-b border-[#D9DCD8]">
        {/* PROMINENT 3D TOPOLOGY (LIVE CAUSAL PROPAGATION DOMINANT) */}
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

        {/* RIGHT PANEL: CONCISE ACTIVE INCIDENT SUMMARY OR SERVICE INSPECTOR */}
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
              Active Incident ({ACTIVE_INCIDENTS.length})
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
                {/* Active Incident Header */}
                <div className="p-3 bg-[#F7F7F5] border border-[#D9DCD8] rounded-[3px] mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-code text-[10px] text-[#B83A3A] font-bold uppercase px-1.5 py-0.2 bg-[#B83A3A]/10 rounded-[2px] border border-[#B83A3A]/30">
                      SEV-1 · CRITICAL
                    </span>
                    <span className="font-code text-[10.5px] text-[#70797B]">
                      Started {CORE_INCIDENT.detectedAt}
                    </span>
                  </div>
                  <div className="font-code text-[14px] font-bold text-[#171A19]">
                    {CORE_INCIDENT.id} — {CORE_INCIDENT.title}
                  </div>
                  <p className="text-[12px] text-[#5E6561] mt-1 leading-snug">
                    {CORE_INCIDENT.summary}
                  </p>
                </div>

                {/* Current Impact Synopsis */}
                <div className="font-section text-[10px] text-[#70797B] font-semibold tracking-wider uppercase mb-1.5">
                  CURRENT CASCADE IMPACT
                </div>
                <div className="grid grid-cols-2 gap-2 font-code text-[11px] mb-3">
                  <div className="p-2 rounded-[3px] bg-[#F7F7F5] border border-[#D9DCD8]">
                    <div className="text-[9.5px] text-[#70797B] uppercase">Blast Radius</div>
                    <div className="text-[13px] font-bold text-[#B83A3A] mt-0.5">
                      4 Services Degraded
                    </div>
                  </div>
                  <div className="p-2 rounded-[3px] bg-[#F7F7F5] border border-[#D9DCD8]">
                    <div className="text-[9.5px] text-[#70797B] uppercase">Users Impacted</div>
                    <div className="text-[13px] font-bold text-[#171A19] mt-0.5">
                      14,200 active
                    </div>
                  </div>
                </div>

                {/* Active Causal Path Summary */}
                <div className="font-section text-[10px] text-[#70797B] font-semibold tracking-wider uppercase mb-1.5">
                  ACTIVE PROPAGATION PATH
                </div>
                <div className="p-2.5 bg-[#F7F7F5] border border-[#D9DCD8] rounded-[3px] font-code text-[11px] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#B83A3A] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#B83A3A]"></span>
                    <span>inventory-db (Origin Lock Contention)</span>
                  </div>
                  <div className="pl-3.5 text-[#70797B] text-[10px]">↓ +2.1s pool exhaustion</div>
                  <div className="flex items-center gap-1.5 text-[#C47F17] font-semibold pl-2">
                    <span>inventory-service</span>
                  </div>
                  <div className="pl-3.5 text-[#70797B] text-[10px]">↓ +4.8s synchronous gRPC timeout</div>
                  <div className="flex items-center gap-1.5 text-[#C47F17] font-semibold pl-2">
                    <span>order-service</span>
                  </div>
                  <div className="pl-3.5 text-[#70797B] text-[10px]">↓ +7.2s 504 Gateway Timeouts</div>
                  <div className="flex items-center gap-1.5 text-[#B83A3A] font-bold pl-2">
                    <span>api-gateway (Error Rate: 7.2%)</span>
                  </div>
                </div>
              </div>

              {/* Clear Progressive CTAs */}
              <div className="pt-3 border-t border-[#D9DCD8] space-y-2">
                <button
                  onClick={() => onNavigate('active-incidents')}
                  className="w-full h-8 px-3 rounded-[3px] bg-white border border-[#D9DCD8] hover:bg-[#F1F2F0] text-[#171A19] font-code text-[11px] font-semibold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>View All Active Incidents Queue (3)</span>
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

      {/* LOWER OPERATIONAL TELEMETRY & CAUSAL FLOW RUNWAY */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-[#F1F2F0] border-t border-[#D9DCD8] text-[11px] font-code">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-2 h-2 rounded-full bg-[#B83A3A] animate-pulse"></span>
          <span>
            Active Incident Focus:{' '}
            <strong className="text-[#171A19] font-bold">INC-8941 (Database Latency Cascade)</strong>
          </span>
          <span className="text-[#D9DCD8]">·</span>
          <span>
            Target Node:{' '}
            <strong className="text-[#00535f] font-semibold">inventory-db.cluster-east.internal:5432</strong>
          </span>
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
