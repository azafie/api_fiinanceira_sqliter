const sequelize = require('./src/config/database');

async function cleanup() {
  try {
    console.log('🧹 LIMPANDO DADOS CORROMPIDOS\n');
    
    // Verificar quantos registros inválidos existem
    const [invalid] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM transactions 
      WHERE LOWER(type) NOT IN ('income', 'expense')
    `);
    
    console.log(`📊 Registros com type inválido: ${invalid[0].count}`);
    
    if (invalid[0].count > 0) {
      // Mostrar exemplos
      const [examples] = await sequelize.query(`
        SELECT DISTINCT type 
        FROM transactions 
        WHERE LOWER(type) NOT IN ('income', 'expense')
        LIMIT 5
      `);
      
      console.log('📋 Valores inválidos encontrados:');
      examples.forEach(ex => console.log(`  - "${ex.type}"`));
      
      // Corrigir registros inválidos (converter para 'expense')
      const [updated] = await sequelize.query(`
        UPDATE transactions 
        SET type = 'expense'
        WHERE LOWER(type) NOT IN ('income', 'expense')
      `);
      
      console.log(`\n✅ ${updated} registros corrigidos para 'expense'`);
    } else {
      console.log('✅ Nenhum registro inválido encontrado');
    }
    
    // Verificar resultado final
    const [finalCheck] = await sequelize.query(`
      SELECT type, COUNT(*) as count 
      FROM transactions 
      GROUP BY type
    `);
    
    console.log('\n🎯 DISTRIBUIÇÃO FINAL:');
    finalCheck.forEach(row => {
      console.log(`  - "${row.type}": ${row.count} registros`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    process.exit(0);
  }
}

cleanup();
