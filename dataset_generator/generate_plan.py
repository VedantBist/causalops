#!/usr/bin/env python3
"""
Generates the planned 80-experiment matrix for CausalOps Dataset Generation Phase 3.
Ensures zero unintended duplicates, balanced parameter sweeps, and records:
- experiment_id
- experiment_class
- fault_type
- target
- parameters
- traffic_rate
- duration
- replicate_number
Outputs to dataset/manifests/full_dataset_plan.json.
"""

import json
from collections import Counter
from pathlib import Path
from typing import Any, Dict, List


def build_plan() -> List[Dict[str, Any]]:
    plan: List[Dict[str, Any]] = []
    exp_idx = 1

    def add_exp(
        exp_class: str,
        fault_type: str,
        target: str,
        params: Dict[str, Any],
        traffic: str,
        duration: int = 26,
        replicate: int = 1,
    ):
        nonlocal exp_idx
        plan.append({
            "experiment_id": f"EXP-{exp_idx:03d}",
            "experiment_class": exp_class,
            "fault_type": fault_type,
            "target": target,
            "parameters": params,
            "traffic_rate": traffic,
            "duration": duration,
            "replicate_number": replicate,
        })
        exp_idx += 1

    # ─── 1. Control Experiments (10 experiments) ──────────────────────────────
    # 4 at 1 req/s, 3 at 5 req/s, 3 at 15 req/s (with explicit replicate numbering)
    for rep in range(1, 5):
        add_exp("CONTROL", "NO_FAULT", "none", {}, "1 req/s", duration=25, replicate=rep)
    for rep in range(1, 4):
        add_exp("CONTROL", "NO_FAULT", "none", {}, "5 req/s", duration=25, replicate=rep)
    for rep in range(1, 4):
        add_exp("CONTROL", "NO_FAULT", "none", {}, "15 req/s", duration=25, replicate=rep)

    # ─── 2. inventory-db (18 experiments) ─────────────────────────────────────
    # Latency levels: 200, 400, 600, 800, 1000, 1200, 1500, 1800, 2200, 2500 ms
    # Primary sweep at 1 req/s (10 levels)
    db_latencies = [200, 400, 600, 800, 1000, 1200, 1500, 1800, 2200, 2500]
    for lat in db_latencies:
        add_exp("FAULT", "DB_LATENCY", "inventory-db", {"latencyMs": lat}, "1 req/s", replicate=1)

    # Traffic variation at key latency points (4 runs)
    add_exp("FAULT", "DB_LATENCY", "inventory-db", {"latencyMs": 600}, "5 req/s", replicate=1)
    add_exp("FAULT", "DB_LATENCY", "inventory-db", {"latencyMs": 1200}, "5 req/s", replicate=1)
    add_exp("FAULT", "DB_LATENCY", "inventory-db", {"latencyMs": 600}, "15 req/s", replicate=1)
    add_exp("FAULT", "DB_LATENCY", "inventory-db", {"latencyMs": 1200}, "15 req/s", replicate=1)

    # Intentional replicates at critical decision boundaries (4 runs)
    add_exp("FAULT", "DB_LATENCY", "inventory-db", {"latencyMs": 1000}, "1 req/s", replicate=2)
    add_exp("FAULT", "DB_LATENCY", "inventory-db", {"latencyMs": 1500}, "1 req/s", replicate=2)
    add_exp("FAULT", "DB_LATENCY", "inventory-db", {"latencyMs": 1800}, "1 req/s", replicate=2)
    add_exp("FAULT", "DB_LATENCY", "inventory-db", {"latencyMs": 2500}, "1 req/s", replicate=2)

    # ─── 3. inventory-service (17 experiments) ────────────────────────────────
    # NETWORK_LATENCY (8 runs: 7 distinct levels + 1 replicate)
    net_lats = [200, 400, 600, 800, 1000, 1500, 2200]
    for lat in net_lats:
        rate = "5 req/s" if lat in (600, 1000) else "1 req/s"
        add_exp("FAULT", "NETWORK_LATENCY", "inventory-service", {"latencyMs": lat}, rate, replicate=1)
    add_exp("FAULT", "NETWORK_LATENCY", "inventory-service", {"latencyMs": 800}, "1 req/s", replicate=2)

    # SERVICE_LATENCY (6 runs: 6 distinct levels)
    srv_lats = [200, 500, 800, 1200, 1800, 2500]
    for lat in srv_lats:
        rate = "15 req/s" if lat == 800 else "1 req/s"
        add_exp("FAULT", "SERVICE_LATENCY", "inventory-service", {"latencyMs": lat}, rate, replicate=1)

    # SERVICE_FAILURE (3 runs across traffic rates)
    add_exp("FAULT", "SERVICE_FAILURE", "inventory-service", {}, "1 req/s", replicate=1)
    add_exp("FAULT", "SERVICE_FAILURE", "inventory-service", {}, "5 req/s", replicate=1)
    add_exp("FAULT", "SERVICE_FAILURE", "inventory-service", {}, "15 req/s", replicate=1)

    # ─── 4. order-service (17 experiments) ────────────────────────────────────
    # SERVICE_LATENCY (9 runs: 8 distinct levels + 1 replicate)
    order_lats = [200, 400, 600, 850, 1000, 1200, 1500, 1800]
    for lat in order_lats:
        rate = "5 req/s" if lat in (400, 850) else "1 req/s"
        add_exp("FAULT", "SERVICE_LATENCY", "order-service", {"latencyMs": lat}, rate, replicate=1)
    add_exp("FAULT", "SERVICE_LATENCY", "order-service", {"latencyMs": 850}, "1 req/s", replicate=2)

    # ERROR_RATE (6 runs: 10%, 20%, 30%, 40%, 60%, 80%)
    for err in [10, 20, 30, 40, 60, 80]:
        rate = "5 req/s" if err == 30 else "1 req/s"
        add_exp("FAULT", "ERROR_RATE", "order-service", {"errorRate": err}, rate, replicate=1)

    # SERVICE_FAILURE (2 runs)
    add_exp("FAULT", "SERVICE_FAILURE", "order-service", {}, "1 req/s", replicate=1)
    add_exp("FAULT", "SERVICE_FAILURE", "order-service", {}, "5 req/s", replicate=1)

    # ─── 5. payment-service (18 experiments) ──────────────────────────────────
    # SERVICE_FAILURE (4 runs: 3 rates + 1 replicate)
    add_exp("FAULT", "SERVICE_FAILURE", "payment-service", {}, "1 req/s", replicate=1)
    add_exp("FAULT", "SERVICE_FAILURE", "payment-service", {}, "5 req/s", replicate=1)
    add_exp("FAULT", "SERVICE_FAILURE", "payment-service", {}, "15 req/s", replicate=1)
    add_exp("FAULT", "SERVICE_FAILURE", "payment-service", {}, "1 req/s", replicate=2)

    # ERROR_RATE (7 runs: 10%, 20%, 30%, 40%, 50%, 60%, 80%)
    for err in [10, 20, 30, 40, 50, 60, 80]:
        rate = "5 req/s" if err in (20, 50) else ("15 req/s" if err == 30 else "1 req/s")
        add_exp("FAULT", "ERROR_RATE", "payment-service", {"errorRate": err}, rate, replicate=1)

    # NETWORK_LATENCY (5 runs: 400, 800, 950, 1500, 2200 ms)
    for lat in [400, 800, 950, 1500, 2200]:
        add_exp("FAULT", "NETWORK_LATENCY", "payment-service", {"latencyMs": lat}, "1 req/s", replicate=1)

    # SERVICE_LATENCY (2 runs: 500, 1200 ms)
    add_exp("FAULT", "SERVICE_LATENCY", "payment-service", {"latencyMs": 500}, "1 req/s", replicate=1)
    add_exp("FAULT", "SERVICE_LATENCY", "payment-service", {"latencyMs": 1200}, "5 req/s", replicate=1)

    return plan


