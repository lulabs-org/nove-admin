import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DataRuleBuilder } from './DataRuleBuilder';
import { validateConditionJson } from './dataRuleConstants';

globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

describe('DataRuleBuilder', () => {
  it('shows nested AND/OR groups and preserves JSON when switching modes', async () => {
    const value = JSON.stringify({
      $and: [
        { $or: [{ currentOwnerId: '${user.id}' }, { purchaserId: '${user.id}' }] },
        { status: 'PAID' },
      ],
    });
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<DataRuleBuilder value={value} resource="order" onChange={onChange} />);

    expect(screen.getByText('第 2 层条件组:')).toBeInTheDocument();
    await user.click(screen.getByText('JSON 源码'));
    expect(
      screen.getByPlaceholderText('例如 {"departmentId": "${user.departmentId}"}')
    ).toHaveValue(value);
    await user.click(screen.getByText('可视化构建'));
    expect(screen.getByText('第 2 层条件组:')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('turns an edited nested JSON condition into the same visual groups', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const value =
      '{"$and":[{"$or":[{"currentOwnerId":"${user.id}"},{"purchaserId":"${user.id}"}]},{"status":"PAID"}]}';
    render(<DataRuleBuilder value="{}" resource="order" onChange={onChange} />);
    await user.click(screen.getByText('JSON 源码'));
    await user.clear(screen.getByPlaceholderText('例如 {"departmentId": "${user.departmentId}"}'));
    await user.paste(value);
    expect(onChange).toHaveBeenLastCalledWith(value);
    await user.click(screen.getByText('可视化构建'));
    expect(screen.getByText('第 2 层条件组:')).toBeInTheDocument();
  });

  it('keeps unsupported JSON in source mode', () => {
    const value = '{"NOT":{"status":"PAID"}}';
    render(<DataRuleBuilder value={value} resource="order" />);
    expect(screen.getByDisplayValue(value)).toBeInTheDocument();
    expect(screen.getByText('可视化构建').closest('label')).toHaveClass(
      'ant-segmented-item-disabled'
    );
  });

  it('makes a new empty subgroup invalid until it contains a condition', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DataRuleBuilder value="{}" resource="order" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: /添加条件组/ }));
    expect(screen.getByText(/空条件组无法保存/)).toBeInTheDocument();
    const invalidJson = onChange.mock.lastCall?.[0] as string;
    expect(validateConditionJson(invalidJson, 'order')).toContain('至少需要');
    await user.click(screen.getAllByRole('button', { name: /添加条件$/ })[1]);
    const validJson = onChange.mock.lastCall?.[0] as string;
    expect(validateConditionJson(validJson, 'order')).toBeNull();
  });

  it('shows resource-specific grouped templates and applies the selected condition', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <DataRuleBuilder value="{}" resource="order" onChange={onChange} />
    );

    await user.click(screen.getByRole('combobox', { name: '选择规则模板' }));
    expect(screen.getByText('订单归属')).toBeInTheDocument();
    expect(screen.getByText('交易条件')).toBeInTheDocument();
    expect(screen.queryByText('本部门项目')).not.toBeInTheDocument();
    await user.click(screen.getByText('仅本人负责'));
    expect(onChange).toHaveBeenLastCalledWith(
      JSON.stringify({ currentOwnerId: '${user.id}' }, null, 2)
    );

    rerender(<DataRuleBuilder value="{}" resource="project" onChange={onChange} />);
    await user.click(screen.getByRole('combobox', { name: '选择规则模板' }));
    expect(screen.getByText('项目归属')).toBeInTheDocument();
    expect(screen.getByText('本部门项目')).toBeInTheDocument();
  });
});
