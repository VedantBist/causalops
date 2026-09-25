# CausalOps Dataset Generation Readiness Check

**Date:** 2026-09-26  
**Status:** READINESS VERIFICATION COMPLETE (Do NOT Execute Full Dataset Yet)  
**System Target:** CausalOps v2 Telemetry Architecture (1-second shared collection timestamp)

---

## 1. Supported Target and Fault Mechanism Matrix

Every microservice target in the CausalOps deployment was inspected to determine whether it can receive a controlled, observable fault and trigger incident analysis.

| Target | Supported Fault Types | Live Injection Hook | Telemetry Propagation Mechanism | Incident Expected? | Recovery Verified? |
|---|---|---|---|---|---|
| **`inventory-db`** | `DB_LATENCY` | `POST /internal/fault` on `inventory-service` (`latencyMs`) | Increases `inventory-db` p99 latency directly (+200–2500ms) and cascades to `inventory-service` ($\times 0.62^1$), `order-service` ($\times 0.62^2$), `api-gateway` ($\times 0.62^3$). | **YES** (4 services degrade; `hot.size() >= 2`) | **YES** (Clears cleanly; status: RESOLVED) |
| **`inventory-service`** | `SERVICE_LATENCY`, `NETWORK_LATENCY`, `SERVICE_FAILURE` | `POST /internal/fault` on `inventory-service` (`latencyMs`, `failure: true`) | Injected latency or 503 exceptions propagate upward to `order-service` and `api-gateway`. | **YES** (3 services degrade; `hot.size() >= 2`) | **YES** (Clears cleanly; status: RESOLVED) |
| **`order-service`** | `SERVICE_LATENCY`, `ERROR_RATE`, `SERVICE_FAILURE` | `POST /internal/fault` on `order-service` (`latencyMs`, `failure: true`) | Injected latency or error rate propagates upward to `api-gateway`. Central hub in call topology. | **YES** (2 services degrade; `hot.size() >= 2`) | **YES** (Clears cleanly; status: RESOLVED) |
| **`payment-service`** | `SERVICE_FAILURE`, `ERROR_RATE`, `NETWORK_LATENCY`, `SERVICE_LATENCY` | `POST /internal/fault` on `payment-service` (`latencyMs`, `failure: true`) | Injected failure/latency cascades upward to `order-service` and `api-gateway`. | **YES** (3 services degrade; `hot.size() >= 2`) | **YES** (Clears cleanly; status: RESOLVED) |
| **`api-gateway`** | `SERVICE_LATENCY` (Partial) | `POST /internal/fault` on `api-gateway` (`latencyMs`) | Increases `api-gateway` latency locally. Downstream services are **unaffected** because gateway is the topmost ingress node. | **NO** (`hot.size() == 1 < 2`; No incident created) | **YES** (Clears cleanly; latency returns to 45ms) |

---

## 2. API Gateway Support Status

### Technical Verification
A dedicated live verification experiment was performed against `api-gateway`:
```bash
curl -s -X POST http://localhost:8080/api/faults \
  -H "Content-Type: application/json" \
  -d '{"type":"SERVICE_LATENCY","target":"api-gateway","severity":"HIGH","durationSeconds":10,"parameters":{"latencyMs":500}}'
```

### Empirical Results:
1. **Live Microservice Controller:** `services/api-gateway/src/main/java/com/causalops/demo/DemoApplication.java` contains `@PostMapping("/internal/fault")`, which successfully accepts `latencyMs` and sleeps inside `delay()`.
2. **Telemetry Signal:** `api-gateway` p99 latency in `telemetry_snapshots` immediately rose from 45ms to 545ms, and its anomaly score rose to 1.0.
3. **No Incident Created:** In `backend/causalops-api/src/main/java/com/causalops/api/service/CausalOpsService.java`:
   ```java
   var hot = services.findAll().stream()
           .filter(s -> s.currentLatency > s.baselineLatency * 2 || s.errorRate > 5)
           .toList();
   if (hot.size() < 2) return;
   ```
   Because `api-gateway` is the root caller and no downstream services depend on it for internal calls, only `api-gateway` became anomalous (`hot.size() == 1`). Because `hot.size() < 2`, the incident detector returned early. **No incident was created, and no RCA attribution was executed.**
