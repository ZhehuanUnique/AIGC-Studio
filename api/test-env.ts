import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * 测试环境变量是否可用
 */
export default async function handler(
  _req: VercelRequest,
  res: VercelResponse
) {
  const envVars = {
    hasPostgresUrl: !!process.env.POSTGRES_URL,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasPgHost: !!process.env.PGHOST,
    hasPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
    // 显示前10个字符（安全）
    postgresUrlPrefix: process.env.POSTGRES_URL?.substring(0, 10) || 'undefined',
    databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 10) || 'undefined',
    allEnvKeys: Object.keys(process.env).filter(key => 
      key.includes('POSTGRES') || key.includes('DATABASE') || key.startsWith('PG')
    ),
  };

  return res.status(200).json({
    success: true,
    env: envVars,
  });
}

