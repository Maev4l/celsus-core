BEGIN;
CREATE SCHEMA IF NOT EXISTS "celsus_core" AUTHORIZATION postgres;
SET search_path TO celsus_core;
CREATE EXTENSION IF NOT EXISTS unaccent;
\i scripts/library.sql
\i scripts/book.sql
COMMIT;