/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 06:32:01
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-07 06:32:32
 * @FilePath: /nove-admin/src/shared/router/types.ts
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */
import type { ReactElement } from 'react';

export interface RouteConfig {
  path: string;
  element: ReactElement;
  title: string;
  icon?: ReactElement;
  permission?: string;
  menu?: boolean;
  children?: RouteConfig[];
  redirect?: string;
  hidden?: boolean;
  public?: boolean;
}
