import React from 'react';

interface PointsRulesTabProps {
  locale?: 'zh' | 'en';
}

export default function PointsRulesTab({ locale = 'zh' }: PointsRulesTabProps) {
  const t = {
    title: locale === 'zh' ? '积分规则' : 'Points Rules',
    subtitle: locale === 'zh'
      ? '通过活跃参与社区赚取积分，解锁更多特权'
      : 'Earn points by actively participating in the community and unlock more privileges',
    earn: locale === 'zh' ? '如何获得积分' : 'How to Earn',
    spend: locale === 'zh' ? '积分消耗方式' : 'How to Spend',
    level: locale === 'zh' ? '积分等级特权' : 'Points Level Privileges',
    rules: locale === 'zh' ? '积分规则说明' : 'Points Rules',
    rulesList: locale === 'zh' ? [
      '积分不可转让、不可提现，仅限本平台使用',
      '同一用户对同一帖子只能点赞一次，多次点赞不重复计分',
      '发现刷分、作弊等行为，平台有权扣除全部积分并封禁账号',
      '积分政策可能根据运营需要调整，届时会在站内公告通知',
      '最终解释权归 MI TO AI 平台所有',
    ] : [
      'Points are non-transferable and cannot be withdrawn, for platform use only',
      'Each user can only like a post once; multiple likes do not count multiple times',
      'Platform reserves the right to deduct all points and ban accounts for cheating',
      'Points policy may be adjusted based on operational needs with site-wide notice',
      'Final interpretation rights belong to MI TO AI platform',
    ],
    cta: locale === 'zh' ? '想快速获得更多积分特权？' : 'Want to earn more points faster?',
    ctaBtn: locale === 'zh' ? '赞助我们' : 'Sponsor Us',
    items: {
      earn: [
        { icon: '📝', title: locale === 'zh' ? '发布帖子' : 'Post', amount: '+5', desc: locale === 'zh' ? '发布一条问题或分享内容，被审核通过后获得' : 'Post a question or share content, approved by review' },
        { icon: '💬', title: locale === 'zh' ? '帖子被评论' : 'Comment', amount: '+3', desc: locale === 'zh' ? '你的帖子收到其他用户的评论' : 'Your post receives comments from other users' },
        { icon: '👍', title: locale === 'zh' ? '收到点赞' : 'Like', amount: '+1', desc: locale === 'zh' ? '你的帖子或评论收到其他用户的点赞' : 'Your post or comment receives likes' },
        { icon: '⭐', title: locale === 'zh' ? '收到收藏' : 'Favorite', amount: '+2', desc: locale === 'zh' ? '你的帖子被其他用户收藏' : 'Your post is favorited by other users' },
        { icon: '🔗', title: locale === 'zh' ? '分享帖子' : 'Share', amount: '+1', desc: locale === 'zh' ? '分享帖子到社交媒体或其他平台' : 'Share post to social media or other platforms' },
        { icon: '🎯', title: locale === 'zh' ? '被设为精选' : 'Featured', amount: '+10', desc: locale === 'zh' ? '你的帖子被管理员精选推荐' : 'Your post is featured by admins' },
      ],
      spend: [
        { icon: '📌', title: locale === 'zh' ? '置顶帖子' : 'Pin Post', amount: '50 ' + (locale === 'zh' ? '积分/天' : 'pts/day'), desc: locale === 'zh' ? '让你的帖子在列表顶部展示一天，获得更多曝光' : 'Show your post at the top for one day for more visibility' },
        { icon: '🔥', title: locale === 'zh' ? '热门助推' : 'Boost', amount: '20 ' + (locale === 'zh' ? '积分/次' : 'pts/time'), desc: locale === 'zh' ? '短时间内提升帖子热度，增加曝光机会' : 'Boost post heat for a short time, increase exposure' },
        { icon: '🎁', title: locale === 'zh' ? '礼物赠送' : 'Gift', amount: locale === 'zh' ? '自定义积分' : 'Custom pts', desc: locale === 'zh' ? '将积分赠送给喜欢的帖子作者，支持优质内容' : 'Gift points to post authors you like to support quality content' },
        { icon: '🎖️', title: locale === 'zh' ? '精选推荐' : 'Feature', amount: '100 ' + (locale === 'zh' ? '积分/次' : 'pts/time'), desc: locale === 'zh' ? '直接申请精选推荐，让优质内容获得官方认证' : 'Apply for featured recommendation, get official certification' },
      ],
      levels: [
        { icon: '🌱', level: 'Lv.1', name: locale === 'zh' ? '新手用户' : 'New User', range: locale === 'zh' ? '0 - 49 积分' : '0 - 49 pts', desc: locale === 'zh' ? '基础发帖和评论功能' : 'Basic posting and comments' },
        { icon: '🌿', level: 'Lv.2', name: locale === 'zh' ? '活跃用户' : 'Active User', range: locale === 'zh' ? '50 - 199 积分' : '50 - 199 pts', desc: locale === 'zh' ? '解锁置顶功能' : 'Unlock pin feature' },
        { icon: '🌳', level: 'Lv.3', name: locale === 'zh' ? '资深用户' : 'Senior User', range: locale === 'zh' ? '200 - 499 积分' : '200 - 499 pts', desc: locale === 'zh' ? '解锁热门助推和精选推荐' : 'Unlock boost and feature' },
        { icon: '⭐', level: 'Lv.4', name: locale === 'zh' ? '核心贡献者' : 'Core Contributor', range: locale === 'zh' ? '500+ 积分' : '500+ pts', desc: locale === 'zh' ? '全部特权 + 社区荣誉标识' : 'All privileges + community badge' },
      ],
    },
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{t.title}</h2>
        <p className="text-sm text-gray-500">{t.subtitle}</p>
      </div>

      {/* How to Earn */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-7 h-7 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">+</span>
          {t.earn}
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {t.items.earn.map((item, i) => (
            <div key={i} className="p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{item.icon}</span>
                <span className="font-semibold text-gray-900 text-sm">{item.title}</span>
                <span className="ml-auto text-green-600 font-bold text-sm">{item.amount}</span>
              </div>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How to Spend */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-7 h-7 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">−</span>
          {t.spend}
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {t.items.spend.map((item, i) => (
            <div key={i} className="p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{item.icon}</span>
                <span className="font-semibold text-gray-900 text-sm">{item.title}</span>
                <span className="ml-auto text-orange-600 font-bold text-sm">{item.amount}</span>
              </div>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Level System */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-lg">🏆</span>
          {t.level}
        </h3>
        <div className="space-y-2">
          {t.items.levels.map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-3 border border-gray-200 rounded-xl">
              <div className="w-12 text-center">
                <div className="text-xl mb-0.5">{item.icon}</div>
                <div className="text-xs font-medium text-gray-500">{item.level}</div>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-sm">{item.name}</div>
                <div className="text-xs text-gray-500">{item.range} · {item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rules */}
      <div className="bg-gray-50 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-3">{t.rules}</h3>
        <ul className="space-y-2">
          {t.rulesList.map((rule, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-600">
              <span className="text-red-500 flex-shrink-0">•</span>
              {rule}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="text-center">
        <p className="text-gray-500 text-sm mb-3">{t.cta}</p>
        <a
          href="/sponsor"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors text-sm"
        >
          <span>❤️</span>
          {t.ctaBtn}
        </a>
      </div>
    </div>
  );
}
