-- Deploy schemas/status_public/schema to pg
-- deploys: schema public_schema
-- replace: status_public public_schema I
BEGIN;
CREATE SCHEMA IF NOT EXISTS status_public;
GRANT USAGE ON SCHEMA status_public TO authenticated, anonymous;
ALTER DEFAULT PRIVILEGES IN SCHEMA status_public GRANT EXECUTE ON FUNCTIONS TO authenticated;
COMMIT;

