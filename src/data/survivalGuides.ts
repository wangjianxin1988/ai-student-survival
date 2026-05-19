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
    content: `## 租房押金骗局防范指南

### 常见骗局形式

1. **虚假房源**
   - 骗子发布不存在的房源照片
   - 要求你先支付押金才给钥匙
   - 通常价格低于市场价很多

2. **冒充房东**
   - 从网上复制真实房源信息
   - 声称自己在国外无法见面
   - 要求转账到海外账户

3. **二房东诈骗**
   - 假称有转租权
   - 收取押金后消失
   - 真正的房东不知情

### 防范措施

✅ **核实房东身份**
- 要求查看房产证
- 确认水电费账单上的名字
- 通过学校Housing Office核实

✅ **实地看房**
- 一定要亲自或委托可信的人看房
- 不要只看照片就付钱
- 确认房屋实际状况

✅ **使用正规渠道**
- 通过学校认证的中介
- 使用官方租房平台
- 避免私下转账

✅ **合同保护**
- 使用书面合同
- 押金一定要有收据
- 押金存入政府认可的保障计划（TDS或DPS）

### 紧急联系方式

- 英国报警：999
- 英国非紧急报警：101
- 反诈骗热线：0300 123 2040`,
    contentZh: `## 租房押金骗局防范指南

### 常见骗局形式

1. **虚假房源**
   - 骗子发布不存在的房源照片
   - 要求你先支付押金才给钥匙
   - 通常价格低于市场价很多

2. **冒充房东**
   - 从网上复制真实房源信息
   - 声称自己在国外无法见面
   - 要求转账到海外账户

3. **二房东诈骗**
   - 假称有转租权
   - 收取押金后消失
   - 真正的房东不知情

### 防范措施

✅ **核实房东身份**
- 要求查看房产证
- 确认水电费账单上的名字
- 通过学校Housing Office核实

✅ **实地看房**
- 一定要亲自或委托可信的人看房
- 不要只看照片就付钱
- 确认房屋实际状况

✅ **使用正规渠道**
- 通过学校认证的中介
- 使用官方租房平台
- 避免私下转账

✅ **合同保护**
- 使用书面合同
- 押金一定要有收据
- 押金存入政府认可的保障计划（TDS或DPS）

### 紧急联系方式

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
    content: `## 兼职刷单骗局防范指南

### 骗局原理

骗子通过社交媒体、招聘网站发布"高薪兼职"广告，声称：
- 每天工作2小时，月入3000美元
- 无需技能，会玩手机就行
- 先转账给你，你再转账回去

### 真实案例

**案例1：刷单诈骗**
1. 骗子联系你说可以刷单赚钱
2. 让你先垫付100元，说会返还105元
3. 初期确实返钱，让你放松警惕
4. 加大金额后，骗子消失

**案例2：打字兼职**
1. 声称每打字1000字可赚50美元
2. 要求先交"入会费"199元
3. 付费后拉黑你

**案例3：刷好评**
1. 让你在电商平台刷好评
2. 先给佣金，之后卷走本金

### 防范措施

❌ **永远不要先转账**
- 任何要求你先付款的都是诈骗
- 正规工作不会要你垫钱

❌ **警惕高回报承诺**
- "轻松赚钱"、"日入百元"都是骗局
- 合法兼职时薪通常$10-20

❌ **不要提供银行信息**
- 不要告诉别人你的银行账号
- 不要给别人你的SSN

✅ **核实公司信息**
- 在BBB.org查询公司评价
- 搜索公司名+scam
- 询问当地华人社区

### 正确的兼职寻找方式

1. 学校Career Center
2. Indeed.com
3. LinkedIn
4. 校园内的工作岗位`,
    contentZh: `## 兼职刷单骗局防范指南

### 骗局原理

骗子通过社交媒体、招聘网站发布"高薪兼职"广告，声称：
- 每天工作2小时，月入3000美元
- 无需技能，会玩手机就行
- 先转账给你，你再转账回去

### 真实案例

**案例1：刷单诈骗**
1. 骗子联系你说可以刷单赚钱
2. 让你先垫付100元，说会返还105元
3. 初期确实返钱，让你放松警惕
4. 加大金额后，骗子消失

**案例2：打字兼职**
1. 声称每打字1000字可赚50美元
2. 要求先交"入会费"199元
3. 付费后拉黑你

**案例3：刷好评**
1. 让你在电商平台刷好评
2. 先给佣金，之后卷走本金

### 防范措施

❌ **永远不要先转账**
- 任何要求你先付款的都是诈骗
- 正规工作不会要你垫钱

❌ **警惕高回报承诺**
- "轻松赚钱"、"日入百元"都是骗局
- 合法兼职时薪通常$10-20

❌ **不要提供银行信息**
- 不要告诉别人你的银行账号
- 不要给别人你的SSN

✅ **核实公司信息**
- 在BBB.org查询公司评价
- 搜索公司名+scam
- 询问当地华人社区

### 正确的兼职寻找方式

1. 学校Career Center
2. Indeed.com
3. LinkedIn
4. 校园内的工作岗位`,
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
    content: `## 换汇骗局防范指南

### 常见骗局形式

**1. 微信群换汇**
- 声称汇率比银行好
- 先转账给你，你再转人民币
- 等你转账后拉黑

**2. 私下换汇风险**
- 没有法律保护
- 可能涉及洗钱
- 账户可能被冻结

**3. 虚假汇率优惠**
- 骗子声称有特殊渠道
- 要求你先转人民币
- 之后消失

### 真实案例

**案例：留学生换汇被骗8万**
1. 在微信群看到换汇广告
2. 汇率比市场低0.2
3. 先小额交易成功
4. 大额转账后被拉黑
5. 损失8万人民币

### 防范措施

✅ **使用正规渠道**
- 银行电汇
- 正规换汇公司（如Western Union）
- PayPal等正规平台

✅ **拒绝私下交易**
- 不要和陌生人换汇
- 微信群换汇风险极高
- 没有保障，出了问题追不回来

✅ **了解法律规定**
- 大额换汇需要申报
- 私下换汇可能违法
- 涉及洗钱会被追究责任

### 推荐的换汇方式

| 方式 | 优点 | 缺点 |
|------|------|------|
| 银行电汇 | 安全、有记录 | 有手续费 |
| 支付宝国际 | 方便 | 有限额 |
| Wise | 汇率好 | 需要验证 |
| Western Union | 快速 | 费用较高 |

