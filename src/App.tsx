/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 07:12:18
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-07 07:16:40
 * @FilePath: /nove-admin/src/App.tsx
 * @Description:
 *
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved.
 */
import { RouterProvider } from 'react-router-dom';
import { createAppRouter } from './shared/router/utils';
import { routes } from './app/routes';

const router = createAppRouter(routes);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
