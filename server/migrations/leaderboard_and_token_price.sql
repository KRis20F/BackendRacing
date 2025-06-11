-- Tabla para leaderboard
CREATE TABLE IF NOT EXISTS leaderboard (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    points INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para histórico de precios de RacingCoin
CREATE TABLE IF NOT EXISTS token_price_history (
    id SERIAL PRIMARY KEY,
    token VARCHAR(50) NOT NULL,
    price DECIMAL(20,8) NOT NULL,
    date DATE NOT NULL
);

-- Índices
CREATE INDEX idx_leaderboard_points ON leaderboard(points DESC);
CREATE INDEX idx_token_price_history_token_date ON token_price_history(token, date DESC); 