### 紧急处理

如果已经被骗：
1. 立即报警
2. 保存所有聊天记录
3. 提供转账记录
4. 联系银行尝试冻结账户`,
    contentZh: `## 换汇骗局防范指南

### 常见骗局形式

**1. 微信群换汇**
- 声称汇率比银行好
- 先转账给你，你再转人民币
- 等你转账后拉黑

**2. 私下换汇风险**
- 没有法律保护
- 可能涉及洗钱
- 账户可能被冻结

**3. 虚假汇率优惠**
- 骗子声称有特殊渠道
- 要求你先转人民币
- 之后消失

### 真实案例

**案例：留学生换汇被骗8万**
1. 在微信群看到换汇广告
2. 汇率比市场低0.2
3. 先小额交易成功
4. 大额转账后被拉黑
5. 损失8万人民币

### 防范措施

✅ **使用正规渠道**
- 银行电汇
- 正规换汇公司（如Western Union）
- PayPal等正规平台

✅ **拒绝私下交易**
- 不要和陌生人换汇
- 微信群换汇风险极高
- 没有保障，出了问题追不回来

✅ **了解法律规定**
- 大额换汇需要申报
- 私下换汇可能违法
- 涉及洗钱会被追究责任

### 推荐的换汇方式

| 方式 | 优点 | 缺点 |
|------|------|------|
| 银行电汇 | 安全、有记录 | 有手续费 |
| 支付宝国际 | 方便 | 有限额 |
| Wise | 汇率好 | 需要验证 |
| Western Union | 快速 | 费用较高 |

### 紧急处理

如果已经被骗：
1. 立即报警
2. 保存所有聊天记录
3. 提供转账记录
4. 联系银行尝试冻结账户`,
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
    content: `## 针对留学生的电话诈骗防范指南

### 常见骗局类型

**1. DHL/DHL诈骗**
- "这里是DHL，您有一个包裹被扣"
- 要求你提供个人信息或转账
- 骗子会说不处理会有严重后果

**2. 中国大使馆诈骗**
- "您有一份重要文件未领取"
- "您的签证有问题"
- 要求你转账到"安全账户"

**3. 税务局诈骗**
- 声称你有未缴税款
-威胁要驱逐出境
- 要求立即付款

**4. 绑架诈骗**
- 谎称你家人出事
- 要求立刻转账
- 利用焦急心理

### 防范措施

✅ **保持冷静**
- 正规机构不会电话威胁
- 不会要求立即转账
- 不会要你的银行密码

✅ **核实身份**
- 挂断电话，自己拨打官方电话
- 不要用骗子提供的号码
- 中国外交部全球领事保护电话：12308

✅ **不要透露信息**
- 不要告诉任何人你的ID号码
- 不要告诉你的银行信息
- 不要转账给陌生人

### 紧急联系方式

- 中国外交部全球领事保护热线：+86-10-12308
- 微信小程序：领事直通车
- 英国报警：999
- 美国报警：911`,
    contentZh: `## 针对留学生的电话诈骗防范指南

### 常见骗局类型

**1. DHL/DHL诈骗**
- "这里是DHL，您有一个包裹被扣"
- 要求你提供个人信息或转账
- 骗子会说不处理会有严重后果

**2. 中国大使馆诈骗**
- "您有一份重要文件未领取"
- "您的签证有问题"
- 要求你转账到"安全账户"

**3. 税务局诈骗**
- 声称你有未缴税款
-威胁要驱逐出境
- 要求立即付款

**4. 绑架诈骗**
- 谎称你家人出事
- 要求立刻转账
- 利用焦急心理

### 防范措施

✅ **保持冷静**
- 正规机构不会电话威胁
- 不会要求立即转账
- 不会要你的银行密码

✅ **核实身份**
- 挂断电话，自己拨打官方电话
- 不要用骗子提供的号码
- 中国外交部全球领事保护电话：12308

✅ **不要透露信息**
- 不要告诉任何人你的ID号码
- 不要告诉你的银行信息
- 不要转账给陌生人

### 紧急联系方式

- 中国外交部全球领事保护热线：+86-10-12308
- 微信小程序：领事直通车
- 英国报警：999
- 美国报警：911`,
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
    content: `## 英国文化礼仪指南

### 社交礼仪

**1. 问候方式**
- 见面通常握手
- 熟悉的人可能只是点头或简单问候
- "How do you do?"只是一句问候，不需要真的回答

**2. 排队文化**
- 英国人非常重视排队
- 永远不要插队
- 保持适当的身体距离

**3. 私人空间**
- 英国人重视个人空间
- 保持一臂左右的距离
- 避免不必要的身体接触

### 餐桌礼仪

✅ **用餐礼仪**
- 不要嘴里含着食物说话
- 手肘不要放在桌上
- 用餐完毕把刀叉放在一起

✅ **点餐文化**
- 在pub可以说"Two pints, please"
- 等所有人都有食物了再开始吃
- 付账通常AA制

❌ **不要做的事**
- 不要大声说话
- 不要在吃饭时发出声音
- 不要催促服务员

### 学习文化

**1. 学术诚信**
- 引用必须注明来源
- 合作作业要问清楚规则
- 作弊后果非常严重

**2. 课堂参与**
- 鼓励独立思考
- 敢于表达不同意见
- 尊重他人的观点

### 生活礼仪

**1. 问候语**
- Hello, Hi, Good morning
- 英国人聊天气是社交方式
- 不要问太私人的问题

**2. 守时**
- 参加会议要准时
- 晚到5分钟以上要道歉
- 社交活动可以稍微迟到`,
    contentZh: `## 英国文化礼仪指南

### 社交礼仪

**1. 问候方式**
- 见面通常握手
- 熟悉的人可能只是点头或简单问候
- "How do you do?"只是一句问候，不需要真的回答

**2. 排队文化**
- 英国人非常重视排队
- 永远不要插队
- 保持适当的身体距离

**3. 私人空间**
- 英国人重视个人空间
- 保持一臂左右的距离
- 避免不必要的身体接触

### 餐桌礼仪

✅ **用餐礼仪**
- 不要嘴里含着食物说话
- 手肘不要放在桌上
- 用餐完毕把刀叉放在一起

