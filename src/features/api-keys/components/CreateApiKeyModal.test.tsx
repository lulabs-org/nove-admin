import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CreateApiKeyModal } from './CreateApiKeyModal';
import type { CreateApiKeyResult } from '../types';

vi.mock('../../../shared/hooks/useAuth', () => ({
  useAuth: () => ({ user: { permissions: [] } }),
}));

const result: CreateApiKeyResult = {
  id: 'key-1',
  name: 'test',
  prefix: 'prefix',
  last4: 'last',
  status: 'ACTIVE',
  scopes: [],
  createdAt: '2026-08-18T00:00:00.000Z',
  key: 'redacted-test-key',
};

describe('CreateApiKeyModal success state', () => {
  it('closes without submitting again when the user clicks complete', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onSubmit = vi.fn();

    render(
      <CreateApiKeyModal
        open
        loading={false}
        result={result}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    );

    await user.click(screen.getByRole('button', { name: /完\s*成/ }));

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
