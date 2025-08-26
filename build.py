#!/usr/bin/env python3
"""
Build script for api-development bundle.

Reads `files.txt` which lists source JS files and data files (relative to this folder).
Outputs concatenated `dist/bundle.js` and a `dist/manifest.json` listing embedded assets.

Usage: python build.py

The build embeds JSON data files into the bundle under window.__embeddedData
so the runtime can fallback to embedded content when fetch fails.
"""

import os
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
FILES_TXT = ROOT / 'files.txt'
DIST = ROOT / 'dist'

def read_file_lines(p: Path):
	with p.open('r', encoding='utf8') as f:
		return [l.strip() for l in f.read().splitlines() if l.strip()]

def build():
	if not FILES_TXT.exists():
		print('files.txt not found at', FILES_TXT)
		return 1
	files = read_file_lines(FILES_TXT)
	js_parts = []
	embedded = {}

	for rel in files:
		src = ROOT / rel
		if not src.exists():
			print('warning: source not found:', rel)
			continue
		if src.suffix == '.js':
			content = src.read_text(encoding='utf8')
			js_parts.append(f'// --- {rel} ---\n' + content + '\n')
		elif src.suffix in ('.json', '.txt'):
			key = rel.replace('\\', '/').lstrip('/')
			embedded[key] = json.loads(src.read_text(encoding='utf8'))
		elif src.suffix.lower() in ('.png', '.jpg', '.jpeg', '.ico'):
			# read binary and encode as data URL
			key = rel.replace('\\', '/').lstrip('/')
			b = src.read_bytes()
			import base64
			b64 = base64.b64encode(b).decode('ascii')
			mime = 'image/png' if src.suffix.lower() == '.png' else 'image/jpeg'
			dataurl = f'data:{mime};base64,' + b64
			embedded[key] = dataurl
		else:
			# copy other files as raw text into embedded
			key = rel.replace('\\', '/').lstrip('/')
			embedded[key] = src.read_text(encoding='utf8')

	DIST.mkdir(parents=True, exist_ok=True)

	# build bundle header
	header = (
		'(function(){\n'
		"  // Bundled by api-development/build.py\n"
		"  window.__embeddedData = window.__embeddedData || {};\n"
	)

	# add embedded data as JSON assignments
	for k, v in embedded.items():
		safe = json.dumps(v)
		header += f"  window.__embeddedData[{json.dumps(k)}] = {safe};\n"
		# Special-case small icon files: if the key ends with icon.png treat value as a data URL string
		if k.lower().endswith('icon.png') and isinstance(v, str):
			header += f"  window.__builderIconDataUrl = {json.dumps(v)};\n"

	header += '})();\n\n'

	bundle = header + '\n'.join(js_parts)

	bundle_path = DIST / 'bundle.js'
	bundle_path.write_text(bundle, encoding='utf8')

	manifest = {
		'files': files,
		'embedded_keys': list(embedded.keys()),
		'bundle': str(bundle_path.name),
	}
	manifest_path = DIST / 'manifest.json'
	manifest_path.write_text(json.dumps(manifest, indent=2), encoding='utf8')

	print('Built', bundle_path, 'with', len(js_parts), 'js parts and', len(embedded), 'embedded assets')
	print('Manifest:', manifest_path)
	return 0

if __name__ == '__main__':
	raise SystemExit(build())
