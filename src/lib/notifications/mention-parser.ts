/**
 * @mention 解析工具
 * 从评论内容中提取 @username 提及
 */

export function parseMentions(content: string): string[] {
  // Match @username patterns (supports Chinese, English, numbers, underscore)
  const mentionRegex = /@([\w\u4e00-\u9fff]+)/g;
  const mentions: string[] = [];
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  return [...new Set(mentions)]; // deduplicate
}
