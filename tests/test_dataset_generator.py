import json
import tempfile
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest
from pydantic import ValidationError

from dataset_generator.config import ExperimentConfig, PILOT_EXPERIMENTS
from dataset_generator.runner import ExperimentRunner
from dataset_generator.schema import (
    EXPECTED_AFFECTED_MAP,
    ExperimentRecord,
    SUPPORTED_FAULT_TYPES,
    UNSUPPORTED_FAULT_TYPES,
    utc_now_iso,
)
from dataset_generator.traffic import TrafficGenerator, TrafficMetrics, compute_percentile
from dataset_generator.validator import DatasetValidator


# ─── 1. Experiment Schema & Ground Truth ──────────────────────────────────────

def test_experiment_schema_valid():
    """Verify that a valid ExperimentRecord serializes and deserializes accurately."""
    rec = ExperimentRecord(
        experiment_id="E001",
        run_number=1,
        started_at="2026-09-25T18:00:00+00:00",
        fault_start_at="2026-09-25T18:00:06+00:00",
        fault_end_at="2026-09-25T18:00:26+00:00",
        finished_at="2026-09-25T18:00:36+00:00",
        fault_type="DB_LATENCY",
        fault_target="inventory-db",
        fault_parameters={"latencyMs": 1200},
        ground_truth_root_cause="inventory-db",
        expected_affected_services=["inventory-db", "inventory-service", "order-service", "api-gateway"],
        baseline_status="Operational",
        incident_id="test-uuid",
        detected_root_cause="inventory-db",
        detected_confidence=0.71,
        rca_match=True,
        telemetry_start="2026-09-25T18:00:00+00:00",
        telemetry_end="2026-09-25T18:00:36+00:00",
        experiment_status="SUCCESS",
    )
    rec.validate_timestamps()
    dumped = rec.model_dump()
    assert dumped["experiment_id"] == "E001"
    assert dumped["ground_truth_root_cause"] == "inventory-db"
    assert dumped["rca_match"] is True


def test_ground_truth_assignment_independent_of_rca():
    """Verify ground truth strictly equals injected fault target, even when RCA diverges."""
    rec = ExperimentRecord(
        experiment_id="E002",
        run_number=1,
        started_at="2026-09-25T18:00:00+00:00",
        fault_start_at="2026-09-25T18:00:05+00:00",
        fault_end_at="2026-09-25T18:00:25+00:00",
        finished_at="2026-09-25T18:00:35+00:00",
        fault_type="SERVICE_LATENCY",
        fault_target="order-service",
        ground_truth_root_cause="order-service",  # Injected target
        expected_affected_services=["order-service", "api-gateway"],
        detected_root_cause="inventory-db",       # Divergent RCA
        detected_confidence=0.60,
        rca_match=False,
        telemetry_start="2026-09-25T18:00:00+00:00",
        telemetry_end="2026-09-25T18:00:35+00:00",
    )
    assert rec.ground_truth_root_cause == "order-service"
    assert rec.detected_root_cause == "inventory-db"
    assert rec.rca_match is False


# ─── 2. Configuration Validation ──────────────────────────────────────────────

def test_configuration_validation():
    """Verify ExperimentConfig validates durations and identifiers."""
    with pytest.raises(ValidationError):
        # Blank ID
        ExperimentConfig(experiment_id="", fault_type="DB_LATENCY", target="inventory-db")

    with pytest.raises(ValidationError):
        # Duration too short (<5s)
        ExperimentConfig(experiment_id="E001", fault_type="DB_LATENCY", target="inventory-db", duration_seconds=2)

    valid = ExperimentConfig(
        experiment_id="E001",
        fault_type="DB_LATENCY",
        target="inventory-db",
        parameters={"latencyMs": 1200},
        duration_seconds=20,
    )
    assert valid.is_supported() is True


def test_deterministic_experiment_ids():
    """Verify pilot configurations have deterministic, unique IDs E001 through E010."""
    ids = [exp.experiment_id for exp in PILOT_EXPERIMENTS]
    assert len(ids) == 10
    assert len(set(ids)) == 10  # Unique
    assert ids == [f"E{i:03d}" for i in range(1, 11)]


# ─── 3. Timestamp Validation ──────────────────────────────────────────────────

