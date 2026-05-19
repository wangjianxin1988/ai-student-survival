// Question and Answer data model for the Q&A community module

export interface Question {
  id: string;
  title: string;
  titleZh: string;
  content: string;
  contentZh: string;
  category: 'academic' | 'life' | 'visa' | 'job' | 'other' | 'policy' | 'payment' | 'ai_tools' | 'study_life' | 'job_recruitment';
  universityId?: string;
  universityName?: string;
  authorName: string;
  authorAvatar: string;
  isAnonymous: boolean;
  viewCount: number;
  answerCount: number;
  isResolved: boolean;
  tags: string[];
  createdAt: string;
}

export interface Answer {
  id: string;
  questionId: string;
  content: string;
  contentZh: string;
  authorName: string;
  authorAvatar: string;
  isAnonymous: boolean;
  isAiAnswer: boolean;
  rating: number;
  isAccepted: boolean;
  createdAt: string;
}

// Category configuration
export const QUESTION_CATEGORIES = {
  academic: { icon: '📚', label: '学业问题', labelEn: 'Academic', description: '选课、论文、考试' },
  life: { icon: '🏠', label: '日常生活', labelEn: 'Life', description: '租房、交通、购物' },
  visa: { icon: '📋', label: '签证身份', labelEn: 'Visa', description: '签证、居留、工作许可' },
  job: { icon: '💼', label: '求职就业', labelEn: 'Job', description: '实习、找工作、职业发展' },
  policy: { icon: '📜', label: '政策问题', labelEn: 'Policy', description: '留学政策、奖学金、申请攻略' },
  payment: { icon: '💳', label: '支付问题', labelEn: 'Payment', description: '学费支付、汇款、奖学金发放' },
  ai_tools: { icon: '🤖', label: 'AI工具', labelEn: 'AI Tools', description: 'AI写作、编程辅助、学习工具' },
  study_life: { icon: '🎓', label: '学习生活', labelEn: 'Study Life', description: '校园生活、社交活动、时间管理' },
  job_recruitment: { icon: '🎯', label: '求职招聘', labelEn: 'Job Recruitment', description: '校招、社招、面试技巧' },
  other: { icon: '💬', label: '其他', labelEn: 'Other', description: '其他问题' },
} as const;

export type QuestionCategory = keyof typeof QUESTION_CATEGORIES;

