# 权限守卫系统使用文档

## 概述

本系统提供两层权限控制：

1. **路由级权限守卫** - 控制页面访问权限
2. **按钮级权限控制** - 控制具体操作权限

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
import { Perm } from '../shared/components';
import { PERMISSIONS } from '../shared/utils/permissions';

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
import { PERMISSIONS } from '../shared/utils/permissions';

PERMISSIONS.USER.VIEW; // 'users:view'
PERMISSIONS.USER.CREATE; // 'users:create'
PERMISSIONS.USER.EDIT; // 'users:edit'
PERMISSIONS.USER.DELETE; // 'users:delete'
PERMISSIONS.USER.AUDIT; // 'users:audit'

PERMISSIONS.ROLE.VIEW; // 'roles:view'
PERMISSIONS.ROLE.CREATE; // 'roles:create'
// ... 更多权限
```

## 工具函数

### hasAnyPermission

检查是否拥有任意一个权限：

```tsx
import { hasAnyPermission } from '../shared/utils/permissions';

const canAccess = hasAnyPermission(user.permissions, ['users:view', 'users:list']);
```

### hasAllPermissions

检查是否拥有所有权限：

```tsx
import { hasAllPermissions } from '../shared/utils/permissions';

const canManage = hasAllPermissions(user.permissions, ['users:view', 'users:edit', 'users:delete']);
```

### hasWildcardPermission

检查权限（支持通配符）：

```tsx
import { hasWildcardPermission } from '../shared/utils/permissions';

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

## 完整示例

参见 [UserManagementExample.tsx](../examples/UserManagementExample.tsx)
