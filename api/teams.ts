import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTeams, updateTeam, deleteTeam } from '../lib/db.js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 设置 CORS 头（允许跨域）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // 获取所有团队数据
      const teams = await getTeams();
      return res.status(200).json({ success: true, data: teams });
    } else if (req.method === 'PUT') {
      // 更新团队数据
      const team = req.body;
      await updateTeam(team);
      return res.status(200).json({ success: true });
    } else if (req.method === 'DELETE') {
      const id = (req.query?.id as string) || (req.body?.id as string);
      if (!id) {
        return res.status(400).json({ success: false, message: '缺少 id' });
      }
      await deleteTeam(id);
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

