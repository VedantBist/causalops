import React, { useState } from 'react';
import { SERVICES } from '../data/mockData';
import { ServiceNode, ServiceStatus, ServiceType, CausalRole } from '../types';
import { AppPage } from '../components/layout/AppShell';

interface ServicesViewProps {
  onNavigate: (page: AppPage) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ onNavigate }) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>('inventory-service');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [causalFilter, setCausalFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'risk' | 'latency' | 'name'>('risk');

  const selectedService = SERVICES.find((s) => s.id === selectedServiceId) || SERVICES[0];

  // Filter logic
  const filteredServices = SERVICES.filter((s) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q) || s.displayName.toLowerCase().includes(q);
      const matchTech = s.tech.toLowerCase().includes(q);
      const matchType = s.type.toLowerCase().includes(q);
      if (!matchName && !matchTech && !matchType) return false;
    }
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (typeFilter !== 'all' && s.type.toLowerCase() !== typeFilter.toLowerCase()) return false;
    if (causalFilter !== 'all') {
      if (causalFilter === 'incident_root' && s.causalRole !== 'incident_root') return false;
      if (causalFilter === 'affected' && s.causalRole !== 'affected') return false;
      if (causalFilter === 'downstream' && s.causalRole !== 'downstream') return false;
      if (causalFilter === 'unaffected' && s.causalRole !== 'unaffected') return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortField === 'risk') {
      const rank: Record<ServiceStatus, number> = { critical: 4, degraded: 3, warning: 2, predicted: 1, healthy: 0 };
      return rank[b.status] - rank[a.status];
    }
    if (sortField === 'latency') return b.latencyP99 - a.latencyP99;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="flex flex-col w-full font-sans text-[#171A19] p-4 bg-[#F7F7F5] select-text">
      {/* 2-Column Split Workspace */}
      <div className="flex flex-col xl:flex-row w-full gap-3 items-start">
        {/* PRIMARY FLEET WORKSPACE (Left ~68%) */}
        <div className="flex flex-col flex-1 min-w-0 bg-white p-4 border border-[#D9DCD8] rounded-[3px] shadow-xs">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between pb-2 border-b border-[#D9DCD8] gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-[16px] text-[#171A19] font-bold uppercase tracking-tight">Service Fleet</span>
              <span className="font-code text-[10.5px] text-[#70797B] font-medium">
                47 MONITORED UNITS · 183 ACTIVE DEPENDENCY EDGES
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-code text-[10px] text-[#70797B]">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00535f]"></span>
              <span>SYNC INTERVAL: 1,000ms</span>
            </div>
          </div>

          {/* Segmented Fleet Health Bar */}
          <div className="py-3 border-b border-[#D9DCD8] space-y-2">
            <div className="flex items-center justify-between font-code text-[11px] flex-wrap gap-2">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[#171A19]">
                  <span className="w-2 h-2 rounded-[2px] bg-[#2F7D5C]"></span>
                  <strong className="font-semibold">39</strong> Healthy
                </span>
                <span className="inline-flex items-center gap-1.5 text-[#171A19]">
                  <span className="w-2 h-2 rounded-[2px] bg-[#D9822B]"></span>
                  <strong className="font-semibold">5</strong> Degraded
                </span>
                <span className="inline-flex items-center gap-1.5 text-[#171A19]">
                  <span className="w-2 h-2 rounded-[2px] bg-[#B7791F]"></span>
                  <strong className="font-semibold">2</strong> Warning
                </span>
                <span className="inline-flex items-center gap-1.5 text-[#B83A3A]">
                  <span className="w-2 h-2 rounded-[2px] bg-[#B83A3A]"></span>
                  <strong className="font-semibold">1</strong> Critical (ROOT CAUSE INC-8941)
                </span>
              </div>
              <span className="text-[#70797B] font-code text-[10px]">47 / 47 RESPONDING</span>
            </div>

            {/* Proportional Segmented Stacked Bar */}
            <div className="h-2 w-full flex rounded-[2px] overflow-hidden bg-[#EAECE8]">
              <div className="h-full bg-[#2F7D5C]" style={{ width: '82.97%' }} title="39 Healthy Services (83%)"></div>
              <div className="h-full bg-[#D9822B]" style={{ width: '10.64%' }} title="5 Degraded Services"></div>
              <div className="h-full bg-[#B7791F]" style={{ width: '4.25%' }} title="2 Warning Services"></div>
              <div className="h-full bg-[#B83A3A]" style={{ width: '2.14%' }} title="1 Critical Service (Root Cause)"></div>
            </div>

            {/* Evaluation Principle Callout */}
            <div className="pt-1 flex items-start gap-1.5 text-[#5E6561] font-code text-[10.5px] leading-tight">
              <span className="material-symbols-outlined text-[14px] text-[#00535f] shrink-0 mt-0.5">schema</span>
              <span>
                <strong className="text-[#00535f] font-semibold">EVALUATION PRINCIPLE:</strong> Local health decoupled from dependency health. Services with nominal local telemetry may carry high predicted degradation risk due to upstream causal lineage.
              </span>
            </div>
          </div>

          {/* Filters & Slices Toolbar */}
          <div className="py-2.5 space-y-2 border-b border-[#D9DCD8]">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="flex-1 min-w-[240px] flex items-center bg-[#F7F7F5] px-2 py-1 rounded-[2px] border border-[#D9DCD8]">
                <span className="material-symbols-outlined text-[16px] text-[#70797B] mr-1.5">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search services by name, tech, tier, or causal state..."
                  className="w-full bg-transparent border-0 p-0 text-[#171A19] font-code text-[11px] placeholder-[#70797B] focus:outline-none"
                />
                <span className="font-code text-[9.5px] text-[#70797B] bg-[#EAECE8] px-1 py-0.5 rounded">⌘K</span>
              </div>

              {/* Sort Controls */}
              <button
                onClick={() => setSortField(sortField === 'risk' ? 'latency' : sortField === 'latency' ? 'name' : 'risk')}
                className="flex items-center gap-1 px-2 py-1 rounded-[2px] bg-[#F7F7F5] hover:bg-[#EAECE8] text-[#171A19] border border-[#D9DCD8] font-code text-[10.5px] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px] text-[#00535f]">swap_vert</span>
                <span>Sort: {sortField === 'risk' ? 'Causal Risk (Desc)' : sortField === 'latency' ? 'P99 Latency' : 'Service Name'}</span>
              </button>
            </div>

            {/* Filter Chips Matrix */}
            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 pt-0.5 font-code text-[10.5px]">
              {/* Status */}
              <div className="flex items-center gap-1">
                <span className="text-[#70797B] uppercase tracking-wider text-[9.5px] font-semibold mr-1">STATUS:</span>
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-1.5 py-0.5 rounded-[2px] cursor-pointer ${
                    statusFilter === 'all' ? 'bg-[#171A19] text-white font-semibold' : 'bg-[#F7F7F5] text-[#5E6561]'
                  }`}
                >
                  All (47)
                </button>
                <button
                  onClick={() => setStatusFilter('healthy')}
                  className={`px-1.5 py-0.5 rounded-[2px] cursor-pointer ${
                    statusFilter === 'healthy' ? 'bg-[#2F7D5C] text-white font-semibold' : 'bg-[#F7F7F5] text-[#2F7D5C]'
                  }`}
                >
                  Healthy (39)
                </button>
                <button
                  onClick={() => setStatusFilter('degraded')}
                  className={`px-1.5 py-0.5 rounded-[2px] cursor-pointer ${
                    statusFilter === 'degraded' ? 'bg-[#D9822B] text-white font-semibold' : 'bg-[#F7F7F5] text-[#D9822B]'
                  }`}
                >
                  Degraded (5)
                </button>
                <button
                  onClick={() => setStatusFilter('critical')}
                  className={`px-1.5 py-0.5 rounded-[2px] cursor-pointer ${
                    statusFilter === 'critical' ? 'bg-[#B83A3A] text-white font-semibold' : 'bg-[#B83A3A]/10 text-[#B83A3A] font-semibold'
                  }`}
                >
                  Critical (1)
                </button>
              </div>

              <span className="text-[#D9DCD8]">|</span>

              {/* Causal Group */}
              <div className="flex items-center gap-1">
                <span className="text-[#70797B] uppercase tracking-wider text-[9.5px] font-semibold mr-1">CAUSAL:</span>
                <button
                  onClick={() => setCausalFilter('all')}
                  className={`px-1.5 py-0.5 rounded-[2px] cursor-pointer ${
                    causalFilter === 'all' ? 'bg-[#171A19] text-white font-semibold' : 'bg-[#F7F7F5] text-[#5E6561]'
                  }`}
                >
                  All States
                </button>
                <button
                  onClick={() => setCausalFilter('incident_root')}
                  className={`px-1.5 py-0.5 rounded-[2px] cursor-pointer ${
                    causalFilter === 'incident_root' ? 'bg-[#B83A3A] text-white font-semibold' : 'text-[#B83A3A]'
                  }`}
                >
                  Incident Root (1)
                </button>
                <button
                  onClick={() => setCausalFilter('affected')}
                  className={`px-1.5 py-0.5 rounded-[2px] cursor-pointer ${
                    causalFilter === 'affected' ? 'bg-[#D9822B] text-white font-semibold' : 'text-[#D9822B]'
                  }`}
                >
                  Affected (2)
                </button>
                <button
                  onClick={() => setCausalFilter('downstream')}
                  className={`px-1.5 py-0.5 rounded-[2px] cursor-pointer ${
                    causalFilter === 'downstream' ? 'bg-[#00535f] text-white font-semibold' : 'text-[#00535f]'
                  }`}
                >
                  Downstream (2)
                </button>
              </div>
            </div>
          </div>

          {/* High-Density Fleet Inventory Table */}
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left border-collapse font-code text-[11px]">
              <thead>
                <tr className="bg-[#F1F2F0] border-b border-[#D9DCD8] text-[#70797B] uppercase tracking-wider text-[10px]">
                  <th className="py-2 px-2.5 font-medium">SERVICE</th>
                  <th className="py-2 px-2 font-medium">TYPE</th>
                  <th className="py-2 px-2 font-medium">STATUS</th>
                  <th className="py-2 px-2 font-medium text-right">P99 LATENCY</th>
                  <th className="py-2 px-2 font-medium text-right">ERROR %</th>
                  <th className="py-2 px-2 font-medium text-right">TRAFFIC</th>
                  <th className="py-2 px-2 font-medium">DEPENDENCY STATE</th>
                  <th className="py-2 px-2 font-medium">CAUSAL STATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9DCD8]">
                {filteredServices.map((service) => {
                  const isSelected = service.id === selectedServiceId;
                  const isRoot = service.id === 'inventory-db';

                  return (
                    <tr
                      key={service.id}
                      onClick={() => setSelectedServiceId(service.id)}
                      className={`hover:bg-[#F7F7F5] transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#E9EDE9] border-l-4 border-l-[#00535f]'
                          : isRoot
                          ? 'bg-[#B83A3A]/5'
                          : ''
                      }`}
                    >
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              service.status === 'critical'
                                ? 'bg-[#B83A3A] animate-ping'
                                : service.status === 'degraded'
                                ? 'bg-[#D9822B]'
                                : service.status === 'warning'
                                ? 'bg-[#B7791F]'
                                : service.status === 'predicted'
                                ? 'bg-[#7C6FA8]'
                                : 'bg-[#2F7D5C]'
                            }`}
                          ></span>
                          <span className={`font-semibold ${isSelected ? 'text-[#00535f]' : 'text-[#171A19]'}`}>
                            {service.displayName}
                          </span>
                          <span className="text-[9.5px] text-[#70797B] px-1 rounded bg-[#EAECE8]">
                            {service.tech.split('·')[0]}
                          </span>
                          {isSelected && (
                            <span className="material-symbols-outlined text-[13px] text-[#00535f]">arrow_right</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-[#5E6561]">{service.type}</td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] font-semibold text-[9.5px] uppercase ${
                            service.status === 'critical'
                              ? 'bg-[#B83A3A]/10 text-[#B83A3A]'
                              : service.status === 'degraded'
                              ? 'bg-[#D9822B]/10 text-[#D9822B]'
                              : service.status === 'warning'
                              ? 'bg-[#B7791F]/10 text-[#B7791F]'
                              : service.status === 'predicted'
                              ? 'bg-[#7C6FA8]/10 text-[#7C6FA8]'
                              : 'bg-[#2F7D5C]/10 text-[#2F7D5C]'
                          }`}
                        >
                          <span className="w-1 h-1 rounded-full bg-current"></span>
                          {service.status}
                        </span>
                      </td>
                      <td
                        className={`py-2 px-2 text-right whitespace-nowrap font-medium ${
                          service.latencyP99 > 500 ? 'text-[#B83A3A]' : 'text-[#171A19]'
                        }`}
                      >
                        {service.latencyP99 >= 1000 ? `${(service.latencyP99 / 1000).toFixed(2)} s` : `${service.latencyP99} ms`}
                        {service.latencyP99 > service.baselineLatency && (
                          <span className="text-[9.5px] text-[#B83A3A] font-normal ml-1">
                            (Δ +{service.latencyP99 - service.baselineLatency}ms)
                          </span>
                        )}
                      </td>
                      <td
                        className={`py-2 px-2 text-right font-medium ${
                          service.errorRate > 1 ? 'text-[#B83A3A]' : 'text-[#5E6561]'
                        }`}
                      >
                        {service.errorRate}%
                      </td>
                      <td className="py-2 px-2 text-right text-[#5E6561] whitespace-nowrap">{service.throughput}</td>
                      <td className="py-2 px-2 whitespace-nowrap text-[#5E6561]">
                        {service.upstreamDeps.length > 0 ? (
                          <span>{service.upstreamDeps[0]}</span>
                        ) : (
                          <span className="text-[#858C87]">None (Origin)</span>
                        )}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        {isRoot ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-[#B83A3A] text-white font-semibold text-[9.5px]">
                            <span className="material-symbols-outlined text-[12px]">crisis_alert</span>
                            ROOT CAUSE (INC-8941)
                          </span>
                        ) : service.causalRole === 'affected' ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-[#D9822B]/20 text-[#8C5209] font-medium text-[9.5px]">
                            <span className="material-symbols-outlined text-[12px]">sync_problem</span>
                            Affected ({service.propagationDelay})
                          </span>
                        ) : service.causalRole === 'downstream' ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-[#00535f]/10 text-[#00535f] font-medium text-[9.5px]">
                            <span className="material-symbols-outlined text-[12px]">call_split</span>
                            Downstream impact
                          </span>
                        ) : (
                          <span className="text-[#858C87] text-[10px]">Unaffected</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="mt-3 pt-2 border-t border-[#D9DCD8] flex items-center justify-between font-code text-[10.5px] text-[#70797B]">
            <span>SHOWING {filteredServices.length} OF 47 SERVICES</span>
            <div className="flex items-center gap-1">
              <span>PAGE 1 OF 1</span>
              <button className="px-2 py-0.5 rounded bg-[#F1F2F0] text-[#171A19] cursor-pointer">PREV</button>
              <button className="px-2 py-0.5 rounded bg-[#F1F2F0] text-[#171A19] cursor-pointer">NEXT</button>
            </div>
          </div>
        </div>

        {/* SELECTED SERVICE INSPECTOR DRAWER (Right ~32%) */}
        <div className="w-full xl:w-[380px] shrink-0 flex flex-col bg-white border border-[#D9DCD8] rounded-[3px] shadow-xs divide-y divide-[#D9DCD8]">
          <div className="p-3 bg-[#F1F2F0]">
            <div className="flex items-center justify-between">
              <span className="font-section text-[10px] text-[#70797B] uppercase tracking-wider font-semibold">
                SERVICE INSPECTOR
              </span>
              <span
                className={`font-code text-[10px] px-1.5 py-0.5 rounded-[2px] font-semibold border flex items-center gap-1 uppercase ${
                  selectedService.status === 'critical'
                    ? 'bg-[#B83A3A]/10 text-[#B83A3A] border-[#B83A3A]/30'
                    : selectedService.status === 'degraded'
                    ? 'bg-[#D9822B]/10 text-[#D9822B] border-[#D9822B]/30'
                    : 'bg-[#2F7D5C]/10 text-[#2F7D5C] border-[#2F7D5C]/30'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                {selectedService.status}
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-[17px] font-bold text-[#171A19] tracking-tight uppercase">
                {selectedService.displayName}
              </span>
            </div>
            <div className="mt-0.5 font-code text-[10px] text-[#5E6561] flex items-center gap-1.5">
              <span>{selectedService.type}</span>
              <span>·</span>
              <span>{selectedService.tech}</span>
              <span>·</span>
              <span>{selectedService.region}</span>
            </div>
          </div>

          {/* Core Telemetry 2x2 Grid */}
          <div className="p-3 grid grid-cols-2 gap-2 bg-white">
            <div className="p-2 bg-[#F7F7F5] rounded-[2px] border border-[#D9DCD8]">
              <div className="font-section text-[9px] text-[#70797B] uppercase">P99 LATENCY</div>
              <div className="font-metric text-[18px] font-bold text-[#B83A3A] mt-0.5">
                {selectedService.latencyP99} <span className="font-code text-[10.5px] font-normal">ms</span>
              </div>
              <div className="font-code text-[9px] text-[#B83A3A] font-medium mt-0.5">
                Δ +{Math.round(((selectedService.latencyP99 - selectedService.baselineLatency) / selectedService.baselineLatency) * 100)}% (Base: {selectedService.baselineLatency}ms)
              </div>
            </div>

            <div className="p-2 bg-[#F7F7F5] rounded-[2px] border border-[#D9DCD8]">
              <div className="font-section text-[9px] text-[#70797B] uppercase">ERROR RATE</div>
              <div className="font-metric text-[18px] font-bold text-[#B83A3A] mt-0.5">
                {selectedService.errorRate} <span className="font-code text-[10.5px] font-normal">%</span>
              </div>
              <div className="font-code text-[9px] text-[#B83A3A] font-medium mt-0.5">Threshold &gt; 1.0%</div>
            </div>

            <div className="p-2 bg-[#F7F7F5] rounded-[2px] border border-[#D9DCD8]">
              <div className="font-section text-[9px] text-[#70797B] uppercase">THROUGHPUT</div>
              <div className="font-metric text-[18px] font-bold text-[#171A19] mt-0.5">
                {selectedService.throughput.split(' ')[0]} <span className="font-code text-[10.5px] font-normal">{selectedService.throughput.split(' ').slice(1).join(' ')}</span>
              </div>
              <div className="font-code text-[9px] text-[#70797B] mt-0.5">Nominal envelope</div>
            </div>

            <div className="p-2 bg-[#F7F7F5] rounded-[2px] border border-[#D9DCD8]">
              <div className="font-section text-[9px] text-[#70797B] uppercase">POD ALLOCATION</div>
              <div className="font-metric text-[18px] font-bold text-[#171A19] mt-0.5">
                {selectedService.podAllocation.current} / {selectedService.podAllocation.max} <span className="font-code text-[10.5px] font-normal">Pods</span>
              </div>
              <div className="font-code text-[9px] text-[#B83A3A] font-medium mt-0.5">100% Saturation</div>
            </div>
          </div>

          {/* Causal Lineage & Incident State */}
          <div className="p-3 space-y-2 bg-[#F7F7F5]">
            <div className="flex items-center justify-between">
              <span className="font-section text-[10px] text-[#171A19] uppercase tracking-wider font-semibold">
                CAUSAL LINEAGE &amp; INCIDENT STATE
              </span>
              <span className="font-code text-[10px] px-1.5 py-0.2 rounded-[2px] bg-[#B83A3A] text-white font-semibold">
                INC-8941
              </span>
            </div>

            <div className="bg-white p-2 rounded-[2px] border border-[#D9DCD8] space-y-1.5 font-code text-[10.5px]">
              <div className="flex items-center justify-between">
                <span className="text-[#70797B]">Primary Inferred Cause:</span>
                <span className="text-[#B83A3A] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B83A3A]"></span>
                  inventory-db (PostgreSQL)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#70797B]">Propagation Delay:</span>
                <span className="font-medium text-[#171A19]">+2.1s from T0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#70797B]">Posterior Confidence:</span>
                <span className="font-semibold text-[#00535f]">91.4% (Causal DAG)</span>
              </div>
              <div className="p-1.5 bg-[#F1F2F0] rounded-[2px] border-l-2 border-[#00535f] text-[#171A19] leading-tight mt-1">
                <strong className="text-[#00535f] font-semibold">Causal Mechanism:</strong> Connection pool acquisition exhaustion following DB disk I/O lock spike.
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-3 bg-[#F1F2F0] space-y-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => onNavigate('topology')}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#171A19] hover:bg-[#286B78] text-white font-code text-[10.5px] uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">hub</span>
                <span>OPEN TOPOLOGY</span>
              </button>
              <button
                onClick={() => onNavigate('root-cause')}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white hover:bg-[#EAECE8] text-[#171A19] border border-[#D9DCD8] font-code text-[10.5px] uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">psychology</span>
                <span>ROOT CAUSE RCA</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => onNavigate('traces')}
                className="flex items-center justify-center gap-1.5 py-1 px-2 bg-white hover:bg-[#EAECE8] text-[#5E6561] border border-[#D9DCD8] font-code text-[10.5px] rounded-[2px] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">polyline</span>
                <span>VIEW TRACES</span>
              </button>
              <button
                onClick={() => onNavigate('logs')}
                className="flex items-center justify-center gap-1.5 py-1 px-2 bg-white hover:bg-[#EAECE8] text-[#5E6561] border border-[#D9DCD8] font-code text-[10.5px] rounded-[2px] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">segment</span>
                <span>VIEW LOGS</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