✅ **点餐文化**
- 在pub可以说"Two pints, please"
- 等所有人都有食物了再开始吃
- 付账通常AA制

❌ **不要做的事**
- 不要大声说话
- 不要在吃饭时发出声音
- 不要催促服务员

### 学习文化

**1. 学术诚信**
- 引用必须注明来源
- 合作作业要问清楚规则
- 作弊后果非常严重

**2. 课堂参与**
- 鼓励独立思考
- 敢于表达不同意见
- 尊重他人的观点

### 生活礼仪

**1. 问候语**
- Hello, Hi, Good morning
- 英国人聊天气是社交方式
- 不要问太私人的问题

**2. 守时**
- 参加会议要准时
- 晚到5分钟以上要道歉
- 社交活动可以稍微迟到`,
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
    content: `## 美国校园文化指南

### 社交文化

**1. Small Talk**
- 美国人喜欢small talk（闲聊）
- 常用话题：天气、球赛、周末计划
- 这不是虚伪，是社交礼仪

**2. 打招呼方式**
- 正式场合握手
- 朋友之间hug是常见的
- 点头微笑表示友好

**3. 邀请文化**
- 直接说"Let's hang out"
- "Maybe sometime"可能是拒绝
- 不要害怕主动社交

### 学术文化

**1. 课堂参与**
- 教授鼓励提问和讨论
- 积极参与会加分
- Office Hours很重要

**2. 团队合作**
- 小组作业很常见
- 要学会表达自己的观点
- 注意分工和协调

**3. 学术诚信**
- Plagiarism后果严重
- Collaboration要看规则
- 引用格式要准确

### 校园生活

**1. Greek Life（兄弟会/姐妹会）**
- 可选但很普遍
- 不是必须参加的
- 申请有过程，要了解清楚

**2. 校园活动**
- Orientation Week很重要
- Clubs是交朋友的好方式
- Sports是社交话题

**3. 饮食文化**
- 咖啡社交很流行
- Potluck是常见聚会形式
- 感谢主人要带点东西

### 建议

✅ 主动参与
✅ 广交朋友
✅ 了解当地文化
✅ 保持开放心态`,
    contentZh: `## 美国校园文化指南

### 社交文化

**1. Small Talk**
- 美国人喜欢small talk（闲聊）
- 常用话题：天气、球赛、周末计划
- 这不是虚伪，是社交礼仪

**2. 打招呼方式**
- 正式场合握手
- 朋友之间hug是常见的
- 点头微笑表示友好

**3. 邀请文化**
- 直接说"Let's hang out"
- "Maybe sometime"可能是拒绝
- 不要害怕主动社交

### 学术文化

**1. 课堂参与**
- 教授鼓励提问和讨论
- 积极参与会加分
- Office Hours很重要

**2. 团队合作**
- 小组作业很常见
- 要学会表达自己的观点
- 注意分工和协调

**3. 学术诚信**
- Plagiarism后果严重
- Collaboration要看规则
- 引用格式要准确

### 校园生活

**1. Greek Life（兄弟会/姐妹会）**
- 可选但很普遍
- 不是必须参加的
- 申请有过程，要了解清楚

**2. 校园活动**
- Orientation Week很重要
- Clubs是交朋友的好方式
- Sports是社交话题

**3. 饮食文化**
- 咖啡社交很流行
- Potluck是常见聚会形式
- 感谢主人要带点东西

### 建议

✅ 主动参与
✅ 广交朋友
✅ 了解当地文化
✅ 保持开放心态`,
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
    content: `## 日本社交规则指南

### 基本礼仪

**1. 鞠躬**
- 微微点头是日常问候
- 15-30度是普通礼节
- 正式场合需要更深鞠躬

**2. 交换名片**
- 名片用双手递上
- 接到名片要仔细看
- 不要把名片放入口袋

**3. 鞋子礼仪**
- 进入室内要脱鞋
- 拖鞋通常提供
- 袜子破损要注意

### 餐桌礼仪

✅ **用餐规则**
- 不要用筷子指人
- 不要把筷子插在饭里
- 喝汤可以用碗喝

✅ **外出就餐**
- AA制是常态
- 小费不是必须的
- 预约很重要

❌ **不要做的事**
- 不要边走边吃
- 不要大声说话
- 不要浪费食物

### 公共场合

**1. 交通**
- 电车上不要打电话
- 给老人让座
- 排队等候

**2. 安静规则**
- 公共场合保持安静
- 手机调成静音
- 图书馆非常安静

**3. 垃圾分类**
- 严格分类处理
- 按日期投放
- 不合规则会被退回

### 学术礼仪

**1. 与教授相处**
- 使用敬语
- 预约office hours
- 邮件要正式

**2. 研究室文化**
- 尊重前辈
- 参与实验室活动
- 注意团队协作`,
    contentZh: `## 日本社交规则指南

### 基本礼仪

**1. 鞠躬**
- 微微点头是日常问候
- 15-30度是普通礼节
- 正式场合需要更深鞠躬

**2. 交换名片**
- 名片用双手递上
- 接到名片要仔细看
- 不要把名片放入口袋

**3. 鞋子礼仪**
- 进入室内要脱鞋
- 拖鞋通常提供
- 袜子破损要注意

### 餐桌礼仪

✅ **用餐规则**
- 不要用筷子指人
- 不要把筷子插在饭里
- 喝汤可以用碗喝

✅ **外出就餐**
- AA制是常态
- 小费不是必须的
- 预约很重要

❌ **不要做的事**
- 不要边走边吃
- 不要大声说话
- 不要浪费食物

### 公共场合

**1. 交通**
- 电车上不要打电话
- 给老人让座
- 排队等候

**2. 安静规则**
- 公共场合保持安静
- 手机调成静音
- 图书馆非常安静

**3. 垃圾分类**
- 严格分类处理
- 按日期投放
- 不合规则会被退回

### 学术礼仪

**1. 与教授相处**
- 使用敬语
- 预约office hours
- 邮件要正式

**2. 研究室文化**
- 尊重前辈
- 参与实验室活动
- 注意团队协作`,
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
    content: `## 英国校园安全指南

### 居住安全

**1. 宿舍安全**
- 离开房间锁门
- 不要随意带陌生人进入
- 贵重物品妥善保管

**2. 租房安全**
- 选择安全区域租房
- 检查门窗是否完好
- 了解周边治安情况

