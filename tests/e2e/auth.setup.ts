/**
 * E2E Test Helpers — Guerrilla Mail API + OTP extraction
 *
 * Provides:
 *  - generateTempEmail()    — create a random Guerrilla Mail address
 *  - waitForEmail()         — poll until a matching email arrives
 *  - extractOtp()           — pull a 6-digit OTP from email body
 *  - extractLink()          — pull the first http(s) link from email body
 *  - extractRecoveryLink()  — pull Supabase recovery link (with #hash) from HTML
 */

const GUERRILLA_API = 'https://api.guerrillamail.com/ajax.php';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface GuerrillaEmail {
  email_id: string;
  email_from: string;
  email_subject: string;
  email_date: string;
  email_timestamp: string;
}

export interface EmailBody {
  email_id: string;
  email_from: string;
  email_subject: string;
  email_date: string;
  email_body: string;      // HTML body
  email_text: string;      // plain text body
  email_size: string;
  mail_id: string;
}

// ─── State ──────────────────────────────────────────────────────────────────

// Store sid_token for the session
let sessionToken: string | null = null;
let sessionEmail: string | null = null;

// ─── Email Generation ───────────────────────────────────────────────────────

/**
 * Generate a random Guerrilla Mail email address.
 * Returns { email, login, domain }.
 */
export async function generateTempEmail(): Promise<{
  email: string;
  login: string;
  domain: string;
}> {
  const res = await fetch(`${GUERRILLA_API}?f=get_email_address`);
  if (!res.ok) throw new Error(`Guerrilla get_email_address failed: ${res.status}`);
  
  const data = await res.json();
  const emailAddr: string = data.email_addr;
  sessionToken = data.sid_token;
  sessionEmail = emailAddr;
  
  const [login, domain] = emailAddr.split('@');
  console.log(`[Guerrilla] Generated: ${emailAddr} (sid: ${sessionToken?.substring(0, 10)}...)`);
  return { email: emailAddr, login, domain };
}

// ─── Mail Polling ───────────────────────────────────────────────────────────

/**
 * Poll Guerrilla Mail until an email matching `predicate` arrives.
 * Returns the full email body. Throws after `timeoutMs` (default 90 s).
 */
export async function waitForEmail(
  login: string,
  domain: string,
  predicate: (msg: GuerrillaEmail) => boolean,
  timeoutMs = 90_000,
  pollIntervalMs = 3_000,
): Promise<EmailBody> {
  if (!sessionToken) {
    throw new Error('[Guerrilla] No session token. Call generateTempEmail() first.');
  }

  const deadline = Date.now() + timeoutMs;
  let lastSeq = 0;
  let attempt = 0;

  while (Date.now() < deadline) {
    attempt++;
    const res = await fetch(
      `${GUERRILLA_API}?f=check_email&seq=${lastSeq}&sid_token=${sessionToken}`,
    );
    
    if (res.ok) {
      const data = await res.json();
      const messages: GuerrillaEmail[] = data.list || [];
      
      if (messages.length > 0) {
        // Check newest messages first
        for (let i = messages.length - 1; i >= 0; i--) {
          const msg = messages[i];
          if (predicate(msg)) {
            console.log(`[Guerrilla] Matched email #${attempt}: id=${msg.email_id} subject="${msg.email_subject}" from="${msg.email_from}"`);
            return fetchMessageBody(msg.email_id);
          }
        }
        // Update sequence to avoid re-checking old messages
        lastSeq = Math.max(...messages.map(m => parseInt(m.email_id) || 0));
      }
    }
    
    if (attempt % 5 === 0) {
      console.log(`[Guerrilla] Polling attempt #${attempt}, waiting...`);
    }
    await sleep(pollIntervalMs);
  }
  
  throw new Error(
    `[Guerrilla] Timeout after ${timeoutMs / 1000}s waiting for matching email`,
  );
}

/**
 * Fetch the full body of a single email by ID.
 */
export async function fetchMessageBody(emailId: string): Promise<EmailBody> {
  if (!sessionToken) {
    throw new Error('[Guerrilla] No session token. Call generateTempEmail() first.');
  }

  const res = await fetch(
    `${GUERRILLA_API}?f=fetch_email&email_id=${emailId}&sid_token=${sessionToken}`,
  );
  if (!res.ok) throw new Error(`Guerrilla fetch_email failed: ${res.status}`);
  
  const data = await res.json();
  const body: EmailBody = data.email || data;
  return body;
}

// ─── OTP / Link Extraction ─────────────────────────────────────────────────

/**
 * Extract a 6-digit OTP code from email text or HTML body.
 * Searches email_text first, then email_body.
 */
export function extractOtp(mail: EmailBody): string {
  const sources = [mail.email_text, mail.email_body].filter(Boolean);

  for (const src of sources) {
    // Try to find a prominent 6-digit code (often in bold / large text)
    // Pattern 1: standalone 6 digits
    const match = src.match(/\b(\d{6})\b/);
    if (match) {
      console.log(`[Guerrilla] Extracted OTP: ${match[1]}`);
      return match[1];
    }
  }

  // Fallback: search combined text
  const combined = sources.join(' ');
  const fallback = combined.match(/\b(\d{6})\b/);
  if (fallback) {
    console.log(`[Guerrilla] Extracted OTP (fallback): ${fallback[1]}`);
    return fallback[1];
  }

  throw new Error('[Guerrilla] Could not extract 6-digit OTP from email');
}

