# Racing F1 Backend

Backend server for Racing F1 game with Solana integration.

## Características principales

- Autenticación y autorización de usuarios
- Gestión de wallets de Solana
- Sistema de pagos y transacciones
- Intercambio de tokens y NFTs simulados
- Integración con Solana Testnet
- Gestión de metadatos de tokens
- Configuración y administración de tokens

## Estructura del Proyecto

- **Controladores:**
  - `walletController.js`: Gestión de wallets (crear, listar, consultar balances).
  - `exchangeController.js`: Transferencias de tokens SPL y NFTs simulados entre usuarios.
  - `marketplaceController.js`: Lógica de tienda para listar, comprar y vender autos (NFTs simulados).
  - `paymentController.js`: Pagos en SOL entre usuarios.
  - `transactionsController.js`: Historial de transacciones.
  - `billingController.js`, `dashboardController.js`: Facturación y estadísticas.

- **Rutas REST:**
  - `/wallet`: Endpoints para crear y consultar wallets y balances.
  - `/exchange`: Endpoints para transferir tokens y NFTs simulados.
  - `/marketplace`: Endpoints para listar, comprar y vender autos (NFTs simulados).
  - `/transactions`: Historial de transacciones.
  - `/payment`, `/billing`, `/dashboard`: Otros servicios.

- **.env:**
  - Configuración de base de datos, Solana testnet, claves, y servicios externos como NFT.Storage y CoinGecko.

## Endpoints principales

### Wallets
- `POST /wallet/create` — Crea una wallet de Solana para un usuario.
- `GET /wallet/list` — Lista todas las wallets.
- `GET /wallet/:address/sol` — Consulta el balance de SOL.
- `GET /wallet/:address/token/:mint` — Consulta el balance de un token SPL.

### Marketplace (NFTs simulados)
- `GET /marketplace/listings` — Lista todos los autos (NFTs) en venta.
- `POST /marketplace/buy` — Comprar un auto (NFT) de la tienda.
- `POST /marketplace/sell` — Vender un auto (NFT), listarlo en la tienda.

### Exchange y transferencias
- `POST /exchange/token` — Transfiere tokens SPL entre usuarios.
- `POST /exchange/nft` — Transfiere un NFT simulado entre usuarios.

### Transacciones
- `GET /transactions/history/:userId` — Historial de transacciones de un usuario.

### Otros servicios
- `/payment`: Pagos en SOL entre usuarios.
- `/billing`: Facturación, tarjetas, facturas, historial de balance y notificaciones.
- `/dashboard`: Estadísticas y leaderboard.

## ¿Cómo funciona la simulación de NFTs?

- Cada "NFT" es un auto (car) con imagen, nombre y propietario, guardado en la base de datos.
- Las compras, ventas y transferencias de NFTs se hacen transfiriendo tokens SPL entre usuarios y cambiando el propietario en la base de datos.
- Todo ocurre en testnet de Solana, usando wallets y tokens SPL reales, pero los NFTs no existen en la blockchain, solo en la base de datos.

## Estado de la implementación

- ✅ Endpoints y controladores creados y acoplados correctamente.
- ✅ Configuración de base de datos, Solana testnet, tokens SPL, NFT.Storage, CoinGecko y autenticación JWT en `.env`.
- ✅ Middleware de autenticación protegiendo rutas sensibles.
- ❌ Falta implementar la lógica real de compra/venta de autos (NFTs simulados) en `marketplaceController.js`:
  - Transferencia de tokens SPL y actualización del propietario en la base de datos.
  - Validación de saldo antes de comprar.
  - Mejorar el manejo de errores (saldo insuficiente, auto no disponible, etc).

## Ejemplo de flujo

1. El usuario crea una wallet (`/wallet/create`).
2. Consulta su balance de SOL y tokens SPL (`/wallet/:address/sol`, `/wallet/:address/token/:mint`).
3. Ve la tienda de autos (NFTs) (`/marketplace/listings`).
4. Compra un auto (`/marketplace/buy`): el backend transfiere tokens SPL y actualiza el propietario.
5. Puede transferir el auto a otro usuario (`/exchange/nft`).

## Seguridad

- Contraseñas hasheadas con bcrypt
- Claves privadas cifradas
- Autenticación JWT para endpoints
- HTTPS en producción
- Variables de entorno para datos sensibles

## Licencia

Este proyecto está licenciado bajo MIT License - ver el archivo LICENSE para más detalles.

---

**Puedes extender este README con ejemplos de peticiones/respuestas JSON y detalles de implementación según lo necesites.**

# Racing Game API Documentation

## Configuración del Frontend

