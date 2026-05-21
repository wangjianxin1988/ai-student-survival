// Survival Guide types and data
// 防坑防骗指南数据模型

export interface SurvivalGuide {
  id: string;
  title: string;
  titleZh: string;
  category: 'scam' | 'culture' | 'safety' | 'legal' | 'other';
  country?: string;
  universityId?: string;
  content: string;
  contentZh: string;
  tags: string[];
  rating: number;
  ratingCount: number;
  viewCount: number;
  authorName: string;
  authorAvatar: string;
  isVerified: boolean;
  isHot: boolean;
  createdAt: string;
  updatedAt: string;
}

// Category configuration
export const SURVIVAL_CATEGORIES = {
  scam: { icon: '⚠️', label: '防骗指南', labelEn: 'Scam Prevention', description: '租房骗局、兼职骗局、换汇骗局' },
  culture: { icon: '🎭', label: '文化禁忌', labelEn: 'Culture', description: '各国文化禁忌、社交礼仪' },
  safety: { icon: '🔒', label: '安全提醒', labelEn: 'Safety', description: '周边治安、紧急联系' },
  legal: { icon: '⚖️', label: '法律须知', labelEn: 'Legal', description: '法律法规、签证规定' },
  other: { icon: '📌', label: '其他', labelEn: 'Other', description: '其他生存指南' },
} as const;

export type SurvivalCategory = keyof typeof SURVIVAL_CATEGORIES;

