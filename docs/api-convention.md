# API 层规范说明

## 核心原则

**Orval 生成的东西 = "机器产物"，不要手改；你在外面包一层"人类可读"的业务 API。**

## 目录结构

```
src/
  shared/
    api/
      http.ts                # 自定义的 axios instance（统一鉴权、错误处理）
      mutator.ts             # 自定义的 mutator（可选）
      orval/                 # Orval 自动生成的代码（不要手动修改）
        business/            # nove-api 生成物
          index.ts
          schemas/
            *.ts
          *.ts
        ai/                  # nove-ai 生成物
          index.ts
          schemas/
            *.ts
          *.ts
  features/
    auth/
      api.ts                 # 业务层封装（调用 orval 生成的 client/hook）
    users/
      api.ts                 # 业务层封装
    courses/
      api.ts                 # 业务层封装
    students/
      api.ts                 # 业务层封装
    orders/
      api.ts                 # 业务层封装
    ai-center/
      api.ts                 # 业务层封装
```

## 文件职责说明

### `shared/api/http.ts`

自定义的 axios 实例，负责：

- 统一鉴权（如添加 token）
- 统一错误处理
- 请求/响应拦截
- 基础配置（baseURL、timeout 等）

### `shared/api/mutator.ts`

自定义的 mutator，用于：

- 统一处理 mutation 成功/失败
- 统一的错误提示
- 统一的数据转换

### `shared/api/orval/`

存放 Orval 自动生成的代码，**不要手动修改**：

- `business/` - 由 nove-api OpenAPI 规范生成
- `ai/` - 由 nove-ai OpenAPI 规范生成

### `features/*/api.ts`

业务层封装，负责：

- 调用 Orval 生成的 hooks/mutations
- 控制 queryKey、默认参数、缓存策略
- 统一的数据转换和错误处理
- 提供人类可读的业务 API

每个业务域（feature）都应该有自己的 `api.ts` 文件，封装该域相关的所有 API 调用。

#### 示例：用户管理 API

```typescript
// features/users/api.ts
import {
  useGetUsers,
  useUpdateUser,
  useCreateUser,
  useDeleteUser,
} from '@/shared/api/orval/business';
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

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useCreateUser({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['GetUsers'] });
      },
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useDeleteUser({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['GetUsers'] });
      },
    },
  });
};
```

#### 示例：AI 中心 API

```typescript
// features/ai-center/api.ts
import { useGetPrompts, useCreatePrompt, useUpdatePrompt } from '@/shared/api/orval/ai';
import { useQueryClient } from '@tanstack/react-query';

export const usePromptsList = (params?: { page?: number; pageSize?: number }) => {
  return useGetPrompts({
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 10,
  });
};

export const useCreatePrompt = () => {
  const queryClient = useQueryClient();

  return useCreatePrompt({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['GetPrompts'] });
      },
    },
  });
};

export const useUpdatePrompt = () => {
  const queryClient = useQueryClient();

  return useUpdatePrompt({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['GetPrompts'] });
      },
    },
  });
};
```

#### 示例：认证 API

```typescript
// features/auth/api.ts
import { useLogin, useLogout, useGetUserInfo } from '@/shared/api/orval/business';
import { useAuthStore } from './model/store';

export const useLogin = () => {
  const { setUser } = useAuthStore();

  return useLogin({
    mutation: {
      onSuccess: (data) => {
        setUser(data.user);
      },
    },
  });
};

export const useLogout = () => {
  const { clearUser } = useAuthStore();

  return useLogout({
    mutation: {
      onSuccess: () => {
        clearUser();
      },
    },
  });
};

export const useUserInfo = () => {
  return useGetUserInfo();
};
```

## package.json 脚本

```json
{
  "scripts": {
    "gen:api": "orval --config orval.config.ts",
    "gen:api:watch": "orval --config orval.config.ts --watch"
  }
}
```

## 推荐使用姿势

### ❌ 不推荐：直接使用生成的 hooks

