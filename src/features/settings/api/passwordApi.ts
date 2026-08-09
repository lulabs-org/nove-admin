import { verificationControllerSend } from '../../../shared/lib/api/orval/business/auth';
import { http } from '../../../shared/lib/api/http';

// 发送邮箱验证码（重置密码场景）
export async function sendEmailCode(email: string) {
  return verificationControllerSend({
    target: email,
    type: 'reset_password',
  });
}

// 发送手机验证码（重置密码场景）
// phone 为纯号码（不含国家码/+/空格/横线），countryCode 形如 "+86"
export async function sendPhoneCode(phone: string, countryCode?: string) {
  return verificationControllerSend({
    target: phone,
    type: 'reset_password',
    countryCode,
  });
}

export interface ResetPasswordResult {
  success: boolean;
  message: string;
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
  refreshExpiresIn?: number;
}

// 提交新密码（后端内部会先 verifyCode 再改密码，并吊销所有现有会话、为本设备签发新 token）
// target 为邮箱或手机号（纯号码），由调用方保证格式合规
// clientType='web' 时 refresh token 通过 httpOnly cookie 下发，body 不返回 refreshToken
export async function resetPassword(
  target: string,
  code: string,
  newPassword: string,
  clientType: 'web' | 'app' = 'web'
): Promise<ResetPasswordResult> {
  return http
    .post<ResetPasswordResult>('/api/auth/reset-password', {
      target,
      code,
      newPassword,
      clientType,
    })
    .then((res) => res.data);
}
