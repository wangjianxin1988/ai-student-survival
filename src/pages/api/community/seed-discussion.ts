export const prerender = false;

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import { env as cfEnv } from 'cloudflare:workers';

export const POST: APIRoute = async () => {

    // Production guard: disable seed/migration APIs
    if (import.meta.env.PROD) {
      return new Response(JSON.stringify({ error: 'Forbidden in production' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  // @ts-ignore
  const rawKey = (cfEnv as Record<string, unknown>)['SUPABASE_SERVICE_ROLE_KEY'];
  const serviceRoleKey = typeof rawKey === 'string' && rawKey.length > 0 ? rawKey : null;

  if (!serviceRoleKey) {
    return new Response(
      JSON.stringify({ success: false, error: 'SUPABASE_SERVICE_ROLE_KEY not available' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabaseUrl = 'https://giynvpfnzzelzwpmsgtf.supabase.co';
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 4 test post IDs to delete
  const testPostIds = [
    '4f8f3aed-ce71-42c3-ab53-2fc678a36e38',
    '4bdf45be-c026-4370-a28d-cba9b8e1f1b6',
    'bb995694-634c-4b81-bbd6-70333ba36f35',
    '92d5127e-186e-472c-b886-2315110bf819',
  ];

  // Seed 4 real discussion posts
  const discussionPosts = [
    {
      id: 'd0010001-0001-0001-0001-000000000001',
      title: 'ChatGPT帮我写论文会被Turnitin检测出来吗？',
      content: `用ChatGPT辅助写论文已经不是什么新鲜事了，但我一直担心会不会被查出来。上次用Turnitin跑了一遍，AI检测部分标红了23%，导师说太高了吓得我赶紧重写。

我现在的用法是：让它帮我润色句子、改语法、找逻辑漏洞，但核心观点和论证都是我自己写的。这样算不算作弊啊？有没有人有过类似经历，最终是怎么处理的？`,
      excerpt: '用ChatGPT辅助写论文已经不是什么新鲜事了，但我一直担心会不会被查出来...',
      tags: ['AI写作', '论文', 'Turnitin'],
      likes_count: 47,
      comments_count: 0,
      views_count: 1234,
      favorites_count: 12,
      created_at: '2026-05-20T10:00:00Z',
    },
    {
      id: 'd0010002-0002-0002-0002-000000000002',
      title: '留学在外，独自过春节是什么体验？',
      content: `今年是我第一次在国外过春节。一个人窝在公寓里看春晚重播，窗外没有鞭炮声，没有亲戚串门，连外卖都点不到。想跟爸妈视频又怕自己忍不住哭出来让他们担心。

后来几个朋友拉了个火锅局，七八个人挤在小公寓里吃电磁炉火锅，聊到凌晨两点。那种感觉居然比在家过年还热闹。留学的苦和甜，真的只有经历过的人才懂。

大家国外过春节都是怎么过的？有没有什么特别的经历？`,
      excerpt: '今年是我第一次在国外过春节。一个人窝在公寓里看春晚重播...',
      tags: ['留学生活', '春节', '独居'],
      likes_count: 89,
      comments_count: 0,
      views_count: 2341,
      favorites_count: 31,
      created_at: '2026-05-19T14:30:00Z',
    },
    {
      id: 'd0010003-0003-0003-0003-000000000003',
      title: '推荐几个我留学期间离不开的神仙App',
      content: `留学两年，手机里装了一堆App，有些用了就再也离不开了：

1. **Otter.ai** - 课堂录音自动转文字，再也不怕听不懂教授口音了
2. **Google Lens** - 菜单路牌一扫就翻译，点菜再也不尴尬
3. **Too Good To Go** - 超市/面包店尾货打折，经常3磅买一大袋
4. **UNIDAYS** - 学生折扣码集合，Amazon、Nike等都有专属优惠
5. **Splitwise** - 和室友算账神器，再也不会因为谁多花了钱吵架

大家还有什么私藏好物App？求推荐！`,
      excerpt: '留学两年，手机里装了一堆App，有些用了就再也离不开了...',
      tags: ['App推荐', '留学工具', '省钱'],
      likes_count: 156,
      comments_count: 0,
      views_count: 3456,
      favorites_count: 67,
      created_at: '2026-05-18T09:15:00Z',
    },
    {
      id: 'd0010004-0004-0004-0004-000000000004',
      title: '被中介坑了4万块，讲讲我的维权经历',
      content: `申请的时候找了一家中介，承诺申不到前十退款。交了4万，结果只申到了第八名开外。去找他们退款，各种拖延踢皮球，态度还特别差。

后来我做了几件事：
1. 把所有合同、聊天记录、付款凭证全部截图保存
2. 打了消费者协会电话投诉
3. 在小红书发了帖子曝光，结果评论区发现至少还有十几个人被坑
4. 最后联名请了律师发了律师函

现在虽然还没完全解决，但至少拿到了60%的退款。提醒大家签合同一定要看清楚退款条款，不要相信口头承诺！`,
      excerpt: '申请的时候找了一家中介，承诺申不到前十退款。交了4万，结果只申到了第八名开外...',
      tags: ['中介坑', '维权', '留学申请'],
      likes_count: 234,
      comments_count: 0,
      views_count: 5678,
      favorites_count: 98,
      created_at: '2026-05-17T16:45:00Z',
    },
  ];

  const testUserId = '7fa8052c-4d62-4ec6-947d-9d49ba927b76';

  // Delete test posts
  const { error: deleteError } = await supabaseAdmin
    .from('community_posts')
    .delete()
    .in('id', testPostIds);

  // Upsert real discussion posts (safe to call even if test posts still exist)
  const { data: insertedPosts, error: insertError } = await supabaseAdmin
    .from('community_posts')
    .upsert(
      discussionPosts.map((p) => ({
        id: p.id,
        user_id: testUserId,
        title: p.title,
        content: p.content,
        excerpt: p.excerpt,
        category: 'discussion' as const,
        tags: p.tags,
        images: [] as string[],
        likes_count: p.likes_count,
        comments_count: 0,
        views_count: p.views_count,
        favorites_count: p.favorites_count,
        is_pinned: false,
        is_locked: false,
        auto_promoted: false,
        status: 'published' as const,
        created_at: p.created_at,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'id' }
    )
    .select('id');

  if (insertError) {
    return new Response(
      JSON.stringify({ success: false, error: `Insert posts failed: ${insertError.message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Seed comments for ALL posts (both Q&A and discussion)
  // Get all posts first
  const { data: allPosts } = await supabaseAdmin
    .from('community_posts')
    .select('id, category')
    .eq('status', 'published');

  const commentTemplates: Record<string, Array<{ content: string; userIdx: number }>> = {
    academic: [
      { content: '我用的是QuillBot paraphrase，效果还不错，但记得还是要自己改写一下逻辑句式。', userIdx: 1 },
      { content: '其实关键是要理解内容用自己的话表达，而不是简单换词。Turnitin现在对AI的识别率已经很高了。', userIdx: 2 },
      { content: '同求！我导师说引用格式不对也会被标红，求一个规范的引用模板。', userIdx: 3 },
      { content: '我一般先自己写完，再用AI润色，同时把润色前后的版本对比，确保核心意思不变。', userIdx: 4 },
    ],
    life: [
      { content: 'Loneliness is part of the journey, but it does get better! Try joining some clubs or sports teams. ', userIdx: 1 },
      { content: '第一年我也是一个人过年，后来发现教会活动、中国学生会都有春节聚会，可以去蹭饭哈哈。', userIdx: 2 },
      { content: '和爸妈视频的时候不要硬撑，想哭就哭出来，他们其实都懂的。', userIdx: 3 },
      { content: '我去年春节和几个中国朋友一起包饺子，感觉比在家还有年味！', userIdx: 4 },
    ],
    visa: [
      { content: 'F1 can work on-campus up to 20 hours/week during term. Off-campus requires CPT or OPT authorization.', userIdx: 1 },
      { content: '偷偷打黑工被查到的话轻则遣返，重则永久禁止入境，真的不要铤而走险。', userIdx: 2 },
      { content: 'CPT可以用在毕业前，OPT是毕业后用的，两者不冲突但CPT用太多确实可能影响OPT。', userIdx: 3 },
      { content: '学校的国际学生办公室是最好的资源，别自己瞎查，直接去问他们最靠谱。', userIdx: 4 },
    ],
    job: [
      { content: '学校的Career Center一定要多去！他们改简历是免费的，而且和企业有合作。', userIdx: 1 },
      { content: '简历投了没回复很正常，我前50份也是全拒信，后来改了模版中了率翻倍。', userIdx: 2 },
      { content: 'LinkedIn真的很重要！很多岗位根本没公开发，直接被猎头找上门。', userIdx: 3 },
      { content: '我建议先做几份不同版本的简历，针对不同类型的岗位，别一份简历投天下。', userIdx: 4 },
    ],
    discussion: [
      { content: 'Otter.ai真的好用！用它录过好几次课，回头复习效率高多了。', userIdx: 1 },
      { content: 'Too Good To Go我也用！经常能抢到超市的尾货，3磅一大袋面包，够吃一周。', userIdx: 2 },
      { content: 'UNIDAYS太好用了，Amazon Prime学生版半价，Adobe全家桶也是免费。', userIdx: 3 },
      { content: '补充一个：Teamscope，每天自动记录学习时间，用了之后明显效率提升。', userIdx: 4 },
    ],
    default: [
      { content: '这个问题我也遇到过！最后是怎么解决的呀？', userIdx: 1 },
      { content: '感谢分享！正准备遇到同样的问题，收藏了。', userIdx: 2 },
      { content: '感觉这个话题值得深入讨论，有没有人有更多经验？', userIdx: 3 },
    ],
  };

  const replyingUserIds = [
    'd563d665-598e-45d9-a79d-41fe40a0cde2',
    '7fa8052c-4d62-4ec6-947d-9d49ba927b76',
  ];

  const commentsToInsert: Array<{
    post_id: string;
    user_id: string;
    content: string;
    status: string;
    created_at: string;
  }> = [];

  for (const post of allPosts || []) {
    const templates = commentTemplates[post.category] || commentTemplates.default;
    const commentCount = Math.min(templates.length, 2 + Math.floor(Math.random() * 3));
    for (let i = 0; i < commentCount; i++) {
      const t = templates[i % templates.length];
      const daysAgo = (i + 1) * 2;
      const commentDate = new Date();
      commentDate.setDate(commentDate.getDate() - daysAgo);
      commentsToInsert.push({
        post_id: post.id,
        user_id: replyingUserIds[t.userIdx % replyingUserIds.length],
        content: t.content,
        status: 'published',
        created_at: commentDate.toISOString(),
      });
    }
  }

  if (commentsToInsert.length > 0) {
    const { error: commentsError } = await supabaseAdmin
      .from('post_comments')
      .insert(commentsToInsert);

    if (commentsError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Insert comments failed: ${commentsError.message}`,
          postsSeeded: insertedPosts?.length || 0,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update comments_count on all posts
    const postIds = (allPosts || []).map((p) => p.id);
    for (const pid of postIds) {
      const count = commentsToInsert.filter((c) => c.post_id === pid).length;
      await supabaseAdmin
        .from('community_posts')
        .update({ comments_count: count })
        .eq('id', pid);
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: `Seeded ${insertedPosts?.length || 0} discussion posts with ${commentsToInsert.length} comments`,
      discussionPostIds: insertedPosts?.map((p) => p.id),
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
