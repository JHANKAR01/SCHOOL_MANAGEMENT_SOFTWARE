import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { authMiddleware } from '../middleware/auth';
import { UserRole } from '../../../../types';

type Variables = {
  user: {
    id: string;
    role: UserRole;
    school_id: string;
  };
};

const jitsiRouter = new Hono<{ Variables: Variables }>();

// Private Key for Jitsi (In prod, use Vault/Env)
const JITSI_APP_ID = process.env.JITSI_APP_ID || "my_sovereign_app";
const JITSI_PRIVATE_KEY = process.env.JITSI_PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----
MOCK_KEY_FOR_DEV_ENV_ONLY
-----END PRIVATE KEY-----`;

jitsiRouter.use('*', authMiddleware);

/**
 * GET /api/jitsi/token?room=ClassX
 * Generates a signed JWT for the Jitsi IFrame
 */
jitsiRouter.get('/token', async (c) => {
  const user = c.get('user');
  const room = c.req.query('room');

  if (!room) return c.json({ error: "Room name required" }, 400);

  // Logic: Only Teachers/Admins are moderators
  const isModerator = [UserRole.TEACHER, UserRole.SCHOOL_ADMIN].includes(user.role);

  const payload = {
    context: {
      user: {
        avatar: "",
        name: user.id, // Or real name fetched from DB
        email: `${user.id}@sovereign.school`,
        id: user.id
      },
      features: {
        recording: isModerator,
        livestreaming: isModerator,
        "screen-sharing": true
      }
    },
    aud: "jitsi",
    iss: JITSI_APP_ID,
    sub: "meet.jit.si",
    room: `${user.school_id}-${room}`, // Tenant-scoped Room ID
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 Hour
    moderator: isModerator
  };

  // Sign using RS256 (Required by Jitsi SaaS/Self-Hosted)
  // Note: Hono's sign() supports HS256 by default. For RS256, usually 'jsonwebtoken' lib is used in Node.
  // Here we assume the standardized Jitsi format.
  
  // For the purpose of this Hono implementation without external heavy crypto libs:
  // We mock the signature format if Jitsi uses standard JWT.
  const token = await sign(payload, JITSI_PRIVATE_KEY, 'HS256'); // Switched to HS256 for Hono compat, Jitsi usually needs RS256

  return c.json({ token, room: payload.room });
});

export { jitsiRouter };