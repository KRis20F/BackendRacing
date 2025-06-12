/**
 * @swagger
 * /api/race/result:
 *   post:
 *     summary: Submit race results and process bet
 *     tags: [Race]
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - rivalId
 *               - tiempo
 *               - gano
 *               - posicion
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user submitting result
 *               rivalId:
 *                 type: integer
 *                 description: ID of the rival user
 *               tiempo:
 *                 type: number
 *                 description: Race completion time in seconds
 *               gano:
 *                 type: boolean
 *                 description: Whether the user won the race
 *               posicion:
 *                 type: integer
 *                 description: Final position in race
 *     responses:
 *       200:
 *         description: Race result processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Resultado procesado, tokens transferidos al ganador y resultado guardado.
 *                 winnerId:
 *                   type: integer
 *                   description: ID of the winning user
 *       400:
 *         description: Invalid parameters
 *       404:
 *         description: No pending bet found
 *       500:
 *         description: Server error
 * 
 * components:
 *   schemas:
 *     RaceResult:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         rival_id:
 *           type: integer
 *         tiempo:
 *           type: number
 *           format: float
 *         posicion:
 *           type: integer
 *         bet_id:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 */
const sequelize = require('../config/database');
const jwt = require('jsonwebtoken');

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

const procesarResultadoSimple = async (req, res) => {
  // Buscar el token en x-auth-token o Authorization: Bearer ...
  const token = req.headers['x-auth-token'] || (req.headers['authorization'] && req.headers['authorization'].replace('Bearer ', ''));
  if (!token) {
    console.log('❌ [Auth] No se proporcionó token');
    return res.status(401).json({ error: 'No hay token, autorización denegada' });
  }
  let user;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    user = decoded.user;
    console.log('✅ [Auth] Token válido para usuario:', user.id);
  } catch (err) {
    console.error('❌ [Auth] Token inválido:', err.message);
    return res.status(401).json({ error: 'Token no válido' });
  }

  const { resultado } = req.body;
  console.log('Body recibido:', req.body);

  if (!resultado) {
    console.log('Falta el campo resultado en el body');
    return res.status(400).json({ error: 'Falta el resultado' });
  }

  // Parsear el string
  let winnerPlayer;
  if (resultado.toLowerCase().includes('player 1')) {
    winnerPlayer = 1;
  } else if (resultado.toLowerCase().includes('player 2')) {
    winnerPlayer = 2;
  } else {
    console.log('Formato de resultado no reconocido:', resultado);
    return res.status(400).json({ error: 'Formato de resultado no reconocido' });
  }

  // --- Lógica de apuestas comentada para debug ---
  /*
  try {
    // Buscar la apuesta pendiente más reciente
    const [betRows] = await sequelize.query(
      "SELECT * FROM bets WHERE status = 'pendiente' ORDER BY created_at DESC LIMIT 1"
    );
    const bet = betRows[0];
    if (!bet) {
      console.log('No hay apuesta pendiente.');
      return res.status(404).json({ error: 'No hay apuesta pendiente.' });
    }

    // Determinar los IDs reales de los jugadores
    const player1Id = bet.user1_id;
    const player2Id = bet.user2_id;
    const winnerId = winnerPlayer === 1 ? player1Id : player2Id;
    const loserId = winnerPlayer === 1 ? player2Id : player1Id;

    // Transferir la suma apostada al ganador
    await sequelize.query('UPDATE "Wallets" SET balance = balance + ? WHERE userId = ?', { replacements: [bet.amount * 2, winnerId] });

    // Actualizar la apuesta como resuelta
    await sequelize.query('UPDATE bets SET status = ?, winner_id = ? WHERE id = ?', { replacements: ['resuelta', winnerId, bet.id] });

    // Guardar resultado simple (opcional, sin tiempo ni posición real)
    await sequelize.query(
      'INSERT INTO race_results (user_id, rival_id, tiempo, posicion, bet_id) VALUES (?, ?, ?, ?, ?)',
      [winnerId, loserId, 0, 1, bet.id]
    );

    console.log(`Resultado procesado correctamente. Ganador: player ${winnerPlayer} (userId: ${winnerId})`);

    res.json({
      status: 'ok',
      message: `Resultado procesado, tokens transferidos al ganador (player ${winnerPlayer}) y apuesta resuelta.`,
      winnerId
    });
  } catch (error) {
    console.log('Error al procesar el resultado:', error);
    res.status(500).json({ error: 'Error al procesar el resultado', details: error.message });
  }
  */
  // --- Fin lógica de apuestas comentada ---

  // Respuesta simple para debug
  console.log(`Resultado recibido correctamente para debug. Ganador: player ${winnerPlayer}`);

  res.json({
    status: 'ok',
    message: `Resultado recibido para debug, ganador: player ${winnerPlayer}`,
    winnerPlayer
  });
};

module.exports = { raceResult, procesarResultadoSimple };
