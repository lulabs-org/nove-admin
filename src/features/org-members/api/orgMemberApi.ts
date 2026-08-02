import {
  orgMemberControllerCreateMember,
  orgMemberControllerDeleteMember,
  orgMemberControllerGetMember,
  orgMemberControllerListMembers,
  orgMemberControllerUpdateMember,
  orgMemberControllerUpdateMemberDepartments,
  orgMemberControllerUpdateMemberStatus,
} from '../../../shared/lib/api/orval/business/admin-orgmembers';
import {
  departmentControllerCreateDepartment,
  departmentControllerDeleteDepartment,
  departmentControllerGetDepartmentTree,
  departmentControllerUpdateDepartment,
} from '../../../shared/lib/api/orval/business/admin-departments';
import { organizationControllerGetOrganization } from '../../../shared/lib/api/orval/business/admin-organizations';
import { roleControllerFindAll } from '../../../shared/lib/api/orval/business/admin-roles';
import { mutator } from '../../../shared/lib/api/mutator';
import type {
  CreateDepartmentDto,
  CreateOrgMemberDto,
  DepartmentDto,
  DepartmentTreeDto,
  OrgMemberControllerListMembersParams,
  OrgMemberDetailDto,
  OrgMemberDto,
  OrganizationDto,
  RoleDto,
  UpdateDepartmentDto,
  UpdateMemberDepartmentsDto,
  UpdateMemberStatusDto,
  UpdateOrgMemberDto,
} from '../../../shared/lib/api/orval/business/schemas';

export type OrgMember = OrgMemberDto;
export type OrgMemberDetail = OrgMemberDetailDto;
export type OrgMemberListParams = OrgMemberControllerListMembersParams;
export type CreateOrgMember = CreateOrgMemberDto;
export type UpdateOrgMember = UpdateOrgMemberDto;
export type UpdateOrgMemberStatus = UpdateMemberStatusDto;
export type UpdateOrgMemberDepartments = UpdateMemberDepartmentsDto;
export type CreateDepartment = CreateDepartmentDto;
export type UpdateDepartment = Omit<UpdateDepartmentDto, 'parentId'> & {
  parentId?: string | null;
};

export type MemberType = 'INTERNAL' | 'EXTERNAL';

export interface AddMember {
  name: string;
  phone: string;
  countryCode?: string;
  email: string;
  departmentIds: string[];
  primaryDeptId: string;
  type?: MemberType;
  title?: string;
  roleIds?: string[];
}

export interface AddMemberResponse {
  member: OrgMemberDetail;
  isNewUser: boolean;
  emailSent: boolean;
}

export interface OrgMemberListResponse {
  data: OrgMember[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const orgMemberApi = {
  async list(orgId: string, params: OrgMemberListParams): Promise<OrgMemberListResponse> {
    const result = await orgMemberControllerListMembers(orgId, params);
    return {
      data: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    };
  },

  create(orgId: string, data: CreateOrgMember): Promise<OrgMemberDetail> {
    return orgMemberControllerCreateMember(orgId, data);
  },

  add(orgId: string, data: AddMember): Promise<AddMemberResponse> {
    return mutator<AddMemberResponse>({
      url: `/admin/orgs/${orgId}/members/add`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data,
    });
  },

  acceptInvitation(memberId: string, token: string): Promise<void> {
    return mutator<void>({
      url: `/admin/members/${memberId}/accept`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: { token },
    });
  },

  getById(memberId: string): Promise<OrgMemberDetail> {
    return orgMemberControllerGetMember(memberId);
  },

  update(memberId: string, data: UpdateOrgMember): Promise<OrgMemberDetail> {
    return orgMemberControllerUpdateMember(memberId, data);
  },

  updateStatus(memberId: string, data: UpdateOrgMemberStatus): Promise<OrgMemberDetail> {
    return orgMemberControllerUpdateMemberStatus(memberId, data);
  },

  updateDepartments(memberId: string, data: UpdateOrgMemberDepartments): Promise<OrgMemberDetail> {
    return orgMemberControllerUpdateMemberDepartments(memberId, data);
  },

  delete(memberId: string): Promise<void> {
    return orgMemberControllerDeleteMember(memberId);
  },

  departments(orgId: string): Promise<DepartmentTreeDto[]> {
    return departmentControllerGetDepartmentTree(orgId);
  },

  async roles(): Promise<RoleDto[]> {
    const result = await roleControllerFindAll({ active: true, page: 1, pageSize: 100 });
    return result.items;
  },

  organization(orgId: string): Promise<OrganizationDto> {
    return organizationControllerGetOrganization(orgId);
  },

  createDepartment(orgId: string, data: CreateDepartment): Promise<DepartmentDto> {
    return departmentControllerCreateDepartment(orgId, data);
  },

  updateDepartment(deptId: string, data: UpdateDepartment): Promise<DepartmentDto> {
    return departmentControllerUpdateDepartment(deptId, data as UpdateDepartmentDto);
  },

  deleteDepartment(deptId: string): Promise<void> {
    return departmentControllerDeleteDepartment(deptId);
  },
};
