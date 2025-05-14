# Documentación de Integración de Wallet

## Configuración Inicial
```javascript
const API_BASE_URL = 'http://localhost:8080';

// Helper para llamadas a la API
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

## Endpoints Implementados y Probados

### 1. Crear Wallet
```javascript
// Endpoint: POST /api/wallet/create
// Descripción: Crea una nueva wallet para el usuario autenticado

const createWallet = async () => {
  try {
    const response = await apiCall('/api/wallet/create', {
      method: 'POST'
    });
    
    // Respuesta exitosa:
    // {
    //   "user": {
    //     "id": 7,
    //     "username": "newuser",
    //     "email": "newuser@example.com",
    //     "publicKey": "HqQ4qBCPChH2S1NBJbqFaHwaUxwzGCmKAxQWHMMnH2Hn",
    //     "fechaNacimiento": "1989-12-31T23:00:00.000Z",
    //     "createdAt": "2025-05-13T23:45:31.935Z",
    //     "updatedAt": "2025-05-14T00:18:20.644Z"
    //   }
    // }
    
    return response;
  } catch (error) {
    console.error('Error creando wallet:', error);
    throw error;
  }
};
```

### 2. Verificar Balance SOL
```javascript
// Endpoint: GET /api/wallet/sol/{address}
// Descripción: Obtiene el balance de SOL de una wallet

const getSolBalance = async (address) => {
  try {
    const response = await apiCall(`/api/wallet/sol/${address}`);
    
    // Respuesta exitosa:
    // {
    //   "address": "HqQ4qBCPChH2S1NBJbqFaHwaUxwzGCmKAxQWHMMnH2Hn",
    //   "sol": 1.0
    // }
    
    return response;
  } catch (error) {
    console.error('Error obteniendo balance SOL:', error);
    throw error;
  }
};
```

### 3. Verificar Balance de Tokens
```javascript
// Endpoint: GET /api/wallet/token/balance/{publicKey}
// Descripción: Obtiene el balance de tokens RCF de una wallet

const getTokenBalance = async (publicKey) => {
  try {
    const response = await apiCall(`/api/wallet/token/balance/${publicKey}`);
    
    // Respuesta exitosa:
    // {
    //   "balance": 0.0
    // }
    
    return response;
  } catch (error) {
    console.error('Error obteniendo balance de tokens:', error);
    throw error;
  }
};
```

### 4. Transferir Tokens
```javascript
// Endpoint: POST /api/wallet/token/transfer
// Descripción: Transfiere tokens entre wallets

const transferTokens = async (fromPublicKey, toPublicKey, amount) => {
  try {
    const response = await apiCall('/api/wallet/token/transfer', {
      method: 'POST',
      body: JSON.stringify({
        fromPublicKey,
        toPublicKey,
        amount
      })
    });
    
    // Respuesta exitosa:
    // {
    //   "signature": "5KKPGHxYmHB9..."
    // }
    
    return response;
  } catch (error) {
    console.error('Error transfiriendo tokens:', error);
    throw error;
  }
};
```

## Requisitos para Transferencias

### Requisitos de SOL
1. La wallet debe tener un mínimo de SOL para pagar las fees de transacción
2. Para obtener SOL en testnet, puedes usar:
   - Faucet oficial de Solana (tiene cooldown de 8 horas): https://faucet.solana.com/
   - Faucets alternativos:
     - https://solfaucet.com/
     - https://faucet.quicknode.com/solana/devnet

### Requisitos de Tokens
1. La wallet origen debe tener suficientes tokens para la transferencia
2. Tanto la wallet origen como destino deben tener una cuenta de token asociada
3. La cantidad a transferir debe ser mayor que 0

### Códigos de Error
- `INSUFFICIENT_FUNDS`: No hay suficientes tokens o SOL para la transacción
- `TRANSACTION_ERROR`: Error general en la transacción
- `INVALID_WALLET`: Dirección de wallet inválida

## Ejemplo de Uso en React

```jsx
import { useState, useEffect } from 'react';

export const WalletDashboard = () => {
  const [wallet, setWallet] = useState(null);
  const [solBalance, setSolBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);

  // Crear wallet
  const handleCreateWallet = async () => {
    try {
      const response = await createWallet();
      setWallet(response.user);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Obtener balances
  const fetchBalances = async () => {
    if (wallet?.publicKey) {
      try {
        const [solResponse, tokenResponse] = await Promise.all([
          getSolBalance(wallet.publicKey),
          getTokenBalance(wallet.publicKey)
        ]);
        
        setSolBalance(solResponse.sol);
        setTokenBalance(tokenResponse.balance);
      } catch (error) {
        console.error('Error obteniendo balances:', error);
      }
    }
  };

  // Transferir tokens
  const handleTransfer = async (toPublicKey, amount) => {
    try {
      await transferTokens(wallet.publicKey, toPublicKey, amount);
      await fetchBalances(); // Actualizar balances después de la transferencia
    } catch (error) {
      console.error('Error en transferencia:', error);
    }
  };

  useEffect(() => {
    if (wallet) {
      fetchBalances();
    }
  }, [wallet]);

  return (
    <div>
      {!wallet ? (
        <button onClick={handleCreateWallet}>Crear Wallet</button>
      ) : (
        <div>
          <h3>Tu Wallet</h3>
          <p>Public Key: {wallet.publicKey}</p>
          <p>Balance SOL: {solBalance}</p>
          <p>Balance Tokens: {tokenBalance}</p>
          <button onClick={fetchBalances}>Actualizar Balances</button>
          
          {/* Formulario de transferencia */}
          <form onSubmit={(e) => {
            e.preventDefault();
            const toPublicKey = e.target.toPublicKey.value;
            const amount = parseFloat(e.target.amount.value);
            handleTransfer(toPublicKey, amount);
          }}>
            <input name="toPublicKey" placeholder="Wallet destino" />
            <input name="amount" type="number" step="0.000000001" placeholder="Cantidad" />
            <button type="submit">Transferir</button>
          </form>
        </div>
      )}
    </div>
  );
};
```