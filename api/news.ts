import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getNews, addNews, updateNews, deleteNews } from '../lib/db.js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // 获取所有新闻
      const news = await getNews();
      return res.status(200).json({ success: true, data: news });
    } else if (req.method === 'POST') {
      // 添加新闻
      const newsItem = req.body;
      await addNews(newsItem);
      return res.status(200).json({ success: true });
    } else if (req.method === 'PUT') {
      // 更新新闻
      const newsItem = req.body;
      await updateNews(newsItem);
      return res.status(200).json({ success: true });
    } else if (req.method === 'DELETE') {
      // 删除新闻
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, message: '缺少 ID' });
      }
      await deleteNews(id);
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

