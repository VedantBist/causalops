import React, { useState, useEffect, useCallback } from 'react';
import { PREDICTIONS } from '../data/mockData';
import { AppPage } from '../components/layout/AppShell';
import { causalOpsApi, Prediction } from '../api/client';
import { FailurePredictionItem } from '../types';

interface PredictionsViewProps {
  onNavigate: (page: AppPage) => void;
}

function mapApiPrediction(p: Prediction): FailurePredictionItem {
  let factors: { name: string; value: number }[] = [];
  try { factors = JSON.parse(p.factors); } catch { factors = []; }
  const latencyRatio = factors.find(f => f.name === 'latency_ratio')?.value ?? 1;
  const etaMinutes = Math.max(1, Math.round(p.horizonSeconds / 60));
  const etaStr = `T+${etaMinutes}m (${p.horizonSeconds}s)`;
  const stateStr = p.riskLevel === 'CRITICAL' ? 'Degraded / Saturation' : p.riskLevel === 'HIGH' ? 'Degraded' : 'Elevated Load';
  return {
    serviceId: p.service,
    serviceName: p.service,
    tech: 'Spring Boot / Container',
    currentState: 'Operational',
    predictedState: stateStr,
    riskProbability: Math.round(p.probability * 100),
    riskCategory: (p.riskLevel as any) || 'ELEVATED',
    eta: etaStr,
    primaryCausalDriver: factors.length > 0 ? `${factors[0].name} (${factors[0].value.toFixed(2)})` : 'Anomaly Propagation',
    driverDetail: p.factors || 'Propagated degradation score',
  };
}

