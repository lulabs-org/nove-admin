import type { CSSProperties } from 'react';

export const layoutTokens = {
  accent: '#6366f1',
  accentSoft: 'rgba(99, 102, 241, 0.12)',
  textMuted: '#64748b',
  canvas: 'linear-gradient(135deg, #eef2ff 0%, #fdf2f8 45%, #f9fafb 100%)',
  panelBg: 'rgba(255, 255, 255, 0.96)',
  borderColor: 'rgba(15, 23, 42, 0.08)',
} as const;

export const commonStyles = {
  glassPanel: {
    background: layoutTokens.panelBg,
    borderRadius: 24,
    border: `1px solid ${layoutTokens.borderColor}`,
    boxShadow: '0 25px 65px rgba(15, 23, 42, 0.08)',
    backdropFilter: 'blur(16px)',
  } as CSSProperties,
};

interface LayoutStyleSet {
  shell: CSSProperties;
  innerShell: CSSProperties;
  sidebar: CSSProperties;
  sidebarBrand: CSSProperties;
  sidebarBrandRow: CSSProperties;
  sidebarBrandMark: CSSProperties;
  sidebarBrandText: CSSProperties;
  sidebarFooter: CSSProperties;
  sidebarFloatingTrigger: CSSProperties;
  sidebarMenuWrap: CSSProperties;
  menu: CSSProperties;
  header: CSSProperties;
  contentArea: CSSProperties;
  contentCard: CSSProperties;
  topbar: CSSProperties;
  topbarActions: CSSProperties;
  publicShell: CSSProperties;
  publicContent: CSSProperties;
  publicCard: CSSProperties;
}

export const layoutStyles: LayoutStyleSet = {
  shell: {
    minHeight: '100vh',
    background: layoutTokens.canvas,
    padding: 24,
    gap: 24,
    display: 'flex',
  },
  innerShell: {
    background: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
  },
  sidebar: {
    ...commonStyles.glassPanel,
    padding: '24px 16px',
    width: 280,
    borderRadius: 28,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    position: 'relative',
  },
  sidebarBrand: {
    padding: '0 8px 16px',
    borderBottom: `1px solid ${layoutTokens.accentSoft}`,
    marginBottom: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  sidebarBrandRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sidebarBrandMark: {
    fontSize: 12,
    letterSpacing: '0.28em',
    textTransform: 'uppercase',
    color: layoutTokens.accent,
    fontWeight: 600,
  },
  sidebarBrandText: {
    fontSize: 20,
    fontWeight: 700,
    color: '#0f172a',
  },
  sidebarFooter: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    paddingTop: 16,
    fontSize: 12,
    color: layoutTokens.textMuted,
    borderTop: `1px dashed ${layoutTokens.accentSoft}`,
  },
  sidebarFloatingTrigger: {
    position: 'absolute',
    top: '50%',
    right: -5,
    width: 18,
    height: 64,
    transform: 'translateY(-50%)',
    borderRadius: 999,
    background: layoutTokens.panelBg,
    backgroundImage: `linear-gradient(90deg, ${layoutTokens.panelBg} 0%, rgba(255, 255, 255, 0.9) 65%, rgba(255, 255, 255, 0) 100%)`,
    border: 'none',
    boxShadow: 'none',
    opacity: 0.85,
    padding: 0,
  },
  sidebarMenuWrap: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    paddingBottom: 64,
  },
  menu: {
    background: 'transparent',
    borderRight: 'none',
    padding: '12px 0',
  },
  header: {
    ...commonStyles.glassPanel,
    borderRadius: 28,
    padding: '20px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '0 0 24px',
  },
  contentArea: {
    margin: 0,
    padding: 0,
    display: 'flex',
    flex: 1,
    minHeight: 0,
  },
  contentCard: {
    ...commonStyles.glassPanel,
    padding: 32,
    height: '100%',
    width: '100%',
    flex: 1,
  },
  topbar: {
    ...commonStyles.glassPanel,
    borderRadius: 28,
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    height: 'auto',
    lineHeight: 'normal',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  topbarActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  publicShell: {
    minHeight: '100vh',
    background: layoutTokens.canvas,
    padding: '48px 24px',
  },
  publicContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 0',
  },
  publicCard: {
    ...commonStyles.glassPanel,
    width: '100%',
    maxWidth: 520,
    padding: '48px 40px',
  },
};

export const createCardStyle = (overrides: CSSProperties = {}) => ({
  ...layoutStyles.contentCard,
  ...overrides,
});
