const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - fechaNacimiento
 *             properties:
 *               username:
 *                 type: string
 *                 description: User's username
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *               fechaNacimiento:
 *                 type: string
 *                 format: date
 *                 description: User's birth date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     publicKey:
 *                       type: string
 *                       nullable: true
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: Username or email already exists
 */
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, fechaNacimiento } = req.body;
  try {
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }
    
    user = await User.create({ 
      username, 
      email, 
      password,
      fechaNacimiento 
    });
    
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ 
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener datos del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario recuperados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     publicKey:
 *                       type: string
 *                       nullable: true
 *                     avatar:
 *                       type: string
 *                     level:
 *                       type: integer
 *                     badges:
 *                       type: array
 *                       items:
 *                         type: string
 *                     fechaNacimiento:
 *                       type: string
 *                       format: date-time
 *                 game:
 *                   type: object
 *                   properties:
 *                     experience:
 *                       type: integer
 *                     totalRaces:
 *                       type: integer
 *                     wins:
 *                       type: integer
 *                     losses:
 *                       type: integer
 *                     rank:
 *                       type: string
 *                     stats:
 *                       type: object
 *                 finances:
 *                   type: object
 *                   properties:
 *                     tokenBalance:
 *                       type: number
 *                     usdBalance:
 *                       type: number
 *                     wallet:
 *                       type: object
 *                       properties:
 *                         balance:
 *                           type: string
 *                         address:
 *                           type: string
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: Token no válido
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 * 
 * components:
 *   securitySchemes:
 *     ApiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: x-auth-token
 *       description: Token JWT proporcionado durante el login. Debe enviarse en el header como 'x-auth-token'
 */
exports.getUserData = async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { 
          exclude: ['password']
        },
        include: [{
          model: require('../models/Wallet'),
          attributes: ['balance', 'address']
        }]
      });
      
      if (!user) {
        return res.status(404).json({ msg: 'Usuario no encontrado' });
      }
      
      if (user.avatar === null) {
        user.avatar = 'https://media.printler.com/media/photo/194807.jpg?rmode=crop&width=1024&height=725';
      }
  
      const userData = {
        profile: {
          id: user.id,
          username: user.username,
          email: user.email,
          publicKey: user.publicKey,
          avatar: user.avatar,
          level: user.level,
          badges: user.badges,
          fechaNacimiento: user.fechaNacimiento
        },
        game: {
          experience: user.experience,
          totalRaces: user.totalRaces,
          wins: user.wins,
          losses: user.losses,
          rank: user.rank,
          stats: user.stats
        },
        finances: {
          tokenBalance: user.tokenBalance,
          usdBalance: user.usdBalance,
          wallet: user.Wallet,
          transaction_limits: user.transaction_limits,
          billing_preferences: user.billing_preferences
        }
      };
  
      res.json(userData);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  };