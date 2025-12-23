# 剧变时代中控台

一个使用 React + TypeScript + Vite 构建的剧变时代中控台管理系统，支持多人协作、云端数据存储和实时同步。

## ✨ 主要特性

- ✅ **多人实时共享** - 500+ 人可同时访问和编辑
- ✅ **跨设备同步** - 手机、电脑、平板数据实时同步
- ✅ **数据永久保存** - 使用 Vercel Postgres 云端数据库
- ✅ **智能降级** - API 失败时自动使用 localStorage
- ✅ **团队管理** - 管理多个制作团队，包括成员、任务、进度等
- ✅ **任务清单** - 为每个团队创建和管理待办任务
- ✅ **费用管理** - 跟踪预算和实际花费，超支预警
- ✅ **资讯管理** - 发布和管理行业资讯、内部通知
- ✅ **文件上传** - 支持作品、封面图、头像等文件上传（Vercel Blob）
- ✅ **数据导入导出** - 支持 JSON 格式的数据备份和恢复
- ✅ **管理员模式** - 密码保护的管理员编辑功能（默认密码：2468）
- ✅ **日报生成** - 一键生成项目日报并复制到剪贴板

## 🛠️ 技术栈

- **React 18.2.0** - UI 框架
- **TypeScript 5.3.3** - 类型系统
- **Vite 5.0.8** - 构建工具
- **Tailwind CSS 3.3.6** - 样式框架
- **Lucide React** - 图标库
- **Vercel Postgres** - 云端数据库
- **Vercel Blob** - 文件存储
- **Vercel Serverless Functions** - 后端 API

## 📦 项目结构

```
AIGC-Studio/
├── api/                    # Vercel Serverless Functions
│   ├── teams.ts           # 团队数据 API
│   ├── news.ts            # 新闻数据 API
│   ├── announcement.ts    # 公告 API
│   ├── upload.ts          # 文件上传 API
│   ├── blob-delete.ts     # 文件删除 API
│   ├── init.ts            # 数据库初始化 API
│   └── migrate.ts         # 数据库迁移 API
├── lib/                   # 数据库工具
│   ├── db.ts             # 数据库操作函数
│   └── init-db.sql       # 表结构初始化脚本
├── src/
│   ├── components/        # React 组件
│   │   ├── Modal.tsx
│   │   ├── InputField.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── NewsCard.tsx
│   │   ├── DirectorCard.tsx
│   │   ├── MemberCard.tsx
│   │   └── DepartmentSection.tsx
│   ├── constants/         # 常量定义
│   │   └── index.ts
│   ├── types/            # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/             # 工具函数
│   │   └── api.ts        # 前端 API 客户端
│   ├── App.tsx           # 主应用组件
│   ├── main.tsx          # 入口文件
│   └── index.css         # 全局样式
├── public/               # 静态资源
├── index.html            # HTML 入口
├── package.json          # 依赖配置
├── tsconfig.json        # TypeScript 配置
├── vite.config.ts       # Vite 配置
├── vercel.json          # Vercel 部署配置
└── tailwind.config.js   # Tailwind 配置
```

## 🚀 快速开始

### 本地开发

1. **安装依赖**
   ```bash
   npm install
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```
   开发服务器将在 `http://localhost:3000` 启动，并自动在浏览器中打开。

3. **构建生产版本**
   ```bash
   npm run build
   ```
   构建产物将输出到 `dist` 目录。

4. **预览生产构建**
   ```bash
   npm run preview
   ```

> ⚠️ **本地开发模式说明**：
> - 会使用 localStorage（本地模式）
> - 页面右上角显示"本地模式"（黄色）
> - 这是正常的！部署后会自动切换到云端数据库

## 🌐 部署到 Vercel

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

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 配置环境变量
vercel env add DATABASE_URL
vercel env add BLOB_READ_WRITE_TOKEN

# 生产环境部署
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

## 📝 数据库初始化

### 1. 创建数据库表结构

1. 在 Vercel Dashboard，进入你的数据库
2. 点击 **"Query"** 或 **".sql"** 标签
3. 复制 `lib/init-db.sql` 文件的全部内容
4. 粘贴到查询编辑器中
5. 点击 **"Run Query"** 执行

