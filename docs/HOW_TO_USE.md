# How to Use CausalOps: Complete Beginner's Guide

Welcome to **CausalOps**! This guide is written for anyone seeing CausalOps for the first time. You do not need any prior background in cloud infrastructure, machine learning, or microservice operations.

---

## 1. What is CausalOps?

In modern cloud software, an application is rarely a single program. Instead, it is built from several small, cooperating programs called **microservices**. Each microservice has one specific job (for example: handling user logins, processing payments, or checking inventory).

These microservices talk to one another in a chain:

```
API Gateway (the front door)
    ↓
Order Service (creates customer orders)
    ↓
Inventory Service (checks product stock)
    ↓
Inventory Database (stores inventory tables)
```

### The Problem
When a database at the bottom of the chain slows down, the slowness ripples upward:

```
Inventory Database slows down
    ↓
Inventory Service waits for the database and slows down
    ↓
Order Service waits for the inventory service and slows down
    ↓
API Gateway waits for the order service and slows down
    ↓
The user sees an error or a spinning loading spinner
```

A standard monitoring tool will ring an alarm and say:
> *"API Gateway latency is high! Alert!"*

This is frustrating for engineers because the API Gateway did nothing wrong. It is just the victim of a bottleneck deeper in the system.

### How CausalOps Helps
CausalOps watches the telemetry (metrics like latency and error rates) from every service in real time. When an incident occurs, CausalOps analyzes the timing and dependency structure to answer:
> *"Why is the API Gateway slow? The originating root cause is the **Inventory Database**."*

---

## 2. Project Architecture

The CausalOps platform consists of two distinct parts:
1. **The Monitored Application** — the microservices processing customer requests.
2. **The CausalOps Platform** — the monitoring, incident detection, root cause analysis (RCA), and user interface.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CAUSALOPS CONTROL PLANE                         │
│                                                                        │
│   Web Browser (Port 3000)                                              │
│       ↓                                                                │
│   Spring Boot CausalOps API (Port 8080)                                │
│       ├── PostgreSQL Database (Port 5432)                              │
│       └── Python FastAPI AI Engine (Port 8000)                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Collects Telemetry & Injects Faults
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        MONITORED MICROSERVICES                         │
│                                                                        │
│   API Gateway (Port 8081)                                              │
│       ↓                                                                │
│   Order Service (Internal)                                             │
│       ├── Inventory Service (Internal) → Inventory DB (Internal)       │
│       └── Payment Service (Internal)                                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Emits Metrics, Logs & Traces
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       OBSERVABILITY INFRASTRUCTURE                     │
│                                                                        │
│   OpenTelemetry Collector (Ports 4317/4318)                            │
│   Prometheus (Port 9090) · Grafana Loki (Port 3100) · Tempo (Port 3200)│
└────────────────────────────────────────────────────────────────────────┘
```

### Component Roles
* **Frontend (`localhost:3000`)**: A web dashboard built with React 19 and Tailwind CSS that shows service health, live topology graphs, active incidents, root cause attribution, failure risk predictions, and counterfactual simulations.
* **CausalOps API (`localhost:8080`)**: A Java Spring Boot application that orchestrates background telemetry collection every 1 second, creates incidents when anomalies exceed thresholds, runs baseline heuristic root cause analysis, and provides REST APIs to the frontend.
* **PostgreSQL (`localhost:5432`)**: Stores services, topology edges, historical telemetry samples, opened incidents, RCA results, and simulations.
* **Python AI Engine (`localhost:8000`)**: A FastAPI microservice that computes graph-based propagation scoring, predictive risk probability, and counterfactual intervention estimates.
* **Monitored Services (`api-gateway`, `order-service`, `inventory-service`, `payment-service`, `inventory-db`)**: Real Java services communicating over HTTP that simulate an e-commerce order workflow.
* **Prometheus, Loki, Tempo, OpenTelemetry Collector**: Industry-standard open-source observability tools that scrape metrics, gather logs, and track distributed traces across the microservices.

---

## 3. Prerequisites

To run CausalOps on your computer, you need:

| Requirement | Minimum Version | How to Verify |
| :--- | :--- | :--- |
| **Git** | 2.30+ | Run `git --version` |
| **Docker & Docker Compose** | Docker Desktop 24+ / Compose v2 | Run `docker --version` and `docker compose version` |
| **Node.js & npm** | Node 18+ / npm 9+ | Run `node -v` and `npm -v` |
| **Python** | 3.10+ | Run `python3 --version` |
| **Java JDK** (optional for local edits) | Java 21 | Run `java -version` |

---

## 4. Starting the Platform

Open your terminal and follow these exact steps:

### Step 1: Navigate to the repository
```bash
cd causalops
```

### Step 2: Start the Docker containers
Start all 11 backend, microservice, database, and observability containers:
```bash
docker compose up -d
```

### Step 3: Verify running containers
Run:
```bash
docker ps
```
You should see 11 containers with status `Up`:
- `causalops-causalops-api-1` (Port 8080)
- `causalops-ai-engine-1` (Port 8000)
- `causalops-api-gateway-1` (Port 8081)
- `causalops-order-service-1`
- `causalops-inventory-service-1`
- `causalops-payment-service-1`
- `causalops-postgres-1` (Port 5432)
- `causalops-prometheus-1` (Port 9090)
- `causalops-loki-1` (Port 3100)
- `causalops-tempo-1` (Port 3200)
- `causalops-otel-collector-1` (Ports 4317/4318)

### Step 4: Start the web frontend
In the project root directory, run:
```bash
npm run dev
```
You will see output indicating that the Vite development server is ready:
```
  VITE v8.3.1  ready in 240 ms

  ➜  Local:   http://localhost:3000/
