# 🚀 从 Vercel 迁移指南

## 平台对比总结

### 推荐顺序：Netlify > Cloudflare Pages > Render

---

## 方案一：Netlify（推荐 ⭐⭐⭐⭐⭐）

### 为什么选择 Netlify？
- ✅ **迁移最简单**：支持标准 Node.js，代码改动最小
- ✅ **免费额度充足**：125,000 次函数调用/月
- ✅ **文档完善**：迁移指南清晰
- ⚠️ **需要替代方案**：Blob Storage 和 PostgreSQL 需使用外部服务

### 迁移步骤

#### 1. 替换依赖

```bash
# 移除 Vercel 依赖
npm uninstall @vercel/blob @vercel/postgres @vercel/node

# 安装替代方案
npm install @supabase/supabase-js  # PostgreSQL
npm install @aws-sdk/client-s3     # 或使用 Supabase Storage
```

#### 2. 数据库迁移（推荐 Supabase）

- 免费 PostgreSQL 数据库（500MB）
- 提供 REST API 和客户端 SDK
- 迁移步骤：
  1. 注册 [Supabase](https://supabase.com)
  2. 创建项目，获取连接字符串
  3. 导出 Vercel Postgres 数据
  4. 导入到 Supabase

#### 3. 文件存储迁移

**选项 A：Supabase Storage（推荐）**
- 免费 1GB 存储
- 与数据库同一平台，管理方便

**选项 B：AWS S3**
- 免费 5GB（12个月）
- 需要配置 AWS 账号

#### 4. 修改 API 函数

将 `api/` 目录下的函数改为 Netlify Functions 格式：

```typescript
// 原 Vercel 格式
import type { VercelRequest, VercelResponse } from '@vercel/node';
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ...
}

// Netlify 格式
import type { Handler } from '@netlify/functions';
export const handler: Handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ data: 'ok' })
  };
};
```

#### 5. 配置文件

创建 `netlify.toml`：

```toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

#### 6. 环境变量

在 Netlify Dashboard 配置：
- `DATABASE_URL` - Supabase 连接字符串
- `SUPABASE_URL` - Supabase 项目 URL
- `SUPABASE_KEY` - Supabase API Key

---

## 方案二：Cloudflare Pages（性能最佳 ⭐⭐⭐⭐）

### 为什么选择 Cloudflare？
- ✅ **全球 CDN**：速度最快
- ✅ **免费额度最高**：100,000 次请求/天
- ✅ **R2 存储免费**：10GB 免费存储
- ⚠️ **需要适配**：Workers 不是标准 Node.js

### 迁移步骤

#### 1. 替换依赖

```bash
npm uninstall @vercel/blob @vercel/postgres @vercel/node
npm install @supabase/supabase-js
```

#### 2. 修改 API 函数为 Workers 格式

```typescript
// Cloudflare Workers 格式
export default {
  async fetch(request: Request): Promise<Response> {
    return new Response(JSON.stringify({ data: 'ok' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

#### 3. 使用 R2 存储

```typescript
// 替换 Vercel Blob
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});
```

#### 4. 配置文件

创建 `wrangler.toml`：

```toml
name = "aigc-studio"
compatibility_date = "2024-01-01"

[[r2_buckets]]
binding = "MY_BUCKET"
bucket_name = "my-bucket"

[env.production.vars]
DATABASE_URL = "your-supabase-url"
```

---

## 方案三：Render（最简单但有限制 ⭐⭐⭐）

### 为什么选择 Render？
- ✅ **完整 Node.js**：无需适配代码
- ✅ **内置 PostgreSQL**：免费 90 天试用
- ⚠️ **休眠限制**：免费计划 15 分钟无活动后休眠
- ⚠️ **无对象存储**：需使用外部服务

### 迁移步骤

#### 1. 创建 Render 服务

1. 注册 [Render](https://render.com)
2. 创建 Web Service（连接 GitHub）
3. 创建 PostgreSQL 数据库

#### 2. 修改代码

Render 使用标准 Node.js，但需要：
- 将 `api/` 改为 Express 路由
- 或使用 Render 的 Background Workers

#### 3. 文件存储

使用 Supabase Storage 或 AWS S3

---

## 迁移成本对比

| 平台 | 代码改动 | 学习成本 | 免费额度 | 推荐度 |
|------|---------|---------|---------|--------|
| **Netlify** | 中等 | 低 | 高 | ⭐⭐⭐⭐⭐ |
| **Cloudflare** | 高 | 中 | 最高 | ⭐⭐⭐⭐ |
| **Render** | 低 | 低 | 中 | ⭐⭐⭐ |

---

## 我的建议

### 如果追求简单迁移 → 选择 **Netlify**
- 代码改动最小
- 文档完善
- 社区支持好

### 如果追求性能 → 选择 **Cloudflare Pages**
- 全球 CDN 最快
- 免费额度最高
- 但需要更多适配工作

### 如果只是测试 → 选择 **Render**
- 配置最简单
- 但免费计划有休眠限制

---

## 下一步

1. 选择平台
2. 我可以帮你：
   - 修改代码适配新平台
   - 创建配置文件
   - 迁移数据库和文件
   - 设置环境变量

告诉我你想选择哪个平台，我会帮你完成迁移！


