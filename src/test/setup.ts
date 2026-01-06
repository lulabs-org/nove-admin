/*
 * @Author: 杨仕明 shiming.y@qq.com
 * @Date: 2026-01-06 09:03:52
 * @LastEditors: 杨仕明 shiming.y@qq.com
 * @LastEditTime: 2026-01-06 20:28:30
 * @FilePath: /nove-admin/src/test/setup.ts
 * @Description: 
 * 
 * Copyright (c) 2026 by LuLab-Team, All Rights Reserved. 
 */
import '@testing-library/jest-dom'

// Import vi from vitest
import { vi } from 'vitest';

// Mock window.matchMedia for Ant Design components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver for Ant Design components
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
