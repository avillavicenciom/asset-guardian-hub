import { useAuth } from '@/contexts/AuthContext';
import { Permission, ALL_PERMISSIONS } from '@/data/types';

type Role = 'ADMIN' | 'TECH' | 'READONLY';

export function useRole() {
  const { currentOperator } = useAuth();
  const role: Role = currentOperator?.role || 'READONLY';
  const isAdmin = role === 'ADMIN';

  const permissions: Permission[] = isAdmin
    ? ALL_PERMISSIONS
    : (currentOperator?.permissions || []);

  const hasPermission = (perm: Permission): boolean => {
    if (isAdmin) return true;
    return permissions.includes(perm);
  };

  return {
    role,
    isAdmin,
    isTech: role === 'TECH',
    isReadonly: role === 'READONLY',
    permissions,
    hasPermission,
    // Legacy compatibility helpers
    canManageAssets: isAdmin || hasPermission('assets.create') || hasPermission('assets.edit'),
    canManageAssignments: isAdmin || hasPermission('assets.assign'),
    canManageRepairs: isAdmin || hasPermission('repairs.create') || hasPermission('repairs.edit'),
    canManageUsers: isAdmin || hasPermission('users.create') || hasPermission('users.edit'),
    canViewAudit: isAdmin || hasPermission('audit.view'),
    canAccessSettings: isAdmin || hasPermission('settings.view'),
  };
}
