// src/models/User.js - VERSÃO CORRIGIDA
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

class User extends Model {
  async validatePassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true,
    },
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // ❌ REMOVIDO: Campo virtual 'password' que causava duplicação
  // Isso será tratado apenas nos hooks
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      console.log('DEBUG: Hook beforeCreate executando para user:', user.email);
      
      // ⚠️ IMPORTANTE: O campo 'password' não existe mais no model
      // O auth.service.js deve passar 'password_hash' diretamente
      // Se por acaso vier 'password', convertemos
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password, salt);
      }
      
      // Garantir que password_hash existe
      if (!user.password_hash) {
        throw new Error('password_hash é obrigatório');
      }
    },
    beforeUpdate: async (user) => {
      // Atualizar hash apenas se password_hash foi alterado
      if (user.changed('password_hash') && user.password_hash) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
      }
    },
  },
});

module.exports = User;