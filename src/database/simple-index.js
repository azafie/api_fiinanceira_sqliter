// src/database/simple-index.js - ARQUIVO NOVO
const sequelize = require('../config/database');
const setupAssociations = require('../models/associations');

// Importar models
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const TaxRule = require('../models/TaxRule');
const Setting = require('../models/Setting');

// Função de inicialização simplificada
const initDatabase = async () => {
  try {
    // 1. Testar conexão
    await sequelize.authenticate();
    console.log('✓ Conexão com banco estabelecida');
    
    // 2. Configurar associações
    setupAssociations();
    console.log('✓ Associações configuradas');
    
    // 3. Em desenvolvimento, sincronizar se necessário
    if (process.env.NODE_ENV === 'development') {
      // Usar alter: true apenas para ajustes pequenos
      await sequelize.sync({ alter: false });
      console.log('✓ Models verificados');
    }
    
    return {
      sequelize,
      User,
      RefreshToken,
      Category,
      Transaction,
      TaxRule,
      Setting
    };
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    throw error;
  }
};

// Exportar
module.exports = {
  initDatabase,
  sequelize,
  User,
  RefreshToken,
  Category,
  Transaction,
  TaxRule,
  Setting
};