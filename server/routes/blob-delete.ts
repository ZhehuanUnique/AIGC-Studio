import { Router } from 'express';
import { deleteFile, isSupabaseUrl } from '../../lib/storage.js';

const router = Router();

router.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

/**
 * 删除文件接口
 * 使用 Supabase Storage 替代 Vercel Blob
 */
router.post('/', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, message: '缺少 url' });
    }

    // 只允许删除 Supabase Storage URL
    if (!isSupabaseUrl(url)) {
      return res.status(400).json({ 
        success: false, 
        message: '仅允许删除 Supabase Storage 的 URL' 
      });
    }

    await deleteFile(url);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('删除失败:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || '删除失败' 
    });
  }
});

export default router;

