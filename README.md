## Español

- **Address:** `GuNPXxRBR...tpEEQhseF`
  - Es la dirección de la cuenta de token específica en Solana. Identifica de manera única la cuenta de token SPL donde se almacenan los tokens de un usuario para un mint específico.
- **Mint:** `7v1APBRTFQ...Y61RvLUvB7`
  - Es la dirección del mint del token. Identificador único del tipo de token SPL. Todos los tokens de este tipo comparten este mint.
- **Owner:** `8x99Ffpzm0...JMCUm5bKe`
  - Es la dirección del propietario de la cuenta de token. Indica quién controla la cuenta y puede autorizar transferencias de los tokens almacenados.

## Italiano

- **Address:** `GuNPXxRBR...tpEEQhseF`
  - Indirizzo dell'account token specifico su Solana. Identifica in modo univoco l'account token SPL dove sono conservati i token di un utente per uno specifico mint.
- **Mint:** `7v1APBRTFQ...Y61RvLUvB7`
  - Indirizzo del mint del token. Identificatore unico del tipo di token SPL. Tutti i token di questo tipo condividono questo mint.
- **Owner:** `8x99Ffpzm0...JMCUm5bKe`
  - Indirizzo del proprietario dell'account token. Indica chi controlla l'account e può autorizzare trasferimenti dei token conservati.

## Català

- **Address:** `GuNPXxRBR...tpEEQhseF`
  - Adreça del compte de token específic a Solana. Identifica de manera única el compte de token SPL on s'emmagatzemen els tokens d'un usuari per a un mint concret.
- **Mint:** `7v1APBRTFQ...Y61RvLUvB7`
  - Adreça del mint del token. Identificador únic del tipus de token SPL. Tots els tokens d'aquest tipus comparteixen aquest mint.
- **Owner:** `8x99Ffpzm0...JMCUm5bKe`
  - Adreça del propietari del compte de token. Indica qui controla el compte i pot autoritzar transferències dels tokens emmagatzemats.

# Direcciones de Solana y su uso (Imagen @SCR-20250511-pcme.png)

## Español
- **Address:** `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`
  - Es la dirección del programa de tokens SPL en Solana, conocido como "Token Program". Gestiona la creación, transferencia y manejo de todos los tokens SPL en la red Solana.
- **Assigned Program Id:** `BPF Loader 2`
  - Es el identificador del programa asignado que gestiona la cuenta. Indica que el programa fue cargado usando el cargador BPF, que permite ejecutar programas en Solana.

## Italiano
- **Address:** `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`
  - È l'indirizzo del programma token SPL su Solana, noto come "Token Program". Gestisce la creazione, il trasferimento e la gestione di tutti i token SPL sulla rete Solana.
- **Assigned Program Id:** `BPF Loader 2`
  - È l'identificatore del programma assegnato che gestisce l'account. Indica che il programma è stato caricato usando il caricatore BPF, che permette di eseguire programmi su Solana.

## Català
- **Address:** `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`
  - És l'adreça del programa de tokens SPL a Solana, conegut com a "Token Program". Gestiona la creació, transferència i gestió de tots els tokens SPL a la xarxa Solana.
- **Assigned Program Id:** `BPF Loader 2`
  - És l'identificador del programa assignat que gestiona el compte. Indica que el programa s'ha carregat utilitzant el carregador BPF, que permet executar programes a Solana.

# Uso de la dirección Mint de Solana en .env

## Español
- **Address:** `4MCKxwSEF3M6y9WsLiJtkoKaMtWh7eRhuV1gRUVZMg6w`
  - Es la dirección del mint de un token SPL en Solana.
  - Es correcto guardar la dirección pública del mint en un archivo `.env` para que los scripts o el backend sepan a qué token SPL referirse para mintear, transferir o consultar balances.
  - **Importante:** Nunca pongas la clave privada (secret key) del mint en el `.env` si el archivo se comparte o sube a un repositorio público. Solo la dirección pública es segura para exponer.

