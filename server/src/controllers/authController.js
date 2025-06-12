const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const { Keypair } = require('@solana/web3.js');
const tokenService = require('../services/tokenService');
const Car = require('../models/Car');
const UserCar = require('../models/UserCar');

// Configuración de valores
const WELCOME_BONUS_AMOUNT = 10; // 10 RCF tokens
const RCF_USD_PRICE = 13; // 13 USD por RCF

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user and create wallet with welcome gifts
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
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               fechaNacimiento:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: User registered successfully with wallet and welcome gifts
 */
exports.register = async (req, res) => {
  try {
    // 1. Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, fechaNacimiento } = req.body;

    // 1. Validar campos obligatorios
    if (!username || !email || !password || !fechaNacimiento) {
      return res.status(400).json({ msg: 'Faltan campos obligatorios.' });
    }

    // 2. Validar mayoría de edad
    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear() - (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate()) ? 1 : 0);
    if (age < 18) {
      return res.status(400).json({ msg: 'Debes tener al menos 18 años para registrarte.' });
    }

    // 3. Validar formato de email
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: 'Por favor, introduce un correo válido.' });
    }

    // 4. Validar si el email ya existe
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ msg: 'El correo ya está registrado.' });
    }

    // 5. Validar seguridad de la contraseña
    if (password.length < 8) {
      return res.status(400).json({ msg: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    // 3. Crear wallet de Solana
    const wallet = Keypair.generate();
    const publicKey = wallet.publicKey.toBase58();

    // 4. Hash del password y crear usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({
      username,
      email,
      password: hashedPassword,
      fechaNacimiento,
      publicKey,
      tokenBalance: WELCOME_BONUS_AMOUNT,
      usdBalance: WELCOME_BONUS_AMOUNT * RCF_USD_PRICE
    });

    // 5. Crear wallet en la base de datos
    await Wallet.create({
      userId: user.id,
      address: publicKey,
      balance: WELCOME_BONUS_AMOUNT
    });

    try {
      // 6. Crear cuenta de token RCF
      const tokenAccount = await tokenService.createUserTokenAccount(publicKey);
      console.log('✅ Cuenta de token RCF creada:', tokenAccount);

      // 7. Enviar tokens de bienvenida
      const signature = await tokenService.transferTokens(
        tokenService.wallet.publicKey.toString(),
        publicKey,
        WELCOME_BONUS_AMOUNT
      );
      console.log('✅ Tokens RCF de bienvenida enviados. Signature:', signature);

      // 8. Regalo de bienvenida: Porsche 911 GT3
      const porsche = await Car.findOne({ 
        where: { 
          name: '2022 Porsche 911 GT3'
        }
      });

      if (porsche) {
        await UserCar.create({
          userId: user.id,
          carId: porsche.id,
          quantity: 1
        });
        console.log('✅ Porsche 911 GT3 agregado al garage del usuario');
      }

    } catch (error) {
      console.error('⚠️ Error en la configuración de regalos de bienvenida:', error);
      // No fallamos el registro si hay error con los regalos
    }
    
    // 9. Generar JWT y enviar respuesta
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    const tokensUsdValue = WELCOME_BONUS_AMOUNT * RCF_USD_PRICE;
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        publicKey,
        tokenBalance: WELCOME_BONUS_AMOUNT,
        usdBalance: tokensUsdValue
      }
    });

  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).send('Error del servidor');
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
  try {
    // 1. Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password } = req.body;

    // 2. Buscar usuario
    const user = await User.findOne({ 
      where: { email },
      attributes: ['id', 'username', 'email', 'password', 'publicKey', 'tokenBalance', 'usdBalance']
    });

    if (!user) {
      console.log('❌ Usuario no encontrado:', email);
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }
    
    // 3. Verificar password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Password incorrecto para usuario:', email);
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // 4. Generar JWT
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    // 5. Enviar respuesta
    console.log('✅ Login exitoso para usuario:', email);
    res.json({ 
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        publicKey: user.publicKey,
        tokenBalance: user.tokenBalance,
        usdBalance: user.usdBalance
      }
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).send('Error del servidor');
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
      include: [
        {
          model: Wallet,
          as: 'wallet',
          attributes: ['balance', 'address']
        },
        {
          model: Car,
          as: 'cars',
          through: UserCar,
          attributes: [
            'id',
            'name',
            'description',
            'model_path',
            'category',
            'specs',
            'preview_image',
            'thumbnail_image',
            'price'
          ]
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Si no hay wallet, intentar crearla
    if (!user.wallet) {
      const wallet = await Wallet.create({
        userId: user.id,
        address: user.publicKey,
        balance: user.tokenBalance || WELCOME_BONUS_AMOUNT
      });
      user.wallet = wallet;
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
        fechaNacimiento: user.fechaNacimiento,
        cars: user.cars.map(car => {
          const modelFileName = car.model_path.split('/').pop();
          return {
            id: car.id,
            name: car.name,
            description: car.description,
            modelPath: `/models3d/${modelFileName}`,
            category: car.category,
            specs: car.specs,
            scale: 120.0,
            position: [0, -1, 0],
            rotation: [0, Math.PI / 3, 0],
            cameraPosition: [4, 2, 5],
            fov: 45,
            preview_image: car.preview_image,
            thumbnail_image: car.thumbnail_image,
            price: car.price
          };
        })
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
        tokenBalance: user.tokenBalance || WELCOME_BONUS_AMOUNT,
        usdBalance: user.usdBalance || (WELCOME_BONUS_AMOUNT * RCF_USD_PRICE),
        wallet: user.wallet,
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