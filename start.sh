#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
ROOT="$(cd .. && pwd)"
# shellcheck source=../scripts/dev-utils.sh
source "${ROOT}/scripts/dev-utils.sh"

export PORT="${PORT:-3052}"
export API_PROXY_TARGET="${API_PROXY_TARGET:-http://127.0.0.1:3050}"

free_port "$PORT" "Portal"

PORTAL_VERSION="$(package_version "$(pwd)")"
echo "▶ Portal v${PORTAL_VERSION}: http://localhost:${PORT}"
exec npx next dev -p "${PORT}"
