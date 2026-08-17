import { describe, expect, it } from 'vitest';
import { buildMailConfigPayload, buildWechatShopConfigPayload } from './configPayload';

describe('system config payloads', () => {
  it('does not overwrite the saved SMTP password when the password field is blank', () => {
    expect(
      buildMailConfigPayload({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        user: 'noreply@example.com',
        pass: '   ',
        from: 'noreply@example.com',
      })
    ).not.toHaveProperty('pass');
  });

  it('only includes Wechat Shop secrets the administrator entered', () => {
    expect(
      buildWechatShopConfigPayload({
        appId: 'wx123',
        appSecret: '',
        webhookToken: 'new-token',
        encodingAesKey: '',
      })
    ).toEqual({ appId: 'wx123', webhookToken: 'new-token' });
  });

  it('keeps the API mask in the update payload so the server preserves the secret', () => {
    expect(
      buildMailConfigPayload({
        host: 'smtp.example.com',
        port: 465,
        secure: true,
        user: 'noreply@example.com',
        pass: '********',
        from: 'noreply@example.com',
      })
    ).toHaveProperty('pass', '********');
  });
});
