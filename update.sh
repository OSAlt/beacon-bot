#!/usr/bin/env bash
docker-compose pull bot
docker-compose stop bot
yes | docker-compose rm bot
docker-compose up -d
