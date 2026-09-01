import { http } from '../../../../shared/lib/api/http';
import type {
  ConfigDetail,
  ConfigSummary,
  ModuleConfigMap,
  SaveConfigResult,
  SystemConfigModule,
  TestConfigResult,
} from '../types';

async function listConfigs(): Promise<ConfigSummary[]> {
  const response = await http.get<ConfigSummary[]>('/admin/system-config');
  return response.data;
}

async function getConfig<M extends SystemConfigModule>(
  module: M
): Promise<ConfigDetail<ModuleConfigMap[M]>> {
  const response = await http.get<ConfigDetail<ModuleConfigMap[M]>>(
    `/admin/system-config/${module}`
  );
  return response.data;
}

async function updateConfig<M extends SystemConfigModule>(
  module: M,
  data: ModuleConfigMap[M]
): Promise<SaveConfigResult> {
  const response = await http.put<SaveConfigResult>(`/admin/system-config/${module}`, data);
  return response.data;
}

async function testConfig<M extends SystemConfigModule>(
  module: M,
  data: ModuleConfigMap[M]
): Promise<TestConfigResult> {
  const response = await http.post<TestConfigResult>(`/admin/system-config/${module}/test`, data);
  return response.data;
}

async function deleteConfig(module: SystemConfigModule): Promise<SaveConfigResult> {
  const response = await http.delete<SaveConfigResult>(`/admin/system-config/${module}`);
  return response.data;
}

export const systemConfigApi = {
  listConfigs,
  getConfig,
  updateConfig,
  testConfig,
  deleteConfig,
};
