import { describe, expect, it } from 'vitest';
import { PERMISSIONS } from './permissions';

describe('API Key permissions', () => {
  it('uses the backend api-key permission namespace', () => {
    expect(PERMISSIONS.API_KEY).toEqual({
      READ: 'api-key:read',
      CREATE: 'api-key:create',
      UPDATE: 'api-key:update',
      DELETE: 'api-key:delete',
      REVOKE: 'api-key:revoke',
      ROTATE: 'api-key:rotate',
    });
  });
});

describe('OAuth client permissions', () => {
  it('uses the backend oauth-client permission namespace', () => {
    expect(PERMISSIONS.OAUTH_CLIENT).toEqual({
      READ: 'oauth-client:read',
      CREATE: 'oauth-client:create',
      UPDATE: 'oauth-client:update',
      DISABLE: 'oauth-client:disable',
      ROTATE_SECRET: 'oauth-client:rotate-secret',
    });
  });
});
