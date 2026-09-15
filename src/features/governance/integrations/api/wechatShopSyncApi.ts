import { mutator } from '../../../../shared/lib/api/mutator';

export type WechatSyncKind = 'orders' | 'aftersale';
export type WechatSyncTimeField = 'create_time_range' | 'update_time_range';
export type WechatSyncPayload = Partial<
  Record<WechatSyncTimeField, { start_time: string; end_time: string }>
>;

export const wechatShopSyncApi = {
  historySync(kind: WechatSyncKind, data: WechatSyncPayload) {
    return mutator<{ success: boolean; result: { enqueuedRangeTasks: number } }>({
      url:
        kind === 'orders'
          ? '/wechat-shop/orders/history-sync'
          : '/wechat-shop/orders/aftersale/history-sync',
      method: 'POST',
      data,
    });
  },
};
