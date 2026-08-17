# docs/proposals — 规划期方案文档

本目录存放 nove-admin **建设初期的架构方案与开发路线**（2026-01），保留作为设计参考与决策记录。

> **重要**：项目的**现行工程规范**以 `docs/` 根目录下的文档为准：
>
> - [`docs/architecture.md`](../architecture.md) — 项目架构设计原则（目录结构 / 分层约束）
> - [`docs/permission-system.md`](../permission-system.md) — 权限守卫系统使用文档
> - [`docs/api-convention.md`](../api-convention.md) — API 层规范（Orval 产物约定 / http 封装）
> - [`docs/tanstack-query-best-practices.md`](../tanstack-query-best-practices.md) — TanStack Query 最佳实践

## 文档清单

| 文档                     | 说明                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| `architecture-plan.md`   | 工业级 nove-admin 前端架构落地方案（技术栈 / 目录 / 路由菜单 / 权限 / API 层 / 组件体系 / 工程治理） |
| `development-roadmap.md` | React 后台管理系统开发路线（从 0 到可上线骨架的步骤，含"三条铁律"与样板 feature）                    |

> 方案评审结论（已被实际落地采纳）：**单体前端（Monolith）+ 强模块边界（Feature-based）+ 工程化治理**，为未来插件化/微前端预留接口，但不提前引入复杂度。