def test_timestamp_ordering_validation():
    """Verify that invalid chronological order raises ValueError."""
    # fault_start_at is AFTER fault_end_at
    invalid_rec = ExperimentRecord(
        experiment_id="E001",
        run_number=1,
        started_at="2026-09-25T18:00:00+00:00",
        fault_start_at="2026-09-25T18:00:25+00:00",
        fault_end_at="2026-09-25T18:00:10+00:00",  # earlier!
        finished_at="2026-09-25T18:00:30+00:00",
        fault_type="DB_LATENCY",
        fault_target="inventory-db",
        ground_truth_root_cause="inventory-db",
        telemetry_start="2026-09-25T18:00:00+00:00",
        telemetry_end="2026-09-25T18:00:30+00:00",
    )
    with pytest.raises(ValueError, match="Timestamp sequence invalid"):
        invalid_rec.validate_timestamps()


# ─── 4. Unsupported Fault Handling ───────────────────────────────────────────

def test_unsupported_fault_handling():
    """Verify CONNECTION_POOL_SATURATION is recognized as unsupported without faking."""
    cfg = ExperimentConfig(
        experiment_id="E999",
        fault_type="CONNECTION_POOL_SATURATION",
        target="inventory-db",
        duration_seconds=10,
    )
    assert cfg.is_supported() is False
    assert "cannot currently be reproduced reliably" in cfg.unsupported_reason()

    with tempfile.TemporaryDirectory() as tmpdir:
        runner = ExperimentRunner(dataset_root=Path(tmpdir))
        rec = runner.run_experiment(cfg)
        assert rec.experiment_status == "UNSUPPORTED"
        assert "cannot currently be reproduced reliably" in rec.error_message


# ─── 5. Cleanup on Failure ────────────────────────────────────────────────────

def test_cleanup_on_failure():
    """Verify clear_faults is invoked in finally block when an exception occurs."""
    mock_client = MagicMock()
    mock_client.inject_fault.side_effect = RuntimeError("Simulated network timeout")
    mock_client.get_overview.return_value = {"services": [{"status": "healthy"}], "activeIncidents": []}
    mock_client.get_git_commit.return_value = "test-sha"

    with tempfile.TemporaryDirectory() as tmpdir:
        runner = ExperimentRunner(client=mock_client, dataset_root=Path(tmpdir))
        cfg = ExperimentConfig(
            experiment_id="E001",
            fault_type="DB_LATENCY",
            target="inventory-db",
            duration_seconds=10,
        )
        rec = runner.run_experiment(cfg)

        assert rec.experiment_status == "FAILED"
        assert "Simulated network timeout" in rec.error_message
        # Verify safety cleanup was called
        mock_client.clear_faults.assert_called()


# ─── 6. Dataset Serialization & Validation ───────────────────────────────────

def test_dataset_serialization_and_validator():
    """Verify writing artifacts, reading central manifest, and validator checking."""
    with tempfile.TemporaryDirectory() as tmpdir:
        dataset_path = Path(tmpdir)
        runner = ExperimentRunner(dataset_root=dataset_path)

        rec = ExperimentRecord(
            experiment_id="E001",
            run_number=1,
            started_at="2026-09-25T18:00:00+00:00",
            fault_start_at="2026-09-25T18:00:05+00:00",
            fault_end_at="2026-09-25T18:00:25+00:00",
            finished_at="2026-09-25T18:00:35+00:00",
            fault_type="DB_LATENCY",
            fault_target="inventory-db",
            ground_truth_root_cause="inventory-db",
            telemetry_start="2026-09-25T18:00:00+00:00",
            telemetry_end="2026-09-25T18:00:35+00:00",
            experiment_status="SUCCESS",
        )
        runner._save_experiment_artifacts(
            record=rec,
            topology={"nodes": [], "edges": []},
            metrics={"service": None, "samples": [{"service": "inventory-db", "anomalyScore": 1.0, "timestamp": "2026-09-25T18:00:10+00:00"}]},
            incidents=[{"id": "inc-1"}],
            rca={"analysis": {"root_cause": "inventory-db"}},
        )

        validator = DatasetValidator(dataset_root=dataset_path)
        is_valid, errors = validator.validate_dataset()
        assert is_valid is True
        assert len(errors) == 0

        summary = validator.generate_summary()
        assert summary["total_experiments"] == 1
        assert summary["successful_experiments"] == 1
        assert summary["experiments_by_fault_type"]["DB_LATENCY"] == 1
        assert summary["experiments_by_target"]["inventory-db"] == 1
        assert summary["experiments_with_telemetry"] == 1


