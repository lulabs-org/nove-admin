import { useQuery } from '@tanstack/react-query';
import Select from 'antd/es/select';
import { useEffect, useMemo, useState } from 'react';
import { orderApi } from '../api/orderApi';
import type { OrderRelation } from '../types';
import { mergeOrderChannelOptions } from './orderChannelOptions';

interface OrderChannelSelectProps {
  value?: number;
  onChange?: (value?: number) => void;
  initialChannel?: OrderRelation | null;
}

export function OrderChannelSelect({ value, onChange, initialChannel }: OrderChannelSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const channelsQuery = useQuery({
    queryKey: ['order-channel-options', debouncedSearch],
    queryFn: () => orderApi.searchChannels(debouncedSearch),
    enabled: open,
    staleTime: 30_000,
  });

  const options = useMemo(
    () => mergeOrderChannelOptions(channelsQuery.data?.items ?? [], initialChannel),
    [channelsQuery.data?.items, initialChannel]
  );

  return (
    <Select
      allowClear
      showSearch
      value={value ?? undefined}
      options={options}
      placeholder="搜索渠道名称或编码"
      filterOption={false}
      loading={channelsQuery.isFetching}
      notFoundContent={
        channelsQuery.isFetching
          ? '搜索中...'
          : channelsQuery.isError
            ? '渠道加载失败'
            : '未找到匹配渠道'
      }
      onOpenChange={setOpen}
      onSearch={setSearch}
      onChange={onChange}
    />
  );
}
