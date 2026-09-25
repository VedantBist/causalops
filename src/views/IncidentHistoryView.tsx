import React, { useState } from 'react';
import { HISTORICAL_INCIDENTS } from '../data/mockData';
import { AppPage } from '../components/layout/AppShell';

interface IncidentHistoryViewProps {
  onNavigate: (page: AppPage) => void;
}

export const IncidentHistoryView: React.FC<IncidentHistoryViewProps> = ({ onNavigate }) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('INC-8941');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('30d');

  const filteredIncidents = HISTORICAL_INCIDENTS.filter((inc) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!inc.id.toLowerCase().includes(q) && !inc.title.toLowerCase().includes(q) && !inc.rootCauseNode.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (severityFilter !== 'all' && inc.severity.toLowerCase() !== severityFilter.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="flex flex-col w-full font-sans text-[#171A19] p-4 bg-[#F7F7F5] select-text">
      {/* PRIMARY SPLIT WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[calc(100vh-4rem)]">
        {/* LEFT / CENTER WORKBENCH (7 of 12 cols = ~58%) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          {/* TOOLBAR & FILTERS */}
          <div className="flex flex-col gap-2 bg-white p-3 border border-[#D9DCD8] rounded-[3px] shadow-xs">
            {/* Search row */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <span className="material-symbols-outlined absolute left-2 top-1.5 text-[#70797B] text-[16px]">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search incidents by ID, service, or root cause... (⌘K)"
                  className="w-full bg-[#F7F7F5] border border-[#D9DCD8] pl-7 pr-3 py-1 font-code text-[11px] text-[#171A19] rounded-[2px] placeholder-[#70797B] focus:outline-none focus:border-[#00535f]"
                />
              </div>
              <button className="flex items-center gap-1 px-2.5 py-1 bg-[#F7F7F5] border border-[#D9DCD8] rounded-[2px] font-code text-[10.5px] text-[#171A19] hover:bg-[#EAECE8] transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[14px]">tune</span>
                <span>CUSTOM QUERY</span>
              </button>
              <button className="flex items-center gap-1 px-2.5 py-1 bg-[#F7F7F5] border border-[#D9DCD8] rounded-[2px] font-code text-[10.5px] text-[#171A19] hover:bg-[#EAECE8] transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[14px]">file_download</span>
                <span>EXPORT CSV</span>
              </button>
            </div>

            {/* Filter rows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-[#D9DCD8] font-code text-[10.5px]">
              {/* Severity */}
              <div className="flex items-center gap-1">
                <span className="text-[#70797B] font-semibold w-16">SEVERITY:</span>
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    onClick={() => setSeverityFilter('all')}
                    className={`px-1.5 py-0.5 rounded-[2px] cursor-pointer ${
                      severityFilter === 'all' ? 'bg-[#171A19] text-white font-semibold' : 'text-[#5E6561]'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSeverityFilter('crit')}
                    className={`px-1.5 py-0.5 rounded-[2px] cursor-pointer ${
                      severityFilter === 'crit' ? 'bg-[#B83A3A] text-white font-semibold' : 'text-[#B83A3A]'
                    }`}
                  >
                    Critical (31)
                  </button>
                  <button
                    onClick={() => setSeverityFilter('high')}
                    className={`px-1.5 py-0.5 rounded-[2px] cursor-pointer ${
                      severityFilter === 'high' ? 'bg-[#D9822B] text-white font-semibold' : 'text-[#D9822B]'
                    }`}
                  >
                    High (44)
                  </button>
                  <button
                    onClick={() => setSeverityFilter('med')}
                    className={`px-1.5 py-0.5 rounded-[2px] cursor-pointer ${
                      severityFilter === 'med' ? 'bg-[#70797B] text-white font-semibold' : 'text-[#70797B]'
                    }`}
                  >
                    Med (92)
                  </button>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-1">
                <span className="text-[#70797B] font-semibold w-16">STATUS:</span>
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-1.5 py-0.5 rounded-[2px] cursor-pointer ${
                      statusFilter === 'all' ? 'bg-[#171A19] text-white font-semibold' : 'text-[#5E6561]'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter('resolved')}
                    className={`px-1.5 py-0.5 rounded-[2px] cursor-pointer ${
                      statusFilter === 'resolved' ? 'bg-[#2F7D5C] text-white font-semibold' : 'text-[#2F7D5C]'
                    }`}
                  >
                    Resolved (212)
                  </button>
                  <button
                    onClick={() => setStatusFilter('investigating')}
                    className={`px-1.5 py-0.5 rounded-[2px] cursor-pointer ${
                      statusFilter === 'investigating' ? 'bg-[#B83A3A] text-white font-semibold' : 'text-[#B83A3A]'
                    }`}
                  >
                    Investigating (2)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* PRIMARY INCIDENT TABLE */}
          <div className="bg-white border border-[#D9DCD8] rounded-[3px] shadow-xs flex flex-col overflow-hidden">
            <div className="px-3 py-1.5 bg-[#F1F2F0] border-b border-[#D9DCD8] flex items-center justify-between font-code text-[10.5px] text-[#70797B]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">table_rows</span>
                <span className="font-semibold text-[#171A19] uppercase tracking-wider">HISTORICAL REPOSITORY · GROUND TRUTH CORPUS</span>
              </div>
              <div>
                <span>FILTERED: <strong className="text-[#171A19]">247</strong> RECORDS</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left font-code text-[11px]">
                <thead>
                  <tr className="bg-[#EAECE8] border-b border-[#D9DCD8] text-[#70797B] uppercase tracking-wider text-[10px]">
                    <th className="py-2 px-3 font-semibold">Incident</th>
                    <th className="py-2 px-2 font-semibold">Sev</th>
                    <th className="py-2 px-2 font-semibold">Started</th>
                    <th className="py-2 px-2 font-semibold">Duration</th>
                    <th className="py-2 px-2 font-semibold">Root Cause Node</th>
                    <th className="py-2 px-2 font-semibold">Blast Radius</th>
                    <th className="py-2 px-2 font-semibold">Outcome</th>
                    <th className="py-2 px-3 font-semibold text-right">RCA Conf</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9DCD8]">
                  {filteredIncidents.map((inc) => {
                    const isSelected = inc.id === selectedIncidentId;
                    return (
                      <tr
                        key={inc.id}
                        onClick={() => setSelectedIncidentId(inc.id)}
                        className={`hover:bg-[#F7F7F5] transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#E9EDE9] border-l-4 border-l-[#00535f]' : 'border-l-4 border-l-transparent'
                        }`}
                      >
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-1 py-0.5 rounded-[2px] font-semibold text-[10px] ${
                                inc.isCurrent
                                  ? 'bg-[#ADEDFC] text-[#001F25] border border-[#00535f]/30'
                                  : 'bg-[#F1F2F0] text-[#5E6561]'
                              }`}
                            >
                              {inc.id}
                            </span>
                            <span className="font-semibold text-[#171A19] truncate max-w-[150px]">{inc.title}</span>
                          </div>
                        </td>
                        <td className="py-2 px-2 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] font-semibold text-[9.5px] ${
                              inc.severity === 'CRIT'
                                ? 'bg-[#B83A3A]/10 text-[#B83A3A] border border-[#B83A3A]/30'
                                : inc.severity === 'HIGH'
                                ? 'bg-[#D9822B]/10 text-[#D9822B] border border-[#D9822B]/30'
                                : 'bg-[#70797B]/10 text-[#5E6561]'
                            }`}
                          >
                            <span className="w-1 h-1 rounded-full bg-current"></span>
                            {inc.severity}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-[#70797B]">{inc.started}</td>
                        <td className="py-2 px-2 font-medium">{inc.duration}</td>
                        <td className="py-2 px-2">
                          <span className="px-1.5 py-0.5 rounded-[2px] bg-[#F1F2F0] border border-[#D9DCD8] text-[10px]">
                            {inc.rootCauseNode}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-[#5E6561]">{inc.blastRadius}</td>
                        <td className="py-2 px-2">
                          <span className="inline-flex items-center gap-1 text-[#2F7D5C] font-medium text-[10px]">
                            <span className="material-symbols-outlined text-[13px]">check_circle</span>
                            {inc.outcome}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-[#00535f]">{inc.rcaConf}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-3 py-1.5 border-t border-[#D9DCD8] bg-[#F1F2F0] flex items-center justify-between font-code text-[10.5px] text-[#70797B]">
              <div>SHOWING 8 OF 247 INCIDENTS · PAGE 1 OF 31</div>
              <div className="flex items-center gap-1">
                <button className="px-2 py-0.5 border border-[#D9DCD8] bg-white rounded text-[#70797B] cursor-pointer">PREV</button>
                <span className="px-1.5 font-bold text-[#171A19]">1</span>
                <span className="px-1 text-[#70797B]">2</span>
                <span className="px-1 text-[#70797B]">...</span>
                <button className="px-2 py-0.5 border border-[#D9DCD8] bg-white rounded text-[#171A19] cursor-pointer">NEXT</button>
              </div>
            </div>
          </div>

          {/* HISTORICAL ANALYTICS & CAUSAL EVALUATION SECTION (2 PANELS) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Panel 1: Histogram */}
            <div className="p-3 bg-white border border-[#D9DCD8] rounded-[3px] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-[#D9DCD8] pb-1.5">
                <div className="flex items-center gap-1 font-section text-[10.5px] text-[#171A19] font-bold">
                  <span className="material-symbols-outlined text-[14px] text-[#70797B]">bar_chart</span>
                  <span>INCIDENTS OVER TIME (30-DAY)</span>
                </div>
                <div className="flex items-center gap-2 font-code text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-[1px] bg-[#B83A3A]"></span>31 CRIT</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-[1px] bg-[#D9DCD8]"></span>216 OTHER</span>
                </div>
              </div>
              <div className="py-2">
                <svg className="w-full h-16" preserveAspectRatio="none" viewBox="0 0 300 80">
                  <line x1="0" x2="300" y1="20" y2="20" stroke="#D9DCD8" strokeDasharray="2 2" strokeWidth="0.8"></line>
                  <line x1="0" x2="300" y1="50" y2="50" stroke="#D9DCD8" strokeDasharray="2 2" strokeWidth="0.8"></line>
                  {/* Bars */}
                  <rect x="5" y="45" width="6" height="35" fill="#D9DCD8"></rect>
                  <rect x="25" y="30" width="6" height="50" fill="#D9DCD8"></rect>
                  <rect x="45" y="20" width="6" height="60" fill="#D9DCD8"></rect>
                  <rect x="45" y="20" width="6" height="15" fill="#B83A3A"></rect>
                  <rect x="75" y="40" width="6" height="40" fill="#D9DCD8"></rect>
                  <rect x="95" y="15" width="6" height="65" fill="#D9DCD8"></rect>
                  <rect x="95" y="15" width="6" height="20" fill="#B83A3A"></rect>
                  <rect x="135" y="25" width="6" height="55" fill="#D9DCD8"></rect>
                  <rect x="135" y="25" width="6" height="18" fill="#B83A3A"></rect>
                  <rect x="175" y="20" width="6" height="60" fill="#D9DCD8"></rect>
                  <rect x="175" y="20" width="6" height="22" fill="#B83A3A"></rect>
                  <rect x="225" y="10" width="6" height="70" fill="#D9DCD8"></rect>
                  <rect x="225" y="10" width="6" height="28" fill="#B83A3A"></rect>
                  <rect x="265" y="25" width="6" height="55" fill="#D9DCD8"></rect>
                  <rect x="285" y="30" width="6" height="50" fill="#D9DCD8"></rect>
                  <rect x="285" y="30" width="6" height="15" fill="#B83A3A"></rect>
                  <rect x="292" y="18" width="6" height="62" fill="#00535f"></rect>
                  <rect x="292" y="18" width="6" height="24" fill="#B83A3A"></rect>
                </svg>
              </div>
              <div className="flex items-center justify-between font-code text-[10px] text-[#70797B] pt-1 border-t border-[#D9DCD8]">
                <span>-30 DAYS</span>
                <span>AVG: 8.23 / DAY</span>
                <span>TODAY (CURRENT)</span>
              </div>
            </div>

            {/* Panel 2: Causal Performance */}
            <div className="p-3 bg-white border border-[#D9DCD8] rounded-[3px] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-[#D9DCD8] pb-1.5">
                <div className="flex items-center gap-1 font-section text-[10.5px] text-[#171A19] font-bold">
                  <span className="material-symbols-outlined text-[14px] text-[#00535f]">model_training</span>
                  <span>CAUSAL ANALYSIS PERFORMANCE</span>
                </div>
                <span className="font-code text-[9.5px] text-[#70797B]">EVAL DATASET (N=247)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 py-2 text-center font-code">
                <div className="p-1.5 bg-[#F7F7F5] rounded border border-[#D9DCD8]">
                  <span className="font-metric text-[18px] text-[#00535f] font-bold block leading-none">87%</span>
                  <span className="text-[10px] text-[#171A19] font-semibold uppercase mt-1 block">RCA Match</span>
                  <span className="text-[9px] text-[#70797B] block">Post-mortem true</span>
                </div>
                <div className="p-1.5 bg-[#F7F7F5] rounded border border-[#D9DCD8]">
                  <span className="font-metric text-[18px] text-[#00535f] font-bold block leading-none">82%</span>
                  <span className="text-[10px] text-[#171A19] font-semibold uppercase mt-1 block">Path Match</span>
                  <span className="text-[9px] text-[#70797B] block">DAG accuracy</span>
                </div>
                <div className="p-1.5 bg-[#F7F7F5] rounded border border-[#D9DCD8]">
                  <span className="font-metric text-[18px] text-[#605889] font-bold block leading-none">4m 12s</span>
                  <span className="text-[10px] text-[#171A19] font-semibold uppercase mt-1 block">Median Lead</span>
                  <span className="text-[9px] text-[#70797B] block">Pre-SLA breach</span>
                </div>
              </div>
              <div className="font-code text-[9.5px] text-[#70797B] pt-1 border-t border-[#D9DCD8]">
                * Historical evaluation computed across resolved incidents with verified post-mortem ground truth.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT INSPECTOR WORKSPACE (~42% width) */}
        <div className="lg:col-span-5 flex flex-col bg-white border border-[#D9DCD8] rounded-[3px] shadow-xs p-3 space-y-3">
          {/* Header */}
          <div className="border border-[#D9DCD8] rounded-[2px] p-2.5 bg-[#F7F7F5] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-section text-[10px] text-[#70797B] font-semibold uppercase">
                INCIDENT INSPECTOR / SCM AUDIT RECORD
              </span>
              <span className="px-1.5 py-0.5 rounded-[2px] bg-[#2F7D5C]/10 text-[#2F7D5C] font-code text-[9.5px] font-semibold border border-[#2F7D5C]/30">
                ● RESOLVED
              </span>
            </div>
            <h2 className="text-[15px] font-bold text-[#171A19] tracking-tight">
              INC-8941: Database Latency Cascade
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 pt-1 border-t border-[#D9DCD8] font-code text-[10px]">
              <div>
                <span className="text-[#70797B] block">SEVERITY</span>
                <span className="text-[#B83A3A] font-semibold">CRITICAL (P1)</span>
              </div>
              <div>
                <span className="text-[#70797B] block">STARTED</span>
                <span className="text-[#171A19] font-medium">14:32:07 UTC</span>
              </div>
              <div>
                <span className="text-[#70797B] block">DURATION</span>
                <span className="text-[#171A19] font-medium">7m 24s</span>
              </div>
              <div>
                <span className="text-[#70797B] block">RCA CONF</span>
                <span className="text-[#00535f] font-bold">91% (SCM-V3)</span>
              </div>
            </div>
          </div>

          {/* Causal Chain & Propagation Delays */}
          <div className="border border-[#D9DCD8] rounded-[2px] p-2.5 space-y-1.5 font-code text-[10.5px]">
            <div className="flex items-center justify-between border-b border-[#D9DCD8] pb-1">
              <span className="font-section text-[10px] text-[#171A19] font-bold uppercase tracking-wider">
                CAUSAL CHAIN &amp; PROPAGATION DELAYS
              </span>
              <span className="text-[#70797B] text-[9.5px]">OBSERVED DAG DIRECTED VECTORS</span>
            </div>
            <div className="space-y-1 pt-0.5">
              <div className="p-1.5 rounded bg-[#B83A3A]/5 border border-[#B83A3A]/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="px-1 py-0.2 rounded bg-[#B83A3A] text-white font-bold text-[9px]">T0 ROOT</span>
                  <span className="font-bold text-[#171A19]">inventory-db</span>
                  <span className="text-[#B83A3A] font-semibold">CRITICAL</span>
                </div>
                <span className="text-[#5E6561]">Disk I/O Spike · Latency 1.42s</span>
              </div>
              <div className="flex items-center gap-1.5 pl-3 text-[#00535f] text-[10px]">
                <span className="material-symbols-outlined text-[13px]">arrow_downward</span>
                <span>+2.1s propagation lag (Connection lease starvation)</span>
              </div>
              <div className="p-1.5 rounded bg-[#F7F7F5] border border-[#D9DCD8] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="px-1 py-0.2 rounded bg-[#D9822B] text-white font-medium text-[9px]">L1</span>
                  <span className="font-semibold text-[#171A19]">inventory-service</span>
                  <span className="text-[#D9822B] font-semibold">DEGRADED</span>
                </div>
                <span className="text-[#5E6561]">Pool lock saturation (198/200)</span>
              </div>
              <div className="flex items-center gap-1.5 pl-3 text-[#00535f] text-[10px]">
                <span className="material-symbols-outlined text-[13px]">arrow_downward</span>
                <span>+4.8s propagation lag (gRPC retry queue backlog)</span>
              </div>
              <div className="p-1.5 rounded bg-[#F7F7F5] border border-[#D9DCD8] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="px-1 py-0.2 rounded bg-[#D9822B] text-white font-medium text-[9px]">L2</span>
                  <span className="font-semibold text-[#171A19]">order-service</span>
                  <span className="text-[#D9822B] font-semibold">DEGRADED</span>
                </div>
                <span className="text-[#5E6561]">Synchronous RPC retry timeouts</span>
              </div>
              <div className="flex items-center gap-1.5 pl-3 text-[#00535f] text-[10px]">
                <span className="material-symbols-outlined text-[13px]">arrow_downward</span>
                <span>+7.2s propagation lag (Edge ingress backlog)</span>
              </div>
              <div className="p-1.5 rounded bg-[#B83A3A]/5 border border-[#B83A3A]/20 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="px-1 py-0.2 rounded bg-[#B83A3A] text-white font-bold text-[9px]">EDGE</span>
                  <span className="font-semibold text-[#171A19]">api-gateway</span>
                  <span className="text-[#B83A3A] font-semibold">504 SLA BREACH</span>
                </div>
                <span className="text-[#5E6561]">7.2% errors</span>
              </div>
            </div>
          </div>

          {/* Intervention: Predicted vs Observed Outcome */}
          <div className="border border-[#D9DCD8] rounded-[2px] p-2.5 space-y-1.5 font-code text-[10.5px]">
            <div className="flex items-center justify-between border-b border-[#D9DCD8] pb-1">
              <span className="font-section text-[10px] text-[#171A19] font-bold uppercase tracking-wider">
                INTERVENTION: PREDICTED VS OBSERVED OUTCOME
              </span>
              <span className="px-1.5 py-0.2 rounded bg-[#ADEDFC] text-[#00535f] font-semibold">
                94.6% CORRELATION
              </span>
            </div>
            <table className="w-full text-left border border-[#D9DCD8] rounded overflow-hidden">
              <thead className="bg-[#EAECE8] border-b border-[#D9DCD8] text-[#70797B] uppercase text-[9.5px]">
                <tr>
                  <th className="py-1 px-2">Metric Impact</th>
                  <th className="py-1 px-2 text-right">Predicted</th>
                  <th className="py-1 px-2 text-right">Observed</th>
                  <th className="py-1 px-2 text-right">Δ Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9DCD8]">
                <tr>
                  <td className="py-1 px-2 font-medium">Peak Blast Impact</td>
                  <td className="py-1 px-2 text-right text-[#5E6561]">28%</td>
                  <td className="py-1 px-2 text-right font-semibold">31%</td>
                  <td className="py-1 px-2 text-right text-[#D9822B] font-semibold">+3 pp</td>
                </tr>
                <tr>
                  <td className="py-1 px-2 font-medium">Edge API Latency</td>
                  <td className="py-1 px-2 text-right text-[#5E6561]">296ms</td>
                  <td className="py-1 px-2 text-right font-semibold">318ms</td>
                  <td className="py-1 px-2 text-right text-[#D9822B] font-semibold">+22ms</td>
                </tr>
                <tr>
                  <td className="py-1 px-2 font-medium">504 Error Rate</td>
                  <td className="py-1 px-2 text-right text-[#5E6561]">1.1%</td>
                  <td className="py-1 px-2 text-right font-semibold">1.4%</td>
                  <td className="py-1 px-2 text-right text-[#D9822B] font-semibold">+0.3 pp</td>
                </tr>
                <tr className="bg-[#00535f]/5">
                  <td className="py-1 px-2 text-[#00535f] font-bold">Services Recovered</td>
                  <td className="py-1 px-2 text-right font-bold text-[#00535f]">4 / 4</td>
                  <td className="py-1 px-2 text-right font-bold text-[#00535f]">4 / 4</td>
                  <td className="py-1 px-2 text-right text-[#00535f] font-bold">0 (Exact)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action Hubs */}
          <div className="grid grid-cols-2 gap-1.5 pt-1 font-code text-[10.5px]">
            <button
              onClick={() => onNavigate('active-incidents')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-[#171A19] text-white font-semibold rounded-[2px] hover:bg-[#00535f] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">psychology</span>
              <span>OPEN INVESTIGATION</span>
            </button>
            <button
              onClick={() => onNavigate('topology')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white border border-[#D9DCD8] text-[#171A19] font-semibold rounded-[2px] hover:bg-[#F1F2F0] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">hub</span>
              <span>VIEW TOPOLOGY</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