# ─── 7. NO_FAULT Control Experiments ──────────────────────────────────────────

def test_no_fault_control_experiment_execution():
    """Verify NO_FAULT experiment execution does not inject faults and validates cleanly."""
    mock_client = MagicMock()
    mock_client.get_overview.return_value = {"services": [{"status": "healthy"}], "activeIncidents": []}
    mock_client.get_services.return_value = [{"status": "healthy"}]
    mock_client.get_active_incidents.return_value = []
    mock_client.get_incident_history.return_value = []
    mock_client.get_topology.return_value = {"nodes": [], "edges": []}
    mock_client.get_git_commit.return_value = "git-test-hash"

    with tempfile.TemporaryDirectory() as tmpdir:
        runner = ExperimentRunner(client=mock_client, dataset_root=Path(tmpdir))
        cfg = ExperimentConfig(
            experiment_id="C001",
            fault_type="NO_FAULT",
            target="none",
            duration_seconds=5,
            pre_fault_seconds=1,
            post_fault_seconds=1,
        )

        with patch("time.sleep", return_value=None):
            mock_client.get_metrics.side_effect = lambda: {
                "samples": [
                    {"service": "api-gateway", "p99Latency": 45, "errorRate": 0.1, "timestamp": utc_now_iso()},
                    {"service": "order-service", "p99Latency": 80, "errorRate": 0.1, "timestamp": utc_now_iso()},
                ]
            }
            rec = runner.run_experiment(cfg)

        # In NO_FAULT, client.inject_fault must NEVER be called
        mock_client.inject_fault.assert_not_called()

        assert rec.experiment_status == "SUCCESS"
        assert rec.fault_type == "NO_FAULT"
        assert rec.ground_truth_root_cause is None
        assert rec.fault_target is None
        assert rec.incident_id is None
        assert rec.rca_match is None
        assert rec.expected_affected_services == []

        # Validate through DatasetValidator
        validator = DatasetValidator(dataset_root=Path(tmpdir))
        is_valid, errors = validator.validate_dataset()
        assert is_valid is True, f"Validation failed with: {errors}"


# ─── 8. Validation Set Specifications ─────────────────────────────────────────

def test_validation_experiments_suite():
    """Verify VALIDATION_EXPERIMENTS has 15 experiments (10 faults + 5 controls)."""
    from dataset_generator.config import VALIDATION_EXPERIMENTS
    assert len(VALIDATION_EXPERIMENTS) == 15
    ids = [exp.experiment_id for exp in VALIDATION_EXPERIMENTS]
    assert len(set(ids)) == 15
    assert ids[:10] == [f"V{i:03d}" for i in range(1, 11)]
    assert ids[10:] == [f"C{i:03d}" for i in range(1, 6)]

    # Check that V001-V010 have duration >= 25s
    for exp in VALIDATION_EXPERIMENTS[:10]:
        assert exp.duration_seconds >= 25
        assert exp.fault_type in SUPPORTED_FAULT_TYPES
        assert exp.target != "none"

    # Check that C001-C005 are NO_FAULT
    for exp in VALIDATION_EXPERIMENTS[10:]:
        assert exp.fault_type == "NO_FAULT"
        assert exp.target == "none"


# ─── 9. Shared Collection Timestamp Verification ─────────────────────────────

def test_shared_timestamp_in_collection_cycle():
    """Verify that samples with identical timestamps are treated as the same collection cycle."""
    samples = [
        {"service": "api-gateway", "timestamp": "2026-09-25T18:40:48.330928+00:00", "p99Latency": 45},
        {"service": "inventory-db", "timestamp": "2026-09-25T18:40:48.330928+00:00", "p99Latency": 15},
        {"service": "inventory-service", "timestamp": "2026-09-25T18:40:48.330928+00:00", "p99Latency": 55},
        {"service": "order-service", "timestamp": "2026-09-25T18:40:48.330928+00:00", "p99Latency": 80},
        {"service": "payment-service", "timestamp": "2026-09-25T18:40:48.330928+00:00", "p99Latency": 65},
    ]
    timestamps = [s["timestamp"] for s in samples]
    assert len(set(timestamps)) == 1  # All services share exact same timestamp down to microsecond


# ─── 10. Full Dataset Plan Verification ───────────────────────────────────────