## Italiano
- **Address:** `4MCKxwSEF3M6y9WsLiJtkoKaMtWh7eRhuV1gRUVZMg6w`
  - È l'indirizzo del mint di un token SPL su Solana.
  - È corretto salvare l'indirizzo pubblico del mint in un file `.env` per permettere agli script o backend di sapere a quale token SPL riferirsi per mintare, trasferire o consultare i balance.
  - **Importante:** Non mettere la chiave privata (secret key) del mint nel `.env` se il file viene condiviso o pubblicato. Solo l'indirizzo pubblico è sicuro da esporre.

## Català
- **Address:** `4MCKxwSEF3M6y9WsLiJtkoKaMtWh7eRhuV1gRUVZMg6w`
  - És l'adreça del mint d'un token SPL a Solana.
  - És correcte guardar l'adreça pública del mint en un fitxer `.env` perquè els scripts o backend sàpiguen a quin token SPL referir-se per mintejar, transferir o consultar balanços.
  - **Important:** No posis la clau privada (secret key) del mint al `.env` si el fitxer es comparteix o es puja a un repositori públic. Només l'adreça pública és segura d'exposar.

# Racing Game Backend

## Autenticación en Headers

Para todas las peticiones que requieren autenticación, debes incluir el token JWT en el header de esta manera:

```http
Accept: */*
Content-Type: application/json
x-auth-token: eyJhbGciOiJIUzI1NiIs...  // Tu token JWT
```

> ⚠️ **Importante**: 
> - El token se obtiene al hacer login o registro
> - El header debe ser exactamente `x-auth-token`
> - El token debe incluir el prefijo `Bearer`

Ejemplo de una petición autenticada usando curl:
```bash
curl -X GET http://localhost:8080/api/dashboard/user/stats \
  -H "Content-Type: application/json" \
  -H "x-auth-token: eyJhbGciOiJIUzI1NiIs..."
```

Ejemplo usando Fetch API:
```javascript
fetch('http://localhost:8080/api/dashboard/user/stats', {
  headers: {
    'Content-Type': 'application/json',
    'x-auth-token': 'eyJhbGciOiJIUzI1NiIs...'  // Tu token JWT
  }
})
```

## Sistema Implementado

### Autos/NFTs Disponibles
- ✅ Base de datos implementada con tabla `Cars` y `UserCars`
- ✅ 6 autos añadidos con detalles completos:
  - Dodge Charger (Muscle) - 85,000 RCF
  - Formula 1 (Formula) - 2,000,000 RCF
  - Porsche 911 GT3 (Sports) - 150,000 RCF
  - BMW M3 (Racing) - 120,000 RCF
  - Lamborghini Huracán (Super) - 180,000 RCF
  - Mosler GT (Racing) - 200,000 RCF

### Estructura de Assets
- ✅ Assets estáticos en frontend:
  - `/static/models3d/` - Modelos 3D de autos
  - `/static/images/cars/` - Imágenes y previsualizaciones
- ✅ Rutas optimizadas con prefijo '/static/'

## Documentación de API

### 1. Marketplace

#### 1.1 Listar Autos (Marketplace)
```http
GET /api/marketplace/listings
```
**Autenticación**: No requerida

**Respuesta (200 OK)**:
```json
[
  {
    "id": 1,
    "name": "Dodge Charger",
    "description": "Muscle car clásico americano",
    "preview_image": "/static/images/cars/dodge-charger.jpg",
    "thumbnail_image": "/static/images/cars/dodge-charger-thumb.jpg",
    "price": 85000,
    "model_path": "/static/models3d/dodge-charger.glb",
    "category": "Muscle",
    "specs": {
      "power": 717,
      "acceleration": 3.6,
      "top_speed": 326,
      "weight": 2000
    },
    "current_price": 85000,
    "market_status": "available",
    "seller_id": null
  }
]
```

