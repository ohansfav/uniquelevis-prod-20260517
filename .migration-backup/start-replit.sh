#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ensure_deps() {
  local dir="$1"
  if [ ! -d "$dir/node_modules" ]; then
    echo "[setup] Installing dependencies in $dir"
    (cd "$dir" && npm ci)
  fi
}

cleanup() {
  echo "[shutdown] Stopping app processes"
  kill "${SERVER_PID:-0}" "${CLIENT_PID:-0}" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

ensure_deps "$ROOT_DIR/server"
ensure_deps "$ROOT_DIR/client"

echo "[start] Launching API on :5000"
(
  cd "$ROOT_DIR/server"
  export PORT="${PORT:-5000}"
  npm run dev
) &
SERVER_PID=$!

echo "[start] Launching web on :3000"
(
  cd "$ROOT_DIR/client"
  export NEXT_PUBLIC_API_URL="/api"
  export API_PROXY_TARGET="http://127.0.0.1:5000"
  npm run dev -- --hostname 0.0.0.0 --port 3000
) &
CLIENT_PID=$!

wait -n "$SERVER_PID" "$CLIENT_PID"
EXIT_CODE=$?
exit "$EXIT_CODE"
