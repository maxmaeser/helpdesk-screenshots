#!/usr/bin/env bash
# Rebuilds index.html from the current markdown + raw screenshots.
# Run this any time more captures land in screenshots/*/raw/.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
python3 regen.py
