-- Deploy schemas/status_public/tables/user_achievements/table to pg
-- requires: schemas/status_public/schema
-- replace: status_public public_schema I
BEGIN;
CREATE TABLE status_public.user_achievements (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id uuid NOT NULL,
    name text NOT NULL, -- relates to level_requirements.name
    count int NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_achievements_unique_key UNIQUE (user_id, name)
);
COMMENT ON TABLE status_public.user_achievements IS 'This table represents the users progress for particular level requirements, tallying the total count. This table is updated via triggers and should not be updated maually.';
CREATE INDEX ON status_public.user_achievements (user_id, name);
COMMIT;

