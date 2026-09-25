# CausalOps 80-Experiment Dataset Audit Report

**Audit Timestamp**: 2026-09-25T20:14:20.363803+00:00
**Verdict**: **PASS**

---

## 1. Executive Summary & Completion

- **Planned Experiments**: 80
- **Successfully Completed**: 80 (100.0%)
- **Failed Experiments**: 0
- **Unsupported Experiments**: 0
- **Missing Experiments**: 0

---

## 2. Experiment Distribution vs Approved Plan

### By Fault Type
| Fault Type | Planned | Actual Completed | Match |
| :--- | :--- | :--- | :--- |
| `DB_LATENCY` | 18 | 18 | ✓ |
| `ERROR_RATE` | 13 | 13 | ✓ |
| `NETWORK_LATENCY` | 13 | 13 | ✓ |
| `NO_FAULT` | 10 | 10 | ✓ |
| `SERVICE_FAILURE` | 9 | 9 | ✓ |
| `SERVICE_LATENCY` | 17 | 17 | ✓ |

### By Target Service
| Target Service | Planned | Actual Completed | Match |
| :--- | :--- | :--- | :--- |
| `inventory-db` | 18 | 18 | ✓ |
| `inventory-service` | 17 | 17 | ✓ |
| `none` | 10 | 10 | ✓ |
| `order-service` | 17 | 17 | ✓ |
| `payment-service` | 18 | 18 | ✓ |

---

## 3. Control Run Quality (NO_FAULT Experiments)

- **Total Controls Executed**: 10
- **False Positive Incidents**: 0
- **False Positive Incident Rate**: 0.00%
- **Anomalous Controls**: 0
- **False Positive Anomaly Rate**: 0.00%

---

## 4. Ground Truth Integrity

- **Valid Ground Truth Records**: 80/80
- **Ground Truth Errors**: 0

---

## 5. Telemetry Quality & Batch Timestamp Consistency

### Telemetry Sample Statistics per Experiment
- **Count**: 80
- **Mean**: 196.81
- **Median**: 195.0
- **Min / Max**: 190 / 200
- **P95**: 200.0
- **Std Dev**: 2.88

### Batch Timestamp Spread
- **Zero-Spread Collection Batches**: 0.00 ms (Mean: 0.00 ms)
- **Missing Service Batches**: 0

---

## 6. Rate-Controlled Traffic Quality

| Configured Rate | Experiments | Obs Start Rate (Mean ± Std) | Start Rate Error | Max Concurrency (Mean / Max) | Avg Latency (Mean) | P95 Latency (Mean) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **15 req/s** | 9 | 15.01 ± 0.0 rps | 0.07% | 6.67 / 19 | 263.98 ms | 395.17 ms |
| **1 req/s** | 55 | 1.02 ± 0.0 rps | 2.0% | 1.49 / 3 | 629.76 ms | 965.06 ms |
| **5 req/s** | 16 | 5.02 ± 0.0 rps | 0.4% | 3.56 / 7 | 356.82 ms | 534.56 ms |

---

## 7. Fault Parameter Coverage

| Fault Type | Unique Parameter Levels | Parameter Values Swept | Count |
| :--- | :--- | :--- | :--- |
| `DB_LATENCY` | 10 | [200, 400, 600, 800, 1000, 1200, 1500, 1800, 2200, 2500] | 18 |
| `ERROR_RATE` | 7 | [10, 20, 30, 40, 50, 60, 80] | 13 |
| `NETWORK_LATENCY` | 8 | [200, 400, 600, 800, 950, 1000, 1500, 2200] | 13 |
| `SERVICE_FAILURE` | 1 | [1] | 9 |
| `SERVICE_LATENCY` | 11 | [200, 400, 500, 600, 800, 850, 1000, 1200, 1500, 1800, 2500] | 17 |

---

## 8. Current Heuristic RCA Baseline Performance

- **Overall Heuristic RCA Accuracy**: **84.29%** (59/70)
- **Mismatches**: 4
- **No RCA Produced**: 7

