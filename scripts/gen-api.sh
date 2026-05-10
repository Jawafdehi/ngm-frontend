#!/usr/bin/env bash
set -euo pipefail

SCHEMA_URL="${OPENAPI_SCHEMA_URL:-http://localhost:8000/api/schema/?format=json}"
OUTPUT="${1:-src/generated/api.ts}"

echo "Generating TypeScript API client from $SCHEMA_URL"
echo "Output: $OUTPUT"

mkdir -p "$(dirname "$OUTPUT")"
npx --yes openapi-typescript "$SCHEMA_URL" --output "$OUTPUT"

echo "Done. Generated $OUTPUT"
