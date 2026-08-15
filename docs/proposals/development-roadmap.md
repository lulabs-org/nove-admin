# React 后台管理系统开发路线（规划）

> [!NOTE] 规划期方案文档
> 本文档是 nove-admin 建设初期的**开发路线规划**（2026-01）。当前项目的**现行工程规范**请以 `nove-admin/docs/` 下已落地的文档为准。本文档保留作为从 0 到可上线骨架的步骤参考。

下面按"从 0 到可上线骨架"的顺序给你一条最省心、可持续落地的开发路线（每一步做完你就能得到一个可运行的增量）。

---

## 0. 先定三条铁律（写进 README）

1. **Feature 内聚**：业务只写在 `features/*`
2. **只能走公开入口**：跨 feature 只允许 import `features/x/index.ts`（或 `routes/permissions`）
3. **页面不碰 axios**：页面只能用 `useQuery/useMutation`（数据从 `services/query` 层出来）

---

## 1. 初始化工程（Vite + React + TS）

- 用 Vite 创建 React + TS 项目
- 装上基础依赖（按你选型）：
  - 路由：React Router
  - 请求：Orval 生成 + Axios（或 fetch）
  - 缓存：TanStack Query
  - 状态：Zustand
  - 表单：React Hook Form + Zod
  - UI：Ant Design（可选）

**这一步目标**：能启动、能打包、TS 严格开启。

---

## 2. 建目录骨架（先搭空壳）

按你前面方案落地，先把目录建出来：

- `src/core/`：auth、permissions、i18n、http、queryClient
- `src/shared/`：ui、lib、types（不要放业务）
- `src/features/`：每个业务模块一个目录
- `src/routes/`：路由聚合（只做装配）
- `src/app/`：应用启动层（Providers/Bootstrap）

**这一步目标**：目录明确、每层职责明确。

---

## 3. 配好工程约束（越早越好）

马上做"防腐层"，否则后面必乱：

- `tsconfig`：strict + path alias
  - `@core/*` `@shared/*` `@features/*`
- ESLint + Prettier
- 边界校验（重点）：
  - 禁止 `features/A` 直接 import `features/B/*`（除 B 的公开入口）
  - 禁止页面层 import API client

**这一步目标**：靠工具强制你未来写不出烂架构。

---

## 4. 搭应用启动层（App Shell）

建立 `src/app/`：

- `AppProviders`：QueryClientProvider、Router、AuthProvider、ThemeProvider
- 全局错误处理：
  - React Error Boundary（页面级也要能兜底）
- 全局 UI：
  - Layout（侧边栏、顶部栏、面包屑）
  - 登录态切换（未登录 -> Login）

**这一步目标**：一个"后台框架壳"跑起来。

---

## 5. 先做权限骨架（不要拖到后面）

实现最小可用的权限体系：

- `core/permissions/can.ts`
  - `can(action, resource, ctx)` 返回 boolean
- `core/auth/`：
  - 登录态、token、user、role
- 路由守卫：
  - 没登录 -> `/login`
  - 没权限 -> `/403`
  - 菜单渲染基于权限

**这一步目标**：权限从一开始就是系统级能力，而不是补丁。

---

## 6. 建"标准数据层范式"（一锤定音）

把数据访问定成唯一套路（后面的人照抄即可）：

- `services/api/`：Orval 输出的 client（或你封装的 http）
- `features/x/services/x.query.ts`
  - `useXxxListQuery(params)`
  - `useCreateXxxMutation()`
- `features/x/domain/adapter.ts`
  - DTO -> ViewModel
  - FormValues -> Payload

并规定：页面只 import query hooks，不许碰 client（用 ESLint 卡死）。

**这一步目标**：所有数据请求写法统一，页面变干净。

---

## 7. 做第一个"样板 Feature"（当模板）

选一个最典型的模块，比如 `user-management`，把全链路跑通：

```
features/user-management/
  • pages/UsersPage.tsx（列表）
  • pages/UserDetailPage.tsx
  • components/UserFormModal.tsx
  • services/user.query.ts
  • domain/user.adapter.ts
  • routes.ts
  • permissions.ts
  • index.ts（只暴露 public API）
```

再把它挂到：

- `routes/index.ts`（注册路由）
- menu（注册菜单）
- permissions registry（注册权限）

**这一步目标**：从此所有新模块都照这个模板复制。

---

## 8. 表单与表格规范化（后台的命门）

后台最常见：CRUD + 表格 + 表单。

做两个基础封装（放 `shared/ui`）：

- `SmartTable`：分页、排序、筛选、loading、空状态统一
- `SmartForm`：RHF + Zod 的统一错误展示、提交 loading

再定义标准交互：

- 新增/编辑：弹窗 or 抽屉（统一一种）
- 成功提示、失败提示（统一 toast 规范）
- 删除二次确认

**这一步目标**：UI 一致性 + 开发效率翻倍。

---

## 9. 加"可观测性与质量门槛"（准备上线）

- Sentry/日志上报接口预留
- 全局请求错误处理（401/403/500）
- CI：
  - lint / typecheck / test / build
- 基础测试：
  - domain adapter 单测（最值）
  - 核心 `can()` 权限单测

**这一步目标**：上线不靠祈祷。

---

## 10. 进入持续迭代节奏（以后每加一个模块就走固定流程）

新增 feature 的固定流程：

1. 建 feature 目录（routes/permissions/index）
2. domain + query hooks 先写
3. page 最后写（只拼装）
4. 注册路由/菜单/权限
5. 写 adapter 单测

---

## 第一天任务清单

你现在立刻可以做的"第一天任务清单"：

1. 初始化 Vite React TS + strict
2. 建目录骨架 + alias
3. 上 ESLint/Prettier + 边界规则
4. AppProviders + Layout + Router
5. 做一个 user-management 样板模块跑通列表页

---
