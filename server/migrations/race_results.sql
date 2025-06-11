CREATE TABLE race_results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  rival_id INTEGER NOT NULL,
  tiempo DECIMAL(10,3) NOT NULL,
  posicion INTEGER NOT NULL,
  bet_id INTEGER REFERENCES bets(id),
  created_at TIMESTAMP DEFAULT NOW()
); 