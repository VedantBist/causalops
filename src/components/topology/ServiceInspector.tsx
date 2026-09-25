import React from 'react';
import { ServiceNode } from '../../types';

interface ServiceInspectorProps {
  service: ServiceNode;
  onInvestigateRootCause?: () => void;
  onIsolateSubgraph?: () => void;
}

export const ServiceInspector: React.FC<ServiceInspectorProps> = ({
  service,
  onInvestigateRootCause,
  onIsolateSubgraph,
}) => {
  const isRootCause = service.id === 'inventory-db';

  return (
    <div className="w-full bg-[#FFFFFF] text-[#161D1A] flex flex-col h-full overflow-y-auto select-none font-sans border-l border-[#D9DCD8]">
      {/* COMPACT PANEL HEADER STRIP */}
      <div className="p-3 border-b border-[#D9DCD8] bg-[#F7F7F5] flex flex-col gap-0.5">
        <div className="flex items-center justify-between">
          <span className="font-section text-[10px] text-[#636F6B] font-semibold">SELECTED COMPONENT</span>
          {isRootCause ? (
            <span className="px-1.5 py-0.5 rounded-[2px] bg-[#B83A3A]/10 border border-[#B83A3A]/30 text-[#B83A3A] font-code text-[10px] font-semibold">
              ROOT CAUSE (98.4%)
            </span>
          ) : (
            <span
              className={`px-1.5 py-0.5 rounded-[2px] font-code text-[10px] font-semibold uppercase ${
                service.status === 'critical'
                  ? 'bg-[#B83A3A]/10 border border-[#B83A3A]/30 text-[#B83A3A]'
                  : service.status === 'degraded'
                  ? 'bg-[#D9822B]/10 border border-[#D9822B]/30 text-[#C47F17]'
                  : service.status === 'predicted'
                  ? 'bg-[#7C6FA8]/10 border border-[#7C6FA8]/30 text-[#7C6FA8]'
                  : 'bg-[#2F7D5C]/10 border border-[#2F7D5C]/30 text-[#2F7D5C]'
              }`}
            >
              {service.status}
            </span>
          )}
        </div>
        <div className="font-code text-[13px] font-bold text-[#161D1A] tracking-tight mt-0.5">{service.displayName}</div>
        <div className="font-code text-[10px] text-[#4F5955] truncate">{service.host}</div>
        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
          <span className="px-1.5 py-0.5 rounded-[2px] bg-[#E9EDE9] text-[#2F443C] font-code text-[9px] font-medium uppercase">
            {service.tech}
          </span>
          <span className="text-[#8B9691] text-[9px]">·</span>
          <span className="font-code text-[9px] text-[#4F5955]">{service.region}</span>
        </div>
      </div>

      {/* CRITICAL DIAGNOSTIC NOTE STRIP */}
      {isRootCause ? (
        <div className="px-3 py-2 bg-[#FFF2F0] border-b border-[#FFD5D0] flex items-start gap-2">
          <span className="material-symbols-outlined text-[16px] text-[#B83A3A] shrink-0 mt-0.5">crisis_alert</span>
          <div>
            <div className="text-[11px] font-semibold text-[#8C1B1B]">Lock Contention &amp; Pool Saturation</div>
            <div className="text-[10px] text-[#9E3535] leading-tight mt-0.5">
              Query locks holding active transactions &gt;60s. Client connection exhaustion propagating 504 timeouts upstream.
            </div>
          </div>
        </div>
      ) : service.causalMechanism ? (
        <div className="px-3 py-2 bg-[#FFF7ED] border-b border-[#FDBA74] flex items-start gap-2">
          <span className="material-symbols-outlined text-[16px] text-[#C47F17] shrink-0 mt-0.5">warning</span>
          <div>
            <div className="text-[11px] font-semibold text-[#9A3412]">Causal Propagation Impact</div>
            <div className="text-[10px] text-[#C2410C] leading-tight mt-0.5">
              {service.causalMechanism}
            </div>
          </div>
        </div>
      ) : null}

      {/* DENSE TELEMETRY READOUT GRID */}
      <div className="p-3 border-b border-[#D9DCD8] space-y-2.5">
        <div className="font-section text-[10px] text-[#636F6B] font-semibold">
          REAL-TIME TELEMETRY METRICS
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {/* Metric: Latency */}
          <div className="p-1.5 rounded-[2px] bg-[#F7F7F5] border border-[#E1E5E1]">
            <div className="font-code text-[9px] text-[#636F6B] uppercase">Latency (P99)</div>
            <div
              className={`font-metric text-[16px] font-semibold leading-tight mt-0.5 ${
                service.latencyP99 > service.baselineLatency * 2 ? 'text-[#B83A3A]' : 'text-[#161D1A]'
              }`}
            >
              {service.latencyP99 >= 1000 ? (service.latencyP99 / 1000).toFixed(2) : service.latencyP99}
              <span className="text-[10px] font-normal text-[#636F6B]">
                {service.latencyP99 >= 1000 ? 's' : 'ms'}
              </span>
            </div>
            <div className="font-code text-[9px] text-[#B83A3A] font-medium mt-0.5">
              {service.latencyP99 > service.baselineLatency
                ? `↑ ${Math.round(((service.latencyP99 - service.baselineLatency) / service.baselineLatency) * 100)}% vs ${service.baselineLatency}ms norm`
                : 'Nominal'}
            </div>
          </div>

          {/* Metric: Connections / Saturation */}
          <div className="p-1.5 rounded-[2px] bg-[#F7F7F5] border border-[#E1E5E1]">
            <div className="font-code text-[9px] text-[#636F6B] uppercase">Pool Saturation</div>
            <div className="font-metric text-[16px] font-semibold text-[#B83A3A] leading-tight mt-0.5">
              {isRootCause ? '99.0' : service.podAllocation.current === service.podAllocation.max ? '100.0' : '45.0'}
              <span className="text-[10px] font-normal text-[#636F6B]">%</span>
            </div>
            <div className="font-code text-[9px] text-[#70797B] mt-0.5">
              {isRootCause ? '198 / 200 Max' : `${service.podAllocation.current} / ${service.podAllocation.max} Pods`}
            </div>
          </div>

          {/* Metric: Locks / Errors */}
          <div className="p-1.5 rounded-[2px] bg-[#F7F7F5] border border-[#E1E5E1]">
            <div className="font-code text-[9px] text-[#636F6B] uppercase">
              {isRootCause ? 'pg_locks Waiting' : 'Error Rate'}
            </div>
            <div className="font-metric text-[16px] font-semibold text-[#161D1A] leading-tight mt-0.5">
              {isRootCause ? '89' : `${service.errorRate}%`}
            </div>
            <div className="font-code text-[8px] text-[#B7791F] font-medium mt-0.5 truncate">
              {isRootCause ? 'ExclusiveLock on sku_idx' : service.errorRate > 1 ? 'Exceeds SLA (1.0%)' : 'Nominal SLO'}
            </div>
          </div>

          {/* Metric: Throughput */}
          <div className="p-1.5 rounded-[2px] bg-[#F7F7F5] border border-[#E1E5E1]">
            <div className="font-code text-[9px] text-[#636F6B] uppercase">Throughput</div>
            <div className="font-metric text-[16px] font-semibold text-[#161D1A] leading-tight mt-0.5">
              {service.throughput.split(' ')[0]}
              <span className="text-[10px] font-normal text-[#636F6B] ml-1">
                {service.throughput.split(' ').slice(1).join(' ')}
              </span>
            </div>
            <div className="font-code text-[8px] text-[#5E6561] mt-0.5">
              Error Rate: {service.errorRate}%
            </div>
          </div>
        </div>

        {/* Compact Historical Latency Sparkline */}
        <div className="p-2 bg-[#F7F7F5] border border-[#E1E5E1] rounded-[2px]">
          <div className="flex justify-between text-[9px] font-code text-[#636F6B] mb-1">
            <span>HISTORICAL LATENCY (T-15m)</span>
            <span className="font-semibold text-[#B83A3A]">T₀ TRIP (14:32:07)</span>
          </div>
          <svg className="w-full h-7 overflow-visible" viewBox="0 0 280 28">
            <path
              d="M 0 24 L 40 24 L 80 23 L 120 24 L 160 23 L 175 18 L 185 5 L 210 4 L 240 4 L 280 3"
              fill="none"
              stroke="#B83A3A"
              strokeWidth="1.6"
            />
            <line stroke="#B83A3A" strokeDasharray="2 2" strokeWidth="1" x1="175" x2="175" y1="0" y2="28" />
            <circle cx="280" cy="3" fill="#B83A3A" r="2" />
          </svg>
        </div>
      </div>

      {/* CAUSAL IMPACT RADIUS */}
      <div className="p-3 border-b border-[#D9DCD8] space-y-2 flex-1">
        <div className="font-section text-[10px] text-[#636F6B] font-semibold">
          CAUSAL IMPACT RADIUS
        </div>
        <div className="space-y-1.5 font-code text-[11px]">
          {/* Upstream Impacted */}
          <div className="p-2 bg-[#F7F7F5] border border-[#E1E5E1] rounded-[2px]">
            <div className="text-[9px] text-[#636F6B] uppercase font-semibold flex items-center justify-between mb-1">
              <span>Direct Upstream Dependents</span>
              <span className="text-[#B83A3A]">2 Impacted</span>
            </div>
            <div className="flex items-center justify-between py-0.5 border-b border-[#EBECE8] text-[10px]">
              <span className="text-[#161D1A] font-medium">inventory-service</span>
              <span className="text-[#B7791F] font-semibold">+1.28s wait</span>
            </div>
            <div className="flex items-center justify-between py-0.5 text-[10px]">
              <span className="text-[#161D1A] font-medium">order-service</span>
              <span className="text-[#B83A3A] font-semibold">504 timeouts</span>
            </div>
          </div>

          {/* Cluster Replicas */}
          <div className="p-2 bg-[#F7F7F5] border border-[#E1E5E1] rounded-[2px]">
            <div className="text-[9px] text-[#636F6B] uppercase font-semibold flex items-center justify-between mb-1">
              <span>Cluster Replicas</span>
              <span className="text-[#2F7D5C]">1 Ok · 1 Warn</span>
            </div>
            <div className="flex items-center justify-between py-0.5 border-b border-[#EBECE8] text-[10px]">
              <span className="text-[#5E6561]">replica-01</span>
              <span className="text-[#2F7D5C]">42ms lag (OK)</span>
            </div>
            <div className="flex items-center justify-between py-0.5 text-[10px]">
              <span className="text-[#5E6561]">replica-02</span>
              <span className="text-[#B7791F]">110ms lag (Warning)</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BUTTONS */}
      <div className="p-3 bg-[#F7F7F5] border-t border-[#D9DCD8] flex flex-col gap-1.5 shrink-0">
        <button
          onClick={onInvestigateRootCause}
          className="w-full h-7 rounded-[2px] bg-[#286B78] hover:bg-[#1E525C] text-white font-code text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[14px]">troubleshoot</span>
          INVESTIGATE ROOT CAUSE
        </button>
        <button
          onClick={onIsolateSubgraph}
          className="w-full h-6 rounded-[2px] bg-white hover:bg-[#EFF3F0] text-[#161D1A] border border-[#C2C9C5] font-code text-[10px] font-medium uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[13px]">device_hub</span>
          ISOLATE SUBGRAPH (6 NODES)
        </button>
      </div>
    </div>
  );
};
