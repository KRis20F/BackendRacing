-- Crear la tabla de usuarios
CREATE TABLE "Users" (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR(255) NOT NULL UNIQUE,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "avatar" VARCHAR(255) DEFAULT 'default-avatar.png',
    "level" INTEGER DEFAULT 1,
    "badges" TEXT[] DEFAULT '{}',
    "tokenBalance" DECIMAL(20,8) DEFAULT 0,
    "publicKey" VARCHAR(255),
    "experience" INTEGER DEFAULT 0,
    "totalRaces" INTEGER DEFAULT 0,
    "wins" INTEGER DEFAULT 0,
    "losses" INTEGER DEFAULT 0,
    "rank" VARCHAR(50) DEFAULT 'Novato',
    "stats" JSONB DEFAULT '{"bestLapTime": null, "totalDistance": 0, "favoriteTrack": null, "carCollection": []}',
    "fechaNacimiento" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX "users_email_idx" ON "Users" ("email");
CREATE INDEX "users_username_idx" ON "Users" ("username");
CREATE INDEX "users_publicKey_idx" ON "Users" ("publicKey");

-- Crear tabla de sesiones para manejar tokens
CREATE TABLE "Sessions" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES "Users"("id") ON DELETE CASCADE,
    "token" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Crear índice para la tabla de sesiones
CREATE INDEX "sessions_token_idx" ON "Sessions" ("token");
CREATE INDEX "sessions_userId_idx" ON "Sessions" ("userId"); 