// Sample data - 12 survival guides covering various categories
export const survivalGuidesData: SurvivalGuide[] = [
  // ==================== SCAM CATEGORY ====================
  {
    id: 'rental-deposit-scam',
    title: 'Rental Deposit Scam: How to Protect Yourself',
    titleZh: '租房押金骗局：如何保护自己',
    category: 'scam',
    country: 'UK',
    content: `## I almost got scammed out of my deposit — Manchester rental horror story

Okay, I'm not proud of this. But in my first year at Manchester, I almost lost 280 quid to a "landlord" on Rightmove.

Here's what happened —

I found this flat listed at 680/month. That was like 200 less than everything else I'd seen. Red flag, right? But I was desperate and thought maybe the guy was just desperate to rent.

He said he was in Dubai. Couldn't do video calls. But he could ship me the keys. All I had to do was send the deposit to his HSBC account to "prove I was serious."

I was literally about to transfer the money when my flatmate stopped me. "Bro, this is the classic Deposit Scam." We looked up the listing — turns out the photos were stolen from a real estate site. That flat didn't exist.

---

So here's what I learned the hard way:

Never, ever pay any deposit before you've seen the place in person. A real landlord or agent will never ask you to wire money to someone's personal account. And if someone says they're "overseas" or "too busy to meet" — that's your cue to hang up and walk away.

**Real numbers to know:**
- UK Emergency: 999
- Non-emergency police: 101
- Action Fraud: 0300 123 2040`,
    contentZh: `## 我差点被房东骗了押金——伦敦租房血泪史

说出来丢人。我在Manchester念书的时候，差点被一个"房东"骗走280磅押金。

事情是这样的——

那天我在Rightmove上刷到一个flat，月租只要680磅，比市场价低了快200磅。我当时就觉得不对劲，但想着可能是运气好遇上了急着出租的房东。

对方说自己在迪拜做生意，不方便视频，但可以先把钥匙寄给我。他要我把押金打到他的HSBC账户，说这样他才能确认我是认真的。

**结果：** 我朋友拉住了我，说这是经典的Deposit Scam。后来我查了一下，那套房源用的是别人的照片，根本不存在。

---

### 所以，你们要记住：

永远不要在没看房之前付任何押金。正规中介不会让你先把钱打给个人账户。遇到"房东在国外/很着急"的借口，直接挂电话。

**紧急联系：**
- 英国报警：999
- 英国非紧急报警：101
- 反诈骗热线：0300 123 2040`,
    tags: ['租房', '押金', '英国', '防骗', 'Housing'],
    rating: 4.8,
    ratingCount: 2340,
    viewCount: 45600,
    authorName: '伦敦留学生小王',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wizard',
    isVerified: true,
    isHot: true,
    createdAt: '2026-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
  },
  {
    id: 'part-time-job-scam',
    title: 'Part-time Job Scam: False Promise of Easy Money',
    titleZh: '兼职刷单骗局：轻松赚钱的虚假承诺',
    category: 'scam',
    country: 'USA',
    content: `## How I got sucked into a "money-flipping" scam on Instagram

I know, I know — I was naive. But hear me out so you don't make the same mistake.

It started with a sponsored post. "Free Money Friday! DM us to learn how to make $500 this week!" I know, huge red flag. But I was broke and curious.

They DM'd me first. Said they worked with major brands, needed "reviewers." All I had to do was:
1. Send them $100 via CashApp
2. They'd send me $150 back
3. Keep $50 as my "commission"

First time? They actually sent $150. I thought I hit the jackpot.

Second time, I sent $500. They said I needed to "unlock" a higher tier by sending $200 more.

I did.

Then they ghosted. Account deleted. I was out $700 and felt like the biggest idiot on the planet.

---

### What I should've done:

Real jobs don't ask you to pay first. Period. If someone says "you have to send money to receive money" — you're looking at a scam.

**Red flags that were obvious in hindsight:**
- "Work from your phone!" "No experience needed!"
- They DM'd me first
- Everything happened through CashApp/Zelle, no paperwork
- The initial "proof" they sent was probably someone else's money

**If it sounds too good to be true:**
- Legitimate part-time work: $10-20/hour
- "Easy $500/day" doesn't exist
- No real company pays people to "flip money"

**Where to actually find work:**
- Your school's Career Center
- Indeed.com
- LinkedIn
- On-campus jobs (library, dining hall, etc.)`,
    contentZh: `## 我在Instagram上差点被骗——"刷单赚钱"的坑

我知道听起来很傻。但你们听我说完，别走我的老路。

一切始于一条赞助帖子。"周五免费送钱！私信我们了解如何一周赚500美元！"我知道，这已经是巨大的红旗了。但我当时穷疯了，还是很好奇。

他们主动私信我。说自己是正规品牌，需要"评论员"。我只需要：
1. 通过CashApp转给他们100美元
2. 他们会转回150美元
3. 我留50美元当"佣金"

第一次？他们真的转了150美元过来。我以为我发财了。

第二次，我转了500美元。他们说我需要"解锁"更高等级，再转200美元。

我照做了。

然后他们消失了。账号注销了。我亏了700美元，感觉自己是全世界最大的傻子。

---

### 我本该做的：

真正的工作不会让你先交钱。永远不会有。如果有人说"你得先汇款才能收到钱"——这就是诈骗。

**现在回想那些明显的红旗：**
- "用手机就能工作！""不需要经验！"
- 他们主动私信我
- 所有交易都通过CashApp/Zelle，没有任何文件
- 最初的"证明"可能是别人的钱

**真的想找兼职？**
- 学校Career Center
- Indeed.com
- LinkedIn
- 校园内的工作（图书馆、食堂等）`,
    tags: ['兼职', '刷单', '诈骗', '美国', '防骗'],
    rating: 4.9,
    ratingCount: 4520,
    viewCount: 89200,
    authorName: '纽约留学生小李',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ninja',
    isVerified: true,
    isHot: true,
    createdAt: '2026-03-10T15:30:00Z',
    updatedAt: '2024-03-10T15:30:00Z',
  },
  {
    id: 'currency-exchange-scam',
    title: 'Currency Exchange Scam: The Hidden Dangers',
    titleZh: '换汇被骗案例：隐藏的危险',
    category: 'scam',
    country: 'Australia',
    content: `## I lost 80,000 RMB to someone I thought I could trust

This one still hurts to talk about.

It was my second month in Sydney. I needed to pay tuition and the bank transfer was taking forever, charging insane fees. A friend of a friend said she knew someone in a WeChat group who could do it faster, better rate.

She showed me screenshots of past transactions. Successful ones. People thanking her in the chat.

The rate was 0.2 below market. Not suspicious enough to question, right?

I tested with 5,000 RMB first. She delivered. Same day.

So I sent 80,000 RMB for the full tuition.

Gone. She blocked me. The WeChat group was deleted. My "friend" said she had no idea.

---

### The thing about private exchange:

There's no safety net. No buyer protection. No one to call. You're trusting a stranger with your money, and once it's gone, it's gone.

**What I learned:**

Just use the bank. Yes, fees suck. Yes, it's slow. But your money arrives.

If you must use private exchange:
- Only deal with people you know IRL, not "friend of a friend"
- Never send large amounts in one transfer
- Accept that you're taking a risk

**Better alternatives:**
- Bank wire transfer (slow but safe)
- Wise (decent rates, legitimate)
- Western Union (if speed matters)
- Alipay International (convenient if you already use it)

**If you do get scammed:**
- Screenshot everything immediately
- Report to Australian police (131 444)
- Contact your bank immediately — sometimes they can freeze accounts
- Report to Chinese consular services`,
    contentZh: `## 我因为换汇丢了8万块——悉尼留学生的噩梦

这件事我到现在提起来还难受。

那时候刚到悉尼第二个月。学费要交了，银行转账又慢手续费又高。朋友的朋友说她在微信群里认识一个人，可以更快更好汇率。

她给我看了截图，是之前的交易记录。成功的交易，群里的感谢消息。

汇率只比市场低0.2。不至于让人起疑，对吧？

我先用5000块试了一下。她确实当天就转过来了。

于是我把8万块学费全转了过去。

没了。她把我拉黑了。微信群解散了。我那个"朋友"说她也不知情。

---

### 私下换汇的问题：

没有任何保障。没有买家保护。出了事没人管。你是在把钱交给一个陌生人，而一旦转出去，就再也追不回来了。

**我学到的：**

就用银行。手续费是贵，速度是慢。但钱安全到账。

如果一定要私下换：
- 只跟你现实生活中真正认识的人交易，不是"朋友的朋友"
- 永远不要一次转大额
- 接受这个风险

**更靠谱的选择：**
- 银行电汇（慢但安全）
- Wise（汇率不错，正规）
- 西联汇款（速度快的时候用）
- 支付宝国际汇款（如果你已经在用的话）

**如果已经被骗了：**
- 立刻截图所有证据
- 报警（澳大利亚：131 444）
- 立刻联系你的银行——有时候能冻结账户
- 联系中国领事馆`,
    tags: ['换汇', '诈骗', '澳大利亚', '防骗', '微信'],
    rating: 4.7,
    ratingCount: 1890,
    viewCount: 34500,
    authorName: '悉尼留学生小张',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sydney',
    isVerified: true,
    isHot: false,
    createdAt: '2026-03-08T09:00:00Z',
    updatedAt: '2024-03-08T09:00:00Z',
  },
  {
    id: 'phone-scam',
    title: 'Phone Scam Targeting International Students',
    titleZh: '针对留学生的电话诈骗',
    category: 'scam',
    content: `## Three phone calls that almost broke me

I'm not proud of how close I came to falling for these. But I want you to learn from my panic.

---

**Call 1: "DHL"**

Ring ring. Unknown number.

"Hello, we are DHL. You have a package being held at customs. There is a problem with the documentation."

I had ordered something from China a week ago. My heart spiked.

"If you do not resolve this today, the package will be sent back or destroyed."

They transferred me to a "customs officer." He was very official. Very patient. Asked for my passport number to "verify the shipment."

That's when my roommate walked in and asked who I was talking to. I almost hung up.

I didn't. But I should've.

---

**Call 2: "Chinese Embassy"**

This one was smarter. They left a voicemail. In Chinese. With the official embassy greeting.

"You have an important document pending at the Chinese Embassy. Please press 1 to callback."

I pressed 1. They told me there was a parcel with "suspicious items" linked to my passport. I was being investigated for "financial crimes."

They sounded so concerned. They wanted to "help me." All I had to do was transfer money to a "secure government account" to prove my innocence.

I started crying. I'm not even embarrassed to admit it. I was alone in my room, thousands of miles from home, and someone was telling me I might be arrested.

---

**Call 3: "IRS"**

This one hit when I was doing my taxes. The caller ID looked official. They said I owed back taxes and would be deported if I didn't pay immediately.

Same script. Wire transfer. Gift cards. "Don't tell anyone, this is a保密案件."

---

### Here's what I learned:

Real government agencies don't call you out of the blue demanding money. They don't threaten deportation on the phone. They don't ask for gift cards. They don't tell you to keep things secret.

**If you get a call like this:**

Hang up. Use the official number you find yourself (not one they give you) to call back. For Chinese consular help: +86-10-12308.

**What to do if you think you might be in trouble with authorities:**
- Hang up
- Verify independently (look up the real number)
- Talk to your school's international student office before doing anything
- No legitimate agency will ever tell you to keep it secret from friends/family`,
    contentZh: `## 三个电话差点把我逼疯

我不想承认自己差点被骗。但我希望你们能从我的经历中学到东西。

---

**电话一："DHL"}

叮铃铃。未知号码。

"您好，这里是DHL。您的包裹被扣在海关了。文件有问题。"

我确实一周前从中国订过东西。心跳加速。

"如果今天不解决，包裹将被退回或销毁。"

他们把我转接给了一个"海关官员"。他非常正式，非常耐心。问我要护照号码"核实包裹"。

就在这时我室友进来了，问我跟谁打电话。我差点挂掉。

但我没有。我应该挂的。

---

**电话二："中国大使馆"

这个更聪明。对方留了语音信箱。用中文。有大使馆的官方问候语。

"您有一份重要文件在中国大使馆待领取。请按1回拨。"

我按了1。他们说我有一份包裹与我的护照关联，涉嫌"经济犯罪"。我正在被调查。

他们听起来真的很担心我。想"帮助我"。我只需要把钱转到一个"安全账户"来证明我的清白。

我哭了。我不觉得这有什么好丢人的。我一个人待在房间里，离家万里，有人告诉我可能会被逮捕。

---

**电话三："税务局"

这个发生在我报税的时候。来电显示看起来很官方。他们说我欠税了，如果不马上付钱就要被驱逐出境。

同样的套路。电汇。礼品卡。"这是保密案件，不能告诉任何人"。

---

### 我学到的：

真正的政府机构不会突然打电话要钱。不会在电话里威胁驱逐出境。不会要礼品卡。不会让你对朋友家人保密。

**如果你接到这种电话：**

挂掉。用你自己查到的官方号码（不是他们给你的号码）回拨。中国领事保护热线：+86-10-12308。

**如果你觉得自己可能真的惹上麻烦了：**
- 先挂掉电话
- 自己查号码核实
- 在做任何事之前先跟学校国际学生办公室谈
- 没有任何正规机构会让你对亲友保密`,
    tags: ['电话诈骗', '防骗', '大使馆', 'DHL', '税务局'],
    rating: 4.9,
    ratingCount: 5670,
    viewCount: 112300,
    authorName: '防骗达人',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shield',
    isVerified: true,
    isHot: true,
    createdAt: '2026-03-12T14:00:00Z',
    updatedAt: '2024-03-12T14:00:00Z',
  },

  // ==================== CULTURE CATEGORY ====================
  {
    id: 'uk-cultural-etiquette',
    title: 'UK Cultural Etiquette: What You Need to Know',
    titleZh: '英国文化礼仪：你需要知道的事',
    category: 'culture',
    country: 'UK',
    content: `## Things I wish someone told me before my first week in London

Okay, so you've just arrived in the UK. Here's what's going to trip you up.

---

**The queue thing is real**

British people will literally form an orderly line at an empty bus stop. No one told me this was a thing. I thought people were just being weird.

Don't you dare cut a queue. That's social death. Even if the shop looks empty and there's no visible line — if you see one person standing near the counter looking uncertain, there might be a queue forming. Ask "sorry, is this the queue?"

---

**"How do you do?" is not a question**

No one expects you to answer "I'm doing fine, thanks, and you?" It literally means "hello." I spent my first week overexplaining how I actually was doing.

---

**Pubs are different**

British pub culture is its own thing. You order at the bar (not seated), you pay for drinks as you get them (not at the end), and tipping is optional but appreciated. "Two pints, please" works. "I'll have..." works too.

---

**Small talk is a skill**

Talking about the weather isn't small talk, it's a full conversation topic. "Lovely day" when it's raining means "this weather is terrible, I acknowledge it with you." "Not bad" when asked how you are means "I'm fine, let's move on."

---

**The tipping thing**

This confused me for months. Tipping in restaurants: 10% if you're happy, not expected but appreciated. Tipping taxis: round up or 10%. Tipping bars: just say "and one for yourself" if you want to be generous, or just leave small change.

---

**On being punctual**

British people are surprisingly not strict about time in social settings. Late by 5-10 minutes? Normal. But for anything professional or academic — be on time or even 5 minutes early. Being late to a lecture without apologizing is really not cool.

---

**On personal space**

You know how your personal bubble is about an arm's length? British people take that seriously. On public transport, avoid eye contact, avoid conversations with strangers unless they initiate. Some people will give you a dirty look if you stand too close.`,
    contentZh: `## 伦敦第一周没人告诉我的事

好了，你刚到英国。以下这些事你肯定会遇到。

---

**排队这件事是真的**

英国人会在一个空的公交站自觉排队。没人告诉我还有这种事。我还以为他们在犯傻。

绝对不要插队。那是社交死亡。就算店里看起来没人，也没看到什么队伍——如果有人站在柜台附近看起来在等，那可能就是在排队。问一下："请问这是在排队吗？"

---

**"How do you do?"不是问题**

没人期待你回答"我很好谢谢，你呢？"它就是"你好"的意思。我第一周一直在过度解释我的状况。

---

**酒吧文化不一样**

英国pub有它自己的一套。你在吧台点单（不是坐着），点的时候就付钱（不是最后结），小费是可选的但很感激。"两品脱，谢谢"就行。"我要......"也可以。

---

**闲聊是门技术**

聊天气不是闲聊，是完整的话题。"天气真好"在大雨天意思是"这天气太烂了，我跟你一起吐槽"。被问"你好吗"回答"还不错"意思是"我很好，继续吧"。

---

**小费的事**

这个困惑了我好几个月。餐厅小费：满意的话给10%，不是必须的但很感激。出租车小费：凑整或10%。酒吧小费：如果你想大方就说"给自己也来一杯"，或者就留点零钱。

---

**关于守时**

在社交场合，英国人对时间出奇地不严格。迟到5-10分钟？正常的。但任何专业或学术场合——要准时，甚至提前5分钟。迟到讲座不道歉真的很不好。

---

**关于个人空间**

你知道你的个人空间大概是一臂的距离吗？英国人认真对待这件事。在公共交通上，避免眼神接触，避免和陌生人说话（除非他们先开口）。站太近的话有人会给你一个白眼。`,
    tags: ['英国', '文化', '礼仪', '留学生活', '礼仪'],
    rating: 4.6,
    ratingCount: 3450,
    viewCount: 67800,
    authorName: '剑桥学姐',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=london',
    isVerified: true,
    isHot: false,
    createdAt: '2026-02-20T11:00:00Z',
    updatedAt: '2024-02-20T11:00:00Z',
  },
  {
    id: 'us-campus-culture',
    title: 'US Campus Culture: Social Norms and Tips',
    titleZh: '美国校园文化：社交规范和技巧',
    category: 'culture',
    country: 'USA',
    content: `## What nobody tells you about making friends at an American college

I showed up to my US campus knowing exactly zero people. Here's what's different.

---

**Small talk is not optional**

Americans do small talk constantly. Elevator? "How's your day going?" Coffee line? "Weekend plans?" It's not fake — it's how they show you're a person and not just a stranger in their space.

Topics that are safe: weather, sports (local teams especially), what you're studying, weekend plans, the food.

Topics to avoid: salary, politics initially, anything too deep too fast.

---

**"Let me know if you need anything!" — what it actually means**

This phrase confused me. It sounds like an open invitation. But it often isn't. If you actually need something, you have to be specific and proactive. "Thanks! Actually, could I ask you something about the midterm?" works better than waiting for someone to follow up.

---

**Hugging is normal**

I came from a culture where hugging wasn't common. Americans hug as a greeting sometimes. Not always, but sometimes. If someone goes in for a hug, just roll with it. It doesn't mean you're best friends — it's just how some people say hello.

---

**Office Hours are not optional**

I repeat: Office Hours are not optional. Professors in the US actually want to talk to you. They have these hours specifically for you to come ask questions, chat about the material, or just introduce yourself.

I didn't go to office hours my first semester because I thought I was bothering them. I was struggling in a class and didn't get help until it was almost too late.

Go to office hours. Even if you don't have specific questions. Just show your face. It makes a difference.

---

**Greek Life — it's not for everyone, and that's fine**

Rush week happens at the start of the year. People wear their sorority/fraternity letters everywhere. It seems like everyone is in one.

Here's the truth: a lot of people are, but a lot of people aren't. It's not required. It doesn't make you less "American." If you don't vibe with it, there are tons of other ways to find your community.

---

**The food thing**

Coffee culture is real. People study at coffee shops. "Grabbing coffee" is a social activity. If someone says "let's get coffee," it's a casual hangout, not a literal coffee-only event.

Potlucks are common for parties — you bring something to share. Don't show up empty-handed, but don't overthink it. A bag of chips is fine.

---

**Participation matters**

In many classes, just showing up isn't enough. Professors expect you to talk, ask questions, share opinions. I came from an educational culture where sitting quietly was "good behavior." Here, it can hurt your grade.`,
    contentZh: `## 美国大学交朋友那些没人说的事

我到美国校园的时候一个人都不认识。以下是一些不同的地方。

---

**闲聊是必须的**

美国人一直在闲聊。电梯里？"今天怎么样？"咖啡队？"周末有什么计划？"这不是虚伪——这是他们表示你是一个人而不是陌生人的方式。

安全话题：天气、体育（尤其是当地球队）、你学的专业、周末计划、吃的。

避免的话题：一开始不要聊工资、政治、不要太快进入深度话题。

---

**"需要帮忙跟我说！"——它实际的意思**

这句话困扰过我。它听起来像是一个开放的邀请。但通常不是。如果你真的需要什么，你必须具体且主动。"谢谢！其实，我想问一下关于期中考试的事？"这样比等人主动跟进效果好得多。

---

**拥抱很正常**

我来自一个不常见拥抱的文化。美国人有时用拥抱打招呼。不是总是，但有时。如果有人要拥抱你，就顺势接受。这不意味着你们是密友——这只是一些人说hello的方式。

---

**Office Hours不是可选项**

我再说一遍：Office Hours不是可选项。美国的教授真的想跟你交流。他们专门留出这些时间来让你问问题、聊课程内容，或者就是介绍一下自己。

第一学期我没去过office hours因为我觉得在打扰他们。一门课我很挣扎，但直到快来不及了才寻求帮助。

去office hours。就算没有问题。露个脸。这真的不一样。

---

**Greek Life——不是每个人都适合，没关系**

Rush week在每学年开始。人们到处穿着兄弟会/姐妹会的字母。这看起来好像每个人都是其中一员。

真相是：很多人是，但很多人不是。它不是必须的。它不会让你显得不够"美国"。如果你不适应，有很多其他方式找到你的社群。

---

**吃的那些事**

咖啡文化是真的。人们在咖啡店学习。"去喝咖啡"是社交活动。如果有人说"我们去喝咖啡"，那是随便的约会，不是字面意思只喝咖啡。

Potluck聚会很常见——你带东西来分享。不要空手去，但也不用想太多。一袋薯片就行。

---

**参与很重要**

在很多课里，光出席不够。教授期望你发言、提问、分享意见。我来自一个安静坐着是"好行为"的教育文化。在这里，这可能影响你的成绩。`,
    tags: ['美国', '校园', '文化', '留学', '社交'],
    rating: 4.7,
    ratingCount: 2890,
    viewCount: 54300,
    authorName: '哈佛学长',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=boston',
    isVerified: true,
    isHot: false,
    createdAt: '2026-02-18T16:00:00Z',
    updatedAt: '2024-02-18T16:00:00Z',
  },
  {
    id: 'japan-social-rules',
    title: 'Japan Social Rules: Beyond the Basics',
    titleZh: '日本社交规则：超越基础',
    category: 'culture',
    country: 'Japan',
    content: `## I embarrassed myself more times than I can count in Japan

The thing about Japan is — everyone tells you about the big rules. Take off shoes. Bow. Don't be loud on trains.

What they don't tell you is the stuff that will make you feel like an idiot in everyday situations.

---

**The name card thing**

I gave my professor my business card like it was a playing card. Just held it out between two fingers.

He took it with both hands, looked at it carefully, then placed it respectfully on the table.

I wanted to disappear.

In Japan, business cards (meishi) are treated like the person themselves. You give and receive with both hands. You don't fold them, write on them, or shove them in your back pocket. You put them somewhere neat and respectful.

---

**Slurping noodles is okay — actually encouraged**

I was so self-conscious about slurping my ramen. Thought it was bad manners.

It's not. In Japan, slurping shows you're enjoying the food. It's a compliment to the cook. Now I slurp with pride.

---

**The train thing**

I got on a train car and sat down in what I thought was an empty seat. An older man gestured at me angrily. I didn't understand.

I was in the women's car. (That was fun to explain.)

Look for the signs. Colors and characters differ by line. Also: no talking on phones in train cars. Keep your phone on silent and if you must answer, speak quietly or get off.

---

**Trash cans are basically nonexistent**

Where do you throw trash?

I walked around for 20 minutes with my convenience store garbage once because there was literally nowhere to put it.

Convenience stores have them. Train stations have them. But street trash cans? Rare. Get used to carrying a little bag in your pocket.

---

**The tipping thing**

Don't.

I repeat: don't tip in Japan. It's rude. Service is included. Leaving extra money confuses and embarrasses people.

---

**The quiet thing**

Japan is not quiet in the way I expected. It's quieter in some places (trains, libraries, hospitals) and louder in others (izakaya, arcades, some restaurants).

But the key is: be mindful of your volume. Speaking loudly on a mostly-quiet train car will get you looks. Using your phone on silent? Fine. Having a full-volume conversation? Not fine.

---

**The垃圾分类 thing**

This is real and it is complicated.

 burning trash, plastics, PET bottles, cans, glass — each has its own day and its own rules. In some apartments, you have to separate by type and put them out only on certain mornings.

I got a violation notice my first month. My bad.

Get the app. Search for your specific address's rules. Yes, it's annoying. But you will figure it out.`,
    contentZh: `## 我在日本丢人的次数数都数不清

关于日本的事情是——每个人都会告诉你大的规则。脱鞋。鞠躬。火车上不要大声。

他们不告诉你的是那些在日常生活中会让你觉得自己像个傻子的事。

---

**名片那件事**

我把我的名片像扑克牌一样递给我的教授。就用两根手指夹着。

他双手接过，仔细看了看，然后恭敬地放在桌上。

我想原地消失。

在日本，名片被当作本人一样对待。要用双手递接。不要折、不要写、不要塞进后口袋。要放在整洁恭敬的地方。

---

**吸面条是可以的——其实是被鼓励的**

我一直对吸拉面很在意。觉得这样不礼貌。

不是的。在日本，吸面表示你很享受食物。这是对厨师的称赞。现在我自豪地吸面。

---

**电车那件事**

我上了一节车厢，坐在了一个我以为是空位的地方。一位老先生愤怒地朝我比划。我不明白。

我在女性专用车厢。（解释起来很有趣。）

看标志。颜色和字符因线路而异。还有：不要在车厢里打电话。把手机调静音，如果必须接听，小声说或下车。

---

**垃圾桶基本不存在**

垃圾扔哪里？

有一次我在便利店买了东西后拿着垃圾走了20分钟，因为真的没地方扔。

便利店有垃圾桶。车站有。但街上的垃圾桶？很少见。习惯在口袋里带个小袋子。

---

**小费那件事**

不要给小费。

我再说一遍：日本不要给小费。这是不礼貌的。服务费已经包含在内了。多给钱会让人困惑和尴尬。

---

**安静那件事**

日本不像我想的那样安静。有些地方更安静（电车、图书馆、医院），有些地方更吵（居酒屋、游戏厅、一些餐厅）。

但关键是：要留意你的音量。在一节很安静的车厢里大声说话会被人侧目。用静音的手机？没问题。大声聊天？不行。

---

**垃圾分类那件事**

这是真的，而且很复杂。

可燃垃圾、塑料、PET瓶、罐子、玻璃——每种都有自己的投放日和规则。在一些公寓，你必须按类型分开，只能在某些早晨拿出来。

我第一个月就收到了违规通知。我的错。

下载个app。查你具体地址的规则。是的，很烦人。但你会搞清楚的。`,
    tags: ['日本', '文化', '礼仪', '留学', '社交'],
    rating: 4.8,
    ratingCount: 4120,
    viewCount: 78900,
    authorName: '东京留学生小美',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tokyo',
    isVerified: true,
    isHot: true,
    createdAt: '2026-02-25T08:00:00Z',
    updatedAt: '2024-02-25T08:00:00Z',
  },

  // ==================== SAFETY CATEGORY ====================
  {
    id: 'uk-campus-safety',
    title: 'UK Campus Safety: Essential Guide',
    titleZh: '英国校园安全：必备指南',
    category: 'safety',
    country: 'UK',
    content: `## The night I realized I wasn't in Kansas anymore

It was 11pm. I was walking back from the library alone. A guy on a bike came up behind me, grabbed my bag, and kept pedaling.

I was in shock for a second. Then I screamed. Someone came out of a house. The guy dropped my bag and rode off.

I didn't lose anything except my dignity and a sense of security I hadn't even known I had.

---

**What I should've done differently:**

First — I wouldn't walk that route alone at night. Campus security has these little shuttle things for a reason. Use them.

Second — I should've had my phone out but not visible. If something feels off, you're already calling, even if you just have it to your ear.

Third — I was wearing headphones with both ears. I couldn't hear him coming. Bad idea.

---

**The thing about UK emergency numbers**

999 is for actual emergencies. Life-threatening situations, crimes in progress, anything urgent.

101 is for non-emergencies. Suspicious activity, theft that already happened, police presence needed but not urgent.

Save both in your phone. You'll probably use 101 more than you think.

---

**TheNHS thing**

Everyone talks about registering with a GP. Do it in your first week. Don't wait until you're sick.

Also: if you're genuinely sick and it's not life-threatening but you can't get a GP appointment, there's 111. They can advise you and even book urgent appointments.

For actual emergencies — A&E. But A&E is for emergencies. Chest pains, serious bleeding, things that can't wait.

---

**Mental health support exists — please use it**

I waited too long to go to my university's counseling center. I thought "real problems" needed "real solutions," not just talking to someone.

Wrong. That's exactly what it's for.

University counseling is free. Usually limited sessions per year, but enough to get you through a rough patch. The first step is just making an appointment — it takes like 10 minutes online.

If you're not okay, please talk to someone. You're not weak. You're human.`,
    contentZh: `## 那天晚上我意识到这不是在家门口了

晚上11点。我一个人从图书馆走回来。骑自行车的家伙从我后面过来，抓住我的包，蹬着车就跑了。

我愣了一秒。然后尖叫了一声。旁边房子里出来一个人。那家伙把我的包扔了，骑车跑了。

我没丢什么东西，就是丢了一些尊严和我之前甚至没意识到自己拥有的安全感。

---

**我本该做的不同的事：**

第一——我不会在晚上独自走那条路。校园保安有那种巡逻车，有原因的。用它。

第二——我应该把手机拿出来但不要露在外面。如果感觉不对劲，你已经在打电话了，哪怕只是把手机贴在耳边。

第三——我戴着耳机双耳都塞住了。我听不到他过来。糟糕的主意。

---

**英国紧急号码的事**

999是真正的紧急情况。危及生命的状况、正在发生的犯罪、任何紧急的事。

101是非紧急情况。可疑活动、已经发生的盗窃、需要警察但不是紧急的。

把两个都存进你手机。你可能会用101比你想象的多。

---

**NHS的事**

每个人都说要注册GP。第一周就去做。不要等到生病了才想起来。

还有：如果你是真的病了，不是危及生命但又约不到GP，有个111可以打。他们可以给你建议甚至预约紧急门诊。

真正的紧急情况——去A&E。但A&E是看紧急情况的。胸痛、严重出血、不能等的情况。

---

**心理健康支持是存在的——请用它**

我等太久才去学校的心理咨询中心。我以为"真正的问题"需要"真正的解决办法"，不是只跟人聊聊。

错了。那正是它存在的意义。

大学心理咨询是免费的。通常每年有限制次数，但足够帮你度过一段困难时期。第一步就是预约——网上大概10分钟就能约上。

如果你不太好，请找人聊聊。你不弱。你是个人。`,
    tags: ['英国', '安全', '校园', '留学', '紧急联系'],
    rating: 4.7,
    ratingCount: 2340,
    viewCount: 45600,
    authorName: '曼城留学生',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manchester',
    isVerified: true,
    isHot: false,
    createdAt: '2026-02-15T13:00:00Z',
    updatedAt: '2024-02-15T13:00:00Z',
  },
  {
    id: 'us-campus-safety',
    title: 'US Campus Safety: Stay Aware',
    titleZh: '美国校园安全：保持警惕',
    category: 'safety',
    country: 'USA',
    content: `## Those blue light poles saved my friend's life

Okay, maybe that's dramatic. But here's what happened.

My friend Mira was walking back to her dorm at 2am. She noticed a guy had been behind her for a few blocks. She started walking faster. He did too.

She ran to the nearest blue light pole — those emergency phones scattered around campus — and pressed the button.

Campus police showed up in less than 2 minutes. The guy took off.

---

**Blue Light system**

Those poles with the blue lights? Each one is an emergency phone. You don't need a phone to use it. Just press the button and campus police will come.

Learn where they are on your campus before you need them.

---

**Campus police are different from city police**

Campus police are there for campus issues. They're usually pretty responsive and friendly. They handle:
- Crimes on campus
- Escort services (yes, they will walk you home at night)
- Car lockouts (yes, this actually happens)
- General safety concerns

They're not the same as city police and won't fine you for minor campus violations. They exist to keep students safe.

---

**The alert systems**

Your school has an alert system. Probably through email and text. The second you register, make sure you're signed up for:
- Emergency notifications
- Crime alerts
- Weather closures

I kept ignoring those emails because they seemed like spam. Then there was a legitimate emergency (someone tried to break into cars in my building) and I had no idea until the next morning.

---

**Active shooter — I hate that I have to write this**

The training they make you do during orientation? Take it seriously.

Run. Hide. Fight. In that order.

- Run: If you can escape, do it. Leave your stuff behind.
- Hide: If you can't run, hide. Lock the door if you can. Turn off the lights. Silence your phone.
- Fight: Only as a last resort. Act with aggression. Throw things.

I took the training and thought it was kind of silly. Then I heard from a friend who actually had to use part of it. She didn't freeze — she knew what to do.

---

**Registrar holds — this one's random but important**

If you ever forget to pay a parking ticket or violate some campus rule, they can put a hold on your diploma/records. You'll find out when you try to graduate.

Check your student portal periodically for holds. Deal with small issues before they become graduation blockers.`,
    contentZh: `## 那些蓝色灯柱救了我朋友的命

好吧，这么说可能有点夸张。但事情是这样的。

我朋友Mira凌晨2点走回宿舍。她注意到有个家伙跟了她几个街区了。她开始加快脚步。他也是。

她跑到最近的蓝色灯柱——校园里散落的那些紧急电话——按了按钮。

校园警察两分钟内就到了。那家伙跑了。

---

**蓝色灯柱系统**

那些带蓝灯的灯柱？每一个都是紧急电话。你不需要手机就能用。按一下按钮，校园警察就会来。

在你需要之前就弄清楚它们在校园的哪里。

---

**校园警察和城市警察不一样**

校园警察是处理校园问题的。他们通常很响应而且友好。他们负责：
- 校园内的犯罪
- 护送服务（是的，他们可以在晚上护送你回家）
- 帮您开锁（是的，这真的会发生）
- 一般安全问题

他们和城市警察不一样，不会因为轻微的校园违规罚你款。他们存在是为了保证学生安全。

---

**预警系统**

你们学校有预警系统。可能通过邮件和短信。从你注册的那一刻起，确保你订阅了：
- 紧急通知
- 犯罪警报
- 天气停课通知

我一直忽略那些邮件因为它们看起来像垃圾邮件。然后有一次真正的紧急情况（有人试图闯进我那栋楼的汽车），我第二天早上才知道。

---

**活跃枪手——我很讨厌我得写这个**

入学训练时让你参加的那个培训？认真对待。

跑。躲。打。按这个顺序。

- 跑：能逃就逃。东西可以扔下。
- 躲：跑不了就躲。能锁门就锁。关灯。把手机静音。
- 打：最后手段才用。主动攻击。扔东西。

我参加那个培训时觉得有点傻。然后我听说一个朋友真的用到了其中一部分。她没有僵住——她知道该怎么做。

---

**Registrar holds——这个有点随机但很重要**

如果你忘记付停车罚单或违反了什么校园规定，他们可以在你的毕业证书/成绩单上设置保留。你会在毕业的时候才发现。

定期检查你的学生门户有没有保留。在它们变成毕业障碍之前处理小问题。`,
    tags: ['美国', '安全', '校园', '留学', '紧急联系'],
    rating: 4.8,
    ratingCount: 3450,
    viewCount: 67800,
    authorName: '加州留学生',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=california',
    isVerified: true,
    isHot: true,
    createdAt: '2026-02-22T10:00:00Z',
    updatedAt: '2024-02-22T10:00:00Z',
  },

  // ==================== LEGAL CATEGORY ====================
  {
    id: 'us-academic-integrity',
    title: 'US Academic Integrity: Know the Rules',
    titleZh: '美国学术诚信：了解规则',
    category: 'legal',
    country: 'USA',
    content: `## I almost got expelled for something I didn't know was wrong

This is not a flex. This is a warning.

I was writing a paper my sophomore year. I used a phrase from a source. Just one phrase — maybe 8 words. I put it in quotes and moved on.

Except I didn't cite it. Not the whole phrase was in quotes — only part of it. The formatting was wrong. It looked like I was quoting myself, which was technically fine, but the phrase itself came from another author.

My professor ran it through Turnitin. The similarity score was 12%. That's not high, but the software flagged that specific phrase.

I got called into the academic integrity office.

I thought it was a misunderstanding. "I quoted it, I just formatted it wrong."

They didn't see it that way. It was my first offense. I got a zero on the paper and had to attend a workshop on citation.

---

**Here's what I learned:**

In the US, academic integrity isn't just about cheating on exams. It's about:
- Properly citing others' words and ideas
- Not submitting work you've already submitted elsewhere
- Not fabricating data or sources
- Not collaborating when the assignment says "individual work"

The rules are strict. The consequences are real.

---

**Plagiarism isn't just copying entire paragraphs**

I thought plagiarism was like copying whole pages. It's not. Using even a phrase without proper citation can count. Paraphrasing too closely can count. Self-plagiarism (submitting your own previous work without permission) counts.

---

**The international student problem**

I'm an international student. I didn't grow up with MLA or APA format. I learned citation styles here.

But that's not an excuse. Ignorance of the rules doesn't protect you. It's on you to learn.

The good news: your school has resources. Writing Center can help you with citations. Librarians are citation experts. Use them before you submit, not after you're in trouble.

---

**If you're accused:**

Don't panic. You have rights. Usually:
1. You'll meet with someone to discuss what happened
2. You can explain your side
3. If it's serious, there may be a formal hearing

Get help from your international student office. They deal with this stuff. They can advocate for you and help you understand the process.`,
    contentZh: `## 我差点因为一件我不知道做错了的事被开除

这不是一个炫耀的故事。这是一个警告。

大二的时候我写了一篇论文。我用了一个资料来源的短语。就一个短语——大概8个词。我用了引号然后就过去了。

但我没有引用它。不对——整个短语都被引号包住了——只是其中一部分。格式错了。看起来像是在引用自己，这技术上是可以的，但那个短语本身来自另一个作者。

我的教授用Turnitin检测了。相似度是12%。这不算高，但软件标记了那个特定的短语。

我被叫去了学术诚信办公室。

我以为是误会。"我引用了，只是格式错了。"

他们不这么看。这是我第一次违规。我论文得了零分，还得参加一个关于引用的研讨会。

---

**我学到的：**

在美国，学术诚信不只是考试作弊。它涉及：
- 正确引用他人的文字和想法
- 不提交你已经提交过的作品
- 不伪造数据或来源
- 不在作业要求"个人完成"时合作

规则很严格。后果是真实的。

---

**抄袭不只是抄整段**

我以为抄袭就是整页整页地复制。不是的。使用一个短语而没有正确引用都可能算。过于接近的改写也可能算。自我抄袭（未经允许提交你之前提交过的作品）也算。

---

**国际学生的问题**

我是国际学生。我不是在MLA或APA格式的环境中长大的。我是在这里学的引用格式。

但这不是借口。不知道规则不会保护你。你有责任去学。

好消息是：你的学校有资源。写作中心可以帮你解决引用问题。图书馆员是引用专家。在你提交之前用他们，别等到惹上麻烦了才去找。

---

**如果你被指控了：**

别慌。你有权利。通常：
1. 你会和人见面讨论发生了什么
2. 你可以解释你的立场
3. 如果很严重，可能会有正式听证会

从你的国际学生办公室获取帮助。他们处理这种事。他们可以为你辩护，帮你理解流程。`,
    tags: ['美国', '学术诚信', '法律', '留学', 'Plagiarism'],
    rating: 4.9,
    ratingCount: 4560,
    viewCount: 89000,
    authorName: '学术顾问王老师',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=professor',
    isVerified: true,
    isHot: true,
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2024-03-01T09:00:00Z',
  },
  {
    id: 'visa-regulations',
    title: 'Student Visa Regulations: Key Points',
    titleZh: '学生签证规定：关键点',
    category: 'legal',
    content: `## Why you should never let your visa status become an afterthought

I almost lost my student status because I didn't understand the rules.

It was my second year. I was struggling with a class and considered dropping it. A friend said "just drop it, no big deal."

It was a big deal.

Dropping below full-time enrollment without prior approval can trigger a visa status problem. You're required to maintain full-time student status. I didn't know that.

My international student advisor caught it during a routine check-in. She was able to fix it, but I had to add another class that I didn't want or need, just to stay legal.

---

**Full-time status isn't optional**

As an international student on a student visa, you're required to be enrolled full-time. Usually 12-15 credits per semester depending on your program and school.

If you want to drop below full-time, you need prior approval from your international student office. Not after the fact. Before.

---

**Working off-campus without authorization = big trouble**

On-campus job? Usually fine, up to 20 hours per week during semester.

Off-campus job? Almost always requires authorization. In the US, that's CPT (for internships during study) or OPT (for work after graduation).

Work without authorization = violating your visa status. This can mean:
- Losing your visa
- Being barred from returning to the US
- Future visa denials

---

**The address thing**

This one surprised me. You're required to report your address within a certain time frame (usually 10 days in the US) whenever it changes. I didn't know that for my first year. My advisor gently informed me that I'd technically been out of compliance.

Get the rules for your specific country and actually follow them. They exist for a reason.

---

**What to do if you think you might have a problem**

Don't wait. Go to your international student office immediately. They're not there to judge you. They're there to help you stay legal.

Most schools have someone specifically dedicated to visa/immigration support. Use them. Ask questions. Before you do something, not after.

---

**The countries in brief:**

**US (F-1):**
- On-campus: up to 20 hrs/week during term
- CPT: must be related to your field, requires authorization
- OPT: after graduation, up to 12 months, requires authorization

**UK (Student Visa):**
- Up to 20 hrs/week during term (some course restrictions apply)
- No work if you're on a short-term student visa
- Graduate Route: 2-3 years after graduation, full work rights

**Australia (Student Visa):**
- 40 hours per fortnight (not per week)
- No limit during official vacation periods
- Post-study work visas available after graduation`,
    contentZh: `## 为什么你不应该让你的签证状态变成马后炮

我差点因为不理解规则失去我的学生身份。

那是大二的时候。我一门课学得很挣扎，考虑退课。朋友说"退了就行了，没什么大不了的。"

这是一个大问题。

未经批准降到低于全日制注册可能会触发签证状态问题。你必须保持全日制学生身份。我当时不知道这个。

我的国际学生顾问在一次常规检查中发现了这个问题。她能够解决，但我不得不添加另一门我不想也不需要的课，只是为了保持合法身份。

---

**全日制身份不是可选的**

作为持学生签证的国际学生，你必须注册全日制。通常每学期12-15学分，取决于你的项目和专业。

如果你想降到低于全日制，需要事先获得国际学生办公室的批准。不是事后，是之前。

---

**未经授权在校外工作 = 大麻烦**

校内工作？通常可以，学期间每周最多20小时。

校外工作？几乎总是需要授权。在美国，那是CPT（学习期间的实习）或OPT（毕业后工作）。

无授权工作 = 违反你的签证状态。这可能意味着：
- 失去你的签证
- 被禁止返回美国
- 未来签证被拒

---

**地址这件事**

这个惊讶了我。每次地址变更，你都需要在规定时间内（美国通常是10天）报告你的地址。我第一年不知道这个。我的顾问温和地提醒我我技术上已经不合规了。

了解你具体国家的规则并遵守它们。它们存在是有原因的。

---

**如果你觉得你可能有问题了该怎么做**

别等。立刻去你的国际学生办公室。他们不是来评判你的。他们是来帮你保持合法身份的。

大多数学校都有专门负责签证/移民支持的人。用他们。问问题。在你做某件事之前问，不是之后。

---

**主要国家的简要说明：**

**美国 (F-1):**
- 校内：学期间每周最多20小时
- CPT：必须与你的专业相关，需要授权
- OPT：毕业后，最多12个月，需要授权

**英国 (Student Visa):**
- 学期间每周最多20小时（某些课程有额外限制）
- 短期学生签证不能工作
- Graduate Route：毕业后2-3年，全职工作权利

**澳大利亚 (Student Visa):**
- 每两周40小时（不是每周）
- 正式假期无限制
- 毕业后可申请工作签证`,
    tags: ['签证', '法律', 'F-1', 'Student Visa', 'CPT', 'OPT'],
    rating: 4.8,
    ratingCount: 5670,
    viewCount: 112000,
    authorName: '签证专家',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lawyer',
    isVerified: true,
    isHot: true,
    createdAt: '2026-03-05T14:00:00Z',
    updatedAt: '2024-03-05T14:00:00Z',
  },

  // ==================== OTHER CATEGORY ====================
  {
    id: 'intl-student-tips',
    title: 'International Student Survival Tips',
    titleZh: '留学生生存技巧大全',
    category: 'other',
    content: `## Stuff I wish I knew before I got on that plane

I'm writing this on the flight back after 4 years abroad. Here's what I'd tell my past self.

---

**Before you leave**

Get your documents organized. Passport, visa, I-20 (or equivalent). Make physical copies AND digital copies stored somewhere you can access from anywhere. Email them to yourself. Save them in Google Drive.

More than once I needed a document and didn't have it. "I'll deal with it when I arrive" doesn't work when you're 8,000 miles from home.

---

**The first week**

Your school will have an orientation. Go to all of it. Yes, even the parts that seem boring or obvious. Especially the parts about:
- How to access student services
- Health and counseling services
- Who your academic advisor is
- How to use the library (yes, really)

I skipped half of orientation because I was jet-lagged and thought I knew better. I spent months figuring out things I could've learned in an hour.

---

**Banking**

Open a local bank account ASAP. Your home country's card will charge you fees everywhere. You'll want a local account.

In the US: credit history takes time to build. If you can, get a secured credit card early. You'll need a credit score for apartment applications, phone plans, sometimes even utilities.

---

**The phone situation**

I went through three phone plans my first year. Here's the thing: don't expect to understand the system immediately. Each country is different.

Get something basic to start. Figure out what you actually need. Then optimize.

International student plans exist. Look for them. They usually offer better rates for your situation.

---

**Food**

Learn to cook. Not gourmet — just basic competence. Your wallet will thank you. Your mental health will thank you. Homesickness hits different when you can make your mom's noodles.

Batch cooking is your friend. Sunday afternoons: cook for the week. Yes, really.

---

**Social**

Join things. Clubs. Sports. Volunteer groups. Whatever. The fastest way to find your people is doing something you enjoy with other people.

But also: it's okay to not be okay with socializing all the time. The pressure to "make friends immediately" is real but sometimes counterproductive. Quality over quantity.

---

**The homesickness wave**

It hits around month 3. For me it was突然的. Everything was fine, then one day I couldn't stop crying about a commercial for instant noodles.

This is normal. It passes. Force yourself to do small things that feel normal: call a friend, cook something familiar, take a walk.

If it doesn't pass, or if it's affecting your daily life — talk to someone. Your school's counseling center exists for exactly this reason.`,
    contentZh: `## 登上飞机前我希望知道的事

我在海外4年后在返程航班上写这个。以下是我会告诉我过去自己的。

---

**离开之前**

把你的文件整理好。护照、签证、I-20（或同等文件）。做实体复印件和电子复印件，存放在任何地方都能访问的地方。邮件给自己。存到Google Drive。

不止一次我需要某个文件但手边没有。"到了再说"在你离家8000英里的时候行不通。

---

**第一周**

你们学校会有一个新生导向。都去参加。是的，即使看起来无聊或显而易见的部分。尤其是关于这些的：
- 如何使用学生服务
- 健康和咨询服务
- 你的学术顾问是谁
- 如何使用图书馆（真的，就是图书馆）

我因为时差反应跳过了一半的导向，觉得自己都懂。我花了好几个月才弄明白本来一小时内就能学到的东西。

---

**银行**

尽快开一个本地银行账户。你本国的卡到处都会收手续费。你会需要一个本地账户。

在美国：信用记录需要时间建立。如果可以的话，尽早申请一张担保信用卡。你会需要信用分数来租公寓、签手机计划，有时候甚至申请 utilities。

---

**手机的问题**

我第一年换了三个手机计划。是这样的：不要指望能立刻理解这个系统。每个国家都不一样。

先弄个基础的。弄明白你实际需要什么。然后优化。

国际学生计划是存在的。去找。通常有更适合你情况的费率。

---

**吃的**

学着做饭。不是美食大厨——就是基本能力。你的钱包会感谢你。你的心理健康会感谢你。当你能做你妈的面条时，想家的感觉会不一样的。

批量做饭是你的朋友。周日下午：为这一周做饭。是的，真的。

---

**社交**

加入一些组织。社团、运动、志愿者团体。什么都行。找到志同道合的人最快的方式就是和志同道合的人一起做你喜欢的事。

但也要：不是每时每刻都要社交也没关系。"立刻交朋友"的压力存在但有时会适得其反。质量比数量重要。

---

**想家的浪潮**

大概在第三个月袭来。对我来说是一瞬间的。什么都很好，然后有一天我一看到方便面广告就忍不住哭了。

这是正常的。会过去的。强迫自己做些感觉正常的小事：给朋友打电话、做点熟悉的东西、散散步。

如果它不过去，或者影响了你的日常生活——找人聊聊。学校的心理咨询中心正是为此存在的。`,
    tags: ['留学', '生存技巧', '新生', '攻略', '生活'],
    rating: 4.9,
    ratingCount: 8900,
    viewCount: 178000,
    authorName: '留学生之友',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=global',
    isVerified: true,
    isHot: true,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
  },
  {
    id: 'mental-health-guide',
    title: 'International Student Mental Health Guide',
    titleZh: '留学生心理健康指南',
    category: 'other',
    content: `## I thought I was just "adjusting." It lasted two years.

I told myself everyone feels this way. First year is hard. It's normal to feel lonely sometimes.

But "sometimes" became "always." I stopped answering texts. I skipped class. I told myself I'd "snap out of it" eventually.

I didn't.

I got help in my third year after a friend literally made an appointment for me and walked me to the counseling center. I'm not exaggerating when I say it changed my life.

---

**The adjustment period is real — but there's a difference between adjusting and struggling**

Everyone goes through culture shock. It's normal to feel homesick, overwhelmed, confused. That usually fades within a few weeks or months as you find your footing.

But if it's not fading — if you're getting worse, not better — that's not just adjustment anymore.

---

**Warning signs I ignored**

- Sleeping 12+ hours but still feeling exhausted
- Not opening my laptop for days at a time
- Crying over small things (or not crying at all)
- Gaining or losing a lot of weight quickly
- Avoiding everyone, including people I usually loved spending time with
- Constantly thinking about home or "what if I'd stayed"

---

**What helped me**

The first step was the hardest: admitting I needed help. Then:

1. **Counseling center**: My school offered free sessions. I went weekly for a while. Having someone to talk to who wasn't a friend or family member was weirdly helpful.

2. **Small routines**: I forced myself to leave my room every day. Even if just for a walk. Especially on days when I didn't want to.

3. **Connection, even when I didn't want it**: I joined one club. Just one. Showing up was hard. But having one thing to be part of made a difference.

4. **Boundaries with social media**: I stopped scrolling through photos of friends' lives back home. It made me feel worse, not better.

---

**If you're supporting someone else**

Don't say "just think positive." Don't say "other people have it harder." Don't say "you have so much to be grateful for."

Do say: "I'm here." "That sounds really hard." "Do you want to get coffee?" "Can I make an appointment for you?"

Sometimes the best thing you can do is not fix it — just be present.

---

**Crisis resources**

If you're in crisis — thinking about hurting yourself or others — please reach out:

- Campus crisis line (save it in your phone right now)
- Your country's emergency services
- 中国领事保护热线：12308 (has Mandarin support)

You're not weak for struggling. You're human for struggling. There's a difference.`,
    contentZh: `## 我以为我只是"在适应"。持续了两年。

我告诉自己每个人都会这样。第一年都很难。偶尔感到孤独是正常的。

但"偶尔"变成了"一直"。我不再回消息。我翘课。我告诉自己迟早会"振作起来"的。

我没有。

第三年我的朋友简直是在帮我预约并走到咨询中心我才去寻求帮助。我不夸张地说这改变了我的人生。

---

**适应期是真的——但适应和挣扎之间有区别**

每个人都会经历文化冲击。感到想家、不知所措、困惑是正常的。随着你找到自己的立足点，这通常会在几周或几个月内消失。

但如果没有消失——如果你在变糟，不是在变好——那就不只是适应了。

---

**我忽略的警告信号**

- 睡12个小时以上但仍然觉得累
- 好几天不打开笔记本电脑
- 为小事哭泣（或者根本不哭）
- 体重快速增加或减少
- 回避所有人，包括我通常喜欢相处的人
- 不停地想家或者"如果我留下来会怎样"

---

**什么帮助了我**

第一步是最难的：承认我需要帮助。然后：

1. **咨询中心**：我的学校提供免费会话。我有一段时间每周去。跟不是朋友或家人的人交谈，这很奇怪地有帮助。

2. **小routine**：我强迫自己每天离开房间。就算只是散步。尤其是在我不想动的日子里。

3. **联系，即使我不想**：我加入了一个社团。就一个。出现很难。但有一件事可以归属确实有影响。

4. **社交媒体的边界**：我停止刷国内朋友生活的照片了。它让我感觉更糟，不是更好。

---

**如果你在支持别人**

不要说"积极想想就好了"。不要说"别人比你还惨"。不要说"你有这么多要感恩的"。

说这些："我在这里。""听起来真的很难。""你想去喝杯咖啡吗？""要我帮你预约吗？"

有时候你能做的最好的事不是解决问题——而是陪伴。

---

**危机资源**

如果你在危机中——想着伤害自己或他人——请寻求帮助：

- 校园危机热线（现在就存到你手机里）
- 你当地的紧急服务
- 中国领事保护热线：12308（有中文支持）

挣扎不是软弱。挣扎是人性。有区别的。`,
    tags: ['心理健康', '留学', '压力', '适应', '心理咨询'],
    rating: 4.9,
    ratingCount: 6780,
    viewCount: 134000,
    authorName: '心理顾问',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=heart',
    isVerified: true,
    isHot: true,
    createdAt: '2026-02-10T11:00:00Z',
    updatedAt: '2024-02-10T11:00:00Z',
  },

  // ==================== MORE SCAM GUIDES ====================
  {
    id: 'fake-degree-scam',
    title: 'Fake Degree Diploma Mill Scam',
    titleZh: '野鸡大学/文凭工厂骗局',
    category: 'scam',
    content: `## How I almost got a "degree" from a school that didn't exist

This is embarrassing but I think it's important to share.

I wasn't getting into any real schools. My grades were okay but not great, and the application cycle was brutal. Then I found this program — they accepted everyone. No entrance exams. No GPA requirements. Just pay tuition and you're in.

The website looked real. Really real. They had:
- A campus address (later I found out it was a rented office space)
- Student testimonials (probably fake)
- "Accreditation" badges (I didn't know how to verify them)
- A name that sounded like a real university (turns out it was one letter off from a real school)

I was this close to enrolling. I had the application half-filled out.

My dad asked me to check the government's education verification website. I didn't even know that existed.

I looked up the school. It wasn't on the list. I looked closer at the testimonials — reverse image search showed those photos belonged to other people on different websites.

I stopped the application. But I know people who didn't.

---

**How to actually verify a school**

In China: 教育部涉外监管信息网 (jsj.moe.edu.cn). They have a list of verified foreign institutions.

For the US: Check the Department of Education database. Your school's regional accreditation (there are six in the US — make sure yours is one of them).

For the UK: Check if it's on the list of registered sponsors (UKVI website).

---

**Red flags that should make you run**

- "No requirements! Everyone is accepted!"
- "Study at your own pace, no exams!"
- "Get your degree in 6 months!"
- "We have articulation agreements with real universities" (they don't)
- The name is one letter off from a famous school

---

**What happens if you end up at a fake school**

- Your "degree" is worthless
- Your student visa becomes invalid
- You can't work with that degree anywhere
- You may be investigated for visa fraud if they think you knew
- You've wasted years and a lot of money

There's no shortcut to a real education. I know it's hard to hear when you're struggling to get in somewhere. But a fake degree solves nothing.`,
    contentZh: `## 我差点从一个不存在的学校拿到"学位"

这很丢人但我觉得分享出来很重要。

我没有被任何真正的学校录取。我的成绩还行但不太好，申请季太残酷了。然后我发现这个项目——他们录取所有人。没有入学考试。没有GPA要求。只要付学费你就进去了。

网站看起来很真实。真的很真实。他们有：
- 一个校园地址（后来我发现那是一个租来的办公空间）
- 学生感言（可能是假的）
- "认证"徽章（我不知道怎么验证它们）
- 一个听起来像真正大学的名字（原来是真正大学的字母差一个）

我差点就注册了。申请表填了一半。

我爸让我去查政府的教育认证网站。我甚至不知道那存在。

我查了这个学校。不在名单上。我仔细看了看那些感言——反向图片搜索显示那些照片属于其他网站的其他人。

我停止了申请。但我知道有人没有。

---

**如何真正验证一个学校**

在中国：教育部涉外监管信息网 (jsj.moe.edu.cn)。他们有认证过的外国机构名单。

美国：查教育部数据库。看你学校的区域认证（美国有六个——确保你的学校是其中之一）。

英国：查UKVI网站上的注册赞助商名单。

---

**应该让你跑的红旗**

- "没有要求！人人都被录取！"
- "按自己的节奏学习，没有考试！"
- "6个月拿到学位！"
- "我们与真正的大学有合作协议"（并没有）
- 名字和某个著名学校只差一个字母

---

**如果你最后去了假学校会怎样**

- 你的"学位"毫无价值
- 你的学生签证失效
- 你不能用那个学位在任何地方工作
- 如果他们认为你知情，你可能面临签证欺诈调查
- 你浪费了几年和大笔钱

真正的教育没有捷径。我知道当你挣扎着被录取时这很难接受。但假学位什么都解决不了。`,
    tags: ['野鸡大学', '文凭工厂', '防骗', '学历认证', '留学陷阱'],
    rating: 4.9,
    ratingCount: 8900,
    viewCount: 176000,
    authorName: '留学顾问',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=expert',
    isVerified: true,
    isHot: true,
    createdAt: '2026-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
  },
  {
    id: 'scholarship-scam',
    title: 'Scholarship Application Scam Alert',
    titleZh: '奖学金申请骗局警示',
    category: 'scam',
    content: `## "Congratulations! You've been selected!" — yeah, right

I got this email during my scholarship search. I was so excited I almost clicked the link before reading it carefully.

"Congratulations! You have been selected for the [made-up name] International Student Scholarship. To claim your award of $5,000, please submit a processing fee of $150."

Processing fee. For a scholarship. That "selected" me without me applying.

Something felt off. So I looked closer:
- The sender email was a Gmail address, not a school or official org
- The "scholarship" had no website I could find
- The deadline was "within 48 hours" — pressure tactic
- The "processing fee" would go to some weird payment app

I deleted it. But I was so close.

---

**Real scholarships don't ask for money**

This is the simplest rule: if someone asks you to pay to receive a scholarship, it's a scam. Real scholarships pay you. They don't charge you.

---

**How real scholarships work**

- You apply (or are automatically considered based on your application)
- There's a review process
- If selected, you receive the award — no fees involved
- They're advertised through official channels: your school's financial aid office, government websites, official program websites

---

**The "guaranteed scholarship" lie**

No legitimate scholarship "guarantees" you will receive it. If someone says "we guarantee this scholarship if you pay our fee" — walk away.

---

**Phishing emails to watch for**

- "Click here to claim your scholarship"
- "Your application was selected"
- "Urgent: confirm your information"

Before clicking any link:
- Hover over it to see where it actually goes
- Check the sender's email address carefully
- Go directly to the official website by typing it yourself, don't use email links

---

**Where to actually find scholarships**

- Your school's financial aid office
- Your country's education ministry scholarship programs
- Official scholarship search engines (not the random websites that come up in search results)
- The embassy or consulate of your host country`,
    contentZh: `## "恭喜！您被选中了！"——得了吧

我在搜索奖学金时收到这封邮件。我太激动了差点没仔细看就点了链接。

"恭喜！您已被选为[虚构名字]国际学生奖学金获得者。为了领取您的5000美元奖金，请提交150美元的处理费。"

处理费。奖学金。要我付费。被选中但我没申请过。

感觉不对劲。于是我仔细看了看：
- 发件人邮箱是Gmail地址，不是学校或官方机构
- 这个"奖学金"没有我能找到的网站
- 截止日期是"48小时内"——施压策略
- "处理费"要打到某个奇怪的支付app

我删掉了。但我差点就信了。

---

**真正的奖学金不会要钱**

这是最简单的规则：如果有人要你付费才能获得奖学金，那是诈骗。真正的奖学金是给你钱的。不是收你钱的。

---

**真正的奖学金怎么运作**

- 你申请（或者根据你的申请自动被考虑）
- 有审核流程
- 如果被选中，你获得奖项——不收任何费用
- 通过官方渠道宣传：你学校的学生资助办公室、政府网站、官方项目网站

---

**"保证奖学金"的谎言**

没有任何合法的奖学金"保证"你会获得。如果有人说"只要你付费我们就保证这个奖学金给你"——走开。

---

**要提防的钓鱼邮件**

- "点击此处领取您的奖学金"
- "您的申请已被选中"
- "紧急：确认您的信息"

在点击任何链接之前：
- 悬停在上方看它实际指向哪里
- 仔细检查发件人的邮箱地址
- 直接输入官方网站地址，不要用邮件里的链接

---

**真正在哪里找奖学金**

- 你学校的学生资助办公室
- 你国家的教育部奖学金项目
- 官方奖学金搜索引擎（不是搜索结果里随机出现的网站）
- 你目的地国家的大使馆或领事馆`,
    tags: ['奖学金', '骗局', '申请', '防骗', '教育'],
    rating: 4.7,
    ratingCount: 4560,
    viewCount: 89000,
    authorName: '教育专家',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=edu',
    isVerified: true,
    isHot: true,
    createdAt: '2026-03-18T14:00:00Z',
    updatedAt: '2024-03-18T14:00:00Z',
  },

  // ==================== MORE CULTURE GUIDES ====================
  {
    id: 'germany-study-culture',
    title: 'Germany Study Culture: Practical Guide',
    titleZh: '德国留学文化：实用指南',
    category: 'culture',
    country: 'Germany',
    content: `## Why German professors don't chase you

The first thing you notice in German university: nobody cares if you show up.

In my home country, professors would notice if you skipped. There were attendance policies. At my German university, I could miss an entire semester and no one would reach out.

That's not because they don't care. It's because they expect you to be responsible for your own learning.

---

**The self-directed thing**

German universities operate on the assumption that you're an adult who chose to be there. Classes aren't mandatory (usually). Deadlines are real. If you fail, it's on you.

This was a shock to me. I was used to being pushed. Here, if you don't push yourself, nothing happens.

---

**Professors are not your friends**

There's a formal distance. You use titles (Herr Professor, Frau Professorin). You don't call them by their first names unless invited. Emails are formal.

It felt cold at first. But it's not personal — it's just the culture. Respect is shown through formality.

---

**The appointment thing**

In Germany, everything requires an appointment. Want to see a professor during office hours? Make an appointment first. Need to talk to administration? Appointment. Doctor? Appointment.

Just walking in and expecting to talk to someone is not a thing. I learned this the hard way, standing in an empty hallway because the office was "by appointment only."

---

**Pünktlichkeit — being on time**

Germans take punctuality seriously. If you say you'll be somewhere at 10:00, be there at 10:00. Not 10:05. Not "roughly" 10:00.

Being late is disrespectful. It says you don't value the other person's time.

---

**The bureaucracy**

Everything is paperwork. Registration, enrollment, health insurance, visas — there's a form for everything. Usually multiple forms. In triplicate.

Patience is not a virtue here — it's a requirement for survival.

---

**Saving money as a student**

Get the Semesterticket. It's a public transit pass included in your semester fees. Worth hundreds of euros.

Get student discounts everywhere. Most museums, many restaurants, some shops — just ask. "Gibt es einen Studentenrabatt?" (Is there a student discount?)

Aldi and Lidl are your friends. Sunday everything is closed. Plan your shopping accordingly.

---

**The trash system**

Germans are serious about recycling. Glass, paper, plastics, bio-waste — each goes in its own bin. Sometimes different colored bins for different neighborhoods.

The first time I put the wrong trash in the wrong bin, an elderly neighbor nicely (firmly) explained the system to me. Now I'm a pro.`,
    contentZh: `## 为什么德国教授不追着你

你在德国大学第一件注意到的事：没人在乎你来不来。

在我祖国，教授会注意到你翘课。有出勤政策。在我读的德国大学，我可以翘掉整个学期没人会联系你。

不是因为他们不在乎。是因为他们期望你自己对自己的学习负责。

---

**自律这件事**

德国大学运作的原则是：你是一个选择来这里的成年人。课不是强制的（通常）。截止日期是真实的。如果你挂了，那是你的事。

这对我是个冲击。我习惯了被推着走。在这里，如果你不推自己，什么都不会发生。

---

**教授不是你的朋友**

有正式的距离。用头衔（Herr Professor，Frau Professorin）。不叫名字，除非他们让你叫。邮件是正式的。

一开始感觉冷淡。但这不是针对个人的——这是文化。尊重通过正式来体现。

---

**预约这件事**

在德国，一切都需要预约。想在办公时间见教授？先预约。需要和行政人员谈话？预约。看医生？预约。

直接走进去期望和人说话是不存在的。我硬着头皮才学会这个，站在空荡荡的走廊里因为办公室"仅限预约"。

---

**Pünktlichkeit——守时**

德国人认真对待守时。如果你说你10:00到那里，就10:00到。不是10:05。不是"大概"10:00。

迟到是不尊重的。这表示你不重视对方的时间。

---

**官僚主义**

一切都是文书工作。注册、入学、健康保险、签证——每样东西都有表格。通常不止一张。通常一式三份。

耐心在这里不是美德——是生存必需。

---

**作为学生省钱**

买Semesterticket。它是包含在你学期费里的公共交通通票。值几百欧元。

到处问学生折扣。大多数博物馆、很多餐厅、一些商店——就问一下。"Gibt es einen Studentenrabatt?"（有学生折扣吗？）

Aldi和Lidl是你的朋友。周日什么都关门。相应地计划你的采购。

---

**垃圾桶系统**

德国人对回收很认真。玻璃、纸张、塑料、有机垃圾——每种放自己的垃圾桶。有时候不同街区用不同颜色的垃圾桶。

第一次我把垃圾放错垃圾桶时，一位年长的邻居好心地（坚定地）向我解释了系统。现在我是专家了。`,
    tags: ['德国', '留学', '文化', '学习', '生活'],
    rating: 4.6,
    ratingCount: 2340,
    viewCount: 45600,
    authorName: '柏林留学生',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=berlin',
    isVerified: true,
    isHot: false,
    createdAt: '2026-03-10T09:00:00Z',
    updatedAt: '2024-03-10T09:00:00Z',
  },
  {
    id: 'australia-culture-guide',
    title: 'Australia Study Life: Culture Guide',
    titleZh: '澳洲留学生活：文化指南',
    category: 'culture',
    country: 'Australia',
    content: `## What nobody tells you about Australian slang

I arrived in Sydney ready for "standard English." I was not prepared.

My first week, a local told me to "grab a snag from the sausage sizzle." I smiled and nodded, understanding exactly zero words.

---

**Essential Aussie slang to survive:**

- Arvo = afternoon
- Brekkie = breakfast
- Chrissy = Christmas
- Devo = devastated
- Flat out = busy
- Heaps = a lot ("thanks, heaps")
- Mozzie = mosquito
- Nut out = to work hard on something
- Oldies = parents
- Pash = to kiss
- Peg = to throw ("peg it!" = run!)
- Postie = mail carrier
- Rage = to be angry, or a big party
- Rapt = thrilled
- Servo = gas station
- Skive = to skip school/work
- Snag = sausage
- Ta = thank you
- Ta-ta = goodbye
- Thongs = flip flops (not underwear!)
- Arvo = afternoon

---

**The time thing**

Australians are relaxed about time — but not in Japan-relaxed or Germany-strict. Being 5-10 minutes late to a casual hangout is generally fine. Being late to something formal isn't.

Social plans are flexible. "Let's catch up sometime" might mean next week or never. If someone is specific — "see you at 7pm Friday at X" — that's real.

---

**The sun thing**

The sun in Australia is no joke. UV levels are extreme. I got sunburned on a cloudy day because I didn't realize clouds don't block UV.

Sunscreen is not optional. Wear it every day, even in winter. The sun doesn't mess around here.

---

**The "no worries" thing**

When someone says "no worries," they're not stressed. It's basically "you're welcome" or "it's fine" or "no problem." It's the Australian response to everything from "thanks" to "sorry."

---

**The BBQ thing**

Barbecues are social events. Someone hosts, everyone brings something to contribute — drinks, meat, salads. Not showing up empty-handed is implied.

The host usually does the cooking. "Shout" means it's your turn to buy drinks or do the next round.

---

**The平等 thing**

Australians don't like big hierarchies. Professors might tell you to call them by first name. Bosses eat lunch with employees. It's casual in a way that took me time to get used to.

Direct communication is valued. If someone has a problem, they'll usually tell you directly. It can feel blunt if you're from a more indirect communication culture, but it's not meant to be rude.

---

**The safety thing**

Australia has dangerous wildlife. Not to scare you — attacks are rare — but be aware:
- Sharks at beaches (swim between the flags)
- Jellyfish in the water up north (some areas are unsafe certain times of year)
- Snakes (in parks, even city ones — give them space)
- Crocodiles up north (definitely research before swimming in tropical areas)

That said: millions of people live here without incident. Be smart, be aware, don't do stupid things, and you'll be fine.`,
    contentZh: `## 没人告诉你的澳洲俚语

我到达悉尼准备迎接"标准英语"。我没准备好。

第一周，本地人告诉我"grab a snag from the sausage sizzle"。我笑着点头，一个字都没听懂。

---

**生存必需的澳洲俚语：**

- Arvo = 下午
- Brekkie = 早餐
- Chrissy = 圣诞节
- Devo = 崩溃
- Flat out = 忙
- Heaps = 很多（"谢了，heaps"）
- Mozzie = 蚊子
- Nut out = 努力做某事
- Oldies = 父母
- Pash = 亲吻
- Peg = 扔（"peg it!" = 跑！）
- Postie = 邮递员
- Rage = 生气，或者大型派对
- Rapt = 兴奋
- Servo = 加油站
- Skive = 翘课/翘班
- Snag = 香肠
- Ta = 谢谢
- Ta-ta = 再见
- Thongs = 人字拖（不是内衣！）
- Arvo = 下午

---

**时间那件事**

澳洲人对时间很随意——但不是日本式随意也不是德国式严格。社交聚会迟到5-10分钟通常没问题。正式场合迟到不行。

社交计划是灵活的。"我们找个时间聚聚"可能是下周也可能是永远没人真的约。如果有人具体说——"周五晚上7点X见"——那是真的。

---

**太阳那件事**

澳洲的太阳不是开玩笑的。紫外线很强。我在一个多云天被晒伤了，因为我不知道云不挡紫外线。

防晒不是可选项。每天涂，即使冬天。太阳在这里不是闹着玩的。

---

**"No worries"那件事**

当有人说"no worries"，他们不是压力大。这基本上是"不客气"或"没关系"或"没问题"。这是澳洲人对一切的回应，从"谢谢"到"对不起"。

---

**BBQ那件事**

烧烤是社交活动。有人做东，每人带点东西来——酒、肉、沙拉。不空手来是默认的。

主人通常负责烹饪。"Shout"轮到你买酒或下一轮。

---

**平等那件事**

澳洲人不待见大的等级制度。教授可能让你叫名字。老板和员工一起吃午饭。它很 casual，让我花了一段时间适应。

直接沟通是被重视的。如果有人有问题，他们通常会直接告诉你。如果你来自更间接的沟通文化，这可能感觉有点生硬，但这不是要冒犯你。

---

**安全那件事**

澳大利亚有危险野生动物。不是要吓你——袭击很罕见——但要留意：
- 海滩上的鲨鱼（在旗帜之间游）
- 北部的水母（某些地区某些时节不安全）
- 蛇（公园里，甚至城市公园——给它们空间）
- 北部有鳄鱼（游泳前一定要研究热带地区）

不过：数以百万计的人住在这里从没出过事。聪明点，留意，不要做傻事，你就会没事的。`,
    tags: ['澳洲', '澳大利亚', '留学', '文化', '生活'],
    rating: 4.5,
    ratingCount: 1890,
    viewCount: 36700,
    authorName: '悉尼留学生',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sydney2',
    isVerified: true,
    isHot: false,
    createdAt: '2026-03-12T11:00:00Z',
    updatedAt: '2024-03-12T11:00:00Z',
  },

  // ==================== MORE SAFETY GUIDES ====================
  {
    id: 'europe-train-travel-safety',
    title: 'Europe Train Travel Safety Guide',
    titleZh: '欧洲火车旅行安全指南',
    category: 'safety',
    content: `## My backpack is gone. My passport is gone. I'm in Vienna and I have nothing.

This is the story of how I learned to be smarter on European trains.

I fell asleep on the train from Budapest to Vienna. Classic mistake. When I woke up, my backpack was gone. In it: my passport, my laptop, my wallet, everything.

I was left with just the clothes I was wearing and my phone (which was in my pocket, thank god).

---

**What I should've done:**

The cardinal rule: your valuable stuff stays on your body or in a bag you can feel. Not in the overhead bin. Not under your seat. On your body or in your lap.

I got lucky. I had an extra card in my pocket. I called my bank, cancelled everything, got help from the Chinese embassy in Vienna (they were actually really helpful).

But it was a nightmare that could've been prevented.

---

**The theft-prone routes**

Long overnight trains are the most common place for theft, especially:
- Budapest-Vienna
- Barcelona-Paris
- Berlin-Munich
- Any route through major tourist areas

These aren't guarantees, but be extra vigilant on these.

---

**The actual safety stuff**

Get a lock for your bag. A simple cable lock through the zippers can deter opportunists.

Use the overhead bin? Put a jacket on top of it so you'd notice if someone moved it.

Take turns sleeping if you're traveling with someone. Don't all sleep at once.

Keep your phone and wallet in front pockets, not back.

---

**The ticket thing**

Book directly through official channels when possible:
- Deutsche Bahn (Germany)
- SNCF Connect (France)
- Trenitalia (Italy)
- Rail Europe for international

Avoid third-party resellers. You might pay more, and sometimes tickets are invalid.

---

**If your stuff does get stolen**

- File a police report immediately (you'll need this for insurance and embassy)
- Contact your embassy — they can issue emergency travel documents
- Call your bank to cancel cards
- Change passwords if devices were taken
- Don't panic. It happens. You'll get through it.`,
    contentZh: `## 我的包没了。护照没了。我在维也纳，什么都没有了。

这是我学会在欧洲火车上更聪明做人的故事。

我在布达佩斯到维也纳的火车上睡着了。经典错误。醒来的时候，我的包没了。里面有：我的护照、笔记本电脑、钱包、所有东西。

只剩下我身上穿的衣服和手机（谢天谢地在口袋里）。

---

**我应该做的：**

最重要的规则：贵重物品要放在身上或者你能感觉到的包里。不放在行李架上。不放在座位下面。放在身上或抱在怀里。

我运气好。我在口袋里还有一张备用卡。我打电话给银行，注销了所有卡，从中国驻维也纳大使馆获得帮助（他们真的很帮忙）。

但这是一个本可以预防的噩梦。

---

**容易被盗的线路**

长途过夜火车是最常见的盗窃地点，尤其是：
- 布达佩斯-维也纳
- 巴塞罗那-巴黎
- 柏林-慕尼黑
- 任何经过主要旅游区的线路

这些不是绝对的，但要格外警惕。

---

**真正的安全措施**

给你的包上锁。简单的线缆锁穿过拉链可以阻止机会主义小偷。

用行李架？把一件外套放在上面，这样如果有人动你会注意到。

如果和别人一起旅行，轮流睡觉。不要同时都睡着。

把手机和钱包放在前面的口袋，不是后面的。

---

**车票那件事**

可能的话，直接通过官方渠道预订：
- Deutsche Bahn（德国）
- SNCF Connect（法国）
- Trenitalia（意大利）
- Rail Europe 用于国际线路

避免第三方转售商。你可能付更多钱，有时候票是无效的。

---

**如果你的东西真的被偷了**

- 立刻报警（你将需要这个用于保险和护照）
- 联系你的大使馆——他们可以给你颁发旅行证件
- 打电话给银行注销卡
- 如果设备被拿走，更改密码
- 别慌。这发生了。你会挺过去的。`,
    tags: ['欧洲', '火车', '旅行', '安全', '防盗'],
    rating: 4.4,
    ratingCount: 1230,
    viewCount: 23400,
    authorName: '旅行达人',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=travel',
    isVerified: true,
    isHot: false,
    createdAt: '2026-03-08T08:00:00Z',
    updatedAt: '2024-03-08T08:00:00Z',
  },

  // ==================== MORE LEGAL GUIDES ====================
  {
    id: 'tax-guide-international-students',
    title: 'Tax Guide for International Students',
    titleZh: '留学生税务指南',
    category: 'legal',
    content: `## I didn't file taxes for two years. Here's what happened.

I didn't know I had to. No one told me. I was a student with a small part-time job. I thought taxes were for "real adults."

Then my university sent me a letter. I owed penalties for not filing.

---

**Do international students file taxes?**

Short answer: usually yes, even if you don't owe anything.

In most countries, if you earn income, you need to file. Some countries (like the US for F-1 students) have tax treaties that may exempt the first few years of study-related income. But you still might need to file to claim that exemption.

The deadlines are real. Miss them and you face penalties. I learned this the expensive way.

---

**The basics by country**

**US:**
- F-1 students: first 5 years are usually tax-exempt on income earned while in student status
- You'll get a W-2 from your employer if you worked on-campus
- Use Form 8843 if you're exempt
- File through IRS or use a tax filing service
- Deadline: April 15 (like everyone else)

**UK:**
- Student Route visa holders: no tax if you're under the personal allowance threshold
- If you earn over the threshold, you file with HMRC
- It's usually handled through PAYE (Pay As You Earn) automatically
- But if you have multiple jobs or significant income, you might need to file

**Germany:**
- Everyone who earns must file annually
- There's a basic allowance (Grundfreibetrag) — below this, you owe nothing
- Filing is through Finanzamt, can be done online
- If you had a part-time job, tax was automatically deducted — you might be owed a refund

---

**The keeping records thing**

Keep every document related to your income and taxes:
- Pay stubs
- Tax forms from your employer
- Any scholarship/grant documents
- Your visa and entry/exit records

I learned this too late. I spent hours reconstructing records from my employer and bank.

---

**Getting help**

Your university's international student office often has tax guidance or can point you to free resources.

There are also free tax filing services for students in many countries. Don't pay someone to file a simple student tax return if you don't need to.

Some countries have special agreements with Chinese embassies or cultural centers for help. It's worth asking.`,
    contentZh: `## 我两年没报税了。发生了什么。

我不知道我得报。没人告诉我。我是一个只有兼职工作的小学生。我以为税是"真正的成年人"才要交的。

然后我的大学给我寄了一封信。我因为没报税欠了罚款。

---

**国际学生要报税吗？**

简短回答：通常是的，即使你不欠任何税。

在大多数国家，如果你有收入，你需要报。一些国家（如美国对F-1学生）可能有税收协定，在学习相关收入的前几年可能免税。但你可能仍然需要报税来申请那个豁免。

截止日期是真的。错过了就要面临罚款。我用昂贵的代价学到了这个。

---

**各国 basics**

**美国：**
- F-1学生：在学生身份期间获得收入，前5年通常免税
- 如果你在校内工作，雇主会给你W-2
- 如果你豁免，使用Form 8843
- 通过IRS或使用报税服务报税
- 截止日期：4月15日（和其他人一样）

**英国：**
- Student Route签证持有者：如果在个人免税额门槛以下不用交税
- 如果你赚得超过门槛，向HMRC报税
- 通常通过PAYE（随赚随缴）自动处理
- 但如果你有多份工作或可观收入，你可能需要报税

**德国：**
- 每个赚钱的人每年都要报税
- 有一个基本免税额度（Grundfreibetrag）——在这以下是零
- 通过Finanzamt报税，可以在线完成
- 如果你有兼职工作，税已经自动扣除了——你可能能得到退款

---

**记录保存那件事**

保存每一个和你的收入和税务相关的文件：
- 工资单
- 雇主的税表
- 任何奖学金/助学金文件
- 你的签证和出入境记录

我太晚知道这个了。我花了几个小时从雇主和银行重建记录。

---

**获得帮助**

你学校的国际学生办公室通常有税务指南，或者能给你指出免费资源。

在许多国家也有针对学生的免费报税服务。如果你不需要，不要付钱让人帮你报一个简单学生税表。

一些国家与中国大使馆或文化中心有特殊协议提供帮助。值得问一下。`,
    tags: ['税务', '报税', '法律', '留学', '收入'],
    rating: 4.5,
    ratingCount: 3450,
    viewCount: 67800,
    authorName: '财务顾问',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=finance',
    isVerified: true,
    isHot: false,
    createdAt: '2026-03-05T15:00:00Z',
    updatedAt: '2024-03-05T15:00:00Z',
  },

  // ==================== MORE OTHER GUIDES ====================
  {
    id: 'part-time-job-guide',
    title: 'Part-time Job Guide for International Students',
    titleZh: '留学生兼职工作指南',
    category: 'other',
    content: `## Why I said no to the job that would've gotten me deported

It was my second year. Money was tight. A restaurant owner offered me cash under the table — no paperwork, no taxes, just cash in hand every Friday.

It was double what I'd make at an on-campus job.

I said no. He looked at me like I was crazy.

Here's why I said no:

1. Working off-campus without authorization violates my visa status. If caught, my visa gets cancelled and I'm sent home.

2. The "no paperwork" thing means no legal protection. If he decided not to pay me, I had no recourse.

3. It sets a precedent for other violations. The more you break rules, the easier it is to keep breaking them.

---

**What you can actually do:**

**On-campus jobs:**
- Library assistant
- Dining hall worker
- Lab assistant
- Research assistant (if your professor has funding)
- Gym staff
- Resident advisor (often free housing + stipend)

These are usually the safest options. They're pre-approved for international students and work around your class schedule.

---

**Off-campus (with proper authorization):**

**US — CPT and OPT:**
- CPT (Curricular Practical Training): For credit-bearing internships related to your field. Requires authorization before you start.
- OPT (Optional Practical Training): For work after graduation. Also requires authorization.

**UK — restrictions apply:**
- Up to 20 hours per week during term time
- Cannot be self-employed or work as a professional entertainer
- Certain visa types have different rules

**Australia:**
- 40 hours per fortnight (not per week)
- No restrictions during official vacation periods
- Must maintain enrollment and satisfactory progress

---

**Finding work:**

- Your school's career center (they exist for students, including international students)
- On-campus job boards
- Professor recommendations (they sometimes know about positions)
- Official job sites (Indeed, LinkedIn, local job boards)

---

**A note on overtime**

Your visa work limits are maximums, not targets. Working 20 hours while studying full-time is stressful. Make sure you can handle the load before adding a job.

I made this mistake. My grades suffered, I was exhausted all the time, and I ended up quitting anyway. It's not worth burning out.`,
    contentZh: `## 为什么我拒绝了那份会让我被驱逐出境的工作

那是大二的时候。钱很紧。一个餐厅老板提出给我现金——不做文书工作、不交税、每周五直接拿现金。

这是我在校内工作收入的两倍。

我说不。他看我的眼神像在看一个疯子。

这就是我说不的原因：

1. 未经授权在校外工作违反了签证状态。如果被发现，我的签证被取消，我被送回家。

2. "不做文书工作"意味着没有任何法律保护。如果他决定不付我钱，我无处申诉。

3. 这为其他违规行为开了先例。你越打破规则，继续打破规则就越容易。

---

**你实际上能做什么：**

**校内工作：**
- 图书馆助理
- 食堂员工
- 实验室助理
- 研究助理（如果你的教授有资金）
- 健身房员工
- 宿舍管理员（通常免房租+津贴）

这些通常是最安全的选择。它们是预先批准给国际学生的，而且围绕你的课表安排。

---

**校外工作（需要适当授权）：**

**美国——CPT和OPT：**
- CPT（课程实习培训）：用于与你专业相关的有学分实习。需要开始前获得授权。
- OPT（选择性实习培训）：用于毕业后工作。也需要授权。

**英国——有 restrictions：**
- 学期间每周最多20小时
- 不能自雇或担任职业表演者
- 某些签证类型有不同规则

**澳大利亚：**
- 每两周40小时（不是每周）
- 正式假期无限制
- 必须保持注册和令人满意的学业进展

---

**找工作：**

- 你学校的职业中心（他们为学生服务，包括国际学生）
- 校内工作布告栏
- 教授推荐（他们有时知道一些职位）
- 官方工作网站（Indeed、LinkedIn、当地工作布告栏）

---

**关于超时工作**

你的签证工作限制是最大值，不是目标。在全日制学习的同时工作20小时是有压力的。在增加工作之前确保你能应付这个强度。

我犯了这个错误。我的成绩受影响，我总是筋疲力尽，最后我还是辞职了。精疲力竭不值得。`,
    tags: ['兼职', '打工', '工作', '留学生', '求职'],
    rating: 4.8,
    ratingCount: 5670,
    viewCount: 112000,
    authorName: '就业顾问',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=job',
    isVerified: true,
    isHot: true,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z',
  },
];

