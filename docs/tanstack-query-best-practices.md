# TanStack Query 最佳实践指南

本文档定义了项目中使用 TanStack Query 的标准规范和最佳实践。

## 核心原则

### 1. 列表页：useQuery（queryKey 带上筛选/分页）

列表数据查询必须使用 `useQuery`，并且 queryKey 必须包含所有筛选和分页参数，确保筛选条件与 URL 状态同步。

**标准用法：**

```typescript
import { useTableQuery, type TableQueryParams } from '@/shared/hooks/useTableQuery';

const [filters, setFilters] = useState<TableQueryParams>({
  page: 1,
  pageSize: 10,
  name: '',
  role: undefined,
});

const { data, isLoading, refetch } = useTableQuery<User>({
  queryKey: 'users',
  queryFn: userApi.list,
  params: filters,
});
```

**关键点：**

- 使用 `useTableQuery` 封装，自动处理 queryKey 的参数绑定
- queryKey 包含所有筛选参数：`['users', { page, pageSize, name, role }]`
- 筛选条件变化时，自动触发重新查询
- 避免筛选条件与 queryKey 不同步导致的"点了筛选刷新又没了"问题

### 2. 新增/编辑：useMutation，成功后 invalidateQueries

数据变更操作（新增、编辑、删除）必须使用 `useMutation`，并在成功后调用 `invalidateQueries` 刷新相关数据。

**标准用法：**

```typescript
import { useTableMutation, useTableDeleteMutation } from '@/shared/hooks/useTableQuery';

const createMutation = useTableMutation({
  queryKey: 'users',
  mutationFn: userApi.create,
  onSuccess: () => {
    message.success('创建成功');
  },
  onError: () => {
    message.error('创建失败');
  },
});

const updateMutation = useTableMutation({
  queryKey: 'users',
  mutationFn: ({ id, data }) => userApi.update(id, data),
  onSuccess: () => {
    message.success('更新成功');
  },
});

const deleteMutation = useTableDeleteMutation({
  queryKey: 'users',
  mutationFn: userApi.delete,
  onSuccess: () => {
    message.success('删除成功');
  },
});
```

**关键点：**

- 使用 `useTableMutation` 封装，自动处理 `invalidateQueries`
- mutation 成功后自动刷新列表数据
- 提供统一的成功/失败处理
- 支持 loading 状态显示

### 3. 表格筛选/排序与 queryKey 强绑定

表格的筛选、排序、分页状态必须与 queryKey 强绑定，确保用户操作不会丢失。

**标准用法：**

```typescript
const handleTableChange = (pagination, filters, sorter) => {
  setFilters((prev) => ({
    ...prev,
    page: pagination.current,
    pageSize: pagination.pageSize,
    sortField: sorter.field,
    sortOrder: sorter.order,
  }));
};

const handleSearch = (field: string, value: string) => {
  setFilters((prev) => ({
    ...prev,
    [field]: value,
    page: 1,
  }));
};
```

**关键点：**

- 所有筛选条件都存储在 state 中
- 筛选条件变化时，更新 state 并重置到第一页
- queryKey 包含所有筛选参数，确保状态同步
- 避免直接调用 API，而是通过 queryKey 触发查询

## 封装的 Hooks

### useTableQuery

用于列表数据查询，自动处理分页、筛选、排序。

```typescript
interface TableQueryParams {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
  [key: string]: any;
}

interface TableQueryResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

function useTableQuery<TData, TError = unknown>({
  queryKey,
  queryFn,
  params,
  ...options
}: UseTableQueryOptions<TData, TError>);
```

**使用示例：**

```typescript
const { data, isLoading, refetch } = useTableQuery<User>({
  queryKey: 'users',
  queryFn: userApi.list,
  params: filters,
});
```

### useTableMutation

用于数据变更操作，自动处理 `invalidateQueries`。

```typescript
function useTableMutation<TData, TError, TVariables, TContext = unknown>({
  queryKey,
  invalidateOnSuccess = true,
  successMessage,
  errorMessage,
  ...options
}: UseTableMutationOptions<TData, TError, TVariables, TContext>);
```

**使用示例：**

