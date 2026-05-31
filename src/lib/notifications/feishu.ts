/**
 * 飞书 Webhook 通知服务
 * 通过飞书群机器人 Webhook 发送通知消息
 */

// 读取环境变量 — 支持 import.meta.env (Astro/Vite) 和 process.env (Cloudflare runtime)
function getFeishuWebhookUrl(): string {
  try {
    const viteKey = (import.meta as any).env?.FEISHU_WEBHOOK_URL;
    if (viteKey && typeof viteKey === 'string') return viteKey;
  } catch { /* ignore */ }
  if (typeof process !== 'undefined' && process.env?.FEISHU_WEBHOOK_URL) {
    return process.env.FEISHU_WEBHOOK_URL;
  }
  return '';
}

export async function sendFeishuNotification(
  title: string,
  content: string,
  url: string
): Promise<boolean> {
  const webhookUrl = getFeishuWebhookUrl();
  if (!webhookUrl) {
    console.warn('[feishu] FEISHU_WEBHOOK_URL not configured, skipping notification');
    return false;
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msg_type: 'interactive',
        card: {
          header: {
            title: { tag: 'plain_text', content: title },
            template: 'blue',
          },
          elements: [
            {
              tag: 'markdown',
              content,
            },
            {
              tag: 'action',
              actions: [
                {
                  tag: 'button',
                  text: { tag: 'plain_text', content: '查看详情' },
                  url,
                  type: 'primary',
                },
              ],
            },
          ],
        },
      }),
    });

    if (!res.ok) {
      console.error('[feishu] Webhook request failed:', res.status, await res.text());
      return false;
    }

    return true;
  } catch (err) {
    console.error('[feishu] Notification failed:', err);
    return false;
  }
}
