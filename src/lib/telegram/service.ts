// Telegram Bot API integration for pushing community posts to Telegram channel
// Uses lazy env reading to support Cloudflare Pages runtime env

/**
 * Lazily resolve Telegram bot token — tries multiple sources at call time.
 * On Cloudflare Pages, process.env is populated by the adapter AFTER module init.
 */
function getTelegramBotToken(): string {
  // Source 1: import.meta.env (Vite/Astro loads .env at dev/build time)
  try {
    const viteKey = (import.meta as any).env?.TELEGRAM_BOT_TOKEN;
    if (viteKey && typeof viteKey === 'string' && viteKey.length > 5) return viteKey;
  } catch { /* ignore */ }
  // Source 2: process.env (populated at runtime by Cloudflare adapter)
  if (typeof process !== 'undefined' && process.env?.TELEGRAM_BOT_TOKEN) {
    return process.env.TELEGRAM_BOT_TOKEN;
  }
  return '';
}

function getTelegramChannelId(): string {
  try {
    const viteId = (import.meta as any).env?.TELEGRAM_CHANNEL_ID;
    if (viteId && typeof viteId === 'string' && viteId.length > 1) return viteId;
  } catch { /* ignore */ }
  if (typeof process !== 'undefined' && process.env?.TELEGRAM_CHANNEL_ID) {
    return process.env.TELEGRAM_CHANNEL_ID;
  }
  return '';
}

/**
 * Escape special Markdown characters for Telegram MarkdownV1 parse_mode.
 * Telegram's MarkdownV1 uses: _ * [ ] ( ) ~ ` > # + - = | { } . !
 */
function escapeMarkdownV1(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

/**
 * Escape special characters for Telegram MarkdownV2 parse_mode.
 * MarkdownV2 is stricter: requires escaping these chars even inside code blocks.
 */
function escapeMarkdownV2(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

/**
 * Send a message to the configured Telegram channel.
 *
 * @param title   Post title
 * @param content Post content (will be truncated to 500 chars)
 * @param url     Full URL to the post on mi-to-ai.com
 * @returns true if the message was sent successfully, false otherwise
 */
export async function sendToTelegram(
  title: string,
  content: string,
  url: string
): Promise<boolean> {
  const botToken = getTelegramBotToken();
  const channelId = getTelegramChannelId();

  if (!botToken || !channelId) {
    console.warn('[telegram] Bot token or channel ID not configured, skipping push');
    return false;
  }

  const truncatedContent = content.length > 500
    ? content.substring(0, 500) + '...'
    : content;

  // Use MarkdownV1 which is simpler (V2 requires escaping even in pre/code blocks)
  const message = [
    `📢 *${escapeMarkdownV1(title)}*`,
    '',
    escapeMarkdownV1(truncatedContent),
    '',
    `🔗 ${url}`,
  ].join('\n');

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: channelId,
          text: message,
          parse_mode: 'Markdown',
          disable_web_page_preview: false,
        }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[telegram] sendMessage failed (${res.status}):`, errorText);
      return false;
    }

    console.log(`[telegram] Message sent successfully for: ${title}`);
    return true;
  } catch (err) {
    console.error('[telegram] sendMessage exception:', err);
    return false;
  }
}

/**
 * Check if Telegram is configured (has both bot token and channel ID).
 * Useful for conditionally showing Telegram-related UI elements.
 */
export function isTelegramConfigured(): boolean {
  return Boolean(getTelegramBotToken() && getTelegramChannelId());
}
