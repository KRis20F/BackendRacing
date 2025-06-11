-- Tabla para transacciones
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    from_addr TEXT NOT NULL,
    to_addr TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    signature TEXT NOT NULL,
    from_username TEXT NOT NULL,
    to_username TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_addr) REFERENCES users(publickey),
    FOREIGN KEY (to_addr) REFERENCES users(publickey)
);

-- Eliminar la tabla wallets si existe
DROP TABLE IF EXISTS wallets;

-- Tabla para wallets
CREATE TABLE IF NOT EXISTS "Wallets" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "address" VARCHAR(255) NOT NULL UNIQUE,
    "balance" DECIMAL(20,8) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE
);

-- Índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_transactions_from_addr ON transactions(from_addr);
CREATE INDEX IF NOT EXISTS idx_transactions_to_addr ON transactions(to_addr);
CREATE INDEX IF NOT EXISTS idx_wallets_userid ON "Wallets"("userId");
CREATE INDEX IF NOT EXISTS idx_wallets_address ON "Wallets"("address"); 