const jwt = require('jsonwebtoken');

const generateAccessToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado no .env');
  }
  
  return jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

const generateRefreshToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado no .env');
  }
  
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
  );
};

const verifyToken = (token) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET não configurado no .env');
    }
    
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('Erro ao verificar token:', error.message);
    return null;
  }
};

const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  decodeToken
};