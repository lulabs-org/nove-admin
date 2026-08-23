# 脚本与环境变量

## 应用脚本

| 命令            | 用途                                  |
| --------------- | ------------------------------------- |
| `pnpm dev`      | 启动 Vite 开发服务器                  |
| `pnpm build`    | TypeScript project build 后生成生产包 |
| `pnpm preview`  | 预览生产包                            |
| `pnpm lint`     | 检查整个仓库的 ESLint 规则            |
| `pnpm format`   | 使用 Prettier 写入格式化结果          |
| `pnpm test`     | Vitest 监听模式                       |
| `pnpm test:run` | 单次运行 Vitest                       |
| `pnpm test:e2e` | 运行 Playwright                       |

## API 生成

| 命令                 | 用途                            |
| -------------------- | ------------------------------- |
| `pnpm gen:api`       | 按 `orval.config.ts` 生成客户端 |
| `pnpm gen:api:watch` | 监听 OpenAPI 并持续生成         |
| `pnpm api:generate`  | `pnpm gen:api` 的等价入口       |

生成前必须设置 `ORVAL_API_TARGET`，值为 OpenAPI JSON 的可访问地址或兼容输入。

## 文档脚本

| 命令 | 用途 |
| ---- | ---- |

以下命令在 `docs/` 目录执行；从仓库根目录调用时可使用 `pnpm --dir docs <命令>`。

| 命令           | 用途                          |
| -------------- | ----------------------------- |
| `pnpm dev`     | 启动 VitePress 文档开发服务器 |
| `pnpm build`   | 严格构建文档站                |
| `pnpm preview` | 预览文档静态产物              |

## 环境变量

| 变量                | 使用阶段       | 说明                               |
| ------------------- | -------------- | ---------------------------------- |
| `VITE_API_BASE_URL` | 开发与应用构建 | Nove API 根地址；会进入浏览器产物  |
| `ORVAL_API_TARGET`  | API 生成       | OpenAPI 输入地址，不进入应用运行时 |

不要在 `VITE_` 变量中保存密钥。所有 `VITE_` 值都应被视为对浏览器用户可见。
