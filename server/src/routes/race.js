const express = require('express');
const router = express.Router();
const { createBet } = require('../controllers/betController');
const { raceResult, procesarResultadoSimple } = require('../controllers/raceController');
const { joinMatchmaking } = require('../controllers/matchmakingController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /api/bet/create:
 *   post:
 *     summary: Create a new bet between two users
 *     tags: [Racing]
 *     security:
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
 *               - cantidad
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID del usuario que crea la apuesta
 *               rivalId:
 *                 type: integer
 *                 description: ID del rival
 *               cantidad:
 *                 type: number
 *                 description: Cantidad a apostar
 *     responses:
 *       200:
 *         description: Apuesta creada exitosamente
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
 *                   example: Apuesta creada y saldo bloqueado.
 *       400:
 *         description: Parámetros inválidos o saldo insuficiente
 *       500:
 *         description: Error del servidor
 */
router.post('/bet/create', auth, createBet);

/**
 * @swagger
 * /api/race/result:
 *   post:
 *     summary: Submit race results and process bet
 *     tags: [Racing]
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
 */
router.post('/result', auth, raceResult);

/**
 * @swagger
 * /api/race/result-simple:
 *   post:
 *     summary: Submit race result as a simple string (e.g., "gana player 1")
 *     tags: [Racing]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resultado
 *             properties:
 *               resultado:
 *                 type: string
 *                 example: gana player 1
 *                 description: Resultado simple de la carrera ("gana player 1" o "gana player 2")
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
 *                   example: Resultado procesado, tokens transferidos al ganador y apuesta resuelta.
 *                 winnerId:
 *                   type: integer
 *                   description: ID of the winning user
 *       400:
 *         description: Invalid parameters or format
 *       404:
 *         description: No pending bet found
 *       500:
 *         description: Server error
 */
router.post('/result-simple', auth, procesarResultadoSimple);

// router.post('/matchmaking/join', auth, joinMatchmaking);

module.exports = router;
