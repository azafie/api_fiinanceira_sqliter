const sequelize = require('./src/config/database');

async function inspectTable() {
  try {
    console.log('🔍 INSPECIONANDO TABELA transactions\n');
    
    // 1. Obter SQL de criação da tabela
    const [tableInfo] = await sequelize.query(`
      SELECT sql FROM sqlite_master 
      WHERE type='table' AND name='transactions'
    `);
    
    console.log('📋 SQL DE CRIAÇÃO DA TABELA:');
    console.log(tableInfo[0].sql);
    
    // 2. Verificar informações da coluna type
    const [columns] = await sequelize.query('PRAGMA table_info(transactions)');
    
    console.log('\n📊 COLUNAS DA TABELA:');
    const typeColumn = columns.find(col => col.name === 'type');
    console.log('Coluna "type":', typeColumn);
    
    // 3. Verificar valores distintos
    const [distinctValues] = await sequelize.query(`
      SELECT DISTINCT type FROM transactions LIMIT 10
    `);
    
    console.log('\n🎯 VALORES DISTINTOS NA COLUNA type:');
    console.log(distinctValues.map(v => `  - "${v.type}"`).join('\n') || '  (tabela vazia)');
    
    // 4. Tentar inserir valor inválido diretamente no SQL
    console.log('\n🧪 TESTE DIRETO NO SQL:');
    try {
      await sequelize.query(`
        INSERT INTO transactions (user_id, description, amount, type, transaction_date)
        VALUES (999, 'Teste SQL', 100.00, 'OUTCOME', '2024-01-01')
      `);
      console.log('❌ SQL aceitou "OUTCOME" (problema!)');
      
      // Limpar
      await sequelize.query('DELETE FROM transactions WHERE user_id = 999');
    } catch (sqlError) {
      console.log('✅ SQL rejeitou "OUTCOME":', sqlError.message);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    process.exit(0);
  }
}

inspectTable();
