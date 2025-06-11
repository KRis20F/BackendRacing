-- Tabla para intercambios de tokens
CREATE TABLE IF NOT EXISTS token_exchanges (
    id SERIAL PRIMARY KEY,
    from_addr TEXT NOT NULL,
    to_addr TEXT NOT NULL,
    token TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    signature TEXT NOT NULL,
    from_username TEXT NOT NULL,
    to_username TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_addr) REFERENCES Users(publickey),
    FOREIGN KEY (to_addr) REFERENCES Users(publickey)
);

-- Tabla para intercambios de NFTs
CREATE TABLE IF NOT EXISTS nft_exchanges (
    id SERIAL PRIMARY KEY,
    from_addr TEXT NOT NULL,
    to_addr TEXT NOT NULL,
    nft TEXT NOT NULL,
    signature TEXT NOT NULL,
    from_username TEXT NOT NULL,
    to_username TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_addr) REFERENCES Users(publickey),
    FOREIGN KEY (to_addr) REFERENCES Users(publickey)
);

-- Tabla para órdenes abiertas (orderbook)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(id),
    side VARCHAR(4) NOT NULL CHECK (side IN ('buy', 'sell')),
    type VARCHAR(6) NOT NULL CHECK (type IN ('limit', 'market')),
    price DECIMAL,
    amount DECIMAL NOT NULL,
    filled_amount DECIMAL DEFAULT 0,
    status VARCHAR(10) NOT NULL DEFAULT 'open', -- open, filled, cancelled, partial
    pair VARCHAR(16) NOT NULL, -- Ej: 'RACE/ETH'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_token_exchanges_from_addr ON token_exchanges(from_addr);
CREATE INDEX IF NOT EXISTS idx_token_exchanges_to_addr ON token_exchanges(to_addr);
CREATE INDEX IF NOT EXISTS idx_nft_exchanges_from_addr ON nft_exchanges(from_addr);
CREATE INDEX IF NOT EXISTS idx_nft_exchanges_to_addr ON nft_exchanges(to_addr);
CREATE INDEX IF NOT EXISTS idx_orders_pair ON orders(pair);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_side ON orders(side); 