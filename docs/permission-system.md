# 权限守卫系统使用文档

## 概述

本系统提供两层权限控制：

1. **路由级权限守卫** - 控制页面访问权限
2. **按钮级权限控制** - 控制具体操作权限

## 架构设计

权限系统遵循项目的分层架构原则：

- **权限工具** - 存放在 `shared/utils/permissions.ts`，提供通用的权限检查函数
- **权限组件** - 存放在 `shared/ui/Perm/`，提供权限控制组件
- **权限守卫** - 存放在 `app/guards/`，提供路由级权限守卫
- **权限常量** - 存放在 `shared/utils/permissions.ts`，定义所有权限常量

```
src/
├── app/
│   └── guards/
│       ├── AuthGuard.tsx           # 认证守卫
│       └── PermissionGuard.tsx     # 权限守卫
├── shared/
│   ├── ui/
│   │   └── Perm/                   # 权限控制组件
│   └── utils/
│       └── permissions.ts          # 权限工具和常量
└── features/
    ├── users/
    │   └── routes.tsx              # 用户路由（含权限配置）
    └── ...
```

## 路由级权限守卫

### 基本使用

在路由配置中声明 `permission` 字段：

```tsx
import type { RouteConfig } from '../../shared/router/types';

export const userRoutes: RouteConfig[] = [
  {
    path: '/users',
    element: <UserManagement />,
    title: '用户管理',
    menu: true,
    permission: 'users:view',
    children: [
      {
        path: '/users/list',
        element: <UserList />,
        title: '用户列表',
        menu: true,
        permission: 'users:list',
      },
      {
        path: '/users/create',
        element: <CreateUser />,
        title: '创建用户',
        menu: true,
        permission: 'users:create',
      },
    ],
  },
];
```

### 权限检查规则

- 访问除 `/login` 以外的所有路由前必须已登录
- 如果路由配置了 `permission` 字段，必须具备该权限才能访问
- 支持通配符权限：`users:*` 表示拥有所有用户相关权限

## 按钮级权限控制

### Perm 组件使用

```tsx
import { Perm } from '@/shared/ui/Perm';
import { PERMISSIONS } from '@/shared/utils/permissions';

function UserManagement() {
  return (
    <div>
      <Perm permission={PERMISSIONS.USER.CREATE}>
        <Button type="primary">新增用户</Button>
      </Perm>

      <Table
        columns={[
          {
            title: '操作',
            render: (_, record) => (
              <Space>
                <Perm permission={PERMISSIONS.USER.EDIT}>
                  <Button>编辑</Button>
                </Perm>

                <Perm permission={PERMISSIONS.USER.DELETE}>
                  <Button danger>删除</Button>
                </Perm>

                <Perm permission={PERMISSIONS.USER.AUDIT}>
                  <Button>审核</Button>
                </Perm>
              </Space>
            ),
          },
        ]}
      />
    </div>
  );
}
```

### 自定义无权限时的显示内容

```tsx
<Perm permission={PERMISSIONS.USER.EDIT} fallback={<span>无权限</span>}>
  <Button>编辑</Button>
</Perm>
```

## 权限常量

使用 `PERMISSIONS` 常量避免硬编码权限字符串：

```tsx
import { PERMISSIONS } from '@/shared/utils/permissions';

// 用户管理
PERMISSIONS.USER.VIEW; // 'users:view'
PERMISSIONS.USER.CREATE; // 'users:create'
PERMISSIONS.USER.EDIT; // 'users:edit'
PERMISSIONS.USER.DELETE; // 'users:delete'
PERMISSIONS.USER.AUDIT; // 'users:audit'

// 课程管理
PERMISSIONS.COURSE.VIEW; // 'courses:view'
PERMISSIONS.COURSE.CREATE; // 'courses:create'
PERMISSIONS.COURSE.EDIT; // 'courses:edit'
PERMISSIONS.COURSE.DELETE; // 'courses:delete'

// 学生管理
PERMISSIONS.STUDENT.VIEW; // 'students:view'
PERMISSIONS.STUDENT.CREATE; // 'students:create'
PERMISSIONS.STUDENT.EDIT; // 'students:edit'
PERMISSIONS.STUDENT.DELETE; // 'students:delete'

// 订单管理
PERMISSIONS.ORDER.VIEW; // 'orders:view'
PERMISSIONS.ORDER.CREATE; // 'orders:create'
PERMISSIONS.ORDER.EDIT; // 'orders:edit'
PERMISSIONS.ORDER.DELETE; // 'orders:delete'
PERMISSIONS.ORDER.REFUND; // 'orders:refund'

// AI 中心
PERMISSIONS.AI.PROMPT.VIEW; // 'ai:prompt:view'
PERMISSIONS.AI.PROMPT.CREATE; // 'ai:prompt:create'
PERMISSIONS.AI.PROMPT.EDIT; // 'ai:prompt:edit'
PERMISSIONS.AI.PROMPT.DELETE; // 'ai:prompt:delete'
PERMISSIONS.AI.PROMPT.AUDIT; // 'ai:prompt:audit'

PERMISSIONS.AI.CONVERSATION.VIEW; // 'ai:conversation:view'
PERMISSIONS.AI.CONVERSATION.DELETE; // 'ai:conversation:delete'

PERMISSIONS.AI.EVALUATION.VIEW; // 'ai:evaluation:view'
PERMISSIONS.AI.EVALUATION.CREATE; // 'ai:evaluation:create'

// 角色管理
PERMISSIONS.ROLE.VIEW; // 'roles:view'
PERMISSIONS.ROLE.CREATE; // 'roles:create'
PERMISSIONS.ROLE.EDIT; // 'roles:edit'
PERMISSIONS.ROLE.DELETE; // 'roles:delete'
```

