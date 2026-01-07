/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 07:30:35
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-07 07:50:57
 * @FilePath: /nove-admin/orval.config.ts
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */

import { defineConfig } from 'orval';

export default defineConfig({
  noveApi: {
    input: {
      target: 'http://localhost:3000/api-json',
    },
    output: {
      mode: 'tags',
      target: 'src/shared/api/orval/business/index.ts',
      schemas: 'src/shared/api/orval/business/schemas',
      client: 'react-query',
      prettier: true,
      override: {
        mutator: {
          path: 'src/shared/api/mutator.ts',
          name: 'mutator',
        },
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
    },
  },
});
