import { Router } from 'express';

const router = Router();

router.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

/**
 * 测试环境变量是否可用
 */
router.get('/', async (req, res) => {
  const envVars = {
    hasPostgresUrl: !!process.env.POSTGRES_URL,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasPgHost: !!process.env.PGHOST,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_KEY,
    // 显示前10个字符（安全）
    postgresUrlPrefix: process.env.POSTGRES_URL?.substring(0, 10) || 'undefined',
    databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 10) || 'undefined',
    supabaseUrlPrefix: process.env.SUPABASE_URL?.substring(0, 10) || 'undefined',
    allEnvKeys: Object.keys(process.env).filter(key => 
      key.includes('POSTGRES') || 
      key.includes('DATABASE') || 
      key.includes('SUPABASE') ||
      key.startsWith('PG')
    ),
  };

  return res.status(200).json({
    success: true,
    env: envVars,
  });
});

export default router;