// Sample questions data with 15+ questions covering all categories
export const questionsData: Question[] = [
  {
    id: 'q-001',
    title: 'How to avoid plagiarism suspicion in thesis writing?',
    titleZh: '如何避免论文抄袭嫌疑？',
    content: `I'm writing my Master's thesis and worried about plagiarism. Even when I cite properly, I'm concerned my work might be flagged. What are the best practices to avoid plagiarism suspicion while still using existing research effectively?`,
    contentZh: `我正在写硕士论文，担心抄袭问题。即使我正确引用了文献，我仍然担心我的工作可能被标记。我该如何在有效利用现有研究的同时避免抄袭嫌疑？`,
    category: 'academic',
    authorName: '陈明',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChenMing',
    isAnonymous: false,
    viewCount: 1256,
    answerCount: 4,
    isResolved: true,
    tags: ['thesis', 'plagiarism', 'academic-writing'],
    createdAt: '2026-05-15T10:30:00Z',
  },
  {
    id: 'q-002',
    title: 'How to open a bank account in the UK as an international student?',
    titleZh: '英国留学怎么办理银行卡？',
    content: `I'll be starting my studies in the UK next month. Can someone explain the process of opening a bank account as an international student? What documents do I need? Which banks are recommended for students?`,
    contentZh: `我下个月就要去英国留学了。有人能解释一下作为国际学生如何开立银行账户吗？我需要准备什么文件？有哪些银行推荐？`,
    category: 'life',
    authorName: '王小梅',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WangXiaomei',
    isAnonymous: false,
    viewCount: 892,
    answerCount: 3,
    isResolved: false,
    tags: ['banking', 'UK', 'international-student'],
    createdAt: '2026-05-14T14:20:00Z',
  },
  {
    id: 'q-003',
    title: 'Can F-1 visa holders work off-campus in the USA?',
    titleZh: '美国F1签证可以工作吗？',
    content: `I'm on an F-1 visa in the US and wondering about work opportunities. Can I work off-campus? What are the legal requirements and restrictions?`,
    contentZh: `我持有美国F-1签证，想了解工作机会。我可以在校园外工作吗？有什么法律要求和限制？`,
    category: 'visa',
    authorName: '李华',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiHua',
    isAnonymous: false,
    viewCount: 2103,
    answerCount: 5,
    isResolved: true,
    tags: ['F1-visa', 'work-authorization', 'USA'],
    createdAt: '2026-05-13T09:15:00Z',
  },
  {
    id: 'q-004',
    title: 'How to find on-campus part-time jobs?',
    titleZh: '怎么找到校内兼职？',
    content: `I want to find a part-time job on campus to earn some extra money and improve my English. Where should I look and what types of jobs are usually available?`,
    contentZh: `我想找一份校内兼职工作，赚点外快并提高英语。我应该从哪里找？通常有哪些类型的工作？`,
    category: 'job',
    authorName: '张伟',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhangWei',
    isAnonymous: false,
    viewCount: 1567,
    answerCount: 3,
    isResolved: false,
    tags: ['part-time-job', 'campus-employment'],
    createdAt: '2026-05-12T16:45:00Z',
  },
  {
    id: 'q-005',
    title: 'What should I pay attention to in rental contracts?',
    titleZh: '租房合同要注意什么？',
    content: `I'm about to sign my first rental contract abroad. This is all new to me. What clauses should I pay special attention to? How can I avoid common traps?`,
    contentZh: `我即将签署我的第一份海外租房合同。这对我来说都是全新的。我应该特别注意哪些条款？如何避免常见陷阱？`,
    category: 'life',
    authorName: '刘洋',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiuYang',
    isAnonymous: true,
    viewCount: 2341,
    answerCount: 6,
    isResolved: true,
    tags: ['rental-contract', 'housing', 'renting-tips'],
    createdAt: '2026-05-11T11:30:00Z',
  },
  {
    id: 'q-006',
    title: 'How to choose between thesis track and course-based master program?',
    titleZh: '如何选择论文硕士和授课型硕士？',
    content: `I'm applying for a Master's program and can't decide between thesis-based and course-based. What factors should I consider? How does this choice affect my career prospects?`,
    contentZh: `我正在申请硕士项目，无法决定选择论文型还是授课型。我应该考虑哪些因素？这个选择如何影响我的职业前景？`,
    category: 'academic',
    authorName: '赵雪',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhaoXue',
    isAnonymous: false,
    viewCount: 1876,
    answerCount: 4,
    isResolved: false,
    tags: ['master-program', 'thesis', 'career-choice'],
    createdAt: '2026-05-10T08:00:00Z',
  },
  {
    id: 'q-007',
    title: 'What is CPT and how is it different from OPT?',
    titleZh: 'CPT是什么？和OPT有什么区别？',
    content: `I'm confused about CPT and OPT. Can someone explain the differences, eligibility requirements, and how to apply for each?`,
    contentZh: `我对CPT和OPT感到困惑。有人能解释它们的区别、资格要求以及如何申请吗？`,
    category: 'visa',
    authorName: '孙丽',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SunLi',
    isAnonymous: false,
    viewCount: 3204,
    answerCount: 5,
    isResolved: true,
    tags: ['CPT', 'OPT', 'work-authorization', 'USA'],
    createdAt: '2026-05-09T13:20:00Z',
  },
  {
    id: 'q-008',
    title: 'How to write a compelling CV for internship applications?',
    titleZh: '如何写一份有吸引力的实习申请简历？',
    content: `I'm looking for summer internships but my CV doesn't seem to get responses. What should I include? Are there any specific formats or styles preferred by employers?`,
    contentZh: `我在找暑期实习，但我的简历似乎没有得到回复。我应该包括什么？雇主有没有特别喜欢的格式或风格？`,
    category: 'job',
    authorName: '周杰',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhouJie',
    isAnonymous: false,
    viewCount: 1432,
    answerCount: 3,
    isResolved: false,
    tags: ['CV', 'internship', 'job-application'],
    createdAt: '2026-05-08T10:00:00Z',
  },
  {
    id: 'q-009',
    title: 'How to deal with homesickness during overseas study?',
    titleZh: '留学在外想家了怎么办？',
    content: `I've been studying abroad for two months and really miss home. The homesickness is affecting my studies. How do you cope with this? Any tips?`,
    contentZh: `我在国外留学两个月了，非常想家。思乡情绪正在影响我的学习。你们是怎么应对的？有什么建议吗？`,
    category: 'life',
    authorName: '吴芳',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WuFang',
    isAnonymous: true,
    viewCount: 987,
    answerCount: 5,
    isResolved: false,
    tags: ['homesickness', 'mental-health', 'adjustment'],
    createdAt: '2026-05-07T20:15:00Z',
  },
  {
    id: 'q-010',
    title: 'What are the requirements for dependent visa in the UK?',
    titleZh: '英国陪读签证有什么要求？',
    content: `My spouse is planning to do a PhD in the UK. Can I accompany them on a dependent visa? What are the requirements and can I work while in the UK?`,
    contentZh: `我的配偶计划去英国读博士。我可以持陪读签证陪同吗？有什么要求？我在英国可以工作吗？`,
    category: 'visa',
    authorName: '郑强',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhengQiang',
    isAnonymous: false,
    viewCount: 1765,
    answerCount: 4,
    isResolved: true,
    tags: ['dependent-visa', 'UK', 'spouse-visa'],
    createdAt: '2026-05-06T15:30:00Z',
  },
  {
    id: 'q-011',
    title: 'How to prepare for technical interviews in tech companies?',
    titleZh: '如何准备科技公司的技术面试？',
    content: `I have an upcoming technical interview with a major tech company. What topics should I review? How should I prepare for coding challenges and system design questions?`,
    contentZh: `我即将参加一家主要科技公司的技术面试。我应该复习哪些主题？如何准备编程题和系统设计问题？`,
    category: 'job',
    authorName: '林涛',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LinTao',
    isAnonymous: false,
    viewCount: 2543,
    answerCount: 4,
    isResolved: false,
    tags: ['technical-interview', 'coding-interview', 'tech-industry'],
    createdAt: '2026-05-05T09:45:00Z',
  },
  {
    id: 'q-012',
    title: 'How to find affordable textbooks and course materials?',
    titleZh: '如何找到便宜的教材和课程资料？',
    content: `Textbooks are so expensive! Is there a way to save money on course materials? Where do you buy or rent textbooks?`,
    contentZh: `教科书太贵了！有什么方法可以节省课程材料的费用吗？你们在哪里买或租教科书？`,
    category: 'academic',
    authorName: '黄敏',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HuangMin',
    isAnonymous: false,
    viewCount: 876,
    answerCount: 3,
    isResolved: true,
    tags: ['textbooks', 'cost-saving', 'course-materials'],
    createdAt: '2026-05-04T14:00:00Z',
  },
  {
    id: 'q-013',
    title: 'What is the process for transferring universities?',
    titleZh: '转学怎么办理？',
    content: `I'm not happy with my current university. What's the process for transferring to another university? Will I lose credits?`,
    contentZh: `我对现在的大学不太满意。转学到另一所大学需要什么流程？我会失去学分吗？`,
    category: 'academic',
    authorName: '马超',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MaChao',
    isAnonymous: false,
    viewCount: 1234,
    answerCount: 2,
    isResolved: false,
    tags: ['university-transfer', 'credits', 'academic-process'],
    createdAt: '2026-05-03T11:20:00Z',
  },
  {
    id: 'q-014',
    title: 'How to build a professional network as a student?',
    titleZh: '学生如何建立职业人脉？',
    content: `Everyone says networking is important, but as a student, I don't know how to start. Where can I meet professionals in my field?`,
    contentZh: `每个人都说人脉很重要，但作为学生，我不知道从哪里开始。我可以在哪里遇到我领域的专业人士？`,
    category: 'job',
    authorName: '杨玲',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=YangLing',
    isAnonymous: false,
    viewCount: 1654,
    answerCount: 4,
    isResolved: false,
    tags: ['networking', 'professional-development', 'career'],
    createdAt: '2026-05-02T16:40:00Z',
  },
  {
    id: 'q-015',
    title: 'What should I do if I fail a course?',
    titleZh: '如果挂科了怎么办？',
    content: `I just found out I failed an important course. What are my options? Will this affect my graduation or visa status?`,
    contentZh: `我刚发现我一门重要课程挂了。我有什么选择？这会影响我的毕业或签证状态吗？`,
    category: 'academic',
    authorName: '小龙',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=XiaoLong',
    isAnonymous: true,
    viewCount: 2876,
    answerCount: 5,
    isResolved: true,
    tags: ['course-failure', 'academic-probation', 'graduation'],
    createdAt: '2026-05-01T08:30:00Z',
  },
  {
    id: 'q-016',
    title: 'How to set up mobile phone plan as international student?',
    titleZh: '留学生怎么办理手机套餐？',
    content: `I just arrived and need to set up a mobile phone plan. Should I get a local SIM or an international plan? What carriers do you recommend?`,
    contentZh: `我刚到需要办理手机套餐。我应该买本地SIM卡还是国际套餐？你们推荐哪家运营商？`,
    category: 'life',
    authorName: '陈静',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChenJing',
    isAnonymous: false,
    viewCount: 743,
    answerCount: 3,
    isResolved: true,
    tags: ['mobile-plan', 'SIM-card', 'communication'],
    createdAt: '2026-04-30T10:15:00Z',
  },
  {
    id: 'q-017',
    title: 'Can I travel to other Schengen countries with my student visa?',
    titleZh: '学生签证可以去其他申根国家旅行吗？',
    content: `I have a student visa for France. Can I travel freely to other Schengen countries during my studies? What are the rules?`,
    contentZh: `我持有法国学生签证。在学习期间我可以自由前往其他申根国家吗？有什么规定？`,
    category: 'visa',
    authorName: '欧阳',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ouyang',
    isAnonymous: false,
    viewCount: 1987,
    answerCount: 4,
    isResolved: true,
    tags: ['Schengen', 'travel', 'student-visa', 'Europe'],
    createdAt: '2026-04-29T13:45:00Z',
  },
  {
    id: 'q-018',
    title: 'How to transfer credits from another university?',
    titleZh: '如何转学分？从其他大学转学分流程',
    content: `I'm considering transferring to a new university. How does the credit transfer process work? What credits are typically transferable?`,
    contentZh: `我正在考虑转学到一所新大学。转学分的流程是怎样的？哪些学分通常可以转？`,
    category: 'academic',
    authorName: '周志远',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhouZhiyuan',
    isAnonymous: false,
    viewCount: 1456,
    answerCount: 3,
    isResolved: false,
    tags: ['credit-transfer', 'university-transfer', 'academic'],
    createdAt: '2026-04-01T10:00:00Z',
  },
  {
    id: 'q-019',
    title: 'Best ways to find off-campus housing?',
    titleZh: '如何找到校外的房子？租房攻略',
    content: `I'm looking for off-campus housing next semester. What are the best platforms and strategies to find safe and affordable housing near campus?`,
    contentZh: `我正在找下学期的校外住宿。有哪些好的平台和策略可以找到安全且价格合理的校园附近住房？`,
    category: 'life',
    authorName: '林晓华',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LinXiaohua',
    isAnonymous: false,
    viewCount: 2134,
    answerCount: 5,
    isResolved: true,
    tags: ['housing', 'off-campus', 'rental', 'apartment'],
    createdAt: '2026-04-27T14:30:00Z',
  },
  {
    id: 'q-020',
    title: 'How to apply for OPT step by step?',
    titleZh: '如何申请OPT？详细步骤是什么？',
    content: `I'm about to graduate and need to apply for OPT (Optional Practical Training). Can someone walk me through the application process step by step?`,
    contentZh: `我即将毕业，需要申请OPT（可选实习培训）。有人能逐步引导我完成申请流程吗？`,
    category: 'visa',
    authorName: '王建国',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WangJianguo',
    isAnonymous: false,
    viewCount: 4532,
    answerCount: 6,
    isResolved: true,
    tags: ['OPT', 'F1-visa', 'work-authorization', 'USA', 'graduation'],
    createdAt: '2026-04-26T09:15:00Z',
  },
  {
    id: 'q-021',
    title: 'How to improve English academic writing skills?',
    titleZh: '如何提高英语学术写作能力？',
    content: `My academic writing in English is not as strong as my conversation skills. How can I improve my academic writing for essays and research papers?`,
    contentZh: `我的英语学术写作不如会话能力强。我该如何提高论文和研究论文的学术写作能力？`,
    category: 'academic',
    authorName: '张文静',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhangWenjing',
    isAnonymous: false,
    viewCount: 1876,
    answerCount: 4,
    isResolved: false,
    tags: ['academic-writing', 'English', 'essay', 'research-paper'],
    createdAt: '2026-04-02T11:20:00Z',
  },
  {
    id: 'q-022',
    title: 'How to deal with difficult professor?',
    titleZh: '如何应对难相处的教授？',
    content: `I have a professor who is very strict and seems to have personal bias against international students. How should I handle this situation?`,
    contentZh: `我有一位非常严格且似乎对国际学生有个人偏见的教授。我该如何处理这种情况？`,
    category: 'academic',
    authorName: '陈志强',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChenZhiqiang',
    isAnonymous: true,
    viewCount: 2341,
    answerCount: 5,
    isResolved: false,
    tags: ['professor', 'relationship', 'academic', 'conflict'],
    createdAt: '2026-04-24T16:45:00Z',
  },
  {
    id: 'q-023',
    title: 'Best health insurance for international students?',
    titleZh: '国际学生最好的健康保险是什么？',
    content: `I need to get health insurance as an international student. What are the best options? Should I get school-provided insurance or private insurance?`,
    contentZh: `我作为国际学生需要购买健康保险。最好的选择是什么？我应该购买学校提供的保险还是私人保险？`,
    category: 'life',
    authorName: '刘美红',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiuMeihong',
    isAnonymous: false,
    viewCount: 1654,
    answerCount: 4,
    isResolved: true,
    tags: ['health-insurance', 'insurance', 'medical', 'healthcare'],
    createdAt: '2026-04-23T13:00:00Z',
  },
  {
    id: 'q-024',
    title: 'How to build credit score as international student?',
    titleZh: '作为国际学生如何建立信用分数？',
    content: `I want to start building credit in the US as an international student. How do I start? What credit cards are available for students with no credit history?`,
    contentZh: `我想作为国际学生在美国开始建立信用。我该如何开始？有哪些适合没有信用记录的学生信用卡？`,
    category: 'life',
    authorName: '赵军',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhaoJun',
    isAnonymous: false,
    viewCount: 1987,
    answerCount: 5,
    isResolved: false,
    tags: ['credit-score', 'credit-card', 'banking', 'USA'],
    createdAt: '2026-04-03T10:30:00Z',
  },
  {
    id: 'q-025',
    title: 'How to prepare for GRE in short time?',
    titleZh: '如何在短时间内备考GRE？',
    content: `I have only 2 months to prepare for the GRE. What is the most effective study plan? Should I focus more on verbal or quant?`,
    contentZh: `我只有2个月时间备考GRE。最有效的学习计划是什么？我应该更注重语文还是数学？`,
    category: 'academic',
    authorName: '孙晓明',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SunXiaoming',
    isAnonymous: false,
    viewCount: 2543,
    answerCount: 4,
    isResolved: false,
    tags: ['GRE', 'test-preparation', 'standardized-test', 'graduate-school'],
    createdAt: '2026-04-21T08:45:00Z',
  },
  {
    id: 'q-026',
    title: 'How to find research opportunities as undergraduate?',
    titleZh: '本科生如何找到研究机会？',
    content: `I'm an undergraduate student interested in research. How can I find research opportunities in my field? Should I email professors directly?`,
    contentZh: `我是一名对研究感兴趣的本科生。我如何在我领域找到研究机会？我应该直接给教授发邮件吗？`,
    category: 'academic',
    authorName: '马小丽',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MaXiaoli',
    isAnonymous: false,
    viewCount: 3210,
    answerCount: 5,
    isResolved: true,
    tags: ['research', 'undergraduate', 'professor', 'research-opportunity'],
    createdAt: '2026-04-04T15:20:00Z',
  },
  {
    id: 'q-027',
    title: 'How to manage work-life balance as graduate student?',
    titleZh: '研究生如何管理工作与生活的平衡？',
    content: `I'm struggling to balance my coursework, research, and personal life as a graduate student. Any tips on time management and avoiding burnout?`,
    contentZh: `作为研究生，我很难平衡课程、研究和个人生活。关于时间管理和避免倦怠有什么建议吗？`,
    category: 'academic',
    authorName: '杨帆',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=YangFan',
    isAnonymous: false,
    viewCount: 1876,
    answerCount: 6,
    isResolved: false,
    tags: ['work-life-balance', 'graduate-student', 'time-management', 'burnout'],
    createdAt: '2026-04-19T11:00:00Z',
  },
  {
    id: 'q-028',
    title: 'How to negotiate salary for internship?',
    titleZh: '如何谈判实习薪资？',
    content: `I received an internship offer but the salary is lower than expected. Is it appropriate to negotiate? How should I approach this?`,
    contentZh: `我收到了一份实习offer，但薪资低于预期。谈判是否合适？我该如何处理？`,
    category: 'job',
    authorName: '胡志明',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HuZhiming',
    isAnonymous: false,
    viewCount: 1432,
    answerCount: 4,
    isResolved: false,
    tags: ['internship', 'salary-negotiation', 'job-offer', 'negotiation'],
    createdAt: '2026-04-05T09:30:00Z',
  },
  {
    id: 'q-029',
    title: 'How to stay motivated during long dissertation?',
    titleZh: '写长篇论文时如何保持动力？',
    content: `I'm writing my PhD dissertation and feeling very demotivated. The project feels endless and I'm losing focus. How do you stay motivated during long-term research?`,
    contentZh: `我正在写博士论文，感到非常没有动力。这个项目感觉永无止境，我正在失去专注。在长期研究中你是如何保持动力的？`,
    category: 'academic',
    authorName: '吴婷',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WuTing',
    isAnonymous: false,
    viewCount: 1654,
    answerCount: 5,
    isResolved: false,
    tags: ['dissertation', 'phd', 'motivation', 'research'],
    createdAt: '2026-04-06T14:15:00Z',
  },
  {
    id: 'q-030',
    title: 'Best resources for learning programming from scratch?',
    titleZh: '从零开始学习编程的最佳资源是什么？',
    content: `I'm a humanities student wanting to learn programming. What are the best resources for beginners? Should I start with Python or another language?`,
    contentZh: `我是一名想学习编程的人文学生。初学者的最佳资源是什么？我应该从Python还是其他语言开始？`,
    category: 'academic',
    authorName: '黄佳怡',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HuangJiayi',
    isAnonymous: false,
    viewCount: 2876,
    answerCount: 6,
    isResolved: true,
    tags: ['programming', 'python', 'learning', 'beginner', 'cs'],
    createdAt: '2026-04-16T16:00:00Z',
  },
  // New questions for expanded categories
  {
    id: 'q-031',
    title: 'How to apply for Chinese Government Scholarship (CSC)?',
    titleZh: '如何申请中国政府奖学金（CSC）？',
    content: `I want to apply for the Chinese Government Scholarship to study in China. What are the requirements? How do I submit an application? What's the deadline?`,
    contentZh: `我想申请中国政府奖学金来中国留学。有什么要求？如何提交申请？截止日期是什么时候？`,
    category: 'policy',
    authorName: '阿里',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ali',
    isAnonymous: false,
    viewCount: 3456,
    answerCount: 5,
    isResolved: true,
    tags: ['CSC', 'scholarship', 'Chinese-government', 'funding'],
    createdAt: '2026-04-07T09:00:00Z',
  },
  {
    id: 'q-032',
    title: 'What are the visa-free entry policies for Chinese international students?',
    titleZh: '中国留学生有哪些签证免签政策？',
    content: `I heard there are new visa-free policies for international students. Can someone explain what countries are eligible and what the requirements are?`,
    contentZh: `我听说国际学生有新的免签政策。有人能解释一下哪些国家符合条件，有什么要求吗？`,
    category: 'policy',
    authorName: '米娅',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia',
    isAnonymous: false,
    viewCount: 2345,
    answerCount: 4,
    isResolved: true,
    tags: ['visa-free', 'policy', 'travel', 'international-student'],
    createdAt: '2026-04-08T14:30:00Z',
  },
  {
    id: 'q-033',
    title: 'How to pay tuition fees from overseas to Chinese university?',
    titleZh: '如何从海外支付学费到中国大学？',
    content: `I need to pay my tuition fees from my home country to a Chinese university. What are the best methods? Are there any low-fee transfer options?`,
    contentZh: `我需要从我的祖国向中国大学支付学费。最好的方式是什么？有低手续费转账选项吗？`,
    category: 'payment',
    authorName: '大卫',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    isAnonymous: false,
    viewCount: 1876,
    answerCount: 3,
    isResolved: false,
    tags: ['tuition', 'payment', 'wire-transfer', 'banking'],
    createdAt: '2026-04-13T10:15:00Z',
  },
  {
    id: 'q-034',
    title: 'When will the scholarship be disbursed?',
    titleZh: '奖学金什么时候发放？',
    content: `I was awarded a scholarship for my studies in China. When can I expect to receive the funds? Is there a specific disbursement schedule?`,
    contentZh: `我获得了在中国学习的奖学金。我什么时候可以收到资金？有特定的发款时间表吗？`,
    category: 'payment',
    authorName: '苏菲',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
    isAnonymous: false,
    viewCount: 1234,
    answerCount: 2,
    isResolved: false,
    tags: ['scholarship', 'disbursement', 'payment', 'funding'],
    createdAt: '2026-04-09T11:45:00Z',
  },
  {
    id: 'q-035',
    title: 'Best AI tools for academic writing assistance?',
    titleZh: '有哪些好的学术写作AI辅助工具？',
    content: `I'm looking for AI tools to help me with academic writing. What are the best options for grammar checking, paraphrasing, and structure improvement?`,
    contentZh: `我在寻找帮助我学术写作的AI工具。语法检查、改写和结构改进有哪些最佳选择？`,
    category: 'ai_tools',
    authorName: '艾玛',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    isAnonymous: false,
    viewCount: 4321,
    answerCount: 6,
    isResolved: true,
    tags: ['AI-writing', 'academic-tools', 'grammar', 'productivity'],
    createdAt: '2026-04-11T16:20:00Z',
  },
  {
    id: 'q-036',
    title: 'How to use ChatGPT effectively for learning a new language?',
    titleZh: '如何有效使用ChatGPT学习新语言？',
    content: `I want to use ChatGPT to practice and improve my Chinese. What prompts and methods work best for language learning?`,
    contentZh: `我想用ChatGPT来练习和提高我的中文。什么提示和方法对语言学习最有效？`,
    category: 'ai_tools',
    authorName: '马克',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mark',
    isAnonymous: false,
    viewCount: 2987,
    answerCount: 4,
    isResolved: false,
    tags: ['ChatGPT', 'language-learning', 'AI', 'Chinese'],
    createdAt: '2026-04-10T09:30:00Z',
  },
  {
    id: 'q-037',
    title: 'How to balance coursework and social life?',
    titleZh: '如何平衡学业和社交生活？',
    content: `I always feel overwhelmed by my coursework and don't have time for social activities. How do you manage to balance academic responsibilities with a social life?`,
    contentZh: `我总是被课程作业压得喘不过气来，没有时间参加社交活动。你们是如何平衡学业和社交生活的？`,
    category: 'study_life',
    authorName: '莉莉',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily',
    isAnonymous: true,
    viewCount: 1567,
    answerCount: 5,
    isResolved: false,
    tags: ['time-management', 'social-life', 'balance', 'university-life'],
    createdAt: '2026-04-09T15:00:00Z',
  },
  {
    id: 'q-038',
    title: 'How to make friends with local Chinese students?',
    titleZh: '如何与中国本地学生交朋友？',
    content: `I find it hard to connect with local Chinese students. They seem to have their own friend groups. Any tips on how to make friends and integrate better?`,
    contentZh: `我觉得很难与中国本地学生联系。他们似乎有自己的朋友圈。有什么建议可以帮助我交朋友和更好地融入吗？`,
    category: 'study_life',
    authorName: '杰克',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
    isAnonymous: false,
    viewCount: 2345,
    answerCount: 4,
    isResolved: false,
    tags: ['friendship', 'social', 'local-students', 'integration'],
    createdAt: '2026-04-08T13:30:00Z',
  },
  {
    id: 'q-039',
    title: 'How to prepare for campus recruitment interviews?',
    titleZh: '如何准备校园招聘面试？',
    content: `Many big tech companies are coming to our campus for recruitment. How should I prepare for these campus interviews? What are the common interview formats?`,
    contentZh: `许多大型科技公司要来我们学校招聘。我应该如何准备这些校园面试？常见的面试形式是什么？`,
    category: 'job_recruitment',
    authorName: '陈伟',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChenWei',
    isAnonymous: false,
    viewCount: 3210,
    answerCount: 5,
    isResolved: true,
    tags: ['campus-recruitment', 'interview', 'tech-companies', 'job-hunting'],
    createdAt: '2026-04-07T10:00:00Z',
  },
  {
    id: 'q-040',
    title: 'What questions to ask during a job interview?',
    titleZh: '面试时应该问什么问题？',
    content: `I always forget what questions I should ask at the end of an interview. What are some good questions to ask the interviewer about the role and company culture?`,
    contentZh: `我总是忘记在面试结束时应该问什么问题。有什么好的问题可以向面试官询问关于职位和公司文化？`,
    category: 'job_recruitment',
    authorName: '王芳',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WangFang',
    isAnonymous: false,
    viewCount: 1876,
    answerCount: 3,
    isResolved: false,
    tags: ['interview-questions', 'job-interview', 'career-advice'],
    createdAt: '2026-04-06T14:45:00Z',
  },
  {
    id: 'q-041',
    title: 'How to apply for post-study work visa in China?',
    titleZh: '如何申请中国留学生工作签证？',
    content: `I'll be graduating soon and want to stay in China to work. What's the process for applying for a work visa after graduation? What are the requirements?`,
    contentZh: `我即将毕业，想留在中国工作。毕业后申请工作签证的流程是什么？有什么要求？`,
    category: 'policy',
    authorName: '刘洋',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiuYang2',
    isAnonymous: false,
    viewCount: 2876,
    answerCount: 4,
    isResolved: true,
    tags: ['work-visa', 'post-study', 'China', 'employment'],
    createdAt: '2026-04-05T09:15:00Z',
  },
  {
    id: 'q-042',
    title: 'Is it safe to use AI essay writers?',
    titleZh: '使用AI写作助手安全吗？',
    content: `I've seen many AI essay writing tools online. Is it safe to use them? Will my university detect AI-generated content? What are the ethical concerns?`,
    contentZh: `我在网上看到很多AI论文写作工具。使用它们安全吗？我的大学会检测到AI生成的内容吗？有什么伦理问题？`,
    category: 'ai_tools',
    authorName: '匿名学生',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anonymous2',
    isAnonymous: true,
    viewCount: 4567,
    answerCount: 7,
    isResolved: false,
    tags: ['AI-detection', 'academic-integrity', 'essay-writing', 'ethics'],
    createdAt: '2026-04-04T11:30:00Z',
  },
  {
    id: 'q-043',
    title: 'How to open a Alipay/WeChat Pay account as foreign student?',
    titleZh: '外国学生如何开通支付宝/微信支付？',
    content: `Mobile payment is so popular in China. How can a foreign student set up Alipay or WeChat Pay? What documents are needed?`,
    contentZh: `移动支付在中国非常流行。外国学生如何设置支付宝或微信支付？需要什么文件？`,
    category: 'payment',
    authorName: '保罗',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Paul',
    isAnonymous: false,
    viewCount: 2134,
    answerCount: 4,
    isResolved: true,
    tags: ['Alipay', 'WeChat-Pay', 'mobile-payment', 'digital-wallet'],
    createdAt: '2026-04-03T16:00:00Z',
  },
  {
    id: 'q-044',
    title: 'How to join student clubs and organizations?',
    titleZh: '如何加入学生社团和组织？',
    content: `I want to get involved in campus life by joining clubs. How do I find out about different student organizations and what activities do they usually organize?`,
    contentZh: `我想通过加入社团来参与校园生活。我如何了解不同的学生组织，它们通常组织什么活动？`,
    category: 'study_life',
    authorName: '妮娜',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nina',
    isAnonymous: false,
    viewCount: 1234,
    answerCount: 3,
    isResolved: true,
    tags: ['clubs', 'student-organizations', 'campus-activities', 'extracurricular'],
    createdAt: '2026-04-02T10:30:00Z',
  },
  {
    id: 'q-045',
    title: 'How to write a cover letter for job applications?',
    titleZh: '如何写求职 Cover Letter？',
    content: `I'm applying for jobs but struggling with cover letters. How do I write a compelling cover letter that stands out? Any examples or templates?`,
    contentZh: `我正在申请工作，但为求职信而苦恼。我如何写一封引人注目的求职信？有什么例子或模板吗？`,
    category: 'job_recruitment',
    authorName: '张明',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhangMing',
    isAnonymous: false,
    viewCount: 1654,
    answerCount: 4,
    isResolved: false,
    tags: ['cover-letter', 'job-application', 'resume', 'career'],
    createdAt: '2026-04-01T14:15:00Z',
  },
];

