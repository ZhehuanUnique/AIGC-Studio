-- 迁移脚本：为现有数据库添加 consumption_records 列
-- 在 Vercel Postgres SQL Editor 中执行此脚本

ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS consumption_records JSONB DEFAULT '[]';