```

Keep this terminal open while using the application.

---

## 5. Check That Everything is Healthy

Open a second terminal window and run these quick checks:

### 1. Check the CausalOps API health
```bash
curl -s http://localhost:8080/actuator/health
```
**Expected output**:
```json
{"status":"UP"}
```

### 2. Check the AI Engine health
```bash
curl -s http://localhost:8000/health
```
**Expected output**:
```json
{"status":"healthy"}
```

### 3. Check the microservice traffic
Send one test order request through the API Gateway:
```bash
curl -s http://localhost:8081/orders/demo
```
**Expected output**:
```json
{"id":"demo","inventory":{"available":100,"sku":"sku-demo"},"payment":{"paymentId":"...","status":"AUTHORIZED"}}
```
Status code `200` confirms that the entire microservice chain (`api-gateway` → `order-service` → `inventory-service` & `payment-service`) is working properly.

---

## 6. Open the Frontend

Open your web browser and go to:
**`http://localhost:3000`**

### Navigation Areas
The top navigation bar provides access to each operational workspace:
1. **Overview**: The Command Center showing overall system health status (`Operational` or `Degraded`), active incidents banner, fleet summary cards, and live topology.
2. **Topology**: An interactive 3D and 2D dependency graph of all services showing call directions and health states.
3. **Incidents**: The investigation console showing currently active incidents, severity badges (`CRITICAL`, `HIGH`), and time since open.
4. **Root Cause**: The causal attribution view showing the detected root cause, confidence percentage, and ranked candidate services.
5. **Predictions**: Failure risk predictions estimating which downstream services are likely to fail next and estimated time to failure ($T+\text{minutes}$).
6. **Simulation**: Counterfactual simulation sandbox that answers *"What if we intervene?"* by estimating recovery latency deltas.
7. **Services**: Service fleet catalog with P99 latency, error rates, and throughput.
8. **Metrics / Logs / Traces**: Deep-dive observability views backed by Prometheus, Loki, and Tempo.

---

## 7. First Demo: Healthy System Walkthrough

Follow these steps for a baseline demonstration:

1. Open **`http://localhost:3000`**.
2. Point out the top status badge: it displays **`OPERATIONAL`** with a green dot.
3. Click **Topology** in the navigation bar.
4. Explain what is on screen:
   > *"Here we see our e-commerce architecture. External requests enter through the API Gateway, flow to the Order Service, which then calls both the Inventory Service and Payment Service in parallel. Inventory Service depends on the Inventory Database."*
5. Notice that all 5 nodes are green (`healthy`), indicating normal response times under 50ms and 0% error rates.

---

## 8. Main Demo: Inject a Database Latency Failure

This is the primary demonstration showing CausalOps detecting, isolating, and explaining a failure in real time.

