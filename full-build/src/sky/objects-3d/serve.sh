#!/bin/sh
# Local preview only. Serves the whole repo so the prototype can be opened at http://localhost:8765/objects-3d/
cd "$(dirname "$0")/.." && echo "open http://localhost:8765/objects-3d/" && exec python3 -m http.server 8765
