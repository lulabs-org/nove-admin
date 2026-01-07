# 项目架构设计原则

## 目录结构设计原则

本项目采用分层架构设计，遵循以下核心原则：

### 核心架构原则

- **shared/ 永远不依赖 features/** - 保持共享层的独立性
- **features/ 之间尽量少互相 import** - 通过 shared 或"服务层"解耦
- **app/ 只做组装，不写业务逻辑** - 保持应用层的简洁性

---

## 目录结构

```
src/
├── app/                     # 应用级：入口、路由、权限守卫、布局、初始化
│   ├── providers/           # QueryClientProvider, Theme, I18n, Auth
│   ├── routes/              # 路由定义（含动态路由生成）
│   ├── layout/              # AdminLayout、Sidebar、Topbar
│   ├── guards/              # AuthGuard / PermissionGuard
│   └── config/              # env、常量、特性开关
│
├── shared/                  # 共享能力（纯通用，不含业务）
│   ├── ui/                  # 通用组件（Button、Modal...的二次封装）
│   ├── hooks/               # useDebounce/useEvent...
│   ├── utils/               # 工具函数
│   ├── types/               # 全局类型
│   ├── api/                 # API 层（http、orval 生成物、mutator）
│   └── lib/                 # axios实例、logger、sentry、i18n
│
├── features/                # 业务域（强烈建议）
│   ├── auth/                # 登录、权限、会话
│   │   ├── api/
│   │   ├── model/           # store、types、schema
│   │   ├── ui/
│   │   └── pages/
│   ├── users/               # 用户管理
│   ├── courses/             # 课程管理
│   ├── students/            # 学生管理
│   ├── orders/              # 订单管理
│   └── ai-center/           # AI相关管理（提示词、对话记录、审核、评价）
│
└── assets/                  # 静态资源
└── main.tsx                 # 应用入口
```

---

## 1. **app/** - 应用层

只负责组装，将各个模块组合成完整的应用。

### 职责

- 组装所有 features 的路由
- 配置应用级别的 Provider（QueryClient、Theme、I18n、Auth）
- 配置应用级别的 Layout（AdminLayout、Sidebar、Topbar）
- 应用初始化和启动
- 路由权限守卫配置

### 原则

- 只负责组装，不包含业务逻辑
- 协调各个模块之间的协作
- 保持简洁，避免过度设计

### 目录结构

```
app/
├── providers/
│   ├── AppProviders.tsx        # 应用级别的 Provider 配置
│   ├── QueryClientProvider.tsx # React Query 配置
│   ├── ThemeProvider.tsx       # 主题配置
│   ├── I18nProvider.tsx        # 国际化配置
│   └── AuthProvider.tsx        # 认证状态管理
├── routes/
│   ├── index.tsx               # 路由入口，组合所有 features 的路由
│   └── dynamicRoutes.tsx       # 动态路由生成逻辑
├── layout/
│   ├── AdminLayout.tsx         # 管理后台主布局
│   ├── Sidebar.tsx             # 侧边栏
│   ├── Topbar.tsx              # 顶部导航栏
│   └── Breadcrumb.tsx          # 面包屑导航
├── guards/
│   ├── AuthGuard.tsx           # 认证守卫
│   └── PermissionGuard.tsx     # 权限守卫
└── config/
    ├── env.ts                  # 环境变量配置
    ├── constants.ts            # 常量定义
    └── features.ts             # 特性开关
```

### 示例

```typescript
// app/providers/AppProviders.tsx
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// app/routes/index.tsx
import { authRoutes } from '@/features/auth/routes';
import { userRoutes } from '@/features/users/routes';
import { aiCenterRoutes } from '@/features/ai-center/routes';

export const appRoutes = [
  ...authRoutes,
  ...userRoutes,
  ...aiCenterRoutes,
  // ... 其他 features 的路由
];
```

---

## 2. **shared/** - 共享层

存放"可复用、无业务语义"的基础设施代码。

### 职责

- 提供通用的工具函数和类型定义
- 封装第三方库（如 axios 封装、本地存储等）
- 提供可复用的 UI 组件
- 实现通用的 React Hooks
- 提供 API 层基础设施（http、orval 生成物）

### 原则

- 可复用，无业务语义
- 不依赖业务逻辑
- 可以被任何 feature 使用
- 保持独立性和可测试性
- **永远不依赖 features/**

### 目录结构

```
shared/
├── ui/                      # 通用组件（二次封装）
│   ├── Button/
│   ├── Modal/
│   ├── Table/
│   ├── Form/
│   └── Perm/                # 权限控制组件
├── hooks/                   # 通用 React Hooks
│   ├── useDebounce.ts
│   ├── useEvent.ts
│   ├── useLocalStorage.ts
│   └── usePermission.ts
├── utils/                   # 工具函数
│   ├── format.ts            # 格式化工具
│   ├── validate.ts          # 验证工具
│   └── permissions.ts       # 权限工具
├── types/                   # 全局类型定义
│   ├── api.ts               # API 通用类型
│   ├── router.ts            # 路由类型
│   └── common.ts            # 通用类型
├── api/                     # API 层
│   ├── http.ts              # axios 实例
│   ├── mutator.ts           # 自定义 mutator
│   └── orval/               # Orval 生成物（不要手动修改）
│       ├── business/
│       └── ai/
└── lib/                     # 第三方库封装
    ├── logger.ts            # 日志工具
    ├── sentry.ts            # 错误监控
    └── i18n.ts              # 国际化工具
```

### 示例

```typescript
// shared/ui/Button/index.tsx
export const Button = ({ children, ...props }: ButtonProps) => {
  return <AntButton {...props}>{children}</AntButton>;
};

// shared/hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// shared/utils/permissions.ts
export const PERMISSIONS = {
  USER: {
    VIEW: 'users:view',
    CREATE: 'users:create',
    EDIT: 'users:edit',
    DELETE: 'users:delete',
  },
  // ... 更多权限
};
```

---

## 3. **features/** - 功能层

按业务域拆分，每个 feature 代表一个独立的业务功能模块。

### 职责

- 实现具体的业务功能
- 管理业务相关的状态和逻辑
- 提供业务特定的组件和服务
- 封装业务 API 调用

### 原则

- 按业务域拆分，高内聚
- 可以使用 shared 中的代码
- **不依赖其他 features**（避免循环依赖）
- **features 之间尽量少互相 import**，通过 shared 或"服务层"解耦
- 每个 feature 应该是独立的

### 目录结构

```
features/
├── auth/                    # 登录、权限、会话
│   ├── api/                 # 业务 API 封装
│   ├── model/               # store、types、schema
│   ├── ui/                  # 业务组件
│   ├── pages/               # 页面组件
│   └── routes.tsx           # 路由定义
├── users/                   # 用户管理
│   ├── api/
│   ├── model/
│   ├── ui/
│   ├── pages/
│   └── routes.tsx
├── courses/                 # 课程管理
│   ├── api/
│   ├── model/
│   ├── ui/
│   ├── pages/
│   └── routes.tsx
├── students/                # 学生管理
│   ├── api/
│   ├── model/
│   ├── ui/
│   ├── pages/
│   └── routes.tsx
├── orders/                  # 订单管理
│   ├── api/
│   ├── model/
│   ├── ui/
│   ├── pages/
│   └── routes.tsx
└── ai-center/               # AI相关管理
    ├── api/
    ├── model/
    ├── ui/
    ├── pages/
    └── routes.tsx
```

### 示例

```typescript
// features/users/api.ts
import { useGetUsers, useUpdateUser } from '@/shared/api/orval/business';
import { useQueryClient } from '@tanstack/react-query';

export const useUsersList = (params?: { page?: number; pageSize?: number }) => {
  return useGetUsers({
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 10,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useUpdateUser({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['GetUsers'] });
      },
    },
  });
};

// features/users/routes.tsx
import type { RouteConfig } from '@/shared/types/router';
import { UserList } from './pages/UserList';
import { CreateUser } from './pages/CreateUser';

export const userRoutes: RouteConfig[] = [
  {
    path: '/users',
    element: <UserList />,
    title: '用户管理',
    menu: true,
    permission: 'users:view',
  },
  {
    path: '/users/create',
    element: <CreateUser />,
    title: '创建用户',
    menu: true,
    permission: 'users:create',
  },
];
```

---

## 架构优势

1. **清晰的职责分离**：每个层级有明确的职责边界
2. **高内聚低耦合**：业务模块独立，依赖关系清晰
3. **易于维护**：代码按业务域组织，修改时影响范围小
4. **便于扩展**：新增功能只需在 features 中添加新模块
5. **团队协作友好**：不同开发者可以并行开发不同的 features
6. **依赖关系清晰**：shared → features → app，单向依赖

---

## 开发指南

### 添加新功能时

1. 在 `features/` 下创建对应的业务域目录
2. 按照标准目录结构组织代码（api、model、ui、pages、routes.tsx）
3. 在 `app/routes/index.tsx` 中导入并注册新路由
4. 如需新的共享工具，在 `shared/` 中添加
5. 在 `app/providers/` 中配置必要的 Provider

### 判断代码应该放在哪里

- **如果是通用的、可复用的、无业务语义的** → `shared/`
- **如果是特定业务功能的** → `features/对应业务域/`
- **如果是应用级别的组装配置** → `app/`

### features 之间需要交互时

**❌ 不推荐：直接 import**

```typescript
// features/orders/pages/OrderDetail.tsx
import { getUserInfo } from '@/features/users/api'; // ❌ 避免
```

**✅ 推荐：通过 shared 解耦**

```typescript
// shared/api/orval/business.ts
// Orval 生成的 hooks 已经在 shared 中

// features/orders/pages/OrderDetail.tsx
import { useGetUser } from '@/shared/api/orval/business'; // ✅ 推荐
```

或者通过"服务层"解耦：

```typescript
// shared/services/userService.ts
export const userService = {
  getUserInfo: (id: string) => {
    /* ... */
  },
};

// features/orders/pages/OrderDetail.tsx
import { userService } from '@/shared/services/userService'; // ✅ 推荐
```

---

## 注意事项

- ❌ 避免在 `shared/` 中包含业务逻辑
- ❌ 避免在 `features/` 之间直接依赖（通过 shared 间接依赖）
- ❌ 避免在 `app/` 中包含业务逻辑
- ❌ `shared/` 永远不依赖 `features/`
- ✅ 保持每个 feature 的独立性
- ✅ 保持 shared 的通用性
- ✅ 保持 app 的简洁性
- ✅ 遵循单向依赖原则：shared → features → app
