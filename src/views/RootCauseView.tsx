import React, { useState } from 'react';
import { CORE_INCIDENT } from '../data/mockData';
import { AppPage } from '../components/layout/AppShell';

interface RootCauseViewProps {
  onNavigate: (page: AppPage) => void;
}

export const RootCauseView: React.FC<RootCauseViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'hypotheses' | 'methodology' | 'telemetry'>('hypotheses');
  const [selectedChainNode, setSelectedChainNode] = useState<string>('inventory-db');

  return (
    <div className="flex flex-col w-full h-[calc(100vh-2.75rem)] overflow-hidden bg-[#F7F7F5] select-none font-sans text-[#171A19]">
      {/* FLAGSHIP RCA TOP HEADER */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-[#FFFFFF] border-b border-[#D9DCD8] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#00535f]/10 border border-[#00535f]/30 text-[#00535f] font-code text-[11px] font-semibold uppercase tracking-wider">
            <span>EXPLAIN · ROOT CAUSE ANALYSIS</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-code text-[11px] font-bold text-[#B83A3A] px-1.5 py-0.2 rounded-[2px] bg-[#B83A3A]/10 border border-[#B83A3A]/30">
                CRITICAL
              </span>
              <h1 className="text-[15px] font-bold text-[#171A19] tracking-tight">
                {CORE_INCIDENT.id} — {CORE_INCIDENT.title}
              </h1>
            </div>
            <p className="text-[11px] text-[#5E6561]">
              Primary question: &ldquo;Why did this incident happen?&rdquo; · Inferred causal graph &amp; empirical attribution
            </p>
          </div>
        </div>

        {/* RCA Actions */}
        <div className="flex items-center gap-2 font-code text-[11px]">
          <button
            onClick={() => onNavigate('active-incidents')}
            className="px-2.5 py-1 text-[11px] font-code font-medium text-[#5E6561] hover:text-[#171A19] bg-[#FFFFFF] border border-[#D9DCD8] rounded-[3px] hover:bg-[#F1F2F0] transition-colors cursor-pointer"
          >
            ← Back to Active Incidents
          </button>
          <button
            onClick={() => onNavigate('simulation')}
            className="px-3 py-1 bg-[#286B78] hover:bg-[#00535f] text-white font-semibold rounded-[3px] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">science</span>
            <span>Run Counterfactual Simulation →</span>
          </button>
        </div>
      </div>

      {/* WORKSPACE: LEFT MAIN RCA COLUMN + RIGHT SECONDARY EVIDENCE INSPECTOR */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* LEFT COLUMN: HERO ROOT CAUSE + CAUSAL CHAIN + 5-POINT EVIDENCE + TIMELINE */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4">
          {/* SECTION 1: MOST LIKELY ROOT CAUSE HERO */}
          <div className="bg-[#FFFFFF] border border-[#D9DCD8] rounded-[4px] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9DCD8] mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00535f]"></span>
                <span className="font-section text-[10.5px] font-bold text-[#70797B] tracking-wider uppercase">
                  MOST LIKELY ROOT CAUSE
                </span>
                <span className="font-code text-[10px] px-1.5 py-0.5 rounded-[2px] bg-[#00535f]/10 text-[#00535f] font-semibold border border-[#00535f]/30">
                  INFERRED
                </span>
              </div>
              <div className="flex items-baseline gap-1 font-code">
                <span className="text-[10px] text-[#70797B] uppercase">Confidence:</span>
                <span className="text-[18px] font-bold text-[#00535f]">91.4%</span>
                <span className="text-[11px] text-[#858C87]">(Posterior Probability P=0.914)</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-3 bg-[#F0F5F6] border border-[#99F6E4]/70 rounded-[3px]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-[3px] bg-[#B83A3A]/10 border border-[#B83A3A]/30 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#B83A3A] text-[22px]">database</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-code text-[16px] font-bold text-[#171A19]">
                      inventory-db
                    </span>
                    <span className="font-code text-[11px] text-[#5E6561] px-1.5 py-0.5 bg-white border border-[#D9DCD8] rounded-[2px]">
                      PostgreSQL 15.4 · Primary (db.r6g.2xlarge)
                    </span>
                    <span className="font-code text-[10px] font-bold text-[#B83A3A] uppercase px-1.5 py-0.5 bg-[#B83A3A]/10 rounded-[2px]">
                      Origin Node
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[#2F443C] mt-1 leading-snug">
                    Storage cluster disk I/O stall exceeded threshold (1,420ms) on relation{' '}
                    <code className="font-code text-[11px] bg-white px-1 py-0.2 rounded border border-[#D9DCD8]">
                      inventory_allocations
                    </code>
                    . Exclusive transaction lock contention exhausted client connection pool, cascading gRPC timeouts upstream.
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end pl-3 md:border-l border-[#D9DCD8]/80 font-code">
                <span className="text-[10px] text-[#70797B] uppercase">T₀ Detected</span>
                <span className="text-[13px] font-bold text-[#171A19]">14:32:07 UTC</span>
                <span className="text-[10px] text-[#B83A3A] mt-0.5">Latency: 1.42s (+5800%)</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: CAUSAL CHAIN */}
          <div className="bg-[#FFFFFF] border border-[#D9DCD8] rounded-[4px] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#D9DCD8] mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#286B78]">account_tree</span>
                <span className="font-section text-[10.5px] font-bold text-[#70797B] tracking-wider uppercase">
                  CAUSAL PROPAGATION CHAIN
                </span>
              </div>
              <span className="font-code text-[10px] text-[#70797B]">
                Direction: Origin (Database) → Upstream Ingress Gateway
              </span>
            </div>

            {/* Vertical Flowchart Graph with Dominant Direction */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-3 bg-[#F7F7F5] border border-[#D9DCD8] rounded-[3px]">
              {/* Step 1: inventory-db */}
              <div
                onClick={() => setSelectedChainNode('inventory-db')}
                className={`flex-1 p-2.5 rounded-[3px] border cursor-pointer transition-all ${
                  selectedChainNode === 'inventory-db'
                    ? 'bg-white border-[#B83A3A] shadow-xs'
                    : 'bg-white border-[#D9DCD8] hover:border-[#B83A3A]'
                }`}
              >
                <div className="flex items-center justify-between font-code text-[10px] mb-1">
                  <span className="font-bold text-[#B83A3A]">T₀ 14:32:07</span>
                  <span className="px-1 py-0.2 bg-[#B83A3A]/10 text-[#B83A3A] rounded-[2px] font-bold">ORIGIN</span>
                </div>
                <div className="font-code text-[13px] font-bold text-[#171A19]">inventory-db</div>
                <div className="text-[11px] text-[#5E6561] mt-0.5">Disk I/O stall &gt; 1,200ms</div>
                <div className="font-code text-[10px] text-[#B83A3A] mt-1 font-semibold">P99: 1.42s</div>
              </div>

              {/* Hop arrow 1 */}
              <div className="flex flex-col items-center justify-center px-1 font-code text-[#70797B]">
                <span className="text-[10px] font-semibold text-[#00535f]">+2.1s</span>
                <span className="material-symbols-outlined text-[18px] text-[#286B78]">arrow_forward</span>
              </div>

              {/* Step 2: inventory-service */}
              <div
                onClick={() => setSelectedChainNode('inventory-service')}
                className={`flex-1 p-2.5 rounded-[3px] border cursor-pointer transition-all ${
                  selectedChainNode === 'inventory-service'
                    ? 'bg-white border-[#286B78] shadow-xs'
                    : 'bg-white border-[#D9DCD8] hover:border-[#286B78]'
                }`}
              >
                <div className="flex items-center justify-between font-code text-[10px] mb-1">
                  <span className="text-[#70797B]">+2.1s</span>
                  <span className="px-1 py-0.2 bg-[#D9822B]/10 text-[#C47F17] rounded-[2px] font-bold">CASCADE</span>
                </div>
                <div className="font-code text-[13px] font-bold text-[#171A19]">inventory-service</div>
                <div className="text-[11px] text-[#5E6561] mt-0.5">Pool exhaustion (98/100)</div>
                <div className="font-code text-[10px] text-[#C47F17] mt-1 font-semibold">Wait: 480ms</div>
              </div>

              {/* Hop arrow 2 */}
              <div className="flex flex-col items-center justify-center px-1 font-code text-[#70797B]">
                <span className="text-[10px] font-semibold text-[#00535f]">+4.8s</span>
                <span className="material-symbols-outlined text-[18px] text-[#286B78]">arrow_forward</span>
              </div>

              {/* Step 3: order-service */}
              <div
                onClick={() => setSelectedChainNode('order-service')}
                className={`flex-1 p-2.5 rounded-[3px] border cursor-pointer transition-all ${
                  selectedChainNode === 'order-service'
                    ? 'bg-white border-[#286B78] shadow-xs'
                    : 'bg-white border-[#D9DCD8] hover:border-[#286B78]'
                }`}
              >
                <div className="flex items-center justify-between font-code text-[10px] mb-1">
                  <span className="text-[#70797B]">+4.8s</span>
                  <span className="px-1 py-0.2 bg-[#D9822B]/10 text-[#C47F17] rounded-[2px] font-bold">CASCADE</span>
                </div>
                <div className="font-code text-[13px] font-bold text-[#171A19]">order-service</div>
                <div className="text-[11px] text-[#5E6561] mt-0.5">Thread pool timeout</div>
                <div className="font-code text-[10px] text-[#C47F17] mt-1 font-semibold">gRPC 820ms</div>
              </div>

              {/* Hop arrow 3 */}
              <div className="flex flex-col items-center justify-center px-1 font-code text-[#70797B]">
                <span className="text-[10px] font-semibold text-[#00535f]">+7.2s</span>
                <span className="material-symbols-outlined text-[18px] text-[#286B78]">arrow_forward</span>
              </div>

              {/* Step 4: api-gateway */}
              <div
                onClick={() => setSelectedChainNode('api-gateway')}
                className={`flex-1 p-2.5 rounded-[3px] border cursor-pointer transition-all ${
                  selectedChainNode === 'api-gateway'
                    ? 'bg-white border-[#B83A3A] shadow-xs'
                    : 'bg-white border-[#D9DCD8] hover:border-[#B83A3A]'
                }`}
              >
                <div className="flex items-center justify-between font-code text-[10px] mb-1">
                  <span className="font-bold text-[#B83A3A]">+7.2s</span>
                  <span className="px-1 py-0.2 bg-[#B83A3A]/10 text-[#B83A3A] rounded-[2px] font-bold">SLA BREACH</span>
                </div>
                <div className="font-code text-[13px] font-bold text-[#171A19]">api-gateway</div>
                <div className="text-[11px] text-[#5E6561] mt-0.5">504 Gateway Timeouts</div>
                <div className="font-code text-[10px] text-[#B83A3A] mt-1 font-semibold">Error: 7.2%</div>
              </div>
            </div>
          </div>

          {/* SECTION 3: WHY CAUSALOPS BELIEVES THIS (CONCISE 5-POINT EVIDENCE) */}
          <div className="bg-[#FFFFFF] border border-[#D9DCD8] rounded-[4px] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#D9DCD8] mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#00535f]">verified</span>
                <span className="font-section text-[10.5px] font-bold text-[#70797B] tracking-wider uppercase">
                  WHY CAUSALOPS BELIEVES THIS · EMPIRICAL EVIDENCE
                </span>
              </div>
              <span className="font-code text-[10.5px] text-[#00535f] font-semibold">
                5 OF 5 TESTS CONFIRMED
              </span>
            </div>

            <div className="space-y-2">
              {[
                {
                  step: 1,
                  claim: 'inventory-db latency increased first',
                  timestamp: '14:32:07.481',
                  detail: 'P99 spiked from 24ms norm to 1,420ms at T₀ (+5800%). First statistically significant anomaly across 47 fleet services.',
                  state: 'OBSERVED',
                },
                {
                  step: 2,
                  claim: 'Connection pool saturation followed',
                  timestamp: '14:32:08.104',
                  detail: 'pg_stat_activity showed 198/200 active leases with 14 callers queued waiting for locks on sku_idx.',
                  state: 'OBSERVED',
                },
                {
                  step: 3,
                  claim: 'inventory-service latency increased',
                  timestamp: '14:32:09.612',
                  detail: 'HikariCP/pgxpool wait time spiked to 480ms (+2.1s from T0); worker threads starved with zero pool availability.',
                  state: 'OBSERVED',
                },
                {
                  step: 4,
                  claim: 'order-service latency increased',
                  timestamp: '14:32:12.308',
                  detail: 'Synchronous gRPC calls to inventory.ReserveStock timed out after 3,000ms (+4.8s from T0). Thread pool saturated.',
                  state: 'OBSERVED',
                },
                {
                  step: 5,
                  claim: 'api-gateway latency increased',
                  timestamp: '14:32:14.701',
                  detail: 'Envoy edge reverse proxy exceeded 5,000ms upstream limit (+7.2s from T0), emitting 504 Gateway Timeouts to clients.',
                  state: 'OBSERVED',
                },
              ].map((ev) => (
                <div
                  key={ev.step}
                  className="flex items-start gap-3 p-2.5 rounded-[3px] bg-[#F7F7F5] border border-[#E1E5E1] hover:border-[#286B78] transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-[#00535f] text-white font-code text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {ev.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between font-code">
                      <span className="text-[12.5px] font-semibold text-[#171A19]">
                        {ev.claim}
                      </span>
                      <span className="text-[10.5px] text-[#70797B] font-medium">
                        {ev.timestamp}
                      </span>
                    </div>
                    <div className="text-[11.5px] text-[#5E6561] mt-0.5 leading-snug">
                      {ev.detail}
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-[2px] bg-[#2F7D5C]/10 text-[#2F7D5C] font-code text-[9px] font-semibold uppercase shrink-0">
                    {ev.state}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: SYNCHRONIZED EVIDENCE TIMELINE */}
          <div className="bg-[#FFFFFF] border border-[#D9DCD8] rounded-[4px] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#D9DCD8] mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#286B78]">timeline</span>
                <span className="font-section text-[10.5px] font-bold text-[#70797B] tracking-wider uppercase">
                  SYNCHRONIZED EVIDENCE TIMELINE
                </span>
              </div>
              <div className="flex items-center gap-3 font-code text-[10px] text-[#70797B]">
                <span>T₀: 14:32:07</span>
                <span>·</span>
                <span>Window: T₀-1m → T₀+10s</span>
              </div>
            </div>

            {/* Micro Multi-Track Timeline Chart */}
            <div className="space-y-2 font-code text-[11px]">
              {CORE_INCIDENT.steps.map((step) => (
                <div key={step.step} className="flex items-center gap-3 p-2 bg-[#F7F7F5] rounded-[3px] border border-[#EAECE8]">
                  <span className="w-28 text-[11px] font-bold text-[#171A19] truncate shrink-0">
                    {step.serviceId}
                  </span>
                  <div className="w-20 text-[10px] text-[#00535f] font-semibold shrink-0">
                    {step.offsetSeconds}
                  </div>
                  <div className="flex-1 relative h-4 bg-white rounded-[2px] border border-[#D9DCD8] overflow-hidden">
                    {/* Simulated Timeline Offset Bar */}
                    <div
                      style={{
                        marginLeft: `${(step.step - 1) * 24}%`,
                        width: `${100 - (step.step - 1) * 24}%`,
                      }}
                      className={`h-full ${
                        step.status === 'critical' ? 'bg-[#B83A3A]' : 'bg-[#D9822B]'
                      } opacity-80`}
                    ></div>
                  </div>
                  <span className="w-24 text-right text-[11px] font-bold text-[#171A19] shrink-0">
                    {step.metricValue}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SECONDARY EVIDENCE TABS (HYPOTHESES, METHODOLOGY, TELEMETRY) */}
        <div className="w-[380px] bg-[#FFFFFF] border-l border-[#D9DCD8] flex flex-col shrink-0 overflow-y-auto">
          {/* Tab Selector */}
          <div className="flex border-b border-[#D9DCD8] bg-[#F1F2F0]">
            <button
              onClick={() => setActiveTab('hypotheses')}
              className={`flex-1 py-2 text-[11px] font-code font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === 'hypotheses'
                  ? 'bg-white text-[#00535f] border-[#00535f]'
                  : 'text-[#5E6561] border-transparent hover:text-[#171A19]'
              }`}
            >
              Hypotheses ({CORE_INCIDENT.competingHypotheses.length})
            </button>
            <button
              onClick={() => setActiveTab('methodology')}
              className={`flex-1 py-2 text-[11px] font-code font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === 'methodology'
                  ? 'bg-white text-[#00535f] border-[#00535f]'
                  : 'text-[#5E6561] border-transparent hover:text-[#171A19]'
              }`}
            >
              Methodology
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`flex-1 py-2 text-[11px] font-code font-semibold uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === 'telemetry'
                  ? 'bg-white text-[#00535f] border-[#00535f]'
                  : 'text-[#5E6561] border-transparent hover:text-[#171A19]'
              }`}
            >
              Evidence Logs
            </button>
          </div>

          {/* TAB 1: ALTERNATIVE HYPOTHESES */}
          {activeTab === 'hypotheses' && (
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              <div>
                <div className="font-section text-[10px] text-[#70797B] font-semibold tracking-wider uppercase mb-1">
                  COMPETING ROOT CAUSE CANDIDATES
                </div>
                <p className="text-[11px] text-[#5E6561]">
                  Bayesian causal model evaluated all candidate services against Granger causality and temporal sequence.
                </p>
              </div>

              <div className="space-y-2">
                {CORE_INCIDENT.competingHypotheses.map((hyp, index) => {
                  const isTop = index === 0;
                  return (
                    <div
                      key={hyp.serviceId}
                      className={`p-3 rounded-[3px] border ${
                        isTop
                          ? 'bg-[#F0F5F6] border-[#00535f]/50'
                          : 'bg-[#F7F7F5] border-[#D9DCD8]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-code">
                          <span
                            className={`text-[12px] font-bold ${
                              isTop ? 'text-[#00535f]' : 'text-[#171A19]'
                            }`}
                          >
                            {hyp.serviceId}
                          </span>
                          {isTop && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#00535f] text-white">
                              ACCEPTED
                            </span>
                          )}
                        </div>
                        <span
                          className={`font-code text-[12px] font-bold ${
                            isTop ? 'text-[#00535f]' : 'text-[#70797B]'
                          }`}
                        >
                          {hyp.confidence}%
                        </span>
                      </div>
                      <p className="text-[11.5px] text-[#5E6561] leading-relaxed">
                        {hyp.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: METHODOLOGY & FIVE CRITERIA */}
          {activeTab === 'methodology' && (
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              <div>
                <div className="font-section text-[10px] text-[#70797B] font-semibold tracking-wider uppercase mb-1">
                  SCM &amp; INTERVENTION CALCULUS
                </div>
                <div className="p-2.5 rounded-[3px] bg-[#F7F7F5] border border-[#D9DCD8] font-code text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#70797B]">Model Framework:</span>
                    <span className="font-semibold text-[#171A19]">Structural Causal Model (SCM)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#70797B]">Inference Test:</span>
                    <span className="font-semibold text-[#00535f]">Granger Causality (F=41.2, p&lt;0.0001)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#70797B]">Confounders:</span>
                    <span className="font-semibold text-[#171A19]">Controlled (Deployment, Traffic)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#70797B]">DAG Propagation:</span>
                    <span className="font-semibold text-[#2F7D5C]">CONFIRMED (Zero Variance)</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="font-section text-[10px] text-[#70797B] font-semibold tracking-wider uppercase mb-2">
                  5 VERIFIED CAUSAL CRITERIA
                </div>
                <div className="space-y-1.5">
                  {CORE_INCIDENT.fiveCriteria.map((c) => (
                    <div
                      key={c.number}
                      className="p-2 rounded-[3px] bg-[#F7F7F5] border border-[#E1E5E1] text-[11px]"
                    >
                      <div className="flex items-center justify-between font-code mb-0.5">
                        <span className="font-bold text-[#171A19]">
                          {c.number}. {c.name}
                        </span>
                        <span className="text-[#2F7D5C] font-semibold flex items-center gap-0.5 text-[10px]">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span>
                          PASS
                        </span>
                      </div>
                      <div className="text-[10px] text-[#70797B] font-code">{c.source}</div>
                      <div className="text-[#5E6561] text-[10.5px] mt-0.5 leading-snug">{c.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CORRELATED TELEMETRY LOGS */}
          {activeTab === 'telemetry' && (
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              <div>
                <div className="font-section text-[10px] text-[#70797B] font-semibold tracking-wider uppercase mb-1">
                  CORRELATED LOGS &amp; SPANS
                </div>
                <p className="text-[11px] text-[#5E6561]">
                  Telemetry events temporally aligned with the T₀ anomaly inception.
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-[3px] bg-[#0A0D0E] text-[#D8E1E8] font-code text-[10.5px]">
                  <div className="text-[#B83A3A] font-bold">14:32:07.481 · inventory-db (Origin)</div>
                  <div className="text-[#869CB0] mt-1">
                    Disk I/O wait exceeded threshold: 1420ms on relation &apos;inventory_allocations&apos; (lock contention PID 28411)
                  </div>
                  <div className="mt-1 pt-1 border-t border-[#1E2428] text-[9.5px] text-[#5E6561]">
                    db.lock_type: ExclusiveLock · client_ip: 10.240.12.84
                  </div>
                </div>

                <div className="p-2.5 rounded-[3px] bg-[#0A0D0E] text-[#D8E1E8] font-code text-[10.5px]">
                  <div className="text-[#D9822B] font-bold">14:32:09.612 · inventory-service</div>
                  <div className="text-[#869CB0] mt-1">
                    Connection acquisition timeout after 2000ms: max_wait_duration exceeded in pgxpool.Acquire()
                  </div>
                </div>

                <div className="p-2.5 rounded-[3px] bg-[#0A0D0E] text-[#D8E1E8] font-code text-[10.5px]">
                  <div className="text-[#B83A3A] font-bold">14:32:14.701 · api-gateway</div>
                  <div className="text-[#869CB0] mt-1">
                    504 Gateway Timeout on POST /v2/checkout (upstream order-service timeout)
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#D9DCD8] flex gap-2">
                <button
                  onClick={() => onNavigate('logs')}
                  className="flex-1 py-1.5 bg-[#FFFFFF] border border-[#D9DCD8] text-[#171A19] font-code text-[10px] font-medium rounded-[3px] hover:bg-[#F1F2F0] transition-colors cursor-pointer"
                >
                  Open Full Logs →
                </button>
                <button
                  onClick={() => onNavigate('traces')}
                  className="flex-1 py-1.5 bg-[#FFFFFF] border border-[#D9DCD8] text-[#171A19] font-code text-[10px] font-medium rounded-[3px] hover:bg-[#F1F2F0] transition-colors cursor-pointer"
                >
                  Open Full Traces →
                </button>
              </div>
            </div>
          )}

          {/* BOTTOM ACTIONS BAR */}
          <div className="p-4 bg-[#F7F7F5] border-t border-[#D9DCD8] flex flex-col gap-2 shrink-0">
            <button
              onClick={() => onNavigate('simulation')}
              className="w-full h-8 px-4 rounded-[3px] bg-[#286B78] hover:bg-[#00535f] text-white font-code text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">science</span>
              <span>RUN COUNTERFACTUAL SIMULATION</span>
            </button>
            <button
              onClick={() => onNavigate('predictions')}
              className="w-full h-7 px-2 rounded-[3px] bg-white border border-[#D9DCD8] text-[#5E6561] hover:text-[#171A19] font-code text-[10px] font-medium transition-colors cursor-pointer"
            >
              View Future Failure Predictions →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
