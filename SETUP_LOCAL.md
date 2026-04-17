# 🚀 SIPNG ERP - Local Development Setup

Complete guide to get SIPNG ERP running locally with real PostgreSQL backend and no mock data.

## Prerequisites

- **Node.js** 18+ (Check: `node -v`)
- **PostgreSQL** 12+ (Check: `psql --version`)
- **npm** 8+ (Check: `npm -v`)

## Quick Start (30 seconds)

```bash
# 1. Make setup script executable
chmod +x setup.sh

# 2. Run automated setup (creates DB, runs migrations, installs dependencies)
./setup.sh

# 3. Start development (frontend + backend together)
npm run dev
```

That's it! The setup script will:
- ✅ Create PostgreSQL database `sipng_dev`
- ✅ Run schema migrations
- ✅ Seed test data
- ✅ Install all dependencies
- ✅ Create `.env` configuration

## Access Points

After setup, access:

| Component | URL | Notes |
|-----------|-----|-------|
| **Frontend** | http://localhost:4200 | Angular dev server (hot reload) |
| **Backend API** | http://localhost:3000 | Fastify Gateway |
| **User Service** | http://localhost:3001 | Microservice |
| **Tickets Service** | http://localhost:3002 | Microservice |
| **Groups Service** | http://localhost:3003 | Microservice |

## Test Credentials

After setup, you can login with:

```
Email:    jesusefrainbocanegramata@gmail.com
Password: password123
Role:     superadmin (all permissions in all groups)
```

**Other test users:**
- diego.admin@erp.com / password123 (admin)
- luis.dev@erp.com / password123 (user)
- paula.design@erp.com / password123 (user)

## Development Workflow

### Start Everything
```bash
npm run dev
# Starts frontend (port 4200) + backend (port 3000) simultaneously
# Press Ctrl+C to stop both
```

### Frontend Only
```bash
npm start
# Starts Angular dev server with hot reload
```

### Backend Only
```bash
cd backend
npm run dev
# Starts all microservices (ports 3000-3003)
```

### Build for Production
```bash
npm run build
npm run build:backend
```

## Database Management

### Reset Database (clear all data)
```bash
# Drop and recreate database with fresh seed data
psql -U postgres -c "DROP DATABASE sipng_dev;"
./setup.sh
```

### Manual Database Access
```bash
# Connect to PostgreSQL
psql -U postgres -d sipng_dev

# View tables
\dt

# Exit
\q
```

### View Test Data
```bash
# Users
SELECT id, name, email, role FROM users;

# Groups
SELECT id, name FROM groups;

# Tickets
SELECT id, title, status FROM tickets;

# Permissions
SELECT u.name, g.name, p.permission 
FROM user_permissions p
JOIN users u ON p.user_id = u.id
JOIN groups g ON p.group_id = g.id;
```

## Project Structure

```
sipng/
├── src/                          # Frontend Angular
│   ├── app/
│   │   ├── pages/               # All page components
│   │   ├── services/            # AppStateService, HttpService
│   │   ├── guards/              # AuthGuard, LoginGuard
│   │   ├── directives/          # Permission directive
│   │   └── app.config.ts        # Angular config with HTTP interceptor
│   └── environments/            # environment.ts, environment.prod.ts
│
├── backend/                      # Fastify backend + microservices
│   ├── src/
│   │   ├── index.ts             # Entry point
│   │   ├── db/                  # PostgreSQL connection & initialization
│   │   ├── utils/               # JWT, crypto, validation, responses
│   │   └── microservices/       # Gateway, User, Tickets, Groups services
│   ├── schema.sql               # Database schema migrations
│   ├── seed.sql                 # Test data seeding
│   ├── .env.example             # Environment template
│   └── package.json
│
├── setup.sh                      # One-command setup script
├── dev.sh                        # Start development servers
├── package.json                  # Frontend dependencies & scripts
└── README.md                     # This file
```

## Key Features Implemented

✅ **Real Backend** - Fastify microservices with PostgreSQL
✅ **JWT Authentication** - Token-based auth with interceptor
✅ **Permission System** - Direct permissions per user/group (no roles)
✅ **HTTP Integration** - Frontend calls real backend APIs
✅ **Database Migrations** - Auto-applied on setup
✅ **Test Data** - Pre-seeded with realistic sample data
✅ **Hot Reload** - Both frontend and backend reload on changes
✅ **Single Command Dev** - `npm run dev` starts everything

## Troubleshooting

### "PostgreSQL connection refused"
```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT 1"

# On macOS (if using Homebrew)
brew services start postgresql

# On Linux
sudo service postgresql start

# On Windows
# Start PostgreSQL service from Services
```

### "Database already exists"
The setup script will detect existing database and use it. To reset:
```bash
psql -U postgres -c "DROP DATABASE IF EXISTS sipng_dev;"
./setup.sh
```

### "Port already in use"
If port 4200 or 3000 is in use:
```bash
# Kill process using port 4200
lsof -ti:4200 | xargs kill -9

# Kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

### "npm install fails"
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Environment Variables

See `backend/.env.example` for all available options:

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | development | Environment mode |
| `DATABASE_URL` | postgresql://... | PostgreSQL connection string |
| `JWT_SECRET` | auto-generated | JWT signing secret (min 32 chars) |
| `PORT` | 3000 | API Gateway port |
| `CORS_ORIGIN` | http://localhost:4200 | Allowed CORS origins |

## API Endpoints

All endpoints require JWT token (except `/auth/*`):

```
POST   /auth/login                 # Login
POST   /auth/register              # Register
GET    /tickets                    # List tickets
POST   /tickets                    # Create ticket
PATCH  /tickets/:id                # Update ticket
DELETE /tickets/:id                # Delete ticket
POST   /tickets/:id/comments       # Add comment
GET    /groups                     # List groups
POST   /groups                     # Create group
PATCH  /groups/:id                 # Update group
DELETE /groups/:id                 # Delete group
```

See [backend/README.md](./backend/README.md) for complete API documentation.

## Next Steps

1. ✅ Setup complete - everything is running locally
2. 🎨 Customize test data in `backend/seed.sql`
3. 📝 Modify permissions in `backend/seed.sql` (user_permissions table)
4. 🚀 When ready: Deploy frontend to Vercel, backend to Railway

## Support

For issues:
1. Check this README troubleshooting section
2. Review [backend/README.md](./backend/README.md) for API details
3. Check `src/app/services/http.service.ts` for API integration patterns
4. Review component implementations in `src/app/pages/`

---

**Happy coding! 🚀**

Created: April 2026 | SIPNG ERP Team
