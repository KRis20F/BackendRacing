# RaCingFi Backend – Documentación Completa

---

## Índice

1. [Descripción General](#descripcion-general)
2. [Arquitectura y Tecnologías](#arquitectura-y-tecnologias)
3. [Instalación y Configuración](#instalacion-y-configuracion)
4. [Estructura de Carpetas](#estructura-de-carpetas)
5. [Variables de Entorno](#variables-de-entorno)
6. [Scripts y Comandos](#scripts-y-comandos)
7. [Modelos de Base de Datos](#modelos-de-base-de-datos)
8. [Endpoints Principales](#endpoints-principales)
9. [Autenticación y Seguridad](#autenticacion-y-seguridad)
10. [Flujos de Usuario](#flujos-de-usuario)
11. [Despliegue](#despliegue)
12. [Soporte](#soporte)

---

## 1. Descripción General

Backend para el juego Play-to-Earn **RaCingFi**. Gestiona usuarios, apuestas PvP, NFTs, transacciones, facturación y la integración con blockchain (Solana testnet). Provee una API RESTful segura y escalable.

---

## 2. Arquitectura y Tecnologías

- **Node.js** + **Express** para la API REST
- **Sequelize** como ORM (soporta PostgreSQL, MySQL, SQLite)
- **JWT** para autenticación
- **Swagger** para documentación automática
- **Solana Web3.js** para integración blockchain
- **Despliegue**: Fly.io, Heroku, Vercel o VPS

---

## 3. Instalación y Configuración

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tuusuario/BackendRacing-main.git
   cd BackendRacing-main/server
   ```
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` con las variables necesarias (ver sección 5).
4. Inicia el servidor:
   ```bash
   npm start
   ```

---

## 4. Estructura de Carpetas

```
server/
├── src/
│   ├── controllers/   # Lógica de endpoints
│   ├── models/        # Modelos Sequelize (User, Bet, NFT, Transaction, Invoice...)
│   ├── routes/        # Definición de rutas Express
│   ├── services/      # Lógica de negocio y helpers
│   ├── middlewares/   # Autenticación, validación, logging
│   ├── config/        # Configuración de DB y entorno
│   └── utils/         # Utilidades varias
├── migrations/        # Migraciones de base de datos
├── seeders/           # Datos de ejemplo
├── index.js           # Punto de entrada principal
└── ...
```

---

## 5. Variables de Entorno

Ejemplo de `.env`:
```env
PORT=8080
DB_HOST=localhost
DB_USER=usuario
DB_PASSWORD=contraseña
DB_NAME=racingfi_db
JWT_SECRET=tu_clave_secreta
SOLANA_PRIVATE_KEY=...
SOLANA_TOKEN_ADDRESS=...
TREASURY_WALLET=...
```

---

## 6. Scripts y Comandos

- `npm start` — Inicia el servidor en modo producción
- `npm run dev` — Modo desarrollo con nodemon
- `npm run migrate` — Ejecuta migraciones
- `npm run seed` — Pobla la base de datos con datos de ejemplo

---

## 7. Modelos de Base de Datos

- **User**: username, email, password (hash), wallet, stats, nivel, experiencia
- **Bet**: usuarioA, usuarioB, cantidad, estado, ganador, timestamps
- **NFT**: id, ownerId, metadata, historial de transacciones
- **Transaction**: id, userId, tipo (DEPOSIT, WITHDRAWAL, BET, WIN, CAR_SALE), amount, status, description, createdAt
- **Invoice**: id, userId, amount, currency, status, pdf_url, createdAt

Relaciones:
- Un usuario puede tener muchas apuestas, NFTs, transacciones e invoices.
- Las apuestas referencian a dos usuarios y un ganador.

---

## 8. Endpoints Principales

### Autenticación
- `POST /api/auth/register` — Registro de usuario
- `POST /api/auth/login` — Login, retorna JWT
- `GET /api/auth/me` — Perfil del usuario autenticado

### Usuarios
- `GET /api/users/:id` — Perfil público
- `GET /api/users/:id/stats` — Estadísticas
- `GET /api/users/:id/wallet` — Info de wallet

### Apuestas PvP
- `POST /api/bets` — Crear apuesta
- `POST /api/bets/:id/accept` — Aceptar apuesta
- `GET /api/bets` — Listar apuestas

### NFTs
- `GET /api/nfts` — Listar NFTs
- `POST /api/nfts/buy` — Comprar NFT
- `POST /api/nfts/transfer` — Transferir NFT

### Transacciones y Facturación
- `GET /api/transactions` — Historial de transacciones
- `GET /api/invoices` — Facturas del usuario

### Exchange
- `GET /api/exchange/orderbook` — Ver el orderbook
- `POST /api/exchange/swap` — Convertir tokens

**Documentación Swagger:** `/api-docs`

#### Ejemplo de request autenticado:
```http
GET /api/transactions
x-auth-token: <JWT>
```

---

## 9. Autenticación y Seguridad

- Todos los endpoints protegidos requieren el header `x-auth-token` con el JWT puro (no "Bearer ...").
- El backend valida el JWT y asocia el usuario a la request.
- Contraseñas hasheadas con bcrypt.
- Validación de input y sanitización en todos los endpoints.
- Lógica anti-cheat para apuestas y resultados.

---

## 10. Flujos de Usuario

### Registro y Login
1. El usuario se registra (`/api/auth/register`).
2. Hace login (`/api/auth/login`) y recibe un JWT.
3. El JWT se usa en todas las peticiones protegidas.

### Apuestas PvP
1. Usuario A crea una apuesta (`/api/bets`).
2. Usuario B acepta la apuesta (`/api/bets/:id/accept`).
3. El backend resuelve la apuesta y transfiere el pozo al ganador.

### Marketplace de NFTs
1. Usuario compra NFT (`/api/nfts/buy`).
2. Puede transferirlo o venderlo a otro usuario (`/api/nfts/transfer`).

### Facturación y Transacciones
- Todas las operaciones financieras quedan registradas en la tabla `Transaction` y pueden consultarse vía API.
- Las compras generan facturas (`Invoice`) descargables en PDF.

---

## 11. Despliegue

- Preparado para Fly.io, Heroku, Vercel o VPS.
- Exponer el puerto en `0.0.0.0`.
- Variables sensibles deben configurarse en el entorno de despliegue.
- La base de datos puede estar en el mismo VPS o en un servicio gestionado (ej: Railway, Supabase, PlanetScale).

---

## 12. Soporte

- Para dudas, abre un issue en el repo o contacta al equipo de RaCingFi.
- Documentación Swagger disponible en `/api-docs` tras levantar el servidor.

---

## Ejemplo de Estructura de Request/Response

### Crear apuesta
```http
POST /api/bets
x-auth-token: <JWT>
Content-Type: application/json

{
  "rivalId": 2,
  "cantidad": 100
}
```
**Response:**
```json
{
  "id": 1,
  "userA": 1,
  "userB": 2,
  "cantidad": 100,
  "estado": "pendiente"
}
```

### Comprar NFT
```http
POST /api/nfts/buy
x-auth-token: <JWT>
Content-Type: application/json

{
  "nftId": 5
}
```
**Response:**
```json
{
  "success": true,
  "nft": {
    "id": 5,
    "ownerId": 1,
    ...
  }
}
```

---

## Buenas Prácticas y Seguridad

- Actualiza dependencias regularmente.
- No subas `.env` ni claves privadas al repo.
- Usa HTTPS en producción.
- Haz backups regulares de la base de datos.
- Limita el rate de requests para evitar abuso.

---

**RaCingFi Backend: seguro, escalable y listo para la revolución Play-to-Earn.**
