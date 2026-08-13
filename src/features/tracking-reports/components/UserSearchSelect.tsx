import { useState, useRef } from 'react';
import Select from 'antd/es/select';
import Avatar from 'antd/es/avatar';
import Space from 'antd/es/space';
import Typography from 'antd/es/typography';
import { UserOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { platformUserApi } from '../../platform-users/api/platformUserApi';
import type { PlatformUser } from '../../platform-users/api/platformUserApi';

const { Text } = Typography;

export interface UserFilterValue {
  /** 选中的平台用户在系统中的 id（对应 tracking-report 的 platformUserId 字段） */
  platformUserId?: string;
  /** 选中的平台用户关联的本地用户 id（对应 tracking-report 的 subjectUserId 字段） */
  subjectUserId?: string;
  label?: string;
}

interface UserSearchSelectProps {
  value?: UserFilterValue;
  onChange?: (value: UserFilterValue | undefined) => void;
  style?: React.CSSProperties;
}

/** 单一选择框，搜索平台用户后同时获得 platformUserId 和 subjectUserId */
export function UserSearchSelect({ value, onChange, style }: UserSearchSelectProps) {
  const [keyword, setKeyword] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: result, isFetching } = useQuery({
    queryKey: ['platform-users-search', keyword],
    queryFn: () => platformUserApi.list({ keyword, pageSize: 20 }),
    staleTime: 10_000,
  });

  const options = (result?.items ?? []).map((u: PlatformUser) => ({
    value: u.id,
    label: u.displayName ?? u.ptUserId ?? u.id,
    user: u,
  }));

  const handleSearch = (v: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setKeyword(v), 300);
  };

  const handleChange = (selectedId: string | undefined, opt: unknown) => {
    if (!selectedId) {
      onChange?.(undefined);
      return;
    }
    const option = opt as { user: PlatformUser } | undefined;
    const u = option?.user;
    onChange?.({
      platformUserId: selectedId,
      subjectUserId: u?.localUserId ?? undefined,
      label: u?.displayName ?? u?.ptUserId ?? selectedId,
    });
  };

  return (
    <Select
      allowClear
      showSearch
      filterOption={false}
      loading={isFetching}
      placeholder="搜索用户名 / ID"
      style={{ width: 240, ...style }}
      value={value?.platformUserId ?? undefined}
      onSearch={handleSearch}
      onChange={handleChange}
      notFoundContent={isFetching ? '搜索中…' : '无匹配用户'}
      optionLabelProp="label"
    >
      {options.map((opt) => (
        <Select.Option key={opt.value} value={opt.value} label={opt.label} user={opt.user}>
          <Space size={8} align="center">
            <Avatar
              size={24}
              icon={<UserOutlined />}
              style={{ flexShrink: 0, background: '#e6e6e6', color: '#888' }}
            />
            <div style={{ lineHeight: 1.35 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>
                {opt.user.displayName ?? opt.user.ptUserId ?? opt.user.id}
              </div>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {opt.user.platform} · {opt.user.ptUserId ?? opt.user.id}
              </Text>
            </div>
          </Space>
        </Select.Option>
      ))}
    </Select>
  );
}
