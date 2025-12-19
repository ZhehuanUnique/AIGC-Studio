-- AIGC Console 数据库初始化脚本
-- 在 Vercel Postgres 控制台中执行此脚本

-- 1. 创建团队表
CREATE TABLE IF NOT EXISTS teams (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  icon_key VARCHAR(20) NOT NULL DEFAULT 'default',
  task TEXT,
  cycle VARCHAR(50),
  workload VARCHAR(50),
  budget INTEGER DEFAULT 0,
  actual_cost INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'normal',
  notes TEXT,
  cover_image TEXT,
  images JSONB DEFAULT '[]',
  links JSONB DEFAULT '[]',
  unfinished_works JSONB DEFAULT '[]',
  finished_works JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 创建成员表
CREATE TABLE IF NOT EXISTS members (
  id VARCHAR(50) PRIMARY KEY,
  team_id VARCHAR(50) NOT NULL,
  name VARCHAR(50) NOT NULL,
  is_director BOOLEAN DEFAULT FALSE,
  avatar TEXT,
  role VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- 3. 创建待办事项表
CREATE TABLE IF NOT EXISTS todos (
  id VARCHAR(50) PRIMARY KEY,
  team_id VARCHAR(50) NOT NULL,
  text TEXT NOT NULL,
  done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- 4. 创建新闻表
CREATE TABLE IF NOT EXISTS news (
  id VARCHAR(50) PRIMARY KEY,
  date VARCHAR(20) NOT NULL,
  type VARCHAR(20) NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  title TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. 创建公告表
CREATE TABLE IF NOT EXISTS announcement (
  id INTEGER PRIMARY KEY,
  content TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_members_team_id ON members(team_id);
CREATE INDEX IF NOT EXISTS idx_todos_team_id ON todos(team_id);
CREATE INDEX IF NOT EXISTS idx_news_date ON news(date);
CREATE INDEX IF NOT EXISTS idx_news_type ON news(type);

-- 插入默认公告
INSERT INTO announcement (id, content) VALUES (1, '🎉 通告：V16 全功能版已上线！包含任务清单与费用管理模块。HMR 热更新测试成功！')
ON CONFLICT (id) DO NOTHING;

-- 可选：插入初始数据
-- 如果需要插入初始团队和新闻数据，请在 Vercel 控制台中手动执行，或使用 /api/init API 端点

