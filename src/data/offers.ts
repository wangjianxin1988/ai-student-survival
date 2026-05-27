// Offer data model matching the interface from ARCHITECTURE.md
export type VerificationStatus = 'verified' | 'pending' | 'rejected' | 'none';

// Comprehensive degree types - covers all academic levels for international students
export const DEGREE_TYPES = [
  'Foundation',      // 预科
  'Associate',       // 副学士
  'Bachelor',        // 本科
  'GraduateCertificate',  // 研究生证书
  'GraduateDiploma',     // 研究生文凭
  'Master',          // 硕士
  'PhD',             // 博士
  'Postdoc',         // 博士后
  'VisitingScholar', // 访问学者
  'ShortProgram',    // 短期项目
  'SummerSchool',    // 夏季课程
  'Online',          // 线上课程
  'Exchange',        // 交换生
  'JointDegree',     // 联合培养
  'AdvancedStudy',   // 研修班
] as const;
export type DegreeType = typeof DEGREE_TYPES[number];

// Degree labels for UI display
export const DEGREE_LABELS: Record<DegreeType, { zh: string; en: string }> = {
  Foundation: { zh: '预科', en: 'Foundation' },
  Associate: { zh: '副学士', en: 'Associate' },
  Bachelor: { zh: '本科', en: 'Bachelor' },
  GraduateCertificate: { zh: '研究生证书', en: 'Graduate Certificate' },
  GraduateDiploma: { zh: '研究生文凭', en: 'Graduate Diploma' },
  Master: { zh: '硕士', en: 'Master' },
  PhD: { zh: '博士', en: 'PhD' },
  Postdoc: { zh: '博士后', en: 'Postdoc' },
  VisitingScholar: { zh: '访问学者', en: 'Visiting Scholar' },
  ShortProgram: { zh: '短期项目', en: 'Short Program' },
  SummerSchool: { zh: '夏季课程', en: 'Summer School' },
  Online: { zh: '线上课程', en: 'Online' },
  Exchange: { zh: '交换生', en: 'Exchange' },
  JointDegree: { zh: '联合培养', en: 'Joint Degree' },
  AdvancedStudy: { zh: '研修班', en: 'Advanced Study' },
};

export interface Offer {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  universityName: string;
  universityLogo: string;
  universityCountry: string;
  programName: string;
  degree: DegreeType;
  admissionResult: 'admitted' | 'rejected' | 'waitlisted';
  scholarship: {
    amount: number;
    currency: string;
    type: 'full' | 'partial' | 'none';
  };
  background: {
    gpa: string;
    gre: string;
    toefl: string;
    ielts: string;
    publications: number;
    researchExperience: number;
    internships: number;
  };
  aiToolsUsed: string[];
  timeline: string;
  advice: string;
  createdAt: string;
  likes: number;
  comments: number;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  verificationDocuments?: string[];
}

export interface OfferComment {
  id: string;
  offerId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
}

// Helper to check if offer is verified
export function isOfferVerified(offer: Offer): boolean {
  return offer.isVerified && offer.verificationStatus === 'verified';
}

