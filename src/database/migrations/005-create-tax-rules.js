module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tax_rules', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      version: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      min_value: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      max_value: {
        type: Sequelize.DECIMAL(10, 2),
      },
      percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tax_rules');
  },
};