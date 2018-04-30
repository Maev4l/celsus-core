#!/bin/sh
sudo docker run --name mypostgres -e POSTGRES_PASSWORD=Password1 -d -p 5432:5432 postgres:10.3-alpine