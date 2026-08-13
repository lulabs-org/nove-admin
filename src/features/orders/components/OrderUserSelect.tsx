import { useQuery } from '@tanstack/react-query';
import Select from 'antd/es/select';
import { useEffect, useMemo, useState } from 'react';
import { orderApi } from '../api/orderApi';
import type { OrderRelation } from '../types';
import { mergeOrderUserOptions } from './orderUserOptions';

interface OrderUserSelectProps {
  value?: string;
  onChange?: (value?: string) => void;
  initialUser?: OrderRelation | null;
  placeholder: string;
}

export function OrderUserSelect({
  value,
  onChange,
  initialUser,
  placeholder,
}: OrderUserSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const usersQuery = useQuery({
    queryKey: ['order-user-options', debouncedSearch],
    queryFn: () => orderApi.searchUsers(debouncedSearch),
    enabled: open,
    staleTime: 30_000,
  });

  const options = useMemo(
    () => mergeOrderUserOptions(usersQuery.data?.items ?? [], initialUser),
    [initialUser, usersQuery.data?.items]
  );

  return (
    <Select
      allowClear
      showSearch
      value={value || undefined}
      options={options}
      placeholder={placeholder}
      filterOption={false}
      loading={usersQuery.isFetching}
      notFoundContent={
        usersQuery.isFetching ? '搜索中...' : usersQuery.isError ? '用户加载失败' : '未找到匹配用户'
      }
      onOpenChange={setOpen}
      onSearch={setSearch}
      onChange={onChange}
    />
  );
}
