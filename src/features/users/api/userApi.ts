import { http } from '../../../shared/lib/api/http';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserListParams {
  page?: number;
  pageSize?: number;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
}

export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role: string;
  password?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}

export const userApi = {
  list: (params: UserListParams): Promise<UserListResponse> => {
    return http.get('/admin/users', { params });
  },

  getById: (id: string): Promise<User> => {
    return http.get(`/admin/users/${id}`);
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

  audit: (id: string, approved: boolean): Promise<User> => {
    return http.post(`/admin/users/${id}/audit`, { approved });
  },
};