**3. 夜间安全**
- 避免独自夜间出行
- 使用校园护送服务
- 保持手机电量充足

### 出行安全

**1. 步行**
- 使用人行道
- 夜间走明亮的地方
- 避免戴耳机走路

**2. 骑行**
- 必须佩戴头盔
- 使用自行车道
- 安装车灯

**3. 驾车**
- 英国靠左行驶
- 持有有效驾照
- 购买保险

### 紧急联系方式

📞 **紧急电话**
- 英国报警：999
- 非紧急报警：101
- 校园报警：校内电话分机

🏥 **医疗急救**
- 注册GP（全科医生）
- 紧急情况去A&E
- 牙医需要提前预约

🆘 **中国留学生紧急联系**
- 中国驻英大使馆：020-72994049
- 领事保护热线：+86-10-12308

### 心理健康

✅ **关注心理健康**
- 大学提供免费心理咨询
- 不要忽视压力信号
- 及时寻求帮助

✅ **建立支持网络**
- 保持与家人联系
- 结交朋友
- 参与社团活动`,
    contentZh: `## 英国校园安全指南

### 居住安全

**1. 宿舍安全**
- 离开房间锁门
- 不要随意带陌生人进入
- 贵重物品妥善保管

**2. 租房安全**
- 选择安全区域租房
- 检查门窗是否完好
- 了解周边治安情况

**3. 夜间安全**
- 避免独自夜间出行
- 使用校园护送服务
- 保持手机电量充足

### 出行安全

**1. 步行**
- 使用人行道
- 夜间走明亮的地方
- 避免戴耳机走路

**2. 骑行**
- 必须佩戴头盔
- 使用自行车道
- 安装车灯

**3. 驾车**
- 英国靠左行驶
- 持有有效驾照
- 购买保险

### 紧急联系方式

📞 **紧急电话**
- 英国报警：999
- 非紧急报警：101
- 校园报警：校内电话分机

🏥 **医疗急救**
- 注册GP（全科医生）
- 紧急情况去A&E
- 牙医需要提前预约

🆘 **中国留学生紧急联系**
- 中国驻英大使馆：020-72994049
- 领事保护热线：+86-10-12308

### 心理健康

✅ **关注心理健康**
- 大学提供免费心理咨询
- 不要忽视压力信号
- 及时寻求帮助

✅ **建立支持网络**
- 保持与家人联系
- 结交朋友
- 参与社团活动`,
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
    content: `## 美国校园安全指南

### 校园安全系统

**1. Blue Light System**
- 校园随处可见蓝色灯柱
- 按下按钮直接联系警察
- 定期测试确保正常

**2. Campus Police**
- 校园警察24小时巡逻
- 提供护送服务
- 处理校园犯罪

**3. Alert Systems**
- 注册校园预警
- 关注邮件和短信通知
- 了解紧急程序

### 生活安全

**1. 居住安全**
- 选择校内宿舍或安全社区
- 了解周边治安
- 安装防盗设备

**2. 夜间安全**
- 使用校园护送服务
- 避免偏僻地区
- 保持警惕

**3. 社交安全**
- 注意饮品安全
- 不要接受陌生人饮料
- 告知朋友你的位置

### 紧急应对

**1. Active Shooter**
- Run（逃跑）
- Hide（躲藏）
- Fight（反击）

**2. 自然灾害**
- 了解预警系统
- 知道安全位置
- 准备应急包

**3. 医疗紧急**
- 拨打911
- 了解最近医院
- 购买健康保险

### 重要电话

- 紧急报警：911
- 校园警察：校内分机
- 中国驻美使领馆：各地区不同`,
    contentZh: `## 美国校园安全指南

### 校园安全系统

**1. Blue Light System**
- 校园随处可见蓝色灯柱
- 按下按钮直接联系警察
- 定期测试确保正常

**2. Campus Police**
- 校园警察24小时巡逻
- 提供护送服务
- 处理校园犯罪

**3. Alert Systems**
- 注册校园预警
- 关注邮件和短信通知
- 了解紧急程序

### 生活安全

**1. 居住安全**
- 选择校内宿舍或安全社区
- 了解周边治安
- 安装防盗设备

**2. 夜间安全**
- 使用校园护送服务
- 避免偏僻地区
- 保持警惕

**3. 社交安全**
- 注意饮品安全
- 不要接受陌生人饮料
- 告知朋友你的位置

### 紧急应对

**1. Active Shooter**
- Run（逃跑）
- Hide（躲藏）
- Fight（反击）

**2. 自然灾害**
- 了解预警系统
- 知道安全位置
- 准备应急包

**3. 医疗紧急**
- 拨打911
- 了解最近医院
- 购买健康保险

### 重要电话

- 紧急报警：911
- 校园警察：校内分机
- 中国驻美使领馆：各地区不同`,
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
    content: `## 美国学术诚信指南

### 什么是学术不诚信

**1. 抄袭（Plagiarism）**
- 使用他人文字不注明来源
- 使用他人观点不引用
- 自我抄袭（重复提交以前的作品）

**2. 作弊（Cheating）**
- 考试作弊
- 作业抄袭
- 代写代考

**3. 伪造（Fabrication）**
- 伪造数据
- 伪造引用
- 伪造文件

### 后果

⚠️ **学术后果**
- 作业得零分
- 课程不及格
- 被开除学籍

⚠️ **其他后果**
- 永久学术记录
- 影响就业
- 签证问题

### 如何避免

✅ **正确引用**
- 了解不同引用格式（APA, MLA, Chicago）
- 使用引用工具
- 提前准备

✅ **合理规划**
- 不要等到最后一分钟
- 及早开始研究
- 寻求写作中心帮助

✅ **正确使用资源**
- 可以使用 tutoring center
- 可以和教授讨论
- 可以使用 writing lab

### 引用格式参考

| 格式 | 使用场景 |
|------|---------|
| APA | 心理学、社会科学 |
| MLA | 人文、文学 |
| Chicago | 历史、艺术 |
| IEEE | 工程、计算机 |

### 如果被指控

1. 保持冷静
2. 了解指控制度
3. 寻求帮助
4. 准备申诉`,
    contentZh: `## 美国学术诚信指南

### 什么是学术不诚信

**1. 抄袭（Plagiarism）**
- 使用他人文字不注明来源
- 使用他人观点不引用
- 自我抄袭（重复提交以前的作品）

