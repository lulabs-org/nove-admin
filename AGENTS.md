# Repository Guidelines

## Project Structure & Module Organization

Source lives in `src`, split into `app` for root providers, `features/<domain>` for screens and logic, `shared` for reusable UI/hooks, and `assets` for static bundles referenced via `src/assets`. Route bootstrapping occurs in `src/main.tsx` and `src/app`. Visuals and public mocks stay in `public`, while long-form documentation belongs in `docs`. API client code is generated from `orval.config.ts` into `src/shared`—keep generated files out of version control unless required. Unit-level helpers may sit under `src/test`, and browser E2E specs belong to `e2e`.

## Build, Test, and Development Commands

Use pnpm scripts: `pnpm dev` launches Vite with HMR; `pnpm build` runs TypeScript project references then bundles for production; `pnpm preview` serves the built assets. Static analysis lives in `pnpm lint`, and `pnpm format` runs Prettier across the repo. Regenerate REST clients with `pnpm api:generate` (or the watch variant during backend work). `pnpm test`, `pnpm test:run`, and `pnpm test:coverage` drive Vitest suites, while `pnpm test:e2e` runs Playwright; append `:ui` or `:debug` when triaging flakiness.

## Coding Style & Naming Conventions

TypeScript, React, and Zustand power the app: favor typed hooks and colocated `*.ts(x)` modules. Follow ESLint + Prettier defaults—2-space indentation, single quotes in TSX, and trailing commas where possible. Components, hooks, and stores use PascalCase (`UserList`) or camelCase (`useAuthStore`). Prefer function components with explicit prop interfaces, and group barrel exports inside `index.ts` per feature folder. Keep side-effectful modules (API slices, Zustand stores) isolated from UI components.

## Testing Guidelines

Unit and integration tests rely on Vitest plus Testing Library. Co-locate `*.test.ts(x)` beside the component or hook under test, or use `src/test` for cross-cutting utilities. Strive for meaningful coverage—run `pnpm test:coverage` before submitting. Playwright specs inside `e2e` should mirror high-traffic user journeys and use descriptive filenames like `auth.signin.spec.ts`. Failures must be reproducible locally before they block CI; include links to Playwright HTML reports if applicable.

## Commit & Pull Request Guidelines

Commit messages follow Conventional Commits (`feat:`, `refactor:`, `fix:`) or the scoped format already in the log (`refactor(auth): ...`). Reference issue or PR numbers in parentheses when available, e.g., `feat: add tenant dashboard (#42)`. Each pull request should describe the change, outline testing performed (commands + results), and attach UI screenshots for visual tweaks. Keep PRs focused on a single feature or fix, ensure lint/tests pass locally, and request review only after resolving TODOs and regenerating API clients when schemas shift.
