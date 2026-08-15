# nove-admin 前端架构落地方案（规划）

> [!NOTE] 规划期方案文档
> 本文档是 nove-admin 建设初期的**架构方案**（2026-01）。当前项目的**现行工程规范**请以 `nove-admin/docs/` 下已落地的文档为准（`architecture.md`、`permission-system.md`、`api-convention.md`、`tanstack-query-best-practices.md`）。本文档保留作为方案设计参考与决策记录。
>
> **方案评审结论（已落地采纳）**：采用 **单体前端（Monolith）+ 强模块边界（Feature-based）+ 工程化治理**，路由级懒加载；为未来插件化/微前端预留接口，但不提前引入复杂度。

下面给你一套**"工业级 nove-admin（Vite + React + TS）后台管理系统"**的架构落地方案（偏可直接开工的那种），目标是：可扩展、可治理、可观测、权限清晰、多人协作不炸。

---

## 1) 技术栈选型（推荐基线）

- 构建：Vite
- 框架：React 18 + TypeScript
- 路由：React Router v6
- 状态：TanStack Query（服务端状态） + Zustand（少量全局 UI 状态）
- 表单：React Hook Form + Zod
- 表格：后台高频 → TanStack Table（可配合虚拟滚动）
- UI 组件：Ant Design / Arco Design / Mantine 三选一
  - 想"后台效率"就 AntD/Arco
  - 想"高级感 + 可定制"就 Mantine
- 权限：前端 RBAC/ABAC（见下）
- HTTP：axios（或 fetch + 封装）
- 工程质量：ESLint + Prettier + Husky + lint-staged + commitlint
- 测试：Vitest（单测） + Playwright（E2E）
- 可观测：Sentry（异常） + OpenTelemetry（可选） + 前端埋点

---

## 2) 目录结构（建议用"分层 + 领域模块"）

推荐 Domain-first（按业务域），再在域内做分层，这样后台一大就不乱。

```
src/
  app/                     # 应用级：入口、路由、权限守卫、布局、初始化
    providers/             # QueryClientProvider, Theme, I18n, Auth
    routes/                # 路由定义（含动态路由生成）
    layout/                # AdminLayout、Sidebar、Topbar
    guards/                # AuthGuard / PermissionGuard
    config/                # env、常量、特性开关
  shared/                  # 共享能力（纯通用，不含业务）
    ui/                    # 通用组件（Button、Modal...的二次封装）
    hooks/                 # useDebounce/useEvent...
    utils/                 # 工具函数
    types/                 # 全局类型
    lib/                   # axios实例、logger、sentry、i18n
  features/                # 业务域（强烈建议）
    auth/                  # 登录、权限、会话
      api/
      model/               # store、types、schema
      ui/
      pages/
    users/
    courses/
    students/
    orders/
    ai-center/             # AI相关管理（提示词、对话记录、审核、评价）
  assets/
  main.tsx
```

关键原则：

- shared/ 永远不依赖 features/
- features/ 之间尽量少互相 import，通过 shared 或"服务层"解耦
- app/ 只做组装，不写业务逻辑

---

## 3) 路由与菜单（动态化、可控、可审计）

后台最容易烂的是"路由/菜单/权限三套不一致"。建议以路由为主数据源：

- 路由配置包含：
  - path
  - component
  - title
  - icon
  - permission（权限点）
  - menu（是否在菜单显示、排序、分组）
- 菜单由路由树自动生成
- 用户登录后拉取 me + permissions，在前端过滤可见路由

你要"工业级"，就不要手写两套：菜单一套、路由一套。

---

## 4) 权限模型（后台必做"可运营"的权限体系）

推荐前端支持 RBAC + 细粒度 ABAC 的组合：

- RBAC：角色 → 权限点（permission code）
- ABAC：对资源做条件，例如：
  - 只能看自己校区数据
  - 只能审核自己负责班级的内容

前端落地方式：

- can(permissionCode)：按钮/菜单/页面级控制
- canAccess(resource, action, context)：ABAC 条件（如 orgId / campusId / ownerId）

UI 组件层做封装：