**2. 作弊（Cheating）**
- 考试作弊
- 作业抄袭
- 代写代考

**3. 伪造（Fabrication）**
- 伪造数据
- 伪造引用
- 伪造文件

### 后果

⚠️ **学术后果**
- 作业得零分
- 课程不及格
- 被开除学籍

⚠️ **其他后果**
- 永久学术记录
- 影响就业
- 签证问题

### 如何避免

✅ **正确引用**
- 了解不同引用格式（APA, MLA, Chicago）
- 使用引用工具
- 提前准备

✅ **合理规划**
- 不要等到最后一分钟
- 及早开始研究
- 寻求写作中心帮助

✅ **正确使用资源**
- 可以使用 tutoring center
- 可以和教授讨论
- 可以使用 writing lab

### 引用格式参考

| 格式 | 使用场景 |
|------|---------|
| APA | 心理学、社会科学 |
| MLA | 人文、文学 |
| Chicago | 历史、艺术 |
| IEEE | 工程、计算机 |

### 如果被指控

1. 保持冷静
2. 了解指控制度
3. 寻求帮助
4. 准备申诉`,
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
    content: `## 学生签证规定指南

### 通用规定

**1. 有效期限**
- 护照有效期要覆盖学习期间
- I-20/F-1签证有截止日期
- 及时续签

**2. 学习进度**
- 全日制学生要求
- 允许的休学时间
- 转学程序

**3. 工作限制**
- 校内工作有限制
- 校外工作需要CPT/OPT
- 违法工作后果严重

### 主要国家规定

**美国 F-1 签证**
- 允许校内每周20小时
- CPT用于实习
- OPT用于毕业后

**英国 Student Visa**
- 每周可工作20小时
- 短期学生签不能工作
- 毕业生签证(Graduate Route)

**澳大利亚 Student Visa**
- 每两周40小时
- 假期无限制
- 毕业后工作签(PSW)

### 违法后果

⚠️ **失去学生身份**
- 被学校开除
- 失去签证
- 可能被驱逐出境

⚠️ **影响未来签证**
- 拒签风险增加
- 影响再次入境
- 影响其他国家签证

### 建议

✅ **保持合法身份**
- 遵守签证规定
- 保持全日制学习
- 及时更新地址

✅ **了解权利义务**
- 知道可以做什么
- 知道不可以做什么
- 寻求法律帮助`,
    contentZh: `## 学生签证规定指南

### 通用规定

**1. 有效期限**
- 护照有效期要覆盖学习期间
- I-20/F-1签证有截止日期
- 及时续签

**2. 学习进度**
- 全日制学生要求
- 允许的休学时间
- 转学程序

**3. 工作限制**
- 校内工作有限制
- 校外工作需要CPT/OPT
- 违法工作后果严重

### 主要国家规定

**美国 F-1 签证**
- 允许校内每周20小时
- CPT用于实习
- OPT用于毕业后

**英国 Student Visa**
- 每周可工作20小时
- 短期学生签不能工作
- 毕业生签证(Graduate Route)

**澳大利亚 Student Visa**
- 每两周40小时
- 假期无限制
- 毕业后工作签(PSW)

### 违法后果

⚠️ **失去学生身份**
- 被学校开除
- 失去签证
- 可能被驱逐出境

⚠️ **影响未来签证**
- 拒签风险增加
- 影响再次入境
- 影响其他国家签证

### 建议

✅ **保持合法身份**
- 遵守签证规定
- 保持全日制学习
- 及时更新地址

✅ **了解权利义务**
- 知道可以做什么
- 知道不可以做什么
- 寻求法律帮助`,
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
    content: `## 留学生生存技巧大全

### 出发前准备

**1. 文档准备**
- 护照、签证、I-20
- 学历证书原件和公证
- 成绩单和语言成绩

**2. 财务准备**
- 开通国际支付
- 携带适量现金
- 了解汇率

**3. 物品准备**
- 转换插头
- 常用药品
- 重要文件复印件

### 到达后必做

**1. 重要注册**
- 学校注册
- 银行开户
- 手机卡办理
- 租房签约

**2. 紧急联系**
- 当地中国使领馆
- 学校国际学生办公室
- 宿舍管理

**3. 生活设施**
- 交通卡
- 超市会员卡
- 图书馆借书证

### 学习技巧

✅ **时间管理**
- 使用日历规划
- 提前完成任务
- 预留复习时间

✅ **资源利用**
- Office Hours
- Writing Center
- Tutoring Center

✅ **小组作业**
- 尽早组队
- 明确分工
- 定期会议

### 生活技巧

**1. 饮食**
- 学习简单烹饪
- 合理安排预算
- 注意饮食均衡

**2. 社交**
- 参与社团活动
- 结交各国朋友
- 保持与家人联系

**3. 健康**
- 注册GP/医生
- 购买保险
- 保持运动

### 心理调适

✅ **适应过程**
- 给自己时间
- 不要比较
- 寻求帮助

✅ **建立支持**
- 中国留学生社群
- 室友和朋友
- 家人和老师

### 安全提醒

- 了解当地法律
- 注意人身安全
- 保护个人财物
- 警惕诈骗`,
    contentZh: `## 留学生生存技巧大全

### 出发前准备

**1. 文档准备**
- 护照、签证、I-20
- 学历证书原件和公证
- 成绩单和语言成绩

**2. 财务准备**
- 开通国际支付
- 携带适量现金
- 了解汇率

**3. 物品准备**
- 转换插头
- 常用药品
- 重要文件复印件

### 到达后必做

**1. 重要注册**
- 学校注册
- 银行开户
- 手机卡办理
- 租房签约

**2. 紧急联系**
- 当地中国使领馆
- 学校国际学生办公室
- 宿舍管理

**3. 生活设施**
- 交通卡
- 超市会员卡
- 图书馆借书证

### 学习技巧

✅ **时间管理**
- 使用日历规划
- 提前完成任务
- 预留复习时间

✅ **资源利用**
- Office Hours
- Writing Center
- Tutoring Center

✅ **小组作业**
- 尽早组队
- 明确分工
- 定期会议

### 生活技巧

**1. 饮食**
- 学习简单烹饪
- 合理安排预算
- 注意饮食均衡

**2. 社交**
- 参与社团活动
- 结交各国朋友
- 保持与家人联系

