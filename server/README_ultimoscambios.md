# Últimos Cambios: Apuestas y Resultados de Carrera (Backend + Unity)

## 1. Nuevos Endpoints

### a) Crear apuesta antes de la carrera
- **POST /bet/create**
- **Body:** `{ userId, rivalId, cantidad }`
- **Función:** Bloquea la cantidad apostada de ambos usuarios y deja la apuesta pendiente.
- **Respuesta:** `{ status: 'ok', message: 'Apuesta creada y saldo bloqueado.' }`

### b) Registrar resultado de carrera
- **POST /race/result**
- **Body:** `{ userId, rivalId, tiempo, gano, posicion }`
- **Función:**
  - Transfiere los tokens apostados al ganador
  - Marca la apuesta como resuelta
  - Guarda el resultado de la carrera (tiempo y posición)
- **Respuesta:** `{ status: 'ok', message: 'Resultado procesado, tokens transferidos al ganador y resultado guardado.', winnerId }`

---

## 2. Nuevas tablas de base de datos

### a) Tabla `bets`
```sql
CREATE TABLE bets (
  id SERIAL PRIMARY KEY,
  user1_id INTEGER NOT NULL,
  user2_id INTEGER NOT NULL,
  amount DECIMAL(20,8) NOT NULL,
  status VARCHAR(20) DEFAULT 'pendiente',
  winner_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```
- Guarda la información de cada apuesta entre dos usuarios.

### b) Tabla `race_results`
```sql
CREATE TABLE race_results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  rival_id INTEGER NOT NULL,
  tiempo DECIMAL(10,3) NOT NULL,
  posicion INTEGER NOT NULL,
  bet_id INTEGER REFERENCES bets(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```
- Guarda el resultado individual de cada usuario en una carrera (tiempo, posición, rival, referencia a la apuesta).

---

## 3. Nuevos controllers

### a) `betController.js`
- Lógica para crear una apuesta, verificar saldo y bloquear tokens.
- Se usa en el endpoint `/bet/create`.

### b) `raceController.js`
- Lógica para procesar el resultado de la carrera, transferir tokens al ganador, marcar la apuesta como resuelta y guardar el resultado.
- Se usa en el endpoint `/race/result`.

---

## 4. Acoplamiento con el backend y Unity

- Los endpoints están protegidos con autenticación JWT.
- Las rutas están conectadas en `server/src/routes/race.js` y añadidas en el `index.js` principal.
- Unity puede llamar a estos endpoints usando los scripts de ejemplo del README de integración.
- El flujo es:
  1. Ambos jugadores apuestan antes de la carrera (`/bet/create`).
  2. Al terminar la carrera, cada jugador envía su resultado (`/race/result`).
  3. El backend transfiere los tokens al ganador y guarda los resultados.

---

## 5. Ejemplo de uso desde Unity

```csharp
// Crear apuesta
StartCoroutine(EnviarApuesta(userId, rivalId, cantidad, onSuccess, onError));

// Enviar resultado de carrera
StartCoroutine(EnviarResultado(userId, rivalId, tiempo, gano, posicion, onSuccess, onError));
```

---

## 6. Resumen
- Ahora puedes gestionar apuestas, resultados y economía de carreras entre usuarios.
- Todo queda registrado en la base de datos y es accesible para ranking, historial, etc.
- El backend y Unity están completamente acoplados para este flujo competitivo.

---

## 7. Sistema de Wallets y Tokens RCF

### a) Creación de Wallet Principal
- **POST /api/wallet/create**
- **Función:** 
  - Crea la wallet principal del usuario en Solana
  - Otorga 10 tokens RCF de bienvenida
  - Guarda la publicKey en el perfil del usuario
- **Respuesta:**
```json
{
  "user": {
    "id": 1,
    "username": "player123",
    "publicKey": "DRtXkjh8HvzFxmXeTgbxwjvKXmNZQhwkqn9bv79VAwaE"
  },
  "wallet": {
    "address": "DRtXkjh8HvzFxmXeTgbxwjvKXmNZQhwkqn9bv79VAwaE",
    "balance": "10"
  }
}
```

