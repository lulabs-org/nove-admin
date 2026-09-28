import { useEffect, useMemo, type ReactNode } from 'react';
import ConfigProvider from 'antd/es/config-provider';
import App from 'antd/es/app';
import theme from 'antd/es/theme';
import { useThemeStore } from './themeStore';

/**
 * 品牌主色：全站唯一的主色来源。
 *
 * 改造前各业务 CSS 里散落着 #3370ff（飞书蓝）、#2563eb（Tailwind blue-600）、
 * #1664ff / #1d4ed8 / #587ac5 等多个互不相同的「主色」，以及 #f0f5ff / #eff6ff /
 * #f0f7ff … 等 8 种手调浅蓝底。现在只在这里声明一次，antd 会据此派生
 * colorPrimaryBg / colorPrimaryBorder / colorPrimaryHover / colorPrimaryActive
 * 等整套色阶，并由 darkAlgorithm 自动生成深色模式版本。
 */
const BRAND_PRIMARY = '#3370ff';

/**
 * 骨架层组件的默认色在这里声明一次，不再散落在 Topbar / Sidebar / AdminLayout
 * 的内联样式里：
 * - Layout.headerBg 的 antd 默认值是深蓝 #001529，本应用要的是「浅色顶栏」，
 *   所以显式声明为 colorBgContainer（深色模式下自动变为深底）。
 * - Layout.lightSiderBg / Menu.itemBg 的 antd 默认值是 colorBgContainer，
 *   本应用的侧边栏是浅灰底、内容区是白底，这里统一声明为 colorBgLayout。
 */
const BRAND_TOKEN = {
  colorPrimary: BRAND_PRIMARY,
  colorInfo: BRAND_PRIMARY,
  colorLink: BRAND_PRIMARY,
};

/**
 * 应用主题提供者：
 * - 根据 themeStore 切换 antd 亮/暗算法，并注入统一的品牌 token
 * - 通过 ConfigProvider.config 同步静态方法（message / Modal.confirm）的主题
 * - 将 body 背景/文字色与主题 token 同步
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeMode = useThemeStore((s) => s.theme);
  const algorithm = themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm;

  const components = useMemo(() => {
    const token = theme.getDesignToken({ algorithm, token: BRAND_TOKEN });
    return {
      Layout: {
        headerBg: token.colorBgContainer,
        lightSiderBg: token.colorBgLayout,
      },
      Menu: {
        itemBg: token.colorBgLayout,
      },
    };
  }, [algorithm]);

  useEffect(() => {
    ConfigProvider.config({ theme: { algorithm, token: BRAND_TOKEN, components } });
  }, [algorithm, components]);

  return (
    <ConfigProvider theme={{ algorithm, token: BRAND_TOKEN, components }}>
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
