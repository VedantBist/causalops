const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';
async function request<T>(path: string, init?: RequestInit): Promise<T> { const response = await fetch(base + path, { headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) }, ...init }); if (!response.ok) throw new Error('CausalOps API ' + response.status); return response.status === 204 ? undefined as T : response.json() as Promise<T>; }
export const causalOpsApi = {
  overview: () => request('/overview'), topology: () => request('/topology'), services: () => request('/services'), incidents: () => request('/incidents/active'), predictions: () => request('/predictions'), logs: () => request('/logs'), traces: () => request('/traces'),
  injectFault: (fault: { type: string; target: string; severity: string; durationSeconds: number; parameters: Record<string, unknown> }) => request('/faults', { method: 'POST', body: JSON.stringify(fault) }),
  clearFaults: () => request<void>('/faults/clear', { method: 'POST' }), simulate: (input: { target: string; reductionPercent: number }) => request('/simulations', { method: 'POST', body: JSON.stringify(input) }),
  events: (onEvent: (event: unknown) => void) => { const stream = new EventSource(base + '/events/stream'); stream.onmessage = event => onEvent(JSON.parse(event.data)); return () => stream.close(); },
};