### Step 1: Inject a 1,200ms latency into `inventory-db`
In your terminal, run this command:
```bash
curl -X POST http://localhost:8080/api/faults \
  -H "Content-Type: application/json" \
  -d '{"type":"DB_LATENCY","target":"inventory-db","severity":"HIGH","durationSeconds":60,"parameters":{"latencyMs":1200}}'
```
**Response**: `HTTP 201 Created`

### Step 2: Generate requests to propagate the slowness
Send traffic to the API Gateway to exercise the database:
```bash
for i in {1..10}; do curl -s http://localhost:8081/orders/demo > /dev/null; sleep 1; done
```
You will notice each order now takes over 1.2 seconds to finish.

### Step 3: Observe CausalOps in the browser
1. Look at the **Overview** page:
   - System status switches to **`DEGRADED`**.
   - An incident card appears: **`INC-8910: Multi-service degradation detected`**.
2. Click **Root Cause**:
   - The Root Cause card displays: **`inventory-db`** with confidence **70%+**.
   - CausalOps explains the chain:
     * `inventory-db` elevated latency ($>1200\text{ms}$)
     * `inventory-service` degraded ($+850\text{ms}$)
     * `order-service` degraded ($+900\text{ms}$)
     * `api-gateway` degraded ($+1100\text{ms}$)
3. Click **Predictions**:
   - Displays predictive failure risk: `order-service` and `api-gateway` show `ELEVATED` risk with an estimated failure horizon.
4. Click **Simulation**:
   - Select the **"Reduce Database Latency by 70%"** intervention.
   - Click **Run Simulation**.
   - The counterfactual engine calculates expected recovery: `inventory-service` latency drops from $55\text{ms} \to 31\text{ms}$, and `order-service` drops from $80\text{ms} \to 58\text{ms}$.

### Step 4: Clear the fault and observe recovery
In your terminal, clear the fault:
```bash
curl -X POST http://localhost:8080/api/faults/clear
```
**Response**: `HTTP 204 No Content`

Wait 10 seconds. Return to the browser:
* Microservice response times drop back to $\approx 15\text{ms}$.
* The system status returns to **`OPERATIONAL`**.

---

## 9. What the Demo is Actually Proving

The demonstration proves a complete operational closed-loop:

```
DELIBERATE FAULT INJECTION (1200ms DB latency)
           ↓
REAL TELEMETRY RECORDED (1-second intervals via Prometheus & API)
           ↓
STATISTICAL ANOMALY DETECTION (latency exceeds 20% deviation threshold)
           ↓
INCIDENT AUTO-GENERATION (INC-8910 created in PostgreSQL)
           ↓
GRAPH-BASED ROOT CAUSE ATTRIBUTION (correctly identifies inventory-db)
           ↓
PREDICTION (downstream risk calculated for order-service)
           ↓
COUNTERFACTUAL SIMULATION (predicts recovery before intervention)
           ↓
FAULT CLEARED & AUTOMATIC FLEET RECOVERY
```

### Honest Technical Disclosure
* **What is working today**: The baseline RCA algorithm uses topological graph traversal, anomaly propagation scoring, and timestamp precedence.
* **What is research / future work**: In upcoming phases, this heuristic baseline will be replaced by a trained **Temporal Graph Neural Network (Temporal GNN)** and observational causal discovery models.

---

## 10. Supported Fault Types

CausalOps supports 5 controlled fault types across 4 microservice targets:

| Fault Type | Plain English Explanation | Supported Targets | Observable Effect |
| :--- | :--- | :--- | :--- |
| **`DB_LATENCY`** | Deliberately slows down database query execution | `inventory-db` | Database latency jumps to configured milliseconds; inventory and order services slow down. |
| **`SERVICE_LATENCY`** | Injects artificial sleep into internal HTTP handlers | `order-service`, `inventory-service`, `payment-service` | Target service P99 latency spikes; upstream callers wait. |
| **`NETWORK_LATENCY`** | Simulates packet delays on inter-service HTTP calls | `order-service`, `inventory-service`, `payment-service` | Simulates slow network links between microservices. |
| **`ERROR_RATE`** | Causes a service to return HTTP 500 Internal Server Error for a percentage of requests | `order-service`, `inventory-service`, `payment-service` | Service error rate climbs; upstream callers log transaction failures. |
| **`SERVICE_FAILURE`** | Complete service outage (all requests fail) | `payment-service`, `inventory-service`, `order-service` | 100% request failure on target; orders fail immediately. |

