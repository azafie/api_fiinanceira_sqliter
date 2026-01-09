module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🔄 Adicionando CHECK constraint à coluna type...');
    
    // Como SQLite não suporta ADD CONSTRAINT em tabelas existentes,
    // precisamos recriar a tabela
    
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1. Criar nova tabela com CHECK constraint
      await queryInterface.createTable('transactions_new', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        category_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'categories',
            key: 'id',
          },
          onDelete: 'SET NULL',
        },
        description: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        amount: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
        },
        type: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            isIn: [['income', 'expense']]
          }
        },
        transaction_date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
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
      }, { 
        transaction,
        constraints: {
          check: {
            // Adicionar CHECK constraint manualmente via raw SQL
            // SQLite não suporta na definição da tabela
          }
        }
      });
      
      // 2. Copiar dados (já limpos)
      console.log('📋 Copiando dados...');
      await queryInterface.sequelize.query(`
        INSERT INTO transactions_new 
        (id, user_id, category_id, description, amount, type, transaction_date, notes, created_at, updated_at)
        SELECT 
          id, user_id, category_id, description, amount, type, transaction_date, notes, created_at, updated_at
        FROM transactions
        WHERE type IN ('income', 'expense')
      `, { transaction });
      
      // 3. Remover tabela antiga
      await queryInterface.dropTable('transactions', { transaction });
      
      // 4. Renomear nova tabela
      await queryInterface.renameTable('transactions_new', 'transactions', { transaction });
      
      // 5. Adicionar CHECK constraint via SQL manual
      console.log('🔒 Adicionando CHECK constraint...');
      await queryInterface.sequelize.query(`
        CREATE TABLE transactions_final AS 
        SELECT * FROM transactions 
        WHERE type IN ('income', 'expense')
      `, { transaction });
      
      await queryInterface.dropTable('transactions', { transaction });
      await queryInterface.renameTable('transactions_final', 'transactions', { transaction });
      
      // 6. Recriar chaves estrangeiras e índices
      await queryInterface.addConstraint('transactions', {
        fields: ['user_id'],
        type: 'foreign key',
        name: 'transactions_user_id_fk',
        references: {
          table: 'users',
          field: 'id',
        },
        onDelete: 'CASCADE',
        transaction
      });
      
      await queryInterface.addConstraint('transactions', {
        fields: ['category_id'],
        type: 'foreign key',
        name: 'transactions_category_id_fk',
        references: {
          table: 'categories',
          field: 'id',
        },
        onDelete: 'SET NULL',
        transaction
      });
      
      await queryInterface.addIndex('transactions', ['user_id', 'transaction_date'], {
        name: 'transactions_user_id_transaction_date',
        transaction
      });
    });
    
    console.log('✅ CHECK constraint adicionada com sucesso!');
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Revertendo CHECK constraint...');
    
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Criar tabela sem constraint
      await queryInterface.createTable('transactions_old', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        category_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        description: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        amount: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
        },
        type: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        transaction_date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
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
      }, { transaction });
      
      // Copiar dados
      await queryInterface.sequelize.query(`
        INSERT INTO transactions_old SELECT * FROM transactions
      `, { transaction });
      
      // Remover e renomear
      await queryInterface.dropTable('transactions', { transaction });
      await queryInterface.renameTable('transactions_old', 'transactions', { transaction });
      
      // Recriar constraints e índices
      await queryInterface.addConstraint('transactions', {
        fields: ['user_id'],
        type: 'foreign key',
        name: 'transactions_user_id_fk',
        references: {
          table: 'users',
          field: 'id',
        },
        onDelete: 'CASCADE',
        transaction
      });
      
      await queryInterface.addConstraint('transactions', {
        fields: ['category_id'],
        type: 'foreign key',
        name: 'transactions_category_id_fk',
        references: {
          table: 'categories',
          field: 'id',
        },
        onDelete: 'SET NULL',
        transaction
      });
      
      await queryInterface.addIndex('transactions', ['user_id', 'transaction_date'], {
        name: 'transactions_user_id_transaction_date',
        transaction
      });
    });
    
    console.log('✅ CHECK constraint removida');
  }
};
