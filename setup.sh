#!/bin/bash

# SIPNG ERP - Local Development Setup Script
set -e

echo "🚀 SIPNG ERP - Local Setup"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="sipng_dev"
DB_HOST="localhost"
DB_PORT="5432"

# Try to detect PostgreSQL user
echo -e "${BLUE}📋 Prerequisites Check${NC}"
echo "Checking for PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo -e "${RED}✗ PostgreSQL is not installed${NC}"
    echo "Please install PostgreSQL: https://www.postgresql.org/download/"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL found${NC}"

# Try to detect the correct PostgreSQL user
echo "Detecting PostgreSQL user..."
DB_USER=""

# First try current user (most common on macOS with Homebrew)
if psql -U "$USER" -d postgres -tc "SELECT 1;" >/dev/null 2>&1; then
    DB_USER="$USER"
    echo -e "${GREEN}✓ Using PostgreSQL user: $DB_USER${NC}"
fi

# If that didn't work, try postgres user
if [ -z "$DB_USER" ]; then
    if psql -U postgres -d postgres -tc "SELECT 1;" >/dev/null 2>&1; then
        DB_USER="postgres"
        echo -e "${GREEN}✓ Using PostgreSQL user: postgres${NC}"
    fi
fi

if [ -z "$DB_USER" ]; then
    echo -e "${RED}✗ Could not connect to PostgreSQL${NC}"
    echo "Please ensure PostgreSQL is running and try again:"
    echo "  brew services start postgresql (on macOS)"
    echo "  or"
    echo "  sudo systemctl start postgresql (on Linux)"
    exit 1
fi

echo ""

echo -e "${BLUE}🗄️  Database Setup${NC}"
echo "Creating database '$DB_NAME'..."

# Drop and create database in a single transaction
psql -U "$DB_USER" -d postgres << EOF_DB > /dev/null 2>&1
DROP DATABASE IF EXISTS "$DB_NAME";
CREATE DATABASE "$DB_NAME";
EOF_DB

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database ready${NC}"
else
    echo -e "${YELLOW}⚠️  Could not create database - it might already exist${NC}"
fi
echo ""

echo -e "${BLUE}📊 Running Migrations${NC}"
echo "Applying schema..."
if psql -U "$DB_USER" -d "$DB_NAME" -f "backend/schema.sql" 2>&1 | grep -i "error"; then
    echo -e "${RED}✗ Schema migration failed${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Schema applied${NC}"
fi

echo "Seeding data..."
if psql -U "$DB_USER" -d "$DB_NAME" -f "backend/seed.sql" 2>&1 | grep -i "error"; then
    echo -e "${RED}✗ Data seeding failed${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Data seeded${NC}"
fi
echo ""

echo -e "${BLUE}📦 Installing Dependencies${NC}"
echo "Frontend dependencies..."
npm install > /dev/null 2>&1
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

echo "Backend dependencies..."
cd backend
npm install > /dev/null 2>&1
cd ..
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
echo ""

echo -e "${BLUE}🔧 Environment Configuration${NC}"
if [ ! -f "backend/.env" ]; then
    cat > "backend/.env" << EOF
# SIPNG ERP Backend Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Database
DATABASE_URL=postgresql://$DB_USER@$DB_HOST:$DB_PORT/$DB_NAME
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER

# JWT
JWT_SECRET=your-super-secret-key-minimum-32-characters-long-12345
JWT_EXPIRY=24h

# API Gateway
API_GATEWAY_PORT=3000
USER_SERVICE_URL=http://localhost:3001
TICKETS_SERVICE_URL=http://localhost:3002
GROUPS_SERVICE_URL=http://localhost:3003

# CORS
CORS_ORIGIN=http://localhost:4200

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
EOF
    echo -e "${GREEN}✓ Environment file created${NC}"
else
    echo -e "${YELLOW}⚠️  Environment file already exists${NC}"
fi
echo ""

echo -e "${GREEN}============================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}============================${NC}"
echo ""

echo -e "${BLUE}📝 Test Credentials:${NC}"
echo "Email:    jesusefrainbocanegramata@gmail.com"
echo "Password: password123"
echo "Role:     superadmin (all permissions)"
echo ""

echo -e "${BLUE}🚀 To Start Development:${NC}"
echo -e "   ${GREEN}npm run dev${NC}"
echo ""

echo -e "${BLUE}📍 Access Points:${NC}"
echo "   Frontend: ${GREEN}http://localhost:4200${NC}"
echo "   Backend:  ${GREEN}http://localhost:3000${NC}"
echo ""

echo -e "${BLUE}💡 Notes:${NC}"
echo "   • Backend will auto-start all microservices on ports 3000-3003"
echo "   • Frontend will hot-reload on changes"
echo "   • Press Ctrl+C to stop (will stop both frontend and backend)"
echo ""
echo ""

echo -e "${BLUE}📦 Installing Dependencies${NC}"
echo "Frontend dependencies..."
npm install > /dev/null 2>&1
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

echo "Backend dependencies..."
cd backend
npm install > /dev/null 2>&1
cd ..
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
echo ""

echo -e "${BLUE}🔧 Environment Configuration${NC}"
if [ ! -f "backend/.env" ]; then
    cat > "backend/.env" << EOF
# SIPNG ERP Backend Configuration
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Database
DATABASE_URL=postgresql://$DB_USER@$DB_HOST:$DB_PORT/$DB_NAME
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER

# JWT
JWT_SECRET=your-super-secret-key-minimum-32-characters-long-12345
JWT_EXPIRY=24h

# API Gateway
API_GATEWAY_PORT=3000
USER_SERVICE_URL=http://localhost:3001
TICKETS_SERVICE_URL=http://localhost:3002
GROUPS_SERVICE_URL=http://localhost:3003

# CORS
CORS_ORIGIN=http://localhost:4200

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
EOF
    echo -e "${GREEN}✓ Environment file created${NC}"
else
    echo -e "${YELLOW}⚠️  Environment file already exists${NC}"
fi
echo ""

echo -e "${GREEN}============================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}============================${NC}"
echo ""

echo -e "${BLUE}📝 Test Credentials:${NC}"
echo "Email:    jesusefrainbocanegramata@gmail.com"
echo "Password: password123"
echo "Role:     superadmin (all permissions)"
echo ""

echo -e "${BLUE}🚀 To Start Development:${NC}"
echo -e "   ${GREEN}npm run dev${NC}"
echo ""

echo -e "${BLUE}📍 Access Points:${NC}"
echo "   Frontend: ${GREEN}http://localhost:4200${NC}"
echo "   Backend:  ${GREEN}http://localhost:3000${NC}"
echo ""

echo -e "${BLUE}💡 Notes:${NC}"
echo "   • Backend will auto-start all microservices on ports 3000-3003"
echo "   • Frontend will hot-reload on changes"
echo "   • Press Ctrl+C to stop (will stop both frontend and backend)"
echo ""