#### 1.2 Vender Auto
```http
POST /api/marketplace/sell
```
**Autenticación**: JWT requerido

**Body**:
```json
{
    "carId": 1,
    "sellerId": 1,
    "price": 100000,
    "currency": "RCF"
}
```

**Respuesta (200 OK)**:
```json
{
    "status": "ok",
    "message": "Auto listado para venta"
}
```

#### 1.3 Comprar Auto
```http
POST /api/marketplace/buy
```
**Autenticación**: JWT requerido

**Body**:
```json
{
    "listingId": 1,
    "buyerId": 2
}
```

**Respuesta (200 OK)**:
```json
{
    "status": "ok",
    "message": "Compra realizada con éxito",
    "carId": 1,
    "buyerId": 2,
    "sellerId": 1,
    "price": 100000,
    "signature": "abc123..."
}
```

### 2. Autos

#### 2.1 Listar Todos los Autos
```http
GET /api/cars
```
**Autenticación**: No requerida

**Respuesta (200 OK)**:
```json
[
  {
    "id": 1,
    "name": "Dodge Charger",
    "description": "Muscle car clásico americano",
    "preview_image": "/static/images/cars/dodge-charger.jpg",
    "thumbnail_image": "/static/images/cars/dodge-charger-thumb.jpg",
    "price": 85000,
    "model_path": "/static/models3d/dodge-charger.glb",
    "category": "Muscle",
    "specs": {
      "power": 717,
      "acceleration": 3.6,
      "top_speed": 326,
      "weight": 2000
    }
  }
]
```

#### 2.2 Filtrar por Categoría
```http
GET /api/cars/category/:category
```
**Autenticación**: No requerida
**Categorías**: Muscle, Formula, Sports, Racing, Super

#### 2.3 Autos de Usuario
```http
GET /api/cars/user/:userId
```
**Autenticación**: JWT requerido

### 3. Pagos y Transacciones

#### 3.1 Enviar Pago
```http
POST /api/payment/send
```
**Autenticación**: JWT requerido

**Body**:
```json
{
    "fromUserId": 1,
    "toUserId": 2,
    "amount": 1000
}
```

#### 3.2 Historial de Transacciones
```http
GET /api/transactions/history/:userId
```
**Autenticación**: JWT requerido

## Estructura de Base de Datos

### Tablas Principales
1. **Cars**
   - id, name, description, preview_image, thumbnail_image
   - price, model_path, category, specs (JSONB)

2. **UserCars**
   - id, userId, carId, quantity

3. **car_market_transactions**
   - id, car_id, seller_id, price, currency
   - status (pending/en_venta/vendido)
   - created_at, updated_at

4. **token_exchanges**
   - from_addr, to_addr, token, amount
   - signature, from_username, to_username

## Estados de Marketplace
- `available`: Auto disponible para compra directa
- `pending`: Auto en proceso de venta
- `en_venta`: Auto listado en marketplace
- `vendido`: Auto ya vendido

## Seguridad
- ✅ Autenticación JWT implementada
- ✅ Rutas protegidas para operaciones sensibles
- ✅ Validación de saldo para transacciones
- ✅ Verificación de propiedad de autos

## Próximos Pasos
1. Sistema de carreras
2. Más autos y categorías
3. Sistema de recompensas
4. Estadísticas de carreras
5. Sistema de rankings

## Tecnologías
- Node.js + Express
- PostgreSQL
- Solana Web3.js
- JWT
- Sequelize ORM

## Autenticación

### 1. Registro de Usuario
```http
POST /api/auth/register
```

**Headers**:
```http
Content-Type: application/json
```

**Body**:
```json
{
    "username": "usuario",
    "email": "usuario@example.com",
    "password": "contraseña",
    "fechaNacimiento": "1990-01-01"
}
```