// Sample offers data with realistic content
export const sampleOffers: Offer[] = [
  {
    id: 'offer-001',
    userId: 'user-001',
    userName: '李明',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiMing',
    universityName: 'Stanford University',
    universityLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Stanford_University_seal_2010.svg/200px-Stanford_University_seal_2010.svg.png',
    universityCountry: 'USA',
    programName: 'MS Computer Science',
    degree: 'Master',
    admissionResult: 'admitted',
    scholarship: {
      amount: 28000,
      currency: 'USD',
      type: 'partial',
    },
    background: {
      gpa: '3.92/4.0',
      gre: '328',
      toefl: '108',
      ielts: '8.0',
      publications: 3,
      researchExperience: 2,
      internships: 3,
    },
    aiToolsUsed: ['ChatGPT', 'Claude', 'Perplexity', 'Consensus', 'Zotero AI'],
    timeline: '2025 Fall - Submitted Dec 2024, Result Feb 2025',
    advice: '我10月底才开始陶瓷，真的有点赶了。回想起来陶瓷太重要了——我申的professor里，有2个直接说"我们组今年不招人"，还有1个已读不回。GPA的话，我3.92够用但不算突出。ChatGPT确实帮我润色了PS的语法，但research interest全都是我自己做过的项目，面试时professor问起来我能说得很详细。文书这东西，AI能帮你把话说利索，但说不清楚你到底做了什么。',
    createdAt: '2026-05-15T10:30:00Z',
    likes: 156,
    comments: 23,

    isVerified: true,
    verificationStatus: 'verified',
    verifiedAt: '2026-05-10T10:00:00Z',
    verifiedBy: 'admin',
    verificationDocuments: ['offer_letter'],
  },
  {
    id: 'offer-002',
    userId: 'user-002',
    userName: '王雪',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WangXue',
    universityName: 'MIT',
    universityLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Massachusetts_Institute_of_Technology_logo.svg/200px-Massachusetts_Institute_of_Technology_logo.svg.png',
    universityCountry: 'USA',
    programName: 'PhD Electrical Engineering',
    degree: 'PhD',
    admissionResult: 'admitted',
    scholarship: {
      amount: 45000,
      currency: 'USD',
      type: 'full',
    },
    background: {
      gpa: '3.98/4.0',
      gre: '335',
      toefl: '112',
      ielts: '8.5',
      publications: 5,
      researchExperience: 4,
      internships: 2,
    },
    aiToolsUsed: ['ChatGPT', 'Claude', 'Overleaf AI', 'Connected Papers'],
    timeline: '2025 Fall - Submitted Nov 2024, Result Jan 2025',
    advice: '申MIT PhD那段时间我真的快秃了。推荐信我找了3个professor，其中2个是做过科研的，1个是上课的老师。PS我改了不下20稿，AI工具主要帮我检查语法和逻辑，但核心的研究思路全是我自己想的。面试的时候professor问得很细，我那个research proposal里的每一个点都能展开讲。感觉他们更看重你到底有没有独立做过研究，而不是你的GPA有多高。',
    createdAt: '2026-05-17T14:20:00Z',
    likes: 234,
    comments: 45,

    isVerified: true,
    verificationStatus: 'verified',
    verifiedAt: '2026-05-10T10:00:00Z',
    verifiedBy: 'admin',
    verificationDocuments: ['offer_letter', 'student_id'],
  },
  {
    id: 'offer-003',
    userId: 'user-003',
    userName: '张伟',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhangWei',
    universityName: 'University of Cambridge',
    universityLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/University_of_Cambridge_logo.svg/200px-University_of_Cambridge_logo.svg.png',
    universityCountry: 'UK',
    programName: 'MPhil Computer Science',
    degree: 'Master',
    admissionResult: 'admitted',
    scholarship: {
      amount: 20000,
      currency: 'GBP',
      type: 'partial',
    },
    background: {
      gpa: '3.85/4.0',
      gre: 'N/A',
      toefl: 'N/A',
      ielts: '7.5',
      publications: 2,
      researchExperience: 1,
      internships: 2,
    },
    aiToolsUsed: ['ChatGPT', 'Claude', 'DeepL Write'],
    timeline: '2025 Fall - Submitted Jan 2025, Result Mar 2025',
    advice: 'Cambridge的PS真的难写，我花了整整一个月。，英国学校很看PS的写作质量，不是简单罗列经历，而是要展现你的思考过程。Claude帮我改了语法，但PS里写的研究兴趣方向全是我自己定的——建议尽早想清楚自己到底想研究什么。另外雅思7.5只是门槛，我有个朋友刚好7分就被拒了。',
    createdAt: '2026-05-14T09:15:00Z',
    likes: 98,
    comments: 15,

    isVerified: false,
    verificationStatus: 'pending',
    verifiedAt: undefined,
    verifiedBy: undefined,
    verificationDocuments: [],
  },
  {
    id: 'offer-004',
    userId: 'user-004',
    userName: '陈思',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChenSi',
    universityName: 'ETH Zurich',
    universityLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/ETH_Zürich_logo.svg/200px-ETH_Zürich_logo.svg.png',
    universityCountry: 'Switzerland',
    programName: 'MS Robotics',
    degree: 'Master',
    admissionResult: 'admitted',
    scholarship: {
      amount: 12000,
      currency: 'CHF',
      type: 'partial',
    },
    background: {
      gpa: '3.90/4.0',
      gre: '320',
      toefl: '105',
      ielts: '7.0',
      publications: 1,
      researchExperience: 3,
      internships: 2,
    },
    aiToolsUsed: ['ChatGPT', 'Grammarly', 'Notion AI'],
    timeline: '2025 Fall - Submitted Dec 2024, Result Feb 2025',
    advice: 'ETH是我申请的学校里最看重课程匹配度的！我当时在官网把MS Robotics的必修课列表全看了一遍，发现我本科的课程覆盖率大概只有70%。为了补齐，我特意在PS里解释了我缺的那几门课打算怎么补。Research proposal我用ChatGPT帮忙组织语言，但核心内容都是我自己的研究想法。瑞士的消费不低，苏黎世一个月房租就要快2000 CHF了。',
    createdAt: '2026-05-12T16:45:00Z',
    likes: 87,
    comments: 12,

    isVerified: false,
    verificationStatus: 'none',
    verifiedAt: undefined,
    verifiedBy: undefined,
    verificationDocuments: [],
  },
  {
    id: 'offer-005',
    userId: 'user-005',
    userName: '刘洋',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiuYang',
    universityName: 'University of Toronto',
    universityLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Coat_of_arms_of_the_University_of_Toronto.svg/200px-Coat_of_arms_of_the_University_of_Toronto.svg.png',
    universityCountry: 'Canada',
    programName: 'MSc Computer Science',
    degree: 'Master',
    admissionResult: 'waitlisted',
    scholarship: {
      amount: 0,
      currency: 'CAD',
      type: 'none',
    },
    background: {
      gpa: '3.72/4.0',
      gre: '315',
      toefl: '100',
      ielts: '7.0',
      publications: 1,
      researchExperience: 2,
      internships: 1,
    },
    aiToolsUsed: ['ChatGPT', 'QuillBot', 'Connected Papers'],
    timeline: '2025 Fall - Submitted Feb 2025, Result pending',
    advice: '说实话被waitlisted那一刻我心态崩了，等结果的那两周我天天失眠。Toronto的MSc CS竞争真的很激烈，我GPA 3.72在里面不算高的。Appeal letter我写了三版，重点说明我最近又有什么新进展。最后能不能转正真的看运气，但我觉得能做的都做了，也算不留遗憾吧。',
    createdAt: '2026-05-10T11:20:00Z',
    likes: 45,
    comments: 8,

    isVerified: true,
    verificationStatus: 'verified',
    verifiedAt: '2026-05-10T10:00:00Z',
    verifiedBy: 'admin',
    verificationDocuments: ['offer_letter'],
  },
  {
    id: 'offer-006',
    userId: 'user-006',
    userName: '赵敏',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhaoMin',
    universityName: 'Carnegie Mellon University',
    universityLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Carnegie_Mellon_University_seal.svg/200px-Carnegie_Mellon_University_seal.svg.png',
    universityCountry: 'USA',
    programName: 'MS Machine Learning',
    degree: 'Master',
    admissionResult: 'rejected',
    scholarship: {
      amount: 0,
      currency: 'USD',
      type: 'none',
    },
    background: {
      gpa: '3.68/4.0',
      gre: '322',
      toefl: '106',
      ielts: '7.5',
      publications: 1,
      researchExperience: 1,
      internships: 2,
    },
    aiToolsUsed: ['ChatGPT', 'Claude', 'Kaggle Notebooks'],
    timeline: '2025 Fall - Submitted Jan 2025, Result Mar 2025',
    advice: '被CMU拒的时候我真的很难接受，感觉自己准备得很充分了。回想起来，可能是我科研经历太弱了——只有1篇publication还是投的workshop。CMU的ML每年录取的人大部分都有顶会论文，我那个背景在里面真的不够看。建议早点进实验室搬砖，别像我一样到大三下才想起来做科研。',
    createdAt: '2026-05-08T08:30:00Z',
    likes: 67,
    comments: 19,

    isVerified: true,
    verificationStatus: 'verified',
    verifiedAt: '2026-05-10T10:00:00Z',
    verifiedBy: 'admin',
    verificationDocuments: ['offer_letter', 'student_id'],
  },
  {
    id: 'offer-007',
    userId: 'user-007',
    userName: '孙浩',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SunHao',
    universityName: 'University of Edinburgh',
    universityLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/University_of_Edinburgh_logo.svg/200px-University_of_Edinburgh_logo.svg.png',
    universityCountry: 'UK',
    programName: 'MSc Artificial Intelligence',
    degree: 'Master',
    admissionResult: 'admitted',
    scholarship: {
      amount: 8000,
      currency: 'GBP',
      type: 'partial',
    },
    background: {
      gpa: '3.80/4.0',
      gre: 'N/A',
      toefl: 'N/A',
      ielts: '7.0',
      publications: 0,
      researchExperience: 2,
      internships: 1,
    },
    aiToolsUsed: ['ChatGPT', 'Claude', 'SciSpace'],
    timeline: '2025 Fall - Submitted Dec 2024, Result Feb 2025',
    advice: 'Edinburgh是我收到的第一个offer，那天晚上我激动得睡不着。雅思的话我考到7分刚好够线，但听说读写里我最怕口语。面试是skype进行的，ChatGPT帮我模拟了一些问题，但真正面试的时候教授问的专业问题比我想象的要深。RA position挺多的，建议早联系。',
    createdAt: '2026-05-06T13:00:00Z',
    likes: 112,
    comments: 17,

    isVerified: false,
    verificationStatus: 'pending',
    verifiedAt: undefined,
    verifiedBy: undefined,
    verificationDocuments: [],
  },
  {
    id: 'offer-008',
    userId: 'user-008',
    userName: '周婷',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhouTing',
    universityName: 'National University of Singapore',
    universityLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/NUS_logo.svg/200px-NUS_logo.svg.png',
    universityCountry: 'Singapore',
    programName: 'PhD Computer Science',
    degree: 'PhD',
    admissionResult: 'admitted',
    scholarship: {
      amount: 36000,
      currency: 'SGD',
      type: 'full',
    },
    background: {
      gpa: '3.95/4.0',
      gre: '328',
      toefl: '105',
      ielts: '8.0',
      publications: 4,
      researchExperience: 3,
      internships: 1,
    },
    aiToolsUsed: ['ChatGPT', 'Claude', 'Consensus', 'Elicit'],
    timeline: '2025 Fall - Submitted Oct 2024, Result Dec 2024',
    advice: 'NUS全奖PhD真的是我申请季的意外惊喜！我陶瓷了5个导师，只有2个回复，其中1个约了面试。方向匹配真的太重要了，我在PS里详细写了我之前做的项目和导师最近的研究有多契合。AI工具帮我快速读了大量文献，但找方向的时候我自己也花了很多时间。Singapore生活成本不低，但全奖cover房租和日常开销没问题。',
    createdAt: '2026-05-02T10:00:00Z',
    likes: 189,
    comments: 34,

    isVerified: false,
    verificationStatus: 'none',
    verifiedAt: undefined,
    verifiedBy: undefined,
    verificationDocuments: [],
  },
  {
    id: 'offer-009',
    userId: 'user-009',
    userName: '吴强',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WuQiang',
    universityName: 'University of California, Berkeley',
    universityLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Seal_of_the_University_of_California%2C_Berkeley.svg/200px-Seal_of_the_University_of_California%2C_Berkeley.svg.png',
    universityCountry: 'USA',
    programName: 'MEng EECS',
    degree: 'Master',
    admissionResult: 'admitted',
    scholarship: {
      amount: 15000,
      currency: 'USD',
      type: 'partial',
    },
    background: {
      gpa: '3.89/4.0',
      gre: '330',
      toefl: '110',
      ielts: 'N/A',
      publications: 2,
      researchExperience: 2,
      internships: 3,
    },
    aiToolsUsed: ['ChatGPT', 'Claude', 'GitHub Copilot', 'Phind'],
    timeline: '2025 Fall - Submitted Dec 2024, Result Mar 2025',
    advice: 'UCB MEng是就业导向的，不是研究型，这个一定要搞清楚再申请。我当时还在纠结要不要读博，后来觉得MEng更实用就改了方向。Copilot确实香，做project的时候效率高很多，但考试还是得自己老老实实学。GPA 3.89我感觉是够用的，没有想象中那么卷。',
    createdAt: '2026-05-13T15:30:00Z',
    likes: 145,
    comments: 28,

    isVerified: true,
    verificationStatus: 'verified',
    verifiedAt: '2026-05-10T10:00:00Z',
    verifiedBy: 'admin',
    verificationDocuments: ['offer_letter'],
  },
  {
    id: 'offer-010',
    userId: 'user-010',
    userName: '郑丽',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhengLi',
    universityName: 'University of Oxford',
    universityLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Oxford-University-Circlet.svg/200px-Oxford-University-Circlet.svg.png',
    universityCountry: 'UK',
    programName: 'MSc Applied Digital Health',
    degree: 'Master',
    admissionResult: 'admitted',
    scholarship: {
      amount: 0,
      currency: 'GBP',
      type: 'none',
    },
    background: {
      gpa: '3.75/4.0',
      gre: 'N/A',
      toefl: 'N/A',
      ielts: '7.5',
      publications: 1,
      researchExperience: 1,
      internships: 2,
    },
    aiToolsUsed: ['ChatGPT', 'Claude', 'Consensus'],
    timeline: '2025 Fall - Submitted Jan 2025, Result Apr 2025',
    advice: 'Oxford的digital health确实是新方向，我当时申的时候还有点犹豫怕太前沿了。Literature review我用AI工具帮忙整理文献，但写的时候发现这个领域其实发展很快，好多paper结论都不一致。雅思7.5是够的，但面试的时候教授问了我很多关于digital health的理解，不是简单背书就行。',
    createdAt: '2026-05-09T09:45:00Z',
    likes: 78,
    comments: 11,

    isVerified: true,
    verificationStatus: 'verified',
    verifiedAt: '2026-05-10T10:00:00Z',
    verifiedBy: 'admin',
    verificationDocuments: ['offer_letter', 'student_id'],
  },
  {
    id: 'offer-011',
    userId: 'user-011',
    userName: '黄磊',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HuangLei',
    universityName: 'Technical University of Munich',
    universityLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Logo_of_Technical_University_of_Munich_%28TUM%29.svg/200px-Logo_of_Technical_University_of_Munich_%28TUM%29.svg.png',
    universityCountry: 'Germany',
    programName: 'MS Data Engineering',
    degree: 'Master',
    admissionResult: 'admitted',
    scholarship: {
      amount: 0,
      currency: 'EUR',
      type: 'none',
    },
    background: {
      gpa: '3.82/4.0',
      gre: 'N/A',
      toefl: '95',
      ielts: '7.0',
      publications: 0,
      researchExperience: 1,
      internships: 2,
    },
    aiToolsUsed: ['ChatGPT', 'DeepL', 'Overleaf AI'],
    timeline: '2025 Winter - Submitted Mar 2025, Result May 2025',
    advice: 'TUM免学费这个真的太香了！我GPA 3.82申请德国其实不算高，但德国学校更看重课程内容。我本科CS的课和TUM的Data Engineering匹配度还行，就是在PS里解释了一下为什么想来德国。托福95刚好够线，DeepL翻译文书真的好用，比Google Translate准确多了。不过要吐槽的是，慕尼黑房租越来越贵了。',
    createdAt: '2026-05-01T12:00:00Z',
    likes: 93,
    comments: 16,

    isVerified: false,
    verificationStatus: 'pending',
    verifiedAt: undefined,
    verifiedBy: undefined,
    verificationDocuments: [],
  },
  {
    id: 'offer-012',
    userId: 'user-012',
    userName: '林峰',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LinFeng',
    universityName: 'University of Michigan',
    universityLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/University_of_Michigan_seal.svg/200px-University_of_Michigan_seal.svg.png',
    universityCountry: 'USA',
    programName: 'MS Robotics',
    degree: 'Master',
    admissionResult: 'admitted',
    scholarship: {
      amount: 22000,
      currency: 'USD',
      type: 'partial',
    },
    background: {
      gpa: '3.88/4.0',
      gre: '325',
      toefl: '107',
      ielts: 'N/A',
      publications: 2,
      researchExperience: 3,
      internships: 2,
    },
    aiToolsUsed: ['ChatGPT', 'Claude', 'Phind', 'Zotero AI'],
    timeline: '2025 Fall - Submitted Dec 2024, Result Feb 2025',
    advice: 'Umich是我收到的奖学金最高的offer，22000刀！RA位置确实多，我陶瓷了3个导师，有2个都回复了。邮件我先用ChatGPT写了个初稿，然后自己改的，不能直接用AI写的去套磁，太模板化了。GPA 3.88在里面算中上，不是最卷的。Umich冬天冷到哭，但学校中国学生挺多的，不至于太孤单。',
    createdAt: '2026-05-07T14:15:00Z',
    likes: 121,
    comments: 22,

    isVerified: false,
    verificationStatus: 'none',
    verifiedAt: undefined,
    verifiedBy: undefined,
    verificationDocuments: [],
  },
  {
    id: 'offer-013',
    userId: 'user-013',
    userName: '杨静',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=YangJing',
    universityName: 'HKUST',
    universityLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/HKUST_logo.svg/200px-HKUST_logo.svg.png',
    universityCountry: 'Hong Kong',
    programName: 'PhD Electronic Engineering',
    degree: 'PhD',
    admissionResult: 'admitted',
    scholarship: {
      amount: 28800,
      currency: 'HKD',
      type: 'full',
    },
    background: {
      gpa: '3.91/4.0',
      gre: '318',
      toefl: '102',
      ielts: '7.0',
      publications: 3,
      researchExperience: 2,
      internships: 1,
    },
    aiToolsUsed: ['ChatGPT', 'Claude', 'Zotero AI'],
    timeline: '2025 Fall - Submitted Nov 2024, Result Jan 2025',
    advice: '港科大PhD全奖真的香，28800 HKD一个月，在香港能活得挺滋润的。导师rank我认真研究过，用AI分析了每个导师近5年的paper，找了一个引用最高但今年还在招人的。面试的时候导师问了很多关于我之前项目的问题，还好我都提前准备了。GPA 3.91够用，但听说港科大现在越来越卷了。',
    createdAt: '2026-05-05T10:30:00Z',
    likes: 167,
    comments: 31,

    isVerified: true,
    verificationStatus: 'verified',
    verifiedAt: '2026-05-10T10:00:00Z',
    verifiedBy: 'admin',
    verificationDocuments: ['offer_letter'],
  },
  {
    id: 'offer-014',
    userId: 'user-014',
    userName: '马云飞',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MaYunFei',
    universityName: 'Tsinghua University',
    universityLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Tsinghua University.svg/200px-Tsinghua_University.svg.png',
    universityCountry: 'China',
    programName: 'PhD Computer Science',
    degree: 'PhD',
    admissionResult: 'admitted',
    scholarship: {
      amount: 60000,
      currency: 'CNY',
      type: 'full',
    },
    background: {
      gpa: '3.96/4.0',
      gre: 'N/A',
      toefl: 'N/A',
      ielts: '7.5',
      publications: 6,
      researchExperience: 4,
      internships: 0,
    },
    aiToolsUsed: ['ChatGPT', 'Claude', 'Wenxin', 'ZhiPu AI'],
    timeline: '2025 Fall - Submitted Sep 2024, Result Nov 2024',
    advice: '最后选了清华读博，其实也考虑过出国，但导师研究方向真的太匹配了。我用AI做了很详细的导师调研，把组里近3年的paper全看了。申6篇pub在这个圈子算入门水平吧，听说有的卷王研二就10篇了。陶瓷的时候要真诚，别用AI写的模板套话，导师一眼就能看出来。6万年薪在北京真的不多，但学校有宿舍。',
    createdAt: '2026-05-01T09:00:00Z',
    likes: 256,
    comments: 52,

    isVerified: true,
    verificationStatus: 'verified',
    verifiedAt: '2026-05-10T10:00:00Z',
    verifiedBy: 'admin',
    verificationDocuments: ['offer_letter', 'student_id'],
  },
  {
    id: 'offer-015',
    userId: 'user-015',
    userName: '刘婷',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiuTing',
    universityName: 'Georgia Tech',
    universityLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Georgia_Tech_seal.svg/200px-Georgia_Tech_seal.svg.png',
    universityCountry: 'USA',
    programName: 'MS Computer Science - Interactive Intelligence',
    degree: 'Master',
    admissionResult: 'admitted',
    scholarship: {
      amount: 18000,
      currency: 'USD',
      type: 'partial',
    },
    background: {
      gpa: '3.86/4.0',
      gre: '327',
      toefl: '109',
      ielts: 'N/A',
      publications: 1,
      researchExperience: 2,
      internships: 2,
    },
    aiToolsUsed: ['ChatGPT', 'Claude', 'GitHub Copilot', 'Midjourney'],
    timeline: '2025 Fall - Submitted Jan 2025, Result Mar 2025',
    advice: 'GT的Interactive Intelligence是我申请里最看重作品集的项目。我做了一个对话AI的小项目放在portfolio里，Midjourney帮忙生成了一些配图但只是装饰。面试的时候教授问了很多关于项目实现细节的问题，不是问理论。GPA 3.86在里面不算最高的，但感觉他们更看重你的project经历。Atlanta房租挺便宜的，一个月800刀能住得不错。',
    createdAt: '2026-05-11T11:45:00Z',
    likes: 134,
    comments: 25,

    isVerified: false,
    verificationStatus: 'pending',
    verifiedAt: undefined,
    verifiedBy: undefined,
    verificationDocuments: [],
  },
  {
    id: 'offer-016',
    userId: 'user-016',
    userName: '陈军',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChenJun',
    universityName: 'EPFL',
    universityLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/EPFL_logo.svg/200px-EPFL_logo.svg.png',
    universityCountry: 'Switzerland',
    programName: 'MS Computer Science',
    degree: 'Master',
    admissionResult: 'rejected',
    scholarship: {
      amount: 0,
      currency: 'CHF',
      type: 'none',
    },
    background: {
      gpa: '3.70/4.0',
      gre: '319',
      toefl: '100',
      ielts: '7.0',
      publications: 0,
      researchExperience: 1,
      internships: 1,
    },
    aiToolsUsed: ['ChatGPT', 'Claude'],
    timeline: '2025 Fall - Submitted Dec 2024, Result Feb 2025',
    advice: '被EPFL拒的时候其实有心理准备，毕竟我只有1段科研经历还是个课程项目。GPA 3.70在里面也不算高。回想起来，我应该gap一年好好做科研再申的。EPFL的CS是欧洲最难申的项目之一，听说每年录取的中国学生个位数。如果真的很想去，建议有至少2段扎实的科研经历再加一篇paper。',
    createdAt: '2026-05-04T16:00:00Z',
    likes: 56,
    comments: 14,

    isVerified: false,
    verificationStatus: 'none',
    verifiedAt: undefined,
    verifiedBy: undefined,
    verificationDocuments: [],
  },
  {
    id: 'offer-017',
    userId: 'user-017',
    userName: '王芳',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WangFang',
    universityName: 'University of Melbourne',
    universityLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/University_of_Melbourne_logo.svg/200px-University_of_Melbourne_logo.svg.png',
    universityCountry: 'Australia',
    programName: 'MS Data Science',
    degree: 'Master',
    admissionResult: 'admitted',
    scholarship: {
      amount: 15000,
      currency: 'AUD',
      type: 'partial',
    },
    background: {
      gpa: '3.78/4.0',
      gre: 'N/A',
      toefl: 'N/A',
      ielts: '6.5',
      publications: 0,
      researchExperience: 1,
      internships: 2,
    },
    aiToolsUsed: ['ChatGPT', 'Claude', 'Kaggle'],
    timeline: '2025 Fall - Submitted Feb 2025, Result Apr 2025',
    advice: '墨大是我申请季的保底，雅思6.5确实够了，我认识有个6分也收到了offer。technical interview我用ChatGPT帮忙准备了一些SQL和Python的问题，但真正问的还是那些基础内容。墨尔本生活成本不低，但学校会给部分奖学金，能减轻点压力。Data Science现在太卷了，建议早点准备。',
    createdAt: '2026-05-16T14:30:00Z',
    likes: 72,
    comments: 9,

    isVerified: true,
    verificationStatus: 'verified',
    verifiedAt: '2026-05-10T10:00:00Z',
    verifiedBy: 'admin',
    verificationDocuments: ['offer_letter'],
  },
];

