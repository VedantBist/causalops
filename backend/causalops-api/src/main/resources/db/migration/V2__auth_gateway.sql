-- Migration V2: Register auth-gateway service and dependency to api-gateway
INSERT INTO services (name, type, status, baseline_latency, current_latency, error_rate, metadata)
VALUES (
  'auth-gateway',
  'Gateway',
  'healthy',
  42,
  42,
  0.01,
  '{"tech":"Envoy Proxy 1.28","description":"OAuth2/OIDC ingress endpoint handling token issuance and refresh challenges.","host":"auth-gw.ingress.us-east.internal"}'::jsonb
) ON CONFLICT (name) DO UPDATE SET
  status = 'healthy',
  current_latency = 42,
  error_rate = 0.01;

INSERT INTO dependencies (source_service, target_service)
VALUES ('api-gateway', 'auth-gateway')
ON CONFLICT (source_service, target_service) DO NOTHING;

