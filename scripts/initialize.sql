BEGIN;
CREATE SCHEMA IF NOT EXISTS "celsus_core" AUTHORIZATION postgres;
SET search_path TO celsus_core;
\i scripts/library.sql
\i scripts/book.sql
COMMIT;