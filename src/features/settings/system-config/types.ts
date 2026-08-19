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

export type SystemConfigModule = 'mail' | 'wechat-shop';

export interface SaveConfigResult {
  success: boolean;
  message: string;
}
