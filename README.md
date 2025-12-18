# 剧变时代中控台

这是一个使用 React + TypeScript + Vite 构建的剧变时代中控台管理系统。

## 技术栈

- **React 18.2.0** - UI 框架
- **TypeScript 5.3.3** - 类型系统
- **Vite 5.0.8** - 构建工具
- **Tailwind CSS 3.3.6** - 样式框架
- **Lucide React** - 图标库

## 项目结构

```
新建文件夹/
├── src/
│   ├── components/        # React 组件
│   │   ├── Modal.tsx
│   │   ├── InputField.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── ResourceLink.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── NewsCard.tsx
│   │   ├── DirectorCard.tsx
│   │   ├── MemberCard.tsx
│   │   └── DepartmentSection.tsx
│   ├── constants/         # 常量定义
│   │   └── index.ts
│   ├── types/            # TypeScript 类型定义
│   │   └── index.ts
│   ├── App.tsx           # 主应用组件
│   ├── main.tsx          # 入口文件
│   └── index.css         # 全局样式
├── index.html            # HTML 入口
├── package.json          # 依赖配置
├── tsconfig.json         # TypeScript 配置
├── vite.config.ts        # Vite 配置
└── tailwind.config.js    # Tailwind 配置
```

## 安装和运行

### 1. 安装依赖

```bash
cd "新建文件夹"
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

开发服务器将在 `http://localhost:3000` 启动，并自动在浏览器中打开。

### 3. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 4. 预览生产构建

```bash
npm run preview
```

## 功能特性

- ✅ **团队管理** - 管理多个制作团队，包括成员、任务、进度等
- ✅ **任务清单** - 为每个团队创建和管理待办任务
- ✅ **费用管理** - 跟踪预算和实际花费，超支预警
- ✅ **资讯管理** - 发布和管理行业资讯、内部通知
- ✅ **数据持久化** - 使用 localStorage 保存数据
- ✅ **数据导入导出** - 支持 JSON 格式的数据备份和恢复
- ✅ **管理员模式** - 密码保护的管理员编辑功能（默认密码：8888）
- ✅ **日报生成** - 一键生成项目日报并复制到剪贴板

## 使用说明

### 管理员模式

1. 点击右上角的 "VIEW" 按钮
2. 输入管理员密码（默认：8888）
3. 进入管理员模式后，可以：
   - 编辑团队信息
   - 添加/删除成员
   - 管理任务清单
   - 发布资讯
   - 导出/导入数据

### 数据管理

- **备份数据**：点击管理员工具栏中的下载图标，导出 JSON 格式的数据文件
- **恢复数据**：点击管理员工具栏中的 JSON 图标，选择之前导出的 JSON 文件进行恢复
- **重置数据**：点击管理员工具栏中的刷新图标，恢复为初始数据

## 开发说明

### 类型定义

所有 TypeScript 类型定义在 `src/types/index.ts` 中：

- `Team` - 团队信息
- `Member` - 成员信息
- `News` - 资讯信息
- `Todo` - 任务信息

### 常量配置

所有常量配置在 `src/constants/index.ts` 中：

- `INITIAL_TEAMS` - 初始团队数据
- `INITIAL_NEWS` - 初始资讯数据
- `STATUS_CONFIG` - 状态配置
- `NEWS_TAGS` - 资讯标签配置

### 组件说明

- `App.tsx` - 主应用组件，包含所有业务逻辑
- `DepartmentSection` - 部门/团队展示组件
- `Modal` - 通用模态框组件
- `InputField` - 通用输入框组件

## 浏览器支持

- Chrome (推荐)
- Firefox
- Edge
- Safari

## 注意事项

1. 数据存储在浏览器的 localStorage 中，清除浏览器数据会丢失所有保存的信息
2. 建议定期使用"备份数据"功能导出数据
3. 管理员密码可以在代码中修改（`App.tsx` 中的 `toggleAdminMode` 函数）

## 许可证

MIT