```typescript
// features/users/pages/UserList.tsx
import { useGetUsers } from '@/shared/api/orval/business';

const UserList = () => {
  const { data, isLoading } = useGetUsers({
    page: 1,
    pageSize: 10,
  });

  // ...
};
```

### ✅ 推荐：在 feature 的 api.ts 做一层封装

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
```

```typescript
// features/users/pages/UserList.tsx
import { useUsersList, useUpdateUser } from '../api';

const UserList = () => {
  const { data, isLoading } = useUsersList({ page: 1 });
  const updateUser = useUpdateUser();

  // ...
};
```

### ✅ 推荐：跨 feature 调用 API

当需要在一个 feature 中调用另一个 feature 的 API 时，应该通过 `shared/api/orval` 调用，而不是直接 import 其他 feature 的 api.ts。

```typescript
// features/orders/pages/OrderDetail.tsx
// ❌ 不推荐：直接 import 其他 feature 的 api
import { useGetUser } from '@/features/users/api';

// ✅ 推荐：通过 shared/api/orval 调用
import { useGetUser } from '@/shared/api/orval/business';

const OrderDetail = ({ userId }: { userId: string }) => {
  const { data: user } = useGetUser({ userId });

  // ...
};
```

这样遵循了架构原则：

- **shared/ 永远不依赖 features/**
- **features/ 之间尽量少互相 import**，通过 shared 解耦

## 封装层的优势

通过在 `features/*/api.ts` 做一层封装，你可以：

1. **统一控制缓存策略**：所有相关的 API 调用使用一致的 queryKey 和缓存配置
2. **统一错误处理**：在一个地方处理所有相关的错误
3. **统一数据转换**：将后端数据格式转换为前端需要的格式
4. **易于替换**：想换 Orval / 换请求库 / 改 queryKey，都只动这一层
5. **提高可读性**：业务代码使用语义化的 API 名称

## 生成目录的 Git 策略

### 方案一：提交生成物（推荐）

**优点：**

- CI 更稳定，不依赖本地生成环境
- Code Review 能看到接口变更
- 减少环境差异导致的意外问题

**缺点：**

- 仓库体积增加
- 需要合并冲突时可能需要重新生成

**配置：**

```bash
# .gitignore 中不要忽略 orval 目录
# 确保生成的文件被提交
```

### 方案二：不提交生成物

**优点：**

- 仓库体积小
- 避免合并冲突

**缺点：**

- CI 必须跑 `gen:api` 并保证生成一致
- 不同环境可能生成不一致的代码
- Code Review 看不到接口变更

**配置：**

```bash
# .gitignore 中添加
src/shared/api/orval/
```

**CI 配置要求：**

```yaml
# .github/workflows/ci.yml
- name: Generate API
  run: npm run gen:api

- name: Check generated files
  run: git diff --exit-code src/shared/api/orval/
```

## 团队协作建议

对于后台团队协作，**更偏向"提交生成物"**，原因：

1. 减少环境差异导致的意外问题
2. Code Review 时能看到 API 变更
3. CI 流程更简单稳定
4. 新成员 clone 后直接可用，无需额外生成步骤

## 开发流程

### 修改 API 规范时

1. 更新 OpenAPI 规范文件
2. 运行 `npm run gen:api` 重新生成代码
3. 在对应的 `features/*/api.ts` 中调整封装层
4. 提交生成的代码和封装层代码

### 添加新 API 时

1. 在 OpenAPI 规范中定义新接口
2. 运行 `npm run gen:api` 生成新的 hooks/mutations
3. 在对应的 `features/*/api.ts` 中封装新接口
4. 在业务代码中使用封装后的 API

## 注意事项

- ❌ **不要手动修改** `orval/` 目录下的任何文件
- ✅ 所有业务逻辑封装在 `features/*/api.ts` 中
- ✅ 保持封装层的简洁和可读性
- ✅ 使用语义化的函数名和参数名
- ✅ 统一错误处理和缓存策略
- ✅ 定期更新 Orval 版本以获得最新特性
