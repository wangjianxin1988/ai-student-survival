#!/usr/bin/env node
/**
 * Standalone seed script - run with:
 *   SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/re-seed-questions.js
 *
 * Or set the key as environment variable and run:
 *   SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/re-seed-questions.js
 */
import '@supabase/supabase-js';

const SUPABASE_URL = 'https://giynvpfnzzelzwpmsgtf.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Inline the questions data that matches the file
const questionsData = [
  { id: 'q-001', titleZh: '如何避免论文抄袭嫌疑？', contentZh: '我正在写硕士论文，Turnitin查重搞得我睡不着觉。有时候明明标注了引用还是被标红，真的很无语。想问问大家有什么实操经验吗？', category: 'academic', tags: ['thesis', 'plagiarism', 'academic-writing'], answerCount: 4, viewCount: 1256, createdAt: '2026-05-15T10:30:00+00:00' },
  { id: 'q-002', titleZh: '英国留学怎么办理银行卡？', contentZh: '下个月就要去英国了，听说开户超级麻烦？我朋友，光准备材料就跑了三趟银行。想问问有没有什么坑可以避免的，哪些银行对中国学生比较友好？', category: 'life', tags: ['banking', 'UK', 'international-student'], answerCount: 3, viewCount: 892, createdAt: '2026-05-14T14:20:00+00:00' },
  { id: 'q-003', titleZh: '美国F1签证可以工作吗？', contentZh: '我是F1签证，想课余打点工但完全不知道边界在哪。听说有人打黑工被遣返了，吓死我了。到底什么情况算违法啊？', category: 'visa', tags: ['F1-visa', 'work-authorization', 'USA'], answerCount: 5, viewCount: 2103, createdAt: '2026-05-13T09:15:00+00:00' },
  { id: 'q-004', titleZh: '怎么找到校内兼职？', contentZh: '我口语烂得要死，想找个校内的活练练英语顺便挣点零花钱。图书馆、食堂都试过了，职位少得可怜而且竞争贼激烈。还有什么别的路子吗？', category: 'job', tags: ['part-time-job', 'campus-employment'], answerCount: 3, viewCount: 1567, createdAt: '2026-05-12T16:45:00+00:00' },
  { id: 'q-005', titleZh: '租房合同要注意什么？', contentZh: '第一次在国外租房，中介给的那份合同密密麻麻全是英文，看得我头都大了。听说有人被坑了几千磅押金，求问有什么必须盯死的条款？', category: 'life', tags: ['rental-contract', 'housing', 'renting-tips'], answerCount: 6, viewCount: 2341, createdAt: '2026-05-11T11:30:00+00:00' },
  { id: 'q-006', titleZh: '如何选择论文硕士和授课型硕士？', contentZh: '申请季被这个问题搞死了。有人说授课型水，有人说论文型难毕业。我之后想读博但又怕论文写不出来，到底该怎么选啊？有没有过来人说说真实感受？', category: 'academic', tags: ['master-program', 'thesis', 'career-choice'], answerCount: 4, viewCount: 1876, createdAt: '2026-05-10T08:00:00+00:00' },
  { id: 'q-007', titleZh: 'CPT是什么？和OPT有什么区别？', contentZh: '被CPT和OPT搞晕了，看了一堆帖子还是懵的。听说CPT用多了会影响OPT？这是真的吗？有没有人能用人话解释一下这两个到底怎么用？', category: 'visa', tags: ['CPT', 'OPT', 'work-authorization', 'USA'], answerCount: 5, viewCount: 3204, createdAt: '2026-05-09T13:20:00+00:00' },
  { id: 'q-008', titleZh: '如何写一份有吸引力的实习申请简历？', contentZh: '投了20多份简历出去，石沉大海连个拒信都没有。怀疑人生了，到底是简历问题还是我太菜了？那些收到面试的是怎么写简历的？', category: 'job', tags: ['CV', 'internship', 'job-application'], answerCount: 3, viewCount: 1432, createdAt: '2026-05-08T10:00:00+00:00' },
  { id: 'q-009', titleZh: '留学在外想家了怎么办？', contentZh: '出国两个月了，最近真的快绷不住了。晚上一个人躺着就想哭，书也看不进去。跟爸妈视频反而更难受。真的有办法熬过去吗？', category: 'life', tags: ['homesickness', 'mental-health', 'adjustment'], answerCount: 5, viewCount: 987, createdAt: '2026-05-07T20:15:00+00:00' },
  { id: 'q-010', titleZh: '英国陪读签证有什么要求？', contentZh: '老公要去英国读博了，我想跟着去但不知道陪读签证怎么办。我能过去打工吗？听说还要存好几个月的存款证明？', category: 'visa', tags: ['dependent-visa', 'UK', 'spouse-visa'], answerCount: 4, viewCount: 1765, createdAt: '2026-05-06T15:30:00+00:00' },
  { id: 'q-011', titleZh: '如何准备科技公司的技术面试？', contentZh: '下周有家大厂的技术面，算法题我还能背背，但系统设计完全没头绪。有人说要看几十篇论文，真的假的？有没有什么速成的方法啊？', category: 'job', tags: ['technical-interview', 'coding-interview', 'tech-industry'], answerCount: 4, viewCount: 2543, createdAt: '2026-05-05T09:45:00+00:00' },
  { id: 'q-012', titleZh: '如何找到便宜的教材和课程资料？', contentZh: '刚看了一下课本价格，一本书1200块人民币，抢钱呢？我房贷都没这么重。有没有什么买到便宜书的路子，或者能不能用电子版替代啊？', category: 'academic', tags: ['textbooks', 'cost-saving', 'course-materials'], answerCount: 3, viewCount: 876, createdAt: '2026-05-04T14:00:00+00:00' },
  { id: 'q-013', titleZh: '转学怎么办理？', contentZh: '现在这个学校真的待不下去了，老师上课念PPT，考试题目跟讲的完全没关系。想转学但不知道之前的学分能不能带走，会不会白读一年？', category: 'academic', tags: ['university-transfer', 'credits', 'academic-process'], answerCount: 2, viewCount: 1234, createdAt: '2026-05-03T11:20:00+00:00' },
  { id: 'q-014', titleZh: '学生如何建立职业人脉？', contentZh: '总听说network多重要，但我一个学生上哪去认识行业大佬？LinkedIn发消息人家都不理我的。硬着头皮去参加meetup也不知道说什么，很尬。', category: 'job', tags: ['networking', 'professional-development', 'career'], answerCount: 4, viewCount: 1654, createdAt: '2026-05-02T16:40:00+00:00' },
  { id: 'q-015', titleZh: '如果挂科了怎么办？', contentZh: '我死了，这学期必修课挂了。教授说只有重修一条路，但下学期这门课不开...我签证会不会有问题啊？感觉天都要塌了。', category: 'academic', tags: ['course-failure', 'academic-probation', 'graduation'], answerCount: 5, viewCount: 2876, createdAt: '2026-05-01T08:30:00+00:00' },
  { id: 'q-016', titleZh: '留学生怎么办理手机套餐？', contentZh: '刚落地手机就没信号了，国际漫游贵得吓人。想问问各位当地用什么运营商套餐啊？听说有那种几十块人民币一个月的卡，靠谱吗？', category: 'life', tags: ['mobile-plan', 'SIM-card', 'communication'], answerCount: 3, viewCount: 743, createdAt: '2026-04-30T10:15:00+00:00' },
  { id: 'q-017', titleZh: '学生签证可以去其他申根国家旅行吗？', contentZh: '我在法国拿的留学签证，想趁假期去周边国家玩一圈。听说申根区可以随便走，但到底是怎么个说法？要提前申请什么吗？', category: 'visa', tags: ['Schengen', 'travel', 'student-visa', 'Europe'], answerCount: 4, viewCount: 1987, createdAt: '2026-04-29T13:45:00+00:00' },
  { id: 'q-018', titleZh: '如何转学分？从其他大学转学分流程', contentZh: '我在原来的学校读了一年半了，想转学到排名更高的。这个学分转过来能认多少啊？会不会很多课都白学了？', category: 'academic', tags: ['credit-transfer', 'university-transfer', 'academic'], answerCount: 3, viewCount: 1456, createdAt: '2026-04-01T10:00:00+00:00' },
  { id: 'q-019', titleZh: '如何找到校外的房子？租房攻略', contentZh: '受够了宿舍的破条件，下学期想搬出去住。校外的房子水太深了，看了好几个都是坑。有什么平台比较靠谱吗？或者直接找房东租那种？', category: 'life', tags: ['housing', 'off-campus', 'rental', 'apartment'], answerCount: 5, viewCount: 2134, createdAt: '2026-04-27T14:30:00+00:00' },
  { id: 'q-020', titleZh: '如何申请OPT？详细步骤是什么？', contentZh: '我是25年12月的毕业生，听说OPT申请超级复杂，材料一堆还容易出错。能不能来个真实的申请流程，怕自己弄砸了。', category: 'visa', tags: ['OPT', 'F1-visa', 'work-authorization', 'USA', 'graduation'], answerCount: 6, viewCount: 4532, createdAt: '2026-04-26T09:15:00+00:00' },
  { id: 'q-021', titleZh: '如何提高英语学术写作能力？', contentZh: '我英语口语溜得飞起，但一写论文就卡壳。那个从句套从句的写法真的学不来，有什么捷径吗？还是说只能慢慢磨？', category: 'academic', tags: ['academic-writing', 'English', 'essay', 'research-paper'], answerCount: 4, viewCount: 1876, createdAt: '2026-04-02T11:20:00+00:00' },
  { id: 'q-022', titleZh: '如何应对难相处的教授？', contentZh: '我一个教授，不知道是不是看我不顺眼。上课点名专门跳过我，邮件从来不回，期末给我打了個C。明明我成绩比某些本地学生还好。这事能投诉吗？', category: 'academic', tags: ['professor', 'relationship', 'academic', 'conflict'], answerCount: 5, viewCount: 2341, createdAt: '2026-04-24T16:45:00+00:00' },
  { id: 'q-023', titleZh: '国际学生最好的健康保险是什么？', contentZh: '学校保险贵死了，一年要3000多刀。但听说外面的私人保险不靠谱，看病的时候各种不报销。到底怎么选啊？', category: 'life', tags: ['health-insurance', 'insurance', 'medical', 'healthcare'], answerCount: 4, viewCount: 1654, createdAt: '2026-04-23T13:00:00+00:00' },
  { id: 'q-024', titleZh: '作为国际学生如何建立信用分数？', contentZh: '刚来美国，听说信用分数很重要，以后租房买车都看这个。但我什么都没有，从零开始要怎么弄啊？有哪些信用卡适合留学生的？', category: 'life', tags: ['credit-score', 'credit-card', 'banking', 'USA'], answerCount: 5, viewCount: 1987, createdAt: '2026-04-03T10:30:00+00:00' },
  { id: 'q-025', titleZh: '如何在短时间内备考GRE？', contentZh: '只剩两个月了，GRE完全没开始准备。我底子还行，但词汇量真的崩。有人说刷题就行，有人说要背单词，到底怎么分配时间最合理？', category: 'academic', tags: ['GRE', 'test-preparation', 'standardized-test', 'graduate-school'], answerCount: 4, viewCount: 2543, createdAt: '2026-04-21T08:45:00+00:00' },
  { id: 'q-026', titleZh: '本科生如何找到研究机会？', contentZh: '我本科就想进实验室，但是不知道自己配不配。给教授发邮件会不会很冒昧啊？一般教授会要本科生吗？', category: 'academic', tags: ['research', 'undergraduate', 'professor', 'research-opportunity'], answerCount: 5, viewCount: 3210, createdAt: '2026-04-04T15:20:00+00:00' },
  { id: 'q-027', titleZh: '研究生如何管理工作与生活的平衡？', contentZh: '我研究生读得快疯掉了。导师天天催进度，作业写不完，实验没结果，还想有点个人生活。周末不加班就良心过不去。怎么破？', category: 'academic', tags: ['work-life-balance', 'graduate-student', 'time-management', 'burnout'], answerCount: 6, viewCount: 1876, createdAt: '2026-04-19T11:00:00+00:00' },
  { id: 'q-028', titleZh: '如何谈判实习薪资？', contentZh: '我拿到一个实习offer，但开的工资比我预期的低20%。我应该试着谈谈吗？会不会显得我很贪心直接收回offer啊？', category: 'job', tags: ['internship', 'salary-negotiation', 'job-offer', 'negotiation'], answerCount: 4, viewCount: 1432, createdAt: '2026-04-05T09:30:00+00:00' },
  { id: 'q-029', titleZh: '写长篇论文时如何保持动力？', contentZh: '博士第三年了，论文才写了一半。每天对着电脑发呆，导师发消息都不想回。感觉自己在一个黑洞里，怎么办啊？', category: 'academic', tags: ['dissertation', 'phd', 'motivation', 'research'], answerCount: 5, viewCount: 1654, createdAt: '2026-04-06T14:15:00+00:00' },
  { id: 'q-030', titleZh: '从零开始学习编程的最佳资源是什么？', contentZh: '我是纯文科生，连Excel都玩不转那种。想学编程但完全零基础，看网上推荐一堆根本不知道从哪下手。Python真的适合我吗？', category: 'academic', tags: ['programming', 'python', 'learning', 'beginner', 'cs'], answerCount: 6, viewCount: 2876, createdAt: '2026-04-16T16:00:00+00:00' },
  { id: 'q-031', titleZh: '如何申请中国政府奖学金（CSC）？', contentZh: '我想申请CSC奖学金留学中国，但流程看起来超级复杂。那个网站全是中文看不太懂，有没有成功申请过的说说具体怎么弄？', category: 'policy', tags: ['CSC', 'scholarship', 'Chinese-government', 'funding'], answerCount: 5, viewCount: 3456, createdAt: '2026-04-07T09:00:00+00:00' },
  { id: 'q-032', titleZh: '中国留学生有哪些签证免签政策？', contentZh: '听说最近很多国家对中国留学生免签了？我想趁假期出去浪一圈但不知道哪些地方可以说走就走。有没有最新的清单？', category: 'policy', tags: ['visa-free', 'policy', 'travel', 'international-student'], answerCount: 4, viewCount: 2345, createdAt: '2026-04-08T14:30:00+00:00' },
  { id: 'q-033', titleZh: '如何从海外支付学费到中国大学？', contentZh: '我在国外，要给中国的大学打学费。那个银行手续费高得离谱，转一次收了将近1000块。还有没有便宜点的办法啊？', category: 'payment', tags: ['tuition', 'payment', 'wire-transfer', 'banking'], answerCount: 3, viewCount: 1876, createdAt: '2026-04-13T10:15:00+00:00' },
  { id: 'q-034', titleZh: '奖学金什么时候发放？', contentZh: '我申请到奖学金了，但都过去两个月了还没收到钱。问了学校就让我等，到底要等多久啊？有没有一个大概的时间表？', category: 'payment', tags: ['scholarship', 'disbursement', 'payment', 'funding'], answerCount: 2, viewCount: 1234, createdAt: '2026-04-09T11:45:00+00:00' },
  { id: 'q-035', titleZh: '有哪些好的学术写作AI辅助工具？', contentZh: '我写论文写到头秃，想找个AI工具帮帮忙。Grammarly我用了，但感觉只能检查语法。有没有更强大的，能帮忙改写和润色的？', category: 'academic', tags: ['AI-writing', 'academic-tools', 'grammar', 'productivity'], answerCount: 6, viewCount: 4321, createdAt: '2026-04-11T16:20:00+00:00' },
  { id: 'q-036', titleZh: '如何有效使用ChatGPT学习新语言？', contentZh: '我想用ChatGPT练中文，但每次就是问个"你好用中文怎么说"就没了。感觉在浪费这个工具，有什么正确的打开方式吗？', category: 'academic', tags: ['ChatGPT', 'language-learning', 'AI', 'Chinese'], answerCount: 4, viewCount: 2987, createdAt: '2026-04-10T09:30:00+00:00' },
  { id: 'q-037', titleZh: '如何平衡学业和社交生活？', contentZh: '我学业忙得要死，社交活动完全没时间。朋友约我出去我都在赶作业，长此以往感觉要没朋友了。大家都是怎么平衡的啊？', category: 'study_life', tags: ['time-management', 'social-life', 'balance', 'university-life'], answerCount: 5, viewCount: 1567, createdAt: '2026-04-09T15:00:00+00:00' },
  { id: 'q-038', titleZh: '如何与中国本地学生交朋友？', contentZh: '我试过加入本地学生的圈子，但他们之间用方言聊天我完全听不懂，下课就散了。感觉融不进去，有点孤单。', category: 'study_life', tags: ['friendship', 'social', 'local-students', 'integration'], answerCount: 4, viewCount: 2345, createdAt: '2026-04-08T13:30:00+00:00' },
  { id: 'q-039', titleZh: '如何准备校园招聘面试？', contentZh: '秋招来了，阿里腾讯字节都要来我们学校。我之前完全没准备过面试，现在慌得一批。有没有什么短期内能提升的面试技巧？', category: 'job_recruitment', tags: ['campus-recruitment', 'interview', 'tech-companies', 'job-hunting'], answerCount: 5, viewCount: 3210, createdAt: '2026-04-07T10:00:00+00:00' },
  { id: 'q-040', titleZh: '面试时应该问什么问题？', contentZh: '每次面试到最后问我有什么问题要问，我脑子就一片空白。硬挤出个"团队氛围怎么样"感觉蠢死了。有没有真正加分的反问？', category: 'job_recruitment', tags: ['interview-questions', 'job-interview', 'career-advice'], answerCount: 3, viewCount: 1876, createdAt: '2026-04-06T14:45:00+00:00' },
  { id: 'q-041', titleZh: '如何申请中国留学生工作签证？', contentZh: '我快毕业了，想留在国内工作。听说要办工作签证特别麻烦，还要找公司担保。到底整个流程是怎样的啊？', category: 'policy', tags: ['work-visa', 'post-study', 'China', 'employment'], answerCount: 4, viewCount: 2876, createdAt: '2026-04-05T09:15:00+00:00' },
  { id: 'q-042', titleZh: '使用AI写作助手安全吗？', contentZh: '我看到有人用AI写论文被抓了，学位都没了。但我认识几个人天天用也没事。到底会不会被检测出来啊？我有点慌。', category: 'academic', tags: ['AI-detection', 'academic-integrity', 'essay-writing', 'ethics'], answerCount: 7, viewCount: 4567, createdAt: '2026-04-04T11:30:00+00:00' },
  { id: 'q-043', titleZh: '外国学生如何开通支付宝/微信支付？', contentZh: '来中国留学才发现这里出门根本不用现金，但我是外国银行卡绑不上啊。支付宝微信支付开通麻不麻烦？', category: 'payment', tags: ['Alipay', 'WeChat-Pay', 'mobile-payment', 'digital-wallet'], answerCount: 4, viewCount: 2134, createdAt: '2026-04-03T16:00:00+00:00' },
  { id: 'q-044', titleZh: '如何加入学生社团和组织？', contentZh: '我想加几个社团不然简历太空白了。但学校社团一大堆，眼花缭乱的。怎么知道哪个靠谱啊？加太多会不会影响学习？', category: 'study_life', tags: ['clubs', 'student-organizations', 'campus-activities', 'extracurricular'], answerCount: 3, viewCount: 1234, createdAt: '2026-04-02T10:30:00+00:00' },
  { id: 'q-045', titleZh: '如何写求职 Cover Letter？', contentZh: '简历我会写，但Cover Letter真的难到我了。中英文版本都试过，不是太假就是太空。HR到底想看什么啊？', category: 'job_recruitment', tags: ['cover-letter', 'job-application', 'resume', 'career'], answerCount: 4, viewCount: 1654, createdAt: '2026-04-01T14:15:00+00:00' },
];