**Respuesta (200 OK)**:
```json
{
    "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 2. Login
```http
POST /api/auth/login
```

**Headers**:
```http
Content-Type: application/json
```

**Body**:
```json
{
    "email": "usuario@example.com",
    "password": "contraseña"
}
```

**Respuesta (200 OK)**:
```json
{
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
        "id": 1,
        "username": "usuario",
        "email": "usuario@example.com",
        "fechaNacimiento": "1990-01-01"
    }
}
```

## Manejo de Errores

### Errores Comunes

1. **401 Unauthorized**
```json
{
    "msg": "No token, authorization denied"
}
```
o
```json
{
    "msg": "Token is not valid"
}
```

2. **400 Bad Request**
```json
{
    "error": "Saldo insuficiente para comprar el auto"
}
```
o
```json
{
    "errors": [
        {
            "msg": "Email is required",
            "param": "email",
            "location": "body"
        }
    ]
}
```

3. **404 Not Found**
```json
{
    "error": "Auto no encontrado"
}
```

4. **500 Server Error**
```json
{
    "error": "Error al realizar la compra",
    "details": "..."
}
```

## Flujos de Trabajo Implementados

### 1. Compra/Venta de Autos
1. Usuario lista un auto para venta (`POST /api/marketplace/sell`)
2. Auto aparece en marketplace (`GET /api/marketplace/listings`)
3. Comprador verifica saldo
4. Comprador realiza compra (`POST /api/marketplace/buy`)
5. Sistema:
   - Verifica saldo del comprador
   - Transfiere tokens
   - Actualiza propietario del auto
   - Registra transacción
   - Actualiza estado en marketplace

### 2. Sistema de Pagos
1. Usuario inicia transferencia (`POST /api/payment/send`)
2. Sistema:
   - Verifica saldos
   - Procesa transacción en Solana
   - Registra en base de datos
   - Actualiza balances

### 3. Gestión de NFTs (Autos)
- Cada auto es un NFT único
- Propiedades inmutables (specs, modelo, etc.)
- Propiedad verificable en blockchain
- Transferible entre usuarios

## Variables de Entorno (.env)
```env
JWT_SECRET=tu_secreto_jwt
SOLANA_RPC_URL=https://api.testnet.solana.com
MINT_ADDRESS=tu_mint_address
DATABASE_URL=postgres://usuario:contraseña@localhost:5432/racingdb
```

# Racing F1 Backend API Documentation

## Configuración Base

```javascript
const API_BASE_URL = 'https://racing-f1-backend.fly.dev';

const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'x-auth-token': token })
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  return await response.json();
};
```

## Endpoints Disponibles

### 1. Autenticación y Usuarios
```javascript
// Login
POST /api/auth/login
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}

// Registro
POST /api/auth/register
{
  "username": "usuario",
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}
```

### 2. Wallet y Tokens
```javascript
// Crear wallet
POST /api/wallet/create
// No requiere body, usa el token JWT para identificar al usuario

// Obtener balance de tokens
GET /api/wallet/token/balance/:publicKey

// Crear cuenta de token
POST /api/wallet/token/account
{
  "publicKey": "dirección_wallet"
}

// Transferir tokens
POST /api/wallet/token/transfer
{
  "fromPublicKey": "wallet_origen",
  "toPublicKey": "wallet_destino",
  "amount": "cantidad"
}

// Obtener balance de SOL
GET /api/wallet/sol/:address
```

### 3. Carreras y Apuestas
```javascript
// Crear apuesta
POST /api/race/bet/create
{
  "userId": "id_usuario",
  "rivalId": "id_rival",
  "amount": "cantidad_apuesta"
}

// Registrar resultado de carrera
POST /api/race/race/result
{
  "userId": "id_usuario",
  "rivalId": "id_rival",
  "tiempo": "tiempo_carrera",
  "gano": true/false,
  "posicion": "posición_final"
}
```

### 4. Marketplace
```javascript
// Obtener listado de autos en venta
GET /api/marketplace/listings

