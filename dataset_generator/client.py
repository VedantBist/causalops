import json
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Dict, List, Optional


class CausalOpsClient:
    """
    HTTP client for interacting with CausalOps API and the live microservice gateway.
    Operates strictly against the local Docker Compose environment.
    """
    def __init__(
        self,
        api_base: str = "http://localhost:8080/api",
        gateway_base: str = "http://localhost:8081",
        timeout: float = 8.0,
    ):
        self.api_base = api_base.rstrip("/")
        self.gateway_base = gateway_base.rstrip("/")
        self.timeout = timeout

    def _request(
        self,
        method: str,
        url: str,
        body: Optional[Dict[str, Any]] = None,
        expected_status: tuple = (200, 201, 204),
    ) -> Any:
        data = json.dumps(body).encode("utf-8") if body is not None else None
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            method=method,
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                status = resp.status
                if status not in expected_status:
                    raise RuntimeError(f"Unexpected HTTP {status} from {url}")
                raw = resp.read().decode("utf-8")
                return json.loads(raw) if raw else None
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"HTTP {e.code} from {url}: {err_body}") from e
        except urllib.error.URLError as e:
            raise ConnectionError(f"Connection failed for {url}: {e.reason}") from e

    # ─── API Endpoints ────────────────────────────────────────────────────────

    def get_actuator_health(self) -> Dict[str, Any]:
        url = self.api_base.replace("/api", "/actuator/health")
        return self._request("GET", url)

    def get_overview(self) -> Dict[str, Any]:
        return self._request("GET", f"{self.api_base}/overview")

    def get_services(self) -> List[Dict[str, Any]]:
        return self._request("GET", f"{self.api_base}/services")

    def get_topology(self) -> Dict[str, Any]:
        return self._request("GET", f"{self.api_base}/topology")

    def inject_fault(
        self,
        fault_type: str,
        target: str,
        severity: str = "HIGH",
        duration_seconds: int = 30,
        parameters: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        payload = {
            "type": fault_type,
            "target": target,
            "severity": severity,
            "durationSeconds": duration_seconds,
            "parameters": parameters or {},
        }
        return self._request("POST", f"{self.api_base}/faults", body=payload, expected_status=(200, 201))

    def stop_fault(self, fault_id: str) -> None:
        self._request("POST", f"{self.api_base}/faults/{fault_id}/stop", body={})

    def clear_faults(self) -> None:
        self._request("POST", f"{self.api_base}/faults/clear", body={})

    def get_active_incidents(self) -> List[Dict[str, Any]]:
        return self._request("GET", f"{self.api_base}/incidents/active")

    def get_incident_history(self) -> List[Dict[str, Any]]:
        return self._request("GET", f"{self.api_base}/incidents/history")

    def get_incident_rca(self, incident_id: str) -> Dict[str, Any]:
        return self._request("GET", f"{self.api_base}/incidents/{incident_id}/root-cause")

    def get_predictions(self) -> List[Dict[str, Any]]:
        return self._request("GET", f"{self.api_base}/predictions")

    def get_metrics(self, service: Optional[str] = None) -> Dict[str, Any]:
        url = f"{self.api_base}/metrics"
        if service:
            url += f"?service={urllib.parse.quote(service)}"
        return self._request("GET", url)

    # ─── Live Microservice Traffic ────────────────────────────────────────────

    def send_order_traffic(self) -> Dict[str, Any]:
        """
        Sends an order request to api-gateway, exercising the entire microservice chain:
        api-gateway -> order-service -> inventory-service & payment-service.
        """
        url = f"{self.gateway_base}/orders/demo"
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                raw = resp.read().decode("utf-8")
                return {
                    "status_code": resp.status,
                    "body": json.loads(raw) if raw else {},
                    "success": resp.status == 200,
                }
        except urllib.error.HTTPError as e:
            raw = e.read().decode("utf-8", errors="replace")
            return {
                "status_code": e.code,
                "body": raw,
                "success": False,
            }
        except Exception as e:
            return {
                "status_code": 0,
                "body": str(e),
                "success": False,
            }

    @staticmethod
    def get_git_commit() -> Optional[str]:
        """Return the current Git commit hash if in a git repository."""
        try:
            out = subprocess.check_output(
                ["git", "rev-parse", "HEAD"],
                stderr=subprocess.DEVNULL,
                timeout=2.0,
            )
            return out.decode("utf-8").strip()
        except Exception:
            return None