// Helper functions
export function getSurvivalGuidesByCategory(category: SurvivalCategory): SurvivalGuide[] {
  return survivalGuidesData.filter(g => g.category === category);
}

export function getSurvivalGuideById(id: string): SurvivalGuide | undefined {
  return survivalGuidesData.find(g => g.id === id);
}

export function getHotSurvivalGuides(limit: number = 5): SurvivalGuide[] {
  return survivalGuidesData
    .filter(g => g.isHot)
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit);
}

export function getLatestSurvivalGuides(limit: number = 5): SurvivalGuide[] {
  return survivalGuidesData
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function searchSurvivalGuides(query: string): SurvivalGuide[] {
  const lowerQuery = query.toLowerCase();
  return survivalGuidesData.filter(g =>
    g.title.toLowerCase().includes(lowerQuery) ||
    g.titleZh.includes(query) ||
    g.content.toLowerCase().includes(lowerQuery) ||
    g.contentZh.includes(query) ||
    g.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export function getRelatedSurvivalGuides(guide: SurvivalGuide, limit: number = 3): SurvivalGuide[] {
  return survivalGuidesData
    .filter(g => g.category === guide.category && g.id !== guide.id)
    .slice(0, limit);
}

// Get survival guides by country
export function getSurvivalGuidesByCountry(country: string): SurvivalGuide[] {
  return survivalGuidesData.filter(g => g.country === country);
}

// Get survival guides by tag
export function getSurvivalGuidesByTag(tag: string): SurvivalGuide[] {
  return survivalGuidesData.filter(g =>
    g.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  );
}

// Search survival guides with relevance scoring
export function searchSurvivalGuidesAdvanced(query: string): SurvivalGuide[] {
  const lowerQuery = query.toLowerCase();
  return survivalGuidesData
    .map(g => ({
      ...g,
      relevanceScore: (
        (g.title.toLowerCase().includes(lowerQuery) ? 3 : 0) +
        (g.titleZh.includes(query) ? 3 : 0) +
        (g.content.toLowerCase().includes(lowerQuery) ? 1 : 0) +
        (g.contentZh.includes(query) ? 1 : 0) +
        g.tags.filter(t => t.toLowerCase().includes(lowerQuery)).length
      )
    }))
    .filter(g => g.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .map(({ relevanceScore, ...g }) => g);
}

// Get all unique tags
export function getAllSurvivalTags(): string[] {
  const tags = new Set<string>();
  survivalGuidesData.forEach(g => g.tags.forEach(t => tags.add(t)));
  return [...tags].sort();
}

// Get all countries with survival guides
export function getAllSurvivalCountries(): string[] {
  return [...new Set(survivalGuidesData.filter(g => g.country).map(g => g.country!))].sort();
}

// Get survival guides statistics
export function getSurvivalGuidesStats(): { total: number; byCategory: Record<string, number>; byCountry: Record<string, number> } {
  const byCategory: Record<string, number> = {};
  const byCountry: Record<string, number> = {};

  survivalGuidesData.forEach(g => {
    byCategory[g.category] = (byCategory[g.category] || 0) + 1;
    if (g.country) {
      byCountry[g.country] = (byCountry[g.country] || 0) + 1;
    }
  });

  return { total: survivalGuidesData.length, byCategory, byCountry };
}

export const survivalGuideCategories = [
  { value: 'scam' as const, label: '防骗指南', labelEn: 'Scam Prevention', icon: '⚠️' },
  { value: 'culture' as const, label: '文化禁忌', labelEn: 'Culture', icon: '🎭' },
  { value: 'safety' as const, label: '安全提醒', labelEn: 'Safety', icon: '🔒' },
  { value: 'legal' as const, label: '法律须知', labelEn: 'Legal', icon: '⚖️' },
  { value: 'other' as const, label: '其他', labelEn: 'Other', icon: '📌' },
];
