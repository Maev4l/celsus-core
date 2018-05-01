BEGIN;
CREATE SCHEMA IF NOT EXISTS "celsus" AUTHORIZATION postgres;
\i scripts/library.sql
COMMIT;