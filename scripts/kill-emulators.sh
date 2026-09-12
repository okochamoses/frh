#!/usr/bin/env bash
# Frees the emulator ports.
#
# The Firestore emulator is a Java child process that can outlive the firebase
# CLI when a run is interrupted. It keeps holding 8080, and the next start fails
# with the misleading "Port 8080 is not open". Killing the CLI alone is not
# enough — the JVM has to go too.
set -uo pipefail

# 1025/1080 belong to MailDev, the local mail catcher dev:local runs alongside.
PORTS=(8080 9099 4000 4400 4500 9150 5050 1025 1080)

pkill -9 -f 'cloud-firestore-emulator' 2>/dev/null
pkill -9 -f 'firebase emulators' 2>/dev/null
pkill -9 -f 'bin/maildev' 2>/dev/null

for port in "${PORTS[@]}"; do
  pids=$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "freeing :$port ($pids)"
    echo "$pids" | xargs -r kill -9 2>/dev/null
  fi
done

sleep 1

for port in "${PORTS[@]}"; do
  if lsof -nP -iTCP:"$port" -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "WARNING: :$port is still held"
  fi
done

echo "emulator ports clear"
