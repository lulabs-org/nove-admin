import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { SystemConfigManagement } from './SystemConfigManagement';

const mocks = vi.hoisted(() => ({
  listConfigs: vi.fn(),
  getConfig: vi.fn(),
}));

vi.mock('../../../shared/hooks/useAuth', () => ({
  useAuth: () => ({ checkPermission: () => true }),
}));

vi.mock('./api/systemConfigApi', () => ({
  systemConfigApi: {
    listConfigs: mocks.listConfigs,
    getConfig: mocks.getConfig,
    updateConfig: vi.fn(),
    testConfig: vi.fn(),
    deleteConfig: vi.fn(),
  },
}));

describe('SystemConfigManagement', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    globalThis.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  beforeEach(() => {
    mocks.listConfigs.mockResolvedValue(
      ['mail', 'ai', 'tencent-meeting', 'lark', 'wechat-shop'].map((module) => ({
        module,
        configured: module === 'mail',
        source: module === 'mail' ? 'database' : 'default',
        updatedAt: null,
        environmentImportedAt: module === 'mail' ? '2026-09-01T00:00:00.000Z' : null,
        environmentImportedFields: module === 'mail' ? ['host', 'user'] : [],
      }))
    );
    mocks.getConfig.mockImplementation((module: string) =>
      Promise.resolve({
        module,
        configured: module === 'mail',
        source: module === 'mail' ? 'database' : 'default',
        updatedAt: null,
        environmentImportedAt: module === 'mail' ? '2026-09-01T00:00:00.000Z' : null,
        environmentImportedFields: module === 'mail' ? ['host', 'user'] : [],
        value: {},
      })
    );
  });

  it('renders grouped service navigation and the Lark restart boundary', async () => {
    render(<SystemConfigManagement />);

    expect(await screen.findByText('邮件服务配置')).toBeInTheDocument();
    expect(screen.getByLabelText('查看配置说明')).toBeInTheDocument();
    expect(screen.queryByText('密钥更新说明')).not.toBeInTheDocument();
    expect(screen.getByText('通知服务')).toBeInTheDocument();
    expect(screen.getByText('AI 能力')).toBeInTheDocument();
    expect(screen.getByText('会议集成')).toBeInTheDocument();
    expect(screen.getByText('交易集成')).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('查看配置说明'));
    expect(await screen.findByText('初始配置来源')).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText('查看配置说明'));

    await userEvent.click(screen.getByText('飞书'));
    await waitFor(() => expect(mocks.getConfig).toHaveBeenCalledWith('lark'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('查看配置说明'));
    expect(await screen.findByText('飞书长连接')).toBeInTheDocument();
  });
});
