const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class TaxRule extends Model {}

TaxRule.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  min_value: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  max_value: {
    type: DataTypes.DECIMAL(10, 2),
  },
  percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 100,
    },
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  sequelize,
  modelName: 'TaxRule',
  tableName: 'tax_rules',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// ← AQUI DEVE SER EXPORT DIRETO, NÃO COMO OBJETO
module.exports = TaxRule;