import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

/**
 * 数据库连接测试 API
 * 用于诊断数据库连接问题
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // 测试数据库连接
    const result = await sql`SELECT NOW() as current_time`;
    
    // 测试表是否存在
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    return res.status(200).json({ 
      success: true, 
      message: '数据库连接成功！',
      currentTime: result.rows[0].current_time,
      tables: tables.rows.map(t => t.table_name),
      env: {
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        hasPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
      }
    });
  } catch (error: any) {
    console.error('数据库连接测试失败:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || '数据库连接失败',
      stack: error.stack
    });
  }
}

