-- 1. Sistema de Usuarios y Autenticación
CREATE TABLE IF NOT EXISTS "Users" (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR(255) NOT NULL UNIQUE,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "avatar" VARCHAR(255) DEFAULT 'default-avatar.png',
    "level" INTEGER DEFAULT 1,
    "badges" TEXT[] DEFAULT '{}',
    "tokenBalance" DECIMAL(20,8) DEFAULT 0,
    "usdBalance" DECIMAL(20,2) DEFAULT 0,
    "publicKey" VARCHAR(255) NULL UNIQUE,
    "experience" INTEGER DEFAULT 0,
    "totalRaces" INTEGER DEFAULT 0,
    "wins" INTEGER DEFAULT 0,
    "losses" INTEGER DEFAULT 0,
    "rank" VARCHAR(50) DEFAULT 'Novato',
    "stats" JSONB DEFAULT '{
        "bestLapTime": null,
        "totalDistance": 0,
        "favoriteTrack": null,
        "carCollection": []
    }',
    "transaction_limits" JSONB DEFAULT '{
        "daily_limit": 1000,
        "monthly_limit": 10000,
        "max_transaction": 500
    }',
    "billing_preferences" JSONB DEFAULT '{
        "default_currency": "USD",
        "auto_pay": false,
        "invoice_email": null
    }',
    "fechaNacimiento" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS "Sessions" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES "Users"("id") ON DELETE CASCADE,
    "token" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 2. Sistema de Autos y Mercado
CREATE TABLE IF NOT EXISTS "Cars" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL DEFAULT 0,
    "model_path" VARCHAR(255),
    "preview_image" VARCHAR(255),
    "thumbnail_image" VARCHAR(255),
    "category" VARCHAR(50),
    "specs" JSONB DEFAULT '{
        "power": "",
        "acceleration": "",
        "topSpeed": "",
        "weight": ""
    }'
);