/**
 * Extract the first http(s) URL from email body.
 * Useful for Supabase confirmation / magic-link emails.
 */
export function extractLink(mail: EmailBody): string {
  const sources = [mail.email_body, mail.email_text].filter(Boolean);
  for (const src of sources) {
    const match = src.match(/https?:\/\/[^\s"'<>]+/);
    if (match) {
      console.log(`[Guerrilla] Extracted link: ${match[0]}`);
      return match[0];
    }
  }
  throw new Error('[Guerrilla] Could not extract link from email');
}

/**
 * Extract a Supabase recovery/reset link from email HTML.
 *
 * Supabase password-reset emails contain a link like:
 *   http://localhost:4321/auth/reset-password#access_token=...&refresh_token=...&type=recovery
 *
 * The hash fragment (#...) is critical and may not be captured by a simple URL regex.
 * We parse the <a href="..."> tags from the HTML and look for one containing
 * "/auth/reset-password" or "type=recovery".
 *
 * Falls back to a regex that captures the full URL including hash.
 */
export function extractRecoveryLink(mail: EmailBody): string {
  const html = mail.email_body || '';

  // Strategy 1: Parse href attributes from <a> tags
  const hrefMatches = html.match(/href=["']([^"']+)["']/gi) || [];
  for (const raw of hrefMatches) {
    const url = raw.replace(/^href=["']/i, '').replace(/["']$/, '');
    // Unescape HTML entities
    const unescaped = url
      .replace(/&amp;/g, '&')
      .replace(/&#38;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#x2F;/g, '/')
      .replace(/&#47;/g, '/');
    if (
      unescaped.includes('reset-password') ||
      unescaped.includes('type=recovery') ||
      unescaped.includes('auth/callback')
    ) {
      console.log(`[Guerrilla] Extracted recovery link: ${unescaped}`);
      return unescaped;
    }
  }

  // Strategy 2: Regex that captures URL + hash fragment
  const hashRegex = /https?:\/\/[^\s"'<>]+#[^\s"'<>]+/g;
  const hashMatches = html.match(hashRegex) || [];
  for (const url of hashMatches) {
    const unescaped = url.replace(/&amp;/g, '&');
    if (
      unescaped.includes('reset-password') ||
      unescaped.includes('type=recovery')
    ) {
      console.log(`[Guerrilla] Extracted recovery link (hash regex): ${unescaped}`);
      return unescaped;
    }
  }

  // Strategy 3: Try email_text
  const text = mail.email_text || '';
  const textLinkMatch = text.match(/https?:\/\/[^\s]+#type=recovery[^\s]*/);
  if (textLinkMatch) {
    console.log(`[Guerrilla] Extracted recovery link (text): ${textLinkMatch[0]}`);
    return textLinkMatch[0];
  }

  // Strategy 4: Any link with hash
  const anyHashLink = (html + ' ' + text).match(/https?:\/\/[^\s"'<>]+#/);
  if (anyHashLink) {
    // Try to get the full URL including hash from the HTML
    const idx = html.indexOf(anyHashLink[0]);
    if (idx >= 0) {
      const rest = html.substring(idx);
      const endMatch = rest.match(/https?:\/\/[^\s"'<>]+/);
      if (endMatch) {
        console.log(`[Guerrilla] Extracted recovery link (any hash): ${endMatch[0]}`);
        return endMatch[0];
      }
    }
  }

  throw new Error('[Guerrilla] Could not extract recovery link from email');
}

/**
 * Extract a Supabase email confirmation link from email.
 * Format: http://localhost:4321/auth/callback?token=***&type=signup&email=...
 */
export function extractConfirmationLink(mail: EmailBody): string {
  const html = mail.email_body || '';

  // Parse href attributes
  const hrefMatches = html.match(/href=["']([^"']+)["']/gi) || [];
  for (const raw of hrefMatches) {
    const url = raw.replace(/^href=["']/i, '').replace(/["']$/, '');
    const unescaped = url
      .replace(/&amp;/g, '&')
      .replace(/&#38;/g, '&')
      .replace(/&#x2F;/g, '/')
      .replace(/&#47;/g, '/');
    if (
      unescaped.includes('auth/callback') ||
      unescaped.includes('type=signup') ||
      unescaped.includes('type=email') ||
      unescaped.includes('token=')
    ) {
      console.log(`[Guerrilla] Extracted confirmation link: ${unescaped}`);
      return unescaped;
    }
  }

  // Fallback: direct URL regex
  const match = html.match(/https?:\/\/[^\s"'<>]+token=[^\s"'<>]+/);
  if (match) {
    const unescaped = match[0].replace(/&amp;/g, '&');
    console.log(`[Guerrilla] Extracted confirmation link (regex): ${unescaped}`);
    return unescaped;
  }

  // Last resort: extract any link
  return extractLink(mail);
}

// ─── Utilities ──────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
