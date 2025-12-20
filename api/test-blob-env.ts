import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * 测试 Blob 环境变量是否配置
 */
export default async function handler(
  _req: VercelRequest,
  res: VercelResponse
) {
  const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;
  const tokenPrefix = process.env.BLOB_READ_WRITE_TOKEN?.substring(0, 10) || 'undefined';
  
  return res.status(200).json({
    success: true,
    hasBlobToken,
    tokenPrefix,
    message: hasBlobToken 
      ? '✅ BLOB_READ_WRITE_TOKEN 已配置' 
      : '❌ BLOB_READ_WRITE_TOKEN 未配置',
    allBlobKeys: Object.keys(process.env).filter(key => 
      key.includes('BLOB') || key.includes('BLOB')
    ),
  });
}


