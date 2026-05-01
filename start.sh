#!/bin/bash

cd "$(dirname "$0")"

on_error() {
    echo
    echo "An error occurred. Press Enter to exit..."
    read -r
    exit 1
}

trap 'on_error' ERR
set -e

if ! command -v node > /dev/null 2>&1; then
    echo "Node.js required"
    echo "Go to https://nodejs.org to install"
    on_error
fi

NODE_VERSION=$(node -v | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)

if [ "$NODE_MAJOR" -lt 22 ]; then
    echo "Node.js version 22 or higher is required (found $NODE_VERSION)"
    on_error
fi

corepack enable
yarn
node scripts/build.js
yarn start
