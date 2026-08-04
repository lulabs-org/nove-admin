import {
  platformUserControllerActivate,
  platformUserControllerDeactivate,
  platformUserControllerDeleteById,
  platformUserControllerFindById,
  platformUserControllerUpdate,
} from '../../../shared/lib/api/orval/business/platform-users';
import { mutator } from '../../../shared/lib/api/mutator';
import type { Platform } from '../../../shared/lib/api/orval/business/schemas';
import type {
  PlatformUserDto,
  PlatformUserWithProfileDto,
  UpdatePlatformUserDto,
} from '../../../shared/lib/api/orval/business/schemas';

// ─── Types ───────────────────────────────────────────────────────────────────

export type PlatformUser = PlatformUserDto;
export type PlatformUserDetail = PlatformUserWithProfileDto;
export type UpdatePlatformUser = UpdatePlatformUserDto;

export interface PlatformUserListParams {
  platform?: Platform;
  keyword?: string;
  active?: boolean;
  localUserId?: string;
  page?: number;
  pageSize?: number;
}

export interface PlatformUserListResponse {
  items: PlatformUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LocalUserOption {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const platformUserApi = {
  /** 分页列表（新增接口，直接调用 mutator） */
  async list(params: PlatformUserListParams = {}): Promise<PlatformUserListResponse> {
    const searchParams = new URLSearchParams();
    if (params.platform) searchParams.set('platform', params.platform);
    if (params.keyword) searchParams.set('keyword', params.keyword);
    if (params.active !== undefined) searchParams.set('active', String(params.active));
    if (params.localUserId) searchParams.set('localUserId', params.localUserId);
    if (params.page) searchParams.set('page', String(params.page));
    if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));

    const qs = searchParams.toString();
    return mutator<PlatformUserListResponse>({
      url: `/platform-users${qs ? `?${qs}` : ''}`,
      method: 'GET',
    });
  },

  /** 获取单个平台用户详情（含关联本地用户） */
  getById(id: string): Promise<PlatformUserDetail> {
    return platformUserControllerFindById(id);
  },

  /** 更新平台用户字段 */
  update(id: string, data: UpdatePlatformUser): Promise<PlatformUser> {
    return platformUserControllerUpdate(id, data);
  },

  /** 激活平台用户 */
  activate: (id: string): Promise<PlatformUser> => {
    return platformUserControllerActivate(id) as unknown as Promise<PlatformUser>;
  },

  /** 停用平台用户 */
  deactivate: (id: string): Promise<PlatformUser> => {
    return platformUserControllerDeactivate(id) as unknown as Promise<PlatformUser>;
  },

  /** 删除平台用户 */
  delete: (id: string): Promise<void> => {
    return platformUserControllerDeleteById(id) as unknown as Promise<void>;
  },

  searchLocalUsers: (keyword: string): Promise<LocalUserOption[]> => {
    return mutator<LocalUserOption[]>({
      url: `/platform-users/search-local-users`,
      method: 'GET',
      params: { keyword },
    });
  },
};
