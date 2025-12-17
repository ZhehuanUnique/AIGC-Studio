import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAnnouncement, updateAnnouncement } from '../lib/db';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // 获取公告
      const announcement = await getAnnouncement();
      return res.status(200).json({ success: true, data: announcement });
    } else if (req.method === 'PUT') {
      // 更新公告
      const { content } = req.body;
      if (typeof content !== 'string') {
        return res.status(400).json({ success: false, message: '无效的内容' });
      }
      await updateAnnouncement(content);
      return res.status(200).json({ success: true });
    } else {
      return res.status(405).json({ success: false, message: '方法不允许' });
    }
  } catch (error: any) {
    console.error('API 错误:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || '服务器错误' 
    });
  }
}