// Comprar auto
POST /api/marketplace/buy
{
  "listingId": "id_listado",
  "buyerId": "id_comprador"
}

// Vender auto
POST /api/marketplace/sell
{
  "carId": "id_auto",
  "sellerId": "id_vendedor",
  "price": "precio",
  "currency": "RCF"
}
```

### 5. Intercambios
```javascript
// Transferir tokens
POST /api/exchange/token
{
  "fromUserId": "id_origen",
  "toUserId": "id_destino",
  "token": "dirección_token",
  "amount": "cantidad"
}

// Transferir NFT
POST /api/exchange/nft
{
  "fromUserId": "id_origen",
  "toUserId": "id_destino",
  "nft": "id_nft"
}
```

### 6. Autos (Cars)
```javascript
// Obtener todos los autos
GET /api/cars

// Obtener autos de un usuario
GET /api/cars/user/:userId

// Obtener auto específico
GET /api/cars/:id
```

### 7. Dashboard y Estadísticas
```javascript
// Obtener leaderboard
GET /api/dashboard/leaderboard

// Obtener historial de precios del token
GET /api/dashboard/token/price-history
```

### 8. Facturación
```javascript
// Obtener transacciones
GET /api/billing/transactions

// Obtener historial de balance
GET /api/billing/balance-history
```

## Ejemplos de Uso

### Crear una Wallet y Obtener Balance
```javascript
// Crear wallet
const createWallet = async () => {
  try {
    const response = await apiCall('/api/wallet/create', {
      method: 'POST'
    });
    console.log('Wallet creada:', response);
    return response;
  } catch (error) {
    console.error('Error creando wallet:', error);
  }
};

// Obtener balance
const getBalance = async (publicKey) => {
  try {
    const response = await apiCall(`/api/wallet/token/balance/${publicKey}`);
    console.log('Balance:', response);
    return response;
  } catch (error) {
    console.error('Error obteniendo balance:', error);
  }
};
```

### Realizar una Apuesta
```javascript
const placeBet = async (betData) => {
  try {
    const response = await apiCall('/api/race/bet/create', {
      method: 'POST',
      body: JSON.stringify({
        userId: betData.userId,
        rivalId: betData.rivalId,
        amount: betData.amount
      })
    });
    console.log('Apuesta creada:', response);
    return response;
  } catch (error) {
    console.error('Error creando apuesta:', error);
  }
};
```

### Comprar un Auto
```javascript
const buyCar = async (carData) => {
  try {
    const response = await apiCall('/api/marketplace/buy', {
      method: 'POST',
      body: JSON.stringify({
        listingId: carData.listingId,
        buyerId: carData.buyerId
      })
    });
    console.log('Compra realizada:', response);
    return response;
  } catch (error) {
    console.error('Error comprando auto:', error);
  }
};
```

## Notas Importantes

1. **Autenticación**
   - Todos los endpoints (excepto login/registro) requieren token JWT en el header
   - El token se obtiene al hacer login/registro
   - Formato: `x-auth-token: tu_token_jwt`

2. **Manejo de Errores**
   - Los errores devuelven códigos HTTP estándar
   - Incluyen mensaje descriptivo en el campo `error`
   - Implementar manejo de errores en el cliente

3. **Limitaciones**
   - Máximo 10 transacciones por minuto por usuario
   - Tamaño máximo de payload: 1MB
   - Tiempo máximo de respuesta: 30 segundos

4. **Seguridad**
   - Usar HTTPS en producción
   - No almacenar claves privadas
   - Validar inputs en el cliente
   - Manejar timeouts y reconexiones

# Racing Game Frontend Documentation

## 1. Authentication System

### Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "fechaNacimiento": "YYYY-MM-DD"
}
```

Response:
```json
{
  "token": "jwt_token"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "string",
  "password": "string"
}
```

Response:
```json
{
  "token": "jwt_token",
  "user": {
    "id": "number",
    "username": "string",
    "email": "string"
  }
}
```

