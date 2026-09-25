import json
import logging
import threading
import time
from datetime import timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional

from .client import CausalOpsClient
from .config import ExperimentConfig
from .schema import (
    EXPECTED_AFFECTED_MAP,
    ExperimentRecord,
    parse_iso,
    utc_now_iso,
)
from .traffic import TrafficGenerator, TrafficMetrics

logger = logging.getLogger("dataset_generator")


class ExperimentRunner:
    """
    Executes controlled fault injection experiments against the CausalOps prototype.
    Captures telemetry, monitors propagation, retrieves RCA attribution,
    and produces structured dataset records.
    """
    def __init__(
        self,
        client: Optional[CausalOpsClient] = None,
        dataset_root: Optional[Path] = None,
    ):
        self.client = client or CausalOpsClient()
        self.dataset_root = dataset_root or Path("dataset")
        self.experiments_dir = self.dataset_root / "experiments"
        self.manifests_dir = self.dataset_root / "manifests"
        self.experiments_dir.mkdir(parents=True, exist_ok=True)
        self.manifests_dir.mkdir(parents=True, exist_ok=True)

    def run_experiment(self, config: ExperimentConfig, run_number: int = 1) -> ExperimentRecord:
        """
        Execute the full 14-step experiment lifecycle for a single configuration.
        Guarantees safety cleanup via try/finally.
        """
        experiment_id = config.experiment_id
        started_at = utc_now_iso()
        telemetry_start = started_at
        fault_id: Optional[str] = None
        traffic_gen: Optional[TrafficGenerator] = None
        traffic_metrics: Optional[TrafficMetrics] = None

        logger.info(f"[{experiment_id}] Starting experiment: {config.fault_type} on {config.target}")

        is_control = (config.fault_type == "NO_FAULT")
        if is_control:
            ground_truth = None
            expected_affected = []
            fault_target = None
        else:
            ground_truth = config.target
            expected_affected = EXPECTED_AFFECTED_MAP.get(config.target, [config.target])
            fault_target = config.target

        # Step 0: Check for unsupported fault types
        if not config.is_supported():
            reason = config.unsupported_reason()
            logger.warning(f"[{experiment_id}] Unsupported fault type: {reason}")
            finished_at = utc_now_iso()
            record = ExperimentRecord(
                experiment_id=experiment_id,
                run_number=run_number,
                started_at=started_at,
                fault_start_at=started_at,
                fault_end_at=finished_at,
                finished_at=finished_at,
                fault_type=config.fault_type,
                fault_target=fault_target,
                fault_parameters=config.parameters,
                ground_truth_root_cause=ground_truth,
                expected_affected_services=expected_affected,
                baseline_status="UNSUPPORTED",
                telemetry_start=started_at,
                telemetry_end=finished_at,
                experiment_status="UNSUPPORTED",
                error_message=reason,
                git_commit=self.client.get_git_commit(),
            )
            self._save_experiment_artifacts(record, topology={}, metrics={}, incidents=[], rca={})
            return record

        try:
            # ─── Step 1: Verify the system is healthy ─────────────────────────
            baseline_status = self._ensure_healthy_system(timeout=30.0)
            logger.info(f"[{experiment_id}] Step 1: System verified healthy (status: {baseline_status})")

            # ─── Step 2 & 3: Baseline traffic & telemetry ─────────────────────
            telemetry_start = utc_now_iso()
            traffic_gen = TrafficGenerator(
                request_fn=self.client.send_order_traffic,
                rate_rps=config.traffic_rate_rps,
            )
            traffic_gen.start()
            time.sleep(config.pre_fault_seconds)
            logger.info(f"[{experiment_id}] Steps 2 & 3: Normal baseline traffic generated at {config.traffic_rate_rps} req/s for {config.pre_fault_seconds}s")

            if is_control:
                fault_start_at = utc_now_iso()
                logger.info(f"[{experiment_id}] Steps 4 & 5: Control run active (no fault injected) for {config.duration_seconds}s")
                time.sleep(config.duration_seconds)
                fault_end_at = utc_now_iso()
                logger.info(f"[{experiment_id}] Steps 8 & 10: Control observation ended at {fault_end_at}")
                time.sleep(config.post_fault_seconds)
                telemetry_end = utc_now_iso()
                finished_at = telemetry_end
            else:
                # ─── Step 4 & 5: Start controlled fault & record exact start ──────
                fault_res = self.client.inject_fault(
                    fault_type=config.fault_type,
                    target=config.target,
                    severity=config.severity,
                    duration_seconds=config.duration_seconds + 60,  # Buffer to allow runner to control exact stop
                    parameters=config.parameters,
                )
                fault_id = fault_res.get("id")
                fault_start_at = utc_now_iso()
                logger.info(f"[{experiment_id}] Steps 4 & 5: Fault {fault_id} started at {fault_start_at}")

                # ─── Step 6 & 7: Traffic & telemetry during fault propagation ─────
                time.sleep(config.duration_seconds)
                logger.info(f"[{experiment_id}] Steps 6 & 7: Fault active for {config.duration_seconds}s")

                # ─── Step 8 & 10: Stop fault & record exact fault_end_at ──────────
                self.client.clear_faults()
                fault_end_at = utc_now_iso()
                logger.info(f"[{experiment_id}] Steps 8 & 10: Fault cleared at {fault_end_at}")

                # ─── Step 9 & 11: Continue traffic during recovery & wait ─────────
                time.sleep(config.post_fault_seconds)
                self._wait_for_recovery(timeout=25.0)
                telemetry_end = utc_now_iso()
                finished_at = telemetry_end
                logger.info(f"[{experiment_id}] Steps 9 & 11: System recovered; telemetry window closed at {telemetry_end}")

            # Stop traffic generator and collect traffic metrics
            if traffic_gen:
                traffic_metrics = traffic_gen.stop(timeout=4.0)
                logger.info(
                    f"[{experiment_id}] Traffic metrics: {traffic_metrics.requests_started} started, "
                    f"{traffic_metrics.requests_completed} completed, {traffic_metrics.requests_failed} failed, "
                    f"observed start rate: {traffic_metrics.observed_start_rate} req/s, "
                    f"max concurrency: {traffic_metrics.max_concurrent_requests}, "
                    f"p95 latency: {traffic_metrics.p95_response_latency}ms"
                )

            # ─── Step 12: Retrieve resulting incident & RCA information ───────
            incidents_data = self._fetch_recent_incidents(telemetry_start)
            primary_incident = incidents_data[0] if incidents_data else None

            incident_id = primary_incident.get("id") if primary_incident else None
            rca_data: Dict[str, Any] = {}
            detected_root_cause: Optional[str] = None
            detected_confidence: Optional[float] = None

            if incident_id:
                try:
                    rca_data = self.client.get_incident_rca(incident_id)
                    analysis = rca_data.get("analysis", {})
                    detected_root_cause = analysis.get("root_cause")
                    detected_confidence = analysis.get("confidence")
                except Exception as e:
                    logger.warning(f"[{experiment_id}] Could not fetch RCA for incident {incident_id}: {e}")

            if is_control:
                rca_match = False if incident_id else None
                logger.info(f"[{experiment_id}] Step 12: Control run incident check: {incident_id or 'None (Clean)'}")
            else:
                rca_match = (detected_root_cause == ground_truth) if detected_root_cause else None
                logger.info(f"[{experiment_id}] Step 12: Detected RCA: {detected_root_cause} (Ground truth: {ground_truth})")

            # ─── Step 13: Fetch and structure complete telemetry & artifacts ──
            all_metrics = self.client.get_metrics()
            filtered_samples = self._filter_metrics_by_window(
                all_metrics.get("samples", []), telemetry_start, telemetry_end
            )
            metrics_data = {"service": None, "samples": filtered_samples}
            topology_data = self.client.get_topology()

            # ─── Step 14: Validation and record assembly ──────────────────────
            # Require at least some telemetry to mark as successful
            has_telemetry = len(filtered_samples) > 0
            experiment_status = "SUCCESS" if has_telemetry else "FAILED"
            error_message = None if has_telemetry else "No telemetry samples recorded during experiment window."

            record = ExperimentRecord(
                experiment_id=experiment_id,
                run_number=run_number,
                started_at=started_at,
                fault_start_at=fault_start_at,
                fault_end_at=fault_end_at,
                finished_at=finished_at,
                fault_type=config.fault_type,
                fault_target=fault_target,
                fault_parameters=config.parameters,
                ground_truth_root_cause=ground_truth,
                expected_affected_services=expected_affected,
                baseline_status=baseline_status,
                incident_id=incident_id,
                detected_root_cause=detected_root_cause,
                detected_confidence=detected_confidence,
                rca_match=rca_match,
                telemetry_start=telemetry_start,
                telemetry_end=telemetry_end,
                traffic_rate_rps=config.traffic_rate_rps,
                requests_started=traffic_metrics.requests_started if traffic_metrics else 0,
                requests_completed=traffic_metrics.requests_completed if traffic_metrics else 0,
                requests_failed=traffic_metrics.requests_failed if traffic_metrics else 0,
                observed_start_rate=traffic_metrics.observed_start_rate if traffic_metrics else 0.0,
                observed_completion_rate=traffic_metrics.observed_completion_rate if traffic_metrics else 0.0,
                max_concurrent_requests=traffic_metrics.max_concurrent_requests if traffic_metrics else 0,
                average_response_latency=traffic_metrics.average_response_latency if traffic_metrics else 0.0,
                p95_response_latency=traffic_metrics.p95_response_latency if traffic_metrics else 0.0,
                experiment_status=experiment_status,
                error_message=error_message,
                git_commit=self.client.get_git_commit(),
            )

            record.validate_timestamps()
            self._save_experiment_artifacts(
                record,
                topology=topology_data,
                metrics=metrics_data,
                incidents=incidents_data,
                rca=rca_data,
            )
            logger.info(f"[{experiment_id}] Experiment completed successfully ({record.experiment_status})")
            return record

        except Exception as e:
            logger.error(f"[{experiment_id}] Experiment encountered error: {e}", exc_info=True)
            finished_at = utc_now_iso()
            fault_start = fault_start_at if "fault_start_at" in locals() else started_at
            fault_end = fault_end_at if "fault_end_at" in locals() else finished_at
            if traffic_gen and traffic_metrics is None:
                try:
                    traffic_metrics = traffic_gen.stop(timeout=2.0)
                except Exception:
                    pass

            record = ExperimentRecord(
                experiment_id=experiment_id,
                run_number=run_number,
                started_at=started_at,
                fault_start_at=fault_start,
                fault_end_at=fault_end,
                finished_at=finished_at,
                fault_type=config.fault_type,
                fault_target=fault_target if "fault_target" in locals() else config.target,
                fault_parameters=config.parameters,
                ground_truth_root_cause=ground_truth,
                expected_affected_services=expected_affected,
                baseline_status=baseline_status if "baseline_status" in locals() else "UNKNOWN",
                telemetry_start=telemetry_start,
                telemetry_end=finished_at,
                traffic_rate_rps=config.traffic_rate_rps,
                requests_started=traffic_metrics.requests_started if traffic_metrics else 0,
                requests_completed=traffic_metrics.requests_completed if traffic_metrics else 0,
                requests_failed=traffic_metrics.requests_failed if traffic_metrics else 0,
                observed_start_rate=traffic_metrics.observed_start_rate if traffic_metrics else 0.0,
                observed_completion_rate=traffic_metrics.observed_completion_rate if traffic_metrics else 0.0,
                max_concurrent_requests=traffic_metrics.max_concurrent_requests if traffic_metrics else 0,
                average_response_latency=traffic_metrics.average_response_latency if traffic_metrics else 0.0,
                p95_response_latency=traffic_metrics.p95_response_latency if traffic_metrics else 0.0,
                experiment_status="FAILED",
                error_message=str(e),
                git_commit=self.client.get_git_commit(),
            )
            self._save_experiment_artifacts(record, topology={}, metrics={}, incidents=[], rca={})
            return record

        finally:
            # SAFETY GUARANTEE: Always stop traffic and clear any active faults
            if traffic_gen:
                try:
                    traffic_gen.stop(timeout=2.0)
                except Exception:
                    pass
            try:
                self.client.clear_faults()
            except Exception as e:
                logger.error(f"[{experiment_id}] Failed to clear faults during safety cleanup: {e}")

    # ─── Helper Methods ───────────────────────────────────────────────────────

    def _ensure_healthy_system(self, timeout: float = 30.0) -> str:
        """Polls until no faults are active and all services report healthy."""
        self.client.clear_faults()
        start = time.time()
        while time.time() - start < timeout:
            try:
                overview = self.client.get_overview()
                services = overview.get("services", [])
                active_incidents = overview.get("activeIncidents", [])
                all_healthy = len(services) > 0 and all(s.get("status") == "healthy" for s in services)
                if all_healthy and len(active_incidents) == 0:
                    return overview.get("systemStatus", "Operational")
            except Exception:
                pass
            time.sleep(2.0)
        return "Operational"

    def _wait_for_recovery(self, timeout: float = 25.0) -> None:
        """Waits for fleet services to return to healthy baseline after fault stop."""
        start = time.time()
        while time.time() - start < timeout:
            try:
                services = self.client.get_services()
                if all(s.get("status") == "healthy" for s in services):
                    break
            except Exception:
                pass
            time.sleep(2.0)

    def _fetch_recent_incidents(self, since_iso: str) -> List[Dict[str, Any]]:
        """Fetch incidents opened during or after the experiment start timestamp."""
        try:
            active = self.client.get_active_incidents()
            history = self.client.get_incident_history()
            combined = active + history
            since_dt = parse_iso(since_iso)
            results = []
            seen_ids = set()
            for inc in combined:
                inc_id = inc.get("id")
                if inc_id in seen_ids:
                    continue
                seen_ids.add(inc_id)
                opened = inc.get("openedAt")
                if opened:
                    try:
                        if parse_iso(opened) >= since_dt:
                            results.append(inc)
                    except Exception:
                        results.append(inc)
            return results
        except Exception:
            return []

    def _filter_metrics_by_window(
        self, samples: List[Dict[str, Any]], start_iso: str, end_iso: str
    ) -> List[Dict[str, Any]]:
        start_dt = parse_iso(start_iso) - timedelta(seconds=1)
        end_dt = parse_iso(end_iso) + timedelta(seconds=2)
        filtered = []
        for s in samples:
            ts = s.get("timestamp")
            if not ts:
                continue
            try:
                dt = parse_iso(ts)
                if start_dt <= dt <= end_dt:
                    filtered.append(s)
            except Exception:
                pass
        return filtered

    def _save_experiment_artifacts(
        self,
        record: ExperimentRecord,
        topology: Dict[str, Any],
        metrics: Dict[str, Any],
        incidents: List[Dict[str, Any]],
        rca: Dict[str, Any],
    ) -> None:
        """Writes the per-experiment files and appends to the central JSONL manifest."""
        exp_dir = self.experiments_dir / record.experiment_id
        exp_dir.mkdir(parents=True, exist_ok=True)

        # 1. manifest.json
        with open(exp_dir / "manifest.json", "w", encoding="utf-8") as f:
            json.dump(record.model_dump(), f, indent=2)

        # 2. topology.json
        with open(exp_dir / "topology.json", "w", encoding="utf-8") as f:
            json.dump(topology, f, indent=2)

        # 3. metrics.json
        with open(exp_dir / "metrics.json", "w", encoding="utf-8") as f:
            json.dump(metrics, f, indent=2)

        # 4. incidents.json
        with open(exp_dir / "incidents.json", "w", encoding="utf-8") as f:
            json.dump({"incidents": incidents}, f, indent=2)

        # 5. rca.json
        with open(exp_dir / "rca.json", "w", encoding="utf-8") as f:
            json.dump(rca, f, indent=2)

        # 6. Central JSONL manifest (idempotently update by experiment_id & run_number)
        manifest_file = self.manifests_dir / "experiments.jsonl"
        existing_lines: List[str] = []
        if manifest_file.exists():
            with open(manifest_file, "r", encoding="utf-8") as f:
                for line in f:
                    stripped = line.strip()
                    if not stripped:
                        continue
                    try:
                        entry = json.loads(stripped)
                        if (
                            entry.get("experiment_id") == record.experiment_id
                            and entry.get("run_number") == record.run_number
                        ):
                            continue  # Replace existing run
                        existing_lines.append(stripped)
                    except Exception:
                        existing_lines.append(stripped)

        existing_lines.append(json.dumps(record.model_dump()))
        with open(manifest_file, "w", encoding="utf-8") as f:
            for line_str in existing_lines:
                f.write(line_str + "\n")
