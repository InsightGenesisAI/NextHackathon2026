"""
Package the AgentCFO Chrome extension into a deployable .zip.

Produces dist/agentcfo-extension-v<version>.zip from the extension/ directory.
Load unpacked from extension/ for dev, or upload the zip to the Chrome Web Store.
"""

from __future__ import annotations

import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).parent
EXT_DIR = ROOT / "extension"
DIST_DIR = ROOT / "dist"

# Files/dirs never shipped in the packaged extension.
EXCLUDE = {".DS_Store", "Thumbs.db"}


def _version() -> str:
    manifest = json.loads((EXT_DIR / "manifest.json").read_text(encoding="utf-8"))
    return manifest.get("version", "0.0.0")


def main() -> None:
    if not EXT_DIR.exists():
        raise SystemExit(f"extension/ not found at {EXT_DIR}")

    DIST_DIR.mkdir(exist_ok=True)
    version = _version()
    out_path = DIST_DIR / f"agentcfo-extension-v{version}.zip"

    files = [
        p
        for p in EXT_DIR.rglob("*")
        if p.is_file() and p.name not in EXCLUDE and "__pycache__" not in p.parts
    ]

    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for file in sorted(files):
            zf.write(file, arcname=file.relative_to(EXT_DIR))

    size_kb = out_path.stat().st_size / 1024
    print(f"Packaged {len(files)} files → {out_path} ({size_kb:.1f} KB)")


if __name__ == "__main__":
    main()