4. **Unsupported Fault Types:** `api-gateway`'s `DemoApplication.java` has no `failure` parameter or exception handling, so `SERVICE_FAILURE` and `ERROR_RATE` cannot be physically injected.

### Decision for 80-Experiment Dataset:
Per user instructions:
> *"If api-gateway is unsupported, redistribute those 10 runs across the other supported targets rather than creating fake data."*

`api-gateway` is declared **UNSUPPORTED** for incident/RCA dataset generation. The planned 10 runs are redistributed across the four fully supported targets (`inventory-db`, `inventory-service`, `order-service`, `payment-service`).

---

## 3. Dataset Schema Readiness Review

The existing `ExperimentRecord` schema in `dataset_generator/schema.py` was inspected against all required fields:

| Field Name | Type | In Schema? | Purpose / Description |
|---|---|---|---|
| `experiment_id` | `str` | **YES** | Unique deterministic identifier (e.g. `EXP-001`) |
| `fault_type` | `str` | **YES** | Injected fault name (`NO_FAULT`, `DB_LATENCY`, `SERVICE_LATENCY`, `SERVICE_FAILURE`, `NETWORK_LATENCY`, `ERROR_RATE`) |
| `fault_target` | `Optional[str]` | **YES** | Targeted service name (or `None` for `NO_FAULT`) |
| `fault_parameters` | `Dict[str, Any]` | **YES** | Injection payload (`latencyMs`, `errorRate`, etc.) |
| `ground_truth_root_cause` | `Optional[str]` | **YES** | Injected target service (derived strictly from injection, `None` for `NO_FAULT`) |
| `expected_affected_services` | `List[str]` | **YES** | Expected topological propagation cascade |
| `fault_start_at` | `str` (ISO-8601) | **YES** | UTC timestamp when fault injection began |
| `fault_end_at` | `str` (ISO-8601) | **YES** | UTC timestamp when fault was cleared |
| `telemetry_start` | `str` (ISO-8601) | **YES** | Beginning of observation window |
| `telemetry_end` | `str` (ISO-8601) | **YES** | End of observation window |
| `incident_id` | `Optional[str]` | **YES** | Detected incident UUID |
| `detected_root_cause` | `Optional[str]` | **YES** | Identified root cause from RCA |
| `detected_confidence` | `Optional[float]` | **YES** | RCA attribution confidence score |
| `system_version` | `str` | **YES** | Release identifier (`v2-telemetry-upgrade`) |
| `git_commit` | `Optional[str]` | **YES** | Git commit hash for provenance |

**Conclusion:** The schema is fully expressive, handles `NO_FAULT` and all 5 fault types, enforces strict timestamp validation, and requires **no redesign**.

---

## 4. Proposed 80-Experiment Matrix

