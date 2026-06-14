---
alwaysApply: true
scene: git_message
---

# Git Commit Message 规范

格式：`<type>(<scope>): <subject>`

不超过 150 字符

## Type（必填）

feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert

## Scope（推荐）

auth, meetings, tasks, api-keys, org-members, dashboard, settings, layout, router, hooks, api, test

## Subject 规则

- 英文，小写开头，不加句号
- 描述 what 而非 how
- 祈使句（add 非 added）

## 示例

```
feat(meetings): add meeting detail page
fix(auth): include clientType in refresh token request
refactor(auth): replace context with zustand store
build: add vercel.json config for SPA routing
```
