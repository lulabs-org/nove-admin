import {
  orgIntegrationControllerCreate,
  orgIntegrationControllerFindAll,
  orgIntegrationControllerFindOne,
  orgIntegrationControllerUpdate,
  orgIntegrationControllerRemove,
} from '../../../shared/lib/api/orval/business/admin-organization-integrations';
import type {
  CreateOrgIntegrationDto,
  UpdateOrgIntegrationDto,
  OrgIntegrationDto,
} from '../../../shared/lib/api/orval/business/schemas';

export const integrationApi = {
  create(orgId: string, data: CreateOrgIntegrationDto): Promise<OrgIntegrationDto> {
    return orgIntegrationControllerCreate(orgId, data);
  },
  findAll(orgId: string): Promise<OrgIntegrationDto[]> {
    return orgIntegrationControllerFindAll(orgId);
  },
  findOne(orgId: string, platform: string): Promise<OrgIntegrationDto> {
    return orgIntegrationControllerFindOne(orgId, platform);
  },
  update(
    orgId: string,
    platform: string,
    data: UpdateOrgIntegrationDto
  ): Promise<OrgIntegrationDto> {
    return orgIntegrationControllerUpdate(orgId, platform, data);
  },
  remove(orgId: string, platform: string): Promise<void> {
    return orgIntegrationControllerRemove(orgId, platform) as unknown as Promise<void>;
  },
};
