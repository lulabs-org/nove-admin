# Nove Admin

Nove 的组织管理后台，基于 React、TypeScript、Vite、Ant Design 和 TanStack Query 构建。

## 开始开发

要求：Node.js 22+、pnpm 10+，以及可访问的 Nove API。

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

在 `.env.local` 中配置：

```dotenv
VITE_API_BASE_URL=http://localhost:3000
```

常用检查：

```bash
pnpm lint
pnpm test:run
pnpm build
pnpm --dir docs build
```

## 项目文档

完整的架构、模块、开发与部署说明位于 [`docs/`](./docs/index.md)。本地启动：

```bash
pnpm --dir docs install
pnpm --dir docs dev
```

## 目录边界

- `src/app/`：应用装配、布局、路由和守卫。
- `src/features/`：按业务域组织的页面、组件、API 与类型。
- `src/shared/`：无业务归属的基础设施、Hooks、类型和工具。
- `src/shared/lib/api/orval/`：由 Orval 生成，不手工修改。
- `docs/`：VitePress 项目文档。