### b) Creación de Cuenta de Token RCF
- **POST /api/wallet/token/account**
- **Body:** `{ "publicKey": "tu_public_key" }`
- **Función:**
  - Crea una cuenta específica para tokens RCF (Associated Token Account)
  - Necesaria para manejar los tokens RCF en Solana
  - Muestra el balance actual de tokens
- **Respuesta:**
```json
{
  "tokenAccount": "SrXyoRWKxQ8UH4uzbhhM1WNZXmMdFo81jpVgS4TPmhD",
  "balance": "10"
}
```

### c) Flujo del Sistema de Tokens
1. Al registrarse, el usuario no tiene wallet
2. Debe crear su wallet principal (POST /api/wallet/create)
3. Luego crear su cuenta de token RCF (POST /api/wallet/token/account)
4. Ahora puede:
   - Participar en apuestas
   - Recibir premios
   - Transferir tokens
   - Ver su balance

### d) Diferencias entre Wallet y Token Account
- **Wallet Principal:**
  - Es la cuenta base en Solana
  - Puede manejar SOL y crear otras cuentas
  - Se crea una vez por usuario
  - Recibe los tokens de bienvenida

- **Token Account:**
  - Es específica para tokens RCF
  - Necesaria para operaciones con RCF
  - Vinculada a la wallet principal
  - Muestra el balance de RCF

---

## 8. Sistema de Market Overview

### a) Endpoint de Resumen del Mercado
- **GET /api/dashboard/market-overview**
- **Autenticación:** JWT requerido (x-auth-token)
- **Función:**
  - Proporciona una vista general del mercado de autos
  - Muestra estadísticas de ventas y popularidad
  - Lista transacciones recientes
- **Respuesta:**
```json
{
  "totalCars": 0,
  "popularCars": [
    {
      "carId": 1,
      "ownerCount": 5,
      "Car": {
        "name": "Dodge Charger",
        "price": 85000,
        "category": "Muscle",
        "specs": {
          "power": 717,
          "acceleration": 3.6,
          "top_speed": 326,
          "weight": 2000
        }
      }
    }
  ],
  "recentTransactions": [
    {
      "id": 1,
      "type": "sell",
      "price": 100000,
      "currency": "RCF",
      "carName": "Dodge Charger",
      "category": "Muscle",
      "seller": "player123",
      "timestamp": "2024-05-21T15:30:00Z"
    }
  ],
  "marketStats": {
    "totalVolume": "0",
    "avgPrice": "0",
    "activeListings": 0,
    "last24hTransactions": 0
  }
}
```

### b) Componentes del Market Overview

1. **Total de Autos (`totalCars`)**
   - Cantidad total de autos disponibles en el sistema
   - Incluye todos los modelos registrados

2. **Autos Populares (`popularCars`)**
   - Lista de los 5 autos más poseídos
   - Muestra cantidad de propietarios por modelo
   - Incluye detalles completos del auto

3. **Transacciones Recientes (`recentTransactions`)**
   - Últimas 5 transacciones completadas
   - Detalles de compra/venta
   - Información del vendedor y auto

4. **Estadísticas del Mercado (`marketStats`)**
   - Volumen total de transacciones
   - Precio promedio de ventas
   - Cantidad de listados activos
   - Transacciones en las últimas 24 horas

### c) Uso en el Frontend

```javascript
// Ejemplo de llamada al endpoint
const getMarketOverview = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/dashboard/market-overview', {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': 'tu_token_jwt'
      }
    });
    const data = await response.json();
    // Procesar datos del mercado
  } catch (error) {
    console.error('Error al obtener resumen del mercado:', error);
  }
};
```

### d) Tablas Relacionadas

1. **Cars**
   - Información base de los modelos de autos
   - Precios y especificaciones

2. **UserCars**
   - Registro de propiedad de autos
   - Relación usuario-auto

3. **CarMarketTransaction**
   - Historial de transacciones
   - Estado de ventas y compras

---
