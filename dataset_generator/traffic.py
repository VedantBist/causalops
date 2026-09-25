import logging
import math
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional

logger = logging.getLogger("traffic_generator")


def compute_percentile(values: List[float], p: float) -> float:
    """Computes p-th percentile with linear interpolation using standard library math."""
    if not values:
        return 0.0
    s = sorted(values)
    k = (len(s) - 1) * (p / 100.0)
    f = math.floor(k)
    c = math.ceil(k)
    if f == c:
        return round(s[int(k)], 2)
    d0 = s[int(f)] * (c - k)
    d1 = s[int(c)] * (k - f)
    return round(d0 + d1, 2)


@dataclass
class TrafficMetrics:
    rate_rps: int
    duration_seconds: float = 0.0
    requests_started: int = 0
    requests_completed: int = 0
    requests_failed: int = 0
    observed_start_rate: float = 0.0
    observed_completion_rate: float = 0.0
    max_concurrent_requests: int = 0
    average_response_latency: float = 0.0
    p95_response_latency: float = 0.0
    latencies: List[float] = field(default_factory=list)


class TrafficGenerator:
    """
    Deterministic rate-controlled synthetic traffic generator.
    Maintains constant request start rate R (1, 5, or 15 req/s) independently of individual response latency.
    """
    def __init__(
        self,
        request_fn: Callable[[], Any],
        rate_rps: int = 1,
        max_workers: Optional[int] = None,
    ):
        if rate_rps not in (1, 5, 15):
            raise ValueError(f"Unsupported traffic rate: {rate_rps}. Must be one of [1, 5, 15] req/s.")

        self.request_fn = request_fn
        self.rate_rps = rate_rps
        # Pool size: sufficient to handle high concurrency during slow responses (e.g. 15 rps * 3.5s = ~53 threads)
        self.max_workers = max_workers or max(15, rate_rps * 4)
        self.executor: Optional[ThreadPoolExecutor] = None
        self.scheduler_thread: Optional[threading.Thread] = None
        self.stop_event = threading.Event()
        self.lock = threading.Lock()
        self._stopped_metrics: Optional[TrafficMetrics] = None

        # Telemetry counters
        self.start_time: float = 0.0
        self.end_time: float = 0.0
        self.requests_started: int = 0
        self.requests_completed: int = 0
        self.requests_failed: int = 0
        self.current_in_flight: int = 0
        self.max_concurrent_requests: int = 0
        self.latencies: List[float] = []

    def start(self) -> None:
        """Starts the thread pool and fixed-rate request scheduler."""
        self.stop_event.clear()
        self.executor = ThreadPoolExecutor(
            max_workers=self.max_workers,
            thread_name_prefix="TrafficWorker"
        )
        self.start_time = time.monotonic()
        self.scheduler_thread = threading.Thread(
            target=self._scheduler_loop,
            daemon=True,
            name="TrafficScheduler"
        )
        self.scheduler_thread.start()

    def _scheduler_loop(self) -> None:
        """
        Emits requests at a deterministic rate R (1 start every 1.0/R seconds).
        Uses drift-corrected monotonic clocks so response latency does NOT delay dispatch.
        """
        interval = 1.0 / self.rate_rps
        next_tick = time.monotonic()

        while not self.stop_event.is_set():
            now = time.monotonic()
            delay = next_tick - now
            if delay > 0:
                if self.stop_event.wait(timeout=delay):
                    break

            if self.stop_event.is_set():
                break

            # Dispatch request to worker pool without blocking the scheduler
            try:
                if self.executor and not self.stop_event.is_set():
                    self.executor.submit(self._execute_single_request)
            except RuntimeError:
                # Executor shutting down
                break

            next_tick += interval
            # If scheduler fell significantly behind, resynchronize to avoid burst storms
            if time.monotonic() - next_tick > interval * 5:
                next_tick = time.monotonic()

    def _execute_single_request(self) -> None:
        """Runs one HTTP request in a worker thread and tracks execution metrics."""
        with self.lock:
            self.requests_started += 1
            self.current_in_flight += 1
            if self.current_in_flight > self.max_concurrent_requests:
                self.max_concurrent_requests = self.current_in_flight

        t0 = time.monotonic()
        success = False
        duration_ms = 0.0
        try:
            res = self.request_fn()
            duration_ms = (time.monotonic() - t0) * 1000.0
            if isinstance(res, dict):
                success = res.get("success", True)
            else:
                success = True
        except Exception as e:
            duration_ms = (time.monotonic() - t0) * 1000.0
            success = False
            logger.debug(f"Traffic request error: {e}")
        finally:
            with self.lock:
                self.current_in_flight -= 1
                if success:
                    self.requests_completed += 1
                else:
                    self.requests_failed += 1
                self.latencies.append(duration_ms)

    def stop(self, timeout: float = 3.0) -> TrafficMetrics:
        """
        Stops request scheduling, waits gracefully for in-flight requests,
        and returns complete traffic metrics. Idempotent across multiple invocations.
        """
        if self._stopped_metrics is not None:
            return self._stopped_metrics

        self.stop_event.set()
        if self.scheduler_thread and self.scheduler_thread.is_alive():
            self.scheduler_thread.join(timeout=1.0)
        scheduler_stop_time = time.monotonic()
        active_duration = max(0.001, scheduler_stop_time - self.start_time)

        # Allow running in-flight workers to complete up to timeout
        deadline = time.monotonic() + timeout
        while self.current_in_flight > 0 and time.monotonic() < deadline:
            time.sleep(0.01)

        if self.executor:
            # Cancel unstarted queued tasks
            self.executor.shutdown(wait=False, cancel_futures=True)

        self.end_time = time.monotonic()
        total_duration = max(0.001, self.end_time - self.start_time)

        with self.lock:
            avg_lat = round(sum(self.latencies) / len(self.latencies), 2) if self.latencies else 0.0
            p95_lat = compute_percentile(self.latencies, 95.0)
            obs_start_rate = round(self.requests_started / active_duration, 2)
            obs_comp_rate = round(self.requests_completed / total_duration, 2)

            self._stopped_metrics = TrafficMetrics(
                rate_rps=self.rate_rps,
                duration_seconds=round(active_duration, 3),
                requests_started=self.requests_started,
                requests_completed=self.requests_completed,
                requests_failed=self.requests_failed,
                observed_start_rate=obs_start_rate,
                observed_completion_rate=obs_comp_rate,
                max_concurrent_requests=self.max_concurrent_requests,
                average_response_latency=avg_lat,
                p95_response_latency=p95_lat,
                latencies=list(self.latencies),
            )
            return self._stopped_metrics
