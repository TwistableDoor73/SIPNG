# SIPNG ERP - Deployment Guide

## 📋 Tabla de Contenido
1. [Preparación Local](#preparación-local)
2. [Deployment en Railway](#deployment-en-railway)
3. [Deployment en Vercel](#deployment-en-vercel)
4. [Configuración Base de Datos](#configuración-base-de-datos)
5. [Variables de Entorno](#variables-de-entorno)

## 🚀 Preparación Local

### Requisitos
- Node.js 18+
- PostgreSQL 12+
- npm o yarn

### Instalación

1. **Clonar repositorio**
```bash
git clone <tu-repo>
cd sipng
```

2. **Instalar dependencias**
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

3. **Configurar variables de entorno**
```bash
# Backend
cp backend/.env.example backend/.env

# Editar backend/.env con tus valores locales
DATABASE_URL="postgresql://postgres:password@localhost:5432/sipng_dev"
JWT_SECRET="your-super-secret-key"
```

4. **Crear base de datos**
```bash
psql -U postgres -c "CREATE DATABASE sipng_dev;"
```

5. **Ejecutar aplicación local**
```bash
# Terminal 1: Frontend (Puerto 4200)
npm start

# Terminal 2: Backend (Puerto 3000)
cd backend
npm run dev
```

---

## 🚂 Deployment en Railway

Railway es la opción más fácil para deployar el backend + PostgreSQL.

### Paso 1: Crear Cuenta en Railway
1. Ve a [railway.app](https://railway.app)
2. Crea una cuenta gratuita
3. Conecta tu repositorio de GitHub

### Paso 2: Crear Proyecto
1. Click en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Autoriza y selecciona tu repositorio

### Paso 3: Agregar Servicios

#### Backend (Node.js + Fastify)
1. Click en "New" > "Database" > "PostgreSQL"
2. Se crea automáticamente con `DATABASE_URL`
3. Click en "New" > "GitHub Repo"
4. Configura:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

#### Variables de Entorno para Railway
1. Ve al servicio Node.js
2. Haz click en Variables
3. Agrega estas variables:
```
JWT_SECRET=your-production-secret-key-change-this
NODE_ENV=production
CORS_ORIGIN=https://tu-dominio-frontend.com
DATABASE_URL=<Auto generada por PostgreSQL>
```

### Paso 4: Deploy
El deploy ocurre automáticamente cuando haces push a tu repositorio.

**URL del Backend en Railway:**
```
https://<railway-project-name>.up.railway.app
```

---

## ✨ Deployment en Vercel

Vercel es ideal para el frontend Angular.

### Paso 1: Configurar Frontend para Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Crea una cuenta o inicia sesión
3. Click en "New Project"
4. Selecciona tu repositorio de GitHub

### Paso 2: Configuración del Proyecto

Vercel detectará automáticamente que es un proyecto Angular.

1. **Build Settings:**
   - Framework: Angular
   - Build Command: `npm run build`
   - Output Directory: `dist/sipng/browser`

2. **Environment Variables:**
   - `API_URL=https://<tu-backend-en-railway>.up.railway.app`

3. Click en "Deploy"

### Paso 3: Actualizar Angular app

En `src/main.ts` o en tu servicio HTTP, configura la API:

```typescript
// environment.ts (development)
export const environment = {
  apiUrl: 'http://localhost:3000'
};

// environment.prod.ts (production)
export const environment = {
  apiUrl: 'https://<tu-railway-url>'
};
```

---

## 🔧 Configuración Base de Datos

### PostgreSQL en Railway
Railway provee PostgreSQL automáticamente:
- No necesitas hacer nada más
- La `DATABASE_URL` se genera automáticamente
- Los datos persisten en la nube

### Alternativa: Usar Neon o AWS RDS
1. Crea una cuenta en [neon.tech](https://neon.tech)
2. Crea una base de datos
3. Copia la `DATABASE_URL`
4. Pégala en Railway > Variables > `DATABASE_URL`

---

## 🔐 Variables de Entorno

### Backend (.env o Railway)
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars

# Ports (local only)
API_GATEWAY_PORT=3000
USER_SERVICE_PORT=3001
TICKETS_SERVICE_PORT=3002
GROUPS_SERVICE_PORT=3003

# Services URLs (for Railway, use Railway internal URLs)
USER_SERVICE_URL=http://localhost:3001
TICKETS_SERVICE_URL=http://localhost:3002
GROUPS_SERVICE_URL=http://localhost:3003

# Environment
NODE_ENV=production
LOG_LEVEL=info

# CORS
CORS_ORIGIN=https://tu-frontend.app

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
```

### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

---

## 📊 Diagrama de Arquitectura

```
Frontend (Angular)
   ↓ (HTTP Requests)
Vercel CDN
   ↓
API Gateway (Railway - Puerto 3000)
   ├→ User Service (Puerto 3001)
   ├→ Tickets Service (Puerto 3002)
   └→ Groups Service (Puerto 3003)
        ↓
    PostgreSQL (Railway)
```

---

## 🧪 Testing de Deployment

### Verificar Backend está corriendo
```bash
curl https://<tu-railway-url>/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "service": "apigateway",
  "timestamp": "2026-04-16T..."
}
```

### Verificar Frontend está cargando
```bash
curl https://<tu-vercel-url>
```

### Login Test
```bash
curl -X POST https://<tu-railway-url>/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jesusefrainbocanegramata@gmail.com",
    "password": "password123"
  }'
```

---

## 🆘 Troubleshooting

### Error: "Cannot find module"
```bash
cd backend
npm install
npm run build
```

### Error: Database connection refused
1. Verifica `DATABASE_URL` en Railway
2. Espera 1-2 minutos después de crear PostgreSQL
3. Railway > Resources > PostgreSQL > Logs

### Error: CORS origin not allowed
Actualiza `CORS_ORIGIN` en Railway:
```
https://tu-vercel-url.vercel.app
```

### Error: JWT token expired
Usuarios necesitan hacer login de nuevo

---

## 📈 Monitoring en Production

### Railway Dashboard
- Ve a Railway > Proyecto
- Checa: Deployments, Logs, Metrics

### Environment Variables
Railway > Proyecto > Variables - ve y actualiza aquí

### Base de Datos
Railway > PostgreSQL > Data
- Puedes hacer queries sicede

---

## 🚢 Resumen Pasos Finales

1. ✅ Crea PostgreSQL en Railway
2. ✅ Deploy Backend en Railway
3. ✅ Deploy Frontend en Vercel
4. ✅ Configura CORS_ORIGIN en Railway
5. ✅ Configura API_URL en Vercel
6. ✅ Test login en tu app

**¡Listo para producción! 🎉**
