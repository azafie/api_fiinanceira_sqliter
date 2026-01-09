const authService = require('./auth.service');

class AuthController {
  // POST /auth/login
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Validação básica
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email e senha são obrigatórios'
        });
      }
      
      const result = await authService.login(email, password);
      
      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(401).json(result);
      }
      
    } catch (error) {
      console.error('Erro no controller login:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }
  
  // POST /auth/refresh
  async refresh(req, res) {
    try {
      const { refresh_token } = req.body;
      
      if (!refresh_token) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token é obrigatório'
        });
      }
      
      const result = await authService.refresh(refresh_token);
      
      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(401).json(result);
      }
      
    } catch (error) {
      console.error('Erro no controller refresh:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }
  
  // POST /auth/logout
  async logout(req, res) {
    try {
      const { refresh_token } = req.body;
      
      if (!refresh_token) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token é obrigatório'
        });
      }
      
      const result = await authService.logout(refresh_token);
      
      return res.status(200).json(result);
      
    } catch (error) {
      console.error('Erro no controller logout:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }
  
  // POST /auth/logout-all
  async logoutAll(req, res) {
    try {
      const result = await authService.logoutAll(req.userId);
      
      return res.status(200).json(result);
      
    } catch (error) {
      console.error('Erro no controller logoutAll:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }
  
  // POST /auth/register
  async register(req, res) {
    try {
      const { name, email, password } = req.body;
      
      // Validação
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Nome, email e senha são obrigatórios'
        });
      }
      
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Senha deve ter no mínimo 6 caracteres'
        });
      }
      
      const result = await authService.register({
        name,
        email,
        password
      });
      
      if (result.success) {
        return res.status(201).json(result);
      } else {
        return res.status(400).json(result);
      }
      
    } catch (error) {
      console.error('Erro no controller register:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }
  
  // GET /auth/profile
  async getProfile(req, res) {
    try {
      const result = await authService.getProfile(req.userId);
      
      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(404).json(result);
      }
      
    } catch (error) {
      console.error('Erro no controller profile:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno no servidor'
      });
    }
  }
}

module.exports = new AuthController();