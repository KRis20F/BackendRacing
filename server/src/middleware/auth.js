const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  console.log('🔐 [Auth] Verificando token...');
  console.log('🔑 [Auth] Headers:', req.headers);
  
  const token = req.header('x-auth-token');
  if (!token) {
    console.log('❌ [Auth] No se proporcionó token');
    return res.status(401).json({ error: 'No hay token, autorización denegada' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    console.log('✅ [Auth] Token válido para usuario:', req.user.id);
    next();
  } catch (err) {
    console.error('❌ [Auth] Token inválido:', err.message);
    res.status(401).json({ error: 'Token no válido' });
  }
}; 