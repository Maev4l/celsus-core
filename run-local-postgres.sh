#!/bin/sh
docker run --name mypostgres -e POSTGRES_PASSWORD=  -d -p 5432:5432 postgres:10.3-alpine