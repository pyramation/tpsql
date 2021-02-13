-- Deploy schemas/status_public/tables/user_steps/table to pg
-- requires: schemas/status_public/schema
-- replace: status_public public_schema I
BEGIN;
CREATE TABLE status_public.user_steps (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id uuid NOT NULL,
    name text NOT NULL, -- references level_requirement
    count int NOT NULL DEFAULT 1,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE status_public.user_steps IS 'The user achieving a requirement for a level. Log table that has every single step ever taken.';
CREATE INDEX ON status_public.user_steps (user_id, name);
COMMIT;

