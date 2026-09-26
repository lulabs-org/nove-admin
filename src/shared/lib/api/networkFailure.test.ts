import { describe, expect, it } from 'vitest';
import { isNetworkFailure } from './networkFailure';

/** 构造 axios 形状的错误对象（不依赖真实 axios 实例）。 */
function axiosError(overrides: { code?: string; status?: number } = {}) {
  return Object.assign(new Error('request failed'), {
    isAxiosError: true,
    name: 'AxiosError',
    code: overrides.code,
    response: overrides.status === undefined ? undefined : { status: overrides.status },
  });
}

describe('isNetworkFailure', () => {
  it('情景 1：没有任何响应（离线 / DNS / TLS / CORS）→ true', () => {
    expect(isNetworkFailure(axiosError({ code: 'ERR_NETWORK' }))).toBe(true);
  });

  it('情景 2：超时 / 中断 → true', () => {
    expect(isNetworkFailure(axiosError({ code: 'ECONNABORTED' }))).toBe(true);
    expect(isNetworkFailure(axiosError({ code: 'ETIMEDOUT' }))).toBe(true);
  });

  it('情景 3：网关 502 / 503 / 504 → true（业务是否执行未知）', () => {
    expect(isNetworkFailure(axiosError({ status: 502 }))).toBe(true);
    expect(isNetworkFailure(axiosError({ status: 503 }))).toBe(true);
    expect(isNetworkFailure(axiosError({ status: 504 }))).toBe(true);
  });

  it('情景 4：500 及其它 5xx → false（服务端已应答，不是网络问题）', () => {
    expect(isNetworkFailure(axiosError({ status: 500 }))).toBe(false);
    expect(isNetworkFailure(axiosError({ status: 501 }))).toBe(false);
    expect(isNetworkFailure(axiosError({ status: 505 }))).toBe(false);
  });

  it('情景 5：4xx → false（服务端已应答，不是网络问题）', () => {
    for (const status of [400, 401, 403, 404, 409, 422, 429]) {
      expect(isNetworkFailure(axiosError({ status }))).toBe(false);
    }
  });

  it('未覆盖情景：3xx → false（有些 3xx 也不是网络问题）', () => {
    expect(isNetworkFailure(axiosError({ status: 302 }))).toBe(false);
    expect(isNetworkFailure(axiosError({ status: 304 }))).toBe(false);
  });

  it('未覆盖情景：ERR_CANCELED（自己人取消）→ false', () => {
    expect(isNetworkFailure(axiosError({ code: 'ERR_CANCELED' }))).toBe(false);
  });

  it('未覆盖情景：无代号且无响应 → false（保守默认，不是判定结论）', () => {
    expect(isNetworkFailure(axiosError())).toBe(false);
  });

  it('未覆盖情景：axios 配置类错误 / 无 adapter → false', () => {
    expect(isNetworkFailure(axiosError({ code: 'ERR_BAD_OPTION_VALUE' }))).toBe(false);
    expect(isNetworkFailure(axiosError({ code: 'ERR_NOT_SUPPORT' }))).toBe(false);
  });

  it('非 axios 错误 → false', () => {
    expect(isNetworkFailure(new TypeError('crypto.randomUUID is not a function'))).toBe(false);
    expect(isNetworkFailure(new Error('刷新令牌响应缺少 accessToken'))).toBe(false);
    expect(isNetworkFailure('Network Error')).toBe(false);
    expect(isNetworkFailure(undefined)).toBe(false);
  });
});
