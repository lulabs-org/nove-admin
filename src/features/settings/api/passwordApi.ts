import {
  verificationControllerSend,
  authControllerResetPassword,
} from '../../../shared/lib/api/orval/business/auth';

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

// 提交新密码（后端内部会先 verifyCode 再改密码，前端无需单独调 verify）
// target 为邮箱或手机号（纯号码），由调用方保证格式合规
export async function resetPassword(target: string, code: string, newPassword: string) {
  return authControllerResetPassword({
    target,
    code,
    newPassword,
  });
}
