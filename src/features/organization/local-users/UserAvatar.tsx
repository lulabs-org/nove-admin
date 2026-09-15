import Avatar from 'antd/es/avatar';
import type { AdminUser } from './types';

const PALETTE = [
  ['#e8edff', '#4f60bd'],
  ['#e0f4ee', '#267b65'],
  ['#fff0dc', '#a56820'],
  ['#f2e8fc', '#8551b0'],
  ['#fde9ef', '#b74d72'],
  ['#e1f1fb', '#367ca5'],
] as const;

export function UserAvatar({ user }: { user: AdminUser }) {
  // Account IDs keep the fallback stable across sorting and profile edits.
  let hash = 2166136261;
  for (const character of user.id) {
    hash = Math.imul(hash ^ character.codePointAt(0)!, 16777619) >>> 0;
  }
  const [background, foreground] = PALETTE[hash % PALETTE.length];
  const name = user.profile?.displayName?.trim();
  const initial = name ? Array.from(name)[0].toLocaleUpperCase() : null;

  return (
    <Avatar
      size={36}
      src={user.profile?.avatar || undefined}
      style={{ backgroundColor: background, color: foreground, flexShrink: 0, fontWeight: 600 }}
    >
      {initial || (
        <svg
          width="26"
          height="26"
          viewBox="0 0 5 5"
          aria-hidden="true"
          style={{ display: 'block' }}
        >
          {Array.from({ length: 15 }, (_, index) => {
            const x = index % 3;
            const y = Math.floor(index / 3);
            if (!((hash >>> index) & 1) && index !== 7) return null;
            return (
              <g key={index} fill="currentColor">
                <rect x={x} y={y} width="0.85" height="0.85" rx="0.2" />
                {x < 2 && <rect x={4 - x} y={y} width="0.85" height="0.85" rx="0.2" />}
              </g>
            );
          })}
        </svg>
      )}
    </Avatar>
  );
}