*Note: `api-gateway` is excluded from root-cause fault injection because isolated edge gateway latency does not generate downstream multi-service cascades.*

---

## 11. Dataset Experiments & Empirical Results

The repository includes a reproducible experiment generator that injects controlled faults, captures synchronous 1-second telemetry, and validates baseline RCA against known ground truth.

### The 80-Experiment Dataset Plan
The dataset contains **80 controlled experiments**:
- **10 `NO_FAULT` Controls**: 0% false-positive incident rate.
- **18 `inventory-db` experiments**: Latency sweeps from 200ms to 2,500ms across 1, 5, and 15 req/s.
- **17 `inventory-service` experiments**: Latency and error rate sweeps.
- **17 `order-service` experiments**: Latency, network, and error rate sweeps.
- **18 `payment-service` experiments**: Failure, network, and latency sweeps.

### Measured Empirical Results
Across all 80 experiments:
* **80 / 80 Completed Successfully** (100% completion rate).
* **15,745 Synchronous Telemetry Snapshots** captured with **0.00ms timestamp spread**.
* **Zero Request Rate Collapse**: Under 15 req/s with 1,500ms slow faults, launch rate remained 15.01 req/s while concurrency scaled up to 19 requests in flight.
* **Heuristic RCA Baseline Accuracy**: **84.29% exact match** (59 / 70 fault runs).
  * `inventory-db`: **100%** (18/18)
  * `inventory-service`: **100%** (17/17)
  * `order-service`: **100%** (17/17)
  * `payment-service`: **38.89%** (7/18) — demonstrating where rule-based heuristics fail when downstream leaf anomalies are eclipsed by upstream caller errors.

---

## 12. How to Run Dataset Experiments

You can reproduce or inspect dataset runs using the built-in CLI:

### 1. View the dataset summary
```bash
python3 -m dataset_generator.cli summary --dataset-dir dataset
```

### 2. Validate dataset integrity
Checks timestamp monotonicity, ground-truth label consistency, and JSON artifact completeness:
```bash
python3 -m dataset_generator.cli validate --dataset-dir dataset
```

### 3. Run a quick pilot suite (10 experiments)
```bash
python3 -m dataset_generator.cli run-pilot --dataset-dir dataset
```

### 4. Run a single custom experiment
```bash
python3 -m dataset_generator.cli run \
  --id EXP-TEST \
  --type DB_LATENCY \
  --target inventory-db \
  --params '{"latencyMs":1500}' \
  --duration 25
```

---

## 13. Troubleshooting

| Symptom | Probable Cause | Action |
| :--- | :--- | :--- |
| **Frontend will not open (`http://localhost:3000`)** | Dev server is stopped | Run `npm run dev` in the `causalops` directory. |
| **Frontend displays "Backend unavailable"** | Docker containers stopped or initializing | Run `docker ps` to verify all containers are up. Run `curl http://localhost:8080/actuator/health`. |
| **No incident is created during a fault** | Traffic was not sent during the fault | Run `curl http://localhost:8081/orders/demo` multiple times while the fault is active. |
| **Microservice returns HTTP 500 after test** | Active fault was not cleared | Run `curl -X POST http://localhost:8080/api/faults/clear`. |
| **Port conflict (e.g. port 8080 or 3000 in use)** | Another process is bound to the port | Check listening ports with `lsof -i :8080` or `lsof -i :3000` and stop the conflicting process. |

---

## 14. Resetting the Demo

To return the system to a clean baseline after a demonstration:

1. **Clear any active faults**:
   ```bash
   curl -X POST http://localhost:8080/api/faults/clear
   ```
2. **Verify microservices are healthy**:
   ```bash
   curl -s http://localhost:8081/orders/demo
   ```
3. **Check fleet status**:
   ```bash
   curl -s http://localhost:8080/api/services
   ```
   All 5 services should report `"status": "healthy"`.

---

## 15. 5-Minute Evaluation Demo Script

Follow this script during your evaluation:

* **00:00 — Overview (What to Show)**:
  Open `http://localhost:3000`. Point out the `OPERATIONAL` status badge and the 5 healthy services.
  * *Say*: *"CausalOps is an operations platform that observes connected cloud microservices and automatically determines the root cause of service disruptions."*