function mapCategory(qCat) {
  const map = {
    academic: 'academic', life: 'life', visa: 'visa', job: 'job',
    policy: 'policy', payment: 'payment', ai_tools: 'academic',
    study_life: 'study_life', job_recruitment: 'job_recruitment', other: 'discussion',
  };
  return map[qCat] || 'discussion';
}

async function main() {
  if (!SERVICE_ROLE_KEY) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    console.log('Get it from: https://supabase.com/dashboard/project/giynvpfnzzelzwpmsgtf/settings/api');
    process.exit(1);
  }

  console.log('Connecting to Supabase...');
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Get all current Q&A post IDs (both q-XXX and UUID format)
  const qIds = questionsData.map(q => q.id);
  const { data: existing, error: fetchErr } = await supabase
    .from('community_posts')
    .select('id')
    .in('id', qIds);

  if (fetchErr) {
    console.error('Error fetching existing posts:', fetchErr);
    process.exit(1);
  }

  console.log(`Found ${existing?.length || 0} existing posts to handle`);

  // Delete existing posts with these IDs
  if (existing && existing.length > 0) {
    const existingIds = existing.map(p => p.id);
    console.log(`Deleting ${existingIds.length} existing posts...`);
    const { error: deleteErr } = await supabase
      .from('community_posts')
      .delete()
      .in('id', existingIds);
    if (deleteErr) {
      console.error('Delete error:', deleteErr);
      process.exit(1);
    }
    console.log('Deleted successfully.');
  }

  // Also delete the UUID-format posts (00000000-...) that were previously seeded
  const { data: uuidPosts } = await supabase
    .from('community_posts')
    .select('id')
    .like('id', '0000%')
    .limit(100);
  if (uuidPosts && uuidPosts.length > 0) {
    console.log(`Deleting ${uuidPosts.length} UUID-format posts...`);
    await supabase.from('community_posts').delete().in('id', uuidPosts.map(p => p.id));
  }

  // Insert with q-XXX IDs
  const posts = questionsData.map((q) => ({
    id: q.id,
    user_id: '7fa8052c-4d62-4ec6-947d-9d49ba927b76',
    title: q.titleZh,
    content: q.contentZh,
    excerpt: q.contentZh.substring(0, 150),
    category: mapCategory(q.category),
    tags: q.tags,
    images: [],
    likes_count: Math.floor(Math.random() * 20) + 1,
    comments_count: q.answerCount,
    views_count: q.viewCount,
    favorites_count: Math.floor(Math.random() * 10),
    is_pinned: false,
    is_locked: false,
    auto_promoted: false,
    status: 'published',
    created_at: q.createdAt,
    updated_at: q.createdAt,
  }));

  console.log(`Inserting ${posts.length} posts with q-XXX IDs...`);
  const { data, error: insertErr } = await supabase
    .from('community_posts')
    .insert(posts)
    .select('id');

  if (insertErr) {
    console.error('Insert error:', insertErr);
    process.exit(1);
  }

  console.log(`\n✅ Success! Seeded ${posts.length} posts.`);
  console.log('Post IDs:', data.map(p => p.id).join(', '));
}

main().catch(e => { console.error(e); process.exit(1); });