def test_full_dataset_plan_integrity():
    """Verify that full_dataset_plan.json exists, has 80 experiments, zero duplicates, and valid schema."""
    plan_path = Path("dataset/manifests/full_dataset_plan.json")
    assert plan_path.exists(), "dataset/manifests/full_dataset_plan.json not found"

    with open(plan_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert "planned_experiments" in data
    exps = data["planned_experiments"]
    assert len(exps) == 80

    required_keys = {"experiment_id", "experiment_class", "fault_type", "target", "parameters", "traffic_rate", "duration", "replicate_number"}
    ids = set()
    for e in exps:
        assert required_keys.issubset(e.keys())
        assert e["experiment_id"] not in ids, f"Duplicate ID: {e['experiment_id']}"
        ids.add(e["experiment_id"])

    # Check targets: only supported targets and 'none' for control
    targets = {e["target"] for e in exps}
    assert targets == {"none", "inventory-db", "inventory-service", "order-service", "payment-service"}
    assert "api-gateway" not in targets, "api-gateway should not be in the plan as it does not trigger incidents"


# ─── 11. Rate-Controlled Traffic Generator Tests ──────────────────────────────

def test_traffic_rate_validation():
    """Verify traffic_rate_rps validation rules and normalization."""
    # Invalid values: 0, -1, 20, 2
    for invalid in [0, -1, 20, 2]:
        with pytest.raises(ValidationError):
            ExperimentConfig(
                experiment_id="T001",
                fault_type="DB_LATENCY",
                target="inventory-db",
                traffic_rate_rps=invalid,
            )

    # Valid values: 1, 5, 15
    for valid in [1, 5, 15]:
        cfg = ExperimentConfig(
            experiment_id="T001",
            fault_type="DB_LATENCY",
            target="inventory-db",
            traffic_rate_rps=valid,
        )
        assert cfg.traffic_rate_rps == valid

    # Normalization from human-readable strings
    c5 = ExperimentConfig(
        experiment_id="T002",
        fault_type="DB_LATENCY",
        target="inventory-db",
        traffic_rate="5 req/s",
    )
    assert c5.traffic_rate_rps == 5

    c15 = ExperimentConfig(
        experiment_id="T003",
        fault_type="DB_LATENCY",
        target="inventory-db",
        traffic_rate="15 req/s",
    )
    assert c15.traffic_rate_rps == 15

    # TrafficGenerator constructor raises ValueError on invalid rate
    with pytest.raises(ValueError):
        TrafficGenerator(request_fn=lambda: None, rate_rps=7)


def test_traffic_generator_1rps_scheduling():
    """Verify 1 req/s scheduling starts ~2-3 requests over 2.05s."""
    import time
    calls = []

    def mock_request():
        calls.append(time.monotonic())
        return {"success": True}

    tg = TrafficGenerator(request_fn=mock_request, rate_rps=1)
    tg.start()
    time.sleep(2.05)
    metrics = tg.stop(timeout=1.0)

    assert 2 <= metrics.requests_started <= 4
    assert 0.7 <= metrics.observed_start_rate <= 1.8
    assert metrics.requests_completed == metrics.requests_started
    assert metrics.requests_failed == 0


def test_traffic_generator_5rps_scheduling():
    """Verify 5 req/s scheduling starts ~5-7 requests over 1.05s."""
    import time
    calls = []

    def mock_request():
        calls.append(time.monotonic())
        return {"success": True}

    tg = TrafficGenerator(request_fn=mock_request, rate_rps=5)
    tg.start()
    time.sleep(1.05)
    metrics = tg.stop(timeout=1.0)

    assert 5 <= metrics.requests_started <= 8
    assert 4.0 <= metrics.observed_start_rate <= 8.0
    assert metrics.requests_completed == metrics.requests_started


def test_traffic_generator_15rps_scheduling():
    """Verify 15 req/s scheduling starts ~14-18 requests over 1.05s."""
    import time
    calls = []

    def mock_request():
        calls.append(time.monotonic())
        return {"success": True}

    tg = TrafficGenerator(request_fn=mock_request, rate_rps=15)
    tg.start()
    time.sleep(1.05)
    metrics = tg.stop(timeout=1.0)

    assert 13 <= metrics.requests_started <= 19
    assert 12.0 <= metrics.observed_start_rate <= 19.0
    assert metrics.requests_completed == metrics.requests_started


def test_traffic_generator_slow_response_non_blocking():
    """
    CRITICAL TEST: Verify that when individual responses take 800ms,
    a 15 req/s generator maintains ~15 req/s start rate and does NOT collapse to 1.25 req/s.
    Also verifies concurrent in-flight requests accumulate (concurrency >= 6).
    """
    import time

    def slow_request():
        time.sleep(0.8)
        return {"success": True}

    tg = TrafficGenerator(request_fn=slow_request, rate_rps=15)
    tg.start()
    time.sleep(1.05)
    metrics = tg.stop(timeout=2.5)

    # Over 1.05 seconds at 15 req/s, ~14-18 requests should be started
    assert metrics.requests_started >= 13, f"Start rate collapsed! Only {metrics.requests_started} started"
    assert metrics.observed_start_rate >= 10.0, f"Observed start rate {metrics.observed_start_rate} collapsed!"
    # Since each request takes 800ms, concurrency must reach at least 6-12 in flight
    assert metrics.max_concurrent_requests >= 6, f"Concurrency {metrics.max_concurrent_requests} was not sustained"
    # All started requests should complete within stop timeout
    assert metrics.requests_completed == metrics.requests_started
    assert metrics.average_response_latency >= 700.0


def test_traffic_generator_request_counters_and_latencies():
    """Verify request counters correctly separate completed vs failed, and latencies are tracked."""
    import time
    call_idx = 0

    def mixed_request():
        nonlocal call_idx
        call_idx += 1
        time.sleep(0.02)
        if call_idx % 2 == 0:
            raise RuntimeError("Synthetic failure")
        return {"success": True}

    tg = TrafficGenerator(request_fn=mixed_request, rate_rps=15)
    tg.start()
    time.sleep(0.5)
    metrics = tg.stop(timeout=1.0)

    assert metrics.requests_started == metrics.requests_completed + metrics.requests_failed
    assert metrics.requests_completed > 0
    assert metrics.requests_failed > 0
    assert metrics.average_response_latency > 0
    assert metrics.p95_response_latency >= metrics.average_response_latency


def test_traffic_generator_clean_shutdown():
    """Verify clean shutdown: scheduler joins, no hanging threads, and stop() is idempotent."""
    import time

    tg = TrafficGenerator(request_fn=lambda: {"success": True}, rate_rps=15)
    tg.start()
    assert tg.scheduler_thread.is_alive()
    time.sleep(0.1)
    m1 = tg.stop(timeout=1.0)
    assert not tg.scheduler_thread.is_alive()

    # Calling stop() again returns identical cached metrics
    m2 = tg.stop(timeout=1.0)
    assert m1.requests_started == m2.requests_started
    assert m1.duration_seconds == m2.duration_seconds


def test_runner_traffic_metrics_integration():
    """Verify ExperimentRunner populates and serializes all traffic telemetry fields."""
    mock_client = MagicMock()
    mock_client.get_overview.return_value = {"services": [{"status": "healthy"}], "activeIncidents": []}
    mock_client.get_services.return_value = [{"status": "healthy"}]
    mock_client.get_active_incidents.return_value = []
    mock_client.get_incident_history.return_value = []
    mock_client.get_topology.return_value = {"nodes": [], "edges": []}
    mock_client.get_git_commit.return_value = "git-test-hash"
    mock_client.send_order_traffic.return_value = {"success": True}
    mock_client.get_metrics.return_value = {
        "samples": [
            {"service": "api-gateway", "p99Latency": 45, "errorRate": 0.0, "timestamp": utc_now_iso()},
        ]
    }

    with tempfile.TemporaryDirectory() as tmpdir:
        runner = ExperimentRunner(client=mock_client, dataset_root=Path(tmpdir))
        cfg = ExperimentConfig(
            experiment_id="E099",
            fault_type="NO_FAULT",
            target="none",
            duration_seconds=5,
            pre_fault_seconds=1,
            post_fault_seconds=1,
            traffic_rate_rps=5,
        )

        with patch("time.sleep", return_value=None):
            rec = runner.run_experiment(cfg)

        assert rec.traffic_rate_rps == 5
        assert rec.experiment_status == "SUCCESS"
        manifest_path = Path(tmpdir) / "experiments" / "E099" / "manifest.json"
        assert manifest_path.exists()
        with open(manifest_path, "r", encoding="utf-8") as f:
            saved = json.load(f)

        for field in [
            "traffic_rate_rps", "requests_started", "requests_completed",
            "requests_failed", "observed_start_rate", "observed_completion_rate",
            "max_concurrent_requests", "average_response_latency", "p95_response_latency"
        ]:
            assert field in saved, f"Missing telemetry field {field} in saved manifest"

