import axios from 'axios';

/**
 * 网络故障判定：**无法确认请求已被业务处理**。
 *
 * | 情景 | 形态                                     | 判定 |
 * |------|------------------------------------------|------|
 * | 1    | `ERR_NETWORK`（离线 / DNS / TLS / CORS） | 是   |
 * | 2    | `ECONNABORTED` / `ETIMEDOUT`             | 是   |
 * | 3    | `502` / `503` / `504`（网关无应答）      | 是   |
 * | 4    | `500` 及其它 5xx                         | 否   |
 * | 5    | `4xx`                                    | 否   |
 *
 * 4-5 是「服务端已应答」，请求确实被处理方接收，所以不是网络故障。其余形态
 * （3xx、`ERR_CANCELED`、axios 配置类错误、无代号且无响应、非 axios）一律为
 * `false`——那是「不在职责范围」的默认值，不是判定结论。
 *
 * 要改口径只动下面两个集合：把 502/503/504 移出网关集合，就变成「必须没有
 * 任何响应才算网络故障」的严格版。
 */

/** 无响应时算网络故障的代号。 */
const NO_RESPONSE_ERROR_CODES = new Set(['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT']);

/** 有响应时算网络故障的状态码：网关没把请求交给业务处理。 */
const GATEWAY_STATUSES = new Set([502, 503, 504]);

export function isNetworkFailure(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;

  const status = error.response?.status;

  if (status === undefined) return NO_RESPONSE_ERROR_CODES.has(error.code ?? '');
  return GATEWAY_STATUSES.has(status);
}
