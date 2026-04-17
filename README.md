# SIPNG ERP - Sistema Integral de Gestión de Tickets

🎯 **ERP moderno con arquitectura de microservicios para gestión de tickets en modo Kanban/Lista con permisos granulares por usuario y grupo.**

![Status](https://img.shields.io/badge/status-active%20development-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-18%2B-green)
![Angular](https://img.shields.io/badge/angular-20-red)

---

## 🚀 Quick Start

```bash
# Clonar repositorio
git clone <repo-url>
cd sipng

# Instalar todas las dependencias
npm run install:all

# Configurar backend
cp backend/.env.example backend/.env

# Ejecutar en desarrollo
npm run dev
```

Accede a:
- **Frontend:** http://localhost:4200
- **Backend:** http://localhost:3000

---

## 📚 Documentación

- **[Guía de Deployment](./DEPLOYMENT.md)** - Railway + Vercel
- **[Backend README](./backend/README.md)** - Documentación técnica
- **[Credenciales de Prueba](#-credenciales)** - Acceso inmediato

---

## 🔐 Credenciales de Prueba

| Email | Password | Rol |
|-------|----------|-----|
| `jesusefrainbocanegramata@gmail.com` | `password123` | Superadmin |
| `diegotristanlimon@gmail.com` | `password` | Admin |
| `luismontesvelazquez@gmail.com` | `password` | Usuario |
| `paulavaleriasancheztrejo@gmail.com` | `password` | Dev |

---

## ✨ Características

✅ Autenticación segura con JWT  
✅ Permisos granulares sin roles (por acción)  
✅ Gestión de tickets Kanban/Lista  
✅ Microservicios escalables  
✅ PostgreSQL + API Gateway  
✅ Deploy en Railway + Vercel  

---

## 📦 Stack

- **Angular 20** + PrimeNG
- **Fastify** + PostgreSQL  
- **Microservicios** (User, Tickets, Groups)
- **JWT Authentication**
- **Vercel** + **Railway**

---

[Ver documentación completa →](./DEPLOYMENT.md)

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
