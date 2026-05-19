// Offer data model matching the interface from ARCHITECTURE.md
export type VerificationStatus = 'verified' | 'pending' | 'rejected' | 'none';

export interface Offer {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  universityName: string;
  universityLogo: string;
  universityCountry: string;
  programName: string;
  degree: 'Master' | 'PhD' | 'Postdoc';
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
    advice: '强烈建议提前联系导师，科研经历比GPA更重要。ChatGPT帮我润色文书但核心ideas必须是自己写的。',
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
    advice: 'PhD申请科研计划和推荐信最关键。AI工具主要用于文献阅读和初稿打磨，核心研究思路必须原创。',
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
    advice: '英国学校很看重PS的写作质量，Claude对语法和表达帮助很大。但research interest一定要自己明确。',
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
    advice: 'ETH对课程匹配度要求很高，建议提前在官网看课程设置。AI工具帮我准备了很专业的research proposal。',
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
    advice: '虽然被waitlisted但还有希望！AI工具帮我准备了很详细的appeal letter。',
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
    advice: 'CMU的ML竞争太激烈了，GPA不够高。建议大家早做准备，提升科研经历真的很重要。',
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
    advice: '爱丁堡AI专业很强，雅思7分就够了。ChatGPT帮我模拟了面试，效果不错。',
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
    advice: 'NUS全奖PhD很香！导师方向匹配度是第一位的。AI工具帮我快速筛选了大量文献。',
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
    advice: 'UCB的MEng是professional degree，不像PhD那么研究导向。Copilot在编程作业中帮了大忙！',
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
    advice: '牛津的digital health是新兴方向，发展前景很好。AI工具在写 literature review 时效率提升明显。',
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
    advice: '德国免学费真的很香！TUM的Data Engineering很实践导向。DeepL翻译文书质量很高。',
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
    advice: 'Umich的Robotics很强，RA位置多。联系导师时AI帮我准备了很专业的邮件。',
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
    advice: '港科大PhD全奖性价比很高！导师rank很重要，AI帮我分析了各位导师的recent papers。',
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
    advice: '国内读博也很香！导师选择要慎重，AI工具帮我做了很详细的导师调研和套磁信。',
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
    advice: 'GT的II方向很注重实践，作品集很重要。Midjourney帮我生成了一些创意素材用在文书里。',
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
    advice: 'EPFL竞争非常激烈，尤其是CS。建议大家多积累科研经验再申请。',
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
    advice: '墨大data science对雅思要求不高，6.5够用了。AI工具帮我准备了technical interview。',
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
