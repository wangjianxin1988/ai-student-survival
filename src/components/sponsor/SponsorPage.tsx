import React, { useState, useEffect, useRef } from 'react';
import { getCurrentUser, initAuth, onAuthStateChange, type DemoUser } from '@/lib/auth';

interface Sponsor {
  id: string;
  nickname: string;
  display_name?: string;
  amount: number;
  tier: string;
  payment_method: string;
  message: string | null;
  avatar_url?: string;
  profile_url?: string;
  created_at: string;
}

const WECHAT_ID = 'jian_xin_happy';
const ALIPAY_ID = '18801400211';

const tiers = [
  { key: 'coffee', zh: '☕ 一杯咖啡', en: '☕ A Coffee', minAmount: 0, maxAmount: 11.99, suggestedAmount: 6.6, points: 66 },
  { key: 'meal', zh: '🍜 一顿饭', en: '🍜 A Meal', minAmount: 12, maxAmount: 49.99, suggestedAmount: 18.8, points: 188 },
  { key: 'super', zh: '🎉 超级赞助', en: '🎉 Super Sponsor', minAmount: 50, maxAmount: 199.99, suggestedAmount: 66.6, points: 666 },
  { key: 'custom', zh: '💎 自定义', en: '💎 Custom', minAmount: 0, maxAmount: Infinity, suggestedAmount: 0, points: 0 },
];

function detectTier(amount: number): string {
  if (amount >= 50) return 'super';
  if (amount >= 12) return 'meal';
  if (amount > 0) return 'coffee';
  return 'custom';
}

function getTierLabel(key: string, locale: 'zh' | 'en') {
  const t = tiers.find(t => t.key === key);
  if (!t) return key;
  return locale === 'zh' ? t.zh : t.en;
}

