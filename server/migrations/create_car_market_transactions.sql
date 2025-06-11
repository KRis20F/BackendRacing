CREATE TABLE IF NOT EXISTS car_market_transactions (
    id SERIAL PRIMARY KEY,
    car_id INTEGER NOT NULL REFERENCES "Cars"(id),
    seller_id INTEGER NOT NULL REFERENCES "Users"(id),
    price DECIMAL(20,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'RCF',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    tx_type VARCHAR(20) NOT NULL DEFAULT 'sell',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_car_market_status ON car_market_transactions(status);
CREATE INDEX idx_car_market_seller ON car_market_transactions(seller_id);
CREATE INDEX idx_car_market_car ON car_market_transactions(car_id); 