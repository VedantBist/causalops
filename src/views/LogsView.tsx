import React, { useState } from 'react';
import { useDemoState } from '../context/DemoStateContext';
import { LogEntry } from '../types';
import { AppPage } from '../components/layout/AppShell';

interface LogsViewProps {
  onNavigate: (page: AppPage) => void;
}

export const LogsView: React.FC<LogsViewProps> = ({ onNavigate }) => {
  const { activeFault, logs: demoLogs } = useDemoState();
  const isAuthFail = activeFault === 'auth-gateway';
  const defaultLogId = isAuthFail ? 'log-auth-1' : 'log-1';
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(
    isAuthFail
      ? 'service:in(auth-gateway, api-gateway, inventory-db, order-service) AND (level:ERROR OR level:WARN)'
      : 'service:in(inventory-db, inventory-service, order-service, api-gateway) AND (level:ERROR OR level:WARN)'
  );
  const [selectedLevel, setSelectedLevel] = useState<'ALL' | 'ERROR' | 'WARN' | 'INFO'>('ALL');
  const [copied, setCopied] = useState<boolean>(false);

  const selectedLog = demoLogs.find((l) => l.id === (selectedLogId ?? defaultLogId)) || demoLogs[0];

  const filteredLogs = demoLogs.filter((l) => {
    if (selectedLevel !== 'ALL' && l.level !== selectedLevel) return false;
    return true;
  });

  const handleCopyRaw = () => {
    navigator.clipboard?.writeText(selectedLog.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col w-full font-sans text-[#171A19] p-4 bg-[#F7F7F5] select-text">
      {/* PRIMARY INVESTIGATION STRIP (INCIDENT ACTIVE SCOPE) */}
      <section className="w-full bg-white px-3 py-2 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2 border border-[#D9DCD8] rounded-[3px] mb-3">
        <div className="flex flex-col xl:flex-row xl:items-center gap-y-1 gap-x-3 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#B83A3A] animate-pulse"></span>
            <span className="font-code text-[11px] font-bold text-[#B83A3A]">{isAuthFail ? 'INC-8945' : 'INC-8941'}</span>
            <span className="font-section text-[10.5px] uppercase text-[#171A19] font-bold tracking-wider">
              {isAuthFail ? 'Auth Gateway Token Validation Failure' : 'Database Latency Cascade'}
            </span>
          </div>
          <div className="hidden xl:block h-3 w-px bg-[#D9DCD8]"></div>
          <div className="flex items-center gap-1 font-code text-[10.5px] text-[#5E6561] truncate">
            <span className="text-[#70797B]">Root Candidate:</span>
            <span className="text-[#171A19] font-semibold">auth-gateway (Envoy Proxy 1.28)</span>
            <span className="text-[#70797B]">·</span>
            <span className="text-[#70797B]">Onset:</span>
            <span className="text-[#00535f] font-medium">14:38:12.105 UTC (T0)</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 font-code text-[10px]">
          <span className="px-2 py-0.5 rounded-[2px] bg-[#00535f]/10 text-[#00535f] font-semibold tracking-wide border border-[#00535f]/20">
            FILTERED: INCIDENT SCOPE (4 SERVICES)
          </span>
          <button
            onClick={() => setSearchQuery('')}
            className="h-6 px-2 rounded-[2px] bg-[#F1F2F0] hover:bg-[#EAECE8] text-[#5E6561] transition-colors cursor-pointer"
          >
            CLEAR SCOPE
          </button>
        </div>
      </section>

      {/* QUERY FILTER WELL */}
      <section className="w-full bg-[#F1F2F0] p-2.5 flex flex-col gap-2 border border-[#D9DCD8] rounded-[3px] mb-3 font-code text-[11px]">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 w-full">
          <div className="relative flex-1 min-w-[280px]">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-[#70797B]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs (regex, message, trace id, field:value)..."
              className="w-full h-8 pl-8 pr-2.5 rounded-[2px] bg-white text-[#171A19] border border-[#D9DCD8] focus:outline-none focus:border-[#00535f]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="h-8 px-2 rounded-[2px] bg-white border border-[#D9DCD8] flex items-center gap-1.5 text-[10.5px]">
              <span className="text-[#70797B]">LEVEL:</span>
              <button
                onClick={() => setSelectedLevel('ALL')}
                className={`font-semibold cursor-pointer ${selectedLevel === 'ALL' ? 'text-[#00535f]' : 'text-[#70797B]'}`}
              >
                ALL
              </button>
              <button
                onClick={() => setSelectedLevel('ERROR')}
                className={`flex items-center gap-1 font-semibold cursor-pointer ${selectedLevel === 'ERROR' ? 'text-[#B83A3A] underline' : 'text-[#B83A3A]'}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#B83A3A]"></span>ERR (8)
              </button>
              <button
                onClick={() => setSelectedLevel('WARN')}
                className={`flex items-center gap-1 font-semibold cursor-pointer ${selectedLevel === 'WARN' ? 'text-[#D9822B] underline' : 'text-[#D9822B]'}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#D9822B]"></span>WARN (14)
              </button>
            </div>
            <div className="h-8 px-2 rounded-[2px] bg-white border border-[#D9DCD8] flex items-center gap-1 text-[#00535f] font-semibold text-[10.5px]">
              <span>TRACE:</span>
              <button onClick={() => onNavigate('traces')} className="underline hover:text-[#286B78] cursor-pointer">
                7fa91c
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TEMPORAL CASCADE TIMELINE TICKER */}
      <section className="w-full bg-white px-3 py-2 border border-[#D9DCD8] rounded-[3px] mb-3 overflow-x-auto">
        <div className="min-w-[960px] flex items-center justify-between gap-2 font-code text-[10.5px]">
          <span className="font-section text-[#70797B] font-bold text-[9.5px] uppercase">CASCADE VECTOR:</span>

          {/* Node 1 */}
          <div className="flex items-center gap-1.5 p-1.5 rounded bg-[#B83A3A]/10 text-[#171A19]">
            <span className="px-1 py-0.2 rounded bg-[#B83A3A] text-white font-bold text-[9px]">T0</span>
            <div className="flex flex-col">
              <span className="font-bold text-[#B83A3A]">inventory-db (14:32:07.481)</span>
              <span className="text-[9.5px] text-[#5E6561]">Disk I/O lock spike (1420ms wait)</span>
            </div>
          </div>
          <span className="text-[#70797B]">→</span>

          {/* Node 2 */}
          <div className="flex items-center gap-1.5 p-1.5 rounded bg-[#F7F7F5] border border-[#D9DCD8] text-[#171A19]">
            <span className="px-1 py-0.2 rounded bg-[#D9822B] text-white font-bold text-[9px]">+2.1s</span>
            <div className="flex flex-col">
              <span className="font-bold text-[#171A19]">inventory-service (14:32:09.612)</span>
              <span className="text-[9.5px] text-[#5E6561]">Pool starvation: 198/200 conn</span>
            </div>
          </div>
          <span className="text-[#70797B]">→</span>

          {/* Node 3 */}
          <div className="flex items-center gap-1.5 p-1.5 rounded bg-[#F7F7F5] border border-[#D9DCD8] text-[#171A19]">
            <span className="px-1 py-0.2 rounded bg-[#605889] text-white font-bold text-[9px]">+4.8s</span>
            <div className="flex flex-col">
              <span className="font-bold text-[#171A19]">order-service (14:32:12.308)</span>
              <span className="text-[9.5px] text-[#5E6561]">gRPC DeadlineExceeded</span>
            </div>
          </div>
          <span className="text-[#70797B]">→</span>

          {/* Node 4 */}
          <div className="flex items-center gap-1.5 p-1.5 rounded bg-[#B83A3A]/10 text-[#171A19]">
            <span className="px-1 py-0.2 rounded bg-[#B83A3A] text-white font-bold text-[9px]">+7.2s</span>
            <div className="flex flex-col">
              <span className="font-bold text-[#B83A3A]">api-gateway (14:32:14.701)</span>
              <span className="text-[9.5px] text-[#5E6561]">504 Gateway Timeout</span>
            </div>
          </div>
        </div>
      </section>

      {/* WORKSPACE SPLIT: LOG STREAM (8 cols) & INSPECTOR (4 cols) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* LOG STREAM TABLE */}
        <section className="lg:col-span-8 flex flex-col bg-white border border-[#D9DCD8] rounded-[3px] shadow-xs overflow-hidden">
          <div className="h-8 px-3 bg-[#F1F2F0] flex items-center justify-between text-[#70797B] font-code text-[10.5px] border-b border-[#D9DCD8]">
            <div className="flex items-center gap-3">
              <span className="font-section text-[#171A19] font-bold uppercase">CHRONOLOGICAL EVENT STREAM</span>
              <span>WINDOW: 14:32:00.000 — 14:32:25.000 UTC</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#171A19] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00535f]"></span>
              <span>PAUSED (INSPECTOR LOCKED)</span>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[620px]">
            <table className="w-full text-left border-collapse font-code text-[11px]">
              <thead>
                <tr className="bg-[#EAECE8] text-[#70797B] h-7 sticky top-0 z-20 border-b border-[#D9DCD8] font-medium uppercase text-[10px]">
                  <th className="w-28 pl-3 pr-2 font-normal">TIMESTAMP (UTC)</th>
                  <th className="w-16 px-2 font-normal">LEVEL</th>
                  <th className="w-36 px-2 font-normal">SERVICE</th>
                  <th className="w-20 px-2 font-normal">TRACE</th>
                  <th className="w-40 px-2 font-normal">CAUSAL ATTRIBUTION</th>
                  <th className="px-2 font-normal">PAYLOAD MESSAGE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9DCD8]">
                {filteredLogs.map((log) => {
                  const isSelected = log.id === selectedLogId;
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLogId(log.id)}
                      className={`group cursor-pointer hover:bg-[#F7F7F5] transition-colors ${
                        isSelected
                          ? 'bg-[#E9EDE9] border-l-4 border-l-[#00535f]'
                          : log.isIncidentAnchor
                          ? 'bg-[#B83A3A]/5'
                          : ''
                      }`}
                    >
                      <td className="pl-3 pr-2 py-1.5 font-semibold text-[#171A19] whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <span
                          className={`px-1 py-0.2 rounded font-bold text-[9.5px] ${
                            log.level === 'ERROR'
                              ? 'bg-[#B83A3A] text-white'
                              : log.level === 'WARN'
                              ? 'bg-[#D9822B] text-white'
                              : 'bg-[#00535f] text-white'
                          }`}
                        >
                          {log.level}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 font-semibold whitespace-nowrap">{log.service}</td>
                      <td className="px-2 py-1.5 text-[#00535f] font-medium">{log.traceId}</td>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9.5px] font-semibold ${
                            log.causalAttribution.includes('OBSERVED') || log.causalAttribution.includes('DOWNSTREAM +7.2s')
                              ? 'bg-[#B83A3A]/10 text-[#B83A3A]'
                              : log.causalAttribution.includes('INFERENCE')
                              ? 'bg-[#00535f]/10 text-[#00535f]'
                              : 'bg-[#F1F2F0] text-[#5E6561]'
                          }`}
                        >
                          {log.causalAttribution}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 font-mono text-[#171A19] truncate max-w-md">
                        {log.message}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="h-8 px-3 bg-[#F1F2F0] border-t border-[#D9DCD8] flex items-center justify-between font-code text-[10.5px] text-[#70797B]">
            <div>TOTAL: 12,842 · INCIDENT MATCH: 18 events</div>
            <div className="flex items-center gap-1">
              <span>PAGE 1 OF 3</span>
              <button className="px-1.5 py-0.2 bg-white rounded border border-[#D9DCD8]">PREV</button>
              <button className="px-1.5 py-0.2 bg-white rounded border border-[#D9DCD8]">NEXT</button>
            </div>
          </div>
        </section>

        {/* RIGHT PANE: DETAIL INSPECTOR */}
        <aside className="lg:col-span-4 bg-white border border-[#D9DCD8] rounded-[3px] shadow-xs flex flex-col p-3 space-y-3 font-code text-[11px]">
          <div className="flex items-center justify-between pb-1 border-b border-[#D9DCD8]">
            <span className="font-section text-[10.5px] font-bold text-[#171A19] uppercase">
              LOG INSPECTOR · INCIDENT EVIDENCE
            </span>
            <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-[#00535f] text-white font-semibold">
              ACTIVE SELECTION
            </span>
          </div>

          {/* Coordinates */}
          <div className="p-2 bg-[#F7F7F5] rounded border border-[#D9DCD8] space-y-1">
            <div className="flex justify-between">
              <span className="text-[#70797B]">SERVICE:</span>
              <span className="font-bold text-[#171A19]">{selectedLog.service}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#70797B]">TIMESTAMP:</span>
              <span className="font-semibold text-[#00535f]">{selectedLog.timestamp} UTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#70797B]">ROLE:</span>
              <span className="font-bold text-[#B83A3A]">{selectedLog.causalAttribution}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#70797B]">TRACE ID:</span>
              <button
                onClick={() => onNavigate('traces')}
                className="text-[#00535f] underline font-bold hover:text-[#286B78] cursor-pointer"
              >
                {selectedLog.traceId}
              </button>
            </div>
            <div className="flex justify-between">
              <span className="text-[#70797B]">HOST:</span>
              <span className="text-[#171A19]">{selectedLog.host}</span>
            </div>
          </div>

          {/* Raw Log Message */}
          <div>
            <div className="flex items-center justify-between text-[#70797B] text-[10px] mb-1">
              <span className="font-section font-semibold uppercase">RAW LOG MESSAGE</span>
              <button
                onClick={handleCopyRaw}
                className="text-[#00535f] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[13px]">content_copy</span>
                <span>{copied ? 'COPIED!' : 'COPY'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded bg-[#161D1A] text-white font-mono text-[11px] leading-relaxed break-all select-all">
              {selectedLog.message}
            </div>
          </div>

          {/* Structured Attributes */}
          <div>
            <span className="font-section text-[#70797B] font-semibold uppercase text-[10px] block mb-1">
              STRUCTURED ATTRIBUTES
            </span>
            <div className="bg-[#F7F7F5] rounded p-2 border border-[#D9DCD8] space-y-1 text-[10.5px]">
              {Object.entries(selectedLog.structuredAttributes).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-0.5 border-b border-[#D9DCD8]/40 last:border-0">
                  <span className="text-[#70797B]">{k}:</span>
                  <span className="font-bold text-[#171A19] font-mono">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Correlated Telemetry At T0 */}
          <div className="p-2.5 bg-[#F7F7F5] rounded border border-[#D9DCD8] space-y-1.5">
            <span className="font-section text-[10px] font-bold text-[#171A19] uppercase block">
              CORRELATED TELEMETRY (T0)
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-center">
              <div className="p-1.5 bg-white rounded border border-[#D9DCD8]">
                <div className="text-[9px] text-[#70797B]">DB Latency</div>
                <div className="font-metric text-[15px] font-bold text-[#B83A3A]">1.42s</div>
                <div className="text-[8.5px] text-[#B83A3A]">+914% threshold</div>
              </div>
              <div className="p-1.5 bg-white rounded border border-[#D9DCD8]">
                <div className="text-[9px] text-[#70797B]">Pool Saturation</div>
                <div className="font-metric text-[15px] font-bold text-[#B83A3A]">99.0%</div>
                <div className="text-[8.5px] text-[#70797B]">198/200 conns</div>
              </div>
              <div className="p-1.5 bg-white rounded border border-[#D9DCD8]">
                <div className="text-[9px] text-[#70797B]">inventory-svc P99</div>
                <div className="font-metric text-[15px] font-bold text-[#D9822B]">820ms</div>
                <div className="text-[8.5px] text-[#D9822B]">+355% nominal</div>
              </div>
              <div className="p-1.5 bg-white rounded border border-[#D9DCD8]">
                <div className="text-[9px] text-[#70797B]">API Error Rate</div>
                <div className="font-metric text-[15px] font-bold text-[#B83A3A]">7.2%</div>
                <div className="text-[8.5px] text-[#B83A3A]">+180x baseline</div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={() => onNavigate('topology')}
              className="py-1.5 bg-[#00535f] text-white rounded font-semibold text-[10.5px] hover:bg-[#286B78] transition-colors cursor-pointer"
            >
              VIEW TOPOLOGY
            </button>
            <button
              onClick={() => onNavigate('traces')}
              className="py-1.5 bg-white border border-[#D9DCD8] text-[#171A19] rounded font-semibold text-[10.5px] hover:bg-[#F1F2F0] transition-colors cursor-pointer"
            >
              TRACE #7fa91c
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
