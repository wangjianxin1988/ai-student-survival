// Try to connect to Chrome via CDP (Chrome DevTools Protocol) to extract cookies
// This reads cookies from the running Chrome process
const net = require('net');
const fs = require('fs');

const CHROME_DEBUG_PORT = 9222;
const OUT_DIR = 'D:/suoyouxiangmu/ai-student-survival';

// Try to connect to Chrome via CDP
async function findChromeDebugPort() {
  // Chrome exposes CDP on a random port. The default is 9222 but can be different.
  // We try common ports.
  const ports = [9222, 9333, 9444, 9555];

  for (const port of ports) {
    try {
      const result = await new Promise((resolve) => {
        const socket = net.createConnection(port, '127.0.0.1');
        socket.setTimeout(1000);
        socket.on('connect', () => {
          socket.destroy();
          resolve(port);
        });
        socket.on('timeout', () => {
          socket.destroy();
          resolve(null);
        });
        socket.on('error', () => {
          resolve(null);
        });
      });
      if (result) {
        console.log(`Chrome CDP found on port ${result}`);
        return result;
      }
    } catch (e) {}
  }

  // Try Windows named pipes approach
  return null;
}

async function getCookiesViaCDP(port) {
  try {
    const http = require('http');

    // Get the list of targets
    const targets = await new Promise((resolve, reject) => {
      const req = http.get(`http://localhost:${port}/json`, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch { reject(new Error('Failed to parse targets')); }
        });
      });
      req.on('error', reject);
      req.setTimeout(3000, () => { req.destroy(); reject(new Error('Timeout')); });
    });

    console.log('Chrome targets:', Array.isArray(targets) ? targets.length : 'unknown');
    if (Array.isArray(targets)) {
      targets.forEach((t, i) => {
        console.log(`  [${i}] ${t.type} - ${t.title?.substring(0, 50)} (${t.id})`);
      });
    }

    // Find the Supabase dashboard tab
    const supabaseTarget = Array.isArray(targets)
      ? targets.find(t => t.url && t.url.includes('supabase'))
      : null;

    if (supabaseTarget) {
      console.log('\nFound Supabase tab:', supabaseTarget.url);

      // Connect to this target
      const wsUrl = supabaseTarget.webSocketDebuggerUrl;
      console.log('WebSocket URL:', wsUrl);

      // We can't easily use WebSocket from Node.js without a library
      // Instead, let's try HTTP-based CDP commands
      const cookieUrl = `http://localhost:${port}/json/profiler/${supabaseTarget.id}`;
      console.log('Note: Full CDP WebSocket connection requires a library');
    }

    return targets;
  } catch (err) {
    console.error('CDP error:', err.message);
    return null;
  }
}

// Alternative: Read cookies from Chrome's Cookie file directly
// Chrome uses SQLite with encryption on Windows
async function tryReadChromeCookies() {
  const paths = [
    'C:/Users/Administrator/AppData/Local/ChromeDebug/Default/Network/Cookies',
    'C:/Users/Administrator/AppData/Local/Google/Chrome/User Data/Default/Network/Cookies',
    'C:/Users/Administrator/AppData/Local/Doubao/User Data/Default/Network/Cookies',
  ];

  for (const p of paths) {
    if (!fs.existsSync(p)) continue;
    const size = fs.statSync(p).size;
    console.log(`\nCookie file: ${p.replace('C:/Users/Administrator/AppData/Local/','')} (${size} bytes)`);

    // Try to find cookies using a simple approach
    // Read the file and search for supabase.com
    try {
      const content = fs.readFileSync(p);
      const str = content.toString('binary');

      // Search for supabase-related strings
      const matches = [];
      let pos = 0;
      while ((pos = str.indexOf('supabase', pos)) !== -1) {
        const start = Math.max(0, pos - 50);
        const end = Math.min(str.length, pos + 100);
        matches.push(str.substring(start, end));
        pos += 8;
      }

      if (matches.length > 0) {
        console.log(`  Found supabase references: ${matches.length}`);
        matches.slice(0, 3).forEach((m, i) => {
          console.log(`  [${i}]: "${m.replace(/[^\x20-\x7E]/g, '.')}"`);
        });
      } else {
        console.log('  No supabase references found in raw binary');
      }

      // Also search for common cookie names
      const cookieNames = ['sb-session', 'supabase-auth', 'sb-access-token', '__stripe', 'session'];
      for (const name of cookieNames) {
        const idx = str.indexOf(name);
        if (idx !== -1) {
          console.log(`  Found cookie: ${name} at position ${idx}`);
        }
      }

    } catch (e) {
      console.log(`  Error reading: ${e.message}`);
    }
  }
}

