# 🎉 AIGC Console - Vercel Postgres 版本

## ✨ 新功能

此版本已升级支持 **Vercel Postgres 数据库**，实现真正的多人协作！

### 🚀 主要特性

- ✅ **多人实时共享数据** - 所有用户访问同一数据库
- ✅ **跨设备访问** - 手机、电脑、平板数据同步
- ✅ **数据永久保存** - 云端存储，不会丢失
- ✅ **自动回退** - API 失败时自动使用 localStorage
- ✅ **状态指示** - 实时显示云端/本地模式

---

## 📦 项目结构（新增）

```
AIGC-Console-main/
├── api/                    # Vercel Serverless Functions
│   ├── teams.ts           # 团队数据 API
│   ├── news.ts            # 新闻数据 API
│   ├── announcement.ts    # 公告 API
│   └── init.ts            # 数据库初始化 API
├── lib/                   # 数据库工具
│   ├── db.ts             # 数据库操作函数
│   └── init-db.sql       # 表结构初始化脚本
├── src/
│   ├── utils/
│   │   └── api.ts        # 前端 API 客户端
│   └── App.tsx           # 已升级支持 API 调用
├── DEPLOYMENT_GUIDE.md    # 📖 详细部署指南
└── vercel.json            # Vercel 配置文件
```

---

## 🚀 快速开始

### 方法一：部署到 Vercel（推荐）

**请查看 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) 获取详细步骤！**

简要步骤：
1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 创建 Postgres 数据库
4. 执行 SQL 初始化脚本
5. 访问 `/api/init` 导入数据
6. ✅ 完成！

### 方法二：本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

**注意**：本地开发时会自动使用 localStorage（本地模式）

---

## 📊 数据库架构

### 表结构

- **teams** - 团队信息（预算、进度、状态等）
- **members** - 成员信息（姓名、角色、头像等）
- **todos** - 任务清单
- **news** - 资讯动态
- **announcement** - 全局公告

### 关系设计

```
teams (1) ──< (N) members
teams (1) ──< (N) todos
```

---

## 🔄 数据流程

### 读取数据流程

```
用户访问页面
    ↓
尝试从 API 加载数据
    ↓
成功？ ─Yes→ 显示"云端数据库"
    ↓
   No
    ↓
回退到 localStorage ─→ 显示"本地模式"
```

### 保存数据流程

```
用户修改数据
    ↓
立即保存到 localStorage（本地备份）
    ↓
云端模式？ ─Yes→ 同时保存到 API/数据库
    ↓
   No
    ↓
仅保存到 localStorage
```

---

## 🎯 技术亮点

### 1. 智能降级策略

- 优先使用云端数据库
- API 失败自动切换到本地模式
- 保证应用始终可用

### 2. 性能优化

- 公告保存：防抖机制（1 秒延迟）
- 数据备份：localStorage 双重保险
- 并发请求：Promise.all 批量加载

### 3. 用户体验

- 加载指示器（首次加载）
- 实时状态显示（云端/本地）
- 保存失败提示

---

## 🔧 API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/teams` | GET | 获取所有团队 |
| `/api/teams` | PUT | 更新团队 |
| `/api/news` | GET | 获取所有新闻 |
| `/api/news` | POST | 添加新闻 |
| `/api/news` | PUT | 更新新闻 |
| `/api/news` | DELETE | 删除新闻 |
| `/api/announcement` | GET | 获取公告 |
| `/api/announcement` | PUT | 更新公告 |
| `/api/init` | GET | 初始化数据库 |

---

## 💡 使用建议

### 适合场景

✅ 500人以内公司快速测试  
✅ 多人协作场景  
✅ 需要跨设备访问  
✅ 1-3 个月的 MVP 验证

### 不适合场景

❌ 超大规模生产环境（>1000 用户）  
❌ 高频实时更新（每秒数十次）  
❌ 需要复杂事务处理

**对于长期生产环境，建议迁移到专业云服务器 + MySQL**

---

## 📈 性能指标

基于 Vercel Hobby 免费计划：

- **并发用户**: 50-100 人同时在线
- **响应时间**: 200-500ms（亚太区域）
- **数据容量**: 256MB（约可存储数万条记录）
- **每月请求**: 充足（Serverless Functions 限额）

---

## 🔐 安全说明

### 当前实现

- ✅ 管理员密码保护（前端）
- ✅ CORS 配置
- ✅ 环境变量保护

### 生产环境建议

- 🔒 添加后端身份验证（JWT）
- 🔒 实施 HTTPS 加密
- 🔒 添加请求频率限制
- 🔒 定期备份数据

---

## 📞 支持与反馈

- 📖 详细部署指南：[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- 🐛 遇到问题？查看常见问题章节
- 💬 需要帮助？提交 GitHub Issue

---

## 📄 许可证

MIT License

---

## 🎉 开始使用

1. 阅读 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. 部署到 Vercel
3. 测试多人协作功能
4. 根据需要调整和优化

**祝你使用愉快！** 🚀