// Sample comments for offers
export const sampleComments: OfferComment[] = [
  {
    id: 'comment-001',
    offerId: 'offer-001',
    userId: 'user-018',
    userName: '李华',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiHua',
    content: '恭喜！Stanford CS是梦校，请问GRE作文多少分？',
    createdAt: '2026-05-16T12:00:00Z',
    likes: 12,
  },
  {
    id: 'comment-002',
    offerId: 'offer-001',
    userId: 'user-019',
    userName: '张伟',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhangWei',
    content: '学长能分享一下套磁经验吗？',
    createdAt: '2026-05-16T14:30:00Z',
    likes: 8,
  },
  {
    id: 'comment-003',
    offerId: 'offer-002',
    userId: 'user-020',
    userName: '王磊',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WangLei',
    content: 'MIT全奖PhD太牛了！请问怎么准备科研计划？',
    createdAt: '2026-05-17T09:00:00Z',
    likes: 15,
  },
  {
    id: 'comment-004',
    offerId: 'offer-008',
    userId: 'user-021',
    userName: '刘洋',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiuYang',
    content: 'NUS全奖确实很香，请问生活成本高吗？',
    createdAt: '2026-05-03T11:00:00Z',
    likes: 10,
  },
  {
    id: 'comment-005',
    offerId: 'offer-014',
    userId: 'user-022',
    userName: '陈静',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChenJing',
    content: '清华CS博士好厉害！请问AI工具在科研中具体怎么用的？',
    createdAt: '2026-05-03T10:00:00Z',
    likes: 20,
  },
];

