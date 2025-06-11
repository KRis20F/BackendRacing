#!/bin/bash

# Script general para instalar y ejecutar todo el proyecto Racing F1
# Ejecuta: npm install y npm start en backend y frontend

set -e

# Crear .env por defecto en backend si no existe
if [ -d "server" ]; then
  if [ ! -f "server/.env" ]; then
    echo "Creando .env por defecto en server/.env"
    cat <<EOF > server/.env
SOLANA_NETWORK=testnet
SOLANA_RPC_URL=https://api.testnet.solana.com
PORT=4000
ADMIN_TOKEN=supersecreto123
EOF
  fi
fi

# Instalar dependencias backend
if [ -d "server" ]; then
  echo "\n== Instalando dependencias backend (server) =="
  cd server
  npm install
  cd ..
fi

# Instalar dependencias frontend
if [ -f "package.json" ]; then
  echo "\n== Instalando dependencias frontend (React/Vite) =="
  npm install
fi

# Ejecutar backend
if [ -d "server" ]; then
  echo "\n== Iniciando backend (server) =="
  cd server
  npm start &
  cd ..
fi

# Ejecutar frontend
if [ -f "package.json" ]; then
  echo "\n== Iniciando frontend (React/Vite) =="
  npm run dev &
fi

wait 