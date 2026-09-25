import React, { useState } from 'react';
import { Topology3D } from '../components/topology/Topology3D';
import { ServiceInspector } from '../components/topology/ServiceInspector';
import { SERVICES, CORE_INCIDENT } from '../data/mockData';
import { AppPage } from '../components/layout/AppShell';

interface OverviewViewProps {
  onNavigate: (page: AppPage) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigate }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('inventory-db');
  const [isIncidentIsolated, setIsIncidentIsolated] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [showRightInspector, setShowRightInspector] = useState<'incident' | 'service'>('incident');

  const selectedService = SERVICES.find((s) => s.id === selectedNodeId) || SERVICES.find((s) => s.id === 'inventory-db')!;

  const handleSelectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setShowRightInspector('service');
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F7F7F5] select-none font-sans">
      {/* DECLUTTERED SUB-BAR */}
      <div className="flex flex-wrap items-center justify-between px-4 py-1.5 bg-[#F1F2F0] border-b border-[#D9DCD8] text-[11px] font-code text-[#5E6561]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#858C87]">CLUSTER:</span>
          <span className="text-[#171A19] font-medium">us-east-prod-k8s-04</span>
          <span className="text-[#D9DCD8] mx-1">·</span>
          <span className="text-[#858C87]">MESH:</span>
          <span className="text-[#171A19] font-medium">CausalGraph v3.89</span>
          <span className="text-[#D9DCD8] mx-1">·</span>
          <span className="text-[#858C87]">INFERENCE:</span>
          <span className="text-[#2F7D5C] font-medium">Active</span>
          <span className="text-[#D9DCD8] mx-1">·</span>
          <span className="text-[#858C87]">WINDOW:</span>
          <span className="text-[#171A19] font-medium">T₀-15m → LIVE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B83A3A] animate-pulse"></span>
          <span className="text-[#B83A3A] font-semibold tracking-wider uppercase text-[10.5px]">CASCADE IN PROGRESS</span>
        </div>
      </div>

      {/* PRIMARY WORKSTATION GRID: 70% HERO TOPOLOGY + 30% RIGHT INVESTIGATION / INSPECTOR RAIL */}
      <div className="flex flex-col xl:flex-row w-full border-b border-[#D9DCD8]">
        {/* HERO SYSTEM TOPOLOGY VIEWPORT (70%) */}
        <div className="flex-1 xl:w-[70%] relative flex flex-col bg-[#0D1113] border-r border-[#1E2428] min-h-[620px] h-[620px]">
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

        {/* RIGHT RAIL: SWITCHABLE BETWEEN ACTIVE INCIDENT INVESTIGATION & SERVICE INSPECTOR (30%) */}
        <div className="w-full xl:w-[30%] flex flex-col bg-[#FFFFFF] border-t xl:border-t-0 border-[#D9DCD8] min-h-[620px] max-h-[620px] overflow-hidden">
          {/* Tab Selector Header */}
          <div className="flex items-center border-b border-[#D9DCD8] bg-[#F1F2F0] px-2 pt-1.5">
            <button
              onClick={() => setShowRightInspector('incident')}
              className={`px-3 py-1.5 text-[11px] font-code font-semibold uppercase tracking-wider rounded-t-[3px] transition-colors border-t-2 ${
                showRightInspector === 'incident'
                  ? 'bg-white text-[#B83A3A] border-[#B83A3A] shadow-xs'
                  : 'text-[#5E6561] border-transparent hover:text-[#171A19]'
              }`}
            >
              Active Incident
            </button>
            <button
              onClick={() => setShowRightInspector('service')}
              className={`px-3 py-1.5 text-[11px] font-code font-semibold uppercase tracking-wider rounded-t-[3px] transition-colors border-t-2 ${
                showRightInspector === 'service'
                  ? 'bg-white text-[#286B78] border-[#286B78] shadow-xs'
                  : 'text-[#5E6561] border-transparent hover:text-[#171A19]'
              }`}
            >
              Service: {selectedService.displayName}
            </button>
          </div>

          {showRightInspector === 'service' ? (
            <ServiceInspector
              service={selectedService}
              onInvestigateRootCause={() => onNavigate('root-cause')}
              onIsolateSubgraph={() => setIsIncidentIsolated(true)}
            />
          ) : (
            <div className="flex-1 flex flex-col justify-between overflow-y-auto">
              {/* Incident Header */}
              <div className="px-5 py-3 border-b border-[#D9DCD8] bg-[#F7F7F5] flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-4 px-1.5 bg-[#B83A3A] text-white font-code text-[9.5px] leading-4 font-semibold rounded-[2px] uppercase tracking-wider">
                      CRITICAL
                    </span>
                    <span className="font-section text-[10.5px] text-[#5E6561]">
                      ACTIVE INCIDENT #INC-8941
                    </span>
                  </div>
                  <h2 className="text-[16px] text-[#171A19] font-semibold tracking-tight">
                    Database latency cascade
                  </h2>
                </div>
                <button
                  onClick={() => onNavigate('active-incidents')}
                  className="text-primary hover:underline font-code text-[11px] font-medium"
                >
                  Detail →
                </button>
              </div>

              {/* Key Summary Metrics 2x2 Grid */}
              <div className="p-4 border-b border-[#D9DCD8] grid grid-cols-2 gap-2.5 bg-[#FFFFFF]">
                <div className="bg-[#F7F7F5] p-2.5 rounded-[4px] border border-[#D9DCD8]">
                  <div className="font-code text-[9.5px] text-[#858C87] uppercase tracking-wider mb-0.5">Root Cause Candidate</div>
                  <div className="font-code text-[12px] font-semibold text-[#B83A3A] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B83A3A]"></span>
                    <span>inventory-db</span>
                  </div>
                </div>
                <div className="bg-[#F7F7F5] p-2.5 rounded-[4px] border border-[#D9DCD8]">
                  <div className="font-code text-[9.5px] text-[#858C87] uppercase tracking-wider mb-0.5">Model Confidence</div>
                  <div className="font-code text-[12px] font-semibold text-[#00535f] flex items-baseline gap-1">
                    <span>91%</span>
                    <span className="text-[10px] text-[#858C87] font-normal font-code">P(Causal)=0.91</span>
                  </div>
                </div>
                <div className="bg-[#F7F7F5] p-2.5 rounded-[4px] border border-[#D9DCD8]">
                  <div className="font-code text-[9.5px] text-[#858C87] uppercase tracking-wider mb-0.5">Detected At</div>
                  <div className="font-code text-[12px] font-medium text-[#171A19]">
                    14:32:07 UTC
                  </div>
                </div>
                <div className="bg-[#F7F7F5] p-2.5 rounded-[4px] border border-[#D9DCD8]">
                  <div className="font-code text-[9.5px] text-[#858C87] uppercase tracking-wider mb-0.5">Blast Radius</div>
                  <div className="font-code text-[11px] font-medium text-[#B83A3A]">
                    Tier-1 Ingress degraded (4 services)
                  </div>
                </div>
              </div>

              {/* Verified Causal Propagation Lineage */}
              <div className="p-4 flex-1 flex flex-col justify-between overflow-y-auto">
                <div>
                  <div className="font-section text-[10.5px] text-[#858C87] mb-3 font-semibold">
                    VERIFIED CAUSAL PROPAGATION LINEAGE
                  </div>
                  <div className="relative pl-6 space-y-3">
                    {/* Vertical Connecting Spine */}
                    <div className="absolute left-2.5 top-3 bottom-3 w-[1.5px] bg-[#D9DCD8]"></div>

                    {CORE_INCIDENT.steps.map((step) => (
                      <div key={step.step} className="relative">
                        <div
                          className={`absolute -left-[20px] top-1 w-4 h-4 rounded-full bg-white border-2 flex items-center justify-center ${
                            step.status === 'critical' ? 'border-[#B83A3A]' : 'border-[#D9822B]'
                          }`}
                        >
                          <span
                            className={`text-[9px] font-code font-bold ${
                              step.status === 'critical' ? 'text-[#B83A3A]' : 'text-[#D9822B]'
                            }`}
                          >
                            {step.step}
                          </span>
                        </div>
                        <div
                          onClick={() => handleSelectNode(step.serviceId)}
                          className="p-2 rounded-[4px] bg-[#F7F7F5] border border-[#D9DCD8] hover:border-[#286B78] cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between font-code text-[11px]">
                            <span
                              className={`font-semibold ${
                                step.status === 'critical' ? 'text-[#B83A3A]' : 'text-[#171A19]'
                              }`}
                            >
                              {step.serviceName}
                            </span>
                            <span className="text-[#858C87] text-[10px]">{step.offsetSeconds}</span>
                          </div>
                          <div className="text-[11.5px] text-[#5E6561] mt-0.5 leading-snug">
                            {step.summary}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons & Threat Readout */}
                <div className="pt-3 border-t border-[#D9DCD8] space-y-2 mt-3">
                  <button
                    onClick={() => onNavigate('simulation')}
                    className="w-full h-8 px-4 rounded-[3px] bg-[#286b78] text-white font-code text-[11px] font-semibold tracking-wider uppercase hover:bg-[#00535f] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-none"
                  >
                    <span className="material-symbols-outlined text-[15px]">troubleshoot</span>
                    <span>SIMULATE INTERVENTION</span>
                  </button>
                  <div className="flex items-center justify-between text-[11px] font-code pt-0.5">
                    <button
                      onClick={() => onNavigate('simulation')}
                      className="text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[13px]">science</span>
                      <span>View Counterfactual Simulation</span>
                    </button>
                    <span className="text-[#5E6561]">
                      SLA Threat: <strong className="text-[#B83A3A]">High</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* COMPACT SUPPORTING BOTTOM TELEMETRY BAR */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 border-b border-[#D9DCD8] bg-[#F7F7F5]">
        {/* Left: Compact Temporal Sequence (7 Cols) */}
        <div className="lg:col-span-7 p-3 border-b lg:border-b-0 lg:border-r border-[#D9DCD8] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[15px] text-[#00535f]">timeline</span>
              <span className="font-section text-[10.5px] text-[#171A19] font-semibold">
                TEMPORAL CAUSAL SEQUENCE (T₀: 14:32:07 UTC)
              </span>
            </div>
            <div className="font-code text-[10px] text-[#858C87]">
              Granularity: 100ms
            </div>
          </div>

          {/* 4 Milestones Connected Timeline Track */}
          <div className="relative pt-1 pb-1">
            <div className="absolute left-2.5 right-2.5 top-3 h-0.5 bg-[#D9DCD8]"></div>
            <div className="grid grid-cols-4 gap-2 relative">
              {/* Milestone 1 */}
              <div
                onClick={() => handleSelectNode('inventory-db')}
                className="flex flex-col cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B83A3A] ring-2 ring-[#B83A3A]/20"></span>
                  <span className="font-code text-[9.5px] font-semibold text-[#B83A3A]">14:32:07</span>
                </div>
                <div className="bg-[#FFFFFF] p-1.5 rounded-[3px] border border-[#D9DCD8] group-hover:border-[#B83A3A] transition-colors text-[10.5px]">
                  <div className="font-code font-semibold text-[#171A19] truncate">inventory-db</div>
                  <div className="text-[#5E6561] text-[9.5px] truncate">Disk I/O stall</div>
                </div>
              </div>

              {/* Milestone 2 */}
              <div
                onClick={() => handleSelectNode('inventory-service')}
                className="flex flex-col cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B83A3A]"></span>
                  <span className="font-code text-[9.5px] font-medium text-[#5E6561]">14:32:09</span>
                </div>
                <div className="bg-[#FFFFFF] p-1.5 rounded-[3px] border border-[#D9DCD8] group-hover:border-[#B83A3A] transition-colors text-[10.5px]">
                  <div className="font-code font-semibold text-[#171A19] truncate">inventory-svc</div>
                  <div className="text-[#5E6561] text-[9.5px] truncate">Pool wait 480ms</div>
                </div>
              </div>

              {/* Milestone 3 */}
              <div
                onClick={() => handleSelectNode('order-service')}
                className="flex flex-col cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B83A3A]"></span>
                  <span className="font-code text-[9.5px] font-medium text-[#5E6561]">14:32:12</span>
                </div>
                <div className="bg-[#FFFFFF] p-1.5 rounded-[3px] border border-[#D9DCD8] group-hover:border-[#B83A3A] transition-colors text-[10.5px]">
                  <div className="font-code font-semibold text-[#171A19] truncate">order-service</div>
                  <div className="text-[#5E6561] text-[9.5px] truncate">P99: 820ms timeout</div>
                </div>
              </div>

              {/* Milestone 4 */}
              <div
                onClick={() => handleSelectNode('api-gateway')}
                className="flex flex-col cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B83A3A]"></span>
                  <span className="font-code text-[9.5px] font-semibold text-[#B83A3A]">14:32:14</span>
                </div>
                <div className="bg-[#FFFFFF] p-1.5 rounded-[3px] border border-[#D9DCD8] group-hover:border-[#B83A3A] transition-colors text-[10.5px]">
                  <div className="font-code font-semibold text-[#171A19] truncate">api-gateway</div>
                  <div className="text-[#5E6561] text-[9.5px] truncate">504s triggered</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Supporting Sparkline Micro-Metrics (5 Cols) */}
        <div className="lg:col-span-5 p-3 grid grid-cols-3 gap-2.5 bg-[#F1F2F0]">
          {/* P99 Latency */}
          <div
            onClick={() => onNavigate('metrics')}
            className="p-2 bg-[#FFFFFF] rounded-[3px] border border-[#D9DCD8] hover:border-[#286B78] cursor-pointer flex flex-col justify-between transition-colors"
          >
            <div>
              <div className="flex items-center justify-between text-[9.5px] font-code text-[#858C87] uppercase mb-0.5">
                <span>P99 Latency</span>
                <span className="text-[#B7791F] font-semibold">WARN</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-metric text-[18px] font-semibold text-[#171A19]">842</span>
                <span className="font-code text-[10px] text-[#858C87]">ms</span>
              </div>
              <div className="text-[9.5px] font-code text-[#B7791F]">↑ 312%</div>
            </div>
            <div className="mt-1 pt-1 border-t border-[#D9DCD8]/50">
              <svg className="w-full h-5" fill="none" viewBox="0 0 100 24">
                <path d="M 0 19 L 25 18 L 50 19 L 65 15 L 80 7 L 100 3" stroke="#B7791F" strokeLinecap="round" strokeWidth="1.5"></path>
              </svg>
            </div>
          </div>

          {/* Error Rate */}
          <div
            onClick={() => onNavigate('metrics')}
            className="p-2 bg-[#FFFFFF] rounded-[3px] border border-[#D9DCD8] hover:border-[#B83A3A] cursor-pointer flex flex-col justify-between transition-colors"
          >
            <div>
              <div className="flex items-center justify-between text-[9.5px] font-code text-[#858C87] uppercase mb-0.5">
                <span>Error Rate</span>
                <span className="text-[#B83A3A] font-semibold">CRIT</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-metric text-[18px] font-semibold text-[#B83A3A]">7.2</span>
                <span className="font-code text-[10px] text-[#858C87]">%</span>
              </div>
              <div className="text-[9.5px] font-code text-[#B83A3A]">↑ 4.1% over SLO</div>
            </div>
            <div className="mt-1 pt-1 border-t border-[#D9DCD8]/50">
              <svg className="w-full h-5" fill="none" viewBox="0 0 100 24">
                <path d="M 0 21 L 40 21 L 65 19 L 75 9 L 100 3" stroke="#B83A3A" strokeLinecap="round" strokeWidth="1.5"></path>
              </svg>
            </div>
          </div>

          {/* Throughput */}
          <div
            onClick={() => onNavigate('metrics')}
            className="p-2 bg-[#FFFFFF] rounded-[3px] border border-[#D9DCD8] hover:border-[#2F7D5C] cursor-pointer flex flex-col justify-between transition-colors"
          >
            <div>
              <div className="flex items-center justify-between text-[9.5px] font-code text-[#858C87] uppercase mb-0.5">
                <span>Throughput</span>
                <span className="text-[#2F7D5C] font-semibold">NOM</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-metric text-[18px] font-semibold text-[#171A19]">18.4</span>
                <span className="font-code text-[10px] text-[#858C87]">k/m</span>
              </div>
              <div className="text-[9.5px] font-code text-[#2F7D5C]">Nominal</div>
            </div>
            <div className="mt-1 pt-1 border-t border-[#D9DCD8]/50">
              <svg className="w-full h-5" fill="none" viewBox="0 0 100 24">
                <path d="M 0 12 L 25 10 L 50 13 L 75 10 L 100 12" stroke="#2F7D5C" strokeLinecap="round" strokeWidth="1.5"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* OPERATIONAL FOOTER BANNER */}
      <div className="px-4 py-2 bg-[#F1F2F0] flex flex-wrap items-center justify-between gap-y-2 text-[11px] font-code text-[#5E6561]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-2 h-2 rounded-full bg-[#B83A3A]"></span>
          <span>
            Target: <strong className="text-[#171A19] font-medium">inventory-db.cluster-east.internal:5432</strong>
          </span>
          <span className="text-[#D9DCD8]">·</span>
          <span>
            Status: <strong className="text-[#B83A3A] font-medium">High Lock Contention</strong>
          </span>
          <span className="text-[#D9DCD8]">·</span>
          <span>
            RECOMMENDED INTERVENTION:{' '}
            <span className="text-[#171A19] font-medium">Kill Idle Transactions (&gt;30s) or Failover Read Replica</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('simulation')}
            className="px-2.5 py-1 bg-[#171A19] text-white hover:bg-[#286b78] font-code text-[10.5px] font-semibold rounded-[3px] transition-colors cursor-pointer"
          >
            SIMULATE INTERVENTION
          </button>
          <button
            onClick={() => onNavigate('root-cause')}
            className="px-2.5 py-1 bg-white border border-[#D9DCD8] text-[#171A19] hover:bg-[#EAECE8] font-code text-[10.5px] font-medium rounded-[3px] transition-colors cursor-pointer"
          >
            VIEW RUNBOOK
          </button>
        </div>
      </div>
    </div>
  );
};
