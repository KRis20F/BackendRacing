FROM node:18-slim

WORKDIR /app

# Instalar dependencias del sistema necesarias para PostgreSQL
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar package.json y package-lock.json de la raíz y del backend
COPY package*.json ./
COPY server/package*.json ./server/

# Instalar dependencias globales (si tienes) y del backend
RUN npm install
RUN cd server && npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto
EXPOSE 8080

# Comando para iniciar la aplicación
CMD ["npm", "start"]