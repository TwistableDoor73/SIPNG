import Fastify from 'fastify';
// JWT handling is done via gateway middleware
import fastifyHelmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import pool from '../../db/connection.js';
import { 
  createToken, 
  verifyToken, 
  type TokenPayload 
} from '../../utils/jwt.js';
import { 
  hashPassword, 
  comparePassword 
} from '../../utils/crypto.js';
import { 
  createResponse, 
  ApiError, 
  OP_CODES 
} from '../../utils/response.js';
import { 
  schemas, 
  validateSchema 
} from '../../utils/schemas.js';

const app = Fastify({
  logger: true,
});

const PORT = parseInt(process.env.USER_SERVICE_PORT || '3001', 10);

// Register plugins
await app.register(fastifyHelmet);
await app.register(fastifyCors, {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:4200'],
});

// Routes
app.post<{ Body: any }>('/auth/login', async (request, reply) => {
  try {
    const { error, value } = validateSchema(schemas.login, request.body);
    
    if (error) {
      app.log.error({ err: error }, 'Schema validation error');
      throw new ApiError(400, 'SxUS400', 'Invalid credentials');
    }

    const { email, password } = value;
    app.log.info(`Login attempt for email: ${email}`);

    // Find user
    const result = await pool.query(
      'SELECT uuid, id, name, email, password_hash, role FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      app.log.warn(`User not found: ${email}`);
      throw new ApiError(401, 'SxUS401', 'Invalid email or password');
    }

    const user = result.rows[0];
    app.log.info(`Found user: ${user.email}, comparing passwords...`);
    const passwordMatch = await comparePassword(password, user.password_hash);

    if (!passwordMatch) {
      app.log.warn(`Password mismatch for user: ${email}`);
      throw new ApiError(401, 'SxUS401', 'Invalid email or password');
    }

    app.log.info(`Password matched for user: ${email}`);


    // Get user permissions and groups
    const permResult = await pool.query(
      `SELECT permission, group_id FROM user_permissions WHERE user_id = $1`,
      [user.id]
    );

    const groupResult = await pool.query(
      `SELECT g.uuid, g.id, g.name FROM groups g
       INNER JOIN group_members gm ON g.id = gm.group_id
       WHERE gm.user_id = $1`,
      [user.id]
    );

    // Build global permissions (group_id IS NULL)
    const permissions = permResult.rows
      .filter((p: any) => p.group_id === null)
      .map((p: any) => p.permission);

    // Build per-group permissions (group_id IS NOT NULL)
    const permissionsByGroup: Record<string, string[]> = {};
    for (const row of permResult.rows) {
      if (row.group_id !== null) {
        const grp = groupResult.rows.find((g: any) => g.id === row.group_id);
        if (grp) {
          if (!permissionsByGroup[grp.uuid]) permissionsByGroup[grp.uuid] = [];
          permissionsByGroup[grp.uuid].push(row.permission);
        }
      }
    }

    const groups = groupResult.rows.map((g: any) => g.uuid);

    const token = createToken({
      userId: user.uuid,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions,
      groups,
    });

    reply.send(
      createResponse(200, 'SxUS200', {
        token,
        user: {
          id: user.uuid,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions,
          permissionsByGroup,
          groups,
        },
      })
    );
  } catch (err: any) {
    app.log.error(err);
    if (err instanceof ApiError) {
      reply.status(err.statusCode).send(
        createResponse(err.statusCode, err.intOpCode, null)
      );
    } else {
      reply.status(500).send(
        createResponse(500, OP_CODES.SxGN500, null)
      );
    }
  }
});

app.post<{ Body: any }>('/auth/register', async (request, reply) => {
  try {
    const { error, value } = validateSchema(schemas.register, request.body);

    if (error) {
      throw new ApiError(400, 'SxUS400', 'Invalid registration data');
    }

    const { name, email, password, age, phone } = value;

    // Check if email exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      throw new ApiError(400, 'SxUS400', 'Email already registered');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, age, phone) 
       VALUES ($1, $2, $3, 'user', $4, $5) 
       RETURNING uuid, id, name, email, role, age, phone`,
      [name, email.toLowerCase(), hashedPassword, age || null, phone || null]
    );

    const user = result.rows[0];

    const token = createToken({
      userId: user.uuid,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: ['ticket:view', 'ticket:comment', 'group:view'],
      groups: [],
    });

    reply.status(201).send(
      createResponse(201, 'SxUS201', {
        token,
        user: {
          id: user.uuid,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      })
    );
  } catch (err: any) {
    app.log.error(err);
    if (err instanceof ApiError) {
      reply.status(err.statusCode).send(
        createResponse(err.statusCode, err.intOpCode, null)
      );
    } else {
      reply.status(500).send(
        createResponse(500, OP_CODES.SxGN500, null)
      );
    }
  }
});

// Get all users
app.get('/users', async (request, reply) => {
  try {
    const result = await pool.query(
      `SELECT uuid, id, name, email, role, age, phone, avatar_url, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );

    // Get permissions and groups for each user
    const users = await Promise.all(
      result.rows.map(async (user: any) => {
        const permResult = await pool.query(
          `SELECT permission, group_id FROM user_permissions WHERE user_id = $1`,
          [user.id]
        );

        const groupResult = await pool.query(
          `SELECT g.id, g.uuid, g.name FROM groups g
           INNER JOIN group_members gm ON g.id = gm.group_id
           WHERE gm.user_id = $1`,
          [user.id]
        );

        const globalPerms = permResult.rows
          .filter((p: any) => p.group_id === null)
          .map((p: any) => p.permission);

        const permsByGroup: Record<string, string[]> = {};
        for (const row of permResult.rows) {
          if (row.group_id !== null) {
            const grp = groupResult.rows.find((g: any) => g.id === row.group_id);
            if (grp) {
              if (!permsByGroup[grp.uuid]) permsByGroup[grp.uuid] = [];
              permsByGroup[grp.uuid].push(row.permission);
            }
          }
        }

        return {
          ...user,
          uuid: user.uuid,
          permissions: globalPerms,
          permissionsByGroup: permsByGroup,
          groups: groupResult.rows
        };
      })
    );

    reply.send(
      createResponse(200, 'SxUS200', users)
    );
  } catch (err: any) {
    app.log.error(err);
    reply.status(500).send(
      createResponse(500, OP_CODES.SxGN500, null)
    );
  }
});

