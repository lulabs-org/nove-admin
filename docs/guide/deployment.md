# 部署

## 生产构建

```bash
pnpm install --frozen-lockfile
pnpm build
```

应用产物位于 `dist/`。构建时必须提供正确的 `VITE_API_BASE_URL`；Vite 环境变量会写入前端产物，不应放置密钥。

## Vercel 与 SPA 路由

仓库根目录的 `vercel.json` 将非保留路径回写到 `/index.html`，使 React Router 的深层链接可以直接刷新。规则明确保留：

- `/api` 及其子路径
- `/assets` 及其子路径
- `/.well-known` 及其子路径

新增平台保留路径时应同步更新该规则，并在预览环境直接访问深层 URL 验证，而不只从首页点击进入。

## 文档构建

```bash
pnpm --dir docs install --frozen-lockfile
pnpm --dir docs build
```

VitePress 静态产物位于 `docs/.vitepress/dist/`。`docs/` 有独立的 `package.json` 和锁文件，不依赖根项目安装。它与管理后台是两个独立入口，部署平台需要分别指定安装目录、构建命令和输出目录。
