-- Añadir campos de balance y preferencias a Users
ALTER TABLE "Users" 
ADD COLUMN IF NOT EXISTS "usdBalance" DECIMAL(20,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS "transaction_limits" JSONB DEFAULT '{
    "daily_limit": 1000,
    "monthly_limit": 10000,
    "max_transaction": 500
}',
ADD COLUMN IF NOT EXISTS "billing_preferences" JSONB DEFAULT '{
    "default_currency": "USD",
    "auto_pay": false,
    "invoice_email": null
}';

-- Tabla para historial de balance
CREATE TABLE IF NOT EXISTS balance_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    previous_balance DECIMAL(20,8) NOT NULL,
    new_balance DECIMAL(20,8) NOT NULL,
    change_type VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para balance_history
CREATE INDEX idx_balance_history_user_id ON balance_history(user_id);
CREATE INDEX idx_balance_history_created_at ON balance_history(created_at);

-- Trigger para actualizar balance_history
CREATE OR REPLACE FUNCTION update_balance_history()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD."tokenBalance" IS DISTINCT FROM NEW."tokenBalance" THEN
        INSERT INTO balance_history (
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

-- Tabla para notificaciones de facturación
CREATE TABLE IF NOT EXISTS billing_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para billing_notifications
CREATE INDEX idx_billing_notifications_user_id ON billing_notifications(user_id);
CREATE INDEX idx_billing_notifications_is_read ON billing_notifications(is_read);

-- Tabla para límites de transacciones por usuario
CREATE TABLE IF NOT EXISTS user_transaction_limits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
    limit_type VARCHAR(50) NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    period VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, limit_type, period)
);

-- Índices para user_transaction_limits
CREATE INDEX idx_user_transaction_limits_user_id ON user_transaction_limits(user_id);

-- Trigger para actualizar updated_at en user_transaction_limits
CREATE OR REPLACE FUNCTION update_user_transaction_limits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_transaction_limits_updated_at
    BEFORE UPDATE ON user_transaction_limits
    FOR EACH ROW
    EXECUTE FUNCTION update_user_transaction_limits_updated_at(); 