### 2. 初始化数据

部署完成后，访问以下 URL 初始化数据：

```
https://your-project.vercel.app/api/init?secret=aigc-init-2024
```

这将：
- 插入初始团队数据
- 插入初始新闻数据
- 设置默认公告

### 3. 数据库迁移（如果需要）

如果遇到字段缺失错误，访问：

```
https://your-project.vercel.app/api/migrate
```

这将自动添加缺失的字段（如 `unfinished_works`, `finished_works`, `consumption_records`）。

## 📖 使用说明

### 数据状态指示

页面右上角（桌面端可见）显示：
- 🟢 **云端数据库**：多人共享、换设备也同步
- 🟡 **本地模式**：只保存在当前浏览器（清缓存会丢）

### 管理员模式

1. 点击右上角的 **"VIEW"** 按钮
2. 输入管理员密码（默认：`2468`）
3. 进入管理员模式后，可以：
   - 编辑团队信息
   - 添加/删除成员
   - 管理任务清单
   - 发布资讯
   - 上传作品和封面图
   - 导出/导入数据

### 组级解锁

每个组卡片右上角都有：**UPDATE / 更新（锁按钮）**  
点击后输入：
- **组密码**：只解锁本组（推荐普通负责人）
- **管理员密码 `2468`**：解锁所有组 + 出现管理员工具栏

### 搜索功能

在页面中部搜索框：**"搜索成员、任务..."**  
支持：
- 搜索**小组名称**
- 搜索**成员姓名**

### 任务查看

- **看小组任务**：在组卡片找到 **Pending Tasks** → 鼠标悬停（hover）展开"全部任务"
- **看某个人任务**：鼠标悬停到成员卡片上，会弹出该成员任务浮窗

### 数据管理

- **保存设置**：点击管理员工具栏中的保存图标，保存所有修改
- **备份数据**：点击管理员工具栏中的下载图标，导出 JSON 格式的数据文件
- **恢复数据**：点击管理员工具栏中的 JSON 图标，选择之前导出的 JSON 文件进行恢复
- **重置数据**：点击管理员工具栏中的刷新图标，恢复为初始数据

### 日报生成

管理员模式下，点击 **生成日报** → 提示"已复制到剪贴板" → 飞书/微信群直接粘贴发送

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

### 问题 1：显示"本地模式"而不是"云端数据库"

**原因**：API 调用失败，应用自动回退到 localStorage。

**解决**：
1. 检查浏览器控制台（F12）查看错误信息
2. 检查 Vercel 环境变量是否正确配置
3. 检查 Vercel Functions 日志
4. 测试 API 端点：`https://你的域名/api/teams`

### 问题 2：构建失败

**错误**: `Cannot find module '@vercel/postgres'`

**解决**:
```bash
npm install
```

### 问题 3：数据库连接失败

**错误**: `Database connection failed`

**解决**:
1. 检查 `DATABASE_URL` 是否正确配置
2. 确保数据库已创建并连接到项目
3. 检查 Vercel Dashboard → **Storage** → **Postgres**

### 问题 4：文件上传失败

**错误**: `BLOB_READ_WRITE_TOKEN 未配置`

**解决**:
1. 检查 `BLOB_READ_WRITE_TOKEN` 是否正确配置
2. 确保 Blob Store 已创建
3. 检查 Token 是否有效

### 问题 5：上传时提示"数据库需要更新"

**症状**：错误信息包含 "unfinished_works" 或 "finished_works"

**解决**：
访问 `https://your-project.vercel.app/api/migrate` 自动添加缺失字段

### 问题 6：API 返回 404

**解决**:
1. 检查 `vercel.json` 配置是否正确
2. 确保 `api/` 目录下的文件存在
3. 检查路由配置

## 📚 相关文档

- [Vercel 文档](https://vercel.com/docs)
- [Vercel Postgres 文档](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel Blob 文档](https://vercel.com/docs/storage/vercel-blob)

## 🌐 浏览器支持

- Chrome (推荐)
- Firefox
- Edge
- Safari

## 📄 许可证

MIT