def verify_plan(plan: List[Dict[str, Any]]) -> Dict[str, Any]:
    total = len(plan)
    assert total == 80, f"Expected 80 experiments, got {total}"

    # Verify ID uniqueness
    ids = [e["experiment_id"] for e in plan]
    assert len(set(ids)) == total, "Duplicate experiment IDs detected"

    # Verify no accidental duplicates
    signature_counter = Counter(
        (e["fault_type"], e["target"], json.dumps(e["parameters"], sort_keys=True), e["traffic_rate"], e["replicate_number"])
        for e in plan
    )
    duplicates = [sig for sig, count in signature_counter.items() if count > 1]
    assert len(duplicates) == 0, f"Duplicate experiment configurations detected: {duplicates}"

    by_class = Counter(e["experiment_class"] for e in plan)
    by_type = Counter(e["fault_type"] for e in plan)
    by_target = Counter(e["target"] for e in plan)
    by_traffic = Counter(e["traffic_rate"] for e in plan)
    replicates_count = sum(1 for e in plan if e["replicate_number"] > 1)

    return {
        "total_experiments": total,
        "by_class": dict(by_class),
        "by_fault_type": dict(by_type),
        "by_target": dict(by_target),
        "by_traffic_rate": dict(by_traffic),
        "replicate_runs": replicates_count,
        "primary_runs": total - replicates_count,
    }


def main():
    plan = build_plan()
    stats = verify_plan(plan)

    out_path = Path("dataset/manifests/full_dataset_plan.json")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump({"version": "v3-full-dataset-plan", "planned_experiments": plan}, f, indent=2)

    print(f"✓ Generated {len(plan)} experiments in {out_path}")
    print("\nStatistical Balance Summary:")
    print("Class Distribution:", stats["by_class"])
    print("Target Distribution:", stats["by_target"])
    print("Fault Type Distribution:", stats["by_fault_type"])
    print("Traffic Rate Distribution:", stats["by_traffic_rate"])
    print(f"Replicates: {stats['replicate_runs']} replicate runs, {stats['primary_runs']} primary runs.")


if __name__ == "__main__":
    main()
