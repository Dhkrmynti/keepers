#!/bin/sh
# Renders scripts/og/og.html to public/og.png (1200 x 630) with a local headless Chrome.
#   sh scripts/og/render.sh            (set CHROME=/path/to/chrome if it is elsewhere)
set -e
cd "$(dirname "$0")/../.."
ROOT="$(pwd -W 2>/dev/null || pwd)"
CHROME="${CHROME:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files --force-device-scale-factor=1 \
  --window-size=1200,630 --virtual-time-budget=3000 --screenshot="$ROOT/public/og.png" "file:///$ROOT/scripts/og/og.html"
