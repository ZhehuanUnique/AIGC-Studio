import { Router } from 'express';
import { getTeams, updateTeam, deleteTeam } from '../../lib/db.js';

const router = Router();

// 设置 CORS 头
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
    const teams = await getTeams();
    return res.status(200).json({ success: true, data: teams });
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
    const team = req.body;
    console.log(`[API] 收到更新请求 - 团队 ${team?.id}:`, {
      hasUnfinishedWorks: !!(team?.unfinishedWorks || team?.unfinished_works),
      hasFinishedWorks: !!(team?.finishedWorks || team?.finished_works),
      unfinishedCount: (team?.unfinishedWorks || team?.unfinished_works || []).length,
      finishedCount: (team?.finishedWorks || team?.finished_works || []).length
    });
    await updateTeam(team);
    console.log(`[API] 更新完成 - 团队 ${team?.id}`);
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
    const id = (req.query?.id as string) || (req.body?.id as string);
    if (!id) {
      return res.status(400).json({ success: false, message: '缺少 id' });
    }
    await deleteTeam(id);
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