**3. 健康**
- 注册GP/医生
- 购买保险
- 保持运动

### 心理调适

✅ **适应过程**
- 给自己时间
- 不要比较
- 寻求帮助

✅ **建立支持**
- 中国留学生社群
- 室友和朋友
- 家人和老师

### 安全提醒

- 了解当地法律
- 注意人身安全
- 保护个人财物
- 警惕诈骗`,
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
    content: `## 留学生心理健康指南

### 常见心理挑战

**1. 文化冲击（Cultural Shock）**
- 思念家乡
- 语言障碍
- 社交困难

**2. 学术压力**
- 语言适应
- 学习方式差异
- 竞争压力

**3. 孤独感**
- 远离家人朋友
- 缺乏支持系统
- 社交隔离

### 压力信号

⚠️ **身体信号**
- 失眠或嗜睡
- 食欲改变
- 头痛胃痛

⚠️ **情绪信号**
- 持续低落
- 焦虑不安
- 易怒暴躁

⚠️ **行为信号**
- 社交退缩
- 成绩下降
- 逃避责任

### 应对策略

✅ **自我照顾**
- 保持规律作息
- 适度运动
- 健康饮食

✅ **社交支持**
- 加入学生社团
- 结交新朋友
- 保持与家人联系

✅ **时间管理**
- 制定计划
- 合理安排
- 留出休息时间

### 寻求帮助

🏥 **学校资源**
- 心理咨询中心（免费）
- Health Center
- 国际学生办公室

🏥 **社区资源**
- 中国留学生协会
- 华人社区
- 信仰团体

🏥 **专业帮助**
- 心理咨询师
- 精神科医生
- 危机干预热线

### 紧急情况

🆘 **危机信号**
- 有自伤想法
- 有伤害他人的想法
- 严重抑郁无法正常生活

🆘 **紧急联系**
- 校园危机热线
- 当地急救
- 中国领事保护热线：12308`,
    contentZh: `## 留学生心理健康指南

### 常见心理挑战

**1. 文化冲击（Cultural Shock）**
- 思念家乡
- 语言障碍
- 社交困难

**2. 学术压力**
- 语言适应
- 学习方式差异
- 竞争压力

**3. 孤独感**
- 远离家人朋友
- 缺乏支持系统
- 社交隔离

### 压力信号

⚠️ **身体信号**
- 失眠或嗜睡
- 食欲改变
- 头痛胃痛

⚠️ **情绪信号**
- 持续低落
- 焦虑不安
- 易怒暴躁

⚠️ **行为信号**
- 社交退缩
- 成绩下降
- 逃避责任

### 应对策略

✅ **自我照顾**
- 保持规律作息
- 适度运动
- 健康饮食

✅ **社交支持**
- 加入学生社团
- 结交新朋友
- 保持与家人联系

✅ **时间管理**
- 制定计划
- 合理安排
- 留出休息时间

### 寻求帮助

🏥 **学校资源**
- 心理咨询中心（免费）
- Health Center
- 国际学生办公室

🏥 **社区资源**
- 中国留学生协会
- 华人社区
- 信仰团体

🏥 **专业帮助**
- 心理咨询师
- 精神科医生
- 危机干预热线

### 紧急情况

🆘 **危机信号**
- 有自伤想法
- 有伤害他人的想法
- 严重抑郁无法正常生活

🆘 **紧急联系**
- 校园危机热线
- 当地急救
- 中国领事保护热线：12308`,
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
    content: `## 野鸡大学/文凭工厂骗局防范指南

### 什么是野鸡大学

**特征**：
- 没有正规认证
- 声称付钱就能拿学位
- 没有实际课程
- 名声很差或无名声

### 如何识别野鸡大学

✅ **核查认证**
- 教育部涉外监管网
- 各国教育部官网
- 权威排名

✅ **警惕信号**
- "免试入学"
- "一年制硕士"
- "包毕业包拿证"
- 价格异常低廉

✅ **正规标志**
- 有实体校园
- 有真实师资
- 有入学考试
- 有学术要求

### 常见骗局形式

**1. 虚假宣传**
- 冒充名校合作项目
- 伪造排名数据
- 谎称得到认证

**2. 文凭工厂**
- 卖文凭的"大学"
- 无需上课只要交钱
- 证书不被承认

**3. 认证造假**
- 伪造学历认证
- 声称"特殊渠道"
- 骗取高额费用

### 如何避免

✅ **做好调查**
- 查阅官方认证名单
- 了解学校历史
- 查看真实评价

✅ **选择正规渠道**
- 通过官方申请
- 使用正规中介
- 避免"捷径思维"

### 后果

⚠️ **时间损失**
- 几年时间白费
- 错过正常学业

⚠️ **金钱损失**
- 高额学费打水漂
- 认证费用也浪费

⚠️ **职业影响**
- 文凭不被承认
- 影响未来就业`,
    contentZh: `## 野鸡大学/文凭工厂骗局防范指南

### 什么是野鸡大学

**特征**：
- 没有正规认证
- 声称付钱就能拿学位
- 没有实际课程
- 名声很差或无名声

### 如何识别野鸡大学

✅ **核查认证**
- 教育部涉外监管网
- 各国教育部官网
- 权威排名

✅ **警惕信号**
- "免试入学"
- "一年制硕士"
- "包毕业包拿证"
- 价格异常低廉

✅ **正规标志**
- 有实体校园
- 有真实师资
- 有入学考试
- 有学术要求

### 常见骗局形式

**1. 虚假宣传**
- 冒充名校合作项目
- 伪造排名数据
- 谎称得到认证

**2. 文凭工厂**
- 卖文凭的"大学"
- 无需上课只要交钱
- 证书不被承认

**3. 认证造假**
- 伪造学历认证
- 声称"特殊渠道"
- 骗取高额费用

### 如何避免

✅ **做好调查**
- 查阅官方认证名单
- 了解学校历史
- 查看真实评价

✅ **选择正规渠道**
- 通过官方申请
- 使用正规中介
- 避免"捷径思维"

### 后果

⚠️ **时间损失**
- 几年时间白费
- 错过正常学业

⚠️ **金钱损失**
- 高额学费打水漂
- 认证费用也浪费

⚠️ **职业影响**
- 文凭不被承认
- 影响未来就业`,
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
    content: `## 奖学金申请骗局防范指南

