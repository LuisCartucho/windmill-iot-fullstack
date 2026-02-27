#!/bin/bash
set -a
source .env.development
set +a

dotnet tool install -g dotnet-ef
dotnet ef dbcontext scaffold "$ConnectionStrings__db" Npgsql.EntityFrameworkCore.PostgreSQL \
    --output-dir ./Entities \
    --context-dir . \
    --context WindFarmDbContext \
    --no-onconfiguring \
    --namespace efscaffold.Entities \
    --context-namespace Infrastructure.Postgres.Scaffolding \
    --schema iot_windfarm \
    --force