// Sample answers data
export const answersData: Answer[] = [
  // Answers for q-001 (plagiarism)
  {
    id: 'a-001-1',
    questionId: 'q-001',
    content: `Great question! Here are some key practices:

1. **Always cite your sources properly** - Use the required citation style (APA, MLA, etc.)
2. **Paraphrase effectively** - Don't just change a few words; truly understand and rephrase in your own voice
3. **Use quotation marks** - For any exact phrases from sources
4. **Keep track of your sources** - Use reference management tools like Zotero
5. **Run your paper through plagiarism checkers** - Like Turnitin or Grammarly before submission

Remember, proper citation is not cheating - it's how academic discourse works!`,
    contentZh: `好问题！以下是一些关键做法：

1. **始终正确引用您的来源** - 使用所需的引用样式（APA、MLA等）
2. **有效改写** - 不要只改几个词；要真正理解并用自己的话重新表达
3. **使用引号** - 对于任何来自来源的确切短语
4. **跟踪您的来源** - 使用Zotero等参考管理工具
5. **在提交前使用抄袭检查器检查您的论文** - 如Turnitin或Grammarly

记住，正确引用不是作弊——这是学术交流的方式！`,
    authorName: 'Dr. Zhang',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DrZhang',
    isAnonymous: false,
    isAiAnswer: false,
    rating: 45,
    isAccepted: true,
    createdAt: '2026-05-15T12:00:00Z',
  },
  {
    id: 'a-001-2',
    questionId: 'q-001',
    content: `AI辅助: To avoid plagiarism suspicion:

1. **Understand the concepts deeply** - Don't just copy explanations; make sure you truly understand the material
2. **Add your own analysis and insights** - Connect ideas from multiple sources and provide your own interpretation
3. **Use multiple sources** - Don't rely on a single source heavily
4. **Cite thoughtfully** - Even for ideas that are common knowledge

The key is to use AI as a learning tool, not a writing tool.`,
    contentZh: `AI辅助：要避免抄袭嫌疑：

1. **深入理解概念** - 不要只是复制解释；要确保你真正理解材料
2. **添加你自己的分析和见解** - 将多个来源的想法联系起来并提供你自己的解释
3. **使用多个来源** - 不要严重依赖单一来源
4. **深思熟虑地引用** - 即使对于常识性想法

关键是使用AI作为学习工具，而不是写作工具。`,
    authorName: 'AI助手',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AI',
    isAnonymous: false,
    isAiAnswer: true,
    rating: 32,
    isAccepted: false,
    createdAt: '2026-05-15T12:30:00Z',
  },
  // Answers for q-002 (UK banking)
  {
    id: 'a-002-1',
    questionId: 'q-002',
    content: `Here's what you need to know about opening a UK bank account:

**Documents typically required:**
- Valid passport
- Student visa
- University enrollment letter (can get from student services)
- Proof of address (your dorm or rental agreement)
- University ID

**Recommended banks for students:**
- HSBC (widely available)
- Barclays
- Lloyds
- Santander (offers student accounts)

**Pro tip:** Some banks allow you to open an account before you arrive. Check with your university's international office for recommendations.`,
    contentZh: `以下是您需要了解的关于开立英国银行账户的信息：

**通常需要的文件：**
- 有效护照
- 学生签证
- 大学入学通知书（可从学生服务中心获取）
- 地址证明（您的宿舍或租房协议）
- 大学身份证

**推荐给学生使用的银行：**
- HSBC（广泛可用）
- Barclays
- Lloyds
- Santander（提供学生账户）

**专业提示：** 一些银行允许您在到达前开立账户。请咨询您的大学国际办公室获取推荐。`,
    authorName: '英国留学生小王',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=UKStudent',
    isAnonymous: false,
    isAiAnswer: false,
    rating: 28,
    isAccepted: true,
    createdAt: '2026-05-14T16:00:00Z',
  },
  // Answers for q-003 (F1 work)
  {
    id: 'a-003-1',
    questionId: 'q-003',
    content: `F-1 visa work restrictions are important to understand:

**On-campus work:**
- Up to 20 hours/week during term
- Unlimited during breaks
- No special authorization needed

**Off-campus work requires authorization:**
1. **CPT (Curricular Practical Training)** - For credit-bearing internships
2. **OPT (Optional Practical Training)** - After completing one year of studies
3. **STEM OPT** - Extended OPT for STEM fields (24 months extra)

**Key rule:** You must maintain valid F-1 status. Unauthorized work can lead to deportation.`,
    contentZh: `F-1签证工作限制很重要：

**校内工作：**
- 学期期间每周最多20小时
- 假期期间不限
- 无需特别授权

**校外工作需要授权：**
1. **CPT（课程实习培训）** - 用于学分实习
2. **OPT（可选实习培训）** - 完成一年学习后
3. **STEM OPT** - STEM领域的延长OPT（额外24个月）

**关键规则：** 您必须保持有效的F-1身份。未经授权的工作可能导致驱逐出境。`,
    authorName: '移民律师王',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LawyerWang',
    isAnonymous: false,
    isAiAnswer: false,
    rating: 67,
    isAccepted: true,
    createdAt: '2026-05-13T11:00:00Z',
  },
  // Answers for q-005 (rental contract)
  {
    id: 'a-005-1',
    questionId: 'q-005',
    content: `Important clauses to check in rental contracts:

1. **Break clause** - Can you end the contract early? What's the penalty?
2. **Security deposit** - How much? What's the condition for return?
3. **Rent increase terms** - How and when can rent be increased?
4. **Repair responsibilities** - Who pays for what repairs?
5. **Notice period** - How much notice needed to leave?
6. **Utilities** - What's included in rent?

**Red flags to watch:**
- Requests to pay rent in cash
- Landlord refuses to provide receipts
- Pressure to sign quickly
- deposit requested before viewing the property`,
    contentZh: `检查租房合同的重要条款：

1. **解约条款** - 你可以提前终止合同吗？有什么处罚？
2. **押金** - 多少？什么条件下可以退还？
3. **租金上涨条款** - 如何以及何时可以涨租？
4. **维修责任** - 谁支付什么维修费用？
5. **通知期** - 离开需要多少通知？
6. ** utilities** - 什么包含在房租里？

**需要警惕的危险信号：**
- 要求用现金支付租金
- 房东拒绝提供收据
- 催促快速签字
- 在看房前要求支付押金`,
    authorName: '匿名',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anonymous',
    isAnonymous: true,
    isAiAnswer: false,
    rating: 52,
    isAccepted: true,
    createdAt: '2026-05-11T14:00:00Z',
  },
  // Answers for q-007 (CPT vs OPT)
  {
    id: 'a-007-1',
    questionId: 'q-007',
    content: `CPT vs OPT - here's the breakdown:

**CPT (Curricular Practical Training)**
- Must be related to your field of study
- Must be part of your curriculum (can be required or optional)
- Must be authorized before starting work
- Full-time CPT can affect your OPT eligibility
- Typically used for internships during studies

**OPT (Optional Practical Training)**
- Can be used before or after completing studies
- Pre-completion OPT: up to 12 months (part-time 20hrs during school)
- Post-completion OPT: up to 12 months
- STEM OPT: additional 24 months for STEM graduates
- You can apply up to 90 days before program end date

**Key difference:** CPT is tied to your academic program, while OPT is more flexible.`,
    contentZh: `CPT vs OPT - 详细说明：

**CPT（课程实习培训）**
- 必须与您的学习领域相关
- 必须是课程的一部分（可以是必修或选修）
- 必须在开始工作前获得授权
- 全日制CPT会影响您的OPT资格
- 通常用于学习期间的实习

**OPT（可选实习培训）**
- 可以在完成学业前后使用
- 完成前OPT：最长12个月（在校期间兼职20小时）
- 完成后OPT：最长12个月
- STEM OPT：STEM毕业生额外24个月
- 您可以在项目结束日期前最多90天申请

**关键区别：** CPT与您的学术项目挂钩，而OPT更灵活。`,
    authorName: '留学顾问李老师',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ConsultantLi',
    isAnonymous: false,
    isAiAnswer: false,
    rating: 89,
    isAccepted: true,
    createdAt: '2026-05-09T15:30:00Z',
  },
  // Answers for q-009 (homesickness)
  {
    id: 'a-009-1',
    questionId: 'q-009',
    content: `Homesickness is completely normal! Here's what helped me:

1. **Stay connected but not too much** - Regular video calls with family, not constant messaging
2. **Create a routine** - Get busy with activities you enjoy
3. **Make your space feel like home** - Bring some items from home, cook familiar foods
4. **Build new connections** - Join clubs, attend events, make local friends
5. **Explore your new environment** - Get curious about where you live
6. **Give it time** - It usually gets easier after the first few months

Remember, feeling homesick means you have a loving home. That's not a bad thing!`,
    contentZh: `思乡是很正常的！这对我来说有帮助：

1. **保持联系但不要太多** - 定期与家人视频通话，而不是持续发消息
2. **建立例程** - 让自己忙于喜欢的活动
3. **让您的空间有家的感觉** - 带一些家里的东西，烹饪熟悉的食物
4. **建立新的联系** - 加入俱乐部、参加活动、交当地朋友
5. **探索您的新环境** - 对您住的地方感到好奇
6. **给它时间** - 通常几个月后会更容易

记住，想家意味着您有一个充满爱的家。这不是坏事！`,
    authorName: '匿名学姐',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SeniorStudent',
    isAnonymous: true,
    isAiAnswer: false,
    rating: 41,
    isAccepted: false,
    createdAt: '2026-05-07T22:00:00Z',
  },
  {
    id: 'a-009-2',
    questionId: 'q-009',
    content: `AI建议：应对思乡情绪

1. **接受这种情绪** - 不要压抑它，这是正常的反应
2. **保持健康的生活方式** - 充足睡眠、适度运动、均衡饮食
3. **设定小目标** - 学习新技能、探索新地方
4. **寻求支持** - 如果情绪持续低落，及时寻求心理咨询

留学是一段成长之旅，思乡是成长的一部分。🌱`,
    contentZh: `AI建议：应对思乡情绪

1. **接受这种情绪** - 不要压抑它，这是正常的反应
2. **保持健康的生活方式** - 充足睡眠、适度运动、均衡饮食
3. **设定小目标** - 学习新技能、探索新地方
4. **寻求支持** - 如果情绪持续低落，及时寻求心理咨询

留学是一段成长之旅，思乡是成长的一部分。🌱`,
    authorName: 'AI助手',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AI',
    isAnonymous: false,
    isAiAnswer: true,
    rating: 35,
    isAccepted: false,
    createdAt: '2026-05-07T22:30:00Z',
  },
  // More answers for other questions...
  {
    id: 'a-004-1',
    questionId: 'q-004',
    content: `Finding on-campus jobs:

1. **Check your university's career portal** - Most have job listings for students
2. **Visit the international student office** - They often have connections to student-friendly jobs
3. **Library and cafeteria** - Classic student jobs, usually posted on campus boards
4. **Departmental positions** - Ask your professors if they need research assistants
5. **Campus bookstore** - Usually hires during term start

**Tips:**
- Apply early in the semester
- Check work-study eligibility if you're eligible
- Some jobs have English requirements, don't be discouraged!`,
    contentZh: `寻找校内工作：

1. **查看您大学的职业门户** - 大多数都有学生工作列表
2. **访问国际学生办公室** - 他们通常有适合学生的工作机会
3. **图书馆和食堂** - 经典的学生工作，通常发布在校园公告板上
4. **系里职位** - 询问您的教授是否需要研究助理
5. **校园书店** - 通常在学期开始时招聘

**提示：**
- 提前一学期申请
- 如果符合条件，检查勤工俭学资格
- 有些工作有英语要求，不要气馁！`,
    authorName: '校园工作达人',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CampusWorker',
    isAnonymous: false,
    isAiAnswer: false,
    rating: 23,
    isAccepted: true,
    createdAt: '2026-05-12T18:30:00Z',
  },
  // Answers for q-015 (failing a course)
  {
    id: 'a-015-1',
    questionId: 'q-015',
    content: `Don't panic! Here's what you need to know:

**Immediate steps:**
1. Talk to your academic advisor ASAP
2. Understand why you failed (grade breakdown)
3. Check if you can retake the course

**Impact considerations:**
- Most programs allow retaking courses
- The new grade usually replaces the old one
- May affect your GPA if not properly handled

**Visa implications (for international students):**
- Full-time status requires minimum credits
- Academic probation may affect visa status
- Communicate with your DSO (Designated School Official)

**Key:** Take action early and seek help from your academic advisor.`,
    contentZh: `别慌！以下是您需要了解的：

**立即步骤：**
1. 尽快与您的学术顾问交谈
2. 了解您失败的原因（成绩细分）
3. 检查您是否可以重修课程

**影响考虑：**
- 大多数项目允许重修课程
- 新成绩通常会取代旧成绩
- 如果处理不当可能会影响您的GPA

**签证影响（对于国际学生）：**
- 全日制状态需要最低学分
- 学术 probation 可能会影响签证状态
- 与您的DSO（指定学校官员）沟通

**关键：** 尽早采取行动并寻求学术顾问的帮助。`,
    authorName: '学术顾问张博士',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DrZhang2',
    isAnonymous: false,
    isAiAnswer: false,
    rating: 58,
    isAccepted: true,
    createdAt: '2026-05-01T10:00:00Z',
  },
];

