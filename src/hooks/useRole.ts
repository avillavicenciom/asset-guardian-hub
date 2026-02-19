import { useAuth } from '@/contexts/AuthContext';

type Role = 'ADMIN' | 'TECH' | 'READONLY';

export function useRole() {
  const { currentOperator } = useAuth();
  const role: Role = currentOperator?.role || 'READONLY';

  return {
    role,
    isAdmin: role === 'ADMIN',
    isTech: role === 'TECH',
    isReadonly: role === 'READONLY',
    canManageAssets: role === 'ADMIN' || role === 'TECH',
    canManageAssignments: role === 'ADMIN' || role === 'TECH',
    canManageRepairs: role === 'ADMIN' || role === 'TECH',
    canManageUsers: role === 'ADMIN',
    canViewAudit: role === 'ADMIN',
    canAccessSettings: role === 'ADMIN',
  };
}
