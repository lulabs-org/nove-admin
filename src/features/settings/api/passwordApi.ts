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

// 提交新密码（后端内部会先 verifyCode 再改密码，前端无需单独调 verify）
export async function resetPassword(email: string, code: string, newPassword: string) {
  return authControllerResetPassword({
    target: email,
    code,
    newPassword,
  });
}
