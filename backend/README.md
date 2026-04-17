# SIPNG Backend - Fastify Microservices

## 📋 Descripción
Backend distribuido con Fastify que maneja la lógica de negocio para el sistema ERP SIPNG.

## 🏗️ Arquitectura de Microservicios

```
API Gateway (Puerto 3000)
├── User Service (Puerto 3001)
│   ├── POST /auth/login
│   └── POST /auth/register
├── Tickets Service (Puerto 3002)
│   ├── GET /tickets
│   ├── POST /tickets
│   ├── PATCH /tickets/:id
│   └── DELETE /tickets/:id
└── Groups Service (Puerto 3003)
    ├── GET /groups
    ├── POST /groups
    ├── PATCH /groups/:id
    └── DELETE /groups/:id
```

## 🚀 Quick Start

### Instalación
```bash
cd backend
npm install
```

### Configurar .env
```bash
cp .env.example .env
```

Edita `.env` con tus valores:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/sipng_dev
JWT_SECRET=my-secret-key
NODE_ENV=development
```

### Ejecutar en Desarrollo
```bash
npm run dev
```

El API Gateway escuchará en `http://localhost:3000`

### Build para Producción
```bash
npm run build
npm start
```

## 📁 Estructura de Carpetas

```
backend/
├── src/
│   ├── microservices/
│   │   ├── apigateway/
│   │   │   └── gateway.ts
│   │   ├── user/
│   │   │   └── routes.ts
│   │   ├── tickets/
│   │   │   └── routes.ts
│   │   └── groups/
│   │       └── routes.ts
│   ├── db/
│   │   └── connection.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── schemas.ts
│   │   ├── response.ts
│   │   └── crypto.ts
│   └── index.ts
├── package.json
├── tsconfig.json
├── Dockerfile
├── .env.example
└── .gitignore
```

## 🔌 Endpoints

### Autenticación (Pública)
```bash
# Login
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

# Register
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "age": 28,
  "phone": "1234567890"
}
```

### Tickets (Requiero Token)
```bash
# Get all tickets
GET /tickets?groupId=1
Authorization: Bearer <token>

# Create ticket
POST /tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Fix bug",
  "description": "Fix login bug",
  "priority": "Alta",
  "status": "Pendiente",
  "groupId": "1",
  "dueDate": "2026-05-01"
}

# Update ticket
PATCH /tickets/:id
Authorization: Bearer <token>

{
  "status": "En Progreso",
  "assignedToId": "user-uuid"
}

# Delete ticket
DELETE /tickets/:id
Authorization: Bearer <token>
```

### Groups (Requiero Token)
```bash
# Get all groups
GET /groups
Authorization: Bearer <token>

# Create group
POST /groups
Authorization: Bearer <token>

{
  "name": "Development Team",
  "description": "Our dev team",
  "color": "#6366f1",
  "icon": "pi-code"
}

# Update group
PATCH /groups/:id
Authorization: Bearer <token>

{
  "name": "Updated name"
}

# Delete group
DELETE /groups/:id
Authorization: Bearer <token>
```

## 🔐 Authentication Flow

1. Usuario hace POST a `/auth/login`
2. User Service valida credenciales
3. JWT token es retornado
4. Cliente incluye token en header `Authorization: Bearer <token>`
5. API Gateway verifica token
6. Petición es procesada

## 📊 Respuesta JSON Estándar

Todas las respuestas siguen este formato:

```json
{
  "statusCode": 200,
  "intOpCode": "SxUS200",
  "data": { /* payload */ }
}
```

### Códigos de Operación (intOpCode)
- `SxUS200` - User operation successful
- `SxUS401` - Unauthorized
- `SxUS403` - Forbidden (insufficient permissions)
- `SxTK200` - Ticket operation successful
- `SxGP200` - Group operation successful
- `SxGN500` - Server error

## 🗄️ Base de Datos

### Tablas Principales

#### users
```sql
- id (PK)
- uuid (unique)
- name
- email (unique)
- password (hashed)
- avatar_url
- role
- created_at
- updated_at
```

#### groups
```sql
- id (PK)
- uuid (unique)
- name
- description
- color
- icon
- created_at
- updated_at
```

#### tickets
```sql
- id (PK)
- uuid (unique)
- title
- description
- status
- priority
- creator_id (FK → users)
- assigned_to_id (FK → users)
- group_id (FK → groups)
- due_date
- created_at
- updated_at
```

#### user_permissions
```sql
- id (PK)
- user_id (FK → users)
- group_id (FK → groups)
- permission (string)
- granted_at
```

#### group_members
```sql
- id (PK)
- group_id (FK → groups)
- user_id (FK → users)
- joined_at
```

## 🔧 Configuración de Variables

### Desarrollo (.env local)
```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/sipng_dev
JWT_SECRET=dev-secret-key
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:4200
```

### Producción (Railway/Vercel)
```env
NODE_ENV=production
DATABASE_URL=<railway-postgres-url>
JWT_SECRET=<change-me-to-strong-key>
LOG_LEVEL=info
CORS_ORIGIN=https://tu-dominio.com
```

## 🧪 Testing

```bash
# Unit tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 📦 Dependencias Principales

- **fastify** - Web framework
- **pg** - PostgreSQL driver
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **joi** - Schema validation
- **@fastify/cors** - CORS support
- **@fastify/helmet** - Security headers
- **@fastify/jwt** - JWT authentication
- **@fastify/rate-limit** - Rate limiting

## 🚀 Deployment

### Con Railway
1. Push a GitHub
2. Railway crea automáticamente PostgreSQL
3. Deploy automático por cada push

Ver [DEPLOYMENT.md](../DEPLOYMENT.md) para instrucciones detalladas.

### Con Docker
```bash
docker build -t sipng-backend .
docker run -p 3000:3000 -e DATABASE_URL=<url> sipng-backend
```

## 📚 Documentación Adicional

- [API Reference](./API.md)
- [Security Guide](./SECURITY.md)
- [Deployment Guide](../DEPLOYMENT.md)

## 🆘 Troubleshooting

### Port ya en uso
```bash
# Killing process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database connection error
1. Verifica que PostgreSQL está corriendo
2. Verifica DATABASE_URL
3. Crea la database: `createdb sipng_dev`

### JWT error
Asegúrate que `JWT_SECRET` es consistente en todas las instancias

## 📞 Soporte

Para reportar issues o preguntas, abre un GitHub issue.

---

**Hecho con ♥️ para SIPNG ERP**
