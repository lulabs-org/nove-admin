/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type VerifyCodeDto = {
    /**
     * 目标邮箱或手机号
     */
    target: string;
    /**
     * 验证码，4-6位数字
     */
    code: string;
    /**
     * 验证码类型
     */
    type: VerifyCodeDto.type;
};
export namespace VerifyCodeDto {
    /**
     * 验证码类型
     */
    export enum type {
        REGISTER = 'register',
        LOGIN = 'login',
        RESET_PASSWORD = 'reset_password',
    }
}

