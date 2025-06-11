CREATE TABLE bets (
  id SERIAL PRIMARY KEY,
  user1_id INTEGER NOT NULL,
  user2_id INTEGER NOT NULL,
  amount DECIMAL(20,8) NOT NULL,
  status VARCHAR(20) DEFAULT 'pendiente',
  winner_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
