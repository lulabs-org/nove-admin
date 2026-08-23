# 快速开始

## 环境要求

- Node.js 22 或更高版本
- pnpm 10 或兼容版本
- 一个可访问的 Nove API 实例

## 安装与启动

```bash
pnpm install
```

创建 `.env.local`，指定 API 根地址：

```dotenv
VITE_API_BASE_URL=http://localhost:3000
```

启动应用：

```bash
pnpm dev
```

Vite 默认提供本地开发地址。登录、刷新令牌和后续业务请求都会使用 `VITE_API_BASE_URL`。

## 启动文档站

```bash
pnpm install
pnpm dev
```

以上命令在 `docs/` 目录执行。也可以从仓库根目录运行 `pnpm --dir docs install` 和 `pnpm --dir docs dev`。修改 Markdown 或 VitePress 配置后会热更新；提交前在 `docs/` 目录运行 `pnpm build`，严格检查内部链接并生成静态站点。

## 首次定位代码

- 应用入口：`src/main.tsx` 与 `src/app/App.tsx`
- Provider 与路由实例：`src/app/providers/AppProviders.tsx`
- 路由聚合：`src/app/routes/index.tsx`
- 布局和菜单：`src/app/layout/`
- 业务实现：`src/features/`
- HTTP 与生成客户端：`src/shared/lib/api/`
