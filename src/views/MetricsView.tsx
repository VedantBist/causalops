import React, { useState } from 'react';
import { AppPage } from '../components/layout/AppShell';
import { useDemoState } from '../context/DemoStateContext';

interface MetricsViewProps {
  onNavigate: (page: AppPage) => void;
}

export const MetricsView: React.FC<MetricsViewProps> = ({ onNavigate }) => {
  const { activeFault } = useDemoState();
  const isAuthFail = activeFault === 'auth-gateway';
  const [selectedMetric, setSelectedMetric] = useState<string>('P99 Latency');
  const [selectedService, setSelectedService] = useState<string>(isAuthFail ? 'auth-gateway' : 'inventory-service');
  const [timeWindow, setTimeWindow] = useState<string>('15m');

  return (
    <div className="flex flex-col w-full font-sans text-[#171A19] p-4 bg-[#F7F7F5] select-text">
      {/* TOOLBAR STRIP */}
      <div className="bg-[#F1F2F0] px-3 py-2 rounded-[3px] mb-3 border border-[#D9DCD8] flex flex-wrap items-center justify-between gap-y-2 font-code text-[11px]">
        <div className="flex items-center flex-wrap gap-2">
          {/* Service Picker */}
          <div className="flex items-center bg-white px-2 py-1 rounded-[2px] border border-[#D9DCD8]">
            <span className="text-[#70797B] uppercase tracking-wider mr-1 text-[10px]">SERVICE:</span>
            <span className="font-semibold text-[#00535f] mr-1">inventory-service</span>
            <span className="text-[#5E6561] text-[10px]">(Go 1.21 · prod-east)</span>
          </div>

          {/* Metric Picker */}
          <div className="flex items-center bg-white px-2 py-1 rounded-[2px] border border-[#D9DCD8]">
            <span className="text-[#70797B] uppercase tracking-wider mr-1 text-[10px]">METRIC:</span>
            <span className="font-semibold text-[#171A19]">P99 Latency</span>
          </div>

          {/* Window */}
          <div className="flex items-center bg-white px-2 py-1 rounded-[2px] border border-[#D9DCD8]">
            <span className="text-[#70797B] uppercase tracking-wider mr-1 text-[10px]">WINDOW:</span>
            <span className="font-semibold text-[#171A19]">15m</span>
          </div>

          <div className="flex items-center bg-white px-2 py-1 rounded-[2px] border border-[#D9DCD8]">
            <span className="text-[#70797B] uppercase tracking-wider mr-1 text-[10px]">RES:</span>
            <span className="font-semibold text-[#171A19]">15s</span>
          </div>

          {/* Live Badge */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-[2px] bg-[#286B78] text-white font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            <span>LIVE</span>
          </div>
        </div>

        {/* T0 Lock Anchor */}
        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-[2px] border border-[#D9DCD8]">
          <span className="material-symbols-outlined text-[14px] text-[#00535f]">lock</span>
          <span className="text-[#70797B] uppercase text-[10px]">T0 ANCHOR:</span>
          <span className="font-semibold text-[#171A19]">14:32:07 UTC</span>
          <span className="w-1 h-1 rounded-full bg-[#70797B]"></span>
          <span className="font-semibold text-[#B83A3A] uppercase">
            {isAuthFail ? 'INC-8945 SYNCHRONIZED' : 'INC-8941 SYNCHRONIZED'}
          </span>
        </div>
      </div>

      {/* PRIMARY DUAL-PANE ARCHITECTURE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* LEFT / CENTER PRIMARY WORKSPACE (8 of 12 cols = ~66%) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Hero Metric Visualization Panel */}
          <div className="bg-white rounded-[3px] p-4 shadow-xs border border-[#D9DCD8] flex flex-col gap-3">
            {/* Readout Stat Counters */}
            <div className="flex flex-wrap items-center justify-between gap-y-2 border-b border-[#D9DCD8] pb-2 font-code">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#B83A3A] rounded-[1px]"></span>
                <span className="font-section text-[12px] font-bold text-[#171A19]">
                  P99 LATENCY · INVENTORY-SERVICE
                </span>
                <span className="text-[10px] text-[#5E6561] bg-[#F1F2F0] px-1.5 py-0.5 rounded-[2px]">
                  OBSERVED SYMPTOM
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap text-[11px]">
                <div className="flex items-baseline gap-1 bg-[#F7F7F5] px-2 py-0.5 rounded-[2px] border border-[#D9DCD8]">
                  <span className="text-[#70797B] text-[10px]">CURRENT:</span>
                  <span className="font-metric text-[16px] text-[#B83A3A] font-bold">820</span>
                  <span className="text-[#70797B] text-[10px]">ms</span>
                </div>
                <div className="flex items-baseline gap-1 bg-[#F7F7F5] px-2 py-0.5 rounded-[2px] border border-[#D9DCD8]">
                  <span className="text-[#70797B] text-[10px]">BASELINE:</span>
                  <span className="font-semibold text-[#171A19]">180</span>
                  <span className="text-[#70797B] text-[10px]">ms</span>
                </div>
                <div className="flex items-baseline gap-1 bg-[#B83A3A]/10 text-[#B83A3A] px-2 py-0.5 rounded-[2px] border border-[#B83A3A]/20 font-semibold">
                  <span className="text-[10px]">DELTA:</span>
                  <span>+355%</span>
                  <span className="text-[10px]">(Δ +640ms)</span>
                </div>
                <div className="flex items-baseline gap-1 bg-[#F7F7F5] px-2 py-0.5 rounded-[2px] border border-[#D9DCD8]">
                  <span className="text-[#70797B] text-[10px]">SLA:</span>
                  <span className="font-semibold text-[#171A19]">500 ms</span>
                </div>
              </div>
            </div>

            {/* Anomaly Banner */}
            <div className="bg-[#FFF2F0] border border-[#FFD5D0] px-3 py-1.5 rounded-[2px] flex items-center justify-between text-[#171A19] font-code text-[11px]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="material-symbols-outlined text-[16px] text-[#B83A3A]">crisis_alert</span>
                <span className="font-bold text-[#B83A3A] uppercase tracking-wider">ANOMALY DETECTED</span>
                <span className="text-[#70797B]">|</span>
                <span>14:32:07 UTC</span>
                <span className="text-[#70797B]">|</span>
                <span className="text-[#70797B] uppercase">SEVERITY:</span>
                <span className="font-bold text-[#B83A3A]">CRITICAL</span>
                <span className="text-[#70797B]">|</span>
                <span className="text-[#70797B] uppercase">DEVIATION:</span>
                <span className="font-bold text-[#B83A3A]">+7.9σ FROM BASELINE</span>
              </div>
              <button
                onClick={() => onNavigate('root-cause')}
                className="flex items-center gap-1 font-semibold text-[#00535f] hover:underline uppercase text-[10.5px] cursor-pointer"
              >
                <span>INVESTIGATE ROOT CAUSE</span>
                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
              </button>
            </div>

            {/* Primary SVG Chart */}
            <div className="w-full relative h-64 bg-[#F7F7F5] rounded-[2px] p-2 select-none overflow-hidden border border-[#D9DCD8]">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 240">
                <defs>
                  <pattern id="metric-grid" width="100" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#D9DCD8" strokeWidth="0.75"></path>
                  </pattern>
                </defs>
                <rect width="1000" height="240" fill="url(#metric-grid)"></rect>

                {/* SLA Violation Region */}
                <rect x="0" y="0" width="1000" height="95" fill="#B83A3A" fillOpacity="0.06"></rect>
                <line x1="0" x2="1000" y1="95" y2="95" stroke="#B83A3A" strokeDasharray="4,4" strokeWidth="1.2"></line>
                <text x="12" y="90" fill="#B83A3A" fontFamily="JetBrains Mono" fontSize="9.5" fontWeight="600">
                  SLA LIMIT (500ms)
                </text>

                {/* Baseline reference */}
                <line x1="0" x2="1000" y1="190" y2="190" stroke="#70797B" strokeDasharray="2,3" strokeWidth="0.9"></line>
                <text x="12" y="183" fill="#5E6561" fontFamily="JetBrains Mono" fontSize="9.5">
                  BASELINE (180ms)
                </text>

                {/* Curve */}
                <path
                  d="M 0,191 L 100,189 L 200,192 L 300,188 L 400,190 L 500,189 L 600,190 L 700,191 L 740,190 L 760,145 L 785,78 L 820,38 L 860,32 L 900,34 L 940,28 L 1000,28"
                  fill="none"
                  stroke="#B83A3A"
                  strokeLinejoin="round"
                  strokeWidth="2.2"
                ></path>

                {/* Vertical T0 Marker */}
                <line x1="740" x2="740" y1="0" y2="240" stroke="#B83A3A" strokeWidth="1.5"></line>
                <g transform="translate(745, 14)">
                  <rect x="0" y="0" width="138" height="20" rx="2" fill="#B83A3A"></rect>
                  <text x="6" y="14" fill="#FFFFFF" fontFamily="JetBrains Mono" fontSize="9.5" fontWeight="600">
                    T0 · 14:32:07 UTC
                  </text>
                </g>

                <circle cx="740" cy="190" r="4.5" fill="#B83A3A" stroke="#FFFFFF" strokeWidth="1.5"></circle>
                <circle cx="1000" cy="28" r="4" fill="#B83A3A"></circle>
                <text x="940" y="22" fill="#B83A3A" fontFamily="JetBrains Mono" fontSize="10.5" fontWeight="600">
                  820 ms
                </text>

                {/* Time Axis */}
                <text x="10" y="232" fill="#70797B" fontFamily="JetBrains Mono" fontSize="9.5">14:20 (-15m)</text>
                <text x="250" y="232" fill="#70797B" fontFamily="JetBrains Mono" fontSize="9.5">14:24 (-11m)</text>
                <text x="500" y="232" fill="#70797B" fontFamily="JetBrains Mono" fontSize="9.5">14:28 (-7m)</text>
                <text x="730" y="232" fill="#B83A3A" fontFamily="JetBrains Mono" fontSize="9.5" fontWeight="600">T0 (14:32:07)</text>
                <text x="930" y="232" fill="#70797B" fontFamily="JetBrains Mono" fontSize="9.5">NOW (14:35)</text>
              </svg>
            </div>
          </div>

          {/* Synchronized Multi-Track Propagation Telemetry */}
          <div className="bg-white rounded-[3px] p-4 shadow-xs border border-[#D9DCD8] flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-[#D9DCD8]">
              <div className="flex items-center gap-1.5">
                <span className="font-section text-[10.5px] text-[#171A19] font-bold">
                  SYNCHRONIZED MULTI-TRACK PROPAGATION TELEMETRY
                </span>
                <span className="font-code text-[10px] text-[#5E6561] bg-[#F1F2F0] px-1.5 py-0.5 rounded">
                  SHARED TEMPORAL AXIS (T0 LOCK)
                </span>
              </div>
              <div className="flex items-center gap-3 font-code text-[10px] text-[#70797B]">
                <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-[#B83A3A] inline-block"></span> CRITICAL DRIFT</span>
                <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-[#286B78] inline-block"></span> UPSTREAM DRIVER</span>
                <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-[#70797B] inline-block"></span> NOMINAL</span>
              </div>
            </div>

            <div className="flex flex-col space-y-2 relative font-code text-[11px]">
              {/* Global Synchronized T0 Hairline */}
              <div className="absolute top-0 bottom-0 left-[74%] w-px bg-[#B83A3A] z-20 pointer-events-none opacity-80">
                <div className="sticky top-0 bg-[#B83A3A] text-white text-[9px] px-1 py-0.5 rounded-b -ml-5 w-11 text-center font-bold">
                  T0 REF
                </div>
              </div>

              {/* Track 1: P99 Latency (inventory-service) */}
              <div className="flex items-center bg-[#F7F7F5] rounded-[2px] p-2 border border-[#D9DCD8]">
                <div className="w-44 flex flex-col shrink-0">
                  <div className="flex items-center gap-1 font-semibold text-[#171A19]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B83A3A]"></span>
                    <span>inventory-service</span>
                  </div>
                  <span className="text-[10px] text-[#70797B]">P99 Latency (ms)</span>
                  <span className="text-[#B83A3A] font-bold">180ms → 820ms</span>
                </div>
                <div className="flex-1 h-9 px-2">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 40">
                    <line x1="0" x2="1000" y1="28" y2="28" stroke="#D9DCD8" strokeWidth="1"></line>
                    <path d="M 0,28 L 740,28 L 760,18 L 800,8 L 1000,5" fill="none" stroke="#B83A3A" strokeWidth="1.8"></path>
                    <circle cx="740" cy="28" r="3" fill="#B83A3A"></circle>
                  </svg>
                </div>
                <div className="w-20 text-right shrink-0">
                  <span className="bg-[#B83A3A]/10 text-[#B83A3A] px-1.5 py-0.5 rounded font-bold">+355%</span>
                </div>
              </div>

              {/* Track 2: Active Connection Leases (inventory-db) */}
              <div className="flex items-center bg-[#F7F7F5] rounded-[2px] p-2 border border-[#D9DCD8]">
                <div className="w-44 flex flex-col shrink-0">
                  <div className="flex items-center gap-1 font-semibold text-[#00535f]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00535f]"></span>
                    <span>inventory-db</span>
                  </div>
                  <span className="text-[10px] text-[#70797B]">Conn Pool Leases (/200)</span>
                  <span className="text-[#00535f] font-bold">42 → 198 (Sat at T0 - 2.1s)</span>
                </div>
                <div className="flex-1 h-9 px-2">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 40">
                    <line x1="0" x2="1000" y1="30" y2="30" stroke="#D9DCD8" strokeWidth="1"></line>
                    <path d="M 0,31 L 710,31 L 725,20 L 736,5 L 1000,4" fill="none" stroke="#00535f" strokeWidth="2"></path>
                    <circle cx="725" cy="20" r="3" fill="#00535f"></circle>
                    <text x="640" y="16" fill="#00535f" fontFamily="JetBrains Mono" fontSize="9" fontWeight="600">LEAD -2.1s</text>
                  </svg>
                </div>
                <div className="w-20 text-right shrink-0">
                  <span className="bg-[#00535f]/10 text-[#00535f] px-1.5 py-0.5 rounded font-bold">99% SAT</span>
                </div>
              </div>

              {/* Track 3: Error Rate % (order-service & api-gateway) */}
              <div className="flex items-center bg-[#F7F7F5] rounded-[2px] p-2 border border-[#D9DCD8]">
                <div className="w-44 flex flex-col shrink-0">
                  <div className="flex items-center gap-1 font-semibold text-[#605889]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#605889]"></span>
                    <span>order-service &amp; GW</span>
                  </div>
                  <span className="text-[10px] text-[#70797B]">5xx HTTP Error Rate (%)</span>
                  <span className="text-[#B83A3A] font-bold">0.02% → 7.2% (+4.8s)</span>
                </div>
                <div className="flex-1 h-9 px-2">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 40">
                    <line x1="0" x2="1000" y1="34" y2="34" stroke="#D9DCD8" strokeWidth="1"></line>
                    <path d="M 0,34 L 775,34 L 795,22 L 840,9 L 1000,8" fill="none" stroke="#605889" strokeWidth="1.8"></path>
                    <circle cx="785" cy="28" r="3" fill="#605889"></circle>
                    <text x="800" y="24" fill="#605889" fontFamily="JetBrains Mono" fontSize="9" fontWeight="600">LAG +4.8s</text>
                  </svg>
                </div>
                <div className="w-20 text-right shrink-0">
                  <span className="bg-[#B83A3A]/10 text-[#B83A3A] px-1.5 py-0.5 rounded font-bold">+180x SPIKE</span>
                </div>
              </div>

              {/* Track 4: Ingress Throughput (api-gateway) */}
              <div className="flex items-center bg-[#F7F7F5] rounded-[2px] p-2 border border-[#D9DCD8]">
                <div className="w-44 flex flex-col shrink-0">
                  <div className="flex items-center gap-1 font-semibold text-[#171A19]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#70797B]"></span>
                    <span>api-gateway</span>
                  </div>
                  <span className="text-[10px] text-[#70797B]">Throughput (req/s)</span>
                  <span className="text-[#5E6561] font-medium">Flat 2.8k/s (Invariant)</span>
                </div>
                <div className="flex-1 h-9 px-2">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 40">
                    <line x1="0" x2="1000" y1="20" y2="20" stroke="#D9DCD8" strokeWidth="1"></line>
                    <path d="M 0,20 L 100,21 L 200,19 L 300,20 L 400,21 L 500,19 L 600,20 L 700,20 L 800,21 L 900,19 L 1000,20" fill="none" stroke="#70797B" strokeDasharray="4,2" strokeWidth="1.2"></path>
                    <text x="820" y="15" fill="#70797B" fontFamily="JetBrains Mono" fontSize="9">INVARIANT LOAD</text>
                  </svg>
                </div>
                <div className="w-20 text-right shrink-0">
                  <span className="bg-[#EAECE8] text-[#5E6561] px-1.5 py-0.5 rounded text-[10px]">NO LOAD ANOMALY</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cross-Service Temporal Correlation Table */}
          <div className="bg-white rounded-[3px] p-4 shadow-xs border border-[#D9DCD8]">
            <div className="flex items-center justify-between pb-2 border-b border-[#D9DCD8]">
              <span className="font-section text-[10.5px] text-[#171A19] font-bold">
                CROSS-SERVICE TEMPORAL CORRELATION · INC-8941 CASCADE SEQUENCE
              </span>
              <span className="font-code text-[10px] text-[#70797B]">DAG MODEL: V4.1.2</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-code text-[11px]">
                <thead>
                  <tr className="bg-[#F1F2F0] text-[#70797B] border-b border-[#D9DCD8] text-[10px] uppercase">
                    <th className="py-1.5 px-2">SERVICE</th>
                    <th className="py-1.5 px-2">SIGNAL TYPE</th>
                    <th className="py-1.5 px-2">ONSET TIME</th>
                    <th className="py-1.5 px-2">OFFSET (ΔT)</th>
                    <th className="py-1.5 px-2">MAGNITUDE SHIFT</th>
                    <th className="py-1.5 px-2">CORRELATION</th>
                    <th className="py-1.5 px-2">CAUSAL ROLE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9DCD8]">
                  <tr className="hover:bg-[#F7F7F5] bg-[#00535f]/5">
                    <td className="py-1.5 px-2 font-bold text-[#00535f]">inventory-db</td>
                    <td className="py-1.5 px-2">Disk I/O Wait &amp; Pool Leases</td>
                    <td className="py-1.5 px-2 font-medium">14:32:05 UTC</td>
                    <td className="py-1.5 px-2 font-bold text-[#00535f]">T0 - 2.1s</td>
                    <td className="py-1.5 px-2 text-[#B83A3A]">140ms → 1,420ms (+914%)</td>
                    <td className="py-1.5 px-2 font-bold">0.96 (Lead)</td>
                    <td className="py-1.5 px-2">
                      <span className="bg-[#00535f] text-white font-bold px-1.5 py-0.2 rounded text-[9.5px]">
                        INFERRED CAUSAL DRIVER
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#F7F7F5] bg-[#B83A3A]/5">
                    <td className="py-1.5 px-2 font-bold text-[#B83A3A]">inventory-service</td>
                    <td className="py-1.5 px-2">P99 Latency &amp; Lease Wait</td>
                    <td className="py-1.5 px-2 font-medium">14:32:07 UTC</td>
                    <td className="py-1.5 px-2 font-bold text-[#B83A3A]">T0 (Anchor)</td>
                    <td className="py-1.5 px-2 text-[#B83A3A]">180ms → 820ms (+355%)</td>
                    <td className="py-1.5 px-2 font-bold">1.00 (Anchor)</td>
                    <td className="py-1.5 px-2">
                      <span className="bg-[#B83A3A]/10 text-[#B83A3A] font-bold px-1.5 py-0.2 rounded text-[9.5px]">
                        OBSERVED TARGET ANOMALY
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#F7F7F5]">
                    <td className="py-1.5 px-2 font-semibold text-[#605889]">order-service</td>
                    <td className="py-1.5 px-2">RPC Synchronous Stalls</td>
                    <td className="py-1.5 px-2 text-[#5E6561]">14:32:11 UTC</td>
                    <td className="py-1.5 px-2 font-semibold text-[#605889]">T0 + 4.8s</td>
                    <td className="py-1.5 px-2 text-[#B83A3A]">85ms → 820ms (+864%)</td>
                    <td className="py-1.5 px-2">0.91 (Lag)</td>
                    <td className="py-1.5 px-2">
                      <span className="bg-[#EAECE8] text-[#5E6561] px-1.5 py-0.2 rounded text-[9.5px]">
                        DOWNSTREAM CASUALTY
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#F7F7F5]">
                    <td className="py-1.5 px-2 font-semibold text-[#171A19]">api-gateway</td>
                    <td className="py-1.5 px-2">504 Edge Gateway Timeouts</td>
                    <td className="py-1.5 px-2 text-[#5E6561]">14:32:14 UTC</td>
                    <td className="py-1.5 px-2 font-semibold">T0 + 7.2s</td>
                    <td className="py-1.5 px-2 text-[#B83A3A]">0.04% → 7.2% (+180x)</td>
                    <td className="py-1.5 px-2">0.88 (Lag)</td>
                    <td className="py-1.5 px-2">
                      <span className="bg-[#B83A3A]/10 text-[#B83A3A] px-1.5 py-0.2 rounded text-[9.5px]">
                        EDGE SLA BREACH
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: METRIC INSPECTOR (4 of 12 cols = ~34%) */}
        <div className="lg:col-span-4 flex flex-col gap-3 font-code">
          {/* Target Box */}
          <div className="bg-white rounded-[3px] p-3 shadow-xs border border-[#D9DCD8] flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#D9DCD8]">
              <span className="font-section text-[10px] text-[#70797B] uppercase font-bold">METRIC INSPECTOR</span>
              <span className="text-[10px] text-[#00535f] bg-[#00535f]/10 px-1.5 py-0.2 rounded font-bold">LIVE TELEMETRY</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-[#F7F7F5] p-2 rounded border border-[#D9DCD8]">
                <span className="text-[9.5px] text-[#70797B] uppercase block">CURRENT VALUE</span>
                <span className="font-metric text-[18px] font-bold text-[#B83A3A]">820 ms</span>
                <span className="text-[9.5px] text-[#B83A3A] block">CRITICAL BREACH</span>
              </div>
              <div className="bg-[#F7F7F5] p-2 rounded border border-[#D9DCD8]">
                <span className="text-[9.5px] text-[#70797B] uppercase block">BASELINE</span>
                <span className="font-metric text-[18px] font-semibold text-[#171A19]">180 ms</span>
                <span className="text-[9.5px] text-[#70797B] block">±12ms Jitter</span>
              </div>
              <div className="bg-[#F7F7F5] p-2 rounded border border-[#D9DCD8]">
                <span className="text-[9.5px] text-[#70797B] uppercase block">DELTA CHANGE</span>
                <span className="font-metric text-[18px] font-bold text-[#B83A3A]">+355%</span>
                <span className="text-[9.5px] text-[#B83A3A] block">+640ms absolute</span>
              </div>
              <div className="bg-[#F7F7F5] p-2 rounded border border-[#D9DCD8]">
                <span className="text-[9.5px] text-[#70797B] uppercase block">SLA THRESHOLD</span>
                <span className="font-metric text-[18px] font-semibold text-[#171A19]">500 ms</span>
                <span className="text-[9.5px] text-[#B83A3A] block">Exceeded by 320ms</span>
              </div>
            </div>

            {/* Causal Context */}
            <div className="bg-[#EAECE8] p-2 rounded text-[10.5px] space-y-1 mt-1 border border-[#D9DCD8]">
              <div className="flex justify-between items-center">
                <span className="font-section text-[9.5px] font-bold text-[#171A19]">CAUSAL CONTEXT</span>
                <span className="text-[9px] bg-[#00535f] text-white px-1 rounded font-bold">INFERRED UPSTREAM</span>
              </div>
              <div className="text-[#171A19]">
                Root: <strong className="text-[#00535f]">inventory-db</strong> (+2.1s delay, 91.4% confidence)
              </div>
              <p className="text-[10px] text-[#5E6561] leading-tight">
                DB disk I/O lock surge caused connection lease starvation, blocking Go goroutine acquire() loop across pods.
              </p>
            </div>
          </div>

          {/* Related Signals */}
          <div className="bg-white rounded-[3px] p-3 shadow-xs border border-[#D9DCD8] flex flex-col gap-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-[#D9DCD8]">
              <span className="font-section text-[10px] text-[#70797B] uppercase font-bold">RELATED TOPOLOGICAL SIGNALS</span>
              <span className="text-[10px] text-[#70797B]">5 NODES</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div
                onClick={() => onNavigate('root-cause')}
                className="p-1.5 bg-[#F7F7F5] hover:bg-[#EAECE8] rounded border border-[#D9DCD8] flex items-center justify-between cursor-pointer transition-colors"
              >
                <div>
                  <div className="font-bold text-[#00535f]">inventory-db · Disk I/O Wait</div>
                  <div className="text-[#B83A3A] font-bold">1,420 ms (+914%)</div>
                </div>
                <div className="w-14 h-5">
                  <svg className="w-full h-full" viewBox="0 0 60 20">
                    <path d="M 0,16 L 38,16 L 42,4 L 60,3" fill="none" stroke="#B83A3A" strokeWidth="1.5"></path>
                  </svg>
                </div>
              </div>

              <div
                onClick={() => onNavigate('root-cause')}
                className="p-1.5 bg-[#F7F7F5] hover:bg-[#EAECE8] rounded border border-[#D9DCD8] flex items-center justify-between cursor-pointer transition-colors"
              >
                <div>
                  <div className="font-bold text-[#00535f]">inventory-db · Connection Pool</div>
                  <div className="text-[#B83A3A] font-bold">198 / 200 (99% SAT)</div>
                </div>
                <div className="w-14 h-5">
                  <svg className="w-full h-full" viewBox="0 0 60 20">
                    <path d="M 0,15 L 36,15 L 40,2 L 60,2" fill="none" stroke="#B83A3A" strokeWidth="1.5"></path>
                  </svg>
                </div>
              </div>

              <div
                onClick={() => onNavigate('root-cause')}
                className="p-1.5 bg-[#F7F7F5] hover:bg-[#EAECE8] rounded border border-[#D9DCD8] flex items-center justify-between cursor-pointer transition-colors"
              >
                <div>
                  <div className="font-bold text-[#171A19]">order-service · P99 Latency</div>
                  <div className="text-[#B83A3A] font-bold">820 ms (+864%)</div>
                </div>
                <div className="w-14 h-5">
                  <svg className="w-full h-full" viewBox="0 0 60 20">
                    <path d="M 0,17 L 44,17 L 48,6 L 60,5" fill="none" stroke="#605889" strokeWidth="1.5"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="p-3 bg-white rounded-[3px] border border-[#D9DCD8] flex flex-col gap-1.5">
            <button
              onClick={() => onNavigate('root-cause')}
              className="w-full py-1.5 rounded-[2px] bg-[#00535f] text-white font-bold uppercase tracking-wider text-[11px] hover:bg-[#286B78] transition-colors cursor-pointer"
            >
              ROOT CAUSE INVESTIGATION
            </button>
            <div className="grid grid-cols-2 gap-1.5 text-[10.5px]">
              <button
                onClick={() => onNavigate('topology')}
                className="py-1 rounded-[2px] bg-[#F7F7F5] hover:bg-[#EAECE8] border border-[#D9DCD8] text-[#171A19] font-medium cursor-pointer"
              >
                TOPOLOGY
              </button>
              <button
                onClick={() => onNavigate('traces')}
                className="py-1 rounded-[2px] bg-[#F7F7F5] hover:bg-[#EAECE8] border border-[#D9DCD8] text-[#171A19] font-medium cursor-pointer"
              >
                TRACES
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
