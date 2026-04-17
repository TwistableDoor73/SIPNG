import Fastify from 'fastify';
import fastifyHelmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import fastifyRateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import axios from 'axios';
import { verifyToken, type TokenPayload } from '../../utils/jwt.js';
import { createResponse, ApiError, OP_CODES } from '../../utils/response.js';
import { initializeDatabase } from '../../db/connection.js';

dotenv.config();

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  },
});

const PORT = parseInt(process.env.API_GATEWAY_PORT || '3000', 10);
const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const TICKETS_SERVICE = process.env.TICKETS_SERVICE_URL || 'http://localhost:3002';
const GROUPS_SERVICE = process.env.GROUPS_SERVICE_URL || 'http://localhost:3003';

// Register plugins
await app.register(fastifyHelmet);
await app.register(fastifyCors, {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:4200'],
});

await app.register(fastifyRateLimit, {
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
});

// Middleware to verify token
async function authenticateRequest(request: any, reply: any): Promise<TokenPayload> {
  const token = request.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new ApiError(401, 'SxUS401', 'Missing authorization token');
  }

  const payload = verifyToken(token);
  if (!payload) {
    throw new ApiError(401, 'SxUS401', 'Invalid or expired token');
  }

  return payload;
}

// Grant type to authorization
function requirePermission(permission: string) {
  return async (request: any, reply: any) => {
    const user = request.user as TokenPayload;
    
    if (!user.permissions.includes(permission)) {
      reply.status(403).send(
        createResponse(403, 'SxUS403', { 
          message: `Missing permission: ${permission}` 
        })
      );
    }
  };
}

// ==== AUTH ROUTES (No authentication required) ====
app.post('/auth/login', async (request, reply) => {
  try {
    const response = await axios.post(`${USER_SERVICE}/auth/login`, request.body);
    reply.send(response.data);
  } catch (error: any) {
    app.log.error(error);
    reply.status(error.response?.status || 500).send(
      createResponse(
        error.response?.status || 500,
        error.response?.data?.intOpCode || OP_CODES.SxGN500,
        null
      )
    );
  }
});

app.post('/auth/register', async (request, reply) => {
  try {
    const response = await axios.post(`${USER_SERVICE}/auth/register`, request.body);
    reply.status(201).send(response.data);
  } catch (error: any) {
    app.log.error(error);
    reply.status(error.response?.status || 500).send(
      createResponse(
        error.response?.status || 500,
        error.response?.data?.intOpCode || OP_CODES.SxGN500,
        null
      )
    );
  }
});

// ==== PROTECTED ROUTES (Require authentication) ====

// Proxy all user requests
app.all<{ Params: any }>('/users*', async (request: any, reply) => {
  try {
    const user = await authenticateRequest(request, reply);
    request.user = user;
    
    const path = request.url.replace('/users', '');
    const response = await axios({
      method: request.method as any,
      url: `${USER_SERVICE}/users${path}`,
      headers: {
        authorization: request.headers.authorization,
        'content-type': request.headers['content-type'],
        'x-user-id': user.userId,
      },
      data: request.body,
    });
    reply.send(response.data);
  } catch (error: any) {
    if (!reply.sent) {
      app.log.error(error);
      if (error.response?.data) {
        reply.status(error.response.status).send(error.response.data);
      } else if (error instanceof ApiError) {
        reply.status(error.statusCode).send(
          createResponse(error.statusCode, error.intOpCode, null)
        );
      } else {
        reply.status(500).send(
          createResponse(500, OP_CODES.SxGN500, null)
        );
      }
    }
  }
});

// Proxy all ticket requests
app.all<{ Params: any }>('/tickets*', async (request: any, reply) => {
  try {
    const user = await authenticateRequest(request, reply);
    request.user = user;
    
    const path = request.url.replace('/tickets', '');
    const response = await axios({
      method: request.method as any,
      url: `${TICKETS_SERVICE}/tickets${path}`,
      headers: {
        authorization: request.headers.authorization,
        'content-type': request.headers['content-type'],
        'x-user-id': user.userId,
      },
      data: request.body,
    });

    reply.send(response.data);
  } catch (error: any) {
    if (!reply.sent) {
      app.log.error(error);
      if (error.response?.data) {
        reply.status(error.response.status).send(error.response.data);
      } else if (error instanceof ApiError) {
        reply.status(error.statusCode).send(
          createResponse(error.statusCode, error.intOpCode, null)
        );
      } else {
        reply.status(500).send(
          createResponse(500, OP_CODES.SxGN500, null)
        );
      }
    }
  }
});

// Proxy all group requests
app.all<{ Params: any }>('/groups*', async (request: any, reply) => {
  try {
    const user = await authenticateRequest(request, reply);
    request.user = user;
    
    const path = request.url.replace('/groups', '');
    const response = await axios({
      method: request.method as any,
      url: `${GROUPS_SERVICE}/groups${path}`,
      headers: {
        authorization: request.headers.authorization,
        'content-type': request.headers['content-type'],
        'x-user-id': user.userId,
      },
      data: request.body,
    });

    reply.send(response.data);
  } catch (error: any) {
    if (!reply.sent) {
      app.log.error(error);
      if (error.response?.data) {
        reply.status(error.response.status).send(error.response.data);
      } else if (error instanceof ApiError) {
        reply.status(error.statusCode).send(
          createResponse(error.statusCode, error.intOpCode, null)
        );
      } else {
        reply.status(500).send(
          createResponse(500, OP_CODES.SxGN500, null)
        );
      }
    }
  }
});

// Health check
app.get('/health', async (request, reply) => {
  reply.send({ 
    status: 'ok', 
    service: 'apigateway',
    timestamp: new Date().toISOString()
  });
});

// Generate sample data (for development)
app.post('/dev/seed-database', async (request, reply) => {
  try {
    app.log.info('Seeding database with sample data...');
    // This will be your seed script
    reply.send(createResponse(200, 'SxGN200', { message: 'Database seeded' }));
  } catch (error: any) {
    app.log.error(error);
    reply.status(500).send(
      createResponse(500, OP_CODES.SxGN500, null)
    );
  }
});

// Start server
const start = async () => {
  try {
    await initializeDatabase();
    await app.listen({ port: PORT, host: '0.0.0.0' });
    app.log.info(`API Gateway running at http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

declare global {
  namespace Fastify {
    interface FastifyInstance {
      authenticate: any;
    }
    interface FastifyRequest {
      user?: TokenPayload;
    }
  }
}

export default app;
