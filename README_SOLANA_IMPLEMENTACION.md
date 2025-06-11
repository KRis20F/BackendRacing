# Implementación Solana de NFT y Transacciones (Simulación)

## Español

### 1. Concepto General

- Los "NFTs" son simulados: cada uno es una imagen (URL), un nombre, un precio en tokens SPL y un propietario (usuario).
- Las transacciones de compra, venta y transferencia de "NFTs" se realizan transfiriendo tokens SPL entre usuarios y actualizando el propietario en la base de datos.
- Todo funciona en testnet de Solana usando wallets y tokens SPL reales, pero los NFTs no existen en la blockchain, solo en la base de datos.

### 2. Endpoints REST

#### Wallets

- `POST /wallet/create` — Crea una nueva wallet de Solana para un usuario.
- `GET /wallet/list` — Lista todas las wallets registradas.
- `GET /wallet/:address/sol` — Muestra el balance de SOL de una wallet.
- `GET /wallet/:address/token/:mint` — Muestra el balance de un token SPL en una wallet.

#### Transacciones de Token SPL

- `POST /token/transfer` — Transfiere tokens SPL entre usuarios.
  - **Body:** `{ fromUserId, toUserId, mint, amount }`

#### NFTs Simulados

- `GET /nfts` — Lista todos los "NFTs" disponibles en la tienda.
- `GET /nfts/:userId` — Lista los "NFTs" de un usuario.
- `POST /nft/buy` — Comprar un "NFT" de la tienda.
  - **Body:** `{ userId, nftId }`
- `POST /nft/transfer` — Transferir un "NFT" a otro usuario.
  - **Body:** `{ fromUserId, toUserId, nftId }`

#### Historial de transacciones y apuestas
- `GET /transactions/history/:userId` — Devuelve el historial de transacciones de un usuario, incluyendo:
  - Compras y ventas de autos (NFTs simulados)
  - Transferencias de tokens SPL
  - Apuestas ganadas/perdidas

  **Ejemplo de respuesta:**
  ```json
  {
    "history": [
      {
        "type": "token_exchange",
        "id": 12,
        "from_addr": "...",
        "to_addr": "...",
        "amount": "100.00",
        "signature": "...",
        "created_at": "2024-05-11T10:00:00.000Z",
        "from_username": "juan",
        "to_username": "ana"
      },
      {
        "type": "token_exchange",
        "id": 13,
        "from_addr": "...",
        "to_addr": "...",
        "amount": "50.00",
        "signature": "...",
        "created_at": "2024-05-11T11:00:00.000Z",
        "from_username": "ana",
        "to_username": "juan"
      }
    ]
  }
  ```
  Este endpoint permite a los usuarios ver todas sus apuestas, compras, ventas y transferencias de tokens realizadas en la plataforma.

### 3. Ejemplo de flujo

1. El usuario crea una wallet (`/wallet/create`).
2. Consulta su balance de SOL y tokens SPL (`/wallet/:address/sol`, `/wallet/:address/token/:mint`).
3. Ve la tienda de "NFTs" (`/nfts`).
4. Compra un "NFT" (`/nft/buy`): el backend transfiere tokens SPL y actualiza el propietario.
5. Puede transferir el "NFT" a otro usuario (`/nft/transfer`).

### 4. Ventajas

- No necesitas mint ni metadatos reales en Solana.
- Todo es rápido, barato y fácil de migrar a NFTs reales en el futuro.

---

**Puedes extender este README con ejemplos de JSON, respuestas y detalles de implementación según lo necesites.**
