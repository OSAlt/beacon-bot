#!/usr/bin/env bash


if [ ! -f ".env" ]; then
    echo ".env does not exist"
    exit 1
fi

if [ ! -f "config.js" ]; then
    echo "config.js does not exist"
    exit 1
fi

source .env 

node index.js
