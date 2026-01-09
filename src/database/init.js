const sequelize = require('../config/database');
const setupAssociations = require('../models/associations');

let isInitialized = false;

const initDatabase = async () => {
  if (isInitialized) {
    return sequelize;
  }
  
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Inicializando banco...');
    }
    
    await sequelize.authenticate();
    setupAssociations();
    
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
    }
    
    isInitialized = true;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Banco pronto');
    }
    
    return sequelize;
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  }
};

module.exports = {
  initDatabase,
  sequelize
};
