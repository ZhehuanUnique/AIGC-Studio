# 🚀 Vercel Postgres 部署指南

本指南将帮你在 Vercel 上部署支持多人协作的 AIGC Console 项目。

## 📋 前置准备

- ✅ GitHub 账号
- ✅ Vercel 账号（使用 GitHub 登录）
- ✅ 项目代码已推送到 GitHub 仓库

---

## 第一步：推送代码到 GitHub

如果还没有推送代码到 GitHub：

```bash
# 初始化 git 仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "feat: 升级支持 Vercel Postgres"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/AIGC-Console.git

# 推送到 GitHub
git push -u origin main
```

---

## 第二步：在 Vercel 创建项目

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **"Add New..."** → **"Project"**
3. 导入你的 GitHub 仓库（AIGC-Console）
4. 点击 **"Import"**

### 项目配置

- **Framework Preset**: Vite
- **Root Directory**: `./`（保持默认）
- **Build Command**: `npm run build`（自动检测）
- **Output Directory**: `dist`（自动检测）

点击 **"Deploy"** 开始首次部署（此时还没有数据库，会显示错误，这是正常的）

---

## 第三步：创建 Vercel Postgres 数据库

### 3.1 创建数据库

1. 在 Vercel 项目页面，点击顶部菜单 **"Storage"**
2. 点击 **"Create Database"**
3. 选择 **"Postgres"** → **"Continue"**
4. 填写数据库信息：
   - **Database Name**: `aigc-console-db`（或其他名称）
   - **Region**: 选择离你最近的区域（推荐 Hong Kong 或 Singapore）
5. 点击 **"Create"**

### 3.2 连接数据库到项目

1. 数据库创建后，会自动显示连接页面
2. 点击 **"Connect Project"**
3. 选择你的 AIGC Console 项目
4. 点击 **"Connect"**

✅ 环境变量会自动注入到项目中！

---

## 第四步：初始化数据库表结构

### 4.1 执行 SQL 脚本

1. 在 Vercel Dashboard，进入你的数据库
2. 点击 **"Query"** 或 **".sql"** 标签
3. 复制 `lib/init-db.sql` 文件的全部内容
4. 粘贴到查询编辑器中
5. 点击 **"Run Query"** 执行

你应该看到成功消息：
```
✅ 5 tables created
✅ 4 indexes created
✅ 1 row inserted
```

### 4.2 导入初始数据

访问以下 URL（替换为你的实际域名）：

```
https://你的项目名.vercel.app/api/init?secret=aigc-init-2024
```

成功后会看到：
```json
{
  "success": true,
  "message": "数据库初始化成功！",
  "initialized": {
    "teams": 5,
    "news": 2,
    "announcement": true
  }
}
```

---

## 第五步：重新部署项目

1. 回到 Vercel 项目页面
2. 点击顶部菜单 **"Deployments"**
3. 点击最新部署右侧的 **"..."** → **"Redeploy"**
4. 选择 **"Redeploy"** 确认

---

## ✅ 验证部署

访问你的网站：`https://你的项目名.vercel.app`

检查以下功能：

1. ✅ 页面正常加载
2. ✅ 右上角显示 **"云端数据库"**（绿色指示器）
3. ✅ 可以看到初始团队和新闻数据
4. ✅ 输入管理员密码（2468）进入编辑模式
5. ✅ 修改数据后刷新页面，数据保持不变

---

## 🎯 多人协作测试

1. 在电脑上登录编辑数据
2. 在手机浏览器访问相同网址
3. 刷新手机页面，查看数据是否同步
4. ✅ 成功！现在支持多人实时共享数据

---

## 📊 数据库管理

### 查看数据

在 Vercel Dashboard → Storage → 你的数据库 → Query：

```sql
-- 查看所有团队
SELECT * FROM teams;

-- 查看所有成员
SELECT * FROM members;

-- 查看所有新闻
SELECT * FROM news;

-- 查看公告
SELECT * FROM announcement;
```

### 备份数据

1. 在网站管理员模式下
2. 点击 **"备份数据"** 按钮
3. 下载 JSON 文件到本地

### 恢复数据

1. 点击 **"恢复数据"** 按钮
2. 选择之前导出的 JSON 文件
3. 数据会自动同步到数据库

---

## 🔧 常见问题

### Q1: 页面显示"本地模式"而不是"云端数据库"？

**解决方法：**
1. 检查数据库是否正确连接到项目
2. 查看 Vercel 项目 → Settings → Environment Variables
3. 确认 `POSTGRES_URL` 等变量存在
4. 重新部署项目

### Q2: API 返回 500 错误？

**解决方法：**
1. 查看 Vercel 部署日志（Deployments → 点击部署 → Function Logs）
2. 确认数据库表结构已创建（执行 `lib/init-db.sql`）
3. 确认环境变量正确配置

### Q3: 数据库初始化失败？

**解决方法：**
1. 确认 SQL 脚本已完整执行
2. 检查 `/api/init?secret=aigc-init-2024` URL 中的密钥是否正确
3. 查看 Function Logs 的详细错误信息

### Q4: 如何修改管理员密码？

在 `src/App.tsx` 中搜索管理员密码并修改（当前默认：`2468`）。

修改后推送代码并重新部署。

---

## 💰 费用说明

### Vercel Hobby 计划（免费）

- ✅ 前端托管：无限流量
- ✅ Serverless Functions：100GB-Hrs/月
- ✅ Postgres 数据库：256MB 存储 + 60 小时计算时间/月

**对于 500 人公司的测试阶段完全够用！**

### 超出免费额度怎么办？

1. **测试阶段（1-3个月）**：免费额度足够
2. **正式使用**：建议迁移到云服务器 + MySQL（详见主文档）

---

## 🚀 后续优化建议

### 1. 自定义域名

在 Vercel 项目 → Settings → Domains 添加自定义域名

### 2. 数据库索引优化

如果查询变慢，在数据库中执行：
```sql
CREATE INDEX IF NOT EXISTS idx_teams_status ON teams(status);
CREATE INDEX IF NOT EXISTS idx_news_priority ON news(priority);
```

### 3. 定期备份

建议每周使用"备份数据"功能导出 JSON 文件

---

## 📞 需要帮助？

- Vercel 官方文档：https://vercel.com/docs
- Vercel Postgres 文档：https://vercel.com/docs/storage/vercel-postgres
- 项目 Issues：提交到你的 GitHub 仓库

---

## 🎉 完成！

恭喜！你已经成功部署了支持多人协作的 AIGC Console 项目。

现在你的团队可以：
- ✅ 在任何设备访问
- ✅ 实时共享数据
- ✅ 跨设备同步
- ✅ 数据永久保存

**开始使用吧！** 🚀

