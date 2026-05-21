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
    contentZh: `我正在写硕士论文，Turnitin查重搞得我睡不着觉。有时候明明标注了引用还是被标红，真的很无语。想问问大家有什么实操经验吗？`,
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
    contentZh: `下个月就要去英国了，听说开户超级麻烦？我朋友，光准备材料就跑了三趟银行。想问问有没有什么坑可以避免的，哪些银行对中国学生比较友好？`,
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
    contentZh: `我是F1签证，想课余打点工但完全不知道边界在哪。听说有人打黑工被遣返了，吓死我了。到底什么情况算违法啊？`,
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
    contentZh: `我口语烂得要死，想找个校内的活练练英语顺便挣点零花钱。图书馆、食堂都试过了，职位少得可怜而且竞争贼激烈。还有什么别的路子吗？`,
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
    contentZh: `第一次在国外租房，中介给的那份合同密密麻麻全是英文，看得我头都大了。听说有人被坑了几千磅押金，求问有什么必须盯死的条款？`,
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
    contentZh: `申请季被这个问题搞死了。有人说授课型水，有人说论文型难毕业。我之后想读博但又怕论文写不出来，到底该怎么选啊？有没有过来人说说真实感受？`,
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
    contentZh: `被CPT和OPT搞晕了，看了一堆帖子还是懵的。听说CPT用多了会影响OPT？这是真的吗？有没有人能用人话解释一下这两个到底怎么用？`,
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
    contentZh: `投了20多份简历出去，石沉大海连个拒信都没有。怀疑人生了，到底是简历问题还是我太菜了？那些收到面试的是怎么写简历的？`,
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
    contentZh: `出国两个月了，最近真的快绷不住了。晚上一个人躺着就想哭，书也看不进去。跟爸妈视频反而更难受。真的有办法熬过去吗？`,
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
    contentZh: `老公要去英国读博了，我想跟着去但不知道陪读签证怎么办。我能过去打工吗？听说还要存好几个月的存款证明？`,
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
    contentZh: `下周有家大厂的技术面，算法题我还能背背，但系统设计完全没头绪。有人说要看几十篇论文，真的假的？有没有什么速成的方法啊？`,
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
    contentZh: `刚看了一下课本价格，一本书1200块人民币，抢钱呢？我房贷都没这么重。有没有什么买到便宜书的路子，或者能不能用电子版替代啊？`,
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
    contentZh: `现在这个学校真的待不下去了，老师上课念PPT，考试题目跟讲的完全没关系。想转学但不知道之前的学分能不能带走，会不会白读一年？`,
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
    contentZh: `总听说network多重要，但我一个学生上哪去认识行业大佬？LinkedIn发消息人家都不理我的。硬着头皮去参加meetup也不知道说什么，很尬。`,
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
    contentZh: `我死了，这学期必修课挂了。教授说只有重修一条路，但下学期这门课不开...我签证会不会有问题啊？感觉天都要塌了。`,
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
    contentZh: `刚落地手机就没信号了，国际漫游贵得吓人。想问问各位当地用什么运营商套餐啊？听说有那种几十块人民币一个月的卡，靠谱吗？`,
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
    contentZh: `我在法国拿的留学签证，想趁假期去周边国家玩一圈。听说申根区可以随便走，但到底是怎么个说法？要提前申请什么吗？`,
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
    contentZh: `我在原来的学校读了一年半了，想转学到排名更高的。这个学分转过来能认多少啊？会不会很多课都白学了？`,
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
    contentZh: `受够了宿舍的破条件，下学期想搬出去住。校外的房子水太深了，看了好几个都是坑。有什么平台比较靠谱吗？或者直接找房东租那种？`,
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
    contentZh: `我是25年12月的毕业生，听说OPT申请超级复杂，材料一堆还容易出错。能不能来个真实的申请流程，怕自己弄砸了。`,
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
    contentZh: `我英语口语溜得飞起，但一写论文就卡壳。那个从句套从句的写法真的学不来，有什么捷径吗？还是说只能慢慢磨？`,
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
    contentZh: `我一个教授，不知道是不是看我不顺眼。上课点名专门跳过我，邮件从来不回，期末给我打了個C。明明我成绩比某些本地学生还好。这事能投诉吗？`,
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
    contentZh: `学校保险贵死了，一年要3000多刀。但听说外面的私人保险不靠谱，看病的时候各种不报销。到底怎么选啊？`,
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
    contentZh: `刚来美国，听说信用分数很重要，以后租房买车都看这个。但我什么都没有，从零开始要怎么弄啊？有哪些信用卡适合留学生的？`,
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
    contentZh: `只剩两个月了，GRE完全没开始准备。我底子还行，但词汇量真的崩。有人说刷题就行，有人说要背单词，到底怎么分配时间最合理？`,
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
    contentZh: `我本科就想进实验室，但是不知道自己配不配。给教授发邮件会不会很冒昧啊？一般教授会要本科生吗？`,
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
    contentZh: `我研究生读得快疯掉了。导师天天催进度，作业写不完，实验没结果，还想有点个人生活。周末不加班就良心过不去。怎么破？`,
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
    contentZh: `我拿到一个实习offer，但开的工资比我预期的低20%。我应该试着谈谈吗？会不会显得我很贪心直接收回offer啊？`,
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
    contentZh: `博士第三年了，论文才写了一半。每天对着电脑发呆，导师发消息都不想回。感觉自己在一个黑洞里，怎么办啊？`,
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
    contentZh: `我是纯文科生，连Excel都玩不转那种。想学编程但完全零基础，看网上推荐一堆根本不知道从哪下手。Python真的适合我吗？`,
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
    contentZh: `我想申请CSC奖学金留学中国，但流程看起来超级复杂。那个网站全是中文看不太懂，有没有成功申请过的说说具体怎么弄？`,
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
    contentZh: `听说最近很多国家对中国留学生免签了？我想趁假期出去浪一圈但不知道哪些地方可以说走就走。有没有最新的清单？`,
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
    contentZh: `我在国外，要给中国的大学打学费。那个银行手续费高得离谱，转一次收了将近1000块。还有没有便宜点的办法啊？`,
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
    contentZh: `我申请到奖学金了，但都过去两个月了还没收到钱。问了学校就让我等，到底要等多久啊？有没有一个大概的时间表？`,
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
    contentZh: `我写论文写到头秃，想找个AI工具帮帮忙。Grammarly我用了，但感觉只能检查语法。有没有更强大的，能帮忙改写和润色的？`,
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
    contentZh: `我想用ChatGPT练中文，但每次就是问个"你好用中文怎么说"就没了。感觉在浪费这个工具，有什么正确的打开方式吗？`,
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
    contentZh: `我学业忙得要死，社交活动完全没时间。朋友约我出去我都在赶作业，长此以往感觉要没朋友了。大家都是怎么平衡的啊？`,
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
    contentZh: `我试过加入本地学生的圈子，但他们之间用方言聊天我完全听不懂，下课就散了。感觉融不进去，有点孤单。`,
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
    contentZh: `秋招来了，阿里腾讯字节都要来我们学校。我之前完全没准备过面试，现在慌得一批。有没有什么短期内能提升的面试技巧？`,
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
    contentZh: `每次面试到最后问我有什么问题要问，我脑子就一片空白。硬挤出个"团队氛围怎么样"感觉蠢死了。有没有真正加分的反问？`,
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
    contentZh: `我快毕业了，想留在国内工作。听说要办工作签证特别麻烦，还要找公司担保。到底整个流程是怎样的啊？`,
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
    contentZh: `我看到有人用AI写论文被抓了，学位都没了。但我认识几个人天天用也没事。到底会不会被检测出来啊？我有点慌。`,
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
    contentZh: `来中国留学才发现这里出门根本不用现金，但我是外国银行卡绑不上啊。支付宝微信支付开通麻不麻烦？`,
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
    contentZh: `我想加几个社团不然简历太空白了。但学校社团一大堆，眼花缭乱的。怎么知道哪个靠谱啊？加太多会不会影响学习？`,
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
    contentZh: `简历我会写，但Cover Letter真的难到我了。中英文版本都试过，不是太假就是太空。HR到底想看什么啊？`,
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
    contentZh: `我之前也被Turnitin搞得快疯了。说下我的血泪经验：查出来的问题基本就两种，一是引用格式不对，二是真的和别人的表述太像了。

第一个好解决，用EndNote或者Zotero自动生成引用格式就行。第二个比较恶心，有时候你自己写的东西就是会无意中接近别人的表述。我后来每次写完都会用Quillbot paraphrase一遍，然后再提交。导师说我这种方法反而比直接提交更有效率。`,
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
    contentZh: `说实话，我之前也吃过这个亏。有一次我引用了一篇论文的核心观点，结果Turnitin标红40%多，教授直接约我谈话。

后来我学聪明了：写之前先把参考文献吃透，然后用自己的话总结观点，而不是照搬原文句式。举个例子，原文说"经济增长带动了城市化进程"，我可以改成"城市扩张很大程度上是经济发展的副产品"。这样既表达了原意，又完全避免了重复。

另外，用Zotero管理参考文献真的很有用，它能自动生成各种格式的引用，省心。`,
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
    contentZh: `我在英国开了两次户了，说下实际经历。

材料其实不复杂：护照、签证、入学通知书、学校开的地址证明（一般学生中心可以开）、学生证。

我第一年用的Barclays，开户流程大概用了两周。第二年换成HSBC，因为网点多办业务方便。Santander有专门的学生账户，但据说审批慢我没选。

最坑的是啥呢？很多银行要求你有英国手机号才能开户，所以你可能得先买个pay as you go的卡。有个技巧是可以让学校国际部给你写封推荐信，有些银行认这个。`,
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
    contentZh: `我F1签证打了三年工了，把我知道的说清楚。

校内工作最简单，图书馆、食堂、宿舍楼都算，不需要任何授权。每周20小时上限，假期可以全时。

想在校外工作的话，只有一条路——必须先拿到授权。CPT是你读书期间用的，必须是跟你专业相关的实习才能申请，而且要通过学校国际部审批。OPT是你毕业前后用的，前提是你得读完一整个学年且成绩ok。

我室友就是打黑工被发现了，结果签证被取消直接遣返，真人真事。所以千万别有侥幸心理。`,
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
    contentZh: `我在三个国家租过房，被坑过两次，说下最重要的：

押金这块一定要在合同里写清楚退还条件。我之前有个房东退房时说我弄坏了冰箱要扣钱，但我发誓那在我住之前就坏了。没有证据只能认栽。所以搬进去之前拍照拍视频留记录很重要。

还要看清楚有没有涨租条款。我后来那个合同写着每年涨5%，当时觉得无所谓，结果住了三年房租快翻倍了。

最最重要的是解约条款。我第一次租房没注意这个，后来因为工作调动要提前走，房东说要扣我三个月押金。 后来我查了一下当地法律，发现合同里这条根本没法律效力，但打官司又麻烦得要死。所以签之前最好找人看看。`,
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
    contentZh: `我自己CPT和OPT都用过，应该能给你讲清楚。

CPT就是你读书期间用的那个，必须是跟你专业有关的实习才能申请，而且得是program要求或者学校允许的实习。我当年用CPT去微软实习了半年，过程是学校国际部审批加上移民局批准，大概花了六周。

OPT更灵活，分毕业前和毕业后两种。毕业前你可以边上课边做，但每周不能超过20小时。毕业后就是全职了。STEM专业运气好，能申请额外24个月的extension，加起来三年。

一个重要的事：如果用满一年全职CPT，OPT就没了。所以实习悠着点用，别一口气全用完。`,
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
    contentZh: `我出国第七个月的时候达到了崩溃的顶峰。那会儿跟家里视频一次哭一次，后来都不敢打了。

后来我试了几个方法：第一个是让自己忙起来，我开始去健身房，强迫自己跟本地人聊天。第二个是下了个 discord 找同好的群，里面都是留学生，比跟家里诉苦有用多了。第三个是允许自己丧，但设个期限，比如今天可以躺一天，明天必须出门。

说起来好笑，让我真正走出来的是一个本地老太太。我在公园喂鸽子的时候她跟我聊天，后来她介绍我去了个读书会。现在我周末有时候还会去她家吃饭。

给你的建议就是，别憋着，想哭就哭，但哭完了一定要出门走走。真的，第六个月之后会好很多的。`,
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
    contentZh: `我也是留学生过来的，想跟你说个实话：思乡这东西，真的没办法彻底消除，只能熬过去。

我当时试过几个土方法：一个是跟家里寄明信片，手写的，不是微信发消息那种。写着写着就觉得跟家里还有连接。第二个是学会了做几道家常菜，饿了的时候自己做着吃，比在外面买想吃的东西管用得多。第三个是找到了一部跟家里没时差的剧，追着看，剧情成了我跟家里视频的话题。

你现在才两个月，真的别急。一般到半年左右会好很多。我认识的基本都这样。撑住啊。`,
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
    contentZh: `我在图书馆和食堂都干过，说下实际情况。

图书馆的活最爽，环境好，还能边工作边看书。但竞争激烈，一个岗位出来可能有几十个人申请。我当时运气好，恰好有个学姐毕业了我才顶上的。

食堂呢，钱少点但包饭，这点很香。食堂大叔大妈都认识我了，每次去都多给我一勺菜。

最推荐的是找导师做研究助理，虽然要求高但工资也高，而且推荐信这不就有了吗。我室友就是这么进的实验室，后来发了篇论文。

有个小窍门，开学第一周就去打听哪些岗位要人，很多都是提前内定的。`,
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
    contentZh: `我挂过两门，差点被劝退。现在想想当时真的挺绝望的，但后来都过来了。

第一件事，马上约你的学术指导老师，别等到下学期。我的经历是教授一般会给一次或者两次补考机会，但需要你主动去求情。我当时写了一封很长很诚实的邮件给教授，说明了我为什么没考好，结果教授给了我一次补考机会。

关于签证，这个真的不能拖。国际学生每学期都有最低学分要求，挂科多了会触发学术警告，严重的话会影响I20。你得马上联系学校的DSO，让他们知道你现在的状况，了解一下会不会影响到你的合法身份。

重修的话，一般新成绩会覆盖旧成绩，GPA会补回来的。但注意有些学校只让重修一次，再挂就很麻烦了。

真的别放弃，我当时也觉得天塌了，但后来顺利毕业了。`,
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
