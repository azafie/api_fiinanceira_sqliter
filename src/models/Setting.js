const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Setting extends Model {
  static async getValue(key, defaultValue = null) {
    const setting = await this.findOne({ where: { key } });
    return setting ? setting.value : defaultValue;
  }

  static async setValue(key, value, description = null) {
    const [setting, created] = await this.findOrCreate({
      where: { key },
      defaults: { value, description },
    });
    
    if (!created) {
      setting.value = value;
      if (description) setting.description = description;
      await setting.save();
    }
    
    return setting;
  }
}

Setting.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  value: {
    type: DataTypes.TEXT,
  },
  description: {
    type: DataTypes.STRING(255),
  },
}, {
  sequelize,
  modelName: 'Setting',
  tableName: 'settings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// ← EXPORT DIRETO
module.exports = Setting;