#!/usr/bin/env node
/**
 * IndexNow URL Submission (Node.js fallback)
 * Created: 2026-06-18 — because Python 3.11 stdlib is broken (P21)
 * Usage:
 *   node submit-indexnow-node.js [urls.txt]
 *   node submit-indexnow-node.js url1 url2 ...
 *   node submit-indexnow-node.js            # fetch from sitemap
 *
 * Batches at 100 URLs per request (IndexNow limit).
 */
'use strict';

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const HOST = 'www.mi-to-ai.com';
const INDEXNOW_KEY = '638d6852-02df-4986-8f6a-0b477267dc2e';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;
const BATCH_SIZE = 100;
const ENDPOINT = 'api.indexnow.org';
const ENDPOINT_PATH = '/indexnow';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 30000 }, (res) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve, reject);
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function parseSitemapUrls(xml) {
  const urls = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    if (m[1]) urls.push(m[1]);
  }
  return urls;
}

function postBatch(urls) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls,
    });
    const opts = {
      hostname: ENDPOINT,
      port: 443,
      path: ENDPOINT_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload, 'utf8'),
      },
      timeout: 30000,
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ code: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.write(payload);
    req.end();
  });
}

async function main() {
  let urls = [];

  const args = process.argv.slice(2);
  if (args.length > 0) {
    // Check if first arg is a file
    const first = args[0];
    if (fs.existsSync(first) && fs.statSync(first).isFile()) {
      const txt = fs.readFileSync(first, 'utf8');
      urls = txt.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && l.startsWith('http'));
      console.log(`[INFO] Loaded ${urls.length} URLs from ${first}`);
    } else {
      urls = args;
      console.log(`[INFO] Using ${urls.length} URLs from CLI args`);
    }
  } else {
    console.log(`[INFO] Fetching sitemap from ${SITEMAP_URL}`);
    const xml = await fetchUrl(SITEMAP_URL + '?_=' + Date.now());
    urls = parseSitemapUrls(xml);
    console.log(`[INFO] Parsed ${urls.length} URLs from sitemap`);
  }

  if (urls.length === 0) {
    console.error('[ERROR] No URLs to submit');
    process.exit(1);
  }

  const numBatches = Math.ceil(urls.length / BATCH_SIZE);
  console.log(`[INFO] Submitting ${urls.length} URLs in ${numBatches} batch(es) (≤${BATCH_SIZE}/batch)\n`);

  let ok = 0, fail = 0;
  for (let i = 0; i < numBatches; i++) {
    const batch = urls.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
    try {
      const { code, body } = await postBatch(batch);
      if (code === 200) {
        console.log(`[OK]   Batch ${i + 1}/${numBatches} success (HTTP 200, ${batch.length} URLs)`);
        ok++;
      } else {
        console.log(`[FAIL] Batch ${i + 1}/${numBatches} HTTP ${code}: ${(body || '').slice(0, 120)}`);
        fail++;
      }
    } catch (err) {
      console.log(`[FAIL] Batch ${i + 1}/${numBatches} error: ${err.message}`);
      fail++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Success: ${ok}/${numBatches} batches`);
  console.log(`Failed:  ${fail}/${numBatches} batches`);
  console.log(`Total URLs: ${urls.length}`);

  process.exit(fail > 0 ? 2 : 0);
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});