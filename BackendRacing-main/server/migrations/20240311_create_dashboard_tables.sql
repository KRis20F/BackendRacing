-- Tabla para apuestas
CREATE TABLE IF NOT EXISTS bets (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER NOT NULL REFERENCES "Users"(id),
    user2_id INTEGER NOT NULL REFERENCES "Users"(id),
    amount DECIMAL(20,8) NOT NULL,
    status VARCHAR(20) DEFAULT 'pendiente',
    winner_id INTEGER REFERENCES "Users"(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para resultados de carreras
CREATE TABLE IF NOT EXISTS race_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "Users"(id),
    rival_id INTEGER NOT NULL REFERENCES "Users"(id),
    tiempo DECIMAL(10,3) NOT NULL,
    posicion INTEGER NOT NULL,
    bet_id INTEGER REFERENCES bets(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para autos si no existe
CREATE TABLE IF NOT EXISTS "Cars" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    model_path VARCHAR(255),
    preview_image VARCHAR(255),
    thumbnail_image VARCHAR(255),
    category VARCHAR(50),
    specs JSONB DEFAULT '{
        "power": "",
        "acceleration": "",
        "topSpeed": "",
        "weight": ""
    }'
);

-- Tabla para la relación usuario-auto si no existe
CREATE TABLE IF NOT EXISTS "UserCars" (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES "Users"(id),
    "carId" INTEGER NOT NULL REFERENCES "Cars"(id),
    quantity INTEGER DEFAULT 1
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_race_results_user_id ON race_results(user_id);
CREATE INDEX IF NOT EXISTS idx_race_results_rival_id ON race_results(rival_id);
CREATE INDEX IF NOT EXISTS idx_race_results_bet_id ON race_results(bet_id);
CREATE INDEX IF NOT EXISTS idx_bets_user1_id ON bets(user1_id);
CREATE INDEX IF NOT EXISTS idx_bets_user2_id ON bets(user2_id);
CREATE INDEX IF NOT EXISTS idx_bets_winner_id ON bets(winner_id);
CREATE INDEX IF NOT EXISTS idx_cars_category ON "Cars"(category);
CREATE INDEX IF NOT EXISTS idx_user_cars_user_id ON "UserCars"("userId");
CREATE INDEX IF NOT EXISTS idx_user_cars_car_id ON "UserCars"("carId"); 