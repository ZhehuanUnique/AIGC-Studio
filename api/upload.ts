import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleUpload } from '@vercel/blob/client';

/**
 * Vercel Blob 直传握手接口（前端 upload() 会调用这里）
 *
 * 部署到 Vercel 后请配置环境变量：
 * - BLOB_READ_WRITE_TOKEN（Vercel Blob 提供）
 *
 * 说明：
 * - 前端上传图片 -> Blob 得到一个 URL
 * - 数据库只保存 URL，避免 Base64 导致请求体过大 / 数据行过大
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: '方法不允许' });

  // 检查环境变量
  const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;
  if (!hasBlobToken) {
    console.error('BLOB_READ_WRITE_TOKEN 环境变量未配置');
    return res.status(500).json({ 
      success: false, 
      message: 'BLOB_READ_WRITE_TOKEN 环境变量未配置，请检查 Vercel 项目设置中的环境变量配置' 
    });
  }

  try {
    // 确保环境变量存在
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return res.status(500).json({ 
        success: false, 
        message: 'BLOB_READ_WRITE_TOKEN 未配置' 
      });
    }

    const json = await handleUpload({
      request: req,
      body: req.body,
      onBeforeGenerateToken: async (pathname: string, clientPayload?: string) => {
        console.log('生成 token for:', pathname);
        // 只允许图片
        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
          ],
          tokenPayload: JSON.stringify({ pathname }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('上传完成:', blob.url);
      },
    });

    return res.status(200).json(json);
  } catch (error: any) {
    console.error('upload handler error:', error);
    console.error('错误详情:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      tokenExists: !!process.env.BLOB_READ_WRITE_TOKEN
    });
    return res.status(500).json({ 
      success: false, 
      message: error?.message || '上传初始化失败',
      details: error?.message
    });
  }
}




