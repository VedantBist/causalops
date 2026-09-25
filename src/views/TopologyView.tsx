import React, { useState } from 'react';
import { Topology3D } from '../components/topology/Topology3D';
import { ServiceInspector } from '../components/topology/ServiceInspector';
import { SERVICES } from '../data/mockData';
import { AppPage } from '../components/layout/AppShell';

interface TopologyViewProps {
  onNavigate: (page: AppPage) => void;
}

export const TopologyView: React.FC<TopologyViewProps> = ({ onNavigate }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('inventory-db');
  const [isIncidentIsolated, setIsIncidentIsolated] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [layersOpen, setLayersOpen] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState({
    observed: true,
    inferred: true,
    predicted: true,
    external: true,
  });

  const selectedService = SERVICES.find((s) => s.id === selectedNodeId) || SERVICES.find((s) => s.id === 'inventory-db')!;

  return (
    <div className="flex flex-col w-full h-[calc(100vh-2.75rem)] overflow-hidden select-none bg-[#090D10] text-[#D8E1E8] font-sans">
      {/* ENTERPRISE TOP SUB-BAR */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-[#FFFFFF] border-b border-[#D9DCD8] text-[11px] font-code text-[#171A19] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#00535f]/10 text-[#00535f] font-semibold border border-[#00535f]/30">
            <span>COMMAND · 3D TOPOLOGY</span>
          </div>
          <div>
            <h1 className="text-[14px] font-bold text-[#171A19]">Service Dependency &amp; Causal Mesh</h1>
            <p className="text-[10.5px] text-[#5E6561]">
              Live propagation path: <span className="font-semibold text-[#B83A3A]">inventory-db</span> → inventory-service → order-service → api-gateway
            </p>
          </div>
        </div>

        {/* Knowledge States Badges */}
        <div className="flex items-center gap-2 font-code text-[10px]">
          <span className="text-[#858C87] uppercase text-[9.5px]">States:</span>
          <span className="px-1.5 py-0.5 rounded-[2px] bg-[#2F7D5C]/10 text-[#2F7D5C] font-semibold border border-[#2F7D5C]/30">
            OBSERVED
          </span>
          <span className="px-1.5 py-0.5 rounded-[2px] bg-[#D9822B]/10 text-[#C47F17] font-semibold border border-[#D9822B]/30">
            CORRELATED
          </span>
          <span className="px-1.5 py-0.5 rounded-[2px] bg-[#B83A3A]/10 text-[#B83A3A] font-semibold border border-[#B83A3A]/30">
            INFERRED
          </span>
          <span className="px-1.5 py-0.5 rounded-[2px] bg-[#7C6FA8]/10 text-[#7C6FA8] font-semibold border border-[#7C6FA8]/30">
            PREDICTED
          </span>
          <span className="px-1.5 py-0.5 rounded-[2px] bg-[#286B78]/10 text-[#286B78] font-semibold border border-[#286B78]/30">
            SIMULATED
          </span>

          <button
            onClick={() => onNavigate('root-cause')}
            className="ml-2 px-2.5 py-1 bg-[#286B78] hover:bg-[#00535f] text-white rounded-[2px] font-semibold transition-colors cursor-pointer shadow-xs"
          >
            Investigate Root Cause →
          </button>
        </div>
      </div>

      {/* MAIN WORKBENCH: CENTRAL TOPOLOGY VIEWPORT + RIGHT INSPECTION DRAWER */}
      <div className="flex flex-1 min-h-0 relative overflow-hidden">
        {/* SPATIAL GRAPH VIEWPORT */}
        <div className="relative flex-1 bg-[#0A0E12] overflow-hidden flex flex-col">
          <Topology3D
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            isIncidentIsolated={isIncidentIsolated}
            onToggleIncidentIsolation={() => setIsIncidentIsolated(!isIncidentIsolated)}
            viewMode={viewMode}
            onToggleViewMode={setViewMode}
            onInvestigate={() => onNavigate('root-cause')}
          />
        </div>

        {/* RIGHT INSPECTOR PANEL (DEDICATED SERVICE INSPECTOR: inventory-db) */}
        <div className="w-[320px] bg-[#FFFFFF] border-l border-[#D9DCD8] flex flex-col shrink-0 z-30 overflow-y-auto">
          <ServiceInspector
            service={selectedService}
            onInvestigateRootCause={() => onNavigate('root-cause')}
            onIsolateSubgraph={() => setIsIncidentIsolated(true)}
          />
        </div>
      </div>

      {/* BOTTOM STATUS & REPLAY SCRUBBER FOOTER STRIP */}
      <div className="h-11 px-4 bg-[#0A0E12] border-t border-[#1C2731] flex flex-wrap items-center justify-between shrink-0 z-30 font-code text-[11px]">
        {/* Left: Architectural Breakdown */}
        <div className="flex items-center gap-2 text-[#778B9C] text-[10px]">
          <span className="font-semibold text-[#9EB0BF]">47 services</span>
          <span className="text-[#324555]">·</span>
          <span>183 dependencies</span>
          <span className="text-[#324555]">·</span>
          <span>11 databases</span>
          <span className="text-[#324555]">·</span>
          <span>6 event streams</span>
        </div>

        {/* Center: Incident INC-8941 Live Aggregation Summary */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-[#141C24] border border-[#233342] rounded-[2px] text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B83A3A] animate-pulse"></span>
          <span className="font-bold text-[#FF9E9E]">INC-8941:</span>
          <span className="text-[#CAD7E2]">1 Active Cascade</span>
          <span className="text-[#324555]">·</span>
          <span className="text-[#FF7D7D] font-semibold">2 Critical</span>
          <span className="text-[#324555]">·</span>
          <span className="text-[#F5BE6B]">2 Degraded</span>
          <span className="text-[#324555]">·</span>
          <span className="text-[#B3A9E2]">6 Predicted</span>
        </div>

        {/* Right: Time-Scrubber Replay Controls */}
        <div className="flex items-center gap-2.5">
          <div className="inline-flex rounded-[2px] bg-[#141F28] border border-[#233545] p-0.5">
            <button
              onClick={() => onNavigate('active-incidents')}
              className="px-1.5 py-0.5 text-[#869CB0] hover:text-white hover:bg-[#1E2E3C] transition-colors rounded-[1px] cursor-pointer"
              title="Jump to Incident Inception (T0)"
            >
              <span className="material-symbols-outlined text-[12px] leading-none">skip_previous</span>
            </button>
            <button
              className="px-1.5 py-0.5 text-[#869CB0] hover:text-white hover:bg-[#1E2E3C] transition-colors rounded-[1px] text-[10px] font-code cursor-pointer"
              title="Step Back 30s"
            >
              -30s
            </button>
            <button
              className="px-2 py-0.5 bg-[#1C2C39] text-[#4CD795] font-semibold rounded-[1px] text-[10px] font-code flex items-center gap-1 cursor-pointer"
              title="Live Stream Mode"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#4CD795]"></span> LIVE
            </button>
          </div>
          <div className="text-[#64798A] text-[10px] hidden sm:block">
            T₀-15m <span className="text-[#A5BACB] font-medium">14:39:22 UTC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
