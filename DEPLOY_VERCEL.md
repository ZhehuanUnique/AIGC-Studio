# 🚀 Vercel 部署指南

## ✅ 代码已准备就绪

项目已成功构建，所有代码已更新并准备好部署到 Vercel。

## 📋 部署步骤

### 方法一：通过 Vercel Dashboard（推荐）

1. **登录 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 **"Add New..."** → **"Project"**
   - 选择你的 GitHub 仓库 `AIGC-Studio`
   - 点击 **"Import"**

3. **配置项目**
   - **Framework Preset**: Vite（自动检测）
   - **Build Command**: `npm run build`（已配置）
   - **Output Directory**: `dist`（已配置）
   - **Install Command**: `npm install`（默认）

4. **配置环境变量**
   在 **Environment Variables** 中添加：
   
   ```
   DATABASE_URL=postgresql://...
   BLOB_READ_WRITE_TOKEN=vercel_blob_xxx...
   ```
   
   > 💡 如果项目已存在，在 **Settings** → **Environment Variables** 中配置

5. **部署**
   - 点击 **"Deploy"**
   - 等待构建完成（约 2-3 分钟）

### 方法二：通过 Vercel CLI

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录**
   ```bash
   vercel login
   ```

3. **部署**
   ```bash
   vercel
   ```
   
   首次部署会询问：
   - Set up and deploy? **Yes**
   - Which scope? 选择你的账号
   - Link to existing project? **No**（首次）或 **Yes**（已有项目）
   - Project name: `aigc-studio`
   - Directory: `./`（当前目录）
   - Override settings? **No**

4. **配置环境变量**
   ```bash
   vercel env add DATABASE_URL
   vercel env add BLOB_READ_WRITE_TOKEN
   ```

5. **生产环境部署**
   ```bash
   vercel --prod
   ```

## 🔧 环境变量配置

### 1. DATABASE_URL（必需）

**获取方式：**
1. Vercel Dashboard → 你的项目 → **Storage**
2. 创建或选择 **Postgres** 数据库
3. 复制 **Connection String**（格式：`postgresql://...`）

**配置：**
- 在 Vercel Dashboard → **Settings** → **Environment Variables**
- 添加 `DATABASE_URL`，值为连接字符串
- 选择环境：**Production**, **Preview**, **Development**

### 2. BLOB_READ_WRITE_TOKEN（必需）

**获取方式：**
1. Vercel Dashboard → 你的项目 → **Storage**
2. 创建或选择 **Blob Store**
3. 在 **Settings** 中复制 **Token**（格式：`vercel_blob_xxx...`）

**配置：**
- 在 Vercel Dashboard → **Settings** → **Environment Variables**
- 添加 `BLOB_READ_WRITE_TOKEN`，值为 Token
- 选择环境：**Production**, **Preview**, **Development**

## 📝 初始化数据库

部署完成后，访问以下 URL 初始化数据库：

```
https://your-project.vercel.app/api/init?secret=aigc-init-2024
```

这将：
- 创建所有必要的表
- 插入初始团队数据
- 插入初始新闻数据
- 设置默认公告

## 🔍 验证部署

1. **检查网站**
   - 访问 `https://your-project.vercel.app`
   - 应该能看到应用界面

2. **检查 API**
   - 访问 `https://your-project.vercel.app/api/teams`
   - 应该返回 JSON 数据

3. **检查环境变量**
   - 访问 `https://your-project.vercel.app/api/test-env`
   - 检查环境变量是否正确配置

## 🆘 常见问题

### 问题 1：构建失败

**错误**: `Cannot find module '@vercel/postgres'`

**解决**:
```bash
npm install
```

### 问题 2：数据库连接失败

**错误**: `Database connection failed`

**解决**:
1. 检查 `DATABASE_URL` 是否正确配置
2. 确保数据库已创建并连接到项目
3. 检查 Vercel Dashboard → **Storage** → **Postgres**

### 问题 3：文件上传失败

**错误**: `BLOB_READ_WRITE_TOKEN 未配置`

**解决**:
1. 检查 `BLOB_READ_WRITE_TOKEN` 是否正确配置
2. 确保 Blob Store 已创建
3. 检查 Token 是否有效

### 问题 4：API 返回 404

**解决**:
1. 检查 `vercel.json` 配置是否正确
2. 确保 `api/` 目录下的文件存在
3. 检查路由配置

## 📚 相关文档

- [Vercel 文档](https://vercel.com/docs)
- [Vercel Postgres 文档](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel Blob 文档](https://vercel.com/docs/storage/vercel-blob)

## ✨ 部署完成！

部署成功后，你的应用将在 `https://your-project.vercel.app` 运行。

如有问题，请查看 Vercel Dashboard 的 **Deployments** 日志。

