import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Storage 工具
 * 用于替代 Vercel Blob 存储
 */

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase 环境变量未配置，文件上传功能将不可用');
}

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

const BUCKET_NAME = 'aigc-studio-uploads';

/**
 * 上传文件到 Supabase Storage
 */
export async function uploadFile(
  file: File | Blob,
  path: string,
  options?: {
    contentType?: string;
    cacheControl?: string;
  }
): Promise<{ url: string }> {
  if (!supabase) {
    throw new Error('Supabase 未配置，请设置 SUPABASE_URL 和 SUPABASE_KEY 环境变量');
  }

  const fileExt = path.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      contentType: options?.contentType || 'image/jpeg',
      cacheControl: options?.cacheControl || '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`上传失败: ${error.message}`);
  }

  // 获取公共 URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return { url: publicUrl };
}

/**
 * 删除文件
 */
export async function deleteFile(url: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase 未配置');
  }

  // 从 URL 中提取文件路径
  // Supabase URL 格式: https://xxx.supabase.co/storage/v1/object/public/bucket-name/path/to/file
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split('/');
  const bucketIndex = pathParts.indexOf('public');
  if (bucketIndex === -1 || bucketIndex === pathParts.length - 1) {
    throw new Error('无效的 Supabase Storage URL');
  }

  const filePath = pathParts.slice(bucketIndex + 2).join('/'); // 跳过 'public' 和 bucket name

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    throw new Error(`删除失败: ${error.message}`);
  }
}

/**
 * 检查是否为 Supabase Storage URL
 */
export function isSupabaseUrl(url: string): boolean {
  return url.includes('supabase.co/storage') || url.includes('supabase.com/storage');
}

