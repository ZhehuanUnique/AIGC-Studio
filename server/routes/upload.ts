import { Router } from 'express';
import { uploadFile } from '../../lib/storage.js';

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
 * 文件上传接口
 * 使用 Supabase Storage 替代 Vercel Blob
 */
router.post('/', async (req, res) => {
  try {
    // 检查环境变量
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: 'Supabase 环境变量未配置，请设置 SUPABASE_URL 和 SUPABASE_KEY' 
      });
    }

    // 从请求中获取文件
    const { file, pathname } = req.body;

    if (!file || !pathname) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少 file 或 pathname' 
      });
    }

    // 将 base64 转换为 Buffer
    let fileBuffer: Buffer;
    let mimeType = 'image/jpeg';
    
    if (typeof file === 'string' && file.startsWith('data:')) {
      // Base64 数据 URL
      const matches = file.match(/data:([^;]+);base64,(.+)/);
      if (!matches) {
        return res.status(400).json({ 
          success: false, 
          message: '无效的 base64 数据格式' 
        });
      }
      mimeType = matches[1] || 'image/jpeg';
      const base64Data = matches[2];
      fileBuffer = Buffer.from(base64Data, 'base64');
    } else {
      return res.status(400).json({ 
        success: false, 
        message: '不支持的文件格式，需要 base64 数据 URL' 
      });
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(mimeType)) {
      return res.status(400).json({ 
        success: false, 
        message: '不支持的文件类型，仅支持图片格式' 
      });
    }

    // 将 Buffer 转换为 Blob（用于 Supabase）
    const fileBlob = new Blob([fileBuffer], { type: mimeType });

    // 上传到 Supabase Storage
    const result = await uploadFile(fileBlob, pathname, {
      contentType: mimeType
    });

    return res.status(200).json({
      url: result.url
    });
  } catch (error: any) {
    console.error('上传失败:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || '上传失败' 
    });
  }
});

export default router;

