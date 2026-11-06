#!/usr/bin/env bash
# Mark an article as import-ready and sync cover + markdown to Mac.
# Usage: publish-ready.sh <article-slug> [<article-slug> ...]
#        publish-ready.sh --all      # detect + sync every ready article
#        publish-ready.sh --sync     # just rsync, no re-detection

set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
READY_DIR="$REPO/_ready"
MAC_HOST="100.110.57.118"
MAC_USER="maximilianmaser"
MAC_PATH="~/work/fsai/helpdesk-screenshots/_ready/"

mkdir -p "$READY_DIR"

detect_import_md() {
  # Among .md files containing raw.githubusercontent.com URLs, pick the one
  # with the highest version (vN suffix), falling back to last alphabetically.
  local dir="$1"
  local matches=()
  while IFS= read -r -d '' f; do
    grep -q "raw.githubusercontent.com" "$f" && matches+=("$f")
  done < <(find "$dir" -maxdepth 1 -name "*.md" -print0)
  [ "${#matches[@]}" -eq 0 ] && return
  printf '%s\n' "${matches[@]}" | sort -V | tail -1
}

detect_cover() {
  local dir="$1"
  local newest="" newest_ts=0 ts
  while IFS= read -r -d '' f; do
    ts=$(stat -c %Y "$f" 2>/dev/null || stat -f %m "$f")
    if [ "$ts" -gt "$newest_ts" ]; then
      newest_ts=$ts
      newest=$f
    fi
  done < <(find "$dir" -maxdepth 1 -name "cover-*.png" -print0)
  [ -n "$newest" ] && printf '%s\n' "$newest"
}

stage_article() {
  local slug="$1"
  local src="$REPO/$slug"
  [ -d "$src" ] || { echo "  ✗ $slug: folder missing"; return 1; }

  local md cover
  md="$(detect_import_md "$src" || true)"
  cover="$(detect_cover "$src" || true)"

  if [ -z "$md" ]; then
    echo "  ✗ $slug: no import-ready .md (none contain raw.githubusercontent.com)"
    return 1
  fi

  local out="$READY_DIR/$slug"
  rm -rf "$out"
  mkdir -p "$out"
  cp "$md" "$out/"
  [ -n "$cover" ] && cp "$cover" "$out/"

  echo "  ✓ $slug: $(basename "$md")$([ -n "$cover" ] && echo " + $(basename "$cover")")"
}

sync_to_mac() {
  echo "→ rsync to $MAC_HOST:$MAC_PATH"
  rsync -az --delete -e 'ssh -o ConnectTimeout=5 -o BatchMode=yes' \
    "$READY_DIR/" "$MAC_USER@$MAC_HOST:$MAC_PATH" 2>&1 || {
    echo "✗ rsync failed. Is Remote Login enabled on Mac? (System Settings → General → Sharing → Remote Login)"
    return 1
  }
  echo "✓ synced"
}

mode="${1:-}"
[ -z "$mode" ] && { echo "usage: $0 <slug>... | --all | --sync"; exit 1; }

case "$mode" in
  --sync)
    sync_to_mac
    ;;
  --all)
    echo "Scanning for import-ready articles..."
    for dir in "$REPO"/*/; do
      slug="$(basename "$dir")"
      case "$slug" in
        node_modules|scripts|assets|cover-tool|test-results|_ready|.venv) continue ;;
      esac
      if [ -n "$(detect_import_md "$dir" 2>/dev/null)" ]; then
        stage_article "$slug" || true
      fi
    done
    sync_to_mac
    ;;
  *)
    for slug in "$@"; do
      stage_article "$slug" || true
    done
    sync_to_mac
    ;;
esac
