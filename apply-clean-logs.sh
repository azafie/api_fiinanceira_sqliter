#!/bin/bash

echo "🔧 Aplicando configurações para logs limpos..."

# 1. database/init.js
cat > src/database/init.js << 'INIT_EOF'
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
INIT_EOF
echo "✅ src/database/init.js atualizado"

# 2. models/associations.js
cat > src/models/associations.js << 'ASSOC_EOF'
const User = require('./User');
const RefreshToken = require('./RefreshToken');
const Category = require('./Category');
const Transaction = require('./Transaction');

let associationsConfigured = false;

const setupAssociations = () => {
  if (associationsConfigured) return;
  
  try {
    User.hasMany(RefreshToken, { 
      foreignKey: 'user_id', 
      as: 'refreshTokens',
      onDelete: 'CASCADE'
    });
    RefreshToken.belongsTo(User, { 
      foreignKey: 'user_id', 
      as: 'user'
    });

    User.hasMany(Category, { 
      foreignKey: 'user_id', 
      as: 'categories',
      onDelete: 'CASCADE'
    });
    Category.belongsTo(User, { 
      foreignKey: 'user_id', 
      as: 'user'
    });

    User.hasMany(Transaction, { 
      foreignKey: 'user_id', 
      as: 'transactions',
      onDelete: 'CASCADE'
    });
    Transaction.belongsTo(User, { 
      foreignKey: 'user_id', 
      as: 'user'
    });

    Category.hasMany(Transaction, { 
      foreignKey: 'category_id', 
      as: 'transactions',
      onDelete: 'SET NULL'
    });
    Transaction.belongsTo(Category, { 
      foreignKey: 'category_id', 
      as: 'category'
    });

    associationsConfigured = true;
    
  } catch (error) {
    console.error('❌ Erro nas associações:', error.message);
    throw error;
  }
};

module.exports = setupAssociations;
ASSOC_EOF
echo "✅ src/models/associations.js atualizado"

# 3. config/database.js
cat > src/config/database.js << 'DB_EOF'
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DATABASE_PATH || './database.db',
  logging: false,  // Desativa logs SQL
  define: {
    timestamps: true,
    underscored: true,
  },
});

module.exports = sequelize;
DB_EOF
echo "✅ src/config/database.js atualizado"

# 4. server.js
cat > src/server.js << 'SERVER_EOF'
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(\`🚀 Servidor rodando na porta \${PORT}\`);
  console.log(\`📁 Ambiente: \${process.env.NODE_ENV}\`);
  console.log(\`🔗 Health check: http://localhost:\${PORT}/health\`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('\\n📋 Endpoints:');
    console.log('  POST /api/auth/register');
    console.log('  POST /api/auth/login');
    console.log('  POST /api/auth/refresh');
    console.log('  POST /api/auth/logout');
    console.log('  GET  /api/auth/profile');
  }
});
SERVER_EOF
echo "✅ src/server.js atualizado"

echo "\\n🎉 Todas as configurações aplicadas!"
echo "🚀 Reinicie o servidor: npm run dev"
