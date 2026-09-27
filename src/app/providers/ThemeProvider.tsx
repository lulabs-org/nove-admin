import { useEffect, type ReactNode } from 'react';
import ConfigProvider from 'antd/es/config-provider';
import App from 'antd/es/app';
import theme from 'antd/es/theme';
import { useThemeStore } from './themeStore';

/**
 * 应用主题提供者：
 * - 根据 themeStore 切换 antd 亮/暗算法
 * - 通过 ConfigProvider.config 同步静态方法（message / Modal.confirm）的主题
 * - 将 body 背景/文字色与主题 token 同步
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeMode = useThemeStore((s) => s.theme);
  const algorithm = themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm;

  useEffect(() => {
    ConfigProvider.config({ theme: { algorithm } });
  }, [algorithm]);

  return (
    <ConfigProvider theme={{ algorithm }}>
      <App>
        <ThemeChrome themeMode={themeMode} />
        {children}
      </App>
    </ConfigProvider>
  );
}

/** 将主题 token 同步到 document（背景色、文字色、原生控件 color-scheme） */
function ThemeChrome({ themeMode }: { themeMode: 'light' | 'dark' }) {
  const { token } = theme.useToken();

  useEffect(() => {
    document.documentElement.style.colorScheme = themeMode;
    document.body.style.backgroundColor = token.colorBgLayout;
    document.body.style.color = token.colorText;
  }, [themeMode, token]);

  return null;
}
