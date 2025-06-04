const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');
  console.log('Token recibido:', token);

  // Check if no token
  if (!token) {
    console.log('No se recibió token');
    return res.status(401).json({ msg: 'No token, autorización denegada' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', decoded);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.log('Error al verificar token:', err.message);
    res.status(401).json({ msg: 'Token no válido' });
  }
}; 