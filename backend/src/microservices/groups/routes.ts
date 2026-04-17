import Fastify from 'fastify';
import fastifyHelmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import pool from '../../db/connection.js';
import { createResponse, ApiError, OP_CODES } from '../../utils/response.js';
import { schemas, validateSchema } from '../../utils/schemas.js';

const app = Fastify({
  logger: true,
});

const PORT = parseInt(process.env.GROUPS_SERVICE_PORT || '3003', 10);

// Register plugins
await app.register(fastifyHelmet);
await app.register(fastifyCors, {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:4200'],
});

// GET all groups
app.get('/groups', async (request, reply) => {
  try {
    const result = await pool.query('SELECT * FROM groups ORDER BY created_at DESC');
    reply.send(
      createResponse(200, 'SxGP200', result.rows)
    );
  } catch (err: any) {
    app.log.error(err);
    reply.status(500).send(
      createResponse(500, OP_CODES.SxGN500, null)
    );
  }
});

// GET single group
app.get<{ Params: { id: string } }>('/groups/:id', async (request, reply) => {
  try {
    const { id } = request.params;

    const result = await pool.query(
      'SELECT * FROM groups WHERE uuid = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'SxGP404', 'Group not found');
    }

    // Get group members
    const membersResult = await pool.query(
      `SELECT u.* FROM users u
       INNER JOIN group_members gm ON u.id = gm.user_id
       WHERE gm.group_id = $1`,
      [result.rows[0].id]
    );

    const group = {
      ...result.rows[0],
      members: membersResult.rows,
    };

    reply.send(
      createResponse(200, 'SxGP200', group)
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

// CREATE group
app.post<{ Body: any }>('/groups', async (request, reply) => {
  try {
    const { error, value } = validateSchema(schemas.createGroup, request.body);

    if (error) {
      throw new ApiError(400, 'SxGP400', 'Invalid group data');
    }

    const { name, description, color, icon } = value;

    const result = await pool.query(
      `INSERT INTO groups (name, description, color, icon)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, description || null, color || '#6366f1', icon || 'pi-briefcase']
    );

    reply.status(201).send(
      createResponse(201, 'SxGP201', result.rows[0])
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

// UPDATE group
app.patch<{ Params: { id: string }; Body: any }>('/groups/:id', async (request, reply) => {
  try {
    const { id } = request.params;
    const { error, value } = validateSchema(schemas.updateGroup, request.body);

    if (error) {
      throw new ApiError(400, 'SxGP400', 'Invalid group data');
    }

    // Find group first
    const groupResult = await pool.query(
      'SELECT * FROM groups WHERE uuid = $1',
      [id]
    );

    if (groupResult.rows.length === 0) {
      throw new ApiError(404, 'SxGP404', 'Group not found');
    }

    let updateQuery = 'UPDATE groups SET';
    const updateValues: any[] = [];
    let paramCount = 1;

    Object.keys(value).forEach((key) => {
      updateQuery += ` ${key} = $${paramCount},`;
      updateValues.push(value[key]);
      paramCount++;
    });

    updateQuery = updateQuery.slice(0, -1);
    updateQuery += ` WHERE uuid = $${paramCount} RETURNING *`;
    updateValues.push(id);

    const result = await pool.query(updateQuery, updateValues);

    reply.send(
      createResponse(200, 'SxGP200', result.rows[0])
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

// DELETE group
app.delete<{ Params: { id: string } }>('/groups/:id', async (request, reply) => {
  try {
    const { id } = request.params;

    const result = await pool.query(
      'DELETE FROM groups WHERE uuid = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'SxGP404', 'Group not found');
    }

    reply.send(
      createResponse(200, 'SxGP200', { deleted: true })
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
  reply.send({ status: 'ok', service: 'groups-service' });
});

// Start server
app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Groups service running at ${address}`);
});

export default app;
