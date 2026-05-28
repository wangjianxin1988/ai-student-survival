// Avatar Upload API - upload avatar to Supabase Storage
export const prerender = false;

import type { APIRoute } from 'astro';
import { supabaseAdmin, supabaseUrl } from '@/lib/supabase';
import { getServerUser } from '@/lib/server-auth';

// POST /api/users/avatar - upload avatar image
export const POST: APIRoute = async ({ request }) => {
  const serverUser = await getServerUser(request);
  if (!serverUser) {
    return new Response(
      JSON.stringify({ success: false, error: { message: '请先登录' } }),
      { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: { message: '请选择文件' } }),
        { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|png|jpg|webp)$/)) {
      return new Response(
        JSON.stringify({ success: false, error: { message: '只支持 JPG、PNG 和 WebP 格式' } }),
        { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ success: false, error: { message: '图片大小不能超过 2MB' } }),
        { status: 400, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const filePath = `avatars/${serverUser.id}.${ext}`;

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('user-uploads')
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('[avatar] Upload error:', uploadError);
      return new Response(
        JSON.stringify({ success: false, error: { message: '头像上传失败，请稍后重试' } }),
        { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('user-uploads')
      .getPublicUrl(filePath);

    const avatarUrl = urlData?.publicUrl || `${supabaseUrl}/storage/v1/object/public/user-uploads/${filePath}`;

    return new Response(
      JSON.stringify({ success: true, url: avatarUrl }),
      { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  } catch (err) {
    console.error('[avatar] Error:', err);
    return new Response(
      JSON.stringify({ success: false, error: { message: '上传失败' } }),
      { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
    );
  }
};
