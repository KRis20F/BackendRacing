# Racing Game API Documentation

This document provides a comprehensive list of all available API endpoints in the Racing Game backend.

## Authentication
All endpoints marked with 🔒 require authentication via JWT token in the `x-auth-token` header.

### Auth Endpoints
- `POST /api/auth/register`
  - Register a new user
  - Request Body: 
    ```json
    {
      "username": "player123",
      "email": "player@example.com",
      "password": "securepass123",
      "fechaNacimiento": "1995-12-25"
    }
    ```
  - Response:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "user": {
        "id": 1,
        "username": "player123",
        "email": "player@example.com",
        "publicKey": null,
        "fechaNacimiento": "1995-12-25"
      }
    }
    ```

- `POST /api/auth/login`
  - Login user
  - Request Body:
    ```json
    {
      "email": "player@example.com",
      "password": "securepass123"
    }
    ```
  - Response:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "user": {
        "id": 1,
        "username": "player123",
        "email": "player@example.com",
        "publicKey": "DRtXkjh8HvzFxmXeTgbxwjvKXmNZQhwkqn9bv79VAwaE"
      }
    }
    ```

### Wallet Endpoints
All under `/api/wallet`

- 🔒 `POST /create`
  - Create a new Solana wallet for user
  - Response:
    ```json
    {
      "user": {
        "id": 1,
        "username": "player123",
        "publicKey": "DRtXkjh8HvzFxmXeTgbxwjvKXmNZQhwkqn9bv79VAwaE"
      },
      "wallet": {
        "address": "DRtXkjh8HvzFxmXeTgbxwjvKXmNZQhwkqn9bv79VAwaE",
        "balance": "0"
      }
    }
    ```

- 🔒 `POST /token/account`
  - Create a token account
  - Request Body:
    ```json
    {
      "publicKey": "DRtXkjh8HvzFxmXeTgbxwjvKXmNZQhwkqn9bv79VAwaE"
    }
    ```
  - Response:
    ```json
    {
      "tokenAccount": "67WdH5BwmTAdrUGrpESZh6nxF9dGT3f9YdF9eL1RrQwX",
      "balance": "0"
    }
    ```

- 🔒 `POST /token/transfer`
  - Transfer tokens between wallets
  - Request Body:
    ```json
    {
      "fromPublicKey": "DRtXkjh8HvzFxmXeTgbxwjvKXmNZQhwkqn9bv79VAwaE",
      "toPublicKey": "7WdH5BwmTAdrUGrpESZh6nxF9dGT3f9YdF9eL1RrQwX",
      "amount": "1000000000"
    }
    ```
  - Response:
    ```json
    {
      "signature": "5rYn4PpzH7HkmeY3aPvtgcbhJqbqGKhFZSewHV5QnrJWAxn4ZzgAe1LnXdzPYaZ3gHZNhzJoqrNgCMkF6yPgJqtH",
      "fromBalance": "9000000000",
      "toBalance": "1000000000"
    }
    ```

- 🔒 `GET /token/balance/:publicKey`
  - Get token balance for a wallet
  - Response:
    ```json
    {
      "publicKey": "DRtXkjh8HvzFxmXeTgbxwjvKXmNZQhwkqn9bv79VAwaE",
      "balance": "10000000000",
      "tokenSymbol": "RACE"
    }
    ```

### Billing Endpoints
All under `/api/billing`

- 🔒 `GET /transactions`
  - Get user's transaction history
  - Response:
    ```json
    {
      "transactions": [
        {
          "id": 1,
          "type": "DEPOSIT",
          "amount": "1000000000",
          "timestamp": "2024-03-13T15:30:00Z",
          "status": "COMPLETED"
        },
        {
          "id": 2,
          "type": "BET",
          "amount": "500000000",
          "timestamp": "2024-03-13T16:00:00Z",
          "status": "COMPLETED"
        }
      ]
    }
    ```

- 🔒 `GET /balance-history`
  - Get user's balance history
  - Response:
    ```json
    {
      "currentBalance": "1500000000",
      "history": [
        {
          "timestamp": "2024-03-13T15:30:00Z",
          "balance": "1000000000",
          "change": "+1000000000",
          "reason": "Deposit"
        },
        {
          "timestamp": "2024-03-13T16:00:00Z",
          "balance": "1500000000",
          "change": "+500000000",
          "reason": "Race won"
        }
      ]
    }
    ```

### Race Endpoints
All under root `/`

- 🔒 `POST /bet/create`
  - Create a new bet for a race
  - Request Body:
    ```json
    {
      "raceId": 123,
      "amount": "500000000",
      "carId": 456,
      "position": 1
    }
    ```
  - Response:
    ```json
    {
      "betId": 789,
      "raceId": 123,
      "amount": "500000000",
      "potentialWinnings": "950000000",
      "timestamp": "2024-03-13T16:00:00Z"
    }
    ```

