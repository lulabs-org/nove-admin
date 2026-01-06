# nove-admin

nove Admin - Personalized Intelligent Education Platform Backend Management System

## 项目简介

nove项目致力于构建一个"太子洗马"式的个性化智能教育平台，为每位学员提供专属、顶级、全方位的教育服务。nove-admin 是整个nove生态系统的后台管理系统前端应用。

## 技术栈

- **React 19** - UI框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Ant Design** - UI组件库
- **React Router** - 路由管理
- **Axios** - HTTP客户端
- **Vitest** - 测试框架

## 架构说明

nove采用前后端分离架构：

- **nove-admin** - 后台管理系统（本项目）
- **nove-api** - 主业务后端（NestJS）
- **nove-ai** - AI智能服务（FastAPI）

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发环境

```bash
pnpm dev
```

应用将在 http://localhost:5174 启动

### 构建生产版本

```bash
pnpm build
```

### 运行测试

```bash
# 运行测试
pnpm test

# 运行测试（单次）
pnpm test:run

# 运行测试UI
pnpm test:ui
```

## 环境变量

创建 `.env.development` 和 `.env.production` 文件：

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 项目结构

```
src/
├── components/          # 可复用UI组件
│   ├── Layout/         # 布局组件
│   └── ErrorBoundary.tsx
├── pages/              # 页面组件
│   ├── Login/          # 登录页
│   └── Dashboard/      # 仪表板
├── contexts/           # React Context
│   └── AuthContext.tsx # 认证上下文
├── hooks/              # 自定义Hooks
│   └── useAuth.ts
├── services/           # API服务层
│   ├── api.ts          # Axios配置
│   └── auth.ts         # 认证API
├── routes/             # 路由配置
│   ├── index.tsx
│   └── ProtectedRoute.tsx
├── types/              # TypeScript类型
│   ├── auth.ts
│   └── api.ts
├── utils/              # 工具函数
│   ├── storage.ts
│   └── validators.ts
└── test/               # 测试配置
```

## 功能特性

### 已实现

- ✅ 用户登录认证
- ✅ 会话管理（Token存储）
- ✅ 路由保护
- ✅ 响应式布局
- ✅ 现代化UI设计
- ✅ 错误处理和边界
- ✅ 全局错误通知

### 开发中

- 🚧 学员管理
- 🚧 课程管理
- 🚧 导师管理
- 🚧 数据分析
- 🚧 系统设置

## 开发指南

### 登录测试

由于后端API尚未完全实现，你可以：

1. 配置Mock API服务
2. 或修改 `src/services/auth.ts` 使用测试数据

### 添加新页面

1. 在 `src/pages/` 创建新页面组件
2. 在 `src/routes/index.tsx` 添加路由
3. 在 `src/components/Layout/Sidebar.tsx` 添加菜单项

### 状态管理

使用 Context API 进行全局状态管理：
- `AuthContext` - 认证状态
- 可根据需要添加更多Context

## 代码规范

- 使用 ESLint 进行代码检查
- 使用 TypeScript 严格模式
- 遵循 React 最佳实践
- 组件使用函数式组件 + Hooks

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## License

Private - nove Project

## 联系方式

nove Team - 陆向谦实验室
