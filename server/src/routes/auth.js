const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const { register, login, getUserData } = require('../controllers/authController');

router.post('/register', [
  check('username').notEmpty(),
  check('email').isEmail(),
  check('password').isLength({ min: 6 }),
  check('fechaNacimiento').optional().isDate()
], register);

router.post('/login', [
  check('email').isEmail(),
  check('password').exists()
], login);

router.get('/me', auth, getUserData);

module.exports = router;