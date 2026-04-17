#!/bin/bash

# SIPNG Installation Script
# Este script instala y configura todo lo necesario para ejecutar SIPNG

set -e

echo "========================================="
echo "🚀 SIPNG ERP - Installation Script"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js version
echo -e "${BLUE}✓ Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}✗ Node.js version must be 18 or higher${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"
echo ""

# Install frontend dependencies
echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
echo ""

# Install backend dependencies
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
cd backend
npm install
cd ..
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
echo ""

# Create .env file
echo -e "${BLUE}⚙️  Setting up environment variables...${NC}"

if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Creating backend/.env from template...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}⚠️  Please edit backend/.env with your database credentials${NC}"
else
    echo -e "${GREEN}✓ backend/.env already exists${NC}"
fi
echo ""

# Display next steps
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✅ Installation complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

echo -e "${BLUE}📝 Next Steps:${NC}"
echo ""
echo -e "${YELLOW}1. Configure Database:${NC}"
echo "   - Edit backend/.env with your PostgreSQL connection string"
echo "   - Or use: psql -U postgres -c \"CREATE DATABASE sipng_dev;\""
echo ""
echo -e "${YELLOW}2. Run in Development:${NC}"
echo "   - Option A (one terminal): ${GREEN}npm run dev${NC}"
echo "   - Option B (two terminals):"
echo "     Terminal 1: ${GREEN}npm start${NC}"
echo "     Terminal 2: ${GREEN}cd backend && npm run dev${NC}"
echo ""
echo -e "${YELLOW}3. Access the Application:${NC}"
echo "   - Frontend: ${GREEN}http://localhost:4200${NC}"
echo "   - Backend:  ${GREEN}http://localhost:3000${NC}"
echo ""

echo -e "${YELLOW}4. Test Credentials:${NC}"
echo "   Email: ${GREEN}jesusefrainbocanegramata@gmail.com${NC}"
echo "   Password: ${GREEN}password123${NC}"
echo ""

echo -e "${BLUE}📚 Documentation:${NC}"
echo "   - See DEPLOYMENT.md for Railway + Vercel deployment"
echo "   - See backend/README.md for API documentation"
echo ""

echo -e "${BLUE}🆘 Need Help?${NC}"
echo "   1. Check DEPLOYMENT.md"
echo "   2. Check backend/README.md"
echo "   3. Ensure Node.js 18+ is installed"
echo "   4. Ensure PostgreSQL is installed and running"
echo ""
