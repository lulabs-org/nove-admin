import Button from 'antd/es/button';
import { layoutStyles, layoutTokens } from './layoutTheme';

interface SidebarTriggerProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function SidebarTrigger({ collapsed, onToggle }: SidebarTriggerProps) {
  return (
    <Button
      type="text"
      shape="default"
      size="small"
      className="sidebar-trigger"
      icon={
        collapsed ? (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
            style={{ opacity: 0.7 }}
          >
            <path
              d="M4 2.5L8 6L4 9.5"
              stroke={layoutTokens.textMuted}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
            style={{ opacity: 0.7 }}
          >
            <path
              d="M8 2.5L4 6L8 9.5"
              stroke={layoutTokens.textMuted}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      }
      onClick={onToggle}
      aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
      style={layoutStyles.sidebarFloatingTrigger}
    />
  );
}
