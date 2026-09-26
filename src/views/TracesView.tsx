import React, { useState } from 'react';
import { useDemoState } from '../context/DemoStateContext';
import { TraceSpan } from '../types';
import { AppPage } from '../components/layout/AppShell';

interface TracesViewProps {
  onNavigate: (page: AppPage) => void;
}

export const TracesView: React.FC<TracesViewProps> = ({ onNavigate }) => {
  const { activeFault, traces: demoTraces } = useDemoState();
  const isAuthFail = activeFault === 'auth-gateway';
  const [selectedSpanId, setSelectedSpanId] = useState<string>('span-db-1');
  const [filterService, setFilterService] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const selectedSpan = demoTraces.find((s) => s.id === selectedSpanId) || demoTraces[0];
  const totalDuration = 8420;

  const filteredSpans = demoTraces.filter((span) => {
    if (filterService !== 'all' && span.service !== filterService) return false;
    if (filterStatus === 'error' && span.status === 'OK') return false;
    if (filterStatus === 'ok' && span.status !== 'OK') return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden text-slate-800 font-sans">
      {/* Sub-bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 font-bold rounded">
            INCIDENT CORRELATED
          </span>
          <h1 className="text-sm font-bold text-slate-900 tracking-tight">
            DISTRIBUTED TRACES · {isAuthFail ? 'INC-8945' : 'INC-8941'} PROPAGATION PATH
          </h1>
          <span className="text-xs text-slate-500 font-mono">
            {demoTraces.length} Spans · Total Duration: 8,420ms
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('root-cause')}
            className="px-2.5 py-1 text-xs font-mono font-medium border border-teal-600 text-teal-700 bg-teal-50/50 hover:bg-teal-50 rounded transition-colors"
          >
            ← ROOT CAUSE ANALYSIS
          </button>
          <button
            onClick={() => onNavigate('metrics')}
            className="px-2.5 py-1 text-xs font-mono font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 rounded transition-colors"
          >
            METRIC CORRELATION
          </button>
        </div>
      </div>

      {/* Main split: Left list & waterfall, Right inspector */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Trace Selector & Waterfall */}
        <div className="flex-1 flex flex-col border-r border-slate-200 overflow-hidden">
          {/* Active Trace Summary Card */}
          <div className="p-4 bg-white border-b border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500">TRACE ID:</span>
                <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  tr-8941-a1b2c3d4
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-mono text-slate-700 font-bold">POST /v2/checkout</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-slate-500">Total Latency:</span>
                <span className="font-bold text-red-600">8,420ms</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-red-100 text-red-800">
                  504 DEADLINE_EXCEEDED
                </span>
              </div>
            </div>

            {/* Trace Causality Banner */}
            <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="font-bold text-amber-900">Bottleneck Span Detected:</span>
                <span className="font-mono text-amber-950 font-semibold">
                  inventory-db: SELECT ... FOR UPDATE (1,420ms lock hold)
                </span>
              </div>
              <span className="font-mono text-[11px] text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300">
                Connection pool exhaustion cascade
              </span>
            </div>
          </div>

          {/* Trace Toolbar */}
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 text-[11px] font-mono">Filter Service:</span>
                <select
                  value={filterService}
                  onChange={(e) => setFilterService(e.target.value)}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono text-slate-700 focus:outline-none focus:border-teal-500"
                >
                  <option value="all">All Services ({demoTraces.length})</option>
                  <option value="auth-gateway">auth-gateway</option>
                  <option value="api-gateway">api-gateway</option>
                  <option value="order-service">order-service</option>
                  <option value="inventory-service">inventory-service</option>
                  <option value="inventory-db">inventory-db</option>
                  <option value="auth-service">auth-service</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 text-[11px] font-mono">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono text-slate-700 focus:outline-none focus:border-teal-500"
                >
                  <option value="all">All Spans</option>
                  <option value="error">Errors & Critical Only</option>
                  <option value="ok">Healthy Spans</option>
                </select>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-500">
              Timeline: <span className="font-bold text-slate-700">0ms → 8,420ms</span>
            </div>
          </div>

          {/* Waterfall Visualizer */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1.5 bg-white">
            {/* Timeline Header Ruler */}
            <div className="flex items-center pb-2 border-b border-slate-200 text-[10px] font-mono text-slate-400">
              <div className="w-80 shrink-0 font-semibold text-slate-500">SERVICE & SPAN OPERATION</div>
              <div className="flex-1 relative h-4">
                <span className="absolute left-0">0s</span>
                <span className="absolute left-1/4">2.1s</span>
                <span className="absolute left-2/4">4.2s</span>
                <span className="absolute left-3/4">6.3s</span>
                <span className="absolute right-0 font-bold text-slate-600">8.42s</span>
              </div>
              <div className="w-24 text-right shrink-0">DURATION</div>
            </div>

            {/* Waterfall Rows */}
            {filteredSpans.map((span) => {
              const isSelected = span.id === selectedSpanId;
              const leftPercent = (span.startOffsetMs / totalDuration) * 100;
              const widthPercent = Math.max((span.durationMs / totalDuration) * 100, 1.5);

              const isRoot = span.isRootCause;
              const isCritical = span.status === 'CRITICAL';
              const isWarn = span.status === 'WARN';
              const isError = span.status === 'ERROR';

              let barColor = 'bg-teal-500';
              if (isRoot) barColor = 'bg-red-600';
              else if (isCritical) barColor = 'bg-red-500';
              else if (isWarn) barColor = 'bg-amber-500';
              else if (isError) barColor = 'bg-rose-500';

              return (
                <div
                  key={span.id}
                  onClick={() => setSelectedSpanId(span.id)}
                  className={`group flex items-center py-2 px-2.5 rounded cursor-pointer transition-colors border ${
                    isSelected
                      ? 'bg-teal-50/70 border-teal-300'
                      : 'hover:bg-slate-50 border-transparent hover:border-slate-200'
                  }`}
                >
                  {/* Left Column: Hierarchy & Service */}
                  <div className="w-80 shrink-0 flex items-center gap-1.5 overflow-hidden pr-2">
                    <div style={{ marginLeft: `${span.depth * 14}px` }} className="flex items-center gap-1.5 truncate">
                      {span.depth > 0 && <span className="text-slate-300 text-xs">↳</span>}
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isRoot ? 'bg-red-600 ring-2 ring-red-200' : isCritical ? 'bg-red-500' : isWarn ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      ></span>
                      <span className="text-xs font-mono font-bold text-slate-800 truncate">
                        {span.service}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 truncate">
                        {span.operation}
                      </span>
                    </div>
                  </div>

                  {/* Waterfall Bar Area */}
                  <div className="flex-1 relative h-6 flex items-center bg-slate-50 rounded px-1">
                    {/* Gridlines */}
                    <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20">
                      <div className="w-px h-full bg-slate-300"></div>
                      <div className="w-px h-full bg-slate-300"></div>
                      <div className="w-px h-full bg-slate-300"></div>
                      <div className="w-px h-full bg-slate-300"></div>
                    </div>

                    {/* Span Bar */}
                    <div
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                      className={`absolute h-4 rounded-xs transition-all ${barColor} ${
                        isRoot ? 'animate-pulse ring-2 ring-red-400' : ''
                      } flex items-center px-1.5 overflow-hidden shadow-xs`}
                    >
                      <span className="text-[9px] font-mono font-bold text-white truncate drop-shadow">
                        {span.durationMs >= 1000 ? `${(span.durationMs / 1000).toFixed(2)}s` : `${span.durationMs}ms`}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Duration & Status */}
                  <div className="w-24 text-right shrink-0">
                    <span
                      className={`text-xs font-mono font-bold ${
                        isRoot || isCritical ? 'text-red-600' : isWarn ? 'text-amber-600' : 'text-slate-700'
                      }`}
                    >
                      {span.durationMs >= 1000 ? `${(span.durationMs / 1000).toFixed(2)}s` : `${span.durationMs}ms`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Span Inspector */}
        <div className="w-96 bg-white shrink-0 overflow-y-auto flex flex-col p-5">
          <div className="border-b border-slate-200 pb-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-500">SPAN INSPECTOR</span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                  selectedSpan.isRootCause
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : selectedSpan.status === 'CRITICAL'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {selectedSpan.isRootCause ? 'ROOT CAUSE' : selectedSpan.status}
              </span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 mt-1">{selectedSpan.operation}</h2>
            <div className="text-xs font-mono text-slate-500 mt-0.5">
              Service: <span className="font-bold text-slate-800">{selectedSpan.service}</span>
            </div>
          </div>

          {/* Span Metrics */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Duration</span>
              <span className="text-sm font-mono font-bold text-slate-900">
                {selectedSpan.durationMs >= 1000 ? `${(selectedSpan.durationMs / 1000).toFixed(2)}s` : `${selectedSpan.durationMs}ms`}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Start Offset</span>
              <span className="text-sm font-mono font-bold text-slate-900">+{selectedSpan.startOffsetMs}ms</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Span ID</span>
              <span className="text-xs font-mono text-slate-700 truncate block">{selectedSpan.id}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Parent Span</span>
              <span className="text-xs font-mono text-slate-700 truncate block">{selectedSpan.parentId || 'ROOT'}</span>
            </div>
          </div>

          {/* Causal Diagnostics */}
          {selectedSpan.isRootCause && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-900 mb-1">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                Root Cause Origin
              </div>
              <p className="text-xs text-red-800 leading-relaxed">
                Exclusive lock contention on table <span className="font-mono font-bold">inventory_allocations</span> held by PID 28411 blocked HikariCP worker threads, cascading upstream through inventory-service to order-service.
              </p>
              <div className="mt-2 text-[11px] font-mono text-red-700 bg-white/80 p-2 rounded border border-red-200">
                SELECT * FROM inventory_allocations WHERE item_id = $1 FOR UPDATE;
              </div>
            </div>
          )}

          {/* Attributes Table */}
          <div className="mb-4">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-500 mb-2 block">
              SPAN ATTRIBUTES & METADATA
            </span>
            <div className="border border-slate-200 rounded overflow-hidden text-xs">
              {selectedSpan.attributes &&
                Object.entries(selectedSpan.attributes).map(([key, value]) => (
                  <div key={key} className="flex border-b border-slate-100 last:border-0 font-mono text-[11px]">
                    <span className="w-1/2 p-2 bg-slate-50 text-slate-600 font-medium border-r border-slate-200 break-all">
                      {key}
                    </span>
                    <span className="w-1/2 p-2 text-slate-800 break-all">{String(value)}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto pt-3 border-t border-slate-200 flex flex-col gap-2">
            <button
              onClick={() => onNavigate('root-cause')}
              className="w-full py-2 bg-teal-800 hover:bg-teal-900 text-white rounded text-xs font-mono font-bold tracking-wide transition-colors"
            >
              VIEW CAUSAL CHAIN IN INVESTIGATION
            </button>
            <button
              onClick={() => onNavigate('logs')}
              className="w-full py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded text-xs font-mono font-medium transition-colors"
            >
              FIND ASSOCIATED LOGS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
