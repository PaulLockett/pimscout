#!/bin/bash
set -e

echo "Installing pnpm..."
npm install -g pnpm@9

echo "Installing dependencies..."
pnpm install

echo "Building packages..."
pnpm turbo build

echo "Dev environment ready!"