#### Get User Data
```http
GET /api/auth/me
Authorization: Bearer <token>
```

Response:
```json
{
  "profile": {
    "id": "number",
    "username": "string",
    "email": "string",
    "publicKey": "string",
    "avatar": "string",
    "level": "number",
    "badges": ["string"],
    "fechaNacimiento": "date"
  },
  "game": {
    "experience": "number",
    "totalRaces": "number",
    "wins": "number",
    "losses": "number",
    "rank": "string",
    "stats": {
      "bestLapTime": "number",
      "carCollection": ["string"],
      "favoriteTrack": "string",
      "totalDistance": "number"
    }
  },
  "finances": {
    "tokenBalance": "decimal",
    "usdBalance": "decimal",
    "wallet": {
      "balance": "decimal",
      "address": "string"
    },
    "transaction_limits": {
      "daily_limit": 1000,
      "monthly_limit": 10000,
      "max_transaction": 500
    },
    "billing_preferences": {
      "auto_pay": false,
      "invoice_email": "string",
      "default_currency": "USD"
    }
  }
}
```

## 2. Betting System

### Create Bet
```http
POST /bet/create
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "userId": "number",
  "rivalId": "number",
  "cantidad": "decimal"
}
```

Response:
```json
{
  "status": "ok",
  "message": "Apuesta creada y saldo bloqueado."
}
```

### Register Race Result
```http
POST /race/result
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "userId": "number",
  "rivalId": "number",
  "tiempo": "decimal",
  "gano": "boolean",
  "posicion": "number"
}
```

Response:
```json
{
  "status": "ok",
  "message": "Resultado procesado, tokens transferidos al ganador y resultado guardado.",
  "winnerId": "number"
}
```

## 3. Frontend Implementation Guide

### Required Dependencies
```json
{
  "dependencies": {
    "axios": "^1.x.x",
    "react-redux": "^8.x.x",
    "@reduxjs/toolkit": "^1.x.x",
    "react-router-dom": "^6.x.x",
    "jwt-decode": "^3.x.x"
  }
}
```

### State Management Structure
```typescript
interface RootState {
  auth: {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
  };
  wallet: {
    balance: number;
    address: string;
    transactions: Transaction[];
  };
  game: {
    currentBet: Bet | null;
    raceResults: RaceResult[];
    stats: GameStats;
  };
}
```

### Protected Routes Setup
```typescript
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};
```