### 权限常量定义示例

```typescript
// shared/utils/permissions.ts
export const PERMISSIONS = {
  USER: {
    VIEW: 'users:view',
    CREATE: 'users:create',
    EDIT: 'users:edit',
    DELETE: 'users:delete',
    AUDIT: 'users:audit',
  },
  COURSE: {
    VIEW: 'courses:view',
    CREATE: 'courses:create',
    EDIT: 'courses:edit',
    DELETE: 'courses:delete',
  },
  STUDENT: {
    VIEW: 'students:view',
    CREATE: 'students:create',
    EDIT: 'students:edit',
    DELETE: 'students:delete',
  },
  ORDER: {
    VIEW: 'orders:view',
    CREATE: 'orders:create',
    EDIT: 'orders:edit',
    DELETE: 'orders:delete',
    REFUND: 'orders:refund',
  },
  AI: {
    PROMPT: {
      VIEW: 'ai:prompt:view',
      CREATE: 'ai:prompt:create',
      EDIT: 'ai:prompt:edit',
      DELETE: 'ai:prompt:delete',
      AUDIT: 'ai:prompt:audit',
    },
    CONVERSATION: {
      VIEW: 'ai:conversation:view',
      DELETE: 'ai:conversation:delete',
    },
    EVALUATION: {
      VIEW: 'ai:evaluation:view',
      CREATE: 'ai:evaluation:create',
    },
  },
  ROLE: {
    VIEW: 'roles:view',
    CREATE: 'roles:create',
    EDIT: 'roles:edit',
    DELETE: 'roles:delete',
  },
};
```

## 工具函数

### hasAnyPermission

检查是否拥有任意一个权限：

```tsx
import { hasAnyPermission } from '@/shared/utils/permissions';

const canAccess = hasAnyPermission(user.permissions, ['users:view', 'users:list']);
```

### hasAllPermissions

检查是否拥有所有权限：

```tsx
import { hasAllPermissions } from '@/shared/utils/permissions';

const canManage = hasAllPermissions(user.permissions, ['users:view', 'users:edit', 'users:delete']);
```

### hasWildcardPermission

检查权限（支持通配符）：

```tsx
import { hasWildcardPermission } from '@/shared/utils/permissions';

const canEditAny = hasWildcardPermission(user.permissions, 'users:edit');
// 如果用户有 'users:*' 或 'users:edit' 都会返回 true
```

## 权限检查逻辑

系统使用以下逻辑检查权限：

1. 首先检查精确匹配的权限
2. 如果没有精确匹配，检查通配符权限（如 `users:*`）
3. 都不匹配则返回 false

示例：

- 用户权限：`['users:*', 'roles:view']`
- 检查 `users:edit` → ✅ 匹配 `users:*`
- 检查 `roles:view` → ✅ 精确匹配
- 检查 `permissions:view` → ❌ 无权限

## 用户权限数据结构

用户对象包含 `permissions` 数组：

```tsx
interface User {
  id: string;
  email: string;
  username?: string;
  permissions?: string[];
  // ... 其他字段
}
```

## 最佳实践

1. **使用权限常量**：始终使用 `PERMISSIONS` 常量，避免硬编码字符串
2. **合理使用通配符**：为超级管理员分配 `module:*` 权限
3. **按钮级控制**：对"新增/编辑/删除/审核"等操作使用 `Perm` 组件
4. **路由级控制**：对页面访问使用路由配置的 `permission` 字段
5. **友好的错误提示**：无权限时显示清晰的提示信息
6. **遵循架构原则**：
   - 权限工具和常量放在 `shared/utils/permissions.ts`
   - 权限组件放在 `shared/ui/Perm/`
   - 权限守卫放在 `app/guards/`
   - 各个 feature 的路由配置放在各自的 `routes.tsx` 中