// Helper function to get offer by ID
export function getOfferById(id: string): Offer | undefined {
  return sampleOffers.find(offer => offer.id === id);
}

// Helper function to get comments for an offer
export function getCommentsByOfferId(offerId: string): OfferComment[] {
  return sampleComments.filter(comment => comment.offerId === offerId);
}

// Helper function to filter offers
export function filterOffers(filters: {
  country?: string;
  degree?: string;
  result?: string;
  scholarshipType?: string;
  searchQuery?: string;
}): Offer[] {
  return sampleOffers.filter(offer => {
    if (filters.country && offer.universityCountry !== filters.country) return false;
    if (filters.degree && offer.degree !== filters.degree) return false;
    if (filters.result && offer.admissionResult !== filters.result) return false;
    if (filters.scholarshipType && offer.scholarship.type !== filters.scholarshipType) return false;
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesUniversity = offer.universityName.toLowerCase().includes(query);
      const matchesProgram = offer.programName.toLowerCase().includes(query);
      if (!matchesUniversity && !matchesProgram) return false;
    }
    return true;
  });
}

// Helper function to sort offers
export function sortOffers(offers: Offer[], sortBy: 'newest' | 'hottest' | 'scholarship'): Offer[] {
  const sorted = [...offers];
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'hottest':
      return sorted.sort((a, b) => b.likes - a.likes);
    case 'scholarship':
      return sorted.sort((a, b) => b.scholarship.amount - a.scholarship.amount);
    default:
      return sorted;
  }
}

// Get unique countries from offers
export function getUniqueCountries(): string[] {
  return [...new Set(sampleOffers.map(offer => offer.universityCountry))];
}
