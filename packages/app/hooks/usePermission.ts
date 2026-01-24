import { useAuth } from '../provider/AuthContext';
import { Permission, hasPermission as checkRolePermission } from '../../types/permissions';
import { UserRole } from '../../types/user';

export const usePermission = () => {
    const { user } = useAuth();

    const hasPermission = (permission: Permission): boolean => {
        if (!user) return false;

        // 1. Super Admin has all permissions
        if (user.role === UserRole.SUPER_ADMIN) return true;

        // 2. Check granular permissions array (if assigned via UI/DB)
        if (user.permissions && user.permissions.includes(permission)) {
            return true;
        }

        // 3. Fallback: Check role-based default permissions (static)
        // This is optional if you want to support both dynamic and static models.
        // For now, we rely on the backend sending the effective permissions, 
        // OR we use the helper to check if the ROLE typically has access.
        // PRO TIP: Backend Auth Middleware checks `user.permissions` primarily.

        return false;
    };

    const hasAnyPermission = (permissions: Permission[]): boolean => {
        return permissions.some(p => hasPermission(p));
    };

    return { hasPermission, hasAnyPermission, user };
};
