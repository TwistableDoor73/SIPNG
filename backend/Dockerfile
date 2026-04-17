FROM node:20-alpine

WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalar TODAS (incluye dev para poder hacer build)
RUN npm install

# Copiar código
COPY . .

# 🔥 Construir el proyecto (esto crea /dist)
RUN npm run build

# Eliminar devDependencies para producción
RUN npm prune --production

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/index.js"]