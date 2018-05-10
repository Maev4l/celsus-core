BEGIN;
CREATE SCHEMA IF NOT EXISTS "celsus" AUTHORIZATION postgres;
\i scripts/library.sql
\i scripts/book.sql
COMMIT;