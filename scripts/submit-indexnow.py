#!/usr/bin/env python3
"""
IndexNow URL Submission Script
Submits sitemap URLs to Bing/Yandex via IndexNow protocol.
Usage: python submit-indexnow.py [url1] [url2] ...
If no URLs provided, submits all URLs from sitemap.xml.
"""
import sys
import json
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET

HOST = "www.mi-to-ai.com"
INDEXNOW_KEY = "638d6852-02df-4986-8f6a-0b477267dc2e"
KEY_LOCATION = f"https://{HOST}/{INDEXNOW_KEY}.txt"
SITEMAP_URL = f"https://{HOST}/sitemap.xml"

def get_sitemap_urls():
    """Parse sitemap.xml and return all URLs."""
    req = urllib.request.Request(SITEMAP_URL, headers={"User-Agent": "IndexNow/1.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        xml_data = resp.read().decode("utf-8")
    root = ET.fromstring(xml_data)
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    return [loc.text for loc in root.findall(".//sm:loc", ns)]

def submit_indexnow(urls, endpoint="https://api.indexnow.org/IndexNow"):
    """Submit URLs to IndexNow."""
    payload = json.dumps({
        "host": HOST,
        "key": INDEXNOW_KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": urls
    }).encode("utf-8")
    req = urllib.request.Request(
        endpoint,
        data=payload,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST"
    )
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        return resp.status
    except urllib.error.HTTPError as e:
        return e.code

if __name__ == "__main__":
    if len(sys.argv) > 1:
        urls = sys.argv[1:]
    else:
        print(f"Fetching URLs from {SITEMAP_URL}...")
        urls = get_sitemap_urls()
    
    print(f"Submitting {len(urls)} URLs to IndexNow...")
    status = submit_indexnow(urls)
    
    if status in (200, 202):
        print(f"✅ Success! {len(urls)} URLs submitted (HTTP {status})")
    else:
        print(f"❌ Failed: HTTP {status}")