export const PredictionsView: React.FC<PredictionsViewProps> = ({ onNavigate }) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>('inventory-service');
  const [horizon, setHorizon] = useState<'5m' | '15m' | '30m'>('15m');
  const [filterMode, setFilterMode] = useState<'all' | 'high_risk'>('all');
  const [livePredictions, setLivePredictions] = useState<ReturnType<typeof mapApiPrediction>[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  const loadPredictions = useCallback(async () => {
    try {
      const data = await causalOpsApi.predictions();
      // Deduplicate: keep latest per service
      const byService = new Map<string, Prediction>();
      for (const p of data) {
        if (!byService.has(p.service) || new Date(p.createdAt) > new Date(byService.get(p.service)!.createdAt)) {
          byService.set(p.service, p);
        }
      }
      const mapped = Array.from(byService.values())
        .map(mapApiPrediction)
        .sort((a, b) => b.riskProbability - a.riskProbability);
      setLivePredictions(mapped);
      if (mapped.length > 0 && !mapped.find(p => p.serviceId === selectedServiceId)) {
        setSelectedServiceId(mapped[0].serviceId);
      }
      setApiError(null);
    } catch {
      setApiError('Backend unavailable — showing last predictions');
    }
  }, [selectedServiceId]);

  useEffect(() => {
    loadPredictions();
    const interval = setInterval(loadPredictions, 10000);
    return () => clearInterval(interval);
  }, [loadPredictions]);

  // Prefer live data; fall back to mock
  const allPredictions = livePredictions.length > 0 ? livePredictions : PREDICTIONS;
  const selectedPrediction = allPredictions.find((p) => p.serviceId === selectedServiceId) || allPredictions[0];
  const displayedPredictions = filterMode === 'high_risk'
    ? allPredictions.filter((p) => p.riskProbability >= 60)
    : allPredictions;

  const _ = horizon; // used for display only

  return (
    <div className="flex flex-col w-full font-sans text-[#171A19] p-4 bg-[#F7F7F5] select-text">
      {/* SUB-HEADER / CONTROLS */}
      <div className="bg-[#FFFFFF] px-4 py-2.5 rounded-[3px] mb-3 border border-[#D9DCD8] flex flex-wrap items-center justify-between gap-y-2 shadow-xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-code text-[11px] px-2 py-0.5 rounded-[2px] bg-[#3B82F6]/10 text-[#3B82F6] font-semibold border border-[#3B82F6]/30 uppercase tracking-wider">
              PREDICT · FAILURE RISK HORIZON
            </span>
            <h1 className="text-[15px] font-bold tracking-tight text-[#171A19]">Failure Predictions</h1>
            <span className={`font-code text-[10.5px] px-1.5 py-0.5 rounded-[2px] font-medium border ${
              livePredictions.length > 0
                ? 'bg-[#2F7D5C]/10 text-[#2F7D5C] border-[#2F7D5C]/20'
                : 'bg-[#D9822B]/10 text-[#C47F17] border-[#D9822B]/20'
            }`}>
              {livePredictions.length > 0 ? `LIVE · ${livePredictions.length} services` : 'MOCK DATA'}
            </span>
            {apiError && (
              <span className="font-code text-[10px] text-[#C47F17] bg-[#D9822B]/10 border border-[#D9822B]/30 px-2 py-0.5 rounded-[2px]">
                {apiError}
              </span>
            )}
          </div>
          <p className="text-[11.5px] text-[#5E6561] mt-0.5">
            Primary question: &ldquo;What is likely to fail next?&rdquo; · Projected service degradation, probability, and time horizons
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 flex-wrap font-code text-[11px]">
          {/* Horizon Selector */}
          <div className="inline-flex items-center p-0.5 rounded-[2px] bg-white border border-[#D9DCD8]">
            <button
              onClick={() => setHorizon('5m')}
              className={`px-2 py-0.5 rounded-[2px] transition-colors cursor-pointer ${
                horizon === '5m' ? 'bg-[#00535f] text-white font-semibold' : 'text-[#5E6561] hover:text-[#171A19]'
              }`}
            >
              5m
            </button>
            <button
              onClick={() => setHorizon('15m')}
              className={`px-2 py-0.5 rounded-[2px] transition-colors cursor-pointer ${
                horizon === '15m' ? 'bg-[#00535f] text-white font-semibold' : 'text-[#5E6561] hover:text-[#171A19]'
              }`}
            >
              15m
            </button>
            <button
              onClick={() => setHorizon('30m')}
              className={`px-2 py-0.5 rounded-[2px] transition-colors cursor-pointer ${
                horizon === '30m' ? 'bg-[#00535f] text-white font-semibold' : 'text-[#5E6561] hover:text-[#171A19]'
              }`}
            >
              30m
            </button>
          </div>

          <div className="flex items-center gap-1 px-2 py-1 rounded-[2px] bg-white border border-[#D9DCD8] text-[#5E6561]">
            <span>RESOLUTION:</span>
            <span className="text-[#171A19] font-semibold">Δt = 15s</span>
          </div>
        </div>
      </div>

      {/* 2-COLUMN OPERATIONAL SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* LEFT COLUMN: TRAJECTORIES & MATRIX (8 of 12 cols ≈ 66%) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Primary Trajectory Chart Card */}
          <div className="bg-white rounded-[3px] p-4 shadow-xs border border-[#D9DCD8] flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D9DCD8] pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00535f] text-[18px]">stacked_line_chart</span>
                <span className="font-section text-[11px] text-[#171A19] font-bold">
                  CASCADING FAILURE PROBABILITY TRAJECTORIES
                </span>
              </div>
              <div className="flex items-center gap-3 font-code text-[10px] text-[#70797B]">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-[2px] bg-[#286B78] inline-block"></span>
                  <span>OBSERVED</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 border-b-2 border-dashed border-[#D9822B] inline-block"></span>
                  <span>INFERRED</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 border-b-2 border-dotted border-[#605889] inline-block"></span>
                  <span>PREDICTED</span>
                </div>
              </div>
            </div>

            {/* SVG Chart */}
            <div className="relative w-full h-72 select-none bg-[#F7F7F5] rounded-[2px] p-2 overflow-hidden border border-[#D9DCD8]">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 880 260">
                <defs>
                  <pattern id="pred-grid" width="140" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 140 0 L 0 0 0 40" fill="none" stroke="#D9DCD8" strokeWidth="0.8"></path>
                  </pattern>
                </defs>
                <rect width="880" height="260" fill="url(#pred-grid)"></rect>

                {/* Critical Risk Zone (>80%) */}
                <rect x="50" y="10" width="810" height="42" fill="#B83A3A" fillOpacity="0.08"></rect>
                <line x1="50" x2="860" y1="52" y2="52" stroke="#B83A3A" strokeDasharray="3,3" strokeWidth="1" opacity="0.7"></line>
                <text x="856" y="47" textAnchor="end" fill="#B83A3A" fontFamily="JetBrains Mono" fontSize="9.5" fontWeight="600">
                  CRITICAL RISK THRESHOLD (80%)
                </text>

                {/* Elevated Risk Zone (60%-80%) */}
                <rect x="50" y="52" width="810" height="42" fill="#D9822B" fillOpacity="0.06"></rect>
                <line x1="50" x2="860" y1="94" y2="94" stroke="#D9822B" strokeDasharray="3,3" strokeWidth="1" opacity="0.7"></line>
                <text x="856" y="89" textAnchor="end" fill="#D9822B" fontFamily="JetBrains Mono" fontSize="9.5" fontWeight="600">
                  ELEVATED RISK THRESHOLD (60%)
                </text>

                {/* Y Axis */}
                <text x="42" y="14" textAnchor="end" fill="#70797B" fontFamily="JetBrains Mono" fontSize="9.5">100%</text>
                <text x="42" y="56" textAnchor="end" fill="#70797B" fontFamily="JetBrains Mono" fontSize="9.5">80%</text>
                <text x="42" y="98" textAnchor="end" fill="#70797B" fontFamily="JetBrains Mono" fontSize="9.5">60%</text>
                <text x="42" y="140" textAnchor="end" fill="#70797B" fontFamily="JetBrains Mono" fontSize="9.5">40%</text>
                <text x="42" y="182" textAnchor="end" fill="#70797B" fontFamily="JetBrains Mono" fontSize="9.5">20%</text>
                <text x="42" y="224" textAnchor="end" fill="#70797B" fontFamily="JetBrains Mono" fontSize="9.5">0%</text>

                {/* Trajectory 1: inventory-service */}
                <path d="M 70 115 C 110 100, 140 50, 180 37" fill="none" stroke="#B83A3A" strokeWidth="2.5"></path>
                <path d="M 180 37 C 220 28, 280 20, 340 18 L 860 16" fill="none" stroke="#B83A3A" strokeDasharray="4,3" strokeWidth="2"></path>
                <circle cx="180" cy="37" r="4.5" fill="#B83A3A"></circle>
                <rect x="190" y="24" width="138" height="22" rx="2" fill="#FFFFFF" stroke="#B83A3A" strokeWidth="1"></rect>
                <text x="195" y="39" fill="#B83A3A" fontFamily="JetBrains Mono" fontSize="10" fontWeight="600">
                  inventory: 87% (+2m)
                </text>

                {/* Trajectory 2: order-service */}
                <path d="M 70 165 C 120 160, 150 140, 180 128" fill="none" stroke="#D9822B" strokeWidth="2"></path>
                <path d="M 180 128 C 240 110, 290 80, 340 65" fill="none" stroke="#D9822B" strokeDasharray="4,4" strokeWidth="2"></path>
                <path d="M 340 65 C 410 48, 460 44, 500 42 L 860 38" fill="none" stroke="#D9822B" strokeDasharray="2,4" strokeWidth="1.75"></path>
                <circle cx="340" cy="65" r="4.5" fill="#D9822B"></circle>
                <rect x="350" y="54" width="124" height="22" rx="2" fill="#FFFFFF" stroke="#D9822B" strokeWidth="1"></rect>
                <text x="355" y="69" fill="#D9822B" fontFamily="JetBrains Mono" fontSize="10" fontWeight="600">
                  order: 74% (+5m)
                </text>

                {/* Trajectory 3: api-gateway */}
                <path d="M 70 200 C 180 195, 260 180, 340 152" fill="none" stroke="#286B78" strokeWidth="1.75"></path>
                <path d="M 340 152 C 410 130, 460 105, 500 92" fill="none" stroke="#286B78" strokeDasharray="4,3" strokeWidth="1.75"></path>
                <path d="M 500 92 C 580 75, 650 63, 700 60 L 860 52" fill="none" stroke="#286B78" strokeDasharray="2,3" strokeWidth="1.5"></path>
                <circle cx="500" cy="92" r="4" fill="#286B78"></circle>
                <rect x="510" y="81" width="138" height="22" rx="2" fill="#FFFFFF" stroke="#286B78" strokeWidth="1"></rect>
                <text x="515" y="96" fill="#286B78" fontFamily="JetBrains Mono" fontSize="10" fontWeight="600">
                  api-gateway: 61% (+8m)
                </text>

                {/* Trajectory 4: checkout-service */}
                <path d="M 70 214 L 340 210 C 420 205, 460 190, 500 178" fill="none" stroke="#605889" strokeWidth="1.5"></path>
                <path d="M 500 178 C 580 160, 650 145, 700 133 L 860 125" fill="none" stroke="#605889" strokeDasharray="2,3" strokeWidth="1.5"></path>
                <circle cx="700" cy="133" r="3.5" fill="#605889"></circle>
                <rect x="710" y="122" width="135" height="22" rx="2" fill="#FFFFFF" stroke="#605889" strokeWidth="1"></rect>
                <text x="715" y="137" fill="#605889" fontFamily="JetBrains Mono" fontSize="10" fontWeight="600">
                  checkout: 43% (+12m)
                </text>

                {/* X Axis Time Marks */}
                <text x="70" y="246" textAnchor="middle" fill="#00535f" fontFamily="JetBrains Mono" fontSize="9.5" fontWeight="600">NOW (T0)</text>
                <text x="180" y="246" textAnchor="middle" fill="#70797B" fontFamily="JetBrains Mono" fontSize="9.5">+2m</text>
                <text x="340" y="246" textAnchor="middle" fill="#70797B" fontFamily="JetBrains Mono" fontSize="9.5">+5m</text>
                <text x="500" y="246" textAnchor="middle" fill="#70797B" fontFamily="JetBrains Mono" fontSize="9.5">+8m</text>
                <text x="700" y="246" textAnchor="middle" fill="#70797B" fontFamily="JetBrains Mono" fontSize="9.5">+12m</text>
                <text x="840" y="246" textAnchor="middle" fill="#70797B" fontFamily="JetBrains Mono" fontSize="9.5">+15m</text>
              </svg>
            </div>

            {/* Trajectory Legend Ticker */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 border-t border-[#D9DCD8]">
              <div
                onClick={() => setSelectedServiceId('inventory-service')}
                className="flex items-center justify-between p-1.5 rounded-[2px] bg-[#F7F7F5] border border-[#D9DCD8] hover:border-[#B83A3A] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[1px] bg-[#B83A3A]"></span>
                  <span className="font-code text-[11px] font-semibold text-[#171A19]">inventory-service</span>
                </div>
                <span className="font-code text-[11px] text-[#B83A3A] font-semibold">87% RISK</span>
              </div>
              <div
                onClick={() => setSelectedServiceId('order-service')}
                className="flex items-center justify-between p-1.5 rounded-[2px] bg-[#F7F7F5] border border-[#D9DCD8] hover:border-[#D9822B] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[1px] bg-[#D9822B]"></span>
                  <span className="font-code text-[11px] font-semibold text-[#171A19]">order-service</span>
                </div>
                <span className="font-code text-[11px] text-[#D9822B] font-semibold">74% RISK</span>
              </div>
              <div
                onClick={() => setSelectedServiceId('api-gateway')}
                className="flex items-center justify-between p-1.5 rounded-[2px] bg-[#F7F7F5] border border-[#D9DCD8] hover:border-[#286B78] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[1px] bg-[#286B78]"></span>
                  <span className="font-code text-[11px] font-semibold text-[#171A19]">api-gateway</span>
                </div>
                <span className="font-code text-[11px] text-[#286B78] font-semibold">61% RISK</span>
              </div>
              <div
                onClick={() => setSelectedServiceId('checkout-service')}
                className="flex items-center justify-between p-1.5 rounded-[2px] bg-[#F7F7F5] border border-[#D9DCD8] hover:border-[#605889] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[1px] bg-[#605889]"></span>
                  <span className="font-code text-[11px] font-semibold text-[#171A19]">checkout-service</span>
                </div>
                <span className="font-code text-[11px] text-[#605889] font-semibold">43% RISK</span>
              </div>
            </div>
          </div>

          {/* Temporal Milestones Strip */}
          <div className="bg-white rounded-[3px] p-3 shadow-xs border border-[#D9DCD8] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-section text-[10px] text-[#70797B] uppercase tracking-wider">
                TEMPORAL PROPAGATION MILESTONES (15m TIMELINE)
              </span>
              <span className="font-code text-[10px] text-[#5E6561] font-medium">SEQUENTIAL RISK ARRIVAL ORDER</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="p-2 rounded-[2px] bg-[#F7F7F5] border-l-2 border-l-[#B83A3A] border border-[#D9DCD8] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-code text-[11px] font-bold text-[#B83A3A]">+02m (T+108s)</span>
                  <span className="font-code text-[9px] px-1 rounded bg-[#B83A3A]/10 text-[#B83A3A] font-semibold">CRIT 87%</span>
                </div>
                <div className="font-bold text-[12.5px] text-[#171A19] truncate">inventory-service</div>
                <div className="text-[11px] text-[#5E6561] mt-0.5">
                  <span className="text-[#70797B] font-code">DRIVER:</span> inventory-db pool exhaustion
                </div>
              </div>

              <div className="p-2 rounded-[2px] bg-[#F7F7F5] border-l-2 border-l-[#D9822B] border border-[#D9DCD8] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-code text-[11px] font-bold text-[#D9822B]">+05m (T+300s)</span>
                  <span className="font-code text-[9px] px-1 rounded bg-[#D9822B]/10 text-[#D9822B] font-semibold">HIGH 74%</span>
                </div>
                <div className="font-bold text-[12.5px] text-[#171A19] truncate">order-service</div>
                <div className="text-[11px] text-[#5E6561] mt-0.5">
                  <span className="text-[#70797B] font-code">DRIVER:</span> inventory-service thread lock
                </div>
              </div>

              <div className="p-2 rounded-[2px] bg-[#F7F7F5] border-l-2 border-l-[#286B78] border border-[#D9DCD8] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-code text-[11px] font-bold text-[#286B78]">+08m (T+480s)</span>
                  <span className="font-code text-[9px] px-1 rounded bg-[#286B78]/10 text-[#286B78] font-semibold">ELEV 61%</span>
                </div>
                <div className="font-bold text-[12.5px] text-[#171A19] truncate">api-gateway</div>
                <div className="text-[11px] text-[#5E6561] mt-0.5">
                  <span className="text-[#70797B] font-code">DRIVER:</span> Synchronous RPC timeouts
                </div>
              </div>

              <div className="p-2 rounded-[2px] bg-[#F7F7F5] border-l-2 border-l-[#605889] border border-[#D9DCD8] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-code text-[11px] font-bold text-[#605889]">+12m (T+720s)</span>
                  <span className="font-code text-[9px] px-1 rounded bg-[#605889]/10 text-[#605889] font-semibold">MOD 43%</span>
                </div>
                <div className="font-bold text-[12.5px] text-[#171A19] truncate">checkout-service</div>
                <div className="text-[11px] text-[#5E6561] mt-0.5">
                  <span className="text-[#70797B] font-code">DRIVER:</span> api-gateway 504 ingress cascade
                </div>
              </div>
            </div>
          </div>

          {/* Fleet Prediction Matrix Table */}
          <div className="bg-white rounded-[3px] shadow-xs border border-[#D9DCD8] flex flex-col overflow-hidden">
            <div className="px-3 py-2 bg-[#F1F2F0] border-b border-[#D9DCD8] flex items-center justify-between font-code text-[11px]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[15px] text-[#00535f]">table_chart</span>
                <span className="font-section text-[10.5px] text-[#171A19] font-bold uppercase tracking-wider">
                  FLEET PREDICTION MATRIX (15m HORIZON)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#70797B]">FILTER:</span>
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-1.5 py-0.5 rounded-[2px] transition-colors cursor-pointer ${
                    filterMode === 'all' ? 'bg-[#00535f] text-white font-semibold' : 'text-[#5E6561] hover:text-[#171A19]'
                  }`}
                >
                  ALL TOPOLOGIES ({PREDICTIONS.length})
                </button>
                <button
                  onClick={() => setFilterMode('high_risk')}
                  className={`px-1.5 py-0.5 rounded-[2px] transition-colors cursor-pointer ${
                    filterMode === 'high_risk' ? 'bg-[#B83A3A] text-white font-semibold' : 'text-[#70797B] hover:text-[#171A19]'
                  }`}
                >
                  HIGH RISK ONLY
                </button>
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full border-collapse text-left font-code text-[11px]">
                <thead>
                  <tr className="bg-[#EAECE8] border-b border-[#D9DCD8] text-[#70797B] uppercase tracking-wider select-none text-[10px]">
                    <th className="py-2 px-3 font-semibold">SERVICE</th>
                    <th className="py-2 px-2 font-semibold">CURRENT STATE</th>
                    <th className="py-2 px-2 font-semibold">PREDICTED STATE</th>
                    <th className="py-2 px-2 font-semibold">RISK PROBABILITY</th>
                    <th className="py-2 px-2 font-semibold">EXPECTED TIME (ETA)</th>
                    <th className="py-2 px-2 font-semibold">PRIMARY CAUSAL DRIVER</th>
                    <th className="py-2 px-3 text-right font-semibold">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9DCD8] text-[#171A19]">
                  {displayedPredictions.map((p) => {
                    const isSelected = p.serviceId === selectedServiceId;
                    return (
                      <tr
                        key={p.serviceId}
                        onClick={() => setSelectedServiceId(p.serviceId)}
                        className={`hover:bg-[#F7F7F5] transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#E9EDE9] border-l-4 border-l-[#00535f]' : 'border-l-4 border-l-transparent'
                        }`}
                      >
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                p.riskCategory === 'CRITICAL'
                                  ? 'bg-[#B83A3A] animate-ping'
                                  : p.riskCategory === 'HIGH'
                                  ? 'bg-[#D9822B]'
                                  : p.riskCategory === 'ELEVATED'
                                  ? 'bg-[#286B78]'
                                  : 'bg-[#70797B]'
                              }`}
                            ></span>
                            <span className="font-bold text-[#171A19]">{p.serviceName}</span>
                          </div>
                          <div className="text-[9.5px] text-[#70797B]">{p.tech}</div>
                        </td>
                        <td className="py-2 px-2">
                          <span className="px-1.5 py-0.5 rounded-[2px] bg-[#EAECE8] text-[#5E6561] text-[10px]">
                            {p.currentState}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-[#B83A3A] font-medium">{p.predictedState}</td>
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#B83A3A]">{p.riskProbability}%</span>
                            <span className="text-[9.5px] text-[#70797B]">[{p.riskCategory}]</span>
                          </div>
                          <div className="w-16 bg-[#D9DCD8] h-1 rounded overflow-hidden mt-0.5">
                            <div
                              className="h-full bg-[#B83A3A]"
                              style={{ width: `${p.riskProbability}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="py-2 px-2 font-semibold">{p.eta}</td>
                        <td className="py-2 px-2 text-[#5E6561]">{p.primaryCausalDriver}</td>
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedServiceId(p.serviceId);
                            }}
                            className="px-2 py-0.5 rounded-[2px] bg-[#00535f] text-white font-semibold hover:bg-[#286B78] transition-colors"
                          >
                            INSPECT
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PREDICTION INSPECTOR (4 of 12 cols ≈ 34%) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Prediction Inspector Main Box */}
          <div className="bg-white rounded-[3px] p-3 shadow-xs border border-[#D9DCD8] flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#D9DCD8]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#00535f] text-[16px]">troubleshoot</span>
                <span className="font-section text-[10.5px] text-[#70797B] uppercase tracking-wider">PREDICTION INSPECTOR</span>
              </div>
              <span className="font-code text-[10px] px-2 py-0.5 rounded-[2px] bg-[#B83A3A]/10 text-[#B83A3A] font-semibold border border-[#B83A3A]/30">
                {selectedPrediction.riskCategory} TARGET
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-[16px] text-[#171A19] font-bold tracking-tight uppercase">
                  {selectedPrediction.serviceName}
                </h2>
                <span className="font-code text-[12px] text-[#B83A3A] font-bold px-2 py-0.5 bg-[#B83A3A]/10 rounded-[2px]">
                  {selectedPrediction.riskProbability}% RISK
                </span>
              </div>
              <p className="font-code text-[10px] text-[#70797B] mt-0.5">{selectedPrediction.tech}</p>
              <div className="text-[12px] text-[#B83A3A] font-semibold mt-1">
                PREDICTED: {selectedPrediction.predictedState}
              </div>
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1 font-code">
              <div className="p-2 rounded-[2px] bg-[#F7F7F5] border border-[#D9DCD8]/60">
                <div className="text-[9.5px] text-[#70797B] uppercase">EXPECTED TIME (ETA)</div>
                <div className="font-metric text-[16px] text-[#B83A3A] font-bold mt-0.5">{selectedPrediction.eta}</div>
                <div className="text-[9.5px] text-[#5E6561]">Δ arrival threshold</div>
              </div>
              <div className="p-2 rounded-[2px] bg-[#F7F7F5] border border-[#D9DCD8]/60">
                <div className="text-[9.5px] text-[#70797B] uppercase">CREDIBLE INTERVAL</div>
                <div className="font-metric text-[16px] text-[#171A19] font-bold mt-0.5">78%–92%</div>
                <div className="text-[9.5px] text-[#00535f]">High confidence</div>
              </div>
            </div>
          </div>

          {/* Root Causal Driver Card */}
          <div className="bg-white rounded-[3px] p-3 shadow-xs border border-[#D9DCD8] flex flex-col gap-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-[#D9DCD8]">
              <span className="font-section text-[10px] text-[#70797B] uppercase tracking-wider">ROOT CAUSAL DRIVER</span>
              <span className="font-code text-[10px] text-[#B83A3A] font-semibold">INC-8941 CONFIRMED</span>
            </div>
            <div className="p-2 rounded-[2px] bg-[#B83A3A]/5 border border-[#B83A3A]/20 mt-1 flex flex-col gap-1 font-code">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#171A19]">inventory-db</span>
                <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-[#B83A3A] text-white font-semibold">CRITICAL</span>
              </div>
              <div className="text-[10px] text-[#5E6561]">PostgreSQL 15.4 Primary · c6g.4xlarge</div>
              <div className="grid grid-cols-2 gap-2 mt-1 pt-1 border-t border-[#B83A3A]/20 text-[10.5px]">
                <div>
                  <span className="text-[#70797B] text-[9.5px] block">OBSERVED LATENCY:</span>
                  <span className="font-bold text-[#B83A3A]">1.42s</span>
                </div>
                <div>
                  <span className="text-[#70797B] text-[9.5px] block">PROPAGATION LAG:</span>
                  <span className="font-bold text-[#171A19]">+2.1s wait queue</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Step Causal DAG Explanation */}
          <div className="bg-white rounded-[3px] p-3 shadow-xs border border-[#D9DCD8] flex flex-col gap-2">
            <div className="flex items-center justify-between pb-1 border-b border-[#D9DCD8]">
              <span className="font-section text-[10px] text-[#171A19] font-bold uppercase tracking-wider">
                WHY THIS SERVICE IS AT RISK
              </span>
              <span className="font-code text-[10px] text-[#00535f] font-medium">4-STEP CAUSAL DAG</span>
            </div>
            <div className="flex flex-col relative pl-4 mt-1 space-y-2.5">
              <div className="absolute left-[3px] top-2 bottom-2 w-[1.5px] bg-[#D9DCD8]"></div>

              {/* Step 1 */}
              <div className="relative flex items-start gap-2">
                <div className="absolute -left-[14px] top-1 w-2.5 h-2.5 rounded-full bg-[#B83A3A]"></div>
                <div className="flex flex-col">
                  <span className="font-code text-[10px] text-[#B83A3A] font-bold uppercase">STEP 1 · ROOT ANOMALY</span>
                  <div className="text-[12px] font-semibold text-[#171A19]">inventory-db latency anomaly</div>
                  <div className="text-[11px] text-[#5E6561]">Observed 1.42s disk I/O lock contention on active tables.</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-start gap-2">
                <div className="absolute -left-[14px] top-1 w-2.5 h-2.5 rounded-full bg-[#D9822B]"></div>
                <div className="flex flex-col">
                  <span className="font-code text-[10px] text-[#D9822B] font-bold uppercase">STEP 2 · RESOURCE EXHAUSTION</span>
                  <div className="text-[12px] font-semibold text-[#171A19]">Connection pool saturation</div>
                  <div className="text-[11px] text-[#5E6561]">198 / 200 active leases consumed (99% max ceiling capacity).</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-start gap-2">
                <div className="absolute -left-[14px] top-1 w-2.5 h-2.5 rounded-full bg-[#00535f]"></div>
                <div className="flex flex-col">
                  <span className="font-code text-[10px] text-[#00535f] font-bold uppercase">STEP 3 · PROPAGATION MECHANISM</span>
                  <div className="text-[12px] font-semibold text-[#171A19]">inventory-service lease acquisition delay</div>
                  <div className="text-[11px] text-[#5E6561]">Goroutines blocking on pool.Acquire(); average wait +2.1s.</div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative flex items-start gap-2">
                <div className="absolute -left-[14px] top-1 w-2.5 h-2.5 rounded-full bg-[#B83A3A] animate-pulse"></div>
                <div className="flex flex-col">
                  <span className="font-code text-[10px] text-[#B83A3A] font-bold uppercase">STEP 4 · PREDICTED OUTCOME ({selectedPrediction.eta})</span>
                  <div className="text-[12px] font-semibold text-[#B83A3A]">{selectedPrediction.predictedState}</div>
                  <div className="text-[11px] text-[#5E6561]">Pods projected to reach 100% thread exhaustion, tripping HTTP 500s.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Factor Contribution Breakdown */}
          <div className="bg-white rounded-[3px] p-3 shadow-xs border border-[#D9DCD8] flex flex-col gap-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-[#D9DCD8]">
              <span className="font-section text-[10px] text-[#70797B] uppercase tracking-wider">RISK FACTOR CONTRIBUTION</span>
              <span className="font-code text-[10px] text-[#00535f] font-semibold">Σ = 100%</span>
            </div>
            <div className="flex flex-col gap-2 mt-1 font-code text-[11px]">
              <div>
                <div className="flex justify-between text-[#171A19] mb-0.5">
                  <span>inventory-db latency contention</span>
                  <span className="font-semibold">42%</span>
                </div>
                <div className="w-full bg-[#EAECE8] h-1.5 rounded overflow-hidden">
                  <div className="bg-[#B83A3A] h-full" style={{ width: '42%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[#171A19] mb-0.5">
                  <span>Connection pool lease saturation</span>
                  <span className="font-semibold">28%</span>
                </div>
                <div className="w-full bg-[#EAECE8] h-1.5 rounded overflow-hidden">
                  <div className="bg-[#D9822B] h-full" style={{ width: '28%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[#171A19] mb-0.5">
                  <span>RPC queue backlog</span>
                  <span className="font-semibold">16%</span>
                </div>
                <div className="w-full bg-[#EAECE8] h-1.5 rounded overflow-hidden">
                  <div className="bg-[#00535f] h-full" style={{ width: '16%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[#171A19] mb-0.5">
                  <span>Thread utilization spike</span>
                  <span className="font-semibold">10%</span>
                </div>
                <div className="w-full bg-[#EAECE8] h-1.5 rounded overflow-hidden">
                  <div className="bg-[#605889] h-full" style={{ width: '10%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[#171A19] mb-0.5">
                  <span>Downstream error backpressure</span>
                  <span className="font-semibold">4%</span>
                </div>
                <div className="w-full bg-[#EAECE8] h-1.5 rounded overflow-hidden">
                  <div className="bg-[#70797B] h-full" style={{ width: '4%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Counterfactual Simulation Action Box */}
          <div className="bg-[#F1F2F0] rounded-[3px] p-3 border border-[#00535f]/40 shadow-xs flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#00535f] text-[18px]">tune</span>
              <span className="font-section text-[10.5px] text-[#00535f] font-bold uppercase tracking-wider">
                COUNTERFACTUAL HYPOTHESIS
              </span>
            </div>
            <p className="text-[12px] text-[#171A19] font-medium leading-snug">
              What happens to predicted failure propagation if <span className="font-code font-bold">inventory-db</span> latency is reduced by 70%?
            </p>
            <div className="flex flex-col gap-1.5 pt-1">
              <button
                onClick={() => onNavigate('simulation')}
                className="w-full py-1.5 px-3 rounded-[2px] bg-[#00535f] text-white font-code text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-[#286B78] transition-colors cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[15px]">science</span>
                SIMULATE COUNTERFACTUAL
              </button>
              <div className="grid grid-cols-2 gap-1.5 font-code text-[10.5px]">
                <button
                  onClick={() => onNavigate('topology')}
                  className="py-1 px-2 rounded-[2px] bg-white border border-[#D9DCD8] text-[#171A19] font-medium flex items-center justify-center gap-1 hover:bg-[#EAECE8] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">account_tree</span>
                  DAG PROPAGATION
                </button>
                <button
                  onClick={() => onNavigate('traces')}
                  className="py-1 px-2 rounded-[2px] bg-white border border-[#D9DCD8] text-[#171A19] font-medium flex items-center justify-center gap-1 hover:bg-[#EAECE8] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">reorder</span>
                  ACTIVE TRACES
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
