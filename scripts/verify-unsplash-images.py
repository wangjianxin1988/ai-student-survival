#!/usr/bin/env python3
"""
Verify all Unsplash images in src/data/ and src/pages/ return HTTP 200.
P70: Don't trust Unsplash photo IDs forever — they can be deleted/private.

Usage:
  python scripts/verify-unsplash-images.py
Exit codes: 0 = all OK, 1 = broken images found
"""
import urllib.request
import re
import sys
from pathlib import Path


def extract_unsplash_urls(file_paths):
    """Extract all Unsplash photo URLs from TS/Astro files.
    Only matches URLs followed by image-sizing params (w=, h=, fit=) — NOT
    photo IDs mentioned in comments.
    """
    urls = set()
    # Match `https://images.unsplash.com/photo-X-Y?...` or with single quotes
    pattern = re.compile(r'(https://images\.unsplash\.com/photo-[a-f0-9]+-[a-f0-9]+(?:\?[^\s\'"\\)<>]+)?)')
    for path in file_paths:
        try:
            text = path.read_text(encoding='utf-8', errors='ignore')
        except Exception:
            continue
        # 必须出现在引号内（imageUrl 字段）才算
        # 简化：匹配 'url' 或 "url" 紧跟 photo ID 后跟 ?w=
        quoted_pattern = re.compile(r"['\"](https://images\.unsplash\.com/photo-[a-f0-9]+-[a-f0-9]+\?[^\'\"]+)['\"]")
        urls.update(quoted_pattern.findall(text))
        # 也匹配 markdown image ![](url)
        md_pattern = re.compile(r"!\[.*?\]\((https://images\.unsplash\.com/photo-[a-f0-9]+-[a-f0-9]+(?:\?[^\s)]*)?)\)")
        urls.update(md_pattern.findall(text))
    return urls


def check_url(url, timeout=5):
    """Check if a URL returns HTTP 200."""
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        resp = urllib.request.urlopen(req, timeout=timeout)
        return resp.status, None
    except urllib.error.HTTPError as e:
        return e.code, str(e)
    except Exception as e:
        return 0, str(e)


def main():
    root_dir = Path(__file__).parent.parent
    paths = list((root_dir / 'src' / 'data').glob('*.ts'))
    paths += list((root_dir / 'src' / 'pages').rglob('*.astro'))

    print(f'Scanning {len(paths)} files for Unsplash URLs...')
    urls = extract_unsplash_urls(paths)
    print(f'Found {len(urls)} unique Unsplash image URLs')
    print()

    broken = []
    for i, url in enumerate(urls, 1):
        status, err = check_url(url)
        if status == 200:
            print(f'  [{i}/{len(urls)}] ✅ {url[:80]}')
        else:
            print(f'  [{i}/{len(urls)}] ❌ HTTP {status}: {url[:80]}')
            broken.append((url, status, err))

    print()
    if broken:
        print(f'❌ {len(broken)} BROKEN Unsplash images found:')
        for url, status, err in broken:
            print(f'  {url}')
            print(f'    HTTP {status}: {err}')
        print()
        print('FIX: Replace with verified working Unsplash URL or another CDN')
        return 1
    else:
        print(f'✅ All {len(urls)} Unsplash images are reachable (HTTP 200)')
        return 0


if __name__ == '__main__':
    sys.exit(main())