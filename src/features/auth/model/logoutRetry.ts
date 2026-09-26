import { authService } from '../api/service';

/**
 * 登出失败后，本地是否还能再试一次（因而应保留登录态）。
 *
 * 只回答一个问题：登出接口需要鉴权，本地还持有 access token 吗？
 * - 有 → 重试在技术上可行 → 保留登录态。宁可客户端多留一个 token，
 *   也不接受「客户端已登出、服务端仍存活一个幽灵 refresh token」。
 * - 没有（例如 401 触发的刷新也失败，网络层已 removeToken + clearAuth）
 *   → 重试不可能，保留是空操作 → 由调用方完成本地登出。
 *
 * 注意：本模块刻意不 import axios。任何需要检查 axios 错误对象的判别
 * 都属于网络层（shared/lib/api/），由网络层导出结论供这里使用。
 */
export function canRetryLogout(): boolean {
  return authService.getToken() !== null;
}
