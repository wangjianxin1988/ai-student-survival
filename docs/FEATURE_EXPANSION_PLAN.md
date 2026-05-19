# AI留学生存指南 - 功能拓展规划

> 版本: v1.0 | 日期: 2026-05-17 | 状态: 调研中

---

## 一、新功能模块设计

### 1.1 校园地图模块 (Campus Map)

**定位**: 每个大学的留学生生存地图

**核心功能**:
1. **Google Maps 集成**
   - 标记校园内关键位置（图书馆、食堂、教学楼、宿舍）
   - 标记周边生活设施（超市、药店、银行、餐厅）
   - 标记安全/危险区域提醒
   - 自定义标记图标（分类显示）

2. **用户UGC标记**
   - 用户可添加新地点标记
   - 上传照片和描述
   - 评分和评论功能
   - 举报虚假/错误信息

3. **分类标记**
   - 🏫 学习区：图书馆、自习室、实验室
   - 🍜 餐饮区：食堂、餐厅、咖啡厅
   - 🏥 生活区：医务室、邮局、超市
   - 🏦 金融区：银行ATM、货币兑换
   - ⚠️ 安全提醒：安全区域、危险区域
   - 💡 生活技巧：亚洲超市、中餐馆

**技术实现**:
- Google Maps API / Leaflet (开源替代)
- PostgreSQL + PostGIS (地理空间数据)
- 用户标记需审核机制

---

### 1.2 防坑防骗指南模块 (Survival Guide)

**定位**: 留学生必看的避坑指南

**核心功能**:
1. **防骗指南**
   - 租房骗局识别（押金、假房源）
   - 兼职骗局（刷单、押金）
   - 换汇骗局
   - 冒充客服骗局
   - 奖学金骗局

2. **文化禁忌**
   - 各国家/学校的文化禁忌
   - 学术诚信规则（作弊后果）
   - 当地法律法规
   - 社交礼仪

3. **安全提醒**
   - 周边治安区域
   - 紧急联系方式
   - 防盗防抢提示
   - 自然灾害应对

4. **UGC社区**
   - 用户发布防坑经验
   - 评论和点赞
   - 精华内容置顶
   - AI总结防坑要点

**技术实现**:
- Markdown编辑器 (TinaCMS)
- 用户评分和举报系统
- AI自动总结精华帖

---

### 1.3 问答社区模块 (Q&A Community)

**定位**: 留学生版的"知乎"

**核心功能**:
1. **问题发布**
   - 按学校/专业/国家分区
   - 问题分类（学业、生活、签证、工作）
   - 匿名提问功能
   - AI自动标签

2. **回答系统**
   - AI先行回答
   - 用户补充真实经验
   - 答案评分和排序
   - 追问和追问-回答

3. **精华内容**
   - AI整理高频问题
   - 自动生成FAQ
   - 按学校聚合精华

---

## 二、竞品杀手功能整合

### 2.1 RateMyProfessors → 课程评价系统
- 教授评分（难度、教学质量、给分情况）
- 中国学生专属评价（英语课适应、文化冲击）
- AI选课推荐

### 2.2 Reddit → 问答社区
- 分区讨论
- 经验分享帖
- AMA活动

### 2.3 小红书 → 本地生活指南
- 图文笔记
- 地点标记
- 探店功能

### 2.4 Yelp → 周边设施点评
- 评分评论
- 营业时间
- 价格水平

---

## 三、功能优先级建议

### Phase 2 (2-3月)
| 优先级 | 功能 | 开发成本 | 理由 |
|:------:|------|:--------:|------|
| P1 | **校园地图** | 高 | 差异化功能，UGC留存 |
| P1 | **防坑防骗指南** | 中 | 解决核心痛点 |
| P2 | **问答社区** | 高 | 长期留存 |
| P2 | **课程评价** | 高 | 高价值但开发量大 |

### Phase 3 (3-6月)
| 优先级 | 功能 | 开发成本 | 理由 |
|:------:|------|:--------:|------|
| P3 | **AI选课推荐** | 高 | 智能化体验 |
| P3 | **合租匹配** | 中 | 社交+实用 |
| P4 | **实时问答直播** | 高 | 增强粘性 |

---

## 四、数据模型扩展

