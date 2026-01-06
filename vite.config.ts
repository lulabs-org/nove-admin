/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-07 02:58:52
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-07 03:04:11
 * @FilePath: /nove-admin/vite.config.ts
 * @Description: 
 * 
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved. 
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
