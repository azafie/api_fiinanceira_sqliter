// ========================
// src/middlewares/auth.middleware.js
// ========================

const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Middleware de autenticação obrigatório
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 1. Obter token do header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Token de autenticação não fornecido',
        code: 'MISSING_TOKEN'
      });
    }

    // 2. Verificar formato "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      return res.status(401).json({
        success: false,
        error: 'Formato de token inválido',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({
        success: false,
        error: 'Formato de token inválido. Use "Bearer <token>"',
        code: 'INVALID_SCHEME'
      });
    }

    // 3. Verificar token JWT
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN'
      });
    }

    // 4. Verificar tipo do token (deve ser access token)
    if (decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        error: 'Tipo de token inválido',
        code: 'INVALID_TOKEN_TYPE'
      });
    }

    // 5. Verificar se usuário existe
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // 6. Adicionar informações do usuário à requisição
    req.userId = decoded.userId;
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    // 7. Continuar
    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno na autenticação',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Middleware opcional (não bloqueia se não tiver token)
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next();

    const parts = authHeader.split(' ');
    if (parts.length !== 2) return next();

    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) return next();

    const decoded = verifyToken(token);
    if (decoded && decoded.type === 'access') {
      const user = await User.findByPk(decoded.userId);
      if (user) {
        req.userId = decoded.userId;
        req.user = {
          id: user.id,
          name: user.name,
          email: user.email
        };
      }
    }

    next();
  } catch (error) {
    console.error('Erro no optionalAuthMiddleware:', error);
    next(); // Não bloqueia em caso de erro
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware
};