### 4.1 地图标记 (MapMarker)
```typescript
interface MapMarker {
  id: string;
  universityId: string;
  name: string;
  nameEn: string;
  category: 'library' | 'canteen' | 'dorm' | 'supermarket' | 'bank' | 'restaurant' | 'danger' | 'other';
  description: string;
  descriptionZh: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  images: string[];
  rating: number;
  ratingCount: number;
  contributorId: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 4.2 防坑指南 (SurvivalGuide)
```typescript
interface SurvivalGuide {
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
  authorId: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 4.3 问答 (Question)
```typescript
interface Question {
  id: string;
  title: string;
  titleZh: string;
  content: string;
  contentZh: string;
  category: 'academic' | 'life' | 'visa' | 'job' | 'other';
  universityId?: string;
  authorId: string;
  isAnonymous: boolean;
  viewCount: number;
  answerCount: number;
  isResolved: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
```

---

## 五、技术架构调整

### 5.1 新增依赖
- `@googlemaps/js-api-loader` - Google Maps
- `leaflet` + `react-leaflet` - 开源地图替代
- `@tiptap/react` - 富文本编辑器
- `supabase` - 实时数据库

### 5.2 数据库扩展
```sql
-- 地图标记表
CREATE TABLE map_markers (
  id UUID PRIMARY KEY,
  university_id UUID REFERENCES universities(id),
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  category VARCHAR(50) NOT NULL,
  description TEXT,
  description_zh TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  images TEXT[],
  rating DECIMAL(2, 1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  contributor_id UUID REFERENCES users(id),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 防坑指南表
CREATE TABLE survival_guides (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  title_zh VARCHAR(255),
  category VARCHAR(50) NOT NULL,
  country VARCHAR(100),
  university_id UUID REFERENCES universities(id),
  content TEXT NOT NULL,
  content_zh TEXT,
  tags TEXT[],
  rating DECIMAL(2, 1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  author_id UUID REFERENCES users(id),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 问答表
CREATE TABLE questions (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  title_zh VARCHAR(255),
  content TEXT NOT NULL,
  content_zh TEXT,
  category VARCHAR(50) NOT NULL,
  university_id UUID REFERENCES universities(id),
  author_id UUID REFERENCES users(id),
  is_anonymous BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  answer_count INTEGER DEFAULT 0,
  is_resolved BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 回答表
CREATE TABLE answers (
  id UUID PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_zh TEXT,
  author_id UUID REFERENCES users(id),
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_ai_answer BOOLEAN DEFAULT FALSE,
  rating INTEGER DEFAULT 0,
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 六、页面结构

### 6.1 新增页面
```
/survival/                    # 防坑防骗首页
/survival/[category]/         # 分类页
/survival/[id]/               # 详情页
/survival/submit/             # 发布页

/map/                          # 地图首页
/map/[university]/            # 大学地图页
/map/[university]/add/         # 添加标记页

/questions/                   # 问答首页
/questions/[id]/              # 问题详情
/questions/ask/               # 提问页

/campus/[university]/         # 校园综合页(含地图+指南+问答)
```

---

## 七、UI组件设计

### 7.1 地图标记卡片
```
┌─────────────────────────────────┐
│ 🏫 中央图书馆                    │
│ ⭐ 4.8 (256条评价)              │
│ 📍 校园中心区域                  │
│                                 │
│ 学习区 · 24小时开放 · 有WiFi     │
│                                 │
│ [查看详情] [添加评价]            │
└─────────────────────────────────┘
```

### 7.2 防坑指南卡片
```
┌─────────────────────────────────┐
│ ⚠️ 警惕虚假房源骗局              │
│ 📍 英国 · 伦敦大学               │
│                                 │
│ 近期多名留学生遭遇押金被骗...     │
│                                 │
│ 🏷️ 租房防骗 · 🔥精华            │
│                                 │
│ [阅读全文] (1.2k浏览)            │
└─────────────────────────────────┘
```

### 7.3 问答卡片
```
┌─────────────────────────────────┐
│ ❓ 如何避免论文抄袭嫌疑？          │
│ 📍 计算机科学 · MIT              │
│                                 │
│ 我是新生，不清楚美国学术诚信...   │
│                                 │
│ 💬 12个回答 · ✅已解决          │
│                                 │
│ [查看全部] [我来回答]            │
└─────────────────────────────────┘
```

---

## 八、后续行动计划

1. **立即启动 (P0)**
   - [ ] 确定校园地图技术方案 (Google Maps vs Leaflet)
   - [ ] 设计地图标记数据模型
   - [ ] 实现基础地图展示功能

2. **短期开发 (P1)**
   - [ ] 用户UGC标记系统
   - [ ] 防坑指南内容填充
   - [ ] 问答社区基础功能

3. **中期扩展 (P2)**
   - [ ] 课程评价系统
   - [ ] AI智能回答
   - [ ] 个性化推荐

---

*文档状态: 规划中，待用户确认后启动开发*
