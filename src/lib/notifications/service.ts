/**
 * 通知调度服务
 * 解析评论中的 @提及，查找用户并发送飞书通知
 */

import { parseMentions } from './mention-parser';
import { sendFeishuNotification } from './feishu';
import { supabase } from '@/lib/supabase';

/**
 * 通知被 @提及 的用户
 * @param commentContent 评论内容
 * @param postId 帖子ID
 * @param postTitle 帖子标题
 * @param commenterName 评论者名称
 * @param postType 帖子类型 ('community' | 'questions')
 */
export async function notifyMentionedUsers(
  commentContent: string,
  postId: string,
  postTitle: string,
  commenterName: string,
  postType: 'community' | 'questions' = 'community'
): Promise<void> {
  try {
    // 1. 解析评论中的 @username 提及
    const mentionedNames = parseMentions(commentContent);
    if (mentionedNames.length === 0) return;

    // 2. 查找被提及用户的ID和信息
    // 使用 ilike 模糊匹配用户名
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email')
      .or(
        mentionedNames.map((name) => `name.ilike.%${name}%`).join(',')
      )
      .limit(20);

    if (error) {
      console.error('[notifications] Failed to query mentioned users:', error);
      return;
    }

    if (!users || users.length === 0) return;

    // 3. 精确匹配（忽略大小写）过滤
    const matchedUsers = users.filter((u) => {
      const userName = (u.name || '').toLowerCase();
      return mentionedNames.some((n) => userName === n.toLowerCase());
    });

    if (matchedUsers.length === 0) return;

    // 4. 构建帖子链接
    const origin = 'https://mi-to-ai.com';
    const basePath = postType === 'questions' ? '/questions' : '/community';
    const postUrl = `${origin}${basePath}/${postId}`;

    // 5. 发送飞书通知
    const notificationPromises = matchedUsers.map(async (user) => {
      const title = `${commenterName} 在帖子中 @了你`;
      const content = [
        `**帖子**: ${postTitle}`,
        `**评论者**: ${commenterName}`,
        `**评论内容**: ${commentContent.substring(0, 200)}${commentContent.length > 200 ? '...' : ''}`,
      ].join('\n');

      return sendFeishuNotification(title, content, postUrl);
    });

    await Promise.allSettled(notificationPromises);
  } catch (err) {
    console.error('[notifications] notifyMentionedUsers error:', err);
  }
}
