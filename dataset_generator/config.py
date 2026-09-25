import json
from pathlib import Path
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator, model_validator

from .schema import SUPPORTED_FAULT_TYPES, UNSUPPORTED_FAULT_TYPES


class ExperimentConfig(BaseModel):
    """
    Configuration specification for a single controlled fault injection experiment.
    """
    experiment_id: str = Field(..., description="Unique deterministic identifier e.g. E001")
    experiment_class: Optional[str] = Field(default=None, description="Experiment classification e.g. FAULT or CONTROL")
    replicate_number: Optional[int] = Field(default=1, description="Replicate index")
    fault_type: str = Field(..., description="Fault type name e.g. DB_LATENCY")
    target: str = Field(default="none", description="Target service/node e.g. inventory-db or none")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Fault-specific parameters")
    severity: str = Field(default="HIGH", description="Fault severity (LOW, MEDIUM, HIGH, CRITICAL)")

    duration_seconds: int = Field(default=25, description="Duration in seconds the fault remains active")
    pre_fault_seconds: int = Field(default=5, description="Pre-fault baseline observation duration")
    post_fault_seconds: int = Field(default=8, description="Post-fault recovery observation duration")

    traffic_rate_rps: int = Field(default=1, description="Configured start rate in requests/second (1, 5, or 15)")
    traffic_rate: Optional[str] = Field(default=None, description="Human readable traffic rate e.g. '5 req/s'")
    traffic_interval_seconds: Optional[float] = Field(default=None, description="Legacy interval between requests")

    @model_validator(mode="before")
    @classmethod
    def normalize_traffic_inputs(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "duration" in data and "duration_seconds" not in data:
                data["duration_seconds"] = int(data["duration"])
            if "traffic_rate" in data and "traffic_rate_rps" not in data:
                tr = str(data["traffic_rate"])
                digits = "".join(filter(str.isdigit, tr))
                if digits:
                    data["traffic_rate_rps"] = int(digits)
            elif "traffic_interval_seconds" in data and "traffic_rate_rps" not in data:
                interval = float(data["traffic_interval_seconds"])
                if interval <= 0.1:
                    data["traffic_rate_rps"] = 15
                elif interval <= 0.3:
                    data["traffic_rate_rps"] = 5
                else:
                    data["traffic_rate_rps"] = 1
        return data

    @field_validator("experiment_id")
    @classmethod
    def validate_id(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("experiment_id cannot be blank")
        return v

    @field_validator("duration_seconds")
    @classmethod
    def validate_duration(cls, v: int) -> int:
        if v < 5:
            raise ValueError("duration_seconds must be at least 5s to allow telemetry snapshot capture")
        return v

    @field_validator("traffic_rate_rps")
    @classmethod
    def validate_traffic_rate_rps(cls, v: int) -> int:
        if v not in (1, 5, 15):
            raise ValueError(f"traffic_rate_rps must be one of [1, 5, 15], got {v}")
        return v

    def is_supported(self) -> bool:
        return self.fault_type in SUPPORTED_FAULT_TYPES

    def unsupported_reason(self) -> str:
        return UNSUPPORTED_FAULT_TYPES.get(
            self.fault_type,
            f"Fault type '{self.fault_type}' is not recognized or supported by CausalOps v1."
        )


# 10 Pilot Experiments as requested in the specification
PILOT_EXPERIMENTS: List[ExperimentConfig] = [
    ExperimentConfig(
        experiment_id="E001",
        fault_type="DB_LATENCY",
        target="inventory-db",
        parameters={"latencyMs": 1200},
        severity="HIGH",
        duration_seconds=16,
        pre_fault_seconds=5,
        post_fault_seconds=8,
    ),
    ExperimentConfig(
        experiment_id="E002",
        fault_type="DB_LATENCY",
        target="inventory-db",
        parameters={"latencyMs": 1600},
        severity="HIGH",
        duration_seconds=16,
        pre_fault_seconds=5,
        post_fault_seconds=8,
    ),
    ExperimentConfig(
        experiment_id="E003",
        fault_type="SERVICE_LATENCY",
        target="order-service",
        parameters={"latencyMs": 850},
        severity="HIGH",
        duration_seconds=16,
        pre_fault_seconds=5,
        post_fault_seconds=8,
    ),
    ExperimentConfig(
        experiment_id="E004",
        fault_type="SERVICE_LATENCY",
        target="order-service",
        parameters={"latencyMs": 1100},
        severity="HIGH",
        duration_seconds=16,
        pre_fault_seconds=5,
        post_fault_seconds=8,
    ),
    ExperimentConfig(
        experiment_id="E005",
        fault_type="SERVICE_FAILURE",
        target="payment-service",
        parameters={},
        severity="HIGH",
        duration_seconds=16,
        pre_fault_seconds=5,
        post_fault_seconds=8,
    ),
    ExperimentConfig(
        experiment_id="E006",
        fault_type="SERVICE_FAILURE",
        target="payment-service",
        parameters={},
        severity="HIGH",
        duration_seconds=16,
        pre_fault_seconds=5,
        post_fault_seconds=8,
    ),
    ExperimentConfig(
        experiment_id="E007",
        fault_type="NETWORK_LATENCY",
        target="inventory-service",
        parameters={"latencyMs": 800},
        severity="HIGH",
        duration_seconds=16,
        pre_fault_seconds=5,
        post_fault_seconds=8,
    ),
    ExperimentConfig(
        experiment_id="E008",
        fault_type="NETWORK_LATENCY",
        target="payment-service",
        parameters={"latencyMs": 950},
        severity="HIGH",
        duration_seconds=16,
        pre_fault_seconds=5,
        post_fault_seconds=8,
    ),
    ExperimentConfig(
        experiment_id="E009",
        fault_type="ERROR_RATE",
        target="payment-service",
        parameters={"errorRate": 30},
        severity="HIGH",
        duration_seconds=16,
        pre_fault_seconds=5,
        post_fault_seconds=8,
    ),
    ExperimentConfig(
        experiment_id="E010",
        fault_type="ERROR_RATE",
        target="order-service",
        parameters={"errorRate": 25},
        severity="HIGH",
        duration_seconds=16,
        pre_fault_seconds=5,
        post_fault_seconds=8,
    ),
]

# 15 Validation Experiments for Dataset Generator v2 (10 faults + 5 controls)
VALIDATION_EXPERIMENTS: List[ExperimentConfig] = [
    # V001: DB_LATENCY on inventory-db (1200ms)
    ExperimentConfig(
        experiment_id="V001",
        fault_type="DB_LATENCY",
        target="inventory-db",
        parameters={"latencyMs": 1200},
        severity="HIGH",
        duration_seconds=26,
        pre_fault_seconds=5,
        post_fault_seconds=8,
    ),
    # V002: DB_LATENCY on inventory-db (1800ms)
    ExperimentConfig(
        experiment_id="V002",
        fault_type="DB_LATENCY",
        target="inventory-db",
        parameters={"latencyMs": 1800},
        severity="HIGH",
        duration_seconds=26,
        pre_fault_seconds=5,
        post_fault_seconds=8,
    ),
    # V003: SERVICE_LATENCY on order-service (850ms)
    ExperimentConfig(
        experiment_id="V003",
        fault_type="SERVICE_LATENCY",
        target="order-service",
        parameters={"latencyMs": 850},
        severity="HIGH",
        duration_seconds=26,
        pre_fault_seconds=5,
        post_fault_seconds=8,
    ),
    # V004: SERVICE_LATENCY on order-service (1200ms)
    ExperimentConfig(
        experiment_id="V004",
        fault_type="SERVICE_LATENCY",
        target="order-service",
        parameters={"latencyMs": 1200},
        severity="HIGH",
        duration_seconds=26,
        pre_fault_seconds=5,
        post_fault_seconds=8,
    ),
    # V005: SERVICE_FAILURE on payment-service
    ExperimentConfig(
        experiment_id="V005",
        fault_type="SERVICE_FAILURE",
        target="payment-service",
        parameters={},
        severity="HIGH",
        duration_seconds=26,
        pre_fault_seconds=5,
        post_fault_seconds=8,
    ),
    # V006: SERVICE_FAILURE on payment-service
    ExperimentConfig(
        experiment_id="V006",
        fault_type="SERVICE_FAILURE",
        target="payment-service",
        parameters={},
        severity="HIGH",
        duration_seconds=26,
        pre_fault_seconds=5,
        post_fault_seconds=8,
    ),
    # V007: NETWORK_LATENCY on inventory-service (800ms)
    ExperimentConfig(
        experiment_id="V007",
        fault_type="NETWORK_LATENCY",
        target="inventory-service",
        parameters={"latencyMs": 800},
        severity="HIGH",
        duration_seconds=26,
        pre_fault_seconds=5,
        post_fault_seconds=8,
    ),
    # V008: NETWORK_LATENCY on inventory-service (1100ms)
    ExperimentConfig(
        experiment_id="V008",
        fault_type="NETWORK_LATENCY",
        target="inventory-service",
        parameters={"latencyMs": 1100},
        severity="HIGH",
        duration_seconds=26,
        pre_fault_seconds=5,
        post_fault_seconds=8,
    ),
    # V009: ERROR_RATE on payment-service (30%)
    ExperimentConfig(
        experiment_id="V009",
        fault_type="ERROR_RATE",
        target="payment-service",
        parameters={"errorRate": 30},
        severity="HIGH",
        duration_seconds=26,
        pre_fault_seconds=5,
        post_fault_seconds=8,
    ),
    # V010: ERROR_RATE on order-service (25%)
    ExperimentConfig(
        experiment_id="V010",
        fault_type="ERROR_RATE",
        target="order-service",
        parameters={"errorRate": 25},
        severity="HIGH",
        duration_seconds=26,
        pre_fault_seconds=5,
        post_fault_seconds=8,
    ),
    # C001 - C005: Clean NO_FAULT negative control experiments
    ExperimentConfig(
        experiment_id="C001",
        fault_type="NO_FAULT",
        target="none",
        parameters={},
        severity="LOW",
        duration_seconds=25,
        pre_fault_seconds=4,
        post_fault_seconds=4,
    ),
    ExperimentConfig(
        experiment_id="C002",
        fault_type="NO_FAULT",
        target="none",
        parameters={},
        severity="LOW",
        duration_seconds=25,
        pre_fault_seconds=4,
        post_fault_seconds=4,
    ),
    ExperimentConfig(
        experiment_id="C003",
        fault_type="NO_FAULT",
        target="none",
        parameters={},
        severity="LOW",
        duration_seconds=25,
        pre_fault_seconds=4,
        post_fault_seconds=4,
    ),
    ExperimentConfig(
        experiment_id="C004",
        fault_type="NO_FAULT",
        target="none",
        parameters={},
        severity="LOW",
        duration_seconds=25,
        pre_fault_seconds=4,
        post_fault_seconds=4,
    ),
    ExperimentConfig(
        experiment_id="C005",
        fault_type="NO_FAULT",
        target="none",
        parameters={},
        severity="LOW",
        duration_seconds=25,
        pre_fault_seconds=4,
        post_fault_seconds=4,
    ),
]


def load_experiment_configs(file_path: Path) -> List[ExperimentConfig]:
    """Load and validate experiment configurations from a JSON file."""
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, dict):
        if "planned_experiments" in data:
            data = data["planned_experiments"]
        elif "experiments" in data:
            data = data["experiments"]
    if not isinstance(data, list):
        raise ValueError("Experiment configuration file must contain a list of experiment specifications.")
    return [ExperimentConfig(**item) for item in data]
