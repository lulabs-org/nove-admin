import { layoutStyles, layoutTokens } from './layoutTheme';

interface SidebarBrandProps {
  collapsed: boolean;
  title: string;
  subtitle: string;
}

export function SidebarBrand({ collapsed, title, subtitle }: SidebarBrandProps) {
  return (
    <div
      style={{
        ...layoutStyles.sidebarBrand,
        ...(collapsed ? { alignItems: 'center', padding: '12px 8px' } : {}),
      }}
    >
      {collapsed ? (
        <span
          style={{
            ...layoutStyles.sidebarBrandMark,
            fontSize: 18,
            letterSpacing: '0.08em',
          }}
        >
          N
        </span>
      ) : (
        <div style={layoutStyles.sidebarBrandRow}>
          <span style={layoutStyles.sidebarBrandMark}>Nove</span>
        </div>
      )}
      {!collapsed && (
        <>
          <span style={layoutStyles.sidebarBrandText}>{title}</span>
          <span style={{ fontSize: 13, color: layoutTokens.textMuted }}>{subtitle}</span>
        </>
      )}
    </div>
  );
}
