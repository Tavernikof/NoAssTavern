#!/bin/bash
set -e

if ! command -v node > /dev/null 2>&1; then
    echo "Node.js required"
    echo "Go to https://nodejs.org to install"
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)

if [ "$NODE_MAJOR" -lt 20 ]; then
    echo "Node.js version 20 or higher is required (found $NODE_VERSION)"
    exit 1
fi

corepack enable
yarn
node scripts/build.js
yarn start