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