### 常见骗局形式

**1. 虚假奖学金**
- "恭喜你获得奖学金"
- 要求先付手续费
- 骗取个人信息

**2. 收费代申请**
- 声称"内部渠道"
- 保证申请成功
- 收取高额费用

**3. 钓鱼邮件**
- 冒充知名奖学金
- 要求点击链接
- 窃取账户信息

### 真实奖学金特征

✅ **不收费**
- 真正奖学金不会收费
- 申请过程完全免费

✅ **官方渠道**
- 通过学校官网申请
- 教育部官方公布
- 大使馆奖学金项目

### 如何防范

✅ **核实来源**
- 检查官方网站
- 确认申请截止日期
- 验证奖学金真实性

✅ **保护隐私**
- 不要随意提供银行信息
- 不要随意点击邮件链接
- 使用官方申请系统

✅ **咨询官方**
- 学校国际学生办公室
- 大使馆教育组
- 教育部涉外监管网`,
    contentZh: `## 奖学金申请骗局防范指南

### 常见骗局形式

**1. 虚假奖学金**
- "恭喜你获得奖学金"
- 要求先付手续费
- 骗取个人信息

**2. 收费代申请**
- 声称"内部渠道"
- 保证申请成功
- 收取高额费用

**3. 钓鱼邮件**
- 冒充知名奖学金
- 要求点击链接
- 窃取账户信息

### 真实奖学金特征

✅ **不收费**
- 真正奖学金不会收费
- 申请过程完全免费

✅ **官方渠道**
- 通过学校官网申请
- 教育部官方公布
- 大使馆奖学金项目

### 如何防范

✅ **核实来源**
- 检查官方网站
- 确认申请截止日期
- 验证奖学金真实性

✅ **保护隐私**
- 不要随意提供银行信息
- 不要随意点击邮件链接
- 使用官方申请系统

✅ **咨询官方**
- 学校国际学生办公室
- 大使馆教育组
- 教育部涉外监管网`,
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
    content: `## 德国留学文化指南

### 学习文化

**1. 学术体系**
- 学分制（ECTS）
- 自律为主
- 教授不督促

**2. 课堂参与**
- 自由提问
- 鼓励独立思考
- 学术讨论开放

**3. 考试制度**
- 口试和笔试
- 可以多次补考
- 注重理解应用

### 生活文化

**1. 准时**
- 德国人非常准时
- 迟到被认为不礼貌
- 建议提前到达

**2. 预约文化**
- 看医生要预约
- 办事要预约
- 约会也要预约

**3. 垃圾分类**
- 严格分类
- 纸质、塑料、玻璃、有机
- 按日期投放

### 社交文化

**1. 正式称呼**
- 用"Sie"表示正式
- 教授要用头衔
- 熟悉后才用"du"

**2. 社交距离**
- 保持适当距离
- 不过分热情
- 尊重私人空间

### 省钱技巧

✅ **学生优惠**
- 学生交通票
- 食堂优惠
- 博物馆免费

✅ **低价购物**
- 周日不营业
- Aldi、Lidl便宜
- 跳蚤市场淘宝`,
    contentZh: `## 德国留学文化指南

### 学习文化

**1. 学术体系**
- 学分制（ECTS）
- 自律为主
- 教授不督促

**2. 课堂参与**
- 自由提问
- 鼓励独立思考
- 学术讨论开放

**3. 考试制度**
- 口试和笔试
- 可以多次补考
- 注重理解应用

### 生活文化

**1. 准时**
- 德国人非常准时
- 迟到被认为不礼貌
- 建议提前到达

**2. 预约文化**
- 看医生要预约
- 办事要预约
- 约会也要预约

**3. 垃圾分类**
- 严格分类
- 纸质、塑料、玻璃、有机
- 按日期投放

### 社交文化

**1. 正式称呼**
- 用"Sie"表示正式
- 教授要用头衔
- 熟悉后才用"du"

**2. 社交距离**
- 保持适当距离
- 不过分热情
- 尊重私人空间

### 省钱技巧

✅ **学生优惠**
- 学生交通票
- 食堂优惠
- 博物馆免费

✅ **低价购物**
- 周日不营业
- Aldi、Lidl便宜
- 跳蚤市场淘宝`,
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
    content: `## 澳洲留学文化指南

### 校园文化

**1. 课堂氛围**
- 轻松自由
- 鼓励发言
- 师生关系平等

**2. 学术要求**
- 自律学习
- 注重实践
- 团队合作

**3. 评估方式**
- 作业占比大
- 报告演讲多
- 考试不一定有

### 生活文化

**1. 澳式英语**
- 很多缩写
- 语速较快
- 了解当地表达

**2. 时间观念**
- 不像德国那么准时
- 但也不要迟到太久
- 社交可以稍微迟到

**3. 阳光生活**
- 户外活动多
- 重视运动
- 生活悠闲

### 社交文化

**1. 平等友好**
- 不摆架子
- 直接沟通
- 不过分客气

**2. 邀请文化**
- BBQ很常见
- 带酒或食物参加
- 轻松自在

**3. 酒吧文化**
- 周末喝一杯
- AA制
- 聊天为主

### 安全提醒

⚠️ **自然环境**
- 防晒很重要
- 注意野生动物
- 了解当地安全区域

⚠️ **生活安全**
- 晚上小心
- 保护财物
- 了解紧急电话`,
    contentZh: `## 澳洲留学文化指南

### 校园文化

**1. 课堂氛围**
- 轻松自由
- 鼓励发言
- 师生关系平等

**2. 学术要求**
- 自律学习
- 注重实践
- 团队合作

**3. 评估方式**
- 作业占比大
- 报告演讲多
- 考试不一定有

### 生活文化

**1. 澳式英语**
- 很多缩写
- 语速较快
- 了解当地表达

**2. 时间观念**
- 不像德国那么准时
- 但也不要迟到太久
- 社交可以稍微迟到

**3. 阳光生活**
- 户外活动多
- 重视运动
- 生活悠闲

### 社交文化

**1. 平等友好**
- 不摆架子
- 直接沟通
- 不过分客气

**2. 邀请文化**
- BBQ很常见
- 带酒或食物参加
- 轻松自在

**3. 酒吧文化**
- 周末喝一杯
- AA制
- 聊天为主

### 安全提醒