const tierColors: Record<string, { bg: string; border: string; badge: string; icon: string }> = {
  coffee: { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-600', icon: '☕' },
  meal: { bg: 'bg-primary-50', border: 'border-primary-200', badge: 'bg-primary-100 text-primary-700', icon: '🍜' },
  super: { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', icon: '🎉' },
  custom: { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700', icon: '💎' },
};

interface SponsorPageProps {
  locale?: 'zh' | 'en';
}

export default function SponsorPage({ locale = 'zh' }: SponsorPageProps) {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<DemoUser | null>(null);
  const [activeTab, setActiveTab] = useState<'wechat' | 'alipay'>('wechat');

  // Form state
  const [nickname, setNickname] = useState('');
  const [amount, setAmount] = useState('');
  const [tier, setTier] = useState<string>('meal');
  const [message, setMessage] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMsg, setSubmitMsg] = useState('');
  const [copyWechat, setCopyWechat] = useState(false);
  const [copyAlipay, setCopyAlipay] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initAuth().then(u => setUser(u));
    const unsub = onAuthStateChange(u => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    fetch('/api/sponsors/wall')
      .then(r => r.json())
      .then(data => {
        if (data.success) setSponsors(data.data || []);
      })
      .catch(() => {/* ignore */})
      .finally(() => setLoading(false));
  }, []);

  const handleCopyWechat = async () => {
    await navigator.clipboard.writeText(WECHAT_ID);
    setCopyWechat(true);
    setTimeout(() => setCopyWechat(false), 2000);
  };

  const handleCopyAlipay = async () => {
    await navigator.clipboard.writeText(ALIPAY_ID);
    setCopyAlipay(true);
    setTimeout(() => setCopyAlipay(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setSubmitStatus('error');
      setSubmitMsg(locale === 'zh' ? '请先登录后再提交记录' : 'Please login first');
      return;
    }

    if (!nickname.trim() || !amount) {
      setSubmitStatus('error');
      setSubmitMsg(locale === 'zh' ? '请填写昵称和金额' : 'Please fill in nickname and amount');
      return;
    }

    setSubmitting(true);
    setSubmitStatus('idle');

    try {
      const headers: Record<string, string> = {};
      const token = localStorage.getItem('demo_token') || localStorage.getItem('supabase-token');
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const finalTier = tier === 'custom' ? detectTier(parseFloat(amount) || 0) : tier;

      const res = await fetch('/api/sponsors/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          nickname: nickname.trim(),
          amount: parseFloat(amount),
          tier: finalTier,
          paymentMethod: activeTab === 'wechat' ? 'wechat' : 'alipay',
          message: message.trim(),
          profileUrl: profileUrl.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitStatus('success');
        const points = data.points || 0;
        setSubmitMsg(locale === 'zh'
          ? `感谢您的赞助！${points > 0 ? `已获得 ${points} 积分奖励！` : ''}`
          : `Thank you for your sponsorship!${points > 0 ? ` You earned ${points} points!` : ''}`);
        setNickname('');
        setAmount('');
        setMessage('');
        setProfileUrl('');
        // Refresh sponsor wall
        const wallRes = await fetch('/api/sponsors/wall');
        const wallData = await wallRes.json();
        if (wallData.success) setSponsors(wallData.data || []);
      } else {
        setSubmitStatus('error');
        setSubmitMsg(data.error?.message || (locale === 'zh' ? '提交失败，请稍后重试' : 'Failed to submit'));
      }
    } catch {
      setSubmitStatus('error');
      setSubmitMsg(locale === 'zh' ? '提交失败，请稍后重试' : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const t = {
    title: locale === 'zh' ? '赞助我们' : 'Sponsor Us',
    subtitle: locale === 'zh'
      ? '感谢你的支持，让 MI TO AI 能够持续为留学生群体提供帮助'
      : 'Your support keeps MI TO AI running and helping international students',
    intro: locale === 'zh'
      ? 'MI TO AI 是一个非营利性的留学生互助平台，服务器成本、内容维护、工具开发都需要持续的投入。你的每一份支持，都将直接用于平台的运营和发展。'
      : 'MI TO AI is a non-profit platform for international students. Every contribution goes directly to platform operations and development.',
    sponsorMethods: locale === 'zh' ? '赞助方式' : 'Ways to Sponsor',
    wechat: locale === 'zh' ? '微信转账' : 'WeChat Transfer',
    alipay: locale === 'zh' ? '支付宝转账' : 'Alipay Transfer',
    addWechat: locale === 'zh' ? `添加微信好友` : 'Add WeChat',
    addWechatDesc: locale === 'zh'
      ? '添加后备注"赞助"，直接转账即可。转账时请注明您的昵称（可选），我们会记录并感谢。'
      : 'Add as friend, note "sponsor", and send a transfer. Your nickname will be recorded.',
    alipayDesc: locale === 'zh'
      ? '支付宝账号转账，备注"赞助"即可。'
      : 'Transfer to Alipay account, note "sponsor".',
    copy: locale === 'zh' ? '复制' : 'Copy',
    copied: locale === 'zh' ? '已复制!' : 'Copied!',
    wechatId: locale === 'zh' ? '微信号' : 'WeChat ID',
    alipayAcc: locale === 'zh' ? '支付宝' : 'Alipay',
    usageTitle: locale === 'zh' ? '赞助资金用途' : 'How Funds Are Used',
    usage: [
      { icon: '🖥️', zh: { title: '服务器费用', desc: '网站托管、数据库、云存储等基础设施费用' }, en: { title: 'Server Costs', desc: 'Website hosting, database, cloud storage infrastructure' } },
      { icon: '🔧', zh: { title: '工具开发', desc: '持续开发新功能、优化用户体验' }, en: { title: 'Tool Development', desc: 'New features, UX improvements, and maintenance' } },
      { icon: '📝', zh: { title: '内容运营', desc: '翻译、整理、更新留学生相关政策信息' }, en: { title: 'Content Ops', desc: 'Translation, curation, and updates of student policies' } },
      { icon: '🎁', zh: { title: '积分返还', desc: '赞助用户可获得平台积分，用于置顶等功能' }, en: { title: 'Points Reward', desc: 'Sponsors receive platform points for features like post pinning' } },
    ],
    tiersTitle: locale === 'zh' ? '赞助回馈' : 'Sponsor Rewards',
    sponsorWallTitle: locale === 'zh' ? '赞助墙' : 'Sponsor Wall',
    sponsorWallDesc: locale === 'zh' ? '感谢以下同学的支持（按时间排序）' : 'Thanks to all our sponsors (newest first)',
    noSponsors: locale === 'zh' ? '暂无赞助记录' : 'No sponsors yet',
    contactNote: locale === 'zh' ? '如果你是赞助用户，请联系微信 jian_xin_happy 留下你的昵称' : 'If you sponsored us, contact WeChat jian_xin_happy to add your name',
    recordTitle: locale === 'zh' ? '记录赞助' : 'Record Sponsorship',
    recordDesc: locale === 'zh' ? '赞助后在这里记录您的赞助信息，我们会为您增加积分奖励' : 'Record your sponsorship to receive points rewards',
    nickname: locale === 'zh' ? '昵称' : 'Nickname',
    nicknamePlaceholder: locale === 'zh' ? '您的昵称（将显示在赞助墙）' : 'Your nickname (shown on sponsor wall)',
    amountLabel: locale === 'zh' ? '赞助金额 (元)' : 'Amount (¥)',
    amountPlaceholder: locale === 'zh' ? '例如：18.8' : 'e.g. 18.8',
    selectTier: locale === 'zh' ? '选择赞助档位' : 'Select tier',
    messageLabel: locale === 'zh' ? '留言（可选）' : 'Message (optional)',
    messagePlaceholder: locale === 'zh' ? '留下您的鼓励和祝福...' : 'Leave your message...',
    profileUrlLabel: locale === 'zh' ? '个人主页（可选）' : 'Personal Homepage (optional)',
    profileUrlPlaceholder: locale === 'zh' ? '如 https://mi-to-ai.com/user/xxx' : 'e.g. https://mi-to-ai.com/user/xxx',
    submit: locale === 'zh' ? '提交记录' : 'Submit Record',
    submitting: locale === 'zh' ? '提交中...' : 'Submitting...',
    loginRequired: locale === 'zh' ? '请先登录后再提交' : 'Please login first',
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Intro */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">❤️</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.title}</h2>
        <p className="text-gray-600 leading-relaxed max-w-xl mx-auto">{t.intro}</p>
      </div>

      {/* Sponsor Methods - WeChat/Alipay Tabs */}
      <div className="mb-10">
        {/* Payment method tabs */}
        <div className="flex gap-2 mb-4 justify-center">
          <button
            onClick={() => setActiveTab('wechat')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'wechat'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            💚 {t.wechat}
          </button>
          <button
            onClick={() => setActiveTab('alipay')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'alipay'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🔵 {t.alipay}
          </button>
        </div>

        {/* WeChat Panel */}
        {activeTab === 'wechat' && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 md:p-8 border border-green-100">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* QR Code */}
              <div className="w-40 h-40 bg-white rounded-xl flex items-center justify-center border-2 border-green-200 flex-shrink-0 overflow-hidden">
                <img
                  src="/images/wechat-qr.png?v=20260527"
                  alt="WeChat QR Code"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML =
                      '<div class="text-center"><div class="text-5xl mb-2">💚</div><div class="text-xs text-gray-400">微信二维码</div></div>';
                  }}
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t.addWechat}</h3>
                <p className="text-gray-600 mb-4">{t.addWechatDesc}</p>
                <div className="flex items-center gap-4 justify-center md:justify-start">
                  <div className="bg-white px-4 py-2 rounded-lg border border-green-200">
                    <span className="text-sm text-gray-500">{t.wechatId}：</span>
                    <span className="font-bold text-green-600">{WECHAT_ID}</span>
                  </div>
                  <button
                    onClick={handleCopyWechat}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {copyWechat ? t.copied : t.copy}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alipay Panel */}
        {activeTab === 'alipay' && (
          <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl p-6 md:p-8 border border-blue-100">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* QR Code */}
              <div className="w-40 h-40 bg-white rounded-xl flex items-center justify-center border-2 border-blue-200 flex-shrink-0 overflow-hidden">
                <img
                  src="/images/alipay-qr.png?v=20260527"
                  alt="Alipay QR Code"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML =
                      '<div class="text-center"><div class="text-5xl mb-2">🔵</div><div class="text-xs text-gray-400">支付宝二维码</div></div>';
                  }}
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t.alipay}</h3>
                <p className="text-gray-600 mb-4">{t.alipayDesc}</p>
                <div className="flex items-center gap-4 justify-center md:justify-start">
                  <div className="bg-white px-4 py-2 rounded-lg border border-blue-200">
                    <span className="text-sm text-gray-500">{t.alipayAcc}：</span>
                    <span className="font-bold text-blue-600">{ALIPAY_ID}</span>
                  </div>
                  <button
                    onClick={handleCopyAlipay}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {copyAlipay ? t.copied : t.copy}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Usage */}
      <div className="bg-gray-50 rounded-2xl p-6 md:p-8 mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">{t.usageTitle}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {t.usage.map((item, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {locale === 'zh' ? item.zh.title : item.en.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {locale === 'zh' ? item.zh.desc : item.en.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sponsor Tiers */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t.tiersTitle}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {tiers.map((t) => {
            const isCustom = t.key === 'custom';
            return (
              <div
                key={t.key}
                className={`p-4 rounded-xl text-center border-2 transition-all ${
                  tier === t.key
                    ? 'border-primary-400 bg-primary-50 relative shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {t.key === 'meal' && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                    {locale === 'zh' ? '推荐' : 'Popular'}
                  </div>
                )}
                <div className="text-2xl mb-1.5">{tierColors[t.key]?.icon || '💎'}</div>
                <div className="font-bold text-gray-900 text-sm mb-0.5">
                  {locale === 'zh' ? t.zh : t.en}
                </div>
                {!isCustom && (
                  <div className="text-primary-600 font-bold text-sm mb-0.5">
                    ¥{t.suggestedAmount.toFixed(1)}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  {t.key === 'custom'
                    ? (locale === 'zh' ? '自定义金额' : 'Custom amount')
                    : `+${t.points} ${locale === 'zh' ? '积分' : 'pts'}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Record Sponsor Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">{t.recordTitle}</h2>
        <p className="text-sm text-gray-500 text-center mb-5">{t.recordDesc}</p>

        {submitStatus !== 'idle' && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            submitStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {submitMsg}
          </div>
        )}

        {!user && (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-3">{t.loginRequired}</p>
            <a
              href="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              {locale === 'zh' ? '去登录' : 'Login'}
            </a>
          </div>
        )}

        {user && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.nickname} *</label>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder={t.nicknamePlaceholder}
                required
                maxLength={50}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            {/* Tier selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.selectTier}</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                {tiers.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => {
                      const detected = t.key === 'custom' ? 'custom' : t.key;
                      setTier(detected);
                      if (t.key !== 'custom') {
                        setAmount(t.suggestedAmount.toString());
                      } else {
                        setAmount('');
                        setTimeout(() => amountInputRef.current?.focus(), 50);
                      }
                    }}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                      tier === t.key
                        ? 'border-primary-400 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-base mb-0.5">{tierColors[t.key]?.icon || '💎'}</div>
                    <div className="text-xs">{locale === 'zh' ? t.zh : t.en}</div>
                    {t.key !== 'custom' && (
                      <div className="text-xs font-bold">¥{t.suggestedAmount.toFixed(1)}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.amountLabel} *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">¥</span>
                <input
                  ref={amountInputRef}
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAmount(val);
                    if (val && parseFloat(val) > 0) {
                      setTier(detectTier(parseFloat(val)));
                    }
                  }}
                  placeholder={tier === 'custom' ? (locale === 'zh' ? '输入自定义金额...' : 'Enter custom amount...') : t.amountPlaceholder}
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
              {amount && parseFloat(amount) > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {locale === 'zh'
                    ? `预计获得 ${Math.round(parseFloat(amount) * 10)} 积分`
                    : `Estimated ${Math.round(parseFloat(amount) * 10)} points`}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.messageLabel}</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={t.messagePlaceholder}
                rows={3}
                maxLength={200}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.profileUrlLabel}</label>
              <input
                type="url"
                value={profileUrl}
                onChange={e => setProfileUrl(e.target.value)}
                placeholder={t.profileUrlPlaceholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {submitting ? t.submitting : t.submit}
            </button>
          </form>
        )}
      </div>

      {/* Sponsor Wall */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.sponsorWallTitle}</h2>
        <p className="text-gray-500 mb-6">{t.sponsorWallDesc}</p>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sponsors.length === 0 ? (
          <p className="text-gray-400 py-8">{t.noSponsors}</p>
        ) : (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {sponsors.map(sponsor => {
              const ProfileLink = ({ children }: { children: React.ReactNode }) =>
                sponsor.profile_url ? (
                  <a
                    href={sponsor.profile_url.startsWith('http') ? sponsor.profile_url : `/${locale}/user/${sponsor.profile_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {children}
                  </a>
                ) : (
                <span>{children}</span>
              );
              return (
                <div
                  key={sponsor.id}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${tierColors[sponsor.tier as keyof typeof tierColors]?.badge || 'bg-gray-100 text-gray-600'}`}
                  title={sponsor.message || undefined}
                >
                  <span>{tierColors[sponsor.tier as keyof typeof tierColors]?.icon || '💛'}</span>
                  {sponsor.avatar_url ? (
                    <img
                      src={sponsor.avatar_url}
                      alt={sponsor.nickname}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : null}
                  <ProfileLink>
                    <span className="font-medium">{sponsor.nickname}</span>
                  </ProfileLink>
                  {sponsor.amount >= 66 && <span className="text-xs">🎖️</span>}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-sm text-gray-400">{t.contactNote}</p>
      </div>
    </div>
  );
}
