import { useState, useRef } from 'react';
import Select from 'antd/es/select';
import Avatar from 'antd/es/avatar';
import Space from 'antd/es/space';
import Typography from 'antd/es/typography';
import { UserOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { platformUserApi } from '../../platform-users/api/platformUserApi';
import type { LocalUserOption, PlatformUser } from '../../platform-users/api/platformUserApi';
import { localUserMeta, platformLabel } from '../lib/reportSubject';
import './UserSearchSelect.css';

const { Text } = Typography;

export interface UserFilterValue {
  /** 选中的平台用户在系统中的 id（对应 tracking-report 的 platformUserId 字段） */
  platformUserId?: string;
  /** 选中的本地用户 id（对应 tracking-report 的 subjectUserId 字段） */
  subjectUserId?: string;
  label?: string;
}

interface UserSearchSelectProps {
  value?: UserFilterValue;
  onChange?: (value: UserFilterValue | undefined) => void;
  style?: React.CSSProperties;
}

function localUserName(user: LocalUserOption) {
  return user.profile?.displayName || user.username || user.email || user.phone || user.id;
}

function platformUserName(user: PlatformUser) {
  return user.displayName ?? user.ptUserId ?? user.id;
}

/** 统一搜索本地用户与平台身份，并转换成追踪报告的身份筛选条件。 */
export function UserSearchSelect({ value, onChange, style }: UserSearchSelectProps) {
  const [keyword, setKeyword] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: result, isFetching } = useQuery({
    queryKey: ['tracking-report-subject-search', keyword],
    queryFn: async () => {
      const [localUsers, platformUsers] = await Promise.all([
        platformUserApi.searchLocalUsers(keyword),
        platformUserApi.list({ keyword, pageSize: 20 }),
      ]);
      return { localUsers, platformUsers: platformUsers.items };
    },
    staleTime: 10_000,
  });

  const localOptions = (result?.localUsers ?? []).map((user) => ({
    value: `local:${user.id}`,
    label: localUserName(user),
    user,
  }));
  const platformOptions = (result?.platformUsers ?? []).map((user) => ({
    value: `platform:${user.id}`,
    label: platformUserName(user),
    user,
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
    if (selectedId.startsWith('local:')) {
      const option = opt as { user: LocalUserOption } | undefined;
      const userId = selectedId.slice('local:'.length);
      onChange?.({
        subjectUserId: userId,
        label: option?.user ? localUserName(option.user) : userId,
      });
      return;
    }

    const option = opt as { user: PlatformUser } | undefined;
    const userId = selectedId.slice('platform:'.length);
    onChange?.({
      platformUserId: userId,
      label: option?.user ? platformUserName(option.user) : userId,
    });
  };

  const selectedValue = value?.platformUserId
    ? `platform:${value.platformUserId}`
    : value?.subjectUserId
      ? `local:${value.subjectUserId}`
      : undefined;

  return (
    <Select
      allowClear
      showSearch
      filterOption={false}
      loading={isFetching}
      placeholder="搜索报告对象 / ID"
      style={{ width: 280, ...style }}
      value={selectedValue}
      onSearch={handleSearch}
      onChange={handleChange}
      notFoundContent={isFetching ? '搜索中…' : '无匹配用户'}
      optionLabelProp="label"
    >
      <Select.OptGroup label="本地用户">
        {localOptions.map((opt) => (
          <Select.Option key={opt.value} value={opt.value} label={opt.label} user={opt.user}>
            <Space size={8} align="center">
              <Avatar size={28} src={opt.user.profile?.avatar} icon={<UserOutlined />} />
              <div className="tracking-report-search-option">
                <div>{opt.label}</div>
                <Text type="secondary">{localUserMeta(opt.user, opt.label)}</Text>
              </div>
            </Space>
          </Select.Option>
        ))}
      </Select.OptGroup>
      <Select.OptGroup label="平台身份">
        {platformOptions.map((opt) => (
          <Select.Option key={opt.value} value={opt.value} label={opt.label} user={opt.user}>
            <Space size={8} align="center">
              <Avatar size={28} icon={<UserOutlined />} />
              <div className="tracking-report-search-option">
                <div>{opt.label}</div>
                <Text type="secondary">
                  {platformLabel(opt.user.platform)} · {opt.user.ptUserId ?? opt.user.id}
                  {opt.user.localUserId ? ' · 已关联本地用户' : ' · 未关联'}
                </Text>
              </div>
            </Space>
          </Select.Option>
        ))}
      </Select.OptGroup>
    </Select>
  );
}

interface ReportSubjectMultiSelectProps {
  value?: UserFilterValue[];
  onChange?: (value: UserFilterValue[]) => void;
}

export function ReportSubjectMultiSelect({ value = [], onChange }: ReportSubjectMultiSelectProps) {
  const [keyword, setKeyword] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: result, isFetching } = useQuery({
    queryKey: ['tracking-report-subject-search', keyword],
    queryFn: async () => {
      const [localUsers, platformUsers] = await Promise.all([
        platformUserApi.searchLocalUsers(keyword),
        platformUserApi.list({ keyword, pageSize: 20 }),
      ]);
      return { localUsers, platformUsers: platformUsers.items };
    },
    staleTime: 10_000,
  });

  const handleSearch = (search: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setKeyword(search), 300);
  };
  const selectedKeys = value.map((item) =>
    item.platformUserId ? `platform:${item.platformUserId}` : `local:${item.subjectUserId}`
  );

  const handleChange = (selectedIds: string[], selectedOptions?: unknown | unknown[]) => {
    const options = Array.isArray(selectedOptions)
      ? selectedOptions
      : selectedOptions
        ? [selectedOptions]
        : [];
    const previous = new Map(
      value.map((item) => [
        item.platformUserId ? `platform:${item.platformUserId}` : `local:${item.subjectUserId}`,
        item,
      ])
    );
    const optionMap = new Map(
      options.map((option) => {
        const typed = option as { value: string; user?: LocalUserOption | PlatformUser };
        return [typed.value, typed.user] as const;
      })
    );
    onChange?.(
      selectedIds.map((selectedId) => {
        const existing = previous.get(selectedId);
        if (existing) return existing;
        const user = optionMap.get(selectedId);
        if (selectedId.startsWith('local:')) {
          const local = user as LocalUserOption | undefined;
          const id = selectedId.slice('local:'.length);
          return {
            subjectUserId: id,
            label: local ? localUserName(local) : id,
          };
        }
        const platform = user as PlatformUser | undefined;
        const id = selectedId.slice('platform:'.length);
        return {
          platformUserId: id,
          label: platform ? platformUserName(platform) : id,
        };
      })
    );
  };

  return (
    <Select
      mode="multiple"
      allowClear
      showSearch
      filterOption={false}
      loading={isFetching}
      placeholder="搜索并选择本地用户或平台身份"
      value={selectedKeys}
      onSearch={handleSearch}
      onChange={handleChange}
      notFoundContent={isFetching ? '搜索中…' : '无匹配对象'}
      optionLabelProp="label"
    >
      <Select.OptGroup label="本地用户">
        {(result?.localUsers ?? []).map((user) => {
          const label = localUserName(user);
          return (
            <Select.Option
              key={`local:${user.id}`}
              value={`local:${user.id}`}
              label={label}
              user={user}
            >
              <Space size={8} align="center">
                <Avatar size={28} src={user.profile?.avatar} icon={<UserOutlined />} />
                <div className="tracking-report-search-option">
                  <div>{label}</div>
                  <Text type="secondary">{localUserMeta(user, label)}</Text>
                </div>
              </Space>
            </Select.Option>
          );
        })}
      </Select.OptGroup>
      <Select.OptGroup label="平台身份">
        {(result?.platformUsers ?? []).map((user) => {
          const label = platformUserName(user);
          return (
            <Select.Option
              key={`platform:${user.id}`}
              value={`platform:${user.id}`}
              label={label}
              user={user}
            >
              <Space size={8} align="center">
                <Avatar size={28} icon={<UserOutlined />} />
                <div className="tracking-report-search-option">
                  <div>{label}</div>
                  <Text type="secondary">
                    {platformLabel(user.platform)} · {user.ptUserId ?? user.id}
                    {user.localUserId ? ' · 已关联本地用户' : ' · 未关联'}
                  </Text>
                </div>
              </Space>
            </Select.Option>
          );
        })}
      </Select.OptGroup>
    </Select>
  );
}
