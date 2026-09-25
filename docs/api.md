# API

The API root is `/api`; Swagger is at `/swagger-ui/index.html`.

```json
POST /api/faults
{"type":"DB_LATENCY","target":"inventory-db","severity":"HIGH","durationSeconds":60,"parameters":{"latencyMs":1200}}
```
