# celsus-core

[![Maev4l](https://circleci.com/gh/Maev4l/celsus-core.svg?style=shield)](https://app.circleci.com/pipelines/github/Maev4l/celsus-core)

[![Coverage Status](https://coveralls.io/repos/github/Maev4l/celsus-core/badge.svg)](https://coveralls.io/github/Maev4l/celsus-core)

## 1. Prequisites

Install PostgreSQL client: `brew install libpq`

## 2. Run locally

### PostgreSQL

`docker pull postgres:10.3-alpine`
`docker run --name mypostgres -e POSTGRES_PASSWORD= -d -p 5432:5432 postgres:10.3-alpine`

### Localstack

Get Docker image:
`docker pull localstack/localstack`
`docker run --name localstack -p 4566-4599:4566-4599 -e SERVICES=s3 -e DEFAULT_REGION=eu-central-1 localstack/localstack`

Configure AWS CLI:
`aws configure --profile localstack`
We can provide any dummy value for the credentials and a valid region name like eu-central-1.

Usage
`aws --profile localstack --endpoint-url http://localhost:4566 <command>`
