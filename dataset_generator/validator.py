import json
from collections import Counter
from pathlib import Path
from typing import Any, Dict, List, Tuple

from .schema import ExperimentRecord, parse_iso


class DatasetValidator:
    """
    Validates dataset integrity, verifies ground-truth constraints,
    and produces summary diagnostic statistics.
    """
    def __init__(self, dataset_root: Path = Path("dataset")):
        self.dataset_root = dataset_root
        self.experiments_dir = self.dataset_root / "experiments"
        self.manifest_file = self.dataset_root / "manifests" / "experiments.jsonl"

    def load_manifest_records(self) -> List[ExperimentRecord]:
        """Loads all experiment records from the central JSONL manifest."""
        records: List[ExperimentRecord] = []
        if not self.manifest_file.exists():
            return records
        with open(self.manifest_file, "r", encoding="utf-8") as f:
            for line_no, line in enumerate(f, 1):
                line = line.strip()
                if not line:
                    continue
                try:
                    data = json.loads(line)
                    records.append(ExperimentRecord(**data))
                except Exception as e:
                    raise ValueError(f"Corrupt manifest line {line_no}: {e}") from e
        return records

    def validate_dataset(self) -> Tuple[bool, List[str]]:
        """
        Runs comprehensive validation checks across all experiments in the dataset.
        Returns (is_valid, list_of_error_messages).
        """
        errors: List[str] = []
        records = self.load_manifest_records()

        if not records:
            errors.append("Dataset is empty. No experiment records found in manifests/experiments.jsonl.")
            return False, errors

        # 1. Unique experiment IDs
        seen_ids = set()
        for r in records:
            if r.experiment_id in seen_ids:
                errors.append(f"Duplicate experiment_id detected: {r.experiment_id}")
            seen_ids.add(r.experiment_id)

        for r in records:
            exp_id = r.experiment_id
            exp_dir = self.experiments_dir / exp_id

            # Skip deeper artifact checks if experiment was explicitly unsupported
            if r.experiment_status == "UNSUPPORTED":
                continue

            # 2. Timestamp validity and ordering
            try:
                r.validate_timestamps()
            except ValueError as e:
                errors.append(f"[{exp_id}] {e}")

            # 3. Ground truth integrity
            if r.fault_type == "NO_FAULT":
                if r.ground_truth_root_cause is not None:
                    errors.append(f"[{exp_id}] NO_FAULT experiment must have null ground_truth_root_cause.")
            else:
                if not r.ground_truth_root_cause:
                    errors.append(f"[{exp_id}] Missing ground_truth_root_cause.")
                if r.ground_truth_root_cause != r.fault_target:
                    errors.append(
                        f"[{exp_id}] Ground truth '{r.ground_truth_root_cause}' "
                        f"does not match fault target '{r.fault_target}'."
                    )

            # 4. Check for false success
            if r.experiment_status == "SUCCESS" and r.error_message:
                errors.append(f"[{exp_id}] Falsely marked SUCCESS despite error_message: {r.error_message}")

            # 5. Verify physical artifact directory exists
            if not exp_dir.exists():
                errors.append(f"[{exp_id}] Experiment directory {exp_dir} is missing.")
                continue

            # 6. Verify required artifact files
            required_files = ["manifest.json", "metrics.json", "incidents.json", "topology.json", "rca.json"]
            for fname in required_files:
                fpath = exp_dir / fname
                if not fpath.exists():
                    errors.append(f"[{exp_id}] Required file {fname} is missing.")
                elif fpath.stat().st_size == 0:
                    errors.append(f"[{exp_id}] Required file {fname} is empty.")

            # 7. Verify telemetry existence for the window
            metrics_path = exp_dir / "metrics.json"
            if metrics_path.exists():
                try:
                    with open(metrics_path, "r", encoding="utf-8") as f:
                        metrics_data = json.load(f)
                    samples = metrics_data.get("samples", [])
                    if r.experiment_status == "SUCCESS" and len(samples) == 0:
                        errors.append(f"[{exp_id}] No telemetry samples captured for experiment window.")
                except Exception as e:
                    errors.append(f"[{exp_id}] Failed to read metrics.json: {e}")

        is_valid = len(errors) == 0
        return is_valid, errors

    def generate_summary(self) -> Dict[str, Any]:
        """
        Computes summary statistics across all experiments.
        Note: The RCA match statistic is strictly a baseline diagnostic,
        not a trained ML accuracy metric.
        """
        records = self.load_manifest_records()
        total = len(records)
        successful = sum(1 for r in records if r.experiment_status == "SUCCESS")
        failed = sum(1 for r in records if r.experiment_status == "FAILED")
        unsupported = sum(1 for r in records if r.experiment_status == "UNSUPPORTED")

        by_fault_type = Counter(r.fault_type for r in records)
        by_target = Counter(r.fault_target for r in records)

        with_telemetry = 0
        for r in records:
            metrics_file = self.experiments_dir / r.experiment_id / "metrics.json"
            if metrics_file.exists():
                try:
                    with open(metrics_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    if len(data.get("samples", [])) > 0:
                        with_telemetry += 1
                except Exception:
                    pass

        with_incidents = sum(1 for r in records if r.incident_id is not None)
        rca_correct = sum(1 for r in records if r.rca_match is True)
        rca_incorrect = sum(1 for r in records if r.rca_match is False)
        rca_unresolved = sum(1 for r in records if r.rca_match is None)

        return {
            "total_experiments": total,
            "successful_experiments": successful,
            "failed_experiments": failed,
            "unsupported_experiments": unsupported,
            "experiments_by_fault_type": dict(by_fault_type),
            "experiments_by_target": dict(by_target),
            "experiments_with_telemetry": with_telemetry,
            "experiments_with_incidents": with_incidents,
            "experiments_with_correct_rca": rca_correct,
            "experiments_with_incorrect_rca": rca_incorrect,
            "experiments_with_unresolved_rca": rca_unresolved,
        }

    def format_summary_report(self) -> str:
        """Returns a formatted plain-text summary report."""
        s = self.generate_summary()
        lines = [
            "=" * 60,
            "CAUSALOPS DATASET SUMMARY REPORT",
            "=" * 60,
            f"Total experiments:              {s['total_experiments']}",
            f"Successful experiments:         {s['successful_experiments']}",
            f"Failed experiments:             {s['failed_experiments']}",
            f"Unsupported experiments:        {s['unsupported_experiments']}",
            "",
            "Experiments by fault type:",
        ]
        for ftype, count in s["experiments_by_fault_type"].items():
            lines.append(f"  - {ftype:<28}: {count}")

        lines.append("")
        lines.append("Experiments by target:")
        for target, count in s["experiments_by_target"].items():
            lines.append(f"  - {str(target or 'none'):<28}: {count}")

        lines.append("")
        lines.append(f"Experiments with telemetry:     {s['experiments_with_telemetry']}")
        lines.append(f"Experiments with incidents:     {s['experiments_with_incidents']}")
        lines.append("")
        lines.append("Baseline Heuristic RCA Diagnostics (NOT ML Evaluation):")
        lines.append(f"  - Ground truth matched RCA:    {s['experiments_with_correct_rca']}")
        lines.append(f"  - Ground truth differed:       {s['experiments_with_incorrect_rca']}")
        lines.append(f"  - Unresolved / No RCA:         {s['experiments_with_unresolved_rca']}")
        lines.append("=" * 60)
        return "\n".join(lines)