## 完整示例

### 用户管理完整示例

```typescript
// features/users/routes.tsx
import type { RouteConfig } from '@/shared/types/router';
import { UserList } from './pages/UserList';
import { CreateUser } from './pages/CreateUser';
import { EditUser } from './pages/EditUser';
import { PERMISSIONS } from '@/shared/utils/permissions';

export const userRoutes: RouteConfig[] = [
  {
    path: '/users',
    element: <UserList />,
    title: '用户管理',
    menu: true,
    permission: PERMISSIONS.USER.VIEW,
    children: [
      {
        path: '/users/create',
        element: <CreateUser />,
        title: '创建用户',
        menu: true,
        permission: PERMISSIONS.USER.CREATE,
      },
      {
        path: '/users/:id/edit',
        element: <EditUser />,
        title: '编辑用户',
        menu: false,
        permission: PERMISSIONS.USER.EDIT,
      },
    ],
  },
];
```

```typescript
// features/users/pages/UserList.tsx
import { Perm } from '@/shared/ui/Perm';
import { PERMISSIONS } from '@/shared/utils/permissions';
import { useUsersList, useDeleteUser } from '../api';
import { Button, Table, Space } from 'antd';

export function UserList() {
  const { data, isLoading } = useUsersList({ page: 1, pageSize: 10 });
  const deleteUser = useDeleteUser();

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Perm permission={PERMISSIONS.USER.EDIT}>
            <Button type="link" href={`/users/${record.id}/edit`}>
              编辑
            </Button>
          </Perm>

          <Perm permission={PERMISSIONS.USER.DELETE}>
            <Button type="link" danger onClick={() => deleteUser.mutate(record.id)}>
              删除
            </Button>
          </Perm>

          <Perm permission={PERMISSIONS.USER.AUDIT}>
            <Button type="link">审核</Button>
          </Perm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Perm permission={PERMISSIONS.USER.CREATE}>
        <Button type="primary" href="/users/create">
          新增用户
        </Button>
      </Perm>

      <Table
        columns={columns}
        dataSource={data?.list}
        loading={isLoading}
        rowKey="id"
      />
    </div>
  );
}
```

### AI 中心完整示例

```typescript
// features/ai-center/routes.tsx
import type { RouteConfig } from '@/shared/types/router';
import { PromptList } from './pages/PromptList';
import { CreatePrompt } from './pages/CreatePrompt';
import { ConversationList } from './pages/ConversationList';
import { PERMISSIONS } from '@/shared/utils/permissions';

export const aiCenterRoutes: RouteConfig[] = [
  {
    path: '/ai-center',
    element: <PromptList />,
    title: 'AI 中心',
    menu: true,
    permission: PERMISSIONS.AI.PROMPT.VIEW,
    children: [
      {
        path: '/ai-center/prompts/create',
        element: <CreatePrompt />,
        title: '创建提示词',
        menu: true,
        permission: PERMISSIONS.AI.PROMPT.CREATE,
      },
      {
        path: '/ai-center/conversations',
        element: <ConversationList />,
        title: '对话记录',
        menu: true,
        permission: PERMISSIONS.AI.CONVERSATION.VIEW,
      },
    ],
  },
];
```

```typescript
// features/ai-center/pages/PromptList.tsx
import { Perm } from '@/shared/ui/Perm';
import { PERMISSIONS } from '@/shared/utils/permissions';
import { usePromptsList, useDeletePrompt } from '../api';
import { Button, Table, Space, Tag } from 'antd';

export function PromptList() {
  const { data, isLoading } = usePromptsList({ page: 1, pageSize: 10 });
  const deletePrompt = useDeletePrompt();

  const columns = [
    {
      title: '提示词名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          draft: '草稿',
          pending: '待审核',
          approved: '已通过',
          rejected: '已拒绝',
        };
        return <Tag color={status === 'approved' ? 'green' : status === 'rejected' ? 'red' : 'default'}>
          {statusMap[status] || status}
        </Tag>;
      },
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Perm permission={PERMISSIONS.AI.PROMPT.EDIT}>
            <Button type="link">编辑</Button>
          </Perm>

          <Perm permission={PERMISSIONS.AI.PROMPT.DELETE}>
            <Button type="link" danger onClick={() => deletePrompt.mutate(record.id)}>
              删除
            </Button>
          </Perm>

          <Perm permission={PERMISSIONS.AI.PROMPT.AUDIT}>
            <Button type="link">审核</Button>
          </Perm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Perm permission={PERMISSIONS.AI.PROMPT.CREATE}>
        <Button type="primary">新增提示词</Button>
      </Perm>

      <Table
        columns={columns}
        dataSource={data?.list}
        loading={isLoading}
        rowKey="id"
      />
    </div>
  );
}
```
