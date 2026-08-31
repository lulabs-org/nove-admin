const DEVICE_ID_KEY = 'nove-device-id';

export function getDeviceId(): string {
  const existing = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const id = window.crypto.randomUUID();
  window.localStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}

export function getDeviceInfo(): string {
  const platform = navigator.platform || '未知系统';
  return `Web · ${platform}`;
}