The proposed 80-experiment matrix is serialized in [`dataset/manifests/full_dataset_plan.json`](file:///Users/vedant/causalops/dataset/manifests/full_dataset_plan.json).

### Target Distribution:
- **`CONTROL` (`NO_FAULT` on `none`):** 10 runs
- **`inventory-db`:** 18 runs
- **`inventory-service`:** 17 runs
- **`order-service`:** 17 runs
- **`payment-service`:** 18 runs
- **Total:** **80 experiments**

### Fault Type Distribution:
- `NO_FAULT`: 10 runs
- `DB_LATENCY`: 18 runs
- `SERVICE_LATENCY`: 17 runs
- `NETWORK_LATENCY`: 13 runs
- `ERROR_RATE`: 13 runs
- `SERVICE_FAILURE`: 9 runs
- **Total:** **80 experiments**

---

## 5. Parameter Diversity

The plan covers the requested continuous parameter spectra using only values the live services and telemetry collector can physically handle:

### Latency Values (ms):
`200`, `400`, `500`, `600`, `800`, `850`, `950`, `1000`, `1200`, `1500`, `1800`, `2200`, `2500`

### Error Rates (%):
`10%`, `20%`, `30%`, `40%`, `50%`, `60%`, `80%`

### Service Failures:
Binary HTTP 503 injection via `failure: true`.

---

## 6. Traffic Plan & Rate-Limiting Analysis

### Proposed Request Rates:
- **1 req/s:** 55 experiments
- **5 req/s:** 16 experiments
- **15 req/s:** 9 experiments

### Technical Evaluation of Current Traffic Generator:
- The current `TrafficGenerator` in `dataset_generator/runner.py` uses a single background thread with a synchronous `urllib.request.urlopen` call followed by `stop_event.wait(timeout=interval)`.
- **Limitation at Higher Rates:** When a fault injects `1500ms` of latency, a single thread waiting synchronously on HTTP requests can achieve at most $\frac{1}{1.5\text{s}} \approx 0.67\text{ req/s}$. It **cannot** sustain 5 req/s or 15 req/s because the thread is blocked waiting for the prior request to return.
- **What Needs to Be Added (Before executing rate-varied runs):**
  1. A thread pool worker (`concurrent.futures.ThreadPoolExecutor(max_workers=20)`) or asynchronous client (`aiohttp` / `httpx`).
  2. A rate-limiting token bucket or ticker that fires request dispatches at fixed intervals ($1/R$ seconds) independently of response arrival times.

---

## 7. Replication Plan

To prevent accidental data leakage while enabling statistical variance estimation, 14 explicit replicates are included in the 80-experiment matrix:
- **Control Replicates (6 runs):**
  - `EXP-002`, `EXP-003`, `EXP-004` (1 req/s controls, replicates 2, 3, 4)
  - `EXP-006`, `EXP-007` (5 req/s controls, replicates 2, 3)
  - `EXP-009`, `EXP-010` (15 req/s controls, replicates 2, 3)
- **`inventory-db` Replicates (4 runs):**
  - `EXP-025` (1000ms latency, replicate 2)
  - `EXP-026` (1500ms latency, replicate 2)
  - `EXP-027` (1800ms latency, replicate 2)
  - `EXP-028` (2500ms latency, replicate 2)
- **`inventory-service` Replicate (1 run):**
  - `EXP-036` (800ms network latency, replicate 2)
- **`order-service` Replicate (1 run):**
  - `EXP-054` (850ms service latency, replicate 2)
- **`payment-service` Replicates (2 runs):**
  - `EXP-066` (SERVICE_FAILURE, replicate 2)
  - `EXP-073` (ERROR_RATE 50%, replicate 2)

All replicates are explicitly tracked with `replicate_number > 1` in the manifest and `ExperimentRecord`.

---

## 8. Expected Dataset Size & Storage Footprint

- **Experiments:** 80
- **Snapshots per experiment:** ~35–45 per service $\times$ 5 services = ~175–225 snapshot rows per experiment
- **Total telemetry rows:** ~16,000–18,000 rows in PostgreSQL `telemetry_snapshots`
- **Disk Footprint:**
  - 80 directories under `dataset/experiments/EXP-XXX/`
  - 5 JSON files per experiment (`manifest.json`, `metrics.json`, `incidents.json`, `topology.json`, `rca.json`) = 400 JSON files
  - Central `experiments.jsonl`: ~80 lines, ~150 KB
  - Estimated total uncompressed artifact size: **~18–25 MB**

---

## 9. Missing Instrumentation & Pre-Requisites Summary

Before executing the full 80-experiment generation, the following enhancements should be addressed:
1. **Concurrent Traffic Generator:** Upgrade `TrafficGenerator` from single-threaded synchronous dispatch to a thread pool with token bucket scheduling so that 5 req/s and 15 req/s can be maintained during high-latency faults.
2. **API Gateway Ingress Modeling (Future Work):** If `api-gateway` must be included as an injectable root cause in future phases, the incident detector threshold (`hot.size() < 2`) would need an edge case for single-node ingress failures, or an external synthetically monitored synthetic gateway health check.
3. **Database Connection Pool Saturation (Future Work):** Remains unsupported until microservices expose connection pool metrics and exhaustion hooks.

---

## 10. Execution Command for Full Plan

When ready to execute the complete 80-experiment generation suite, the command will be:

```bash
python3 -m dataset_generator.cli run-plan \
  --plan dataset/manifests/full_dataset_plan.json \
  --dataset-dir dataset
```

*(Note: Per Task 11 instructions, this plan has NOT been executed yet. The system is in readiness verification mode only.)*
