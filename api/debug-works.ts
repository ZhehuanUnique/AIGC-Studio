import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../lib/db.js';

/**
 * 调试端点：查看数据库中的作品数据
 * 访问：/api/debug-works?teamId=xxx
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const teamId = req.query.teamId as string;
    
    if (teamId) {
      // 查询特定团队
      const { rows } = await sql`
        SELECT 
          id,
          title,
          unfinished_works,
          finished_works,
          updated_at
        FROM teams
        WHERE id = ${teamId}
      `;
      
      return res.status(200).json({
        success: true,
        team: rows[0] || null,
        raw_unfinished: rows[0]?.unfinished_works,
        raw_finished: rows[0]?.finished_works,
        unfinished_type: typeof rows[0]?.unfinished_works,
        finished_type: typeof rows[0]?.finished_works,
        unfinished_is_array: Array.isArray(rows[0]?.unfinished_works),
        finished_is_array: Array.isArray(rows[0]?.finished_works)
      });
    } else {
      // 查询所有团队的作品数据
      const { rows } = await sql`
        SELECT 
          id,
          title,
          unfinished_works,
          finished_works,
          updated_at
        FROM teams
        ORDER BY updated_at DESC
        LIMIT 10
      `;
      
      return res.status(200).json({
        success: true,
        teams: rows.map(row => ({
          id: row.id,
          title: row.title,
          unfinished_works: row.unfinished_works,
          finished_works: row.finished_works,
          unfinished_count: Array.isArray(row.unfinished_works) ? row.unfinished_works.length : 'not array',
          finished_count: Array.isArray(row.finished_works) ? row.finished_works.length : 'not array',
          updated_at: row.updated_at
        }))
      });
    }
  } catch (error: any) {
    console.error('调试查询失败:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}


