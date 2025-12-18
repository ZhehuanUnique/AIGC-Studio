import type { VercelRequest, VercelResponse } from '@vercel/node';
import { del } from '@vercel/blob';

/**
 * 删除 Vercel Blob 上的文件（通过 URL）
 *
 * 前端用于：上传新图后删除旧图、移除图库图片时删除对应 blob
 *
 * 需要环境变量：
 * - BLOB_READ_WRITE_TOKEN
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: '方法不允许' });

  try {
    const { url } = (req.body || {}) as { url?: string };
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, message: '缺少 url' });
    }

    // 只允许删除 Vercel Blob URL，防止误删外部资源
    const isBlobUrl =
      url.includes('.blob.vercel-storage.com') ||
      url.includes('vercel-storage.com') ||
      url.includes('blob.vercel.com');
    if (!isBlobUrl) {
      return res.status(400).json({ success: false, message: '仅允许删除 Vercel Blob 的 URL' });
    }

    await del(url);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Blob 删除失败:', error);
    return res.status(500).json({ success: false, message: error.message || '删除失败' });
  }
}


