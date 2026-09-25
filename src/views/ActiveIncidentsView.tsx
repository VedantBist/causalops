import React, { useState } from 'react';
import { ACTIVE_INCIDENTS } from '../data/mockData';
import { ActiveIncidentItem } from '../types';
import { AppPage } from '../components/layout/AppShell';

interface ActiveIncidentsViewProps {
  onNavigate: (page: AppPage) => void;
}

export const ActiveIncidentsView: React.FC<ActiveIncidentsViewProps> = ({ onNavigate }) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('INC-8941');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [rcaFilter, setRcaFilter] = useState<'all' | 'Identified' | 'Investigating' | 'Unknown'>('all');

  const selectedIncident: ActiveIncidentItem =
    ACTIVE_INCIDENTS.find((inc) => inc.id === selectedIncidentId) || ACTIVE_INCIDENTS[0];

  const filteredIncidents = ACTIVE_INCIDENTS.filter((inc) => {
    if (severityFilter !== 'all' && inc.severity !== severityFilter) return false;
    if (rcaFilter !== 'all' && inc.rootCauseStatus !== rcaFilter) return false;
    return true;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-[#B83A3A]/10 text-[#B83A3A] border-[#B83A3A]/30';
      case 'high':
        return 'bg-[#D9822B]/10 text-[#C47F17] border-[#D9822B]/30';
      case 'medium':
        return 'bg-[#B7791F]/10 text-[#B7791F] border-[#B7791F]/30';
      default:
        return 'bg-[#2F7D5C]/10 text-[#2F7D5C] border-[#2F7D5C]/30';
    }
  };

  const getRcaStatusBadge = (status: string) => {
    switch (status) {
      case 'Identified':
        return 'bg-[#00535f]/10 text-[#00535f] border-[#00535f]/30';
      case 'Investigating':
        return 'bg-[#D9822B]/10 text-[#C47F17] border-[#D9822B]/30';
      case 'Unknown':
      default:
        return 'bg-[#70797B]/10 text-[#5E6561] border-[#D9DCD8]';
    }
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-2.75rem)] overflow-hidden bg-[#F7F7F5] select-none font-sans text-[#171A19]">
      {/* OPERATIONAL HEADER SUB-BAR */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-[#FFFFFF] border-b border-[#D9DCD8] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-[#B83A3A]/10 border border-[#B83A3A]/30 text-[#B83A3A] font-code text-[11px] font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B83A3A] animate-pulse"></span>
            <span>DETECT · ACTIVE QUEUE</span>
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-[#171A19] tracking-tight">Active Incidents</h1>
            <p className="text-[11px] text-[#5E6561]">
              Primary operational queue · &ldquo;What incidents are happening right now?&rdquo;
            </p>
          </div>
        </div>

        {/* Quick Triage Counters */}
        <div className="flex items-center gap-3 font-code text-[11px]">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-[3px] bg-[#F7F7F5] border border-[#D9DCD8]">
            <span className="text-[#858C87]">TOTAL ACTIVE:</span>
            <span className="font-bold text-[#171A19]">{ACTIVE_INCIDENTS.length}</span>
            <span className="text-[#D9DCD8]">·</span>
            <span className="text-[#B83A3A] font-semibold">1 Critical</span>
            <span className="text-[#D9DCD8]">·</span>
            <span className="text-[#C47F17] font-semibold">1 High</span>
            <span className="text-[#D9DCD8]">·</span>
            <span className="text-[#5E6561]">1 Med</span>
          </div>

          <button
            onClick={() => onNavigate('incident-history')}
            className="px-2.5 py-1 text-[11px] font-code font-medium text-[#5E6561] hover:text-[#171A19] bg-[#FFFFFF] border border-[#D9DCD8] rounded-[3px] hover:bg-[#F1F2F0] transition-colors cursor-pointer"
          >
            Resolved History (247) →
          </button>
        </div>
      </div>

      {/* FILTER & CONTROL STRIP */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#F1F2F0] border-b border-[#D9DCD8] text-[11px] font-code shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[#5E6561]">
            <span className="text-[#858C87]">Severity:</span>
            {(['all', 'critical', 'high', 'medium'] as const).map((sev) => (
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
            {(['all', 'Identified', 'Investigating', 'Unknown'] as const).map((rca) => (
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
          Showing {filteredIncidents.length} of {ACTIVE_INCIDENTS.length} incidents
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE: LEFT INCIDENT QUEUE TABLE + RIGHT INSPECTOR */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* LEFT COLUMN: ACTIVE INCIDENTS QUEUE TABLE */}
        <div className="flex-1 flex flex-col bg-[#FFFFFF] overflow-y-auto border-r border-[#D9DCD8]">
          <table className="w-full border-collapse text-left text-[12px]">
            <thead className="sticky top-0 bg-[#F7F7F5] border-b border-[#D9DCD8] z-10 text-[10px] font-code text-[#70797B] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Incident</th>
                <th className="py-2.5 px-3 font-semibold">Severity</th>
                <th className="py-2.5 px-3 font-semibold">Title</th>
                <th className="py-2.5 px-3 font-semibold">Affected Services</th>
                <th className="py-2.5 px-3 font-semibold">Duration / Started</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Impact</th>
                <th className="py-2.5 px-3 font-semibold">Root Cause Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAECE8]">
              {filteredIncidents.map((incident) => {
                const isSelected = incident.id === selectedIncidentId;
                return (
                  <tr
                    key={incident.id}
                    onClick={() => setSelectedIncidentId(incident.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#F0F5F6] border-l-4 border-l-[#286B78]'
                        : 'hover:bg-[#F9FAF9]'
                    }`}
                  >
                    {/* ID */}
                    <td className="py-3 px-3 font-code font-bold text-[#171A19]">
                      <div className="flex items-center gap-1.5">
                        {incident.severity === 'critical' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B83A3A] animate-ping"></span>
                        )}
                        <span>{incident.id}</span>
                      </div>
                    </td>

                    {/* Severity */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex px-1.5 py-0.5 text-[9.5px] font-code font-bold uppercase rounded-[2px] border ${getSeverityBadge(
                          incident.severity
                        )}`}
                      >
                        {incident.severity}
                      </span>
                    </td>

                    {/* Title */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#171A19]">{incident.title}</div>
                      <div className="text-[11px] text-[#5E6561] truncate max-w-[280px]">
                        {incident.summary}
                      </div>
                    </td>

                    {/* Affected Services */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {incident.affectedServices.map((svc) => (
                          <span
                            key={svc}
                            className="font-code text-[9.5px] px-1.5 py-0.5 rounded-[2px] bg-[#EAECE8] text-[#2F443C]"
                          >
                            {svc}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Duration / Start */}
                    <td className="py-3 px-3 font-code text-[11px]">
                      <div className="font-semibold text-[#171A19]">{incident.duration}</div>
                      <div className="text-[10px] text-[#70797B]">{incident.startTime}</div>
                    </td>

                    {/* Current Status */}
                    <td className="py-3 px-3">
                      <span className="font-code text-[10.5px] text-[#171A19] font-medium px-2 py-0.5 rounded-[2px] bg-[#F1F2F0]">
                        {incident.status}
                      </span>
                    </td>

                    {/* Current Impact */}
                    <td className="py-3 px-3 font-code text-[11px]">
                      <div className="text-[#171A19] font-medium">{incident.impact.usersAffected} users</div>
                      <div className="text-[10px] text-[#B83A3A]">{incident.impact.revenueAtRisk}</div>
                    </td>

                    {/* Root Cause Status */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={`inline-flex w-fit px-1.5 py-0.5 text-[9.5px] font-code font-semibold rounded-[2px] border ${getRcaStatusBadge(
                            incident.rootCauseStatus
                          )}`}
                        >
                          {incident.rootCauseStatus}
                        </span>
                        {incident.rootCauseCandidate && (
                          <span className="font-code text-[10px] text-[#00535f] font-medium truncate max-w-[140px]">
                            {incident.rootCauseCandidate} ({incident.confidence}%)
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredIncidents.length === 0 && (
            <div className="p-8 text-center text-[#70797B] font-code text-[12px]">
              No active incidents matching current filters.
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SELECTED INCIDENT SUMMARY INSPECTOR */}
        <div className="w-[380px] bg-[#FFFFFF] border-l border-[#D9DCD8] flex flex-col shrink-0 overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-[#D9DCD8] bg-[#F7F7F5]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-section text-[10px] text-[#70797B] font-semibold tracking-wider">
                INCIDENT SUMMARY INSPECTOR
              </span>
              <span
                className={`font-code text-[9.5px] font-bold uppercase px-1.5 py-0.5 rounded-[2px] border ${getSeverityBadge(
                  selectedIncident.severity
                )}`}
              >
                {selectedIncident.severity}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-code text-[14px] font-bold text-[#171A19]">
                {selectedIncident.id}
              </span>
              <span className="text-[#70797B]">·</span>
              <h2 className="text-[14px] font-semibold text-[#171A19]">
                {selectedIncident.title}
              </h2>
            </div>
            <div className="mt-1 font-code text-[11px] text-[#5E6561] flex items-center gap-2">
              <span>Started: {selectedIncident.startTime}</span>
              <span>·</span>
              <span className="text-[#B83A3A] font-semibold">{selectedIncident.duration} active</span>
            </div>
          </div>

          {/* Investigation Status Badge Box */}
          <div className="p-3 border-b border-[#D9DCD8] bg-[#FFFFFF]">
            <div className="flex items-center justify-between text-[11px] font-code mb-1">
              <span className="text-[#70797B] uppercase">Investigation State</span>
              <span
                className={`px-1.5 py-0.5 rounded-[2px] font-semibold text-[10px] border ${getRcaStatusBadge(
                  selectedIncident.rootCauseStatus
                )}`}
              >
                {selectedIncident.rootCauseStatus}
              </span>
            </div>
            {selectedIncident.rootCauseCandidate ? (
              <div className="p-2 rounded-[3px] bg-[#F0F5F6] border border-[#99F6E4]/60 text-[11.5px]">
                <div className="font-code text-[10px] text-[#00535f] font-semibold uppercase">
                  Identified Origin Service
                </div>
                <div className="font-code text-[13px] font-bold text-[#171A19] mt-0.5">
                  {selectedIncident.rootCauseCandidate}
                </div>
                <div className="text-[10.5px] text-[#5E6561] mt-0.5">
                  Causal confidence assessed at{' '}
                  <strong className="text-[#00535f]">{selectedIncident.confidence}%</strong> via DAG propagation.
                </div>
              </div>
            ) : (
              <div className="p-2 rounded-[3px] bg-[#F7F7F5] border border-[#D9DCD8] text-[11px] text-[#5E6561]">
                Causal models actively ingesting distributed traces and cross-telemetry streams.
              </div>
            )}
          </div>

          {/* Incident Summary */}
          <div className="p-4 border-b border-[#D9DCD8]">
            <div className="font-section text-[10px] text-[#70797B] font-semibold tracking-wider mb-1.5">
              INCIDENT SYNOPSIS
            </div>
            <p className="text-[12px] text-[#2F443C] leading-relaxed">
              {selectedIncident.summary}
            </p>
          </div>

          {/* Current Impact 4-cell Grid */}
          <div className="p-4 border-b border-[#D9DCD8]">
            <div className="font-section text-[10px] text-[#70797B] font-semibold tracking-wider mb-2">
              CURRENT MEASURED IMPACT
            </div>
            <div className="grid grid-cols-2 gap-2 font-code">
              <div className="p-2 rounded-[3px] bg-[#F7F7F5] border border-[#D9DCD8]">
                <div className="text-[9.5px] text-[#70797B] uppercase">Users Impacted</div>
                <div className="text-[14px] font-bold text-[#171A19] mt-0.5">
                  {selectedIncident.impact.usersAffected}
                </div>
              </div>
              <div className="p-2 rounded-[3px] bg-[#F7F7F5] border border-[#D9DCD8]">
                <div className="text-[9.5px] text-[#70797B] uppercase">Requests Affected</div>
                <div className="text-[14px] font-bold text-[#171A19] mt-0.5">
                  {selectedIncident.impact.requestsAffected}
                </div>
              </div>
              <div className="p-2 rounded-[3px] bg-[#F7F7F5] border border-[#D9DCD8]">
                <div className="text-[9.5px] text-[#70797B] uppercase">Revenue At Risk</div>
                <div className="text-[14px] font-bold text-[#B83A3A] mt-0.5">
                  {selectedIncident.impact.revenueAtRisk}
                </div>
              </div>
              <div className="p-2 rounded-[3px] bg-[#F7F7F5] border border-[#D9DCD8]">
                <div className="text-[9.5px] text-[#70797B] uppercase">SLA Status</div>
                <div className="text-[11px] font-semibold text-[#B83A3A] mt-0.5 truncate">
                  {selectedIncident.impact.slaStatus}
                </div>
              </div>
            </div>
          </div>

          {/* Affected Services List */}
          <div className="p-4 border-b border-[#D9DCD8]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-section text-[10px] text-[#70797B] font-semibold tracking-wider">
                AFFECTED SERVICES ({selectedIncident.affectedServices.length})
              </span>
              <button
                onClick={() => onNavigate('services')}
                className="text-[10px] font-code text-[#286B78] hover:underline"
              >
                View in Fleet →
              </button>
            </div>
            <div className="space-y-1.5">
              {selectedIncident.affectedServices.map((svcId, idx) => (
                <div
                  key={svcId}
                  className="flex items-center justify-between p-2 rounded-[3px] bg-[#F7F7F5] border border-[#E1E5E1] text-[11.5px]"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-code text-[10px] text-[#70797B]">#{idx + 1}</span>
                    <span className="font-code font-semibold text-[#171A19]">{svcId}</span>
                  </div>
                  <span
                    className={`font-code text-[9.5px] font-medium px-1.5 py-0.5 rounded-[2px] ${
                      idx === 0
                        ? 'bg-[#B83A3A]/10 text-[#B83A3A]'
                        : 'bg-[#D9822B]/10 text-[#C47F17]'
                    }`}
                  >
                    {idx === 0 ? 'ORIGIN' : 'CASCADE'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Summary (High-level events only) */}
          <div className="p-4 border-b border-[#D9DCD8] flex-1">
            <div className="font-section text-[10px] text-[#70797B] font-semibold tracking-wider mb-2">
              TIMELINE SUMMARY
            </div>
            <div className="relative pl-4 space-y-2.5">
              <div className="absolute left-1.5 top-1 bottom-1 w-[1.5px] bg-[#D9DCD8]"></div>
              {selectedIncident.timelineSummary.map((item, index) => (
                <div key={index} className="relative text-[11px]">
                  <div className="absolute -left-[14px] top-1 w-2.5 h-2.5 rounded-full bg-white border-2 border-[#286B78]"></div>
                  <div className="font-code text-[10px] font-semibold text-[#70797B]">
                    {item.time}
                  </div>
                  <div className="text-[#2F443C] mt-0.5 leading-snug">{item.event}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Clear Primary CTA Bottom Area */}
          <div className="p-4 bg-[#F7F7F5] border-t border-[#D9DCD8] flex flex-col gap-2 shrink-0">
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
      </div>
    </div>
  );
};