CREATE TABLE IF NOT EXISTS "UserCars" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "carId" INTEGER NOT NULL REFERENCES "Cars"("id") ON DELETE CASCADE,
    "quantity" INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS "car_market_transactions" (
    "id" SERIAL PRIMARY KEY,
    "car_id" INTEGER NOT NULL REFERENCES "Cars"(id),
    "seller_id" INTEGER NOT NULL REFERENCES "Users"(id),
    "price" DECIMAL(20,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'RCF',
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "tx_type" VARCHAR(20) NOT NULL DEFAULT 'sell',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Sistema de Carreras y Apuestas
CREATE TABLE IF NOT EXISTS "bets" (
    "id" SERIAL PRIMARY KEY,
    "user1_id" INTEGER NOT NULL REFERENCES "Users"(id),
    "user2_id" INTEGER NOT NULL REFERENCES "Users"(id),
    "amount" DECIMAL(20,8) NOT NULL,
    "status" VARCHAR(20) DEFAULT 'pendiente',
    "winner_id" INTEGER REFERENCES "Users"(id),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "race_results" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL REFERENCES "Users"(id),
    "rival_id" INTEGER NOT NULL REFERENCES "Users"(id),
    "tiempo" DECIMAL(10,3) NOT NULL,
    "posicion" INTEGER NOT NULL,
    "bet_id" INTEGER REFERENCES "bets"(id),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Sistema de Billetera y Transacciones
CREATE TABLE IF NOT EXISTS "Wallets" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "address" VARCHAR(255) NOT NULL UNIQUE,
    "balance" DECIMAL(20,8) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "transactions" (
    "id" SERIAL PRIMARY KEY,
    "from_addr" TEXT NOT NULL REFERENCES "Users"(publickey),
    "to_addr" TEXT NOT NULL REFERENCES "Users"(publickey),
    "amount" DECIMAL NOT NULL,
    "signature" TEXT NOT NULL,
    "from_username" TEXT NOT NULL,
    "to_username" TEXT NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "token_exchanges" (
    "id" SERIAL PRIMARY KEY,
    "from_user_id" INTEGER NOT NULL,
    "to_user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "signature" TEXT NOT NULL,
    "from_username" TEXT NOT NULL,
    "to_username" TEXT NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("from_user_id") REFERENCES "Users"("id"),
    FOREIGN KEY ("to_user_id") REFERENCES "Users"("id")
);

CREATE TABLE IF NOT EXISTS "nft_exchanges" (
    "id" SERIAL PRIMARY KEY,
    "from_addr" TEXT NOT NULL REFERENCES "Users"(publickey),
    "to_addr" TEXT NOT NULL REFERENCES "Users"(publickey),
    "nft" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "from_username" TEXT NOT NULL,
    "to_username" TEXT NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Sistema de Facturación
CREATE TABLE IF NOT EXISTS "billing_info" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "company" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "vat_number" VARCHAR(50),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "payment_cards" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "card_number" VARCHAR(19) NOT NULL,
    "card_holder" VARCHAR(255) NOT NULL,
    "expiry_date" VARCHAR(5) NOT NULL,
    "card_type" VARCHAR(50) NOT NULL,
    "is_default" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "invoices" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "invoice_number" VARCHAR(50) NOT NULL UNIQUE,
    "amount" DECIMAL(20,8) NOT NULL,
    "currency" VARCHAR(10) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP WITH TIME ZONE,
    "pdf_url" VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS "billing_transactions" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "amount" DECIMAL(20,8) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS "billing_notifications" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "type" VARCHAR(50) NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "user_transaction_limits" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "limit_type" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(20,8) NOT NULL,
    "period" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("user_id", "limit_type", "period")
);

-- 6. Sistema de Clasificación y Tokens
CREATE TABLE IF NOT EXISTS "leaderboard" (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR(255) NOT NULL,
    "points" INTEGER NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "token_price_history" (
    "id" SERIAL PRIMARY KEY,
    "token" VARCHAR(50) NOT NULL,
    "price" DECIMAL(20,8) NOT NULL,
    "date" DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS "balance_history" (
    "id" SERIAL PRIMARY KEY,
    "user_id" INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    "previous_balance" DECIMAL(20,8) NOT NULL,
    "new_balance" DECIMAL(20,8) NOT NULL,
    "change_type" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "Users" ("email");
CREATE INDEX IF NOT EXISTS "users_username_idx" ON "Users" ("username");
CREATE INDEX IF NOT EXISTS "users_publicKey_idx" ON "Users" ("publicKey");
CREATE INDEX IF NOT EXISTS "sessions_token_idx" ON "Sessions" ("token");
CREATE INDEX IF NOT EXISTS "sessions_userId_idx" ON "Sessions" ("userId");
CREATE INDEX IF NOT EXISTS "idx_cars_category" ON "Cars"("category");
CREATE INDEX IF NOT EXISTS "idx_cars_price" ON "Cars"("price");
CREATE INDEX IF NOT EXISTS "idx_user_cars_user_id" ON "UserCars"("userId");
CREATE INDEX IF NOT EXISTS "idx_user_cars_car_id" ON "UserCars"("carId");
CREATE INDEX IF NOT EXISTS "idx_car_market_status" ON "car_market_transactions"("status");
CREATE INDEX IF NOT EXISTS "idx_car_market_seller" ON "car_market_transactions"("seller_id");
CREATE INDEX IF NOT EXISTS "idx_car_market_car" ON "car_market_transactions"("car_id");
CREATE INDEX IF NOT EXISTS "idx_race_results_user_id" ON "race_results"("user_id");
CREATE INDEX IF NOT EXISTS "idx_race_results_rival_id" ON "race_results"("rival_id");
CREATE INDEX IF NOT EXISTS "idx_race_results_bet_id" ON "race_results"("bet_id");
CREATE INDEX IF NOT EXISTS "idx_bets_user1_id" ON "bets"("user1_id");
CREATE INDEX IF NOT EXISTS "idx_bets_user2_id" ON "bets"("user2_id");
CREATE INDEX IF NOT EXISTS "idx_bets_winner_id" ON "bets"("winner_id");
CREATE INDEX IF NOT EXISTS "idx_wallets_userid" ON "Wallets"("userId");
CREATE INDEX IF NOT EXISTS "idx_wallets_address" ON "Wallets"("address");
CREATE INDEX IF NOT EXISTS "idx_token_exchanges_from_addr" ON "token_exchanges"("from_addr");
CREATE INDEX IF NOT EXISTS "idx_token_exchanges_to_addr" ON "token_exchanges"("to_addr");
CREATE INDEX IF NOT EXISTS "idx_nft_exchanges_from_addr" ON "nft_exchanges"("from_addr");
CREATE INDEX IF NOT EXISTS "idx_nft_exchanges_to_addr" ON "nft_exchanges"("to_addr");
CREATE INDEX IF NOT EXISTS "idx_billing_info_user_id" ON "billing_info"("user_id");
CREATE INDEX IF NOT EXISTS "idx_payment_cards_user_id" ON "payment_cards"("user_id");
CREATE INDEX IF NOT EXISTS "idx_invoices_user_id" ON "invoices"("user_id");
CREATE INDEX IF NOT EXISTS "idx_invoices_invoice_number" ON "invoices"("invoice_number");
CREATE INDEX IF NOT EXISTS "idx_billing_transactions_user_id" ON "billing_transactions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_billing_notifications_user_id" ON "billing_notifications"("user_id");
CREATE INDEX IF NOT EXISTS "idx_billing_notifications_is_read" ON "billing_notifications"("is_read");
CREATE INDEX IF NOT EXISTS "idx_user_transaction_limits_user_id" ON "user_transaction_limits"("user_id");
CREATE INDEX IF NOT EXISTS "idx_leaderboard_points" ON "leaderboard"("points" DESC);
CREATE INDEX IF NOT EXISTS "idx_token_price_history_token_date" ON "token_price_history"("token", "date" DESC);
CREATE INDEX IF NOT EXISTS "idx_balance_history_user_id" ON "balance_history"("user_id");
CREATE INDEX IF NOT EXISTS "idx_balance_history_created_at" ON "balance_history"("created_at");

-- Triggers
CREATE OR REPLACE FUNCTION update_billing_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_billing_info_updated_at
    BEFORE UPDATE ON "billing_info"
    FOR EACH ROW
    EXECUTE FUNCTION update_billing_info_updated_at();

CREATE OR REPLACE FUNCTION update_payment_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payment_cards_updated_at
    BEFORE UPDATE ON "payment_cards"
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_cards_updated_at();

CREATE OR REPLACE FUNCTION update_balance_history()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD."tokenBalance" IS DISTINCT FROM NEW."tokenBalance" THEN
        INSERT INTO "balance_history" (
            user_id,
            previous_balance,
            new_balance,
            change_type,
            description
        ) VALUES (
            NEW.id,
            OLD."tokenBalance",
            NEW."tokenBalance",
            'BALANCE_UPDATE',
            'Balance updated'
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_balance_history_trigger
    AFTER UPDATE ON "Users"
    FOR EACH ROW
    EXECUTE FUNCTION update_balance_history();

CREATE OR REPLACE FUNCTION update_user_transaction_limits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_transaction_limits_updated_at
    BEFORE UPDATE ON "user_transaction_limits"
    FOR EACH ROW
    EXECUTE FUNCTION update_user_transaction_limits_updated_at();