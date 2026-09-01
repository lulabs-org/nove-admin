export type SystemConfigModule = 'mail' | 'ai' | 'tencent-meeting' | 'lark' | 'wechat-shop';

export type ConfigSource = 'database' | 'default';

export interface ConfigSummary {
  module: SystemConfigModule;
  configured: boolean;
  source: ConfigSource;
  updatedAt: string | null;
  environmentImportedAt: string | null;
  environmentImportedFields: string[];
}

export interface ConfigDetail<T> extends ConfigSummary {
  value: T;
}

export interface MailConfig {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  from?: string;
  brandName?: string;
  brandLogoUrl?: string;
  brandPrimaryColor?: string;
  brandFooterText?: string;
  brandPublicBaseUrl?: string;
}

export interface AiConfig {
  provider?: 'ark' | 'openai' | 'custom';
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface TencentMeetingConfig {
  appId?: string;
  sdkId?: string;
  secretId?: string;
  secretKey?: string;
  userId?: string;
  webhookToken?: string;
  encodingAesKey?: string;
}

export interface LarkConfig {
  appId?: string;
  appSecret?: string;
  eventEncryptKey?: string;
  eventVerificationToken?: string;
  bitableAppToken?: string;
  meetingTableId?: string;
  meetingUserTableId?: string;
  recordingFileTableId?: string;
  personalSummaryTableId?: string;
}

export interface WechatShopConfig {
  appId?: string;
  appSecret?: string;
  webhookToken?: string;
  encodingAesKey?: string;
  apiBaseUrl?: string;
}

export type ModuleConfigMap = {
  mail: MailConfig;
  ai: AiConfig;
  'tencent-meeting': TencentMeetingConfig;
  lark: LarkConfig;
  'wechat-shop': WechatShopConfig;
};

export interface SaveConfigResult {
  success: boolean;
  message: string;
  restartRequired: boolean;
}

export interface TestConfigResult {
  success: boolean;
  message: string;
}