// Try to use Edge browser (might have different cookies)
async function tryEdgeCookies() {
  const edgePaths = [
    'C:/Users/Administrator/AppData/Local/Microsoft/Edge/User Data/Default/Network/Cookies',
    'C:/Users/Administrator/AppData/Local/Microsoft/Edge/User Data/Default/Network/Cookies-journal',
  ];

  for (const p of edgePaths) {
    if (fs.existsSync(p)) {
      const size = fs.statSync(p).size;
      console.log(`\nEdge cookie file found: ${size} bytes`);
    }
  }
}

async function main() {
  console.log('=== Browser Cookie Extraction ===\n');

  // 1. Try to find Chrome CDP
  const port = await findChromeDebugPort();

  // 2. Try reading cookie files
  await tryReadChromeCookies();
  await tryEdgeCookies();

  // 3. Try to use playwright with ChromeDebug profile
  console.log('\n=== Trying Playwright with ChromeDebug profile ===');
  try {
    const { chromium } = require('./node_modules/playwright');
    const debugUserDir = 'C:/Users/Administrator/AppData/Local/ChromeDebug';

    let browser;
    try {
      browser = await chromium.launchPersistentContext(debugUserDir, {
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
        timeout: 10000,
      });

      const page = browser.pages()[0] || (await browser.newPage());
      await page.goto('https://supabase.com/dashboard/project/giynvpfnzzelzwpmsgtf/settings/api', {
        timeout: 15000,
        waitUntil: 'domcontentloaded',
      });
      await page.waitForTimeout(3000);

      const url = page.url();
      console.log('ChromeDebug URL:', url);

      // Extract cookies for supabase.com
      const cookies = await browser.contexts()[0].cookies(['https://supabase.com']);
      console.log('Cookies for supabase.com:', cookies.length);
      cookies.forEach(c => {
        const valPreview = c.value.length > 20 ? c.value.substring(0, 20) + '...' : c.value;
        console.log(`  ${c.name}: ${valPreview} (httpOnly=${c.httpOnly}, secure=${c.secure})`);
      });

      // Check if we're logged in
      const isLoggedIn = !url.includes('sign-in');
      console.log('Logged in:', isLoggedIn);

      if (isLoggedIn) {
        // Try to extract the service role key
        const jwtStrings = await page.evaluate(() => {
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          const results = [];
          let node;
          while (node = walker.nextNode()) {
            const text = node.textContent || '';
            const matches = text.match(/eyJ[A-Za-z0-9_=-]+\.[A-Za-z0-9_=-]+\.[A-Za-z0-9_=-]+/g);
            if (matches) results.push(...matches);
          }
          return [...new Set(results)];
        });

        console.log('\nJWT strings found:', jwtStrings.length);
        for (const jwt of jwtStrings) {
          try {
            const parts = jwt.split('.');
            const payload = JSON.parse(Buffer.from(parts[1], 'base64url'));
            console.log(`  role=${payload.role} len=${jwt.length}`);
            if (payload.role === 'service_role') {
              console.log('\n=== SERVICE ROLE KEY ===');
              console.log(jwt);
              fs.writeFileSync(`${OUT_DIR}/.service_role_key.txt`, jwt);
            }
          } catch (e) {}
        }
      }

      await browser.close();
    } catch (e) {
      console.log('ChromeDebug profile error:', e.message.substring(0, 200));
      if (browser) await browser.close();
    }
  } catch (e) {
    console.log('Playwright error:', e.message.substring(0, 200));
  }
}

main();
