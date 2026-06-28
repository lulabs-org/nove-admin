import {
  webhookLogControllerFindAll,
  webhookLogControllerFindOne,
} from '../../../shared/lib/api/orval/business/admin-webhook-logs';
import type {
  WebhookLogControllerFindAllParams,
  WebhookLogListResponseDto,
  WebhookLogDto,
} from '../../../shared/lib/api/orval/business/schemas';

export const webhookLogApi = {
  list: (params: WebhookLogControllerFindAllParams): Promise<WebhookLogListResponseDto> => {
    return webhookLogControllerFindAll(params) as unknown as Promise<WebhookLogListResponseDto>;
  },

  getById: (id: string): Promise<WebhookLogDto> => {
    return webhookLogControllerFindOne(id) as unknown as Promise<WebhookLogDto>;
  },
};
