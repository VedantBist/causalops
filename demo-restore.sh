#!/usr/bin/env bash
# ==============================================================================
# CausalOps Demo: Restore Healthy Baseline State
# ==============================================================================
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

echo ""
echo "============================================================"
echo " [*] RESTORING HEALTHY BASELINE: auth-gateway"
echo "============================================================"

# 1. Update frontend reactive demo state
cat <<EOF > "$DIR/public/demo-state.json"
{
  "activeFault": null,
  "incidentId": null,
  "status": "HEALTHY",
  "target": null,
  "latencyMs": 42,
  "errorRate": 0.01,
  "injectedAt": null
}
EOF

# If dist directory exists, sync to dist as well
if [ -d "$DIR/dist" ]; then
  cp "$DIR/public/demo-state.json" "$DIR/dist/demo-state.json"
fi

# 2. Notify backend API if running
if curl -s -f -m 1 "http://localhost:8080/actuator/health" > /dev/null 2>&1; then
  curl -s -X POST "http://localhost:8080/api/faults/clear" > /dev/null 2>&1 || true
  echo " [+] Synced with backend API (http://localhost:8080/api/faults/clear)"
else
  echo " [*] Backend not listening on 8080 (standalone UI mode active)"
fi

echo ""
echo " -> Target Service   : auth-gateway (Auth & Security Gateway)"
echo " -> Status           : HEALTHY (Operational)"
echo " -> Latency          : 42ms (Nominal P99)"
echo " -> Error Rate       : 0.01%"
echo " -> Active Incidents : 1 (INC-8941 Baseline - inventory-db)"
echo ""
echo " [SUCCESS] Dashboard restored to healthy baseline!"
echo " Open http://localhost:3000 to view."
echo "============================================================"
echo ""
