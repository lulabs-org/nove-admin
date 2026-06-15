import { mutator } from '../../../shared/lib/api/mutator';
import type {
  CreateOrder,
  Order,
  OrderListData,
  OrderListParams,
  OrderStatus,
  UpdateOrder,
} from '../types';

interface RawOrderList {
  items?: Order[];
  data?: Order[];
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

function cleanParams(params: OrderListParams) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== undefined && value !== null
    )
  );
}

export const orderApi = {
  async list(params: OrderListParams): Promise<OrderListData> {
    const result = await mutator<RawOrderList>({
      url: '/admin/orders',
      method: 'GET',
      params: cleanParams(params),
    });

    return {
      data: result.items ?? result.data ?? [],
      total: result.total ?? 0,
      page: result.page ?? params.page ?? 1,
      pageSize: result.pageSize ?? params.pageSize ?? 10,
      totalPages: result.totalPages ?? 0,
    };
  },

  create(data: CreateOrder): Promise<Order> {
    return mutator<Order>({
      url: '/admin/orders',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data,
    });
  },

  update(id: string, data: UpdateOrder): Promise<Order> {
    return mutator<Order>({
      url: `/admin/orders/${id}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      data,
    });
  },

  updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return mutator<Order>({
      url: `/admin/orders/${id}/status`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      data: { status },
    });
  },

  delete(id: string): Promise<void> {
    return mutator<void>({
      url: `/admin/orders/${id}`,
      method: 'DELETE',
    });
  },
};
