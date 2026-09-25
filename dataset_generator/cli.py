import argparse
import json
import logging
import sys
from pathlib import Path

from .config import (
    ExperimentConfig,
    PILOT_EXPERIMENTS,
    VALIDATION_EXPERIMENTS,
    load_experiment_configs,
)
from .runner import ExperimentRunner
from .validator import DatasetValidator

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("cli")


def cmd_run_pilot(args: argparse.Namespace) -> int:
    """Runs the 10-experiment pilot suite."""
    runner = ExperimentRunner(dataset_root=Path(args.dataset_dir))
    logger.info(f"Starting CausalOps Pilot Dataset (10 experiments) -> {args.dataset_dir}")
    print(f"\n🚀 Running 10-Experiment Pilot Suite...")

    success_count = 0
    for idx, config in enumerate(PILOT_EXPERIMENTS, 1):
        print(f"\n[{idx}/10] Executing {config.experiment_id}: {config.fault_type} on {config.target}...")
        record = runner.run_experiment(config, run_number=1)
        if record.experiment_status == "SUCCESS":
            success_count += 1
            match_str = f"RCA Match: {record.rca_match} ({record.detected_root_cause})" if record.detected_root_cause else "No RCA"
            print(f"  ✓ {record.experiment_id} SUCCESS | Incident: {record.incident_id or 'None'} | {match_str}")
        elif record.experiment_status == "UNSUPPORTED":
            print(f"  ⚠ {record.experiment_id} UNSUPPORTED | Reason: {record.error_message}")
        else:
            print(f"  ✗ {record.experiment_id} FAILED | Error: {record.error_message}")

    print(f"\n🏁 Pilot Completed: {success_count}/{len(PILOT_EXPERIMENTS)} successful.")
    validator = DatasetValidator(dataset_root=Path(args.dataset_dir))
    is_valid, errors = validator.validate_dataset()
    if is_valid:
        print("✓ Dataset integrity validation passed.")
    else:
        print(f"⚠ Validation found {len(errors)} warnings/issues:")
        for err in errors:
            print(f"  - {err}")
    print("\n" + validator.format_summary_report())
    return 0 if is_valid else 1


def cmd_run_validation(args: argparse.Namespace) -> int:
    """Runs the 15-experiment validation suite (V001-V010, C001-C005)."""
    runner = ExperimentRunner(dataset_root=Path(args.dataset_dir))
    logger.info(f"Starting CausalOps Validation Dataset (15 experiments) -> {args.dataset_dir}")
    print(f"\n🚀 Running 15-Experiment Validation Suite (V001-V010, C001-C005)...")

    success_count = 0
    total = len(VALIDATION_EXPERIMENTS)
    for idx, config in enumerate(VALIDATION_EXPERIMENTS, 1):
        target_str = config.target if config.fault_type != "NO_FAULT" else "none (control)"
        print(f"\n[{idx}/{total}] Executing {config.experiment_id}: {config.fault_type} on {target_str}...")
        record = runner.run_experiment(config, run_number=1)
        if record.experiment_status == "SUCCESS":
            success_count += 1
            if config.fault_type == "NO_FAULT":
                status_str = f"Incident: {record.incident_id or 'None (Clean Control)'}"
            else:
                match_str = f"RCA Match: {record.rca_match} ({record.detected_root_cause})" if record.detected_root_cause else "No RCA"
                status_str = f"Incident: {record.incident_id or 'None'} | {match_str}"
            print(f"  ✓ {record.experiment_id} SUCCESS | {status_str}")
        elif record.experiment_status == "UNSUPPORTED":
            print(f"  ⚠ {record.experiment_id} UNSUPPORTED | Reason: {record.error_message}")
        else:
            print(f"  ✗ {record.experiment_id} FAILED | Error: {record.error_message}")

    print(f"\n🏁 Validation Set Completed: {success_count}/{total} successful.")
    validator = DatasetValidator(dataset_root=Path(args.dataset_dir))
    is_valid, errors = validator.validate_dataset()
    if is_valid:
        print("✓ Dataset integrity validation passed.")
    else:
        print(f"⚠ Validation found {len(errors)} warnings/issues:")
        for err in errors:
            print(f"  - {err}")
    print("\n" + validator.format_summary_report())
    return 0 if is_valid else 1


