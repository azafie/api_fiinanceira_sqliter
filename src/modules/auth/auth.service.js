// src/modules/auth/auth.service.js - VERSÃO CORRIGIDA
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const RefreshToken = require('../../models/RefreshToken');
const { generateAccessToken, generateRefreshToken } = require('../../utils/jwt');

class AuthService {
  // Login
  async login(email, password) {
    try {
      // 1. Buscar usuário
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        throw new Error('Credenciais inválidas');
      }
      
      // 2. Validar senha
      const isValidPassword = await user.validatePassword(password);
      
      if (!isValidPassword) {
        throw new Error('Credenciais inválidas');
      }
      
      // 3. Verificar se já existe refresh token válido
      let refreshToken;
      const existingToken = await RefreshToken.findOne({
        where: { 
          user_id: user.id,
          revoked: false,
          expires_at: { [Op.gt]: new Date() } // ainda não expirou
        }
      });
      
      if (existingToken) {
        // Usar token existente
        refreshToken = existingToken.token;
      } else {
        // Criar novo token
        refreshToken = generateRefreshToken(user.id);
        
        // Salvar novo refresh token no banco
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias
        
        await RefreshToken.create({
          user_id: user.id,
          token: refreshToken,
          expires_at: expiresAt,
          revoked: false
        });
      }
      
      // 4. Gerar access token (sempre novo)
      const accessToken = generateAccessToken(user.id);
      
      // 5. Retornar dados
      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at
        },
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: 900 // 15 minutos em segundos
        }
      };
      
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Refresh token
  async refresh(token) {
    try {
      // 1. Verificar se token existe no banco
      const refreshToken = await RefreshToken.findOne({
        where: { token, revoked: false }
      });
      
      if (!refreshToken) {
        throw new Error('Refresh token inválido ou revogado');
      }
      
      // 2. Verificar se não expirou
      if (refreshToken.expires_at < new Date()) {
        await refreshToken.update({ revoked: true });
        throw new Error('Refresh token expirado');
      }
      
      // 3. Gerar novo access token
      const accessToken = generateAccessToken(refreshToken.user_id);
      
      return {
        success: true,
        access_token: accessToken,
        expires_in: 900
      };
      
    } catch (error) {
      console.error('Erro no refresh:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Logout
  async logout(token) {
    try {
      // Revogar refresh token
      const refreshToken = await RefreshToken.findOne({
        where: { token }
      });
      
      if (refreshToken) {
        await refreshToken.update({ revoked: true });
      }
      
      return {
        success: true,
        message: 'Logout realizado com sucesso'
      };
    } catch (error) {
      console.error('Erro no logout:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Logout de todos os dispositivos
  async logoutAll(userId) {
    try {
      await RefreshToken.update(
        { revoked: true },
        { where: { user_id: userId } }
      );
      
      return {
        success: true,
        message: 'Logout de todos os dispositivos realizado'
      };
    } catch (error) {
      console.error('Erro no logoutAll:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Registrar novo usuário (ATUALIZADO para usar password_hash)
  async register(userData) {
    try {
      // Verificar se email já existe
      const existingUser = await User.findOne({ where: { email: userData.email } });
      
      if (existingUser) {
        throw new Error('Email já está em uso');
      }
      
      // ✅ HASH DA SENHA ANTES DE CRIAR O USER (CORREÇÃO IMPORTANTE)
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(userData.password, salt);
      
      // ✅ Criar usuário COM password_hash DIRETAMENTE
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        password_hash: password_hash // ← hash já feita aqui
        // NÃO enviar 'password' pois foi removido do model
      });
      
      // Gerar tokens
      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);
      
      // Salvar refresh token
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      await RefreshToken.create({
        user_id: user.id,
        token: refreshToken,
        expires_at: expiresAt,
        revoked: false
      });
      
      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at
        },
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: 900
        }
      };
      
    } catch (error) {
      console.error('Erro no registro:', error);
      
      // Melhorar mensagem de erro para validações
      let errorMessage = error.message;
      if (error.name === 'SequelizeValidationError') {
        errorMessage = error.errors.map(err => err.message).join(', ');
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  // Perfil do usuário
  async getProfile(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: ['id', 'name', 'email', 'created_at', 'updated_at']
      });
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      return {
        success: true,
        user
      };
      
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new AuthService();