* **01:00 — Topology (What to Show)**:
  Click **Topology**. Show the 3D/2D call graph: API Gateway $\to$ Order $\to$ Inventory $\to$ DB.
  * *Say*: *"Here is our live service topology. Notice how an issue in the database could propagate upward to the API Gateway."*
* **01:45 — Inject Fault (What to Do)**:
  In terminal, run:
  ```bash
  curl -X POST http://localhost:8080/api/faults -H "Content-Type: application/json" -d '{"type":"DB_LATENCY","target":"inventory-db","severity":"HIGH","durationSeconds":45,"parameters":{"latencyMs":1500}}'
  for i in {1..8}; do curl -s http://localhost:8081/orders/demo > /dev/null; sleep 1; done
  ```
* **02:30 — Incident & Root Cause (What to Show)**:
  Click **Incidents**, then click **Root Cause**.
  * *Say*: *"Notice that even though the API Gateway and Order Service slowed down, CausalOps analyzed the propagation cascade and correctly isolated the Inventory Database as the root cause with high confidence."*
* **03:30 — Prediction & Counterfactual Simulation (What to Show)**:
  Click **Simulation**, select the 70% latency reduction intervention, and click **Run Simulation**.
  * *Say*: *"The counterfactual simulation engine estimates the impact of potential remediation steps before engineers touch production systems."*
* **04:30 — Recovery (What to Do)**:
  In terminal, run:
  ```bash
  curl -X POST http://localhost:8080/api/faults/clear
  ```
  Refresh the browser to show the incident resolving and status returning to `OPERATIONAL`.
  * *Say*: *"The fault is cleared, and the fleet automatically recovers to normal baseline latency."*

---

## 16. What is Real vs Future Work

| Capability | Current Prototype Status | Future Work (Next Phase) |
| :--- | :--- | :--- |
| **Monitored Architecture** | Real Java Spring Boot microservices in Docker | Kubernetes (K8s) deployment |
| **Telemetry Collection** | Real 1-second synchronous snapshots via Prometheus | High-volume streaming via Kafka |
| **Fault Injection** | Real controlled latency, error, and failure injection | Chaos Mesh / automated random perturbations |
| **Incident Lifecycle** | Real anomaly detection and incident records in PostgreSQL | Integration with PagerDuty / Slack alerts |
| **Root Cause Analysis** | Working heuristic baseline (84.29% accuracy on 80 runs) | Trained Temporal Graph Neural Networks (Temporal GNN) |
| **Causal Discovery** | Ground-truth topological directed graph | Automated observational causal structure learning (PC/FCI/NOTEARS) |
| **Counterfactual Simulation**| Working dependency attenuation heuristic | Structural Causal Models (Do-calculus interventions) |

---

## 17. Evaluator Questions & Answers

### Q: "What problem does CausalOps solve?"
**A**: When a cloud service fails, upstream services degrade in sympathy. Traditional monitoring tells you *that* something is slow, but floods engineers with dozens of simultaneous alerts. CausalOps identifies *which service started the problem*.

### Q: "Why not just use Grafana?"
**A**: Grafana displays raw metrics on dashboards. An engineer still has to manually inspect 20 graphs to guess the root cause. CausalOps performs automated algorithmic analysis on the dependency graph to isolate the true root cause.

### Q: "Is this currently using a deep neural network?"
**A**: Not yet. The current prototype establishes an honest **heuristic and statistical baseline** that achieves 84.29% accuracy. This baseline provides the exact benchmark against which our upcoming Temporal GNN models will be measured.

### Q: "How do you know the ground truth?"
**A**: We use **controlled fault injection**. Because our experiment framework deliberately injected the 1,500ms delay into `inventory-db`, we know with 100% certainty that `inventory-db` is the ground-truth root cause.

### Q: "Where did the 80-experiment dataset come from?"
**A**: It was generated systematically by running controlled experiments against the live microservices across 5 fault types, 4 target services, and 3 traffic rates (1, 5, 15 req/s), recording 15,745 telemetry snapshots.

### Q: "What is the primary current limitation?"
**A**: When a downstream leaf service like `payment-service` fails, the calling service (`order-service`) also exhibits high error rates. The rule-based heuristic sometimes misattributes the root cause to `order-service`. This failure mode justifies our transition to machine learning and graph neural networks.
