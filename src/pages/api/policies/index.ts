import type { APIRoute } from 'astro';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const prerender = false;

// Static fallback data - same as policies/index.astro
const STATIC_POLICIES = [
  { university_name: 'Harvard University', university_name_en: 'Harvard University', university_slug: 'harvard', country: '美国', region: 'Massachusetts', city: 'Cambridge', flag_emoji: '🇺🇸', qs_rank: 4, overall_policy: 'allowed', overall_summary: '允许在适当情况下使用AI工具', allowed_tools: ['ChatGPT', 'Claude', 'GitHub Copilot'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-03-20' },
  { university_name: 'MIT', university_name_en: 'MIT', university_slug: 'mit', country: '美国', region: 'Massachusetts', city: 'Cambridge', flag_emoji: '🇺🇸', qs_rank: 1, overall_policy: 'allowed', overall_summary: '允许使用AI工具但需披露', allowed_tools: ['ChatGPT', 'GitHub Copilot'], restricted_tools: ['Claude'], prohibited_tools: [], last_updated: '2024-03-15' },
  { university_name: 'Stanford University', university_name_en: 'Stanford University', university_slug: 'stanford', country: '美国', region: 'California', city: 'Stanford', flag_emoji: '🇺🇸', qs_rank: 5, overall_policy: 'allowed', overall_summary: '允许学生使用AI工具', allowed_tools: ['ChatGPT', 'Claude'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-02-20' },
  { university_name: 'University of Oxford', university_name_en: 'University of Oxford', university_slug: 'oxford', country: '英国', region: 'England', city: 'Oxford', flag_emoji: '🇬🇧', qs_rank: 3, overall_policy: 'prohibited', overall_summary: '禁止使用生成式AI完成作业', allowed_tools: [], restricted_tools: [], prohibited_tools: ['ChatGPT', 'Claude', 'Midjourney'], last_updated: '2024-03-01' },
  { university_name: 'University of Cambridge', university_name_en: 'University of Cambridge', university_slug: 'cambridge', country: '英国', region: 'England', city: 'Cambridge', flag_emoji: '🇬🇧', qs_rank: 2, overall_policy: 'allowed', overall_summary: '允许有限度使用AI工具', allowed_tools: ['ChatGPT', 'Claude'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-01-10' },
  { university_name: 'Princeton University', university_name_en: 'Princeton University', university_slug: 'princeton', country: '美国', region: 'New Jersey', city: 'Princeton', flag_emoji: '🇺🇸', qs_rank: 12, overall_policy: 'allowed', overall_summary: '允许使用AI作为学习辅助', allowed_tools: ['ChatGPT', 'Claude', 'GitHub Copilot'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-03-10' },
  { university_name: 'Yale University', university_name_en: 'Yale University', university_slug: 'yale', country: '美国', region: 'Connecticut', city: 'New Haven', flag_emoji: '🇺🇸', qs_rank: 11, overall_policy: 'allowed', overall_summary: '允许学生使用AI工具', allowed_tools: ['ChatGPT', 'Claude'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-02-28' },
  { university_name: 'Columbia University', university_name_en: 'Columbia University', university_slug: 'columbia', country: '美国', region: 'New York', city: 'New York', flag_emoji: '🇺🇸', qs_rank: 7, overall_policy: 'allowed', overall_summary: '允许使用AI辅助学习', allowed_tools: ['ChatGPT', 'Claude', 'GitHub Copilot'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-03-05' },
  { university_name: 'Cornell University', university_name_en: 'Cornell University', university_slug: 'cornell', country: '美国', region: 'New York', city: 'Ithaca', flag_emoji: '🇺🇸', qs_rank: 13, overall_policy: 'allowed', overall_summary: '允许使用AI工具', allowed_tools: ['ChatGPT', 'Claude', 'GitHub Copilot'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-02-15' },
  { university_name: 'Carnegie Mellon University', university_name_en: 'Carnegie Mellon University', university_slug: 'cmu', country: '美国', region: 'Pennsylvania', city: 'Pittsburgh', flag_emoji: '🇺🇸', qs_rank: 24, overall_policy: 'restricted', overall_summary: '部分学院限制使用AI', allowed_tools: ['GitHub Copilot'], restricted_tools: ['ChatGPT', 'Claude'], prohibited_tools: [], last_updated: '2024-03-12' },
  { university_name: 'Imperial College London', university_name_en: 'Imperial College London', university_slug: 'imperial', country: '英国', region: 'England', city: 'London', flag_emoji: '🇬🇧', qs_rank: 6, overall_policy: 'allowed', overall_summary: '允许使用AI辅助研究', allowed_tools: ['ChatGPT', 'Claude', 'GitHub Copilot'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-02-25' },
  { university_name: 'University of Edinburgh', university_name_en: 'University of Edinburgh', university_slug: 'edinburgh', country: '英国', region: 'Scotland', city: 'Edinburgh', flag_emoji: '🇬🇧', qs_rank: 15, overall_policy: 'allowed', overall_summary: '允许使用AI工具', allowed_tools: ['ChatGPT', 'Claude'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-03-08' },
  { university_name: 'University of Toronto', university_name_en: 'University of Toronto', university_slug: 'toronto', country: '加拿大', region: 'Ontario', city: 'Toronto', flag_emoji: '🇨🇦', qs_rank: 21, overall_policy: 'allowed', overall_summary: '允许使用AI辅助学习', allowed_tools: ['ChatGPT'], restricted_tools: ['Claude'], prohibited_tools: [], last_updated: '2024-03-10' },
  { university_name: 'University of British Columbia', university_name_en: 'University of British Columbia', university_slug: 'ubc', country: '加拿大', region: 'British Columbia', city: 'Vancouver', flag_emoji: '🇨🇦', qs_rank: 34, overall_policy: 'allowed', overall_summary: '允许学生使用AI工具', allowed_tools: ['ChatGPT', 'Claude', 'GitHub Copilot'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-02-18' },
  { university_name: 'McGill University', university_name_en: 'McGill University', university_slug: 'mcgill', country: '加拿大', region: 'Quebec', city: 'Montreal', flag_emoji: '🇨🇦', qs_rank: 32, overall_policy: 'allowed', overall_summary: '允许使用AI辅助工具', allowed_tools: ['ChatGPT', 'Claude'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-03-02' },
  { university_name: 'National University of Singapore', university_name_en: 'National University of Singapore', university_slug: 'nus', country: '新加坡', region: 'Singapore', city: 'Singapore', flag_emoji: '🇸🇬', qs_rank: 8, overall_policy: 'allowed', overall_summary: '允许使用AI工具', allowed_tools: ['ChatGPT', 'Claude'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-03-18' },
  { university_name: 'Nanyang Technological University', university_name_en: 'Nanyang Technological University', university_slug: 'ntu', country: '新加坡', region: 'Singapore', city: 'Singapore', flag_emoji: '🇸🇬', qs_rank: 26, overall_policy: 'allowed', overall_summary: '允许使用AI辅助学习', allowed_tools: ['ChatGPT', 'Claude', 'GitHub Copilot'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-02-15' },
  { university_name: 'University of Hong Kong', university_name_en: 'University of Hong Kong', university_slug: 'hku', country: '香港', region: 'Hong Kong', city: 'Hong Kong', flag_emoji: '🇭🇰', qs_rank: 17, overall_policy: 'allowed', overall_summary: '允许使用AI工具', allowed_tools: ['ChatGPT', 'Claude'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-03-15' },
  { university_name: 'Chinese University of Hong Kong', university_name_en: 'Chinese University of Hong Kong', university_slug: 'cuhk', country: '香港', region: 'Hong Kong', city: 'Hong Kong', flag_emoji: '🇭🇰', qs_rank: 36, overall_policy: 'allowed', overall_summary: '允许使用AI辅助学术工作', allowed_tools: ['ChatGPT', 'Claude', 'GitHub Copilot'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-02-28' },
  { university_name: 'ETH Zurich', university_name_en: 'ETH Zurich', university_slug: 'eth', country: '瑞士', region: 'Zurich', city: 'Zurich', flag_emoji: '🇨🇭', qs_rank: 9, overall_policy: 'allowed', overall_summary: '允许使用AI工具', allowed_tools: ['ChatGPT', 'Claude'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-01-25' },
  { university_name: 'University of Melbourne', university_name_en: 'University of Melbourne', university_slug: 'melbourne', country: '澳大利亚', region: 'Victoria', city: 'Melbourne', flag_emoji: '🇦🇺', qs_rank: 33, overall_policy: 'allowed', overall_summary: '允许在教师指导下使用AI', allowed_tools: ['ChatGPT', 'Claude', 'GitHub Copilot'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-02-20' },
  { university_name: 'University of Sydney', university_name_en: 'University of Sydney', university_slug: 'sydney', country: '澳大利亚', region: 'New South Wales', city: 'Sydney', flag_emoji: '🇦🇺', qs_rank: 37, overall_policy: 'allowed', overall_summary: '允许使用AI辅助学习', allowed_tools: ['ChatGPT', 'Claude'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-03-01' },
  { university_name: 'ANU', university_name_en: 'Australian National University', university_slug: 'anu', country: '澳大利亚', region: 'ACT', city: 'Canberra', flag_emoji: '🇦🇺', qs_rank: 27, overall_policy: 'allowed', overall_summary: '允许学生使用AI工具', allowed_tools: ['ChatGPT', 'Claude', 'GitHub Copilot'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-02-12' },
  { university_name: 'University of Tokyo', university_name_en: 'University of Tokyo', university_slug: 'utokyo', country: '日本', region: 'Tokyo', city: 'Tokyo', flag_emoji: '🇯🇵', qs_rank: 16, overall_policy: 'allowed', overall_summary: '允许使用AI辅助研究', allowed_tools: ['ChatGPT', 'Claude'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-03-10' },
  { university_name: 'Kyoto University', university_name_en: 'Kyoto University', university_slug: 'kyoto', country: '日本', region: 'Kyoto', city: 'Kyoto', flag_emoji: '🇯🇵', qs_rank: 18, overall_policy: 'allowed', overall_summary: '允许使用AI工具', allowed_tools: ['ChatGPT', 'Claude'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-02-25' },
  { university_name: 'KAIST', university_name_en: 'Korea Advanced Institute of Science and Technology', university_slug: 'kaist', country: '韩国', region: 'Daejeon', city: 'Daejeon', flag_emoji: '🇰🇷', qs_rank: 22, overall_policy: 'allowed', overall_summary: '允许使用AI辅助学习和研究', allowed_tools: ['ChatGPT', 'Claude', 'GitHub Copilot'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-03-05' },
  { university_name: 'Seoul National University', university_name_en: 'Seoul National University', university_slug: 'snu', country: '韩国', region: 'Seoul', city: 'Seoul', flag_emoji: '🇰🇷', qs_rank: 31, overall_policy: 'allowed', overall_summary: '允许使用AI工具', allowed_tools: ['ChatGPT', 'Claude'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-02-18' },
  { university_name: 'Tsinghua University', university_name_en: 'Tsinghua University', university_slug: 'tsinghua', country: '中国', region: 'Beijing', city: 'Beijing', flag_emoji: '🇨🇳', qs_rank: 10, overall_policy: 'allowed', overall_summary: '允许使用AI辅助学术工作', allowed_tools: ['ChatGPT', 'Claude', 'Wenxin Yiyan', 'Tongyi Qianwen'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-03-20' },
  { university_name: 'Peking University', university_name_en: 'Peking University', university_slug: 'pku', country: '中国', region: 'Beijing', city: 'Beijing', flag_emoji: '🇨🇳', qs_rank: 14, overall_policy: 'allowed', overall_summary: '允许使用AI辅助研究', allowed_tools: ['ChatGPT', 'Claude', 'Wenxin Yiyan'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-03-15' },
  { university_name: 'EPFL', university_name_en: 'École Polytechnique Fédérale de Lausanne', university_slug: 'epfl', country: '瑞士', region: 'Vaud', city: 'Lausanne', flag_emoji: '🇨🇭', qs_rank: 19, overall_policy: 'allowed', overall_summary: '允许使用AI辅助学习', allowed_tools: ['ChatGPT', 'Claude', 'GitHub Copilot'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-02-22' },
  { university_name: 'LMU Munich', university_name_en: 'Ludwig Maximilian University of Munich', university_slug: 'lmu', country: '德国', region: 'Bavaria', city: 'Munich', flag_emoji: '🇩🇪', qs_rank: 23, overall_policy: 'allowed', overall_summary: '允许使用AI工具', allowed_tools: ['ChatGPT', 'Claude'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-03-08' },
  { university_name: 'TU Delft', university_name_en: 'Delft University of Technology', university_slug: 'delft', country: '荷兰', region: 'South Holland', city: 'Delft', flag_emoji: '🇳🇱', qs_rank: 20, overall_policy: 'allowed', overall_summary: '允许使用AI辅助学习', allowed_tools: ['ChatGPT', 'Claude', 'GitHub Copilot'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-02-10' },
  { university_name: 'University of Manchester', university_name_en: 'University of Manchester', university_slug: 'manchester', country: '英国', region: 'England', city: 'Manchester', flag_emoji: '🇬🇧', qs_rank: 28, overall_policy: 'allowed', overall_summary: '允许使用AI工具', allowed_tools: ['ChatGPT', 'Claude', 'GitHub Copilot'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-03-12' },
  { university_name: 'UCL', university_name_en: 'University College London', university_slug: 'ucl', country: '英国', region: 'England', city: 'London', flag_emoji: '🇬🇧', qs_rank: 10, overall_policy: 'allowed', overall_summary: '允许使用AI辅助学术工作', allowed_tools: ['ChatGPT', 'Claude'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-03-18' },
  { university_name: "King's College London", university_name_en: "King's College London", university_slug: 'kcl', country: '英国', region: 'England', city: 'London', flag_emoji: '🇬🇧', qs_rank: 29, overall_policy: 'allowed', overall_summary: '允许学生使用AI工具', allowed_tools: ['ChatGPT', 'Claude'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-02-28' },
  { university_name: 'Waterloo University', university_name_en: 'University of Waterloo', university_slug: 'waterloo', country: '加拿大', region: 'Ontario', city: 'Waterloo', flag_emoji: '🇨🇦', qs_rank: 25, overall_policy: 'allowed', overall_summary: '允许使用AI辅助学习', allowed_tools: ['ChatGPT', 'Claude', 'GitHub Copilot'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-03-05' },
  { university_name: 'Monash University', university_name_en: 'Monash University', university_slug: 'monash', country: '澳大利亚', region: 'Victoria', city: 'Melbourne', flag_emoji: '🇦🇺', qs_rank: 38, overall_policy: 'allowed', overall_summary: '允许使用AI工具', allowed_tools: ['ChatGPT', 'Claude', 'GitHub Copilot'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-02-15' },
  { university_name: 'University of Queensland', university_name_en: 'University of Queensland', university_slug: 'uq', country: '澳大利亚', region: 'Queensland', city: 'Brisbane', flag_emoji: '🇦🇺', qs_rank: 30, overall_policy: 'allowed', overall_summary: '允许使用AI辅助学习', allowed_tools: ['ChatGPT', 'Claude'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-03-01' },
  { university_name: 'UNSW Sydney', university_name_en: 'University of New South Wales', university_slug: 'unsw', country: '澳大利亚', region: 'New South Wales', city: 'Sydney', flag_emoji: '🇦🇺', qs_rank: 35, overall_policy: 'allowed', overall_summary: '允许学生使用AI工具', allowed_tools: ['ChatGPT', 'Claude', 'GitHub Copilot'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-02-28' },
  { university_name: 'HKUST', university_name_en: 'Hong Kong University of Science and Technology', university_slug: 'hkust', country: '香港', region: 'Hong Kong', city: 'Hong Kong', flag_emoji: '🇭🇰', qs_rank: 40, overall_policy: 'allowed', overall_summary: '允许使用AI辅助学术工作', allowed_tools: ['ChatGPT', 'Claude', 'GitHub Copilot'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-03-10' },
  { university_name: 'Shanghai Jiao Tong University', university_name_en: 'Shanghai Jiao Tong University', university_slug: 'sjtu', country: '中国', region: 'Shanghai', city: 'Shanghai', flag_emoji: '🇨🇳', qs_rank: 39, overall_policy: 'allowed', overall_summary: '允许使用AI辅助研究', allowed_tools: ['ChatGPT', 'Claude', 'Wenxin Yiyan', 'Tongyi Qianwen'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-03-15' },
  { university_name: 'Fudan University', university_name_en: 'Fudan University', university_slug: 'fudan', country: '中国', region: 'Shanghai', city: 'Shanghai', flag_emoji: '🇨🇳', qs_rank: 42, overall_policy: 'allowed', overall_summary: '允许使用AI辅助学术工作', allowed_tools: ['ChatGPT', 'Claude', 'Wenxin Yiyan'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-03-12' },
  { university_name: 'Zhejiang University', university_name_en: 'Zhejiang University', university_slug: 'zju', country: '中国', region: 'Zhejiang', city: 'Hangzhou', flag_emoji: '🇨🇳', qs_rank: 44, overall_policy: 'allowed', overall_summary: '允许使用AI辅助学习', allowed_tools: ['ChatGPT', 'Claude', 'Wenxin Yiyan', 'Tongyi Qianwen'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-03-08' },
  { university_name: 'POSTECH', university_name_en: 'Pohang University of Science and Technology', university_slug: 'postech', country: '韩国', region: 'Pohang', city: 'Pohang', flag_emoji: '🇰🇷', qs_rank: 48, overall_policy: 'allowed', overall_summary: '允许使用AI辅助研究', allowed_tools: ['ChatGPT', 'Claude', 'GitHub Copilot'], restricted_tools: [], prohibited_tools: [], last_updated: '2024-02-20' },
];

export const GET: APIRoute = async ({ url }) => {
  const country = url.searchParams.get('country') || '';
  const search = url.searchParams.get('q') || '';
  const tool = url.searchParams.get('tool') || '';
  const overallPolicy = url.searchParams.get('policy') || '';

  // Fast fail if Supabase not configured
  if (!isSupabaseConfigured) {
    let data = STATIC_POLICIES;

    // Apply filters to static data
    if (country) {
      data = data.filter(p => p.country === country);
    }
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(p =>
        p.university_name.toLowerCase().includes(q) ||
        (p.university_name_en || '').toLowerCase().includes(q)
      );
    }
    if (overallPolicy) {
      data = data.filter(p => p.overall_policy === overallPolicy);
    }

    return new Response(JSON.stringify({
      success: true,
      data,
      meta: {
        total: data.length,
        returned: data.length,
        source: 'static',
        timestamp: new Date().toISOString(),
      },
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // CORS: Public read-only university policy data
        // This endpoint serves publicly available university AI policy information.
        // No authentication or sensitive data is involved.
        // Academic institution policies are meant to be publicly accessible.
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'index, follow',
      },
    });
  }

  // Supabase is configured - fetch from database
  const limit = parseInt(url.searchParams.get('limit') || '150', 10);

  try {
    let query = supabase
      .from('university_policies')
      .select('*')
      .order('qs_rank', { ascending: true })
      .limit(limit);

    if (country) {
      query = query.eq('country', country);
    }
    if (search) {
      const q = search.toLowerCase();
      query = query.or(`university_name.ilike.%${q}%,university_name_en.ilike.%${q}%`);
    }
    if (tool) {
      query = query.or(`allowed_tools.cs.{${tool}},prohibited_tools.cs.{${tool}}`);
    }
    if (overallPolicy) {
      query = query.eq('overall_policy', overallPolicy);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    const response = {
      success: true,
      data: data || [],
      meta: {
        total: count || (data?.length || 0),
        returned: data?.length || 0,
        source: 'database',
        timestamp: new Date().toISOString(),
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'index, follow',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to fetch university policies',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        // CORS: Allow cross-origin for error responses to help debugging
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};