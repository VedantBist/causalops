import React from 'react';
import { CORE_INCIDENT } from '../data/mockData';
import { AppPage } from '../components/layout/AppShell';

interface IncidentInvestigationViewProps {
  onNavigate: (page: AppPage) => void;
}

export const IncidentInvestigationView: React.FC<IncidentInvestigationViewProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col w-full font-sans text-[#171A19] p-4 bg-[#F7F7F5] select-text">
      {/* INCIDENT SUMMARY BANNER */}
      <section className="bg-white border border-[#D9DCD8] p-4 mb-3 shadow-xs rounded-[3px]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Title & Badges */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 font-code text-[11px] text-[#70797B] tracking-wider uppercase">
              <span>INCIDENT DISPATCH</span>
              <span>/</span>
              <span className="text-[#00535f] font-semibold">{CORE_INCIDENT.id}</span>
              <span>/</span>
              <span>ROOT CAUSE IDENTIFICATION</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#B83A3A]/10 text-[#B83A3A] border border-[#B83A3A]/30 font-code text-[11px] font-semibold uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B83A3A] animate-pulse"></span>
                SEV-1 · CRITICAL
              </span>
              <h1 className="text-[20px] font-bold text-[#171A19] tracking-tight uppercase">
                DATABASE LATENCY CASCADE
              </h1>
              <span className="font-code text-[11px] px-2 py-0.5 rounded-[2px] bg-[#EAECE8] text-[#5E6561] font-medium">
                DAG-PROPAGATION: CONFIRMED
              </span>
            </div>
          </div>

          {/* Telemetry Status Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-[#F1F2F0] p-2 rounded-[3px] border border-[#D9DCD8]/60 text-left">
            <div className="flex flex-col">
              <span className="font-code text-[10px] text-[#70797B] uppercase tracking-wider">Detected (T₀)</span>
              <span className="font-code text-[12px] text-[#171A19] font-semibold">{CORE_INCIDENT.detectedAt}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-code text-[10px] text-[#70797B] uppercase tracking-wider">Elapsed</span>
              <span className="font-code text-[12px] text-[#B83A3A] font-semibold">{CORE_INCIDENT.elapsedTime}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-code text-[10px] text-[#70797B] uppercase tracking-wider">Blast Radius</span>
              <span className="font-code text-[12px] text-[#171A19] font-semibold">4 Services</span>
            </div>
            <div className="flex flex-col">
              <span className="font-code text-[10px] text-[#70797B] uppercase tracking-wider">Engine State</span>
              <span className="font-code text-[12px] text-[#00535f] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00535f] animate-ping"></span>
                Triage Active
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-code text-[10px] text-[#70797B] uppercase tracking-wider">SLA Exposure</span>
              <span className="font-code text-[12px] text-[#B83A3A] font-semibold uppercase">{CORE_INCIDENT.slaExposure}</span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN DUAL-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* LEFT COLUMN: DIAGNOSTIC MATRIX & TELEMETRY (8 of 12 cols = ~66%) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* SECTION A: PRIMARY ROOT CAUSE & CAUSAL CHAIN */}
          <div className="bg-white border border-[#D9DCD8] rounded-[3px] shadow-xs overflow-hidden">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between px-3 py-2 border-b border-[#D9DCD8] bg-[#F1F2F0]">
              <div className="flex items-center gap-2 font-section text-[11px] text-[#171A19] font-bold">
                <span className="w-2 h-2 rounded-[2px] bg-[#00535f]"></span>
                LIKELY ROOT CAUSE · INFERRED ROOT CAUSE
              </div>
              <div className="flex items-center gap-2">
                <span className="font-code text-[10px] text-[#70797B] uppercase">CAUSAL ASSESSMENT:</span>
                <span className="font-code text-[11px] font-bold text-[#00535f] bg-[#00535f]/10 border border-[#00535f]/30 px-1.5 py-0.5 rounded-[2px]">
                  P(Causal) = 0.91 · MODEL CONFIDENCE: 91.4%
                </span>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-3">
              {/* Root Node Synopsis */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 bg-[#F7F7F5] border border-[#D9DCD8] rounded-[3px] gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-[3px] bg-[#B83A3A]/10 border border-[#B83A3A]/40 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#B83A3A] text-[24px]">database</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-code text-[15px] font-bold text-[#171A19]">inventory-db</span>
                      <span className="font-code text-[10.5px] text-[#70797B] px-1.5 py-0.5 bg-[#EAECE8] rounded-[2px]">
                        PostgreSQL 15.4 · Primary
                      </span>
                      <span className="font-code text-[10.5px] text-[#B83A3A] font-semibold uppercase px-1.5 py-0.5 bg-[#B83A3A]/10 rounded-[2px]">
                        CRITICAL ORIGIN
                      </span>
                    </div>
                    <p className="text-[12.5px] text-[#5E6561] mt-1 leading-snug">
                      Model-assessed posterior probability <span className="font-code font-semibold text-[#171A19]">P(Causal)=0.91</span> based on temporal precedence and dependency topology. Distinguishes statistical inference from observed telemetry.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 pl-3 md:border-l border-[#D9DCD8]">
                  <span className="font-metric text-[22px] font-bold text-[#B83A3A] leading-none">91.4%</span>
                  <span className="font-code text-[10px] text-[#70797B] uppercase mt-1">Posterior Conf.</span>
                </div>
              </div>

              {/* Grammar Legend */}
              <div className="flex items-center gap-4 font-code text-[11px] text-[#70797B] border-b border-[#D9DCD8]/60 pb-1.5">
                <span className="font-bold text-[#171A19]">GRAMMAR:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-0 border-b-2 border-[#70797B]"></span>
                  <span>Observed Telemetry</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-0 border-b-2 border-dashed border-[#00535f]"></span>
                  <span className="text-[#00535f] font-medium">Inferred Propagation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-0 border-b-2 border-dotted border-[#605889]"></span>
                  <span className="text-[#605889] font-medium">Predicted Cascade</span>
                </div>
              </div>

              {/* Visual Causal Chain Flowchart */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 relative">
                {/* Step 1: Root */}
                <div className="relative flex flex-col p-2.5 bg-[#F7F7F5] border-2 border-[#B83A3A]/60 rounded-[3px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-code text-[10px] font-bold text-[#B83A3A]">T₀ · 14:32:07</span>
                    <span className="w-2 h-2 rounded-full bg-[#B83A3A]"></span>
                  </div>
                  <span className="font-code text-[12px] font-bold text-[#171A19]">inventory-db</span>
                  <span className="font-code text-[10px] text-[#5E6561] mt-0.5">Primary Cluster</span>
                  <div className="mt-2 pt-1.5 border-t border-[#D9DCD8]/60 flex flex-col gap-0.5 font-code text-[10px]">
                    <span className="text-[#B83A3A] font-semibold">Wait: 1,420ms</span>
                    <span className="text-[#70797B]">Lock contention</span>
                  </div>
                </div>

                {/* Transition 1 */}
                <div className="hidden md:flex absolute left-[23.5%] top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 bg-white px-1.5 border border-[#D9DCD8] rounded-[2px] text-[10px] font-code font-medium text-[#70797B] shadow-xs">
                  +2.1s
                </div>

                {/* Step 2 */}
                <div className="relative flex flex-col p-2.5 bg-[#F7F7F5] border border-[#B83A3A]/30 rounded-[3px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-code text-[10px] text-[#5E6561]">+2.1s · 14:32:09</span>
                    <span className="w-2 h-2 rounded-full bg-[#B83A3A]"></span>
                  </div>
                  <span className="font-code text-[12px] font-bold text-[#171A19]">inventory-service</span>
                  <span className="font-code text-[10px] text-[#5E6561] mt-0.5">Go 1.21 · Pod/4</span>
                  <div className="mt-2 pt-1.5 border-t border-[#D9DCD8]/60 flex flex-col gap-0.5 font-code text-[10px]">
                    <span className="text-[#B83A3A] font-semibold">Pool: 98/100</span>
                    <span className="text-[#70797B]">Thread starvation</span>
                  </div>
                </div>

                {/* Transition 2 */}
                <div className="hidden md:flex absolute left-[48.5%] top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 bg-white px-1.5 border border-[#00535f]/40 rounded-[2px] text-[10px] font-code font-semibold text-[#00535f] shadow-xs">
                  +4.8s
                </div>

                {/* Step 3 */}
                <div className="relative flex flex-col p-2.5 bg-[#F7F7F5] border border-dashed border-[#00535f] rounded-[3px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-code text-[10px] text-[#00535f] font-semibold">+4.8s · 14:32:12</span>
                    <span className="w-2 h-2 rounded-full bg-[#00535f]"></span>
                  </div>
                  <span className="font-code text-[12px] font-bold text-[#171A19]">order-service</span>
                  <span className="font-code text-[10px] text-[#5E6561] mt-0.5">Java 17 · Pod/8</span>
                  <div className="mt-2 pt-1.5 border-t border-[#D9DCD8]/60 flex flex-col gap-0.5 font-code text-[10px]">
                    <span className="text-[#171A19] font-semibold">P99: 820ms</span>
                    <span className="text-[#70797B]">Sync RPC blocked</span>
                  </div>
                </div>

                {/* Transition 3 */}
                <div className="hidden md:flex absolute left-[73.5%] top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 bg-white px-1.5 border border-[#00535f]/40 rounded-[2px] text-[10px] font-code font-semibold text-[#00535f] shadow-xs">
                  +7.2s
                </div>

                {/* Step 4 */}
                <div className="relative flex flex-col p-2.5 bg-[#F7F7F5] border border-dashed border-[#B83A3A]/40 rounded-[3px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-code text-[10px] text-[#B83A3A] font-medium">+7.2s · 14:32:14</span>
                    <span className="w-2 h-2 rounded-full bg-[#B83A3A]"></span>
                  </div>
                  <span className="font-code text-[12px] font-bold text-[#171A19]">api-gateway</span>
                  <span className="font-code text-[10px] text-[#5E6561] mt-0.5">Envoy Proxy</span>
                  <div className="mt-2 pt-1.5 border-t border-[#D9DCD8]/60 flex flex-col gap-0.5 font-code text-[10px]">
                    <span className="text-[#B83A3A] font-semibold">HTTP 504: 7.2%</span>
                    <span className="text-[#70797B]">Ingress impacted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B: SYNCHRONIZED TELEMETRY CORRELATION (Multi-Trace Alignment) */}
          <div className="bg-white border border-[#D9DCD8] rounded-[3px] shadow-xs">
            <div className="flex flex-wrap items-center justify-between px-3 py-2 border-b border-[#D9DCD8] bg-[#F1F2F0]">
              <div className="flex items-center gap-1.5 font-section text-[11px] text-[#171A19] font-bold">
                <span className="material-symbols-outlined text-[16px] text-[#00535f]">stacked_line_chart</span>
                SYNCHRONIZED TELEMETRY CORRELATION (T₀-2m to T₀+8m)
              </div>
              <div className="flex items-center gap-3 font-code text-[10px] text-[#70797B]">
                <span>SAMPLING: 1,000ms</span>
                <span>METRIC RESOLUTION: 100%</span>
                <span className="text-[#B83A3A] font-semibold">T₀ = 14:32:07</span>
              </div>
            </div>

            <div className="p-4 flex flex-col gap-3">
              {/* Time Axis Guide */}
              <div className="relative w-full h-5 border-b border-[#D9DCD8] flex justify-between font-code text-[10.5px] text-[#70797B] select-none">
                <span>14:30:00 (-2m)</span>
                <span>14:31:00</span>
                <span className="text-[#B83A3A] font-bold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">arrow_drop_down</span>
                  14:32:07 (T₀)
                </span>
                <span>14:34:00 (+2m)</span>
                <span>14:36:00 (+4m)</span>
                <span>14:38:00 (+6m)</span>
                <span>14:40:00 (+8m)</span>
              </div>

              {/* Trace 1: DB I/O Wait */}
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3 flex flex-col font-code text-[11px]">
                  <span className="font-bold text-[#171A19] truncate">inventory-db</span>
                  <span className="text-[#70797B]">Disk I/O Wait (ms)</span>
                  <span className="text-[#B83A3A] font-semibold mt-0.5">Peak: 1,420 ms</span>
                </div>
                <div className="col-span-9 h-11 bg-[#F7F7F5] rounded-[2px] border border-[#D9DCD8]/60 relative flex items-center px-1">
                  <div className="absolute left-[28%] top-0 bottom-0 w-px bg-[#B83A3A]/70 z-20 pointer-events-none"></div>
                  <svg className="w-full h-8 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
                    <path d="M0,36 L25,36 L28,3 L32,8 L40,15 L60,18 L80,20 L100,20" fill="none" stroke="#B83A3A" strokeWidth="2"></path>
                    <circle cx="28" cy="3" fill="#B83A3A" r="3"></circle>
                  </svg>
                </div>
              </div>

              {/* Trace 2: DB Connection Pool */}
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3 flex flex-col font-code text-[11px]">
                  <span className="font-bold text-[#171A19] truncate">inventory-db</span>
                  <span className="text-[#70797B]">Connection Pool</span>
                  <span className="text-[#B83A3A] font-semibold mt-0.5">Max: 198 / 200</span>
                </div>
                <div className="col-span-9 h-11 bg-[#F7F7F5] rounded-[2px] border border-[#D9DCD8]/60 relative flex items-center px-1">
                  <div className="absolute left-[28%] top-0 bottom-0 w-px bg-[#B83A3A]/70 z-20 pointer-events-none"></div>
                  <svg className="w-full h-8 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
                    <path d="M0,35 L27,35 L30,4 L35,4 L60,4 L80,6 L100,6" fill="none" stroke="#286B78" strokeWidth="2"></path>
                    <circle cx="30" cy="4" fill="#286B78" r="3"></circle>
                  </svg>
                </div>
              </div>

              {/* Trace 3: Order Service Latency */}
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3 flex flex-col font-code text-[11px]">
                  <span className="font-bold text-[#171A19] truncate">order-service</span>
                  <span className="text-[#70797B]">P99 Latency (ms)</span>
                  <span className="text-[#7C5C3A] font-semibold mt-0.5">Surge: 820 ms</span>
                </div>
                <div className="col-span-9 h-11 bg-[#F7F7F5] rounded-[2px] border border-[#D9DCD8]/60 relative flex items-center px-1">
                  <div className="absolute left-[28%] top-0 bottom-0 w-px bg-[#B83A3A]/70 z-20 pointer-events-none"></div>
                  <svg className="w-full h-8 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
                    <path d="M0,36 L29,36 L34,10 L45,6 L60,8 L80,10 L100,12" fill="none" stroke="#7C5C3A" strokeWidth="2"></path>
                    <circle cx="34" cy="10" fill="#7C5C3A" r="3"></circle>
                  </svg>
                </div>
              </div>

              {/* Trace 4: API Gateway 504 Error Rate */}
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3 flex flex-col font-code text-[11px]">
                  <span className="font-bold text-[#171A19] truncate">api-gateway</span>
                  <span className="text-[#70797B]">504 Error Rate (%)</span>
                  <span className="text-[#B83A3A] font-semibold mt-0.5">Impact: 7.2%</span>
                </div>
                <div className="col-span-9 h-11 bg-[#F7F7F5] rounded-[2px] border border-[#D9DCD8]/60 relative flex items-center px-1">
                  <div className="absolute left-[28%] top-0 bottom-0 w-px bg-[#B83A3A]/70 z-20 pointer-events-none"></div>
                  <svg className="w-full h-8 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
                    <path d="M0,38 L31,38 L37,8 L50,6 L65,7 L80,9 L100,8" fill="none" stroke="#B83A3A" strokeDasharray="3,3" strokeWidth="2"></path>
                    <circle cx="37" cy="8" fill="#B83A3A" r="3"></circle>
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-code text-[#70797B] pt-2 border-t border-[#D9DCD8]/40">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B83A3A]"></span>
                  <span>Waterfall shift confirmed: inventory-db precedes edge gateway timeout by 7.220s</span>
                </div>
                <span className="font-medium text-[#00535f]">GRANGER-CAUSALITY F-STAT: 41.2 (p &lt; 0.0001)</span>
              </div>
            </div>
          </div>

          {/* SECTION C: EVIDENCE TIMELINE */}
          <div className="bg-white border border-[#D9DCD8] rounded-[3px] shadow-xs">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#D9DCD8] bg-[#F1F2F0]">
              <div className="flex items-center gap-1.5 font-section text-[11px] text-[#171A19] font-bold">
                <span className="material-symbols-outlined text-[16px] text-[#00535f]">view_timeline</span>
                EVIDENCE TIMELINE (HIGH-RESOLUTION RECONSTRUCTION)
              </div>
              <span className="font-code text-[10px] text-[#70797B]">6 CRITICAL CHRONO EVENTS</span>
            </div>
            <div className="divide-y divide-[#D9DCD8]/40 text-[12px]">
              {/* Event 1 */}
              <div className="flex items-center justify-between px-3 py-2 hover:bg-[#F7F7F5] transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="font-code font-bold text-[#B83A3A]">14:32:07.481</span>
                  <span className="font-code text-[10px] font-bold text-[#171A19] px-1.5 py-0.5 bg-[#EAECE8] rounded-[2px]">inventory-db</span>
                  <span className="text-[#171A19]">Disk I/O wait spike &gt; 1,200ms (Max reached 1,420ms)</span>
                </div>
                <span className="font-code text-[10px] px-2 py-0.5 bg-[#F1F2F0] text-[#5E6561] rounded-[2px] border border-[#D9DCD8]">
                  OBSERVED TELEMETRY
                </span>
              </div>
              {/* Event 2 */}
              <div className="flex items-center justify-between px-3 py-2 hover:bg-[#F7F7F5] transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="font-code font-semibold text-[#171A19]">14:32:08.104</span>
                  <span className="font-code text-[10px] font-bold text-[#171A19] px-1.5 py-0.5 bg-[#EAECE8] rounded-[2px]">inventory-db</span>
                  <span className="text-[#171A19]">Connection pool saturated: 198 / 200 active leases</span>
                </div>
                <span className="font-code text-[10px] px-2 py-0.5 bg-[#F1F2F0] text-[#5E6561] rounded-[2px] border border-[#D9DCD8]">
                  OBSERVED TELEMETRY
                </span>
              </div>
              {/* Event 3 */}
              <div className="flex items-center justify-between px-3 py-2 hover:bg-[#F7F7F5] transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="font-code font-semibold text-[#171A19]">14:32:09.612</span>
                  <span className="font-code text-[10px] font-bold text-[#171A19] px-1.5 py-0.5 bg-[#EAECE8] rounded-[2px]">inventory-service</span>
                  <span className="text-[#171A19]">Connection acquisition timeout on HikariCP pool [pool-2]</span>
                </div>
                <span className="font-code text-[10px] px-2 py-0.5 bg-[#F1F2F0] text-[#5E6561] rounded-[2px] border border-[#D9DCD8]">
                  OBSERVED TELEMETRY
                </span>
              </div>
              {/* Event 4 */}
              <div className="flex items-center justify-between px-3 py-2 hover:bg-[#F7F7F5] transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="font-code font-semibold text-[#171A19]">14:32:12.308</span>
                  <span className="font-code text-[10px] font-bold text-[#171A19] px-1.5 py-0.5 bg-[#EAECE8] rounded-[2px]">order-service</span>
                  <span className="text-[#171A19]">P99 synchronous RPC latency crosses threshold (820ms)</span>
                </div>
                <span className="font-code text-[10px] px-2 py-0.5 bg-[#F1F2F0] text-[#5E6561] rounded-[2px] border border-[#D9DCD8]">
                  OBSERVED TELEMETRY
                </span>
              </div>
              {/* Event 5 */}
              <div className="flex items-center justify-between px-3 py-2 hover:bg-[#F7F7F5] transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="font-code font-bold text-[#B83A3A]">14:32:14.701</span>
                  <span className="font-code text-[10px] font-bold text-[#171A19] px-1.5 py-0.5 bg-[#EAECE8] rounded-[2px]">api-gateway</span>
                  <span className="text-[#B83A3A] font-medium">504 Gateway Timeout errors detected on /checkout routes</span>
                </div>
                <span className="font-code text-[10px] px-2 py-0.5 bg-[#F1F2F0] text-[#5E6561] rounded-[2px] border border-[#D9DCD8]">
                  OBSERVED TELEMETRY
                </span>
              </div>
              {/* Event 6 */}
              <div className="flex items-center justify-between px-3 py-2 bg-[#00535f]/5 hover:bg-[#00535f]/10 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="font-code font-bold text-[#00535f]">14:32:16.004</span>
                  <span className="font-code text-[10px] font-bold text-[#00535f] px-1.5 py-0.5 bg-[#00535f]/10 rounded-[2px] border border-[#00535f]/20">CausalOps Engine</span>
                  <span className="text-[#171A19] font-semibold">Incident threshold crossed: cascade verified via Dynamic DAG</span>
                </div>
                <span className="font-code text-[10px] px-2 py-0.5 bg-[#00535f]/10 text-[#00535f] rounded-[2px] border border-[#00535f]/30 font-semibold">
                  INFERRED CAUSAL RELATIONSHIP
                </span>
              </div>
            </div>
          </div>

          {/* COUNTERFACTUAL SIMULATION PREVIEW CARD */}
          <div className="bg-white border border-[#D9DCD8] rounded-[3px] shadow-xs p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#D9DCD8] pb-2">
              <div className="flex items-center gap-1.5 font-section text-[11px] text-[#7C5C3A] font-bold">
                <span className="material-symbols-outlined text-[16px] text-[#7C5C3A]">science</span>
                COUNTERFACTUAL SIMULATION &amp; RECOMMENDED ACTION
              </div>
              <span className="font-code text-[10px] px-2 py-0.5 bg-[#7C5C3A]/10 text-[#7C5C3A] border border-[#7C5C3A]/20 font-semibold rounded-[2px] uppercase tracking-wide">
                SIMULATED / MODEL-ESTIMATED OUTCOME
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-7 flex flex-col gap-1.5">
                <span className="text-[14px] font-bold text-[#171A19]">What if inventory-db latency were reduced by 70%?</span>
                <p className="text-[12px] text-[#5E6561] leading-relaxed">
                  Synthetic intervention simulation run via structural causal model (SCM). Projects system-wide recovery across downstream dependencies.
                </p>
                <div className="p-2 bg-[#F7F7F5] border-l-2 border-[#00535f] rounded-[2px] flex flex-col gap-0.5 mt-1">
                  <span className="font-code text-[10px] text-[#00535f] font-bold uppercase tracking-wide">Recommended Intervention</span>
                  <p className="text-[11.5px] text-[#171A19] font-medium">
                    Investigate inventory-db lock contention &amp; query planner plan cache. Terminate blocking PID 28411.
                  </p>
                </div>
              </div>
              <div className="md:col-span-5 flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="p-2 bg-[#F7F7F5] border border-[#D9DCD8]/60 rounded-[2px]">
                    <span className="font-metric text-[18px] font-bold text-[#00535f] block leading-none">-63%</span>
                    <span className="font-code text-[9.5px] text-[#70797B] mt-1 block">API Latency</span>
                  </div>
                  <div className="p-2 bg-[#F7F7F5] border border-[#D9DCD8]/60 rounded-[2px]">
                    <span className="font-metric text-[18px] font-bold text-[#00535f] block leading-none">-81%</span>
                    <span className="font-code text-[9.5px] text-[#70797B] mt-1 block">504 Errors</span>
                  </div>
                  <div className="p-2 bg-[#F7F7F5] border border-[#D9DCD8]/60 rounded-[2px]">
                    <span className="font-metric text-[18px] font-bold text-[#00535f] block leading-none">4/4</span>
                    <span className="font-code text-[9.5px] text-[#70797B] mt-1 block">Recovered</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 pt-1">
                  <button
                    onClick={() => onNavigate('simulation')}
                    className="w-full h-8 bg-[#7C5C3A] hover:bg-[#624524] text-white font-code text-[11px] uppercase tracking-wider font-semibold rounded-[2px] transition-colors flex items-center justify-center gap-1.5 shadow-none cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">play_circle</span>
                    RUN COUNTERFACTUAL SIMULATION
                  </button>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => onNavigate('topology')}
                      className="h-7 bg-white hover:bg-[#F1F2F0] border border-[#D9DCD8] text-[#171A19] font-code text-[10.5px] font-semibold rounded-[2px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">hub</span>
                      VIEW TOPOLOGY
                    </button>
                    <button
                      onClick={() => onNavigate('traces')}
                      className="h-7 bg-white hover:bg-[#F1F2F0] border border-[#D9DCD8] text-[#171A19] font-code text-[10.5px] font-semibold rounded-[2px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                      TRACE #7fa91c
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REASONING & COMPETING HYPOTHESES (4 of 12 cols = ~34%) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* SECTION D: WHY THIS ROOT CAUSE? */}
          <div className="bg-white border border-[#D9DCD8] rounded-[3px] shadow-xs">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#D9DCD8] bg-[#F1F2F0]">
              <div className="font-section text-[11px] text-[#171A19] font-bold uppercase tracking-wider">
                WHY THIS ROOT CAUSE? (5 CRITERIA)
              </div>
              <span className="font-code text-[10px] text-[#00535f] font-semibold">ALL VERIFIED</span>
            </div>
            <div className="p-3 flex flex-col gap-2">
              {CORE_INCIDENT.fiveCriteria.map((c) => (
                <div key={c.number} className="p-2 bg-[#F7F7F5] rounded-[2px] border border-[#D9DCD8]/60 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-code text-[10.5px] font-bold text-[#171A19]">{c.number} · {c.name}</span>
                    <span className="font-code text-[9.5px] text-[#70797B]">{c.source}</span>
                  </div>
                  <p className="text-[11.5px] text-[#5E6561] leading-snug">
                    {c.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION E: COMPETING HYPOTHESES */}
          <div className="bg-white border border-[#D9DCD8] rounded-[3px] shadow-xs">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#D9DCD8] bg-[#F1F2F0]">
              <div className="font-section text-[11px] text-[#171A19] font-bold uppercase tracking-wider">
                ALTERNATIVE HYPOTHESES (MODEL-ASSESSED)
              </div>
              <span className="font-code text-[10px] text-[#70797B]">EPISTEMIC UNCERTAINTY</span>
            </div>
            <div className="p-3 flex flex-col gap-2">
              <div className="text-[10.5px] font-code text-[#70797B] italic">
                "Hypotheses are evaluated independently against evidence criteria and can exhibit non-exclusive overlap."
              </div>

              {CORE_INCIDENT.competingHypotheses.map((h) => (
                <div
                  key={h.serviceId}
                  className={`p-2 rounded-[2px] border flex flex-col gap-1 ${
                    h.serviceId === 'inventory-db'
                      ? 'bg-[#F7F7F5] border-[#00535f]/40'
                      : 'bg-[#F7F7F5] border-[#D9DCD8]/60'
                  }`}
                >
                  <div className="flex items-center justify-between font-code text-[11px]">
                    <span className="font-bold text-[#171A19]">{h.serviceId}</span>
                    <span
                      className={`font-bold ${
                        h.serviceId === 'inventory-db' ? 'text-[#00535f]' : 'text-[#70797B]'
                      }`}
                    >
                      {h.confidence}% Conf
                    </span>
                  </div>
                  <div className="w-full bg-[#EAECE8] h-1.5 rounded-[1px] overflow-hidden">
                    <div
                      className={`h-full ${
                        h.serviceId === 'inventory-db' ? 'bg-[#00535f]' : 'bg-[#858C87]'
                      }`}
                      style={{ width: `${h.confidence}%` }}
                    ></div>
                  </div>
                  <span className="font-code text-[10px] text-[#5E6561] leading-snug mt-0.5">
                    {h.description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION F: ANALYSIS METHODOLOGY */}
          <div className="bg-white border border-[#D9DCD8] rounded-[3px] shadow-xs">
            <div className="px-3 py-2 border-b border-[#D9DCD8] bg-[#F1F2F0] font-section text-[11px] text-[#171A19] font-bold uppercase tracking-wider">
              ANALYSIS METHODOLOGY
            </div>
            <div className="p-3 grid grid-cols-2 gap-2 font-code text-[10.5px]">
              <div className="flex items-center gap-1.5 text-[#5E6561]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00535f]"></span>
                <span>Temporal anomaly detection</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#5E6561]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00535f]"></span>
                <span>Dependency graph analysis</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#5E6561]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00535f]"></span>
                <span>Cross-service correlation</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#5E6561]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00535f]"></span>
                <span>Causal hypothesis ranking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
