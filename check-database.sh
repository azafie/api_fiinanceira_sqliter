#!/bin/bash
echo "🗄️ VERIFICADOR DO BANCO DE DADOS"
echo "=========================================="

# Verificar se arquivo do banco existe
DB_FILE="${DATABASE_PATH:-./database.db}"
echo "1. Verificando arquivo do banco: $DB_FILE"

if [ ! -f "$DB_FILE" ]; then
    echo "❌ ERRO: Arquivo do banco não encontrado!"
    echo "   ↳ Execute migrações: npx sequelize-cli db:migrate --config config/cli.config.js"
    echo "   ↳ Verifique DATABASE_PATH no .env"
    exit 1
fi
echo "✅ Arquivo do banco encontrado"

# Verificar tamanho do banco
DB_SIZE=$(stat -f%z "$DB_FILE" 2>/dev/null || stat -c%s "$DB_FILE" 2>/dev/null)
echo "   Tamanho: $((DB_SIZE / 1024)) KB"

# Verificar se SQLite pode acessar
if ! sqlite3 "$DB_FILE" "SELECT 1;" 2>/dev/null; then
    echo "❌ ERRO: Não consegue acessar banco SQLite!"
    echo "   ↳ Banco pode estar corrompido"
    echo "   ↳ Permissões incorretas"
    exit 1
fi
echo "✅ Banco acessível via SQLite"

# Verificar tabelas
echo ""
echo "2. 📊 Verificando tabelas no banco..."
TABLES=$(sqlite3 "$DB_FILE" ".tables")

REQUIRED_TABLES=("users" "refresh_tokens" "categories" "transactions" "tax_rules" "settings")
MISSING_TABLES=()

for table in "${REQUIRED_TABLES[@]}"; do
    if ! echo "$TABLES" | grep -q "\b$table\b"; then
        MISSING_TABLES+=("$table")
    fi
done

if [ ${#MISSING_TABLES[@]} -gt 0 ]; then
    echo "❌ TABELAS FALTANDO: ${MISSING_TABLES[*]}"
    echo "   ↳ Execute as migrações: npm run migrate"
    echo "   ↳ Verifique arquivos em src/database/migrations/"
    exit 1
else
    echo "✅ Todas as tabelas necessárias presentes"
fi

# Verificar estrutura de tabelas importantes
echo ""
echo "3. 🔍 Verificando estrutura das tabelas..."
echo "   a) Tabela 'users':"
if sqlite3 "$DB_FILE" "PRAGMA table_info(users);" | grep -q "email"; then
    echo "      ✅ Coluna 'email' existe"
else
    echo "      ❌ Coluna 'email' NÃO existe!"
fi

echo "   b) Tabela 'transactions':"
if sqlite3 "$DB_FILE" "PRAGMA table_info(transactions);" | grep -q "type"; then
    COL_TYPE=$(sqlite3 "$DB_FILE" "PRAGMA table_info(transactions);" | grep "type" | awk -F'|' '{print $3}')
    echo "      ✅ Coluna 'type' existe (tipo: $COL_TYPE)"
    
    # Verificar se tem CHECK constraint
    if sqlite3 "$DB_FILE" ".schema transactions" | grep -qi "check.*type.*income.*expense"; then
        echo "      ✅ CHECK constraint para ENUM presente"
    else
        echo "      ⚠️  CHECK constraint não encontrada"
    fi
else
    echo "      ❌ Coluna 'type' NÃO existe!"
fi

# Verificar dados de exemplo
echo ""
echo "4. 📈 Verificando dados existentes..."
for table in users categories transactions; do
    COUNT=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM $table;" 2>/dev/null || echo "0")
    echo "   - $table: $COUNT registros"
done

# Verificar índices
echo ""
echo "5. 🗂️ Verificando índices..."
if sqlite3 "$DB_FILE" ".schema transactions" | grep -q "INDEX.*user_id.*transaction_date"; then
    echo "   ✅ Índice composto em transactions existe"
else
    echo "   ⚠️  Índice composto em transactions NÃO encontrado"
    echo "   ↳ Performance pode ser afetada"
fi

# Verificar foreign keys
echo ""
echo "6. 🔗 Verificando chaves estrangeiras..."
if sqlite3 "$DB_FILE" "PRAGMA foreign_key_list(transactions);" | grep -q "user_id"; then
    echo "   ✅ Foreign key users→transactions configurada"
else
    echo "   ⚠️  Foreign key users→transactions NÃO configurada"
fi

echo ""
echo "=========================================="
echo "🎉 VERIFICAÇÃO DO BANCO COMPLETA!"
echo ""
if [ ${#MISSING_TABLES[@]} -eq 0 ]; then
    echo "✅ BANCO DE DADOS INTEGRO E FUNCIONAL"
    echo ""
    echo "💡 COMANDOS ÚTEIS:"
    echo "   Backup: cp database.db database-backup-$(date +%Y%m%d).db"
    echo "   Ver migrações: npx sequelize-cli db:migrate:status"
    echo "   Executar migrações: npm run migrate"
else
    echo "⚠️  PROBLEMAS ENCONTRADOS"
    echo "   Corrija os itens listados acima"
fi