### Accuracy by Fault Type
| Fault Type | Injected Experiments | Correct RCA | Accuracy |
| :--- | :--- | :--- | :--- |
| `DB_LATENCY` | 18 | 18 | **100.0%** |
| `ERROR_RATE` | 13 | 12 | **92.3%** |
| `NETWORK_LATENCY` | 13 | 9 | **69.2%** |
| `SERVICE_FAILURE` | 9 | 5 | **55.6%** |
| `SERVICE_LATENCY` | 17 | 15 | **88.2%** |

### Accuracy by Target Service
| Target Service | Injected Experiments | Correct RCA | Accuracy |
| :--- | :--- | :--- | :--- |
| `inventory-db` | 18 | 18 | **100.0%** |
| `inventory-service` | 17 | 17 | **100.0%** |
| `order-service` | 17 | 17 | **100.0%** |
| `payment-service` | 18 | 7 | **38.9%** |

### Accuracy by Traffic Rate
| Traffic Rate | Injected Experiments | Correct RCA | Accuracy |
| :--- | :--- | :--- | :--- |
| `15_rps` | 6 | 5 | **83.3%** |
| `1_rps` | 51 | 43 | **84.3%** |
| `5_rps` | 13 | 11 | **84.6%** |

### Root Cause Confusion Matrix (Predicted vs Ground Truth)

| Ground Truth \ Predicted | NO_DETECTION | inventory-db | inventory-service | order-service | payment-service |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **inventory-db** | 0 | 18 | 0 | 0 | 0 |
| **inventory-service** | 0 | 0 | 17 | 0 | 0 |
| **order-service** | 0 | 0 | 0 | 17 | 0 |
| **payment-service** | 7 | 0 | 0 | 4 | 7 |

---

## 9. RCA Mismatch Diagnostic Breakdown

### Classification of Failure Modes
| Failure Mechanism | Mismatch Count | Description |
| :--- | :--- | :--- |
| `competing service anomaly` | 4 | Primary diagnostic factor |

### Detailed Mismatch Evidence Table
| Experiment ID | Fault Type | Ground Truth | Detected | Conf | Traffic | Category | Explanation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `EXP-063` | `SERVICE_FAILURE` | `payment-service` | `order-service` | 0.71 | 1 rps | `competing service anomaly` | Concurrent order workflow activity eclipsed payment anomaly signal. |
| `EXP-064` | `SERVICE_FAILURE` | `payment-service` | `order-service` | 0.71 | 5 rps | `competing service anomaly` | Concurrent order workflow activity eclipsed payment anomaly signal. |
| `EXP-065` | `SERVICE_FAILURE` | `payment-service` | `order-service` | 0.71 | 15 rps | `competing service anomaly` | Concurrent order workflow activity eclipsed payment anomaly signal. |
| `EXP-078` | `NETWORK_LATENCY` | `payment-service` | `order-service` | 0.91 | 1 rps | `competing service anomaly` | Concurrent order workflow activity eclipsed payment anomaly signal. |

---

## 10. Dataset Leakage & ML Split Readiness

- **Experiment-Level Separation**: True (Zero data leakage)
- **Recommended Split Strategy**: Stratified 70/15/15 by fault_type and target
- **Train Partition**: 56 experiments (~70%)
- **Validation Partition**: 12 experiments (~15%)
- **Test Partition**: 12 experiments (~15%)
- **Integrity Guarantee**: Time samples from the same experiment run are never split across train and test.

---

## 11. Final Dataset Verdict & Readiness

### Status: **PASS**

1. **Quality**: The dataset faithfully represents ground truth with 1-second synchronous telemetry and deterministic rate control.
2. **Baseline Value**: The heuristic RCA baseline establishes an exact benchmark against which advanced graph/causal models can be measured.
3. **Next Steps**: Machine Learning and causal discovery methods can now be developed using clean, uncorrupted, multi-rate telemetry data.
