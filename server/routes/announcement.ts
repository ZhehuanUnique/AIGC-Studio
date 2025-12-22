import { Router } from 'express';
import { getAnnouncement, updateAnnouncement } from '../../lib/db.js';

const router = Router();

router.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

router.get('/', async (req, res) => {
  try {
    const announcement = await getAnnouncement();
    return res.status(200).json({ success: true, data: announcement });
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
    const { content } = req.body;
    if (typeof content !== 'string') {
      return res.status(400).json({ success: false, message: '无效的内容' });
    }
    await updateAnnouncement(content);
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

