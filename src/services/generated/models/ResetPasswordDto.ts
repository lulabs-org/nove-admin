/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ResetPasswordDto = {
    /**
     * 目标邮箱或手机号
     */
    target: string;
    /**
     * 重置密码验证码
     */
    code: string;
    /**
     * 新密码，至少6位且包含字母和数字
     */
    newPassword: string;
};