def cmd_run_plan(args: argparse.Namespace) -> int:
    """Runs a full planned dataset from a plan JSON file (e.g. full_dataset_plan.json)."""
    plan_path = Path(args.plan)
    if not plan_path.exists():
        logger.error(f"Plan file not found: {plan_path}")
        return 1

    configs = load_experiment_configs(plan_path)
    total = len(configs)
    runner = ExperimentRunner(dataset_root=Path(args.dataset_dir))
    logger.info(f"Executing plan {plan_path} ({total} experiments) -> {args.dataset_dir}")
    print(f"\n🚀 Running {total}-Experiment Dataset Plan from {plan_path}...")
    sys.stdout.flush()

    success_count = 0
    failed_count = 0
    for idx, config in enumerate(configs, 1):
        target_str = config.target if config.fault_type != "NO_FAULT" else "none (control)"
        rep = getattr(config, "replicate_number", None) or getattr(config, "run_number", 1) or 1
        print(f"\n[{idx}/{total}] Executing {config.experiment_id}: {config.fault_type} on {target_str} (Rate: {config.traffic_rate_rps} req/s, Dur: {config.duration_seconds}s, Rep: {rep})...")
        sys.stdout.flush()

        record = runner.run_experiment(config, run_number=rep)
        if record.experiment_status == "SUCCESS":
            success_count += 1
            if config.fault_type == "NO_FAULT":
                status_str = f"Incident: {record.incident_id or 'None (Clean Control)'}"
            else:
                match_str = f"RCA Match: {record.rca_match} (Detected: {record.detected_root_cause}, Truth: {record.ground_truth_root_cause})"
                status_str = f"Incident: {record.incident_id or 'None'} | {match_str}"
            print(f"  ✓ {record.experiment_id} SUCCESS | {status_str} | Traffic: {record.observed_start_rate:.1f} rps, Concurrency: {record.max_concurrent_requests}")
        elif record.experiment_status == "UNSUPPORTED":
            print(f"  ⚠ {record.experiment_id} UNSUPPORTED | Reason: {record.error_message}")
        else:
            failed_count += 1
            print(f"  ✗ {record.experiment_id} FAILED | Error: {record.error_message}")
        sys.stdout.flush()

    print(f"\n🏁 Plan Execution Completed: {success_count}/{total} successful, {failed_count} failed.")
    sys.stdout.flush()

    validator = DatasetValidator(dataset_root=Path(args.dataset_dir))
    is_valid, errors = validator.validate_dataset()
    if is_valid:
        print("✓ Dataset integrity validation passed.")
    else:
        print(f"⚠ Validation found {len(errors)} warnings/issues:")
        for err in errors:
            print(f"  - {err}")
    print("\n" + validator.format_summary_report())
    sys.stdout.flush()
    return 0 if is_valid else 1


def cmd_run_single(args: argparse.Namespace) -> int:
    """Runs a single configured experiment."""
    params = {}
    if args.params:
        try:
            params = json.loads(args.params)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in --params: {e}")
            return 1

    config = ExperimentConfig(
        experiment_id=args.id,
        fault_type=args.type,
        target=args.target,
        parameters=params,
        severity=args.severity,
        duration_seconds=args.duration,
        pre_fault_seconds=args.pre_fault,
        post_fault_seconds=args.post_fault,
    )
    runner = ExperimentRunner(dataset_root=Path(args.dataset_dir))
    record = runner.run_experiment(config)
    print(json.dumps(record.model_dump(), indent=2))
    return 0 if record.experiment_status == "SUCCESS" else 1


def cmd_validate(args: argparse.Namespace) -> int:
    """Validates the existing dataset."""
    validator = DatasetValidator(dataset_root=Path(args.dataset_dir))
    is_valid, errors = validator.validate_dataset()
    if is_valid:
        print("✓ All validation checks passed cleanly.")
        return 0
    else:
        print(f"✗ Dataset validation failed with {len(errors)} error(s):")
        for err in errors:
            print(f"  - {err}")
        return 1


def cmd_summary(args: argparse.Namespace) -> int:
    """Prints the dataset summary report."""
    validator = DatasetValidator(dataset_root=Path(args.dataset_dir))
    print(validator.format_summary_report())
    return 0


def main() -> int:
    base_parser = argparse.ArgumentParser(add_help=False)
    base_parser.add_argument(
        "--dataset-dir",
        default="dataset",
        help="Target dataset directory (default: 'dataset')",
    )

    parser = argparse.ArgumentParser(
        prog="causalops-dataset",
        description="CausalOps Dataset Generator CLI",
        parents=[base_parser],
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # run-plan
    p_plan = subparsers.add_parser("run-plan", parents=[base_parser], help="Run experiments from an approved plan JSON file")
    p_plan.add_argument("--plan", required=True, help="Path to plan JSON file (e.g. dataset/manifests/full_dataset_plan.json)")

    # run-pilot
    subparsers.add_parser("run-pilot", parents=[base_parser], help="Run the standard 10-experiment pilot suite")

    # run-validation
    subparsers.add_parser("run-validation", parents=[base_parser], help="Run the 15-experiment validation suite (V001-V010, C001-C005)")

    # run
    p_run = subparsers.add_parser("run", parents=[base_parser], help="Run a single custom experiment")
    p_run.add_argument("--id", required=True, help="Experiment ID e.g. E001")
    p_run.add_argument("--type", required=True, help="Fault type e.g. DB_LATENCY")
    p_run.add_argument("--target", required=True, help="Target service e.g. inventory-db")
    p_run.add_argument("--params", default="{}", help="JSON parameters e.g. '{\"latencyMs\":1200}'")
    p_run.add_argument("--severity", default="HIGH", help="Severity (default: HIGH)")
    p_run.add_argument("--duration", type=int, default=20, help="Duration in seconds (default: 20)")
    p_run.add_argument("--pre-fault", type=int, default=6, help="Pre-fault duration in seconds (default: 6)")
    p_run.add_argument("--post-fault", type=int, default=10, help="Post-fault duration in seconds (default: 10)")

    # validate
    subparsers.add_parser("validate", parents=[base_parser], help="Validate dataset integrity and ground-truth consistency")

    # summary
    subparsers.add_parser("summary", parents=[base_parser], help="Print dataset diagnostic summary report")

    args = parser.parse_args()
    if args.command == "run-plan":
        return cmd_run_plan(args)
    elif args.command == "run-pilot":
        return cmd_run_pilot(args)
    elif args.command == "run-validation":
        return cmd_run_validation(args)
    elif args.command == "run":
        return cmd_run_single(args)
    elif args.command == "validate":
        return cmd_validate(args)
    elif args.command == "summary":
        return cmd_summary(args)
    return 0


if __name__ == "__main__":
    sys.exit(main())
