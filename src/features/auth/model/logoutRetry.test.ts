import { beforeEach, describe, expect, it } from 'vitest';
import { authService } from '../api/service';
import { canRetryLogout } from './logoutRetry';

describe('canRetryLogout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns true while the local access token is still present', () => {
    authService.setToken('active-token');

    expect(canRetryLogout()).toBe(true);
  });

  it('returns false once the local access token is gone', () => {
    expect(authService.getToken()).toBeNull();

    expect(canRetryLogout()).toBe(false);
  });
});
