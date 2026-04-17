import Fastify from 'fastify';
import fastifyHelmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import pool from '../../db/connection.js';
import { createResponse, ApiError, OP_CODES } from '../../utils/response.js';
import { schemas, validateSchema } from '../../utils/schemas.js';

const app = Fastify({
  logger: true,
});

const PORT = parseInt(process.env.TICKETS_SERVICE_PORT || '3002', 10);

// Register plugins
await app.register(fastifyHelmet);
await app.register(fastifyCors, {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:4200'],
});

// GET all tickets for a group
app.get<{ Querystring: { groupId?: string } }>('/tickets', async (request, reply) => {
  try {
    const { groupId } = request.query;

    const baseSelect = `
      SELECT t.*, 
             g.uuid AS group_uuid, g.name AS group_name,
             uc.email AS creator_email, uc.name AS creator_name,
             ua.email AS assigned_to_email, ua.name AS assigned_to_name, ua.uuid AS assigned_to_uuid
      FROM tickets t
      LEFT JOIN groups g ON t.group_id = g.id
      LEFT JOIN users uc ON t.creator_id = uc.id
      LEFT JOIN users ua ON t.assigned_to_id = ua.id
    `;
    let query = `${baseSelect} ORDER BY t.created_at DESC`;
    const params: any[] = [];

    if (groupId) {
      // Resolve UUID or numeric ID
      const isNumeric = /^\d+$/.test(groupId);
      if (isNumeric) {
        query = `${baseSelect} WHERE t.group_id = $1 ORDER BY t.created_at DESC`;
        params.push(parseInt(groupId));
      } else {
        const groupResult = await pool.query('SELECT id FROM groups WHERE uuid = $1', [groupId]);
        if (groupResult.rows.length === 0) {
          reply.send(createResponse(200, 'SxTK200', []));
          return;
        }
        query = `${baseSelect} WHERE t.group_id = $1 ORDER BY t.created_at DESC`;
        params.push(groupResult.rows[0].id);
      }
    }

    const result = await pool.query(query, params);
    
    reply.send(
      createResponse(200, 'SxTK200', result.rows)
    );
  } catch (err: any) {
    app.log.error(err);
    reply.status(500).send(
      createResponse(500, OP_CODES.SxGN500, null)
    );
  }
});

