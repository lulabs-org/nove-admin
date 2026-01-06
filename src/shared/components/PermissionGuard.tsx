import type { ReactNode } from 'react';

interface PermissionGuardProps {
  permission?: string;
  children: ReactNode;
}

export function PermissionGuard({ permission, children }: PermissionGuardProps) {
  if (!permission) {
    return <>{children}</>;
  }

  const hasPermission = checkPermission(permission);

  if (!hasPermission) {
    return <div>无权限访问</div>;
  }

  return <>{children}</>;
}

function checkPermission(permission: string): boolean {
  const userPermissions = getUserPermissions();
  return userPermissions.includes(permission);
}

function getUserPermissions(): string[] {
  return ['users:view', 'users:list', 'settings:view'];
}
