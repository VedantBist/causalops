# Architecture

```mermaid
flowchart LR
 UI[Existing Vite UI] --> API[Spring Boot API]
 API --> PG[(PostgreSQL)]
 API --> AI[FastAPI analytics]
 GW --> ORD --> INV --> DB[(inventory-db)]
 ORD --> PAY
```

RCA ranks normalized anomaly (30%), temporal precedence (25%), dependency reach (20%), propagation consistency (15%), and metric correlation (10%). It is a transparent heuristic, not a GNN or causal-discovery claim.
