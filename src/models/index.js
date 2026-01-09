const sequelize = require('../config/database');

// Importar todos os models
const User = require('./User');
const RefreshToken = require('./RefreshToken');
const Category = require('./Category');
const Transaction = require('./Transaction');
const TaxRule = require('./TaxRule');
const Setting = require('./Setting');

// Importar função de associações
const setupAssociations = require('./associations');

// Configurar associações
setupAssociations();

// Exportar tudo
module.exports = {
  sequelize,
  User,
  RefreshToken,
  Category,
  Transaction,
  TaxRule,
  Setting,
  setupAssociations,
};
