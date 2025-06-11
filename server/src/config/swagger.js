const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Racing F1 API',
      version: '1.0.0',
      description: `
# Racing F1 Game Backend

## Sistema de Tokens

El juego utiliza dos tipos diferentes de tokens:

### 1. JWT Token (JSON Web Token)
- **¿Qué es?** Tu identificación digital en el juego
- **¿Cómo lo obtienes?** Al hacer login
- **¿Dónde se usa?** En el header \`x-auth-token\` de las peticiones
- **Formato:** \`eyJhbGciOiJIUzI1NiIs...\`
- **Duración:** 7 días

Ejemplo de uso:
\`\`\`http
POST /api/wallet/create
x-auth-token: eyJhbGciOiJIUzI1NiIs...
\`\`\`

### 2. RCF Token (Racing Crypto Fuel)
- **¿Qué es?** La moneda virtual del juego en Solana
- **¿Cómo lo obtienes?** 
  - 10 RCF gratis al crear tu wallet
  - Ganando carreras
  - Recibiendo transferencias
- **¿Para qué sirve?**
  - Comprar coches NFT
  - Apostar en carreras
  - Transferir a otros jugadores
  - Mejorar vehículos

## Flujo de Uso de Tokens

1. **Registro y Login**
\`\`\`http
POST /api/auth/login
Content-Type: application/json

{
  "email": "player@example.com",
  "password": "securepass123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs..."  // Tu JWT Token
}
\`\`\`

2. **Crear Wallet y Recibir RCF**
\`\`\`http
POST /api/wallet/create
x-auth-token: eyJhbGciOiJIUzI1NiIs...

Response:
{
  "user": {
    "publicKey": "DdvqTLXYzqftm25ogNHZhn4KuDee36Jx1PcwGUZfa5dc",
    ...
  },
  "welcomeBonus": {
    "amount": 10,                // Recibes 10 RCF
    "tokenAccount": "SrXyoRWK..." // Tu cuenta de RCF
  }
}
\`\`\`

3. **Transferir RCF**
\`\`\`http
POST /api/wallet/token/transfer
x-auth-token: eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "fromPublicKey": "TuPublicKey",
  "toPublicKey": "OtraPublicKey",
  "amount": "5"
}

Response:
{
  "signature": "34CcmCckCtiM...",  // Firma de la transacción
  "fromBalance": "5",              // Tu balance después
  "toBalance": "15"               // Balance del destinatario
}
\`\`\`

4. **Consultar Balance RCF**
\`\`\`http
GET /api/wallet/token/balance/DdvqTLXYzqftm25ogNHZhn4KuDee36Jx1PcwGUZfa5dc
x-auth-token: eyJhbGciOiJIUzI1NiIs...

Response:
{
  "publicKey": "DdvqTLXYzqftm25ogNHZhn4KuDee36Jx1PcwGUZfa5dc",
  "balance": "10.00000000"
}
\`\`\`

## Notas Importantes
- El JWT Token es necesario para todas las operaciones autenticadas
- Los RCF Tokens se manejan en la blockchain de Solana
- Las transacciones de RCF son irreversibles
- Guarda tu publicKey de forma segura
- Las cantidades de RCF usan 8 decimales

## Seguridad
- No compartas tu JWT Token
- No compartas tus claves privadas de Solana
- Verifica siempre las direcciones antes de transferir
- Las transacciones pueden tomar unos segundos en confirmarse

## Descripción General
Este es el backend para el juego de carreras F1 con integración de blockchain Solana.

## Guía de Creación de Wallet
Para empezar a usar la funcionalidad blockchain del juego, necesitas crear una wallet. Sigue estos pasos:

### 1. Registro de Usuario
\`\`\`http
POST /api/auth/register
Content-Type: application/json

{
  "username": "player123",
  "email": "player@example.com",
  "password": "securepass123",
  "fechaNacimiento": "1995-12-25"
}
\`\`\`

### 2. Login
\`\`\`http
POST /api/auth/login
Content-Type: application/json

{
  "email": "player@example.com",
  "password": "securepass123"
}
\`\`\`
Guarda el token JWT que recibes en la respuesta.

### 3. Crear Wallet
\`\`\`http
POST /api/wallet/create
x-auth-token: <tu-token-jwt>
\`\`\`

Este proceso:
- Genera un nuevo par de claves Solana
- Crea tu wallet
- Configura tu cuenta de token RCF
- Te envía 10 RCF tokens de bienvenida

### Respuesta de Creación de Wallet
\`\`\`json
{
  "user": {
    "id": 1,
    "username": "player123",
    "email": "player@example.com",
    "publicKey": "DRtXkjh8HvzFxmXeTgbxwjvKXmNZQhwkqn9bv79VAwaE"
  },
  "welcomeBonus": {
    "amount": 10,
    "signature": "5rYn4PpzH7HkmeY3aPvtgcbhJqbqGKhFZSewHV5QnrJWAxn4ZzgAe1LnXdzPYaZ3gHZNhzJoqrNgCMkF6yPgJqtH",
    "tokenAccount": "67WdH5BwmTAdrUGrpESZh6nxF9dGT3f9YdF9eL1RrQwX"
  }
}
\`\`\`

## Enlaces Útiles
- [Documentación Frontend](https://ejemplo.com/docs)
- [Tutorial de Inicio](https://ejemplo.com/tutorial)
- [FAQ](https://ejemplo.com/faq)

## Marketplace

El marketplace permite a los usuarios comprar y vender autos NFT usando tokens RCF.

### Flujo de compra/venta:

1. **Listar un auto para venta**
\`\`\`http
POST /api/marketplace/sell
x-auth-token: <tu-token-jwt>
Content-Type: application/json

{
  "carId": 1,
  "sellerId": 123,
  "price": 100,
  "currency": "RCF"
}
\`\`\`

2. **Ver autos disponibles**
\`\`\`http
GET /api/marketplace/listings
\`\`\`

3. **Comprar un auto**
\`\`\`http
POST /api/marketplace/buy
x-auth-token: <tu-token-jwt>
Content-Type: application/json

{
  "listingId": 1,
  "buyerId": 456
}
\`\`\`

### Notas importantes:
- Necesitas tener suficientes tokens RCF para comprar
- Las transacciones son irreversibles
- Los autos se transfieren automáticamente entre wallets
- Se registra un historial completo de transacciones
      `,
      contact: {
        name: 'Equipo de Racing F1',
        email: 'support@racingf1.com',
        url: 'https://racingf1.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Servidor de desarrollo local'
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints relacionados con registro, login y gestión de usuarios'
      },
      {
        name: 'Wallet',
        description: `Gestión de wallets y transacciones en Solana.
        
Flujo de creación de wallet:
1. El usuario debe estar autenticado
2. Se genera un nuevo Keypair de Solana
3. Se crea la wallet y cuenta de token
4. Se envían tokens de bienvenida
5. Se actualiza el perfil del usuario`
      },
      {
        name: 'Racing',
        description: 'Todo lo relacionado con las carreras y competiciones'
      },
      {
        name: 'Marketplace',
        description: 'Compra y venta de coches y accesorios NFT'
      }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único del usuario'
            },
            username: {
              type: 'string',
              description: 'Nombre de usuario'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Correo electrónico del usuario'
            },
            password: {
              type: 'string',
              description: 'Hash de la contraseña (bcrypt)',
              example: '$2a$10$8702MSHR0HPcuVGQHuyt0OIAJh.kL/MEcWaLuI6kgzRXdtIAHcgoW'
            },
            publicKey: {
              type: 'string',
              nullable: true,
              description: 'Dirección pública de la wallet Solana',
              example: 'DdvqTLXYzqftm25ogNHZhn4KuDee36Jx1PcwGUZfa5dc'
            },
            fechaNacimiento: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de nacimiento en formato ISO',
              example: '1995-12-24T23:00:00.000Z'
            },
            avatar: {
              type: 'string',
              description: 'URL o nombre del archivo del avatar',
              example: 'default-avatar.png'
            },
            level: {
              type: 'integer',
              description: 'Nivel actual del jugador',
              example: 1
            },
            experience: {
              type: 'integer',
              description: 'Puntos de experiencia acumulados',
              example: 0
            },
            totalRaces: {
              type: 'integer',
              description: 'Total de carreras participadas',
              example: 0
            },
            wins: {
              type: 'integer',
              description: 'Número de victorias',
              example: 0
            },
            losses: {
              type: 'integer',
              description: 'Número de derrotas',
              example: 0
            },
            rank: {
              type: 'string',
              description: 'Rango actual del jugador',
              example: 'Novice'
            },
            tokenBalance: {
              type: 'string',
              description: 'Balance de tokens RCF',
              example: '0.00000000'
            },
            usdBalance: {
              type: 'string',
              description: 'Balance en USD',
              example: '0.00'
            },
            stats: {
              type: 'object',
              description: 'Estadísticas adicionales del jugador'
            },
            badges: {
              type: 'array',
              description: 'Insignias conseguidas por el jugador',
              items: {
                type: 'string'
              }
            },
            transaction_limits: {
              type: 'object',
              properties: {
                daily: {
                  type: 'integer',
                  description: 'Límite diario de transacciones',
                  example: 1000
                },
                monthly: {
                  type: 'integer',
                  description: 'Límite mensual de transacciones',
                  example: 20000
                }
              }
            },
            billing_preferences: {
              type: 'object',
              properties: {
                currency: {
                  type: 'string',
                  description: 'Moneda preferida',
                  example: 'USD'
                },
                notifications: {
                  type: 'boolean',
                  description: 'Notificaciones de facturación activadas',
                  example: true
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación de la cuenta',
              example: '2025-05-26T12:07:00.461Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Última actualización de la cuenta',
              example: '2025-05-26T16:47:23.115Z'
            }
          }
        },
        Wallet: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'Dirección pública de la wallet (publicKey)'
            },
            balance: {
              type: 'string',
              description: 'Balance en lamports (1 SOL = 1,000,000,000 lamports)'
            },
            tokenAccount: {
              type: 'string',
              description: 'Dirección de la cuenta de token RCF'
            },
            tokenBalance: {
              type: 'number',
              description: 'Balance de tokens RCF'
            }
          }
        },
        WalletCreationResponse: {
          type: 'object',
          properties: {
            user: {
              $ref: '#/components/schemas/User'
            },
            welcomeBonus: {
              type: 'object',
              properties: {
                amount: {
                  type: 'integer',
                  description: 'Cantidad de tokens RCF de bienvenida',
                  example: 10
                },
                signature: {
                  type: 'string',
                  description: 'Firma de la transacción en Solana',
                  example: '34CcmCckCtiMiNzw57bxUuzmMZKzxhCDP4yyZiNXFq3rV45pj8HqA8fmvg8RWumPbtxmrn1AMyUEK7ejeG8H7zLZ'
                },
                tokenAccount: {
                  type: 'string',
                  description: 'Dirección de la cuenta de token RCF',
                  example: 'SrXyoRWKxQ8UH4uzbhhMiWNZXmMdFo81jpVgS4TPmnb'
                }
              }
            }
          },
          example: {
            "user": {
              "id": 1,
              "username": "player123",
              "email": "player@example.com",
              "password": "$2a$10$8702MSHR0HPcuVGQHuyt0OIAJh.kL/MEcWaLuI6kgzRXdtIAHcgoW",
              "publicKey": "DdvqTLXYzqftm25ogNHZhn4KuDee36Jx1PcwGUZfa5dc",
              "fechaNacimiento": "1995-12-24T23:00:00.000Z",
              "avatar": "default-avatar.png",
              "level": 1,
              "experience": 0,
              "totalRaces": 0,
              "wins": 0,
              "losses": 0,
              "rank": "Novice",
              "tokenBalance": "0.00000000",
              "usdBalance": "0.00",
              "stats": {},
              "badges": [],
              "transaction_limits": {
                "daily": 1000,
                "monthly": 20000
              },
              "billing_preferences": {
                "currency": "USD",
                "notifications": true
              },
              "createdAt": "2025-05-26T12:07:00.461Z",
              "updatedAt": "2025-05-26T16:47:23.115Z"
            },
            "welcomeBonus": {
              "amount": 10,
              "signature": "34CcmCckCtiMiNzw57bxUuzmMZKzxhCDP4yyZiNXFq3rV45pj8HqA8fmvg8RWumPbtxmrn1AMyUEK7ejeG8H7zLZ",
              "tokenAccount": "SrXyoRWKxQ8UH4uzbhhMiWNZXmMdFo81jpVgS4TPmnb"
            }
          }
        },
        TokenTransaction: {
          type: 'object',
          properties: {
            fromPublicKey: {
              type: 'string',
              description: 'Dirección de la wallet que envía',
              example: 'DdvqTLXYzqftm25ogNHZhn4KuDee36Jx1PcwGUZfa5dc'
            },
            toPublicKey: {
              type: 'string',
              description: 'Dirección de la wallet que recibe',
              example: 'SrXyoRWKxQ8UH4uzbhhMiWNZXmMdFo81jpVgS4TPmnb'
            },
            amount: {
              type: 'string',
              description: 'Cantidad de RCF a transferir',
              example: '5.00000000'
            }
          },
          required: ['fromPublicKey', 'toPublicKey', 'amount']
        },
        TokenBalance: {
          type: 'object',
          properties: {
            publicKey: {
              type: 'string',
              description: 'Dirección de la wallet',
              example: 'DdvqTLXYzqftm25ogNHZhn4KuDee36Jx1PcwGUZfa5dc'
            },
            balance: {
              type: 'string',
              description: 'Balance actual de RCF',
              example: '10.00000000'
            },
            tokenAccount: {
              type: 'string',
              description: 'Dirección de la cuenta de token RCF',
              example: 'SrXyoRWKxQ8UH4uzbhhMiWNZXmMdFo81jpVgS4TPmnb'
            }
          }
        },
        TransactionResult: {
          type: 'object',
          properties: {
            signature: {
              type: 'string',
              description: 'Firma de la transacción en Solana',
              example: '34CcmCckCtiMiNzw57bxUuzmMZKzxhCDP4yyZiNXFq3rV45pj8HqA8fmvg8RWumPbtxmrn1AMyUEK7ejeG8H7zLZ'
            },
            fromBalance: {
              type: 'string',
              description: 'Nuevo balance de la wallet que envía',
              example: '5.00000000'
            },
            toBalance: {
              type: 'string',
              description: 'Nuevo balance de la wallet que recibe',
              example: '15.00000000'
            }
          }
        },
        CarListing: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Identificador único del listado'
            },
            carId: {
              type: 'integer',
              description: 'ID del auto en venta'
            },
            name: {
              type: 'string',
              description: 'Nombre del auto'
            },
            current_price: {
              type: 'number',
              description: 'Precio actual del auto'
            },
            market_status: {
              type: 'string',
              enum: ['available', 'pending', 'en_venta', 'vendido'],
              description: 'Estado actual del listado'
            },
            seller_id: {
              type: 'integer',
              description: 'ID del vendedor'
            },
            specs: {
              type: 'object',
              properties: {
                power: {
                  type: 'string',
                  description: 'Potencia del auto'
                },
                acceleration: {
                  type: 'string',
                  description: 'Aceleración del auto'
                },
                topSpeed: {
                  type: 'string',
                  description: 'Velocidad máxima'
                },
                weight: {
                  type: 'string',
                  description: 'Peso del auto'
                }
              }
            }
          }
        },
        CarMarketTransaction: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Identificador único de la transacción'
            },
            car_id: {
              type: 'integer',
              description: 'ID del auto involucrado'
            },
            seller_id: {
              type: 'integer',
              description: 'ID del vendedor'
            },
            price: {
              type: 'number',
              description: 'Precio de la transacción'
            },
            currency: {
              type: 'string',
              description: 'Moneda usada (ej. RCF)',
              example: 'RCF'
            },
            status: {
              type: 'string',
              enum: ['pending', 'en_venta', 'vendido'],
              description: 'Estado de la transacción'
            },
            tx_type: {
              type: 'string',
              enum: ['sell', 'buy'],
              description: 'Tipo de transacción'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Última actualización'
            }
          }
        }
      },
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-auth-token',
          description: 'Token JWT proporcionado durante el login. Debe enviarse en el header como x-auth-token'
        }
      }
    },
    security: [{
      ApiKeyAuth: []
    }]
  },
  apis: ['./src/controllers/*.js', './src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec; 