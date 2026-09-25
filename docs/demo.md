# Demo

Start Docker Compose, submit the fault request, wait two telemetry cycles (about ten seconds), then request `/api/incidents/active` and `/api/incidents/{id}/root-cause`. Submit `{"target":"inventory-db","reductionPercent":70}` to `/api/simulations`.
