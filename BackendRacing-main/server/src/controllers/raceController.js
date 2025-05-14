const sequelize = require('../config/database');

const raceResult = async (req, res) => {
  const { userId, rivalId, tiempo, gano, posicion } = req.body;
  if (!userId || !rivalId || !tiempo || gano === undefined || posicion === undefined) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }
  try {
    // Buscar la apuesta pendiente
    const [betRows] = await sequelize.query(
      'SELECT * FROM bets WHERE ((user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)) AND status = \'pendiente\'',
      { replacements: [userId, rivalId, rivalId, userId] }
    );
    const bet = betRows[0];
    if (!bet) return res.status(404).json({ error: 'No hay apuesta pendiente entre estos usuarios.' });

    // Determinar ganador y perdedor
    const winnerId = gano ? userId : rivalId;
    const loserId = gano ? rivalId : userId;

    // Transferir la suma apostada al ganador
    await sequelize.query('UPDATE "Wallets" SET balance = balance + ? WHERE userId = ?', { replacements: [bet.amount * 2, winnerId] });

    // Actualizar la apuesta como resuelta
    await sequelize.query('UPDATE bets SET status = ?, winner_id = ? WHERE id = ?', { replacements: ['resuelta', winnerId, bet.id] });

    // Registrar en historial (opcional: puedes registrar en token_exchanges)
    const signature = require('crypto').randomBytes(32).toString('hex');
    await sequelize.query(`
      INSERT INTO token_exchanges (
        from_addr, to_addr, token, amount, signature, from_username, to_username
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, {
      replacements: [
        'apuesta',
        'apuesta',
        process.env.MINT_ADDRES_SOLANA || 'TOKEN',
        bet.amount * 2,
        signature,
        'user_' + loserId,
        'user_' + winnerId
      ]
    });

    // Guardar resultados de la carrera para ambos usuarios
    await sequelize.query(
      'INSERT INTO race_results (user_id, rival_id, tiempo, posicion, bet_id) VALUES (?, ?, ?, ?, ?)',
      { replacements: [userId, rivalId, tiempo, posicion, bet.id] }
    );
    // Puedes hacer otro insert para el rival si tienes su tiempo y posición

    res.json({ status: 'ok', message: 'Resultado procesado, tokens transferidos al ganador y resultado guardado.', winnerId });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar el resultado', details: error.message });
  }
};

module.exports = { raceResult };
