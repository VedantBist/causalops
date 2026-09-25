import React, { useState, useEffect, useCallback } from 'react';
import { AppPage } from '../components/layout/AppShell';
import { causalOpsApi, ActiveIncident } from '../api/client';

interface ActiveIncidentsViewProps {
  onNavigate: (page: AppPage) => void;
}

function formatDuration(openedAt: string): string {
  const ms = Date.now() - new Date(openedAt).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return `${h}h ${rem}m`;
}

function parseAffectedServices(raw: string | string[] | unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return [raw]; }
  }
  return [];
}

function mapStatusToRca(status: string): string {
  if (status === 'RCA_IDENTIFIED') return 'Identified';
  if (status === 'INVESTIGATING') return 'Investigating';
  if (status === 'ANALYSIS_FAILED') return 'Analysis Failed';
  return 'Pending';
}

export const ActiveIncidentsView: React.FC<ActiveIncidentsViewProps> = ({ onNavigate }) => {
  const [incidents, setIncidents] = useState<ActiveIncident[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('all');
  const [rcaFilter, setRcaFilter] = useState<'all' | 'Identified' | 'Investigating'>('all');
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedRca, setSelectedRca] = useState<any>(null);

  const loadIncidents = useCallback(async () => {
    try {
      const data = await causalOpsApi.incidents();
      setIncidents(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
      setApiError(null);
    } catch {
      setApiError('Backend unavailable');
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    loadIncidents();
    const interval = setInterval(loadIncidents, 5000);
    return () => clearInterval(interval);
  }, [loadIncidents]);

  // Load RCA for selected incident
  useEffect(() => {
    if (!selectedId) return;
    setSelectedRca(null);
    causalOpsApi.incidentRca(selectedId)
      .then(setSelectedRca)
      .catch(() => setSelectedRca(null));
  }, [selectedId]);

  const selected = incidents.find((i) => i.id === selectedId) ?? incidents[0] ?? null;

  const filteredIncidents = incidents.filter((inc) => {
    if (severityFilter !== 'all' && inc.severity !== severityFilter) return false;
    if (rcaFilter !== 'all' && mapStatusToRca(inc.status) !== rcaFilter) return false;
    return true;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'bg-[#B83A3A]/10 text-[#B83A3A] border-[#B83A3A]/30';
      case 'HIGH': return 'bg-[#D9822B]/10 text-[#C47F17] border-[#D9822B]/30';
      case 'MEDIUM': return 'bg-[#B7791F]/10 text-[#B7791F] border-[#B7791F]/30';
      default: return 'bg-[#2F7D5C]/10 text-[#2F7D5C] border-[#2F7D5C]/30';
    }
  };

  const getRcaBadge = (status: string) => {
    const rca = mapStatusToRca(status);
    if (rca === 'Identified') return 'bg-[#00535f]/10 text-[#00535f] border-[#00535f]/30';
    if (rca === 'Investigating') return 'bg-[#D9822B]/10 text-[#C47F17] border-[#D9822B]/30';
    if (rca === 'Analysis Failed') return 'bg-[#B83A3A]/10 text-[#B83A3A] border-[#B83A3A]/30';
    return 'bg-[#70797B]/10 text-[#5E6561] border-[#D9DCD8]';
  };

  const criticalCount = incidents.filter((i) => i.severity === 'CRITICAL').length;
  const highCount = incidents.filter((i) => i.severity === 'HIGH').length;
  const medCount = incidents.filter((i) => i.severity === 'MEDIUM').length;

  return (
    <div className="flex flex-col w-full h-[calc(100vh-2.75rem)] overflow-hidden bg-[#F7F7F5] select-none font-sans text-[#171A19]">
      {/* OPERATIONAL HEADER SUB-BAR */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-[#FFFFFF] border-b border-[#D9DCD8] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#B83A3A]/10 border border-[#B83A3A]/30 text-[#B83A3A] font-code text-[11px] font-semibold uppercase tracking-wider">
            <span className={`w-1.5 h-1.5 rounded-full bg-[#B83A3A] ${incidents.length > 0 ? 'animate-pulse' : ''}`} />
            <span>DETECT · ACTIVE QUEUE</span>
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-[#171A19] tracking-tight">Active Incidents</h1>
            <p className="text-[11px] text-[#5E6561]">
              Primary operational queue · &ldquo;What incidents are happening right now?&rdquo;
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-code text-[11px]">
          {loading ? (
            <span className="text-[#70797B]">Loading…</span>
          ) : apiError ? (
            <span className="text-[#C47F17] bg-[#D9822B]/10 border border-[#D9822B]/30 px-2 py-0.5 rounded-[2px] text-[10px]">
              {apiError}
            </span>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-[3px] bg-[#F7F7F5] border border-[#D9DCD8]">
              <span className="text-[#858C87]">TOTAL ACTIVE:</span>
              <span className="font-bold text-[#171A19]">{incidents.length}</span>
              {criticalCount > 0 && <><span className="text-[#D9DCD8]">·</span><span className="text-[#B83A3A] font-semibold">{criticalCount} Critical</span></>}
              {highCount > 0 && <><span className="text-[#D9DCD8]">·</span><span className="text-[#C47F17] font-semibold">{highCount} High</span></>}
              {medCount > 0 && <><span className="text-[#D9DCD8]">·</span><span className="text-[#5E6561]">{medCount} Med</span></>}
            </div>
          )}
          <button
            onClick={() => onNavigate('incident-history')}
            className="px-2.5 py-1 text-[11px] font-code font-medium text-[#5E6561] hover:text-[#171A19] bg-[#FFFFFF] border border-[#D9DCD8] rounded-[3px] hover:bg-[#F1F2F0] transition-colors cursor-pointer"
          >
            Resolved History →
          </button>
        </div>
      </div>

      {/* FILTER STRIP */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#F1F2F0] border-b border-[#D9DCD8] text-[11px] font-code shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[#5E6561]">
            <span className="text-[#858C87]">Severity:</span>
            {(['all', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2 py-0.5 rounded-[2px] transition-colors uppercase ${
                  severityFilter === sev
                    ? 'bg-white text-[#171A19] font-bold shadow-xs border border-[#D9DCD8]'
                    : 'text-[#70797B] hover:text-[#171A19]'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
          <span className="text-[#D9DCD8]">|</span>
          <div className="flex items-center gap-1 text-[#5E6561]">
            <span className="text-[#858C87]">Root Cause:</span>
            {(['all', 'Identified', 'Investigating'] as const).map((rca) => (
              <button
                key={rca}
                onClick={() => setRcaFilter(rca)}
                className={`px-2 py-0.5 rounded-[2px] transition-colors ${
                  rcaFilter === rca
                    ? 'bg-white text-[#00535f] font-bold shadow-xs border border-[#D9DCD8]'
                    : 'text-[#70797B] hover:text-[#171A19]'
                }`}
              >
                {rca}
              </button>
            ))}
          </div>
        </div>
        <div className="text-[10.5px] text-[#70797B]">
          Showing {filteredIncidents.length} of {incidents.length} incidents
        </div>
      </div>

      {/* MAIN WORKSPACE */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* LEFT: INCIDENT TABLE */}
        <div className="flex-1 flex flex-col bg-[#FFFFFF] overflow-y-auto border-r border-[#D9DCD8]">
          {loading ? (
            <div className="p-8 text-center text-[#70797B] font-code text-[12px]">Loading incidents…</div>
          ) : filteredIncidents.length === 0 ? (
            <div className="p-8 text-center font-code text-[12px]">
              {incidents.length === 0 ? (
                <div>
                  <div className="text-[#2F7D5C] font-bold text-[16px] mb-2">✓ No Active Incidents</div>
                  <div className="text-[#70797B]">All monitored services are operating within normal thresholds.</div>
                  <button
                    onClick={() => onNavigate('simulation')}
                    className="mt-4 px-3 py-1.5 bg-[#286B78] text-white rounded-[3px] text-[11px] font-semibold cursor-pointer"
                  >
                    Run Fault Injection Simulation →
                  </button>
                </div>
              ) : (
                <div className="text-[#70797B]">No incidents match current filters.</div>
              )}
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-[12px]">
              <thead className="sticky top-0 bg-[#F7F7F5] border-b border-[#D9DCD8] z-10 text-[10px] font-code text-[#70797B] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Incident</th>
                  <th className="py-2.5 px-3 font-semibold">Severity</th>
                  <th className="py-2.5 px-3 font-semibold">Title</th>
                  <th className="py-2.5 px-3 font-semibold">Affected Services</th>
                  <th className="py-2.5 px-3 font-semibold">Duration</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Root Cause</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECE8]">
                {filteredIncidents.map((incident) => {
                  const isSelected = incident.id === selectedId;
                  const services = parseAffectedServices(incident.affectedServices);
                  const rcaStatus = mapStatusToRca(incident.status);
                  return (
                    <tr
                      key={incident.id}
                      onClick={() => setSelectedId(incident.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#F0F5F6] border-l-4 border-l-[#286B78]' : 'hover:bg-[#F9FAF9]'
                      }`}
                    >
                      <td className="py-3 px-3 font-code font-bold text-[#171A19]">
                        <div className="flex items-center gap-1.5">
                          {incident.severity === 'CRITICAL' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B83A3A] animate-ping" />
                          )}
                          <span>{incident.incidentKey}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex px-1.5 py-0.5 text-[9.5px] font-code font-bold uppercase rounded-[2px] border ${getSeverityBadge(incident.severity)}`}>
                          {incident.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#171A19]">{incident.title}</div>
                        <div className="text-[11px] text-[#5E6561] truncate max-w-[280px]">{incident.summary}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {services.slice(0, 3).map((svc) => (
                            <span key={svc} className="font-code text-[9.5px] px-1.5 py-0.5 rounded-[2px] bg-[#EAECE8] text-[#2F443C]">
                              {svc}
                            </span>
                          ))}
                          {services.length > 3 && (
                            <span className="font-code text-[9.5px] text-[#70797B]">+{services.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-code text-[11px]">
                        <div className="font-semibold text-[#B83A3A]">{formatDuration(incident.openedAt)}</div>
                        <div className="text-[10px] text-[#70797B]">
                          {new Date(incident.openedAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-code text-[10.5px] text-[#171A19] font-medium px-2 py-0.5 rounded-[2px] bg-[#F1F2F0]">
                          {incident.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex w-fit px-1.5 py-0.5 text-[9.5px] font-code font-semibold rounded-[2px] border ${getRcaBadge(incident.status)}`}>
                          {rcaStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* RIGHT: INSPECTOR */}
        {selected && (
          <div className="w-[380px] bg-[#FFFFFF] border-l border-[#D9DCD8] flex flex-col shrink-0 overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-[#D9DCD8] bg-[#F7F7F5]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-section text-[10px] text-[#70797B] font-semibold tracking-wider">
                  INCIDENT INSPECTOR
                </span>
                <span className={`font-code text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded-[2px] border ${getSeverityBadge(selected.severity)}`}>
                  {selected.severity}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-code text-[14px] font-bold text-[#171A19]">{selected.incidentKey}</span>
                <span className="text-[#70797B]">·</span>
                <h2 className="text-[14px] font-semibold text-[#171A19]">{selected.title}</h2>
              </div>
              <div className="mt-1 font-code text-[11px] text-[#5E6561] flex items-center gap-2">
                <span>{new Date(selected.openedAt).toLocaleString()}</span>
                <span>·</span>
                <span className="text-[#B83A3A] font-semibold">{formatDuration(selected.openedAt)} active</span>
              </div>
            </div>

            {/* RCA Status */}
            <div className="p-3 border-b border-[#D9DCD8] bg-[#FFFFFF]">
              <div className="flex items-center justify-between text-[11px] font-code mb-1">
                <span className="text-[#70797B] uppercase">Root Cause</span>
                <span className={`px-1.5 py-0.5 rounded-[2px] font-semibold text-[10px] border ${getRcaBadge(selected.status)}`}>
                  {mapStatusToRca(selected.status)}
                </span>
              </div>
              {selectedRca?.analysis?.root_cause ? (
                <div className="p-2 rounded-[3px] bg-[#F0F5F6] border border-[#99F6E4]/60">
                  <div className="font-code text-[10px] text-[#00535f] font-semibold uppercase">Origin Service</div>
                  <div className="font-code text-[13px] font-bold text-[#171A19] mt-0.5">
                    {selectedRca.analysis.root_cause}
                  </div>
                  <div className="text-[10.5px] text-[#5E6561] mt-0.5">
                    Confidence:{' '}
                    <strong className="text-[#00535f]">
                      {Math.round((selectedRca.analysis.confidence ?? 0) * 100)}%
                    </strong>
                    {' '}via heuristic baseline
                  </div>
                  <div className="mt-1 font-code text-[10px] text-[#70797B]">
                    {selectedRca.analysis.methodology}
                  </div>
                </div>
              ) : (
                <div className="p-2 rounded-[3px] bg-[#F7F7F5] border border-[#D9DCD8] text-[11px] text-[#5E6561]">
                  {selected.status === 'INVESTIGATING'
                    ? 'Causal models ingesting telemetry and distributed traces...'
                    : selected.status === 'ANALYSIS_FAILED'
                    ? 'Analysis encountered an error — retry or check AI engine logs.'
                    : 'RCA analysis pending.'}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="p-4 border-b border-[#D9DCD8]">
              <div className="font-section text-[10px] text-[#70797B] font-semibold tracking-wider mb-1.5">SYNOPSIS</div>
              <p className="text-[12px] text-[#2F443C] leading-relaxed">{selected.summary}</p>
            </div>

            {/* Affected Services */}
            <div className="p-4 border-b border-[#D9DCD8]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-section text-[10px] text-[#70797B] font-semibold tracking-wider">
                  AFFECTED SERVICES ({parseAffectedServices(selected.affectedServices).length})
                </span>
                <button onClick={() => onNavigate('services')} className="text-[10px] font-code text-[#286B78] hover:underline">
                  View Fleet →
                </button>
              </div>
              <div className="space-y-1.5">
                {parseAffectedServices(selected.affectedServices).map((svc, idx) => (
                  <div key={svc} className="flex items-center justify-between p-2 rounded-[3px] bg-[#F7F7F5] border border-[#E1E5E1] text-[11.5px]">
                    <div className="flex items-center gap-2">
                      <span className="font-code text-[10px] text-[#70797B]">#{idx + 1}</span>
                      <span className="font-code font-semibold text-[#171A19]">{svc}</span>
                    </div>
                    <span className={`font-code text-[9.5px] font-medium px-1.5 py-0.5 rounded-[2px] ${
                      svc === selectedRca?.analysis?.root_cause
                        ? 'bg-[#B83A3A]/10 text-[#B83A3A]'
                        : 'bg-[#D9822B]/10 text-[#C47F17]'
                    }`}>
                      {svc === selectedRca?.analysis?.root_cause ? 'ROOT CAUSE' : 'CASCADE'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RCA Candidates */}
            {selectedRca?.candidates && selectedRca.candidates.length > 0 && (
              <div className="p-4 border-b border-[#D9DCD8]">
                <div className="font-section text-[10px] text-[#70797B] font-semibold tracking-wider mb-2">
                  CANDIDATE RANKING
                </div>
                <div className="space-y-1.5">
                  {selectedRca.candidates.map((c: any, idx: number) => (
                    <div key={c.service} className="flex items-center justify-between p-1.5 rounded-[3px] bg-[#F7F7F5] border border-[#E1E5E1]">
                      <div className="flex items-center gap-2 font-code text-[11px]">
                        <span className="text-[10px] text-[#70797B]">#{idx + 1}</span>
                        <span className={`font-semibold ${idx === 0 ? 'text-[#B83A3A]' : 'text-[#171A19]'}`}>{c.service}</span>
                      </div>
                      <div className="font-code text-[11px]">
                        <span className={`font-bold ${idx === 0 ? 'text-[#B83A3A]' : 'text-[#70797B]'}`}>
                          {Math.round((c.score ?? 0) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="p-4 bg-[#F7F7F5] border-t border-[#D9DCD8] flex flex-col gap-2 shrink-0 mt-auto">
              <button
                onClick={() => onNavigate('root-cause')}
                className="w-full h-8 px-4 rounded-[3px] bg-[#286B78] hover:bg-[#00535f] text-white font-code text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <span>INVESTIGATE ROOT CAUSE</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => onNavigate('traces')}
                  className="flex-1 h-7 px-2 rounded-[3px] bg-white border border-[#D9DCD8] text-[#5E6561] hover:text-[#171A19] font-code text-[10px] font-medium transition-colors cursor-pointer"
                >
                  View Traces
                </button>
                <button
                  onClick={() => onNavigate('metrics')}
                  className="flex-1 h-7 px-2 rounded-[3px] bg-white border border-[#D9DCD8] text-[#5E6561] hover:text-[#171A19] font-code text-[10px] font-medium transition-colors cursor-pointer"
                >
                  View Metrics
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
