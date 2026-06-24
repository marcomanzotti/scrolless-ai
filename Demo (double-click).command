#!/bin/bash
# ───────────────────────────────────────────────────────────────────
# Scrolless AI — local demo launcher (macOS).
# Double-click this file to:
#   1. start the local backend using YOUR key from .env (never committed),
#   2. open Safari on a page that looks like the Scrolless site,
#   3. with a fully working chat — to show your boss how it'd look live.
# Close the Terminal window (or Ctrl+C) to stop the server.
# ───────────────────────────────────────────────────────────────────

cd "$(dirname "$0")" || exit 1

echo "🌿  Scrolless AI — local demo"
echo

# --- Check Node ---
if ! command -v node >/dev/null 2>&1; then
  echo "❌  Node.js is not installed. Get it from https://nodejs.org (LTS), then re-run."
  read -r -p "Press Enter to close…"; exit 1
fi

# --- Get the API key (first run only) ---
# If .env is missing or has no real key, ask for it once and save it locally.
# .env is gitignored, so the key stays on this Mac and never reaches GitHub.
NEED_KEY=1
if [ -f .env ] && grep -q '^ANTHROPIC_API_KEY=sk-' .env; then
  NEED_KEY=0
fi

if [ "$NEED_KEY" = "1" ]; then
  echo "🔑  First run: I need your Anthropic API key (starts with sk-ant-…)."
  echo "    It will be saved locally in .env and never uploaded to GitHub."
  echo
  read -r -p "Paste your API key and press Enter: " API_KEY
  API_KEY="$(echo "$API_KEY" | tr -d '[:space:]')"
  if [ -z "$API_KEY" ]; then
    echo "❌  No key entered. Closing."
    read -r -p "Press Enter to close…"; exit 1
  fi
  printf 'ANTHROPIC_API_KEY=%s\n' "$API_KEY" > .env
  echo "✅  Key saved to .env (this Mac only). Next time it'll start straight away."
  echo
fi

# --- Install deps if needed ---
if [ ! -d node_modules ]; then
  echo "📦  Installing dependencies (first run only)…"
  npm install || { echo "❌ npm install failed"; read -r -p "Press Enter…"; exit 1; }
fi

# --- Start backend ---
echo "🚀  Starting local backend on http://localhost:3000 …"
node server.js &
SERVER_PID=$!

# Stop the server when this window/script closes.
trap 'echo; echo "🛑  Stopping demo…"; kill $SERVER_PID 2>/dev/null; exit 0' INT TERM EXIT

# --- Wait for the port, then open Safari ---
for _ in $(seq 1 30); do
  if curl -s -o /dev/null http://localhost:3000/; then break; fi
  sleep 0.3
done

echo "🧭  Opening Safari…"
open -a Safari "http://localhost:3000/"

echo
echo "✅  Demo running. The chat in the bottom-right is live."
echo "    Leave this window open. Close it (or press Ctrl+C) to stop."
echo

# Keep the script alive while the server runs.
wait $SERVER_PID
