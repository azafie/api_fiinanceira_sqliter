const sequelize = require('../config/database');
const fs = require('fs');
const path = require('path');

const runMigrations = async () => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('🔧 Executando migrações individuais...');
    
    // Ordem das migrações
    const migrations = [
      '001-create-users.js',
      '002-create-refresh-tokens.js',
      '003-create-categories.js',
      '004-create-transactions.js',
      '005-create-tax-rules.js',
      '006-create-settings.js'
    ];
    
    for (const migrationFile of migrations) {
      const migrationPath = path.join(__dirname, 'migrations', migrationFile);
      
      if (fs.existsSync(migrationPath)) {
        const migration = require(migrationPath);
        await migration.up(queryInterface, Sequelize);
        console.log(`✓ ${migrationFile} executada`);
      }
    }
    
    await transaction.commit();
    console.log('✅ Todas as migrações executadas com sucesso!');
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erro nas migrações:', error);
    throw error;
  }
};

module.exports = runMigrations;