import Fastify from 'fastify';
// JWT handling is done via gateway middleware
import fastifyHelmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import pool from '../../db/connection.ts';
import { 
  createToken, 
  verifyToken, 
  type TokenPayload 
} from '../../utils/jwt.ts';
import { 
  hashPassword, 
  comparePassword 
} from '../../utils/crypto.ts';
import { 
  createResponse, 
  ApiError, 
  OP_CODES 
} from '../../utils/response.ts';
import { 
  schemas, 
  validateSchema 
} from '../../utils/schemas.ts';

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
      `SELECT DISTINCT permission FROM user_permissions WHERE user_id = $1`,
      [user.id]
    );

    const groupResult = await pool.query(
      `SELECT group_id FROM group_members WHERE user_id = $1`,
      [user.id]
    );

    const permissions = permResult.rows.map((p: any) => p.permission);
    const groups = groupResult.rows.map((g: any) => g.group_id.toString());

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
          `SELECT DISTINCT permission FROM user_permissions WHERE user_id = $1`,
          [user.id]
        );

        const groupResult = await pool.query(
          `SELECT g.id, g.uuid, g.name FROM groups g
           INNER JOIN group_members gm ON g.id = gm.group_id
           WHERE gm.user_id = $1`,
          [user.id]
        );

        return {
          ...user,
          uuid: user.uuid,
          permissions: permResult.rows.map((p: any) => p.permission),
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
