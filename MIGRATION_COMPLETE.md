# ✅ Render 迁移完成

项目已成功从 Vercel 迁移到 Render 平台！

## 📦 已完成的更改

### 1. 依赖更新
- ✅ 移除 `@vercel/blob` → 使用 Supabase Storage
- ✅ 移除 `@vercel/postgres` → 使用 `pg` (标准 PostgreSQL 客户端)
- ✅ 移除 `@vercel/node` → 使用 Express
- ✅ 添加 `express`, `cors`, `pg`, `@supabase/supabase-js`

### 2. 服务器架构
- ✅ 创建 Express 服务器 (`server/index.ts`)
- ✅ 所有 API 路由转换为 Express 路由 (`server/routes/`)
- ✅ 支持静态文件服务和 SPA 路由

### 3. 数据库
- ✅ 替换 `@vercel/postgres` 为标准 `pg` 库
- ✅ 保持相同的 SQL 查询接口（兼容性）
- ✅ 支持 Render PostgreSQL 连接

### 4. 文件存储
- ✅ 创建 Supabase Storage 工具 (`lib/storage.ts`)
- ✅ 替换所有 Vercel Blob 上传为 Supabase Storage
- ✅ 更新前端上传函数 (`src/utils/upload.ts`)
- ✅ 更新所有文件上传调用

### 5. 前端更新
- ✅ 移除 `@vercel/blob/client` 导入
- ✅ 更新所有 `upload()` 调用为 `uploadFile()`
- ✅ 更新 URL 检测函数（Vercel → Supabase）
- ✅ 更新环境检测逻辑

### 6. 配置文件
- ✅ 创建 `render.yaml` 部署配置
- ✅ 创建 `README_RENDER.md` 部署指南

## 📁 文件结构

```
├── server/
│   ├── index.ts              # Express 服务器入口
│   └── routes/
│       ├── teams.ts          # 团队 API
│       ├── news.ts           # 新闻 API
│       ├── announcement.ts   # 公告 API
│       ├── upload.ts         # 文件上传 API
│       ├── blob-delete.ts    # 文件删除 API
│       ├── init.ts           # 数据库初始化 API
│       ├── migrate.ts        # 数据库迁移 API
│       └── test-env.ts       # 环境变量测试 API
├── lib/
│   ├── db.ts                 # 数据库工具（使用 pg）
│   └── storage.ts            # Supabase Storage 工具
├── src/
│   └── utils/
│       └── upload.ts         # 前端上传工具
├── render.yaml               # Render 部署配置
└── README_RENDER.md          # Render 部署指南
```

## 🔧 环境变量

需要在 Render Dashboard 配置以下环境变量：

```
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-supabase-anon-key
INIT_SECRET=aigc-init-2024
NODE_ENV=production
```

## 🚀 下一步

1. **安装依赖**：
   ```bash
   npm install
   ```

2. **创建 Supabase Storage**：
   - 注册 Supabase
   - 创建 bucket: `aigc-studio-uploads`
   - 设置为公开访问

3. **创建 Render PostgreSQL**：
   - 在 Render Dashboard 创建 PostgreSQL 数据库
   - 复制连接字符串

4. **初始化数据库**：
   ```sql
   -- 在 Render PostgreSQL 中执行
   \i lib/init-db.sql
   ```

5. **部署到 Render**：
   - 连接 GitHub 仓库
   - 配置环境变量
   - 部署服务

6. **初始化数据**：
   ```
   https://your-app.onrender.com/api/init?secret=aigc-init-2024
   ```

## ⚠️ 注意事项

1. **免费计划休眠**：Render 免费计划会在 15 分钟无活动后休眠
2. **首次访问慢**：休眠后首次访问需要 30-60 秒唤醒
3. **数据库迁移**：如果从 Vercel Postgres 迁移，需要导出/导入数据
4. **文件迁移**：如果从 Vercel Blob 迁移，需要手动上传文件到 Supabase

## 📚 相关文档

- [README_RENDER.md](./README_RENDER.md) - 详细部署指南
- [Render 文档](https://render.com/docs)
- [Supabase 文档](https://supabase.com/docs)

## ✨ 迁移完成！

所有代码已更新，可以开始部署到 Render 了！

