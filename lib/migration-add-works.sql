-- 数据库迁移脚本：添加作品字段
-- 如果数据库已经存在，执行此脚本添加新字段

-- 添加未完成作品和已完成作品字段
ALTER TABLE teams 
ADD COLUMN IF NOT EXISTS unfinished_works JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS finished_works JSONB DEFAULT '[]';

