const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

class SimpleUser extends Model {}

SimpleUser.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'SimpleUser',
  tableName: 'users',
  timestamps: true,
});

// Método estático para criar com hash
SimpleUser.createWithPassword = async function(data) {
  if (data.password) {
    const salt = await bcrypt.genSalt(10);
    data.password_hash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }
  return await this.create(data);
};

// Método de instância para validar
SimpleUser.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

module.exports = SimpleUser;