### API Interceptor
```typescript
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

### Dashboard Layout
```typescript
const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Sidebar>
        <UserProfile />
        <Navigation />
      </Sidebar>
      <MainContent>
        <GameStats />
        <BettingSection />
        <RaceHistory />
      </MainContent>
      <RightPanel>
        <WalletInfo />
        <TransactionHistory />
      </RightPanel>
    </div>
  );
};
```

## 4. Important Notes

### Security Considerations
- Store JWT token in HttpOnly cookies
- Implement refresh token mechanism
- Validate all user inputs
- Use HTTPS in production
- Implement rate limiting on frontend

### Error Handling
- Implement global error boundary
- Use toast notifications for user feedback
- Handle network errors gracefully
- Implement retry mechanism for failed requests

### Performance
- Implement lazy loading for routes
- Use React.memo for expensive components
- Implement proper loading states
- Cache API responses when appropriate

### WebSocket Integration
```typescript
const ws = new WebSocket('ws://your-server/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case 'BET_ACCEPTED':
      // Handle bet acceptance
      break;
    case 'RACE_RESULT':
      // Handle race result
      break;
    case 'BALANCE_UPDATE':
      // Handle balance update
      break;
  }
};
```

## 5. Database Schema Reference

### Users Table
- id (PK)
- username
- email
- password
- avatar
- level
- badges
- tokenBalance
- publicKey
- experience
- totalRaces
- wins
- losses
- rank
- stats
- fechaNacimiento
- usdBalance
- transaction_limits
- billing_preferences

### Bets Table
- id (PK)
- user1_id (FK)
- user2_id (FK)
- amount
- status
- winner_id
- created_at

### Race Results Table
- id (PK)
- user_id (FK)
- rival_id (FK)
- tiempo
- posicion
- bet_id (FK)
- created_at

For any questions or clarifications, please contact the backend team.

# Dashboard API Documentation

## Endpoints del Dashboard

### 1. Estadísticas del Usuario
```http
GET /api/dashboard/user/stats
Authorization: Bearer <token>
```

**Respuesta (200 OK)**:
```json
{
  "level": 1,
  "experience": 0,
  "totalRaces": 0,
  "wins": 0,
  "losses": 0,
  "rank": "Novato",
  "tokenBalance": "0.00000000",
  "stats": {
    "bestLapTime": null,
    "carCollection": [],
    "favoriteTrack": null,
    "totalDistance": 0
  }
}
```

### 2. Historial de Carreras
```http
GET /api/dashboard/user/race-history
Authorization: Bearer <token>
```

**Respuesta (200 OK)**:
```json
[]  // Lista de carreras del usuario
```

### 3. Ganancias del Usuario
```http
GET /api/dashboard/user/earnings
Authorization: Bearer <token>
```

**Respuesta (200 OK)**:
```json
{
  "totalEarnings": 0,
  "recentHistory": []
}
```

### 4. Logros del Usuario
```http
GET /api/dashboard/user/achievements
Authorization: Bearer <token>
```

**Respuesta (200 OK)**:
```json
{
  "badges": [],
  "stats": {
    "bestLapTime": null,
    "carCollection": [],
    "favoriteTrack": null,
    "totalDistance": 0
  }
}
```

### 5. Estadísticas Globales
```http
GET /api/dashboard/global/stats
Authorization: Bearer <token>
```

**Respuesta (200 OK)**:
```json
{
  "totalUsers": 6,
  "totalRaces": 0,
  "totalBets": 0,
  "topWinners": [
    {
      "username": "usuario1",
      "wins": 0
    },
    // ... más usuarios
  ]
}
```

### 6. Resumen del Mercado
```http
GET /api/dashboard/market/overview
Authorization: Bearer <token>
```

**Respuesta (200 OK)**:
```json
{
  "totalCars": 6,
  "popularCars": [],
  "recentTransactions": [
    {
      "id": 1,
      "user_id": 1,
      "amount": "1.50000000",
      "type": "deposit",
      "status": "completed",
      "description": "Test transaction",
      "created_at": "2025-05-13T22:08:06.132Z"
    }
  ]
}
```

## Tablas de Base de Datos Relacionadas

### race_results
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER, FK -> Users.id)
- rival_id (INTEGER, FK -> Users.id)
- tiempo (DECIMAL(10,3))
- posicion (INTEGER)
- bet_id (INTEGER, FK -> bets.id)
- created_at (TIMESTAMP)

### bets
- id (SERIAL PRIMARY KEY)
- user1_id (INTEGER, FK -> Users.id)
- user2_id (INTEGER, FK -> Users.id)
- amount (DECIMAL(20,8))
- status (VARCHAR(20))
- winner_id (INTEGER, FK -> Users.id)
- created_at (TIMESTAMP)

## Notas de Implementación

1. Todos los endpoints requieren autenticación mediante JWT
2. Los datos se actualizan en tiempo real
3. Las estadísticas se calculan y almacenan en caché para mejor rendimiento
4. Se implementan índices en las tablas para consultas rápidas
5. Manejo de errores consistente en todos los endpoints

## Recomendaciones para el Frontend

1. Implementar polling o WebSocket para datos en tiempo real
2. Cachear respuestas para reducir llamadas al servidor
3. Implementar estados de carga para mejor UX
4. Manejar errores y mostrar feedback al usuario
5. Utilizar gráficos para visualizar estadísticas
