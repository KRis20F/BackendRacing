const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

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