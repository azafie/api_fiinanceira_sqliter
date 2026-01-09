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
