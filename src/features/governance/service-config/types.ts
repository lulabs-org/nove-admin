export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass?: string;
  from: string;
}

export interface WechatShopConfig {
  appId: string;
  appSecret?: string;
  webhookToken?: string;
  encodingAesKey?: string;
  apiBaseUrl?: string;
}

export interface DriveConfig {
  defaultOrgId: string;
  downloadUrlExpiresSeconds?: number;
  recycleRetentionDays?: number;
  allowedExtensions?: string[];
  imageMaxMiB?: number;
  documentMaxMiB?: number;
  audioMaxMiB?: number;
  videoMaxMiB?: number;
  malwareScanProvider?: 'ALIYUN_SAS' | 'CLAMAV';
  aliyunSasRegionId?: string;
  scanTimeoutMs?: number;
  scanPollIntervalMs?: number;
  clamAvHost?: string;
  clamAvPort?: number;
  clamAvTimeoutMs?: number;
}

export type SystemConfigModule = 'mail' | 'wechat-shop' | 'drive';

export interface SaveConfigResult {
  success: boolean;
  message: string;
}
