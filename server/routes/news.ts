import { Router } from 'express';
import { getNews, addNews, updateNews, deleteNews } from '../../lib/db.js';

const router = Router();

router.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

router.get('/', async (req, res) => {
  try {
    const news = await getNews();
    return res.status(200).json({ success: true, data: news });
  } catch (error: any) {
    console.error('API 错误:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || '服务器错误' 
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const newsItem = req.body;
    await addNews(newsItem);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('API 错误:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || '服务器错误' 
    });
  }
});

router.put('/', async (req, res) => {
  try {
    const newsItem = req.body;
    await updateNews(newsItem);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('API 错误:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || '服务器错误' 
    });
  }
});

router.delete('/', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: '缺少 ID' });
    }
    await deleteNews(id);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('API 错误:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || '服务器错误' 
    });
  }
});

export default router;

