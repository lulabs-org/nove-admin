import { describe, expect, it } from 'vitest';
import { normalizeUserPayload, validateImportFile, validateUserPayload } from './userForm';

describe('user form helpers', () => {
  it('normalizes contact information', () => {
    expect(
      normalizeUserPayload({
        email: ' User@Example.COM ',
        countryCode: ' +86 ',
        phone: '138 0013 8000',
        bio: ' 个人简介 ',
        gender: 'FEMALE',
        dateOfBirth: '2000-01-02',
      })
    ).toMatchObject({
      email: 'user@example.com',
      countryCode: '+86',
      phone: '13800138000',
      active: true,
      bio: '个人简介',
      gender: 'FEMALE',
      dateOfBirth: '2000-01-02',
    });
  });

  it('requires at least one identifier', () => {
    expect(validateUserPayload({ displayName: '匿名用户' })).toBe(
      '用户名、邮箱、手机号至少填写一个'
    );
  });

  it('requires a country code with phone', () => {
    expect(validateUserPayload({ phone: '13800138000' })).toBe('填写手机号时必须提供国家代码');
  });

  it('accepts CSV and XLSX files only', () => {
    expect(validateImportFile(new File(['email\na@example.com'], 'users.csv'))).toBeNull();
    expect(validateImportFile(new File(['x'], 'users.xls'))).toBe('仅支持 CSV 或 XLSX 文件');
  });
});