- 🔒 `POST /race/result`
  - Submit race results
  - Request Body:
    ```json
    {
      "raceId": 123,
      "results": [
        {
          "position": 1,
          "carId": 456,
          "time": "1:23.456"
        },
        {
          "position": 2,
          "carId": 789,
          "time": "1:24.567"
        }
      ]
    }
    ```
  - Response:
    ```json
    {
      "raceId": 123,
      "status": "COMPLETED",
      "winners": [
        {
          "position": 1,
          "carId": 456,
          "prize": "950000000"
        }
      ],
      "timestamp": "2024-03-13T16:05:00Z"
    }
    ```

### Dashboard Endpoints
All under `/api/dashboard`

- 🔒 `GET /leaderboard`
  - Get racing leaderboard
  - Response:
    ```json
    {
      "leaderboard": [
        {
          "rank": 1,
          "username": "player123",
          "wins": 10,
          "earnings": "15000000000"
        },
        {
          "rank": 2,
          "username": "racer456",
          "wins": 8,
          "earnings": "12000000000"
        }
      ]
    }
    ```

- `GET /token/price-history`
  - Get token price history
  - Response:
    ```json
    {
      "currentPrice": "0.1",
      "history": [
        {
          "timestamp": "2024-03-13T00:00:00Z",
          "price": "0.095"
        },
        {
          "timestamp": "2024-03-14T00:00:00Z",
          "price": "0.1"
        }
      ]
    }
    ```

### Marketplace Endpoints
All under `/api/marketplace`

- `GET /listings`
  - Get all cars listed for sale
  - Response:
    ```json
    {
      "listings": [
        {
          "id": 1,
          "carId": 456,
          "name": "Speed Demon",
          "price": "5000000000",
          "seller": "player123",
          "stats": {
            "speed": 95,
            "handling": 88,
            "acceleration": 92
          }
        }
      ]
    }
    ```

- 🔒 `POST /sell`
  - List a car for sale
  - Request Body:
    ```json
    {
      "carId": 456,
      "price": "5000000000"
    }
    ```
  - Response:
    ```json
    {
      "listingId": 1,
      "carId": 456,
      "price": "5000000000",
      "status": "LISTED",
      "timestamp": "2024-03-14T10:00:00Z"
    }
    ```

### Exchange Endpoints
All under `/api/exchange`

- 🔒 `POST /token`
  - Exchange tokens
  - Request Body:
    ```json
    {
      "amount": "1000000000",
      "type": "BUY",
      "paymentMethod": "USDC"
    }
    ```
  - Response:
    ```json
    {
      "transactionId": "tx123",
      "amount": "1000000000",
      "type": "BUY",
      "rate": "0.1",
      "total": "100",
      "status": "COMPLETED"
    }
    ```

### Transaction History
All under `/api/transactions`

- 🔒 `GET /history/:userId`
  - Get transaction history for specific user
  - Response:
    ```json
    {
      "transactions": [
        {
          "id": "tx123",
          "type": "TOKEN_PURCHASE",
          "amount": "1000000000",
          "timestamp": "2024-03-14T10:00:00Z",
          "details": {
            "rate": "0.1",
            "total": "100",
            "paymentMethod": "USDC"
          }
        }
      ]
    }
    ```

### Payment Endpoints
All under `/api/payment`

- 🔒 `POST /send`
  - Send a payment
  - Request Body:
    ```json
    {
      "amount": "1000000000",
      "recipient": "DRtXkjh8HvzFxmXeTgbxwjvKXmNZQhwkqn9bv79VAwaE",
      "currency": "RACE"
    }
    ```
  - Response:
    ```json
    {
      "paymentId": "pay123",
      "status": "COMPLETED",
      "amount": "1000000000",
      "timestamp": "2024-03-14T10:30:00Z",
      "signature": "5rYn4PpzH7HkmeY3aPvtgcbhJqbqGKhFZSewHV5QnrJWAxn4ZzgAe1LnXdzPYaZ3gHZNhzJoqrNgCMkF6yPgJqtH"
    }
    ```

## Response Formats

### Success Response
```json
{
  "status": "success",
  "data": {
    // Response data as shown in examples above
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

## Authentication
To authenticate requests, include the JWT token in the `x-auth-token` header:
```
x-auth-token: eyJhbGciOiJIUzI1NiIs...
```

## Notes
- All requests and responses are in JSON format
- Dates are in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
- Token amounts are in the smallest unit (1 RACE = 1000000000 units)
- Public keys are in Solana base58 format
- All authenticated endpoints (🔒) require a valid JWT token
- Currency amounts for tokens use string type to handle large numbers
- All timestamps are in UTC 