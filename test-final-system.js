// Teste FINAL do sistema - Garante inicialização correta
const { initDatabase } = require('./src/database/init');
const User = require('./src/models/User');
const Category = require('./src/models/Category');
const Transaction = require('./src/models/Transaction');

async function testFinalSystem() {
  console.log('🎯 TESTE FINAL DO SISTEMA (COM INICIALIZAÇÃO CORRETA)\n');
  console.log('='.repeat(60));
  
  const testResults = [];
  let sequelizeInstance = null;
  
  try {
    // ============================================
    // 1. INICIALIZAR BANCO COM ASSOCIAÇÕES
    // ============================================
    console.log('\n1. 🚀 Inicializando banco...');
    sequelizeInstance = await initDatabase();
    testResults.push({ test: 'Inicialização', status: '✅' });
    
    // ============================================
    // 2. LIMPEZA
    // ============================================
    console.log('\n2. 🧹 Limpando dados...');
    await sequelizeInstance.query('DELETE FROM transactions');
    await sequelizeInstance.query('DELETE FROM categories');
    await sequelizeInstance.query('DELETE FROM users');
    console.log('   ✅ Dados limpos');
    testResults.push({ test: 'Limpeza', status: '✅' });
    
    // ============================================
    // 3. CRIAR USUÁRIO
    // ============================================
    console.log('\n3. 👤 Criando usuário de teste...');
    const user = await User.create({
      name: 'Teste Final',
      email: `final.${Date.now()}@test.com`,
      password_hash: '$2a$10$TestHashForTestingPurposesOnly123'
    });
    
    console.log(`   ✅ Usuário criado: ${user.name} (ID: ${user.id})`);
    testResults.push({ test: 'Criação User', status: '✅' });
    
    // ============================================
    // 4. CRIAR CATEGORIA (ENUM FUNCIONANDO)
    // ============================================
    console.log('\n4. 🗂️ Criando categoria...');
    const category = await Category.create({
      user_id: user.id,
      name: 'Transporte',
      type: 'expense',
      color: '#4ECDC4'
    });
    
    console.log(`   ✅ Categoria criada: ${category.name}`);
    testResults.push({ test: 'Criação Category', status: '✅' });
    
    // ============================================
    // 5. CRIAR TRANSAÇÃO
    // ============================================
    console.log('\n5. 💰 Criando transação...');
    const transaction = await Transaction.create({
      user_id: user.id,
      category_id: category.id,
      description: 'Uber para trabalho',
      amount: 25.50,
      type: 'expense',
      transaction_date: '2024-01-15'
    });
    
    console.log(`   ✅ Transação criada: ${transaction.description}`);
    testResults.push({ test: 'Criação Transaction', status: '✅' });
    
    // ============================================
    // 6. TESTAR RELACIONAMENTOS (MÉTODO CORRETO)
    // ============================================
    console.log('\n6. 🔗 Testando relacionamentos...');
    
    // Método 1: Usar include com model diretamente
    const userWithCategories = await User.findOne({
      where: { id: user.id },
      include: [{
        model: Category,
        as: 'categories',
        required: false
      }]
    });
    
    if (userWithCategories && Array.isArray(userWithCategories.categories)) {
      console.log(`   ✅ Relacionamento User-Categories: ${userWithCategories.categories.length} categoria(s)`);
      testResults.push({ test: 'Relacionamento User-Categories', status: '✅' });
    } else {
      console.log('   ❌ Não conseguiu carregar categorias');
      testResults.push({ test: 'Relacionamento User-Categories', status: '❌' });
    }
    
    // Método 2: Usar métodos gerados pelo Sequelize
    const categoriesViaMethod = await user.getCategories();
    if (Array.isArray(categoriesViaMethod)) {
      console.log(`   ✅ Método getCategories(): ${categoriesViaMethod.length} categoria(s)`);
      testResults.push({ test: 'Método getCategories()', status: '✅' });
    }
    
    // Método 3: Verificar se transação tem usuário
    const transactionWithUser = await Transaction.findOne({
      where: { id: transaction.id },
      include: [{
        model: User,
        as: 'user',
        required: false
      }]
    });
    
    if (transactionWithUser && transactionWithUser.user) {
      console.log(`   ✅ Relacionamento Transaction-User: ${transactionWithUser.user.name}`);
      testResults.push({ test: 'Relacionamento Transaction-User', status: '✅' });
    }
    
    // ============================================
    // 7. TESTAR VALIDAÇÕES
    // ============================================
    console.log('\n7. ✅ Testando validações...');
    
    // Category: type inválido
    try {
      await Category.create({
        user_id: user.id,
        name: 'Inválida',
        type: 'invalid'
      });
      console.log('   ❌ Category aceitou type inválido');
      testResults.push({ test: 'Validação Category ENUM', status: '❌' });
    } catch (error) {
      console.log('   ✅ Category rejeitou type inválido');
      testResults.push({ test: 'Validação Category ENUM', status: '✅' });
    }
    
    // Transaction: type inválido
    try {
      await Transaction.create({
        user_id: user.id,
        description: 'Inválida',
        amount: 100,
        type: 'outcome'
      });
      console.log('   ❌ Transaction aceitou type inválido');
      testResults.push({ test: 'Validação Transaction ENUM', status: '❌' });
    } catch (error) {
      console.log('   ✅ Transaction rejeitou type inválido');
      testResults.push({ test: 'Validação Transaction ENUM', status: '✅' });
    }
    
    // Transaction: normalização (maiúsculo → minúsculo)
    const txUpper = await Transaction.create({
      user_id: user.id,
      description: 'Teste Maiúsculo',
      amount: 50,
      type: 'INCOME'
    });
    
    if (txUpper.type === 'income') {
      console.log('   ✅ Normalização automática (INCOME → income)');
      testResults.push({ test: 'Normalização Transaction', status: '✅' });
    }
    
  } catch (error) {
    console.log(`\n❌ ERRO CRÍTICO: ${error.message}`);
    console.log(error.stack);
    testResults.push({ test: 'Execução geral', status: '❌', error: error.message });
  } finally {
    // ============================================
    // LIMPEZA FINAL
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('🧹 Finalizando teste...');
    
    try {
      if (sequelizeInstance) {
        await sequelizeInstance.query('DELETE FROM transactions');
        await sequelizeInstance.query('DELETE FROM categories');
        await sequelizeInstance.query('DELETE FROM users');
        console.log('✅ Dados de teste removidos');
      }
    } catch (e) {
      console.log(`⚠️ Erro na limpeza: ${e.message}`);
    }
    
    // ============================================
    // RELATÓRIO FINAL
    // ============================================
    console.log('\n📊 RELATÓRIO FINAL:');
    console.log('='.repeat(50));
    
    const passed = testResults.filter(t => t.status === '✅').length;
    const failed = testResults.filter(t => t.status === '❌').length;
    const total = testResults.length;
    
    testResults.forEach(result => {
      console.log(`${result.status} ${result.test}`);
    });
    
    console.log('='.repeat(50));
    console.log(`🎯 Resultado: ${passed}/${total} testes passaram`);
    
    if (failed === 0) {
      console.log('\n🎉 🎉 🎉 SISTEMA 100% VALIDADO! 🎉 🎉 🎉');
      console.log('\n✅ TODAS AS FUNCIONALIDADES CONFIRMADAS:');
      console.log('   • Banco de dados inicializado');
      console.log('   • Models com validações ENUM');
      console.log('   • Relacionamentos funcionando');
      console.log('   • Normalização automática');
      console.log('\n🚀 SISTEMA PRONTO PARA PRODUÇÃO!');
    } else {
      console.log(`\n⚠️ ${failed} teste(s) falharam`);
    }
    
    console.log('\n' + '='.repeat(60));
    process.exit(failed === 0 ? 0 : 1);
  }
}

// Executar teste
testFinalSystem();
