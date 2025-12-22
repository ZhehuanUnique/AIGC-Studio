# ✅ Vercel 部署检查清单

## 📦 代码准备

- [x] 代码已构建成功（`npm run build` 通过）
- [x] 所有依赖已安装（`package.json` 正确）
- [x] TypeScript 编译无错误
- [x] `vercel.json` 配置正确

## 🔧 Vercel 配置

### 1. 项目设置
- [ ] 项目已连接到 GitHub 仓库
- [ ] Framework 设置为 Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install`

### 2. 环境变量
- [ ] `DATABASE_URL` 已配置
  - 获取方式：Vercel Dashboard → Storage → Postgres → Connection String
- [ ] `BLOB_READ_WRITE_TOKEN` 已配置
  - 获取方式：Vercel Dashboard → Storage → Blob Store → Token

### 3. 数据库
- [ ] Vercel Postgres 数据库已创建
- [ ] 数据库已连接到项目
- [ ] 数据库初始化脚本已执行（或通过 `/api/init` 初始化）

### 4. 文件存储
- [ ] Vercel Blob Store 已创建
- [ ] Blob Store Token 已配置

## 🚀 部署步骤

1. [ ] 推送代码到 GitHub
   ```bash
   git add .
   git commit -m "准备部署到 Vercel"
   git push
   ```

2. [ ] 在 Vercel Dashboard 导入项目
   - 或使用 `vercel` CLI 命令

3. [ ] 配置环境变量（见上方）

4. [ ] 触发部署
   - 自动：推送代码到 GitHub
   - 手动：Vercel Dashboard → Deployments → Redeploy

5. [ ] 等待构建完成
   - 查看构建日志确认无错误

6. [ ] 初始化数据库
   ```
   https://your-project.vercel.app/api/init?secret=aigc-init-2024
   ```

7. [ ] 验证部署
   - 访问网站：`https://your-project.vercel.app`
   - 测试 API：`https://your-project.vercel.app/api/teams`
   - 测试上传功能

## 🔍 验证清单

- [ ] 网站可以正常访问
- [ ] 数据可以正常加载
- [ ] 文件上传功能正常
- [ ] API 接口正常响应
- [ ] 数据库连接正常

## 📝 部署后操作

1. **设置自定义域名**（可选）
   - Vercel Dashboard → Settings → Domains
   - 添加你的域名

2. **配置 HTTPS**（自动）
   - Vercel 自动为所有域名配置 HTTPS

3. **监控和日志**
   - 查看 Vercel Dashboard → Deployments
   - 查看 Function Logs 排查问题

## 🆘 遇到问题？

查看 `DEPLOY_VERCEL.md` 中的常见问题解决方案。

