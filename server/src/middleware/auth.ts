
import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import { UserRole } from '../../../packages/types';
import { Permission } from '../../../packages/types/permissions';

import prisma from '../db';

// Extend Hono Context via Generics or simply cast usage below.
// Hardcoded for consistency during debugging
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';

/**
 * JWT Authentication Middleware
 * Validates token and extracts user context.
 * Enforces Tenant Isolation by extracting school_id for RLS.
 */
export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing Token' }, 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = await verify(token, JWT_SECRET);

    // Inject into Hono Context
    const userContext = {
      id: payload.sub as string,
      role: payload.role as UserRole,
      school_id: payload.school_id as string,
      permissions: (payload.permissions as string[]) || []  // P2.1.3: Extract permissions
    };

    // 🔒 LOCKDOWN CHECK START 🔒
    // Skip check for Super Admin to prevent locking yourself out
    if (userContext.role !== 'SUPER_ADMIN') {
      const settings = await prisma.systemSettings.findUnique({
        where: { school_id: userContext.school_id },
        select: { locked_roles: true }
      });

      if (settings?.locked_roles && settings.locked_roles.includes(userContext.role)) {
        return c.json({
          error: 'System Lockdown',
          message: 'The system is currently in maintenance mode for your role.'
        }, 403);
      }
    }
    // 🔒 LOCKDOWN CHECK END 🔒

    c.set('user', userContext);

    // CRITICAL: Set school_id at root context level for DB RLS Middleware
    c.set('school_id', payload.school_id);

    // Back-fill to request object for compatibility with legacy consumers (like logistics.ts)
    (c.req as any).user = userContext;

    await next();
  } catch (e) {
    console.error('[AUTH_MIDDLEWARE_ERROR]', e); // Log the specific verify error
    return c.json({ error: 'Unauthorized: Invalid Token', details: String(e) }, 401);
  }
};

/**
 * Role-Based Access Control (RBAC) Guard
 * Higher-order function to block unauthorized roles.
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as any;

    if (!user || !allowedRoles.includes(user.role)) {
      // Security: Audit this failure
      console.warn(`[SECURITY] RBAC Denial for User ${user?.id} requesting ${c.req.path}`);
      return c.json({ error: 'Forbidden: Insufficient Permissions' }, 403);
    }

    await next();
  };
};

/**
 * Permission-Based Access Control Guard (P2.1.1)
 * Checks if user has specific permission OR is SUPER_ADMIN.
 */
export const requirePermission = (requiredPermission: Permission) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as {
      id: string;
      role: UserRole;
      school_id: string;
      permissions?: string[];
    };

    // Super Admin bypasses all permission checks
    if (user.role === UserRole.SUPER_ADMIN) {
      await next();
      return;
    }

    // Check if user has the required permission
    if (!user.permissions || !user.permissions.includes(requiredPermission)) {
      console.warn(`[SECURITY] Permission Denial: User ${user.id} lacks ${requiredPermission}`);
      return c.json({
        error: 'Forbidden',
        message: `You do not have the '${requiredPermission}' permission.`
      }, 403);
    }

    await next();
  };
};

/**
 * Get RLS Context
 * Extracts school_id from the authenticated request to enforce tenant isolation.
 */
export const getRLSContext = (req: any) => {
  // Support both direct object (mock) and Request object
  const user = req.user || (req.get && typeof req.get === 'function' ? req.get('user') : null);

  if (!user || !user.school_id) {
    throw new Error('RLS Violation: Missing School Context');
  }

  return { school_id: user.school_id };
};