// Helper functions
export function getQuestionById(id: string): Question | undefined {
  return questionsData.find(q => q.id === id);
}

export function getAnswersByQuestionId(questionId: string): Answer[] {
  return answersData.filter(a => a.questionId === questionId);
}

export function getQuestionsByCategory(category: QuestionCategory): Question[] {
  return questionsData.filter(q => q.category === category);
}

export function getResolvedQuestions(): Question[] {
  return questionsData.filter(q => q.isResolved);
}

export function getUnansweredQuestions(): Question[] {
  return questionsData.filter(q => q.answerCount === 0);
}

export function getHotQuestions(limit: number = 5): Question[] {
  return [...questionsData]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit);
}

export function getRecentQuestions(limit: number = 10): Question[] {
  return [...questionsData]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function filterQuestions(params: {
  category?: QuestionCategory;
  search?: string;
  resolved?: boolean;
}): Question[] {
  let filtered = [...questionsData];

  if (params.category) {
    filtered = filtered.filter(q => q.category === params.category);
  }

  if (params.resolved !== undefined) {
    filtered = filtered.filter(q => q.isResolved === params.resolved);
  }

  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(q =>
      q.title.toLowerCase().includes(searchLower) ||
      q.titleZh.includes(searchLower) ||
      q.content.toLowerCase().includes(searchLower) ||
      q.contentZh.includes(searchLower)
    );
  }

  return filtered;
}

export function sortQuestions(questions: Question[], sortBy: 'newest' | 'hottest' | 'unanswered'): Question[] {
  const sorted = [...questions];

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'hottest':
      return sorted.sort((a, b) => b.viewCount - a.viewCount);
    case 'unanswered':
      return sorted.sort((a, b) => a.answerCount - b.answerCount);
    default:
      return sorted;
  }
}
