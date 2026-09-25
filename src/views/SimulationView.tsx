import React, { useState } from 'react';
import { SIMULATION_SCENARIOS, CORE_INCIDENT } from '../data/mockData';
import { AppPage } from '../components/layout/AppShell';

interface SimulationViewProps {
  onNavigate: (page: AppPage) => void;
}

export const SimulationView: React.FC<SimulationViewProps> = ({ onNavigate }) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('reduce-latency-70');
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(180);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const activeScenario =
    SIMULATION_SCENARIOS.find((s) => s.id === selectedScenarioId) || SIMULATION_SCENARIOS[0];

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 700);
  };

  return (
    <div className="flex flex-col w-full font-sans text-[#171A19] p-4 bg-[#F7F7F5] select-text">
      {/* 1. WORKSPACE SUB-HEADER / INCIDENT & INTERVENTION SELECTOR STRIP */}
      <section className="bg-white p-3 mb-3 shadow-xs border border-[#D9DCD8] rounded-[3px]">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Incident Identification & Telemetry Context */}
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#B83A3A]/10 text-[#B83A3A] font-code text-[10px] font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B83A3A]"></span>
                {CORE_INCIDENT.id} · CRITICAL CASCADE
              </span>
              <span className="text-[15px] font-semibold text-[#171A19] tracking-tight">Database Latency Cascade</span>
              <span className="font-code text-[10px] text-[#5E6561] font-medium px-1.5 py-0.5 bg-[#F1F2F0] rounded-[2px]">
                POSTERIOR CONF: 91.4%
              </span>
            </div>
            <div className="flex items-center gap-x-3 gap-y-1 font-code text-[11px] text-[#5E6561] flex-wrap mt-0.5">
              <span className="flex items-center gap-1">
                <span className="text-[#171A19] font-medium">Root Cause:</span>
                <span className="text-[#00535f] font-medium">inventory-db.cluster-east</span>
              </span>
              <span className="text-[#D9DCD8]">/</span>
              <span className="flex items-center gap-1">
                <span className="text-[#171A19] font-medium">Observed T0 Latency:</span>
                <span className="text-[#B83A3A] font-semibold">1.42s</span>
              </span>
              <span className="text-[#D9DCD8]">/</span>
              <span className="flex items-center gap-1">
                <span className="text-[#171A19] font-medium">Pool Saturation:</span>
                <span className="text-[#B83A3A] font-medium">198 / 200 (99%)</span>
              </span>
              <span className="text-[#D9DCD8]">/</span>
              <span className="flex items-center gap-1">
                <span className="text-[#171A19] font-medium">Blast Radius:</span>
                <span>4 upstream tiers compromised</span>
              </span>
            </div>
          </div>

          {/* Intervention Specifier & Execution Hub */}
          <div className="flex items-center gap-2 flex-wrap self-start xl:self-center">
            {/* Active Specifier */}
            <div className="flex items-center bg-[#F7F7F5] px-2 py-1 rounded-[2px] gap-2 border border-[#D9DCD8]">
              <div className="w-2 h-2 rounded-full bg-[#00535f]"></div>
              <div className="flex flex-col">
                <span className="font-code text-[11px] text-[#171A19] font-medium flex items-center gap-1.5">
                  <span className="text-[#00535f] font-semibold">[INTERVENTION SPECIFICATION]</span>
                  {activeScenario.description}
                </span>
                <span className="font-code text-[9.5px] text-[#70797B]">
                  Modeled Component: {activeScenario.modeledComponent} · Horizon: 300s · Structural Causal Model
                </span>
              </div>
            </div>

            {/* Quick Switch Selector Tabs */}
            <div className="hidden sm:flex items-center bg-[#F1F2F0] rounded-[2px] p-0.5 border border-[#D9DCD8]">
              {SIMULATION_SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedScenarioId(s.id)}
                  className={`px-2.5 py-1 text-[11px] font-code rounded-[2px] transition-colors cursor-pointer ${
                    selectedScenarioId === s.id
                      ? 'bg-white text-[#171A19] font-semibold shadow-xs border border-[#D9DCD8]'
                      : 'text-[#5E6561] hover:text-[#171A19]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Primary Run Button */}
            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="h-8 px-3 bg-[#00535f] text-white font-code text-[11px] rounded-[2px] flex items-center gap-1.5 hover:bg-[#286B78] active:scale-[0.98] transition-all cursor-pointer font-medium tracking-wide uppercase disabled:opacity-80 shadow-xs"
            >
              <span className={`material-symbols-outlined text-[15px] ${isSimulating ? 'animate-spin' : ''}`}>
                {isSimulating ? 'sync' : 'play_arrow'}
              </span>
              <span>{isSimulating ? 'SIMULATING SCM...' : 'Run Simulation'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. CORE WORKSPACE: 2-COLUMN BALANCED ANALYTICAL ARCHITECTURE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 w-full">
        {/* LEFT COLUMN: SIMULATION TRAJECTORY & TOPOLOGY PROPAGATION (8 of 12 cols ≈ 66%) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* A. DUAL TRAJECTORY SIMULATION CHART */}
          <section className="bg-white p-3 rounded-[3px] shadow-xs border border-[#D9DCD8] flex flex-col gap-2.5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 gap-1 border-b border-[#D9DCD8]">
              <div className="flex flex-col">
                <span className="font-section text-[10.5px] text-[#70797B] uppercase tracking-wider">Comparative Dynamics</span>
                <h2 className="text-[15px] text-[#171A19] font-semibold tracking-tight">
                  Incident Impact Trajectory: Baseline vs Counterfactual
                </h2>
              </div>
              <div className="flex items-center gap-2 font-code text-[10px] text-[#5E6561]">
                <span className="px-2 py-0.5 bg-[#F7F7F5] rounded-[2px] border border-[#D9DCD8] font-medium text-[#00535f]">
                  SIMULATION PARAMETERS: Horizon 300s · Resolution 1.0s
                </span>
              </div>
            </div>

            {/* Legend & Scrubber Delta Header */}
            <div className="flex items-center justify-between bg-[#F7F7F5] px-3 py-1.5 rounded-[2px] text-[10.5px] font-code flex-wrap gap-2 border border-[#D9DCD8]">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-[2.5px] bg-[#B83A3A] inline-block"></span>
                  <span className="font-medium text-[#171A19]">Baseline (No Intervention)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-[2.5px] bg-[#286B78] inline-block"></span>
                  <span className="font-medium text-[#171A19]">Counterfactual ({activeScenario.label})</span>
                </div>
                <div className="flex items-center gap-1 text-[#5E6561]">
                  <span className="w-3 h-2 bg-[#286B78]/25 border border-[#286B78]/40 rounded-[1px] inline-block"></span>
                  <span>Model Uncertainty Range (74%–88% CI)</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white rounded-[2px] text-[#171A19] font-medium border border-[#D9DCD8]">
                <span className="text-[#5E6561]">SIMULATION TIME T+{currentTimeSec}s:</span>
                <span className="text-[#B83A3A] font-semibold">96%</span>
                <span className="text-[#5E6561]">vs</span>
                <span className="text-[#00535f] font-semibold">12%</span>
                <span className="px-1.5 py-0.2 bg-[#00535f]/10 text-[#00535f] font-semibold rounded-[2px]">
                  Δ -84 pp
                </span>
              </div>
            </div>

            {/* SVG Precise Coordinate Chart Area */}
            <div className="relative w-full aspect-[21/9] min-h-[290px] max-h-[380px] bg-white overflow-hidden select-none border border-[#D9DCD8] rounded-[2px]">
              <svg className="w-full h-full text-[#BFC8CB]" preserveAspectRatio="none" viewBox="0 0 1000 420">
                {/* Horizontal Gridlines */}
                <line stroke="currentColor" strokeDasharray="2 4" strokeOpacity="0.45" x1="60" x2="960" y1="40" y2="40"></line>
                <line stroke="currentColor" strokeDasharray="2 4" strokeOpacity="0.45" x1="60" x2="960" y1="115" y2="115"></line>
                <line stroke="currentColor" strokeDasharray="2 4" strokeOpacity="0.45" x1="60" x2="960" y1="190" y2="190"></line>
                <line stroke="currentColor" strokeDasharray="2 4" strokeOpacity="0.45" x1="60" x2="960" y1="265" y2="265"></line>
                <line stroke="currentColor" strokeOpacity="0.9" x1="60" x2="960" y1="340" y2="340"></line>

                {/* Vertical Time Gridlines */}
                <line stroke="currentColor" strokeDasharray="2 4" strokeOpacity="0.4" x1="60" x2="60" y1="40" y2="340"></line>
                <line stroke="currentColor" strokeDasharray="2 4" strokeOpacity="0.25" x1="150" x2="150" y1="40" y2="340"></line>
                <line stroke="currentColor" strokeDasharray="2 4" strokeOpacity="0.25" x1="240" x2="240" y1="40" y2="340"></line>
                <line stroke="currentColor" strokeDasharray="2 4" strokeOpacity="0.25" x1="420" x2="420" y1="40" y2="340"></line>
                <line stroke="currentColor" strokeDasharray="2 4" strokeOpacity="0.25" x1="600" x2="600" y1="40" y2="340"></line>
                <line stroke="currentColor" strokeDasharray="2 4" strokeOpacity="0.25" x1="780" x2="780" y1="40" y2="340"></line>
                <line stroke="currentColor" strokeDasharray="2 4" strokeOpacity="0.25" x1="960" x2="960" y1="40" y2="340"></line>

                {/* Y Axis Labels */}
                <text className="fill-[#70797B] text-[11px] font-code" textAnchor="end" x="50" y="44">100%</text>
                <text className="fill-[#70797B] text-[11px] font-code" textAnchor="end" x="50" y="119">75%</text>
                <text className="fill-[#70797B] text-[11px] font-code" textAnchor="end" x="50" y="194">50%</text>
                <text className="fill-[#70797B] text-[11px] font-code" textAnchor="end" x="50" y="269">25%</text>
                <text className="fill-[#70797B] text-[11px] font-code" textAnchor="end" x="50" y="344">0%</text>

                {/* X Axis Labels */}
                <text className="fill-[#70797B] text-[11px] font-code" textAnchor="middle" x="60" y="362">T0</text>
                <text className="fill-[#70797B] text-[11px] font-code" textAnchor="middle" x="150" y="362">30s</text>
                <text className="fill-[#70797B] text-[11px] font-code" textAnchor="middle" x="240" y="362">60s</text>
                <text className="fill-[#70797B] text-[11px] font-code" textAnchor="middle" x="420" y="362">120s</text>
                <text className="fill-[#70797B] text-[11px] font-code" textAnchor="middle" x="600" y="362">180s</text>
                <text className="fill-[#70797B] text-[11px] font-code" textAnchor="middle" x="780" y="362">240s</text>
                <text className="fill-[#70797B] text-[11px] font-code" textAnchor="middle" x="960" y="362">300s</text>

                {/* Intervention Marker at T+10s (x = 90) */}
                <line stroke="#286B78" strokeDasharray="3 3" strokeWidth="1.5" x1="90" x2="90" y1="30" y2="340"></line>
                <rect fill="#ADEDFC" height="20" rx="2" stroke="#286B78" strokeWidth="0.5" width="186" x="94" y="32"></rect>
                <text className="text-[10px] font-code fill-[#001F25] font-semibold" x="99" y="46">
                  T+10s: INTERVENTION APPLIED
                </text>

                {/* CI Range Ribbon */}
                <polygon
                  fill="#286B78"
                  fillOpacity="0.14"
                  points="
                    90,62
                    150,110 240,200 420,270 600,290 780,304 960,310
                    960,322 780,318 600,314 420,302 240,234 150,138
                    90,62
                  "
                ></polygon>

                {/* BASELINE TRAJECTORY: Deep Red */}
                <path
                  d="M 60,62 L 90,62 Q 150,56 240,54 T 420,52 T 600,50 T 960,49"
                  fill="none"
                  stroke="#B83A3A"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                ></path>

                {/* COUNTERFACTUAL TRAJECTORY: Teal */}
                <path
                  d="M 60,62 L 90,62 C 120,70 140,110 150,124 C 180,165 210,200 240,217 C 320,265 370,280 420,286 C 500,296 550,302 600,304 C 750,310 880,313 960,316"
                  fill="none"
                  stroke="#286B78"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                ></path>

                {/* Playhead Marker at current time */}
                {(() => {
                  const playheadX = 60 + (currentTimeSec / 300) * 900;
                  return (
                    <g>
                      <line
                        stroke="#161D1A"
                        strokeDasharray="4 2"
                        strokeOpacity="0.85"
                        strokeWidth="1.2"
                        x1={playheadX}
                        x2={playheadX}
                        y1="20"
                        y2="340"
                      ></line>
                      <rect fill="#161D1A" height="20" rx="2" width="370" x={Math.max(60, playheadX - 185)} y="16"></rect>
                      <text
                        className="text-[10px] font-code fill-[#FFFFFF] font-medium"
                        textAnchor="middle"
                        x={Math.max(60, playheadX - 185) + 185}
                        y="30"
                      >
                        SIMULATION TIME T+{currentTimeSec}s · Baseline: 96% vs Counterfactual: 12% (Δ -84 pp)
                      </text>
                    </g>
                  );
                })()}

                {/* End Callout Labels */}
                <text className="text-[10px] font-code fill-[#B83A3A] font-semibold" textAnchor="end" x="955" y="42">
                  BASELINE: Sustained Cascade (97%)
                </text>
                <text className="text-[10px] font-code fill-[#286B78] font-semibold" textAnchor="end" x="955" y="332">
                  COUNTERFACTUAL: Stabilized (8%)
                </text>
              </svg>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between bg-[#F7F7F5] px-3 py-2 rounded-[2px] gap-3 flex-wrap border border-[#D9DCD8]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-7 h-7 flex items-center justify-center rounded-[2px] bg-white text-[#171A19] hover:bg-[#EAECE8] transition-colors cursor-pointer border border-[#D9DCD8]"
                >
                  <span className="material-symbols-outlined text-[16px]">{isPlaying ? 'pause' : 'play_arrow'}</span>
                </button>
                <button
                  onClick={() => setCurrentTimeSec(180)}
                  className="w-7 h-7 flex items-center justify-center rounded-[2px] bg-white text-[#171A19] hover:bg-[#EAECE8] transition-colors cursor-pointer border border-[#D9DCD8]"
                  title="Reset to T+180s"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                </button>
                <span className="ml-2 font-code text-[11px] text-[#5E6561] uppercase font-medium">PLAYBACK</span>
              </div>

              {/* Slider */}
              <div className="flex-1 max-w-md flex items-center gap-2 mx-2">
                <span className="font-code text-[11px] text-[#171A19] font-semibold">T0</span>
                <input
                  type="range"
                  min="0"
                  max="300"
                  value={currentTimeSec}
                  onChange={(e) => setCurrentTimeSec(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#D9DCD8] rounded-full accent-[#00535f] cursor-pointer"
                />
                <span className="font-code text-[11px] text-[#171A19] font-semibold">T+300s</span>
              </div>

              <div className="flex items-center gap-3 font-code text-[11px]">
                <div className="px-2 py-0.5 rounded-[2px] bg-[#EAECE8] text-[#171A19] font-medium border border-[#D9DCD8]">
                  CURR: <span className="font-semibold text-[#00535f]">T0+{currentTimeSec}s</span>
                </div>
                <div className="flex items-center gap-1 text-[#5E6561]">
                  <span>SPEED:</span>
                  <span className="font-semibold text-[#171A19]">1.0x</span>
                </div>
              </div>
            </div>
          </section>

          {/* B. TOPOLOGY STATE COMPARISON (SPLIT COMPARISON AT T+180s) */}
          <section className="bg-white p-3 rounded-[3px] shadow-xs border border-[#D9DCD8] flex flex-col gap-2.5">
            <div className="flex items-center justify-between pb-1 border-b border-[#D9DCD8]">
              <div>
                <span className="font-section text-[10.5px] text-[#70797B] uppercase tracking-wider">Topology State Comparison</span>
                <h3 className="text-[15px] text-[#171A19] font-semibold tracking-tight">
                  Dynamic Topology State Comparison at T+{currentTimeSec}s
                </h3>
              </div>
              <span className="font-code text-[10px] text-[#5E6561] bg-[#F1F2F0] px-2 py-0.5 rounded-[2px] border border-[#D9DCD8]">
                DYNAMIC SCM SLICE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Left Sub-Panel: Baseline (Failing Cascade) */}
              <div className="bg-[#111416] p-3 rounded-[3px] text-white flex flex-col justify-between min-h-[360px] border border-[#252A2E]">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#252A2E]">
                    <span className="font-code text-[11px] text-[#FFA4A4] font-semibold tracking-wide flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#B83A3A] animate-pulse"></span>
                      BASELINE FUTURE (NO INTERVENTION)
                    </span>
                    <span className="font-code text-[10px] text-[#8E9599]">6 TIERS IMPACTED</span>
                  </div>
                  <div className="mt-2 font-code text-[10.5px] text-[#FFDAD6] font-medium flex items-center justify-between">
                    <span>CASCADE EXPANDING · 504 TIMEOUTS DOMINATING INGRESS</span>
                    <span className="text-[#B83A3A] font-semibold uppercase text-[10px]">Unmitigated</span>
                  </div>

                  {/* Directed Chain Visualization */}
                  <div className="mt-3 flex flex-col gap-1.5 font-code text-[11px]">
                    {/* Node 1 */}
                    <div className="p-2 rounded bg-[#1E2327] border-l-2 border-[#B83A3A] flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold">inventory-db</div>
                        <div className="text-[#FFB4AB] text-[10px]">DISK I/O BOTTLENECK · POOL 100%</div>
                      </div>
                      <span className="px-1.5 py-0.5 bg-[#B83A3A]/30 text-[#FFB4AB] rounded font-medium">1.48s (CRIT)</span>
                    </div>
                    <div className="flex justify-center text-[#FF897D] text-[10px] -my-1">↓ lock contention propagates</div>

                    {/* Node 2 */}
                    <div className="p-2 rounded bg-[#1E2327] border-l-2 border-[#B83A3A] flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold">inventory-service</div>
                        <div className="text-[#FFB4AB] text-[10px]">THREAD EXHAUSTION · 200/200 BUSY</div>
                      </div>
                      <span className="px-1.5 py-0.5 bg-[#B83A3A]/30 text-[#FFB4AB] rounded font-medium">1.21s (CRIT)</span>
                    </div>
                    <div className="flex justify-center text-[#FF897D] text-[10px] -my-1">↓ blocking gRPC calls</div>

                    {/* Node 3 */}
                    <div className="p-2 rounded bg-[#1E2327] border-l-2 border-[#B83A3A]/60 flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold">order-service</div>
                        <div className="text-[#E0E3E2] text-[10px]">SYNC RPC RETRIES TRIPPED</div>
                      </div>
                      <span className="px-1.5 py-0.5 bg-[#B83A3A]/20 text-[#FFB4AB] rounded font-medium">P99 890ms</span>
                    </div>
                    <div className="flex justify-center text-[#FF897D] text-[10px] -my-1">↓ circuit breaker trips</div>

                    {/* Node 4 */}
                    <div className="p-2 rounded bg-[#1E2327] border-l-2 border-[#B83A3A] flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold">api-gateway</div>
                        <div className="text-[#FFB4AB] text-[10px]">504 GATEWAY TIMEOUT RATE: 8.6%</div>
                      </div>
                      <span className="px-1.5 py-0.5 bg-[#B83A3A] text-white rounded font-semibold">FAILS SLA</span>
                    </div>
                    <div className="flex justify-center text-[#C9BFF7] text-[10px] -my-1">··· predicted failure cascade in +18s ···</div>

                    {/* Downstream */}
                    <div className="p-1.5 rounded bg-[#161A1D] border border-dashed border-[#48406F] flex items-center justify-between opacity-80">
                      <span className="text-[#C9BFF7]">checkout-service &amp; notification-service</span>
                      <span className="text-[10px] text-[#FFB4AB] font-medium">PREDICTED HALT (+24s)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-[#252A2E] flex items-center justify-between font-code text-[10px] text-[#8E9599]">
                  <span>BLAST RADIUS: EXPANDING</span>
                  <span className="text-[#B83A3A] font-medium">MTTF PROJECTION: &lt; 4 MIN</span>
                </div>
              </div>

              {/* Right Sub-Panel: Counterfactual (Intervened Recovery) */}
              <div className="bg-[#111416] p-3 rounded-[3px] text-white flex flex-col justify-between min-h-[360px] border border-[#252A2E]">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#252A2E]">
                    <span className="font-code text-[11px] text-[#ADEDFC] font-semibold tracking-wide flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#286B78] animate-pulse"></span>
                      COUNTERFACTUAL FUTURE ({activeScenario.label})
                    </span>
                    <span className="font-code text-[10px] text-[#ADEDFC] font-semibold">STABILIZED</span>
                  </div>
                  <div className="mt-2 font-code text-[10.5px] text-[#91D0DF] font-medium flex items-center justify-between">
                    <span>CASCADE ARRESTED · 4/4 SERVICES RESTORED WITHIN ENVELOPE</span>
                    <span className="text-[#ADEDFC] font-semibold uppercase text-[10px]">{activeScenario.servicesRecovered}</span>
                  </div>

                  {/* Directed Recovered Chain */}
                  <div className="mt-3 flex flex-col gap-1.5 font-code text-[11px]">
                    {/* Node 1 */}
                    <div className="p-2 rounded bg-[#152427] border-l-2 border-[#ADEDFC] flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold">inventory-db</div>
                        <div className="text-[#91D0DF] text-[10px]">SYNTHETIC INTERVENTION APPLIED</div>
                      </div>
                      <span className="px-1.5 py-0.5 bg-[#00535f]/60 text-[#ADEDFC] rounded font-medium">28ms (NOMINAL)</span>
                    </div>
                    <div className="flex justify-center text-[#91D0DF] text-[10px] -my-1">↓ pool unblocks instantly</div>

                    {/* Node 2 */}
                    <div className="p-2 rounded bg-[#172224] border-l-2 border-[#91D0DF] flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold">inventory-service</div>
                        <div className="text-[#B2CCC6] text-[10px]">THREAD POOL CLEAR · 14/200 IN USE</div>
                      </div>
                      <span className="px-1.5 py-0.5 bg-[#286B78] text-white rounded font-medium">18ms (HEALTHY)</span>
                    </div>
                    <div className="flex justify-center text-[#91D0DF] text-[10px] -my-1">↓ RPC queues evacuate</div>

                    {/* Node 3 */}
                    <div className="p-2 rounded bg-[#172224] border-l-2 border-[#91D0DF] flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold">order-service</div>
                        <div className="text-[#B2CCC6] text-[10px]">SYNCHRONOUS PIPELINE UNCLOGGED</div>
                      </div>
                      <span className="px-1.5 py-0.5 bg-[#286B78] text-white rounded font-medium">P99 38ms</span>
                    </div>
                    <div className="flex justify-center text-[#91D0DF] text-[10px] -my-1">↓ error budget preserved</div>

                    {/* Node 4 */}
                    <div className="p-2 rounded bg-[#172224] border-l-2 border-[#91D0DF] flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold">api-gateway</div>
                        <div className="text-[#B2CCC6] text-[10px]">504 TIMEOUT RATE RESTORED: 0.04%</div>
                      </div>
                      <span className="px-1.5 py-0.5 bg-[#00535f] text-white rounded font-semibold">OPERATIONAL</span>
                    </div>
                    <div className="flex justify-center text-[#ADEDFC] text-[10px] -my-1">··· downstream dependencies protected ···</div>

                    {/* Downstream */}
                    <div className="p-1.5 rounded bg-[#141B1D] border border-dashed border-[#286B78]/50 flex items-center justify-between">
                      <span className="text-[#91D0DF]">checkout-service &amp; notification-service</span>
                      <span className="text-[10px] text-[#ADEDFC] font-medium">NOMINAL TRAFFIC</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-[#252A2E] flex items-center justify-between font-code text-[10px] text-[#91D0DF]">
                  <span>CASCADE SUPPRESSED: 100%</span>
                  <span className="text-[#ADEDFC] font-medium">CONVERGENCE TIME: 142s</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: OUTCOME & ATTENUATION (4 of 12 cols ≈ 34%) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* A. MODEL-ESTIMATED OUTCOME SUMMARY */}
          <section className="bg-white p-3 rounded-[3px] shadow-xs border border-[#D9DCD8] flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#D9DCD8]">
              <div>
                <span className="font-section text-[10px] text-[#70797B] uppercase tracking-wider">Intervention Analysis</span>
                <h3 className="text-[14px] text-[#171A19] font-semibold tracking-tight">MODEL-ESTIMATED OUTCOME</h3>
              </div>
              <span className="px-1.5 py-0.5 rounded-[2px] bg-[#F1F2F0] text-[#00535f] font-code text-[9.5px] font-semibold border border-[#D9DCD8]">
                SIMULATED PROJECTION · 74%–88% CI
              </span>
            </div>

            <div className="flex flex-col gap-2 mt-1">
              <div className="p-2 bg-[#F7F7F5] rounded-[2px] flex items-center justify-between border border-[#D9DCD8]/60">
                <div className="flex flex-col font-code">
                  <span className="text-[9.5px] text-[#70797B] font-medium uppercase">PREDICTED PEAK IMPACT</span>
                  <div className="flex items-center gap-1 text-[13px] text-[#171A19] mt-0.5">
                    <span className="text-[#B83A3A] line-through font-semibold">{activeScenario.predictedPeakImpact.from}%</span>
                    <span>→</span>
                    <span className="text-[#00535f] font-bold">{activeScenario.predictedPeakImpact.to}%</span>
                  </div>
                </div>
                <span className="font-code text-[11px] px-2 py-0.5 bg-white text-[#00535f] font-semibold rounded-[2px] border border-[#D9DCD8]">
                  {activeScenario.predictedPeakImpact.delta}
                </span>
              </div>

              <div className="p-2 bg-[#F7F7F5] rounded-[2px] flex items-center justify-between border border-[#D9DCD8]/60">
                <div className="flex flex-col font-code">
                  <span className="text-[9.5px] text-[#70797B] font-medium uppercase">SERVICES RECOVERED</span>
                  <div className="text-[13px] text-[#171A19] font-semibold mt-0.5">
                    {activeScenario.servicesRecovered}
                  </div>
                </div>
                <span className="font-code text-[11px] px-2 py-0.5 bg-white text-[#00535f] font-semibold rounded-[2px] border border-[#D9DCD8]">
                  {activeScenario.recoveryPercentageAt180}% @ 180s
                </span>
              </div>

              <div className="p-2 bg-[#F7F7F5] rounded-[2px] flex items-center justify-between border border-[#D9DCD8]/60">
                <div className="flex flex-col font-code">
                  <span className="text-[9.5px] text-[#70797B] font-medium uppercase">PREDICTED P99 API LATENCY</span>
                  <div className="flex items-center gap-1 text-[13px] text-[#171A19] mt-0.5">
                    <span className="text-[#B83A3A] line-through font-medium">{activeScenario.predictedP99Latency.from}ms</span>
                    <span>→</span>
                    <span className="text-[#00535f] font-bold">{activeScenario.predictedP99Latency.to}ms</span>
                  </div>
                </div>
                <span className="font-code text-[11px] px-2 py-0.5 bg-white text-[#00535f] font-semibold rounded-[2px] border border-[#D9DCD8]">
                  {activeScenario.predictedP99Latency.delta}
                </span>
              </div>

              <div className="p-2 bg-[#F7F7F5] rounded-[2px] flex items-center justify-between border border-[#D9DCD8]/60">
                <div className="flex flex-col font-code">
                  <span className="text-[9.5px] text-[#70797B] font-medium uppercase">PREDICTED 504 ERROR RATE</span>
                  <div className="flex items-center gap-1 text-[13px] text-[#171A19] mt-0.5">
                    <span className="text-[#B83A3A] line-through font-medium">{activeScenario.predicted504ErrorRate.from}%</span>
                    <span>→</span>
                    <span className="text-[#00535f] font-bold">{activeScenario.predicted504ErrorRate.to}%</span>
                  </div>
                </div>
                <span className="font-code text-[11px] px-2 py-0.5 bg-white text-[#00535f] font-semibold rounded-[2px] border border-[#D9DCD8]">
                  {activeScenario.predicted504ErrorRate.delta}
                </span>
              </div>
            </div>

            <p className="font-code text-[10px] text-[#70797B] mt-1 leading-normal italic">
              * Model-estimated counterfactual projection. Values reflect simulated intervention on the causal graph, not active production measurements.
            </p>
          </section>

          {/* B. CAUSAL CASCADE ATTENUATION SEQUENCE */}
          <section className="bg-white p-3 rounded-[3px] shadow-xs border border-[#D9DCD8] flex flex-col gap-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-[#D9DCD8]">
              <div>
                <span className="font-section text-[10px] text-[#70797B] uppercase tracking-wider">Path Mechanics</span>
                <h3 className="text-[14px] text-[#171A19] font-semibold tracking-tight">Causal Cascade Attenuation</h3>
              </div>
              <span className="material-symbols-outlined text-[18px] text-[#70797B]">account_tree</span>
            </div>

            <div className="flex flex-col gap-1.5 mt-1 font-code">
              {/* Step 1 */}
              <div className="flex items-start gap-2 p-2 bg-[#F7F7F5] rounded-[2px] border border-[#D9DCD8]/60">
                <span className="w-5 h-5 flex items-center justify-center bg-[#00535f] text-white text-[10.5px] font-semibold rounded-full mt-0.5">
                  1
                </span>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#171A19]">inventory-db</span>
                    <span className="text-[#00535f] font-semibold">-70% Latency</span>
                  </div>
                  <span className="text-[10px] text-[#5E6561] mt-0.5">Simulated target intervention</span>
                </div>
              </div>
              <div className="flex justify-center text-[#70797B] text-[10px] -my-1">↓</div>

              {/* Step 2 */}
              <div className="flex items-start gap-2 p-2 bg-[#F7F7F5] rounded-[2px] border border-[#D9DCD8]/60">
                <span className="w-5 h-5 flex items-center justify-center bg-[#286B78] text-white text-[10.5px] font-semibold rounded-full mt-0.5">
                  2
                </span>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#171A19]">inventory-service</span>
                    <span className="text-[#00535f] font-semibold">-58% Wait Time</span>
                  </div>
                  <span className="text-[10px] text-[#5E6561] mt-0.5">Connection pool acquisition unblocked</span>
                </div>
              </div>
              <div className="flex justify-center text-[#70797B] text-[10px] -my-1">↓</div>

              {/* Step 3 */}
              <div className="flex items-start gap-2 p-2 bg-[#F7F7F5] rounded-[2px] border border-[#D9DCD8]/60">
                <span className="w-5 h-5 flex items-center justify-center bg-[#286B78] text-white text-[10.5px] font-semibold rounded-full mt-0.5">
                  3
                </span>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#171A19]">order-service</span>
                    <span className="text-[#00535f] font-semibold">-61% Latency</span>
                  </div>
                  <span className="text-[10px] text-[#5E6561] mt-0.5">Synchronous RPC execution restored</span>
                </div>
              </div>
              <div className="flex justify-center text-[#70797B] text-[10px] -my-1">↓</div>

              {/* Step 4 */}
              <div className="flex items-start gap-2 p-2 bg-[#F7F7F5] rounded-[2px] border border-[#D9DCD8]/60">
                <span className="w-5 h-5 flex items-center justify-center bg-[#605889] text-white text-[10.5px] font-semibold rounded-full mt-0.5">
                  4
                </span>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#171A19]">api-gateway</span>
                    <span className="text-[#00535f] font-semibold">-65% Error Count</span>
                  </div>
                  <span className="text-[10px] text-[#5E6561] mt-0.5">Ingress checkout timeouts mitigated</span>
                </div>
              </div>
            </div>
          </section>

          {/* C. CANDIDATE COMPARISON */}
          <section className="bg-white p-3 rounded-[3px] shadow-xs border border-[#D9DCD8] flex flex-col gap-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-[#D9DCD8]">
              <div>
                <span className="font-section text-[10px] text-[#70797B] uppercase tracking-wider">Candidate Comparison</span>
                <h3 className="text-[14px] text-[#171A19] font-semibold tracking-tight">Alternative Interventions</h3>
              </div>
              <span className="font-code text-[10px] text-[#70797B]">3 CANDIDATES</span>
            </div>

            <div className="flex flex-col gap-2 mt-1">
              {SIMULATION_SCENARIOS.slice(1).map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedScenarioId(s.id)}
                  className={`p-2 rounded-[2px] flex flex-col gap-1 cursor-pointer transition-colors border ${
                    selectedScenarioId === s.id
                      ? 'bg-[#E9EDE9] border-[#00535f]'
                      : 'bg-[#F7F7F5] hover:bg-[#F1F2F0] border-[#D9DCD8]/60'
                  }`}
                >
                  <div className="flex items-center justify-between font-code text-[11px]">
                    <span className="font-semibold text-[#171A19]">{s.description}</span>
                    <button
                      className={`px-2 py-0.5 text-[9.5px] font-semibold rounded-[2px] transition-colors ${
                        selectedScenarioId === s.id
                          ? 'bg-[#00535f] text-white'
                          : 'bg-white border border-[#D9DCD8] text-[#171A19]'
                      }`}
                    >
                      {selectedScenarioId === s.id ? 'ACTIVE' : 'SIMULATE'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between font-code text-[10px] text-[#5E6561]">
                    <span>Predicted Impact: <strong className="text-[#00535f]">{s.predictedPeakImpact.delta}</strong></span>
                    <span>Risk: <span className="text-[#B83A3A] font-medium">{s.riskLabel}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* D. ASSUMPTIONS & BOUNDS */}
          <section className="bg-white p-3 rounded-[3px] shadow-xs border border-[#D9DCD8] flex flex-col gap-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-[#D9DCD8]">
              <div>
                <span className="font-section text-[10px] text-[#70797B] uppercase tracking-wider">Epistemic Credibility</span>
                <h3 className="text-[14px] text-[#171A19] font-semibold tracking-tight">Assumptions &amp; Bounds</h3>
              </div>
              <span className="font-code text-[10px] text-[#00535f] font-semibold">74% – 88% CI</span>
            </div>
            <div className="p-2 bg-[#F7F7F5] rounded-[2px] font-code text-[10.5px] text-[#5E6561] flex flex-col gap-1.5 border border-[#D9DCD8]/60">
              <div className="flex items-start gap-1.5">
                <span className="text-[#00535f] font-bold">•</span>
                <span><strong>Intervention efficacy:</strong> Latency reduction remains sustained over the 300s window.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-[#00535f] font-bold">•</span>
                <span><strong>Topology invariance:</strong> Dependency graph DAG and route configurations remain unchanged.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-[#00535f] font-bold">•</span>
                <span><strong>Ingress envelope:</strong> Upstream checkout traffic remains within observed baseline (2.8k ± 400 req/s).</span>
              </div>
            </div>
          </section>

          {/* E. OPERATIONAL ACTION FOOTER */}
          <section className="bg-white p-3 rounded-[3px] shadow-xs border border-[#D9DCD8] flex flex-col gap-2 border-t-2 border-t-[#00535f]">
            <div className="flex items-center justify-between font-code text-[11px]">
              <span className="text-[#171A19] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00535f]"></span>
                SIMULATION READY
              </span>
              <span className="text-[#5E6561] font-medium">SAFETY LOCK: ACTIVE</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 font-code text-[10.5px]">
              <button
                onClick={handleRunSimulation}
                className="h-7 bg-[#F7F7F5] hover:bg-[#EAECE8] text-[#171A19] font-medium rounded-[2px] flex items-center justify-center gap-1 transition-colors cursor-pointer border border-[#D9DCD8]"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                <span>Re-run Simulation</span>
              </button>
              <button
                onClick={() => onNavigate('root-cause')}
                className="h-7 bg-[#F7F7F5] hover:bg-[#EAECE8] text-[#171A19] font-medium rounded-[2px] flex items-center justify-center gap-1 transition-colors cursor-pointer border border-[#D9DCD8]"
              >
                <span className="material-symbols-outlined text-[14px]">account_tree</span>
                <span>View Root Cause</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
