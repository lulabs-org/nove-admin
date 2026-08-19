import { http } from '../../../../shared/lib/api/http';
import type { MailConfig, SaveConfigResult, SystemConfigModule, WechatShopConfig } from '../types';

async function getConfig<T>(module: SystemConfigModule): Promise<T | null> {
  const response = await http.get<T | null>(`/admin/system-config/${module}`);
  return response.data;
}

async function updateConfig<T>(module: SystemConfigModule, data: T): Promise<SaveConfigResult> {
  const response = await http.put<SaveConfigResult>(`/admin/system-config/${module}`, data);
  return response.data;
}

async function deleteConfig(module: SystemConfigModule): Promise<SaveConfigResult> {
  const response = await http.delete<SaveConfigResult>(`/admin/system-config/${module}`);
  return response.data;
}

export const systemConfigApi = {
  getMailConfig: () => getConfig<MailConfig>('mail'),
  updateMailConfig: (data: MailConfig) => updateConfig('mail', data),
  getWechatShopConfig: () => getConfig<WechatShopConfig>('wechat-shop'),
  updateWechatShopConfig: (data: WechatShopConfig) => updateConfig('wechat-shop', data),
  deleteConfig,
};