- `<Perm permission="user:edit">` 包裹按钮
- 路由守卫 PermissionGuard

---

## 5) API 访问层（强约束：类型、安全、可追踪）

建议统一封装一层 httpClient：

- 自动注入 Authorization
- 统一处理：
  - 401 → refresh 或登出
  - 403 → toast + 记录审计
  - 5xx → toast + 上报
- 统一请求 ID（与后端 tracing 对齐）
- 统一分页协议（page/size/total）

再用 TanStack Query 管理：

- 列表查询：useQuery
- 新增/编辑/删除：useMutation + invalidateQueries
- 表格筛选/排序与 queryKey 严格绑定，避免"刷新变空/数据串了"

---

## 6) 表单与校验（强烈建议 Zod 统一 schema）

后台表单很多，必须做到：

- 前端 schema 校验（Zod）
- 与后端 DTO 对齐（可在 NestJS 侧生成 OpenAPI，再用工具生成 TS 类型）

模式：

- schema.ts：Zod schema
- types.ts：infer 出 TS 类型
- form.tsx：React Hook Form 使用 schemaResolver

---

## 7) 组件体系（两层：基础组件 + 业务组件）

- shared/ui：通用组件（不含业务语义）
  - SmartTable、SmartFormModal、PageHeader、SearchBar、Permission、ConfirmButton…
- features/\*/ui：业务组件
  - StudentProfileCard、CoursePublishForm、OrderRefundModal…

这样做的好处：

- 后台开发效率极高（很多页面就是"搜索 + 表格 + CRUD"）
- 风格统一、改主题不痛苦

---

## 8) 工程治理（工业级的关键不是代码，是"规矩"）

必须落地的工程规范：

- Git 提交规范：Conventional Commits（commitlint）
- 代码风格：ESLint + Prettier（CI 强制）
- 提交前检查：Husky + lint-staged（只检查改动文件）
- 单测门槛：关键 util / 权限逻辑 / 表格查询逻辑要覆盖
- E2E：至少覆盖登录、权限拦截、核心 CRUD

---

## 9) 安全（后台比前台更需要）

- Token 存储：优先 httpOnly cookie（若你们后端支持），否则至少内存 + 刷新策略
- 防 XSS：不渲染不可信 HTML；必要时 DOMPurify
- 防越权：前端只做"体验层"，最终以后端鉴权为准
- 审计：关键操作（删除/退款/调权）前端加二次确认 + 操作原因输入（送后端审计）

---

## 10) 与 "nove-api / nove-ai" 的协作（后台特有）

建议把 AI 管理能力作为一个独立域（features/ai-center）：

- 提示词模板管理（版本、灰度、生效范围）
- AI 调用日志（请求/响应摘要、耗时、token、错误）
- 内容审核与人类反馈（HF/RLHF 的数据来源）
- 风险策略配置（敏感词、越权、隐私）

这能支撑你白皮书里说的 AI 服务独立化 和"高端个性化体验"的运营闭环。

---

## 11) 你可以直接照这个做的"后台页面脚手架模式"

后台 80% 页面可以统一成：

1. SearchPanel（筛选条件）
2. TablePanel（分页、排序、列配置、导出）
3. EditModal（新增/编辑）
4. DetailDrawer（详情抽屉）

把这些做成通用组件后，你们迭代速度会非常快。

---

## 12) 最小落地版本（MVP → 工业级）路线

- 第 1 周：登录 + layout + 路由 + 权限守卫 + 基础 CRUD 页面模版
- 第 2 周：通用表格/搜索组件沉淀 + TanStack Query 全面接入
- 第 3 周：审计/异常上报/埋点 + E2E 覆盖核心流程
- 第 4 周：AI-center 域上线（日志/模板/审核），并做灰度配置能力

---

如果你愿意，我可以直接给你一套可复制的"nove-admin starter 目录 + 路由权限配置样例 + axios/query 封装 + CRUD 页面模板"（就是开箱即用那种）。你告诉我你们更倾向 AntD / Arco / Mantine 哪个 UI 体系，我就按那个给。
