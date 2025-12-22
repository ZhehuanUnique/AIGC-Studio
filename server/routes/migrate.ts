import { Router } from 'express';
import { sql } from '../../lib/db.js';

const router = Router();

router.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

router.post('/', async (req, res) => {
  try {
    const migrations: Array<{ name: string; statements: Array<() => Promise<any>> }> = [
      {
        name: '添加作品字段 (unfinished_works, finished_works)',
        statements: [
          async () => await sql`ALTER TABLE teams ADD COLUMN IF NOT EXISTS unfinished_works JSONB DEFAULT '[]'`,
          async () => await sql`ALTER TABLE teams ADD COLUMN IF NOT EXISTS finished_works JSONB DEFAULT '[]'`
        ]
      },
      {
        name: '添加费用记录字段 (consumption_records)',
        statements: [
          async () => await sql`ALTER TABLE teams ADD COLUMN IF NOT EXISTS consumption_records JSONB DEFAULT '[]'`
        ]
      }
    ];

    const results = [];
    let successCount = 0;
    let skippedCount = 0;

    for (const migration of migrations) {
      try {
        // 执行迁移 SQL 语句
        for (const statement of migration.statements) {
          await statement();
        }
        results.push({
          name: migration.name,
          status: 'success',
          message: '迁移执行成功'
        });
        successCount++;
      } catch (error: any) {
        // 如果错误是因为列已存在，视为成功（跳过）
        const errorMsg = error.message || error.toString() || '';
        if (errorMsg.includes('already exists') || 
            errorMsg.includes('duplicate column') ||
            (errorMsg.includes('column') && errorMsg.includes('already'))) {
          results.push({
            name: migration.name,
            status: 'skipped',
            message: '字段已存在，跳过'
          });
          skippedCount++;
        } else {
          results.push({
            name: migration.name,
            status: 'error',
            message: errorMsg || '迁移失败'
          });
        }
      }
    }

    const allSuccess = results.every(r => r.status === 'success' || r.status === 'skipped');

    return res.status(200).json({
      success: allSuccess,
      message: allSuccess 
        ? `迁移完成：${successCount} 个成功，${skippedCount} 个跳过`
        : '部分迁移失败',
      results
    });
  } catch (error: any) {
    console.error('数据库迁移失败:', error);
    return res.status(500).json({
      success: false,
      message: error.message || '迁移失败',
      error: error.toString()
    });
  }
});

router.get('/', async (req, res) => {
  return res.status(200).json({
    success: true,
    message: '请使用 POST 方法执行迁移'
  });
});

export default router;

