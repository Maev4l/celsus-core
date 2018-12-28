BEGIN;
CREATE SCHEMA IF NOT EXISTS "celsus_core" AUTHORIZATION postgres;
CREATE EXTENSION IF NOT EXISTS unaccent;
SET search_path TO celsus_core, public;
\i scripts/library.sql
\i scripts/book.sql
COMMIT;