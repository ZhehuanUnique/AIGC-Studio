# 🚀 Render 部署指南

本项目已从 Vercel 迁移到 Render 平台。

## 📋 前置要求

1. **Render 账号**：注册 [Render](https://render.com)
2. **PostgreSQL 数据库**：Render 提供免费 PostgreSQL（90 天试用）
3. **Supabase 账号**：用于文件存储（免费 1GB）

## 🔧 部署步骤

### 1. 创建 PostgreSQL 数据库

1. 登录 Render Dashboard
2. 点击 **"New +"** → **"PostgreSQL"**
3. 填写信息：
   - **Name**: `aigc-studio-db`
   - **Database**: `aigc_studio`
   - **User**: 自动生成
   - **Region**: 选择离你最近的区域
4. 点击 **"Create Database"**
5. 复制 **Internal Database URL**（格式：`postgresql://user:password@host:port/database`）

### 2. 创建 Supabase Storage

1. 注册 [Supabase](https://supabase.com)
2. 创建新项目
3. 进入 **Storage** → **Create Bucket**
   - **Name**: `aigc-studio-uploads`
   - **Public**: ✅ 勾选（允许公开访问）
4. 进入 **Settings** → **API**
   - 复制 **Project URL** → 作为 `SUPABASE_URL`
   - 复制 **anon public** key → 作为 `SUPABASE_KEY`

### 3. 初始化数据库

使用 Render PostgreSQL 的 Web Shell 或本地连接执行：

```bash
# 连接数据库
psql <你的 DATABASE_URL>

# 执行初始化脚本
\i lib/init-db.sql
```

或者使用 Render Dashboard 的 **"Connect"** → **"psql"** 直接执行 SQL。

### 4. 部署到 Render

#### 方法 A：通过 GitHub（推荐）

1. 将代码推送到 GitHub
2. 在 Render Dashboard 点击 **"New +"** → **"Web Service"**
3. 连接你的 GitHub 仓库
4. 配置：
   - **Name**: `aigc-studio`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`（或选择付费计划）

#### 方法 B：通过 Render CLI

```bash
# 安装 Render CLI
npm install -g render-cli

# 登录
render login

# 部署
render deploy
```

### 5. 配置环境变量

在 Render Dashboard → 你的服务 → **Environment** 添加：

```
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-supabase-anon-key
INIT_SECRET=aigc-init-2024
NODE_ENV=production
```

### 6. 初始化数据

部署完成后，访问：

```
https://your-app.onrender.com/api/init?secret=aigc-init-2024
```

这将初始化团队、新闻和公告数据。

### 7. 执行数据库迁移（如果需要）

```
https://your-app.onrender.com/api/migrate
```

## 🔍 验证部署

1. **检查环境变量**：
   ```
   https://your-app.onrender.com/api/test-env
   ```

2. **检查数据库连接**：
   - 访问网站，应该能看到数据

3. **测试文件上传**：
   - 尝试上传头像或图片，检查是否成功

## 📝 注意事项

### Render 免费计划限制

- ⚠️ **休眠机制**：15 分钟无活动后服务会休眠
- ⚠️ **首次访问慢**：休眠后首次访问需要 30-60 秒唤醒
- 💡 **解决方案**：
  - 使用付费计划（$7/月起）避免休眠
  - 使用外部监控服务定期 ping 你的网站（如 UptimeRobot）

### 数据库迁移

如果从 Vercel Postgres 迁移数据：

1. 导出 Vercel Postgres 数据
2. 导入到 Render PostgreSQL
3. 更新 `DATABASE_URL` 环境变量

### 文件存储迁移

如果从 Vercel Blob 迁移文件：

1. 下载所有 Vercel Blob 文件
2. 上传到 Supabase Storage
3. 更新数据库中的 URL 引用

## 🆘 故障排查

### 问题：服务无法启动

- 检查 `DATABASE_URL` 是否正确
- 检查构建日志是否有错误
- 确保 `npm start` 命令正确

### 问题：数据库连接失败

- 检查 `DATABASE_URL` 格式
- 确保数据库已创建
- 检查网络连接（Render 内部网络）

### 问题：文件上传失败

- 检查 `SUPABASE_URL` 和 `SUPABASE_KEY`
- 确保 Supabase Storage bucket 已创建且为公开
- 检查浏览器控制台错误

## 📚 相关文档

- [Render 文档](https://render.com/docs)
- [Supabase Storage 文档](https://supabase.com/docs/guides/storage)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)

## 🎉 完成！

部署完成后，你的应用将在 `https://your-app.onrender.com` 运行。

如有问题，请查看 Render Dashboard 的日志或联系支持。

