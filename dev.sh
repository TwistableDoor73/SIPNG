#!/bin/bash

# SIPNG Development Script
# Ejecuta frontend y backend simultáneamente

# Check if concurrently is installed
if ! npm list concurrently > /dev/null 2>&1; then
    echo "Installing concurrently..."
    npm install --save-dev concurrently
fi

# Run both processes
concurrently \
    "npm start" \
    "cd backend && npm run dev"
