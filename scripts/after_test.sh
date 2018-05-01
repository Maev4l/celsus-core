#!/bin/sh
psql --host localhost --dbname postgres --username postgres --port 5432 --command 'DROP SCHEMA "celsus" CASCADE;'