#!/usr/bin/env bash
# privtr.ee — compila assets/app.css con el CLI standalone de Tailwind (sin Node).
# Uso:  ./build.sh          (una vez)
#       ./build.sh --watch  (recompila al guardar)
set -euo pipefail
cd "$(dirname "$0")"

VER="3.4.17"
BIN="./tools/tailwindcss"

detect_target() {
  local os arch
  os="$(uname -s)"; arch="$(uname -m)"
  case "$os" in
    Darwin) case "$arch" in arm64) echo "macos-arm64";; *) echo "macos-x64";; esac;;
    Linux)  case "$arch" in aarch64|arm64) echo "linux-arm64";; *) echo "linux-x64";; esac;;
    *) echo "unsupported";;
  esac
}

if [ ! -x "$BIN" ]; then
  T="$(detect_target)"
  [ "$T" = "unsupported" ] && { echo "SO no soportado por el binario standalone; instala Node y usa 'npx tailwindcss'."; exit 1; }
  mkdir -p tools
  echo "Descargando tailwindcss v$VER ($T)…"
  curl -fsSL -o "$BIN" "https://github.com/tailwindlabs/tailwindcss/releases/download/v$VER/tailwindcss-$T"
  chmod +x "$BIN"
fi

ARGS=(-c ./tailwind.config.js -i ./src/input.css -o ./assets/app.css --minify)
if [ "${1:-}" = "--watch" ]; then
  exec "$BIN" "${ARGS[@]}" --watch
else
  "$BIN" "${ARGS[@]}"
  echo "OK -> assets/app.css"
fi