// PUT /users/:id/permissions — Save permissions (global or per-group)
app.put<{ Params: { id: string }; Body: any }>('/users/:id/permissions', async (request, reply) => {
  try {
    const { id } = request.params;
    const { permissions, groupId, role } = request.body as { permissions: string[]; groupId?: string; role?: string };

    if (!permissions || !Array.isArray(permissions)) {
      throw new ApiError(400, 'SxUS400', 'permissions must be an array');
    }

    // Find user by UUID
    const userResult = await pool.query(
      'SELECT id, uuid, role FROM users WHERE uuid = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      throw new ApiError(404, 'SxUS404', 'User not found');
    }

    const userId = userResult.rows[0].id;

    // Update role if provided
    if (role) {
      await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role.toLowerCase(), userId]);
    }

    // Resolve groupId (UUID → numeric) if provided
    let numericGroupId: number | null = null;
    if (groupId) {
      const groupResult = await pool.query('SELECT id FROM groups WHERE uuid = $1', [groupId]);
      if (groupResult.rows.length === 0) {
        throw new ApiError(404, 'SxGP404', 'Group not found');
      }
      numericGroupId = groupResult.rows[0].id;
    }

    // Delete existing permissions for this user+group scope
    if (numericGroupId) {
      await pool.query(
        'DELETE FROM user_permissions WHERE user_id = $1 AND group_id = $2',
        [userId, numericGroupId]
      );
    } else {
      await pool.query(
        'DELETE FROM user_permissions WHERE user_id = $1 AND group_id IS NULL',
        [userId]
      );
    }

    // Insert new permissions
    if (permissions.length > 0) {
      const values = permissions.map((_, i) => {
        const base = i * 3;
        return `($${base + 1}, $${base + 2}, $${base + 3})`;
      }).join(', ');

      const params = permissions.flatMap(p => [userId, numericGroupId, p]);

      await pool.query(
        `INSERT INTO user_permissions (user_id, group_id, permission) VALUES ${values}
         ON CONFLICT (user_id, group_id, permission) DO NOTHING`,
        params
      );
    }

    // Return updated permissions for this user
    const permResult = await pool.query(
      `SELECT permission, group_id FROM user_permissions WHERE user_id = $1`,
      [userId]
    );

    const globalPerms = permResult.rows
      .filter((p: any) => p.group_id === null)
      .map((p: any) => p.permission);

    const permsByGroup: Record<string, string[]> = {};
    for (const row of permResult.rows) {
      if (row.group_id !== null) {
        // Get group UUID
        const gRes = await pool.query('SELECT uuid FROM groups WHERE id = $1', [row.group_id]);
        const gUuid = gRes.rows[0]?.uuid;
        if (gUuid) {
          if (!permsByGroup[gUuid]) permsByGroup[gUuid] = [];
          permsByGroup[gUuid].push(row.permission);
        }
      }
    }

    reply.send(
      createResponse(200, 'SxUS200', {
        permissions: globalPerms,
        permissionsByGroup: permsByGroup,
        role: role?.toLowerCase() || userResult.rows[0].role
      })
    );
  } catch (err: any) {
    app.log.error(err);
    if (err instanceof ApiError) {
      reply.status(err.statusCode).send(
        createResponse(err.statusCode, err.intOpCode, null)
      );
    } else {
      reply.status(500).send(
        createResponse(500, OP_CODES.SxGN500, null)
      );
    }
  }
});

// DELETE user
app.delete<{ Params: { id: string } }>('/users/:id', async (request, reply) => {
  try {
    const { id } = request.params;

    // Find user by UUID
    const userResult = await pool.query(
      'SELECT id, uuid, email FROM users WHERE uuid = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      throw new ApiError(404, 'SxUS404', 'User not found');
    }

    const userId = userResult.rows[0].id;

    // Delete related data in order (foreign keys)
    await pool.query('DELETE FROM user_permissions WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM group_members WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM ticket_comments WHERE author_id = $1', [userId]);
    await pool.query('DELETE FROM ticket_history WHERE author_id = $1', [userId]);
    // Unassign tickets assigned to this user
    await pool.query('UPDATE tickets SET assigned_to_id = NULL WHERE assigned_to_id = $1', [userId]);
    // Delete tickets created by this user
    await pool.query('DELETE FROM tickets WHERE creator_id = $1', [userId]);
    // Delete the user
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    reply.send(
      createResponse(200, 'SxUS200', { deleted: true })
    );
  } catch (err: any) {
    app.log.error(err);
    if (err instanceof ApiError) {
      reply.status(err.statusCode).send(
        createResponse(err.statusCode, err.intOpCode, null)
      );
    } else {
      reply.status(500).send(
        createResponse(500, OP_CODES.SxGN500, null)
      );
    }
  }
});

// Health check
app.get('/health', async (request, reply) => {
  reply.send({ status: 'ok', service: 'user-service' });
});

// Start server
app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`User service running at ${address}`);
});

export default app;
