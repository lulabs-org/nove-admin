export const PERMISSIONS = {
  USER: {
    VIEW: 'users:view',
    LIST: 'users:list',
    CREATE: 'users:create',
    EDIT: 'users:edit',
    DELETE: 'users:delete',
    AUDIT: 'users:audit',
  },
  ROLE: {
    VIEW: 'roles:view',
    LIST: 'roles:list',
    CREATE: 'roles:create',
    EDIT: 'roles:edit',
    DELETE: 'roles:delete',
  },
  PERMISSION: {
    VIEW: 'permissions:view',
    LIST: 'permissions:list',
    CREATE: 'permissions:create',
    EDIT: 'permissions:edit',
    DELETE: 'permissions:delete',
  },
  DASHBOARD: {
    VIEW: 'dashboard:view',
  },
  SETTINGS: {
    VIEW: 'settings:view',
    EDIT: 'settings:edit',
  },
} as const;

export type Permission =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS][keyof (typeof PERMISSIONS)[keyof typeof PERMISSIONS]];

export function hasAnyPermission(
  userPermissions: string[] | undefined,
  requiredPermissions: string[]
): boolean {
  if (!userPermissions) return false;
  return requiredPermissions.some((permission) => userPermissions.includes(permission));
}

export function hasAllPermissions(
  userPermissions: string[] | undefined,
  requiredPermissions: string[]
): boolean {
  if (!userPermissions) return false;
  return requiredPermissions.every((permission) => userPermissions.includes(permission));
}

export function hasWildcardPermission(
  userPermissions: string[] | undefined,
  permission: string
): boolean {
  if (!userPermissions) return false;

  const hasExactPermission = userPermissions.includes(permission);
  if (hasExactPermission) return true;

  const parts = permission.split(':');
  if (parts.length === 2) {
    const wildcardPermission = `${parts[0]}:*`;
    return userPermissions.includes(wildcardPermission);
  }

  return false;
}
