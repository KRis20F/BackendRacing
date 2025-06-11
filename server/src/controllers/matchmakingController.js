const waitingPlayers = [];

// POST /matchmaking/join
// Si no hay nadie esperando, el usuario se pone en espera como Player 1.
// Si ya hay alguien esperando, se emparejan y ambos reciben la info del match.
const joinMatchmaking = (req, res) => {
  const userId = req.user.id || req.body.userId;
  console.log(`[MM] Usuario ${userId} entró al matchmaking`);
  if (!userId) {
    console.log(`[MM] ERROR: Falta userId en la petición`);
    return res.status(400).json({ error: 'Falta userId' });
  }

  // ¿Ya está esperando?
  if (waitingPlayers.find(p => p.userId === userId)) {
    console.log(`[MM] Usuario ${userId} ya está esperando a un rival.`);
    res.json({ status: 'waiting', message: 'Ya estás esperando a un rival.' });
    console.log(`[MM] Respuesta enviada a ${userId}: waiting (ya esperando)`);
    return;
  }

  if (waitingPlayers.length === 0) {
    // Nadie esperando, este usuario es Player 1
    waitingPlayers.push({ userId, timestamp: Date.now() });
    console.log(`[MM] Usuario ${userId} agregado a la cola de espera como Player 1.`);
    res.json({ status: 'waiting', message: 'Esperando a otro jugador...', player: 1 });
    console.log(`[MM] Respuesta enviada a ${userId}: waiting (primer jugador)`);
    return;
  } else {
    // Hay alguien esperando, emparejar
    const rival = waitingPlayers.shift();
    console.log(`[MM] Match encontrado: ${userId} (Player 2) vs ${rival.userId} (Player 1)`);
    res.json({
      status: 'matched',
      message: '¡Emparejado!',
      player: 2,
      rivalId: rival.userId,
      you: userId
    });
    console.log(`[MM] Respuesta enviada a ${userId}: matched con ${rival.userId}`);
    return;
    // (Opcional: notificar al rival por WebSocket, etc)
  }
};

module.exports = { joinMatchmaking }; 