// GET single ticket
app.get<{ Params: { id: string } }>('/tickets/:id', async (request, reply) => {
  try {
    const { id } = request.params;

    const result = await pool.query(
      'SELECT * FROM tickets WHERE uuid = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'SxTK404', 'Ticket not found');
    }

    // Get comments
    const commentsResult = await pool.query(
      'SELECT * FROM ticket_comments WHERE ticket_id = $1 ORDER BY created_at DESC',
      [result.rows[0].id]
    );

    // Get history
    const historyResult = await pool.query(
      'SELECT * FROM ticket_history WHERE ticket_id = $1 ORDER BY created_at DESC',
      [result.rows[0].id]
    );

    const ticket = {
      ...result.rows[0],
      comments: commentsResult.rows,
      history: historyResult.rows,
    };

    reply.send(
      createResponse(200, 'SxTK200', ticket)
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

// CREATE ticket
app.post<{ Body: any }>('/tickets', async (request, reply) => {
  try {
    const { error, value } = validateSchema(schemas.createTicket, request.body);

    if (error) {
      throw new ApiError(400, 'SxTK400', 'Invalid ticket data');
    }

    const { title, description, priority, status, assignedToId, dueDate, startDate, endDate, groupId } = value;

    // Get creator from x-user-id header
    let creatorId = 1;
    const userId = request.headers['x-user-id'];
    if (userId) {
      const userResult = await pool.query('SELECT id FROM users WHERE uuid = $1', [userId]);
      if (userResult.rows.length > 0) {
        creatorId = userResult.rows[0].id;
      }
    }

    // Resolve groupId (UUID or numeric)
    let resolvedGroupId: number;
    const isNumeric = /^\d+$/.test(groupId);
    if (isNumeric) {
      resolvedGroupId = parseInt(groupId);
    } else {
      const groupResult = await pool.query('SELECT id FROM groups WHERE uuid = $1', [groupId]);
      if (groupResult.rows.length === 0) {
        throw new ApiError(400, 'SxTK400', 'Group not found');
      }
      resolvedGroupId = groupResult.rows[0].id;
    }

    // Resolve assignedToId UUID to numeric if provided
    let resolvedAssignedToId: number | null = null;
    if (assignedToId) {
      const assignedResult = await pool.query('SELECT id FROM users WHERE uuid = $1', [assignedToId]);
      if (assignedResult.rows.length > 0) {
        resolvedAssignedToId = assignedResult.rows[0].id;
      }
    }

    const result = await pool.query(
      `INSERT INTO tickets (
        title, description, priority, status, creator_id, assigned_to_id, group_id, due_date, start_date, end_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [title, description || null, priority, status, creatorId, resolvedAssignedToId, resolvedGroupId, dueDate || null, startDate || null, endDate || null]
    );

    reply.status(201).send(
      createResponse(201, 'SxTK201', result.rows[0])
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

// UPDATE ticket
app.patch<{ Params: { id: string }; Body: any }>('/tickets/:id', async (request, reply) => {
  try {
    const { id } = request.params;
    const { error, value } = validateSchema(schemas.updateTicket, request.body);

    if (error) {
      throw new ApiError(400, 'SxTK400', 'Invalid ticket data');
    }

    // Find ticket first
    const ticketResult = await pool.query(
      'SELECT * FROM tickets WHERE uuid = $1',
      [id]
    );

    if (ticketResult.rows.length === 0) {
      throw new ApiError(404, 'SxTK404', 'Ticket not found');
    }

    const ticket = ticketResult.rows[0];
    const updates = { ...ticket, ...value, id: ticket.id };

    // Map camelCase keys to snake_case column names
    const fieldMapping: Record<string, string> = {
      assignedToId: 'assigned_to_id',
      dueDate: 'due_date',
      startDate: 'start_date',
      endDate: 'end_date',
    };

    let updateQuery = 'UPDATE tickets SET';
    const updateValues: any[] = [];
    let paramCount = 1;

    for (const key of Object.keys(value)) {
      const columnName = fieldMapping[key] || key;
      let val = value[key];

      // Resolve assignedToId UUID to numeric ID
      if (key === 'assignedToId') {
        if (val && val !== '') {
          const userResult = await pool.query('SELECT id FROM users WHERE uuid = $1', [val]);
          if (userResult.rows.length > 0) {
            val = userResult.rows[0].id;
          } else {
            val = null;
          }
        } else {
          val = null;
        }
      }

      // Allow null for date fields
      if ((key === 'dueDate' || key === 'startDate' || key === 'endDate') && !val) {
        val = null;
      }

      updateQuery += ` ${columnName} = $${paramCount},`;
      updateValues.push(val);
      paramCount++;
    }

    updateQuery = updateQuery.slice(0, -1); // Remove trailing comma
    updateQuery += ` WHERE uuid = $${paramCount} RETURNING *`;
    updateValues.push(id);

    const result = await pool.query(updateQuery, updateValues);

    reply.send(
      createResponse(200, 'SxTK200', result.rows[0])
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

// DELETE ticket
app.delete<{ Params: { id: string } }>('/tickets/:id', async (request, reply) => {
  try {
    const { id } = request.params;

    const result = await pool.query(
      'DELETE FROM tickets WHERE uuid = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      throw new ApiError(404, 'SxTK404', 'Ticket not found');
    }

    reply.send(
      createResponse(200, 'SxTK200', { deleted: true })
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
  reply.send({ status: 'ok', service: 'tickets-service' });
});

// Start server
app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Tickets service running at ${address}`);
});

export default app;