⚠️ **自然环境**
- 防晒很重要
- 注意野生动物
- 了解当地安全区域

⚠️ **生活安全**
- 晚上小心
- 保护财物
- 了解紧急电话`,
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
    content: `## 欧洲火车旅行安全指南

### 购票安全

✅ **官方渠道购票**
- DB（德国）
- SNCF（法国）
- 各国铁路官网
- Rail Europe官网

✅ **警惕假票**
- 不要在非官方渠道买票
- 价格异常低要警惕
- 使用电子票更安全

### 财物安全

⚠️ **防盗提示**
- 看好随身物品
- 不要放在行李架上
- 贵重物品放身前

⚠️ **警惕小偷**
- 人多拥挤时注意
- 常见于长途夜车
- 护照要贴身放

### 夜间旅行

🌙 **安全建议**
- 选择女生车厢（如有）
- 与朋友同行
- 保持手机电量

🌙 **必备物品**
- 颈枕眼罩
- 耳塞
- 锁（用于行李）

### 特殊情况

🚨 **遇到问题**
- 联系列车员
- 记住紧急联络方式
- 保管好行李收据

🚨 **延误处理**
- 保留延误证明
- 了解赔偿政策
- 延误可要求退款`,
    contentZh: `## 欧洲火车旅行安全指南

### 购票安全

✅ **官方渠道购票**
- DB（德国）
- SNCF（法国）
- 各国铁路官网
- Rail Europe官网

✅ **警惕假票**
- 不要在非官方渠道买票
- 价格异常低要警惕
- 使用电子票更安全

### 财物安全

⚠️ **防盗提示**
- 看好随身物品
- 不要放在行李架上
- 贵重物品放身前

⚠️ **警惕小偷**
- 人多拥挤时注意
- 常见于长途夜车
- 护照要贴身放

### 夜间旅行

🌙 **安全建议**
- 选择女生车厢（如有）
- 与朋友同行
- 保持手机电量

🌙 **必备物品**
- 颈枕眼罩
- 耳塞
- 锁（用于行李）

### 特殊情况

🚨 **遇到问题**
- 联系列车员
- 记住紧急联络方式
- 保管好行李收据

🚨 **延误处理**
- 保留延误证明
- 了解赔偿政策
- 延误可要求退款`,
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
    content: `## 留学生税务指南

### 基本税务知识

**1. 是否需要报税**
- 取决于收入
- 有收入需要报税
- 无收入可能不需要

**2. 报税时间**
- 通常是每年4月
- 各国时间不同
- 不要错过截止日期

### 主要国家规定

**美国**
- F-1学生前5年免税
- 收入需要申报
- 可以申请ITIN

**英国**
- Student Route无收入不需报税
- 有收入需要报税
- 了解Personal Allowance

**德国**
- 每年报税一次
- 有免税额度
- 低收入不需交税

### 常见问题

❓ **兼职收入要交税吗？**
- 取决于国家
- 通常有免税额度
- 超过额度需要申报

❓ **奖学金要交税吗？**
- 因国家而异
- 有的免税
- 有的需要申报

### 合规建议

✅ **保存记录**
- 记录所有收入
- 保存纳税文件
- 了解截止日期

✅ **寻求帮助**
- 学校国际学生办公室
- 税务咨询服务
- 专业税务顾问`,
    contentZh: `## 留学生税务指南

### 基本税务知识

**1. 是否需要报税**
- 取决于收入
- 有收入需要报税
- 无收入可能不需要

**2. 报税时间**
- 通常是每年4月
- 各国时间不同
- 不要错过截止日期

### 主要国家规定

**美国**
- F-1学生前5年免税
- 收入需要申报
- 可以申请ITIN

**英国**
- Student Route无收入不需报税
- 有收入需要报税
- 了解Personal Allowance

**德国**
- 每年报税一次
- 有免税额度
- 低收入不需交税

### 常见问题

❓ **兼职收入要交税吗？**
- 取决于国家
- 通常有免税额度
- 超过额度需要申报

❓ **奖学金要交税吗？**
- 因国家而异
- 有的免税
- 有的需要申报

### 合规建议

✅ **保存记录**
- 记录所有收入
- 保存纳税文件
- 了解截止日期

✅ **寻求帮助**
- 学校国际学生办公室
- 税务咨询服务
- 专业税务顾问`,
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
    content: `## 留学生兼职工作指南

### 工作类型

**1. 校内工作**
- 图书馆助理
- 食堂员工
- 宿舍管理员
- 研究助理

**2. 校外工作**
- 餐厅服务员
- 零售店员
- 家教
- 翻译

### 打工规定

**美国 F-1**
- 学期中每周20小时
- 假期可以全职
- 只能在校内（除非CPT/OPT）

**英国 Student Visa**
- 每周最多20小时
- 不能从事长期工作
- 毕业生签证可全职

**澳大利亚**
- 每两周40小时
- 假期无限制
- 毕业后可申请PSW

### 找工渠道

✅ **学校资源**
- Career Center
- 校园招聘
- 教授推荐

✅ **网络平台**
- Indeed
- LinkedIn
- 当地招聘网站

### 注意事项

⚠️ **签证规定**
- 不要超时打工
- 保持全日制学生身份
- 了解违法后果

⚠️ **工作许可**
- 有些工作需要许可
- 某些行业限制
- 确认后再开始工作`,
    contentZh: `## 留学生兼职工作指南

### 工作类型

**1. 校内工作**
- 图书馆助理
- 食堂员工
- 宿舍管理员
- 研究助理

**2. 校外工作**
- 餐厅服务员
- 零售店员
- 家教
- 翻译

### 打工规定

**美国 F-1**
- 学期中每周20小时
- 假期可以全职
- 只能在校内（除非CPT/OPT）

**英国 Student Visa**
- 每周最多20小时
- 不能从事长期工作
- 毕业生签证可全职

**澳大利亚**
- 每两周40小时
- 假期无限制
- 毕业后可申请PSW

### 找工渠道

✅ **学校资源**
- Career Center
- 校园招聘
- 教授推荐

✅ **网络平台**
- Indeed
- LinkedIn
- 当地招聘网站

### 注意事项

⚠️ **签证规定**
- 不要超时打工
- 保持全日制学生身份
- 了解违法后果

⚠️ **工作许可**
- 有些工作需要许可
- 某些行业限制
- 确认后再开始工作`,
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
