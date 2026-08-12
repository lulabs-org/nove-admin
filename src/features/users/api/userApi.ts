import { mutator } from '../../../shared/lib/api/mutator';
import type {
  AdminUser,
  UserImportResponse,
  UserListParams,
  UserListResponse,
  UserWritePayload,
} from '../types';

function queryString(params: UserListParams): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, String(value));
  });
  const value = search.toString();
  return value ? `?${value}` : '';
}

export const userApi = {
  list(params: UserListParams = {}): Promise<UserListResponse> {
    return mutator({ url: `/admin/users${queryString(params)}`, method: 'GET' });
  },

  getById(id: string): Promise<AdminUser> {
    return mutator({ url: `/admin/users/${id}`, method: 'GET' });
  },

  create(data: UserWritePayload): Promise<AdminUser> {
    return mutator({ url: '/admin/users', method: 'POST', data });
  },

  update(id: string, data: UserWritePayload): Promise<AdminUser> {
    return mutator({ url: `/admin/users/${id}`, method: 'PATCH', data });
  },

  delete(id: string): Promise<void> {
    return mutator({ url: `/admin/users/${id}`, method: 'DELETE' });
  },

  import(file: File): Promise<UserImportResponse> {
    const data = new FormData();
    data.append('file', file);
    return mutator({
      url: '/admin/users/import',
      method: 'POST',
      data,
      timeout: 60_000,
    });
  },
};
