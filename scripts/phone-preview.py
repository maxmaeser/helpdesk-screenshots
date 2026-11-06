#!/usr/bin/env python3
"""Live phone preview for helpdesk screenshot sessions.

Auto-detects the most recently active article directory and serves a
phone-friendly page that shows the latest image, refreshing automatically.

Usage:
    # Auto-detect directory (picks the one with the freshest PNGs):
    .venv/bin/python scripts/phone-preview.py

    # Explicit directory:
    .venv/bin/python scripts/phone-preview.py how-to-build-a-form/

    # Custom port:
    .venv/bin/python scripts/phone-preview.py --port 9090
"""

import http.server
import json
import socket
import sys
import time
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
PORT = 8080
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}

# Directories that are never article folders
SKIP_DIRS = {"scripts", "assets", "cover-tool", ".venv", ".git", "node_modules", "__pycache__"}


def find_active_directory() -> Path:
    """Find the article directory with the most recently modified image."""
    best_dir = None
    best_time = 0

    for d in PROJECT_ROOT.iterdir():
        if not d.is_dir() or d.name.startswith(".") or d.name in SKIP_DIRS:
            continue
        for f in d.iterdir():
            if f.suffix.lower() in IMAGE_EXTENSIONS and f.stat().st_mtime > best_time:
                best_time = f.stat().st_mtime
                best_dir = d

    if best_dir is None:
        print("No article directories with images found.")
        sys.exit(1)

    return best_dir


def get_images(directory: Path) -> list[dict]:
    """Get all images in directory, sorted newest first."""
    images = []
    for f in directory.iterdir():
        if f.suffix.lower() in IMAGE_EXTENSIONS and not f.name.startswith("."):
            images.append({"name": f.name, "mtime": f.stat().st_mtime})
    images.sort(key=lambda x: x["mtime"], reverse=True)
    return images


def get_local_ip() -> str:
    """Get the machine's local network IP."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "localhost"


PAGE_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Screenshot Preview</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, system-ui, sans-serif;
    background: #111;
    color: #eee;
    padding: 12px;
    padding-top: max(12px, env(safe-area-inset-top));
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 12px;
    padding: 0 4px;
  }
  .dir { font-size: 14px; font-weight: 600; color: #aaa; }
  .count { font-size: 12px; color: #666; }
  .latest {
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 16px;
    background: #222;
    position: relative;
  }
  .latest img {
    width: 100%;
    display: block;
  }
  .latest .label {
    position: absolute;
    top: 8px;
    left: 8px;
    background: rgba(0,0,0,0.6);
    color: #fff;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 4px;
  }
  .gallery {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .gallery img {
    width: 100%;
    border-radius: 6px;
    display: block;
    background: #222;
  }
  .name {
    font-size: 11px;
    color: #888;
    margin-top: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .pulse {
    display: inline-block;
    width: 6px; height: 6px;
    background: #4f4;
    border-radius: 50%;
    margin-right: 6px;
    animation: blink 2s infinite;
  }
  @keyframes blink { 50% { opacity: 0.3; } }
</style>
</head>
<body>
<div class="header">
  <div class="dir"><span class="pulse"></span><span id="dir"></span></div>
  <div class="count"><span id="count"></span> images</div>
</div>
<div class="latest" id="latest"></div>
<div class="gallery" id="gallery"></div>
<script>
let lastData = '';
async function poll() {
  try {
    const r = await fetch('/api/images');
    const text = await r.text();
    if (text === lastData) return;
    lastData = text;
    const data = JSON.parse(text);
    document.getElementById('dir').textContent = data.directory;
    document.getElementById('count').textContent = data.images.length;
    const latest = document.getElementById('latest');
    const gallery = document.getElementById('gallery');
    if (data.images.length === 0) {
      latest.innerHTML = '<div style="padding:40px;text-align:center;color:#666">Waiting for images...</div>';
      gallery.innerHTML = '';
      return;
    }
    const ts = data.images[0].mtime;
    latest.innerHTML = '<div class="label">' + data.images[0].name + '</div>' +
      '<img src="/img/' + encodeURIComponent(data.images[0].name) + '?t=' + ts + '">';
    gallery.innerHTML = data.images.slice(1).map(function(img) {
      return '<div><img src="/img/' + encodeURIComponent(img.name) + '?t=' + img.mtime +
        '" loading="lazy"><div class="name">' + img.name + '</div></div>';
    }).join('');
  } catch(e) {}
}
poll();
setInterval(poll, 2000);
</script>
</body>
</html>"""


class PreviewHandler(http.server.BaseHTTPRequestHandler):
    image_dir: Path = Path(".")

    def do_GET(self):
        if self.path == "/" or self.path == "/index.html":
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(PAGE_HTML.encode())

        elif self.path == "/api/images":
            images = get_images(self.image_dir)
            payload = json.dumps({
                "directory": self.image_dir.name,
                "images": images,
            })
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            self.wfile.write(payload.encode())

        elif self.path.startswith("/img/"):
            from urllib.parse import unquote
            name = unquote(self.path[5:].split("?")[0])
            filepath = self.image_dir / name
            if filepath.exists() and filepath.parent == self.image_dir:
                ext = filepath.suffix.lower()
                mime = {".png": "image/png", ".jpg": "image/jpeg",
                        ".jpeg": "image/jpeg", ".webp": "image/webp"}.get(ext, "application/octet-stream")
                self.send_response(200)
                self.send_header("Content-Type", mime)
                self.send_header("Cache-Control", "public, max-age=3600")
                self.end_headers()
                self.wfile.write(filepath.read_bytes())
            else:
                self.send_error(404)
        else:
            self.send_error(404)

    def log_message(self, format, *args):
        # Quiet logging - only show connects
        pass


def main():
    port = PORT
    target_dir = None

    args = sys.argv[1:]
    while args:
        arg = args.pop(0)
        if arg == "--port" and args:
            port = int(args.pop(0))
        elif not arg.startswith("-"):
            target_dir = Path(arg)

    if target_dir:
        if not target_dir.is_absolute():
            target_dir = PROJECT_ROOT / target_dir
        if not target_dir.is_dir():
            print(f"Not a directory: {target_dir}")
            sys.exit(1)
        image_dir = target_dir
    else:
        image_dir = find_active_directory()

    PreviewHandler.image_dir = image_dir

    local_ip = get_local_ip()
    server = http.server.HTTPServer(("0.0.0.0", port), PreviewHandler)

    print(f"Serving: {image_dir.name}/")
    print(f"Phone:   http://{local_ip}:{port}")
    print(f"Local:   http://localhost:{port}")
    print()
    print("Open the Phone URL on your phone (same Wi-Fi).")
    print("Page auto-refreshes every 2s. Ctrl+C to stop.")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
        server.server_close()


if __name__ == "__main__":
    main()