```typescript
const createMutation = useTableMutation({
  queryKey: 'users',
  mutationFn: userApi.create,
  onSuccess: () => {
    message.success('创建成功');
  },
});
```

### useTableDeleteMutation

专门用于删除操作，自动处理 `invalidateQueries`。

```typescript
function useTableDeleteMutation<TError = unknown, TContext = unknown>({
  queryKey,
  successMessage = '删除成功',
  errorMessage = '删除失败',
  ...options
}: UseTableDeleteMutationOptions<TError, TContext>);
```

**使用示例：**

```typescript
const deleteMutation = useTableDeleteMutation({
  queryKey: 'users',
  mutationFn: userApi.delete,
});
```

## API 层规范

### 定义 API 函数

```typescript
import { http } from '@/shared/lib/api/http';

export interface UserListParams {
  page?: number;
  pageSize?: number;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}

export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
}

export const userApi = {
  list: (params: UserListParams): Promise<UserListResponse> => {
    return http.get('/admin/users', { params });
  },

  create: (data: CreateUserDto): Promise<User> => {
    return http.post('/admin/users', data);
  },

  update: (id: string, data: UpdateUserDto): Promise<User> => {
    return http.patch(`/admin/users/${id}`, data);
  },

  delete: (id: string): Promise<void> => {
    return http.delete(`/admin/users/${id}`);
  },
};
```

**关键点：**

- 使用统一的 `http` 实例
- 返回类型明确的 Promise
- 参数和响应都有明确的类型定义
- RESTful 风格的 API 命名

## 完整示例

参考 [UserManagement.tsx](../src/features/users/UserManagement.tsx) 查看完整的实现示例。

```typescript
export function UserManagement() {
  const [filters, setFilters] = useState<TableQueryParams>({
    page: 1,
    pageSize: 10,
    name: '',
    email: '',
    role: undefined,
    status: undefined,
  });

  const { data: userList, isLoading, refetch } = useTableQuery<User>({
    queryKey: 'users',
    queryFn: userApi.list,
    params: filters,
  });

  const deleteMutation = useTableDeleteMutation({
    queryKey: 'users',
    mutationFn: userApi.delete,
    onSuccess: () => {
      message.success('删除成功');
    },
  });

  const handleSearch = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: 1,
    }));
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setFilters((prev) => ({
      ...prev,
      page: pagination.current,
      pageSize: pagination.pageSize,
      sortField: sorter.field,
      sortOrder: sorter.order,
    }));
  };

  return (
    <div>
      <Search
        placeholder="搜索姓名"
        onSearch={(value) => handleSearch('name', value)}
      />
      <Table
        columns={columns}
        dataSource={userList?.data || []}
        loading={isLoading}
        pagination={{
          current: filters.page,
          pageSize: filters.pageSize,
          total: userList?.total || 0,
        }}
        onChange={handleTableChange}
      />
    </div>
  );
}
```

## 注意事项

1. **queryKey 设计**：queryKey 必须包含所有影响查询结果的参数
2. **状态管理**：筛选、分页状态必须存储在组件 state 中
3. **错误处理**：所有 mutation 都应该有错误处理
4. **Loading 状态**：在 UI 中显示 loading 状态，提升用户体验
5. **类型安全**：所有 API 调用都应该有明确的类型定义
6. **代码复用**：使用封装的 hooks，避免重复代码

## 常见问题

### Q: 为什么筛选条件刷新后丢失了？

A: 检查 queryKey 是否包含了所有筛选参数。queryKey 必须与筛选状态同步。

### Q: 如何处理复杂的筛选条件？

A: 将所有筛选条件都放在 `TableQueryParams` 中，并在 queryKey 中包含它们。

### Q: mutation 成功后如何刷新数据？

A: 使用 `useTableMutation` 或 `useTableDeleteMutation`，它们会自动调用 `invalidateQueries`。

### Q: 如何处理跨页面的数据共享？

A: 使用相同的 queryKey，TanStack Query 会自动缓存和共享数据。

## 相关资源

- [TanStack Query 官方文档](https://tanstack.com/query/latest)
- [项目中的 UserManagement 示例](../src/features/users/UserManagement.tsx)
- [useTableQuery 封装](../src/shared/hooks/useTableQuery.ts)
