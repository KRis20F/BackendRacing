const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  console.log('Received token:', token ? token.substring(0, 20) + '...' : 'none');
  console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);
  console.log('JWT_SECRET value:', process.env.JWT_SECRET);

  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    console.log('Attempting to verify token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully:', decoded);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
}; 