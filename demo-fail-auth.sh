#!/usr/bin/env bash
# ==============================================================================
# CausalOps Demo: Inject Critical Failure into auth-gateway
# ==============================================================================
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
TIMESTAMP=$(date +%s000)

echo ""
echo "============================================================"
echo " [!] INJECTING CRITICAL FAULT: auth-gateway"
echo "============================================================"

# 1. Update frontend reactive demo state
cat <<EOF > "$DIR/public/demo-state.json"
{
  "activeFault": "auth-gateway",
  "incidentId": "INC-8945",
  "status": "CRITICAL",
  "target": "auth-gateway",
  "latencyMs": 1450,
  "errorRate": 18.5,
  "injectedAt": $TIMESTAMP
}
EOF

# If dist directory exists, sync to dist as well
if [ -d "$DIR/dist" ]; then
  cp "$DIR/public/demo-state.json" "$DIR/dist/demo-state.json"
fi

# 2. Notify backend API if running
if curl -s -f -m 1 "http://localhost:8080/actuator/health" > /dev/null 2>&1; then
  curl -s -X POST "http://localhost:8080/api/faults" \
    -H "Content-Type: application/json" \
    -d '{"type":"SERVICE_LATENCY","target":"auth-gateway","severity":"CRITICAL","durationSeconds":600,"parameters":{"latencyMs":1450,"errorRate":18.5}}' \
    > /dev/null 2>&1 || true
  echo " [+] Synced with backend API (http://localhost:8080/api/faults)"
else
  echo " [*] Backend not listening on 8080 (standalone UI mode active)"
fi

echo ""
echo " -> Target Service   : auth-gateway (Auth & Security Gateway)"
echo " -> Fault Type       : JWKS Cache Invalidation / Token Validation Bottleneck"
echo " -> Latency          : 1,450ms (from 42ms nominal)"
echo " -> Error Rate       : 18.5% 504 / 500 Spike"
echo " -> Incident Created : INC-8945 (Severity: CRITICAL P1)"
echo " -> Propagation Path : auth-gateway -> api-gateway -> order-service"
echo ""
echo " [SUCCESS] Dashboard updated! Open http://localhost:3000 to view."
echo " To restore healthy baseline, run: ./demo-restore.sh (or npm run demo:restore)"
echo "============================================================"
echo ""
