import type { LocalUserOption } from '../../user-group/platform-users/api/platformUserApi';

const PLATFORM_LABELS: Record<string, string> = {
  TENCENT_MEETING: '腾讯会议',
  FEISHU: '飞书',
};

export function platformLabel(platform?: string | null) {
  if (!platform) return '平台用户';
  return PLATFORM_LABELS[platform] ?? platform;
}

export function localUserMeta(user: LocalUserOption, displayName: string) {
  return [user.username, user.email, user.phone, user.id]
    .filter((value): value is string => Boolean(value && value !== displayName))
    .slice(0, 2)
    .join(' · ');
}
