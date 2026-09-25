from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


# Supported initial faults in CausalOps prototype v1
SUPPORTED_FAULT_TYPES = {
    "NO_FAULT",
    "DB_LATENCY",
    "SERVICE_LATENCY",
    "SERVICE_FAILURE",
    "NETWORK_LATENCY",
    "ERROR_RATE",
}

# Fault types explicitly unsupported by the current microservice setup
UNSUPPORTED_FAULT_TYPES = {
    "CONNECTION_POOL_SATURATION": (
        "Connection pool saturation cannot currently be reproduced reliably "
        "without database connection exhaustion hooks in microservices."
    )
}

# Causal DAG propagation map (target -> expected affected upstream callers)
EXPECTED_AFFECTED_MAP: Dict[str, List[str]] = {
    "inventory-db": ["inventory-db", "inventory-service", "order-service", "api-gateway"],
    "inventory-service": ["inventory-service", "order-service", "api-gateway"],
    "order-service": ["order-service", "api-gateway"],
    "payment-service": ["payment-service", "order-service", "api-gateway"],
    "api-gateway": ["api-gateway"],
    "none": [],
}


def utc_now_iso() -> str:
    """Return current UTC time formatted as an ISO-8601 string."""
    return datetime.now(timezone.utc).isoformat()


def parse_iso(ts: str) -> datetime:
    """Parse an ISO-8601 timestamp string into an aware UTC datetime."""
    dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
    return dt.astimezone(timezone.utc)


class ExperimentRecord(BaseModel):
    """
    Schema for a machine-readable CausalOps experiment record.
    Ground truth is derived strictly from the deliberately injected fault target.
    """
    experiment_id: str = Field(..., description="Unique deterministic identifier e.g. E001")
    run_number: int = Field(default=1, description="Execution run index for this experiment")
    started_at: str = Field(..., description="UTC ISO-8601 timestamp when experiment began")
    fault_start_at: str = Field(..., description="UTC ISO-8601 timestamp when fault injection started")
    fault_end_at: str = Field(..., description="UTC ISO-8601 timestamp when fault was cleared")
    finished_at: str = Field(..., description="UTC ISO-8601 timestamp when experiment completed")

    fault_type: str = Field(..., description="Injected fault type e.g. DB_LATENCY or NO_FAULT")
    fault_target: Optional[str] = Field(default=None, description="Service or component targeted by the fault")
    fault_parameters: Dict[str, Any] = Field(default_factory=dict, description="Parameters used for injection")

    # Ground truth: MUST come from deliberately injected fault target, NOT the RCA system (None for NO_FAULT)
    ground_truth_root_cause: Optional[str] = Field(
        default=None,
        description="Target service from injected fault, or None for NO_FAULT control runs"
    )
    expected_affected_services: List[str] = Field(
        default_factory=list,
        description="List of services expected to be degraded based on topology"
    )

    baseline_status: str = Field(default="Operational", description="System health status prior to fault")
    incident_id: Optional[str] = Field(default=None, description="UUID of incident detected during experiment")
    detected_root_cause: Optional[str] = Field(default=None, description="Root cause identified by CausalOps RCA")
    detected_confidence: Optional[float] = Field(default=None, description="RCA confidence score (0.0 - 1.0)")
    rca_match: Optional[bool] = Field(
        default=None,
        description="Diagnostic comparison: detected_root_cause == ground_truth_root_cause"
    )

    telemetry_start: str = Field(..., description="Start of observation window")
    telemetry_end: str = Field(..., description="End of observation window")

    # Traffic rate control & execution telemetry
    traffic_rate_rps: int = Field(default=1, description="Configured start rate in requests/second")
    requests_started: int = Field(default=0, description="Total requests launched")
    requests_completed: int = Field(default=0, description="Total successful requests")
    requests_failed: int = Field(default=0, description="Total failed requests")
    observed_start_rate: float = Field(default=0.0, description="Measured launch rate in req/s")
    observed_completion_rate: float = Field(default=0.0, description="Measured completion rate in req/s")
    max_concurrent_requests: int = Field(default=0, description="Peak concurrent requests in flight")
    average_response_latency: float = Field(default=0.0, description="Average response latency in ms")
    p95_response_latency: float = Field(default=0.0, description="95th percentile response latency in ms")

    experiment_status: str = Field(
        default="SUCCESS",
        description="Final execution outcome: SUCCESS, FAILED, or UNSUPPORTED"
    )
    error_message: Optional[str] = Field(default=None, description="Error details if experiment failed")

    # Reproducibility metadata
    system_version: str = Field(default="v2-telemetry-upgrade", description="CausalOps release stage")
    git_commit: Optional[str] = Field(default=None, description="Git commit hash when experiment was run")

    @field_validator("experiment_id")
    @classmethod
    def validate_experiment_id(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("experiment_id cannot be empty")
        return v

    def validate_timestamps(self) -> None:
        """Verify all timestamps are valid ISO-8601 and correctly ordered."""
        t_start = parse_iso(self.started_at)
        t_f_start = parse_iso(self.fault_start_at)
        t_f_end = parse_iso(self.fault_end_at)
        t_finish = parse_iso(self.finished_at)

        if not (t_start <= t_f_start < t_f_end <= t_finish):
            raise ValueError(
                f"Timestamp sequence invalid: started_at ({self.started_at}) <= "
                f"fault_start_at ({self.fault_start_at}) < fault_end_at ({self.fault_end_at}) <= "
                f"finished_at ({self.finished_at})"
            )