### 1. Configuración Base
```javascript
// config.js
const API_BASE_URL = 'http://localhost:8080';

// Función helper para llamadas a la API
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

### 2. Servicios de la API

#### Autenticación
```javascript
// services/authService.js
export const authService = {
  // Registro de usuario
  register: async (userData) => {
    const response = await apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        fechaNacimiento: userData.fechaNacimiento
      })
    });
    localStorage.setItem('token', response.token);
    return response;
  },

  // Login
  login: async (credentials) => {
    const response = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      })
    });
    localStorage.setItem('token', response.token);
    return response;
  }
};
```

#### Wallet
```javascript
// services/walletService.js
export const walletService = {
  // Crear wallet
  create: async () => {
    return await apiCall('/api/wallet/create', {
      method: 'POST'
    });
  },

  // Obtener balance
  getBalance: async (publicKey) => {
    return await apiCall(`/api/wallet/token/balance/${publicKey}`);
  },

  // Transferir tokens
  transfer: async (transferData) => {
    return await apiCall('/api/wallet/token/transfer', {
      method: 'POST',
      body: JSON.stringify({
        fromPublicKey: transferData.fromPublicKey,
        toPublicKey: transferData.toPublicKey,
        amount: transferData.amount
      })
    });
  }
};
```

#### Carreras y Apuestas
```javascript
// services/raceService.js
export const raceService = {
  // Crear apuesta
  createBet: async (betData) => {
    return await apiCall('/bet/create', {
      method: 'POST',
      body: JSON.stringify({
        raceId: betData.raceId,
        amount: betData.amount,
        carId: betData.carId,
        position: betData.position
      })
    });
  },

  // Enviar resultado de carrera
  submitResult: async (raceData) => {
    return await apiCall('/race/result', {
      method: 'POST',
      body: JSON.stringify({
        raceId: raceData.raceId,
        results: raceData.results
      })
    });
  }
};
```

#### Marketplace
```javascript
// services/marketplaceService.js
export const marketplaceService = {
  // Obtener listados
  getListings: async () => {
    return await apiCall('/api/marketplace/listings');
  },

  // Vender carro
  sellCar: async (carData) => {
    return await apiCall('/api/marketplace/sell', {
      method: 'POST',
      body: JSON.stringify({
        carId: carData.carId,
        price: carData.price
      })
    });
  }
};
```

### 3. Ejemplos de Uso en Componentes React

#### Registro de Usuario
```jsx
// components/Register.js
import { useState } from 'react';
import { authService } from '../services/authService';

export const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fechaNacimiento: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.register(formData);
      console.log('Usuario registrado:', response);
      // Redirigir al dashboard o página principal
    } catch (error) {
      console.error('Error en registro:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
    </form>
  );
};
```

#### Wallet Creation
```jsx
// components/CreateWallet.js
import { useState } from 'react';
import { walletService } from '../services/walletService';

export const CreateWallet = () => {
  const [wallet, setWallet] = useState(null);

  const handleCreateWallet = async () => {
    try {
      const response = await walletService.create();
      setWallet(response.wallet);
      console.log('Wallet creada:', response);
    } catch (error) {
      console.error('Error creando wallet:', error);
    }
  };

  return (
    <div>
      <button onClick={handleCreateWallet}>Crear Wallet</button>
      {wallet && (
        <div>
          <p>Public Key: {wallet.address}</p>
          <p>Balance: {wallet.balance}</p>
        </div>
      )}
    </div>
  );
};
```

### 4. Manejo de Errores
```javascript
// utils/errorHandler.js
export const handleApiError = (error) => {
  if (error.response) {
    // Error de respuesta del servidor
    switch (error.response.status) {
      case 401:
        // No autorizado - redirigir a login
        localStorage.removeItem('token');
        window.location.href = '/login';
        break;
      case 403:
        // Prohibido
        console.error('No tienes permisos para esta acción');
        break;
      default:
        console.error('Error del servidor:', error.response.data);
    }
  } else if (error.request) {
    // Error de red
    console.error('Error de red:', error.request);
  } else {
    // Otros errores
    console.error('Error:', error.message);
  }
};
```

## Notas Importantes

### Seguridad
- Siempre maneja el token JWT de forma segura
- No almacenes información sensible en el localStorage
- Implementa interceptores para renovar tokens expirados
- Valida todas las entradas del usuario antes de enviarlas al servidor

### Manejo de Datos
- Los montos de tokens deben manejarse como strings para evitar problemas de precisión
- Las fechas deben enviarse en formato ISO 8601
- Las public keys deben ser válidas en formato Solana base58

### Optimización
- Implementa caching para datos frecuentemente usados
- Usa debounce para llamadas a la API en búsquedas o filtros
- Implementa manejo de estado global (Redux, Context) para datos compartidos

### Testing
```javascript
// Ejemplo de test para el servicio de autenticación
import { authService } from '../services/authService';

describe('Auth Service', () => {
  test('login should store token in localStorage', async () => {
    const mockResponse = { token: 'test-token', user: { id: 1 } };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })
    );

    await authService.login({ email: 'test@test.com', password: 'password' });
    expect(localStorage.getItem('token')).toBe('test-token');
  });
});
``` 