#!/bin/bash
echo "🔧 RESOLVEDOR DE PROBLEMAS DA API"
echo "=========================================="

echo "Selecione o problema:"
echo "1. Servidor não inicia"
echo "2. Erro 'JWT_SECRET não configurado'"
echo "3. Banco de dados bloqueado/corrompido"
echo "4. Migrações falham"
echo "5. Autenticação não funciona"
echo "6. Todos os acima (limpeza completa)"
echo ""
read -p "Opção (1-6): " OPTION

case $OPTION in
    1)
        echo ""
        echo "🔄 RESOLVENDO: Servidor não inicia"
        echo "----------------------------------"
        
        # Verificar porta
        echo "1. Verificando porta 3000..."
        if lsof -ti:3000 > /dev/null; then
            echo "   ⚠️  Porta 3000 em uso. Matando processo..."
            kill -9 $(lsof -ti:3000) 2>/dev/null
            sleep 2
        fi
        
        # Verificar node_modules
        echo "2. Verificando dependências..."
        if [ ! -d "node_modules" ]; then
            echo "   📦 Instalando dependências..."
            npm install
        fi
        
        # Verificar .env
        echo "3. Verificando arquivo .env..."
        if [ ! -f ".env" ]; then
            echo "   📝 Criando .env de exemplo..."
            if [ -f ".env.example" ]; then
                cp .env.example .env
                echo "   ⚠️  ATENÇÃO: Edite o arquivo .env com JWT_SECRET"
            else
                echo "   ❌ .env.example não encontrado!"
                echo "   Crie um arquivo .env com:"
                echo "   NODE_ENV=development"
                echo "   PORT=3000"
                echo "   JWT_SECRET=sua_chave_secreta_aqui"
                echo "   DATABASE_PATH=./database.db"
            fi
        fi
        
        # Tentar iniciar
        echo "4. Tentando iniciar servidor..."
        echo "   Executando: npm run dev"
        echo ""
        echo "📢 Se ainda falhar, verifique:"
        echo "   - Erros no console acima"
        echo "   - Sintaxe dos arquivos: node -c src/server.js"
        echo "   - Permissões de arquivos"
        ;;
    
    2)
        echo ""
        echo "🔑 RESOLVENDO: JWT_SECRET não configurado"
        echo "----------------------------------------"
        
        # Gerar nova chave
        NEW_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
        
        echo "Nova chave JWT gerada:"
        echo "$NEW_SECRET"
        echo ""
        
        # Atualizar .env
        if [ -f ".env" ]; then
            if grep -q "JWT_SECRET=" .env; then
                sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=$NEW_SECRET|" .env
                echo "✅ JWT_SECRET atualizado no .env"
            else
                echo "JWT_SECRET=$NEW_SECRET" >> .env
                echo "✅ JWT_SECRET adicionado ao .env"
            fi
        else
            echo "❌ Arquivo .env não encontrado!"
            echo "Crie um arquivo .env com:"
            echo "JWT_SECRET=$NEW_SECRET"
            echo "NODE_ENV=development"
            echo "PORT=3000"
        fi
        
        echo ""
        echo "⚠️  REINICIE O SERVIDOR para aplicar a nova chave"
        ;;
    
    3)
        echo ""
        echo "🗄️ RESOLVENDO: Banco de dados bloqueado/corrompido"
        echo "-----------------------------------------------"
        
        DB_FILE="${DATABASE_PATH:-./database.db}"
        
        # Backup do banco atual
        if [ -f "$DB_FILE" ]; then
            BACKUP_FILE="database-backup-$(date +%Y%m%d-%H%M%S).db"
            cp "$DB_FILE" "$BACKUP_FILE"
            echo "✅ Backup criado: $BACKUP_FILE"
        fi
        
        # Matar processos SQLite
        echo "1. Verificando processos bloqueando o banco..."
        if command -v fuser &> /dev/null; then
            fuser -k "$DB_FILE" 2>/dev/null
        fi
        
        # Remover arquivos de lock/wal
        echo "2. Removendo arquivos de lock..."
        rm -f "$DB_FILE"-wal "$DB_FILE"-shm 2>/dev/null
        
        # Verificar integridade
        echo "3. Verificando integridade do banco..."
        if command -v sqlite3 &> /dev/null; then
            if sqlite3 "$DB_FILE" "PRAGMA integrity_check;" 2>/dev/null | grep -q "ok"; then
                echo "   ✅ Banco íntegro"
            else
                echo "   ⚠️  Problemas de integridade detectados"
                echo "   ↳ Considere restaurar do backup ou recriar"
            fi
        fi
        
        # Recriar se necessário
        echo ""
        echo "4. Opções disponíveis:"
        echo "   a) Manter banco atual (tentar consertar)"
        echo "   b) Recriar banco do zero (perde dados!)"
        echo "   c) Restaurar do backup"
        echo ""
        read -p "Escolha (a/b/c): " DB_CHOICE
        
        case $DB_CHOICE in
            b)
                echo "🗑️  Recriando banco do zero..."
                rm -f "$DB_FILE"
                npx sequelize-cli db:migrate --config config/cli.config.js
                echo "✅ Banco recriado"
                ;;
            c)
                if ls database-backup-*.db 1> /dev/null 2>&1; then
                    LATEST_BACKUP=$(ls -t database-backup-*.db | head -1)
                    echo "📥 Restaurando do backup: $LATEST_BACKUP"
                    cp "$LATEST_BACKUP" "$DB_FILE"
                    echo "✅ Backup restaurado"
                else
                    echo "❌ Nenhum backup encontrado!"
                fi
                ;;
            *)
                echo "ℹ️  Mantendo banco atual"
                ;;
        esac
        ;;
    
    4)
        echo ""
        echo "🔄 RESOLVENDO: Migrações falham"
        echo "-------------------------------"
        
        # Verificar status atual
        echo "1. Status atual das migrações:"
        npx sequelize-cli db:migrate:status --config config/cli.config.js
        
        echo ""
        echo "2. Opções:"
        echo "   a) Reverter última migração"
        echo "   b) Reverter todas as migrações"
        echo "   c) Executar migrações pendentes"
        echo "   d) Recriar tabela de migrações"
        echo ""
        read -p "Escolha (a/b/c/d): " MIG_CHOICE
        
        case $MIG_CHOICE in
            a)
                echo "↩️  Revertendo última migração..."
                npx sequelize-cli db:migrate:undo --config config/cli.config.js
                ;;
            b)
                echo "↩️  Revertendo TODAS as migrações..."
                npx sequelize-cli db:migrate:undo:all --config config/cli.config.js
                ;;
            c)
                echo "🚀 Executando migrações pendentes..."
                npx sequelize-cli db:migrate --config config/cli.config.js
                ;;
            d)
                echo "🆕 Recriando tabela de migrações..."
                sqlite3 "${DATABASE_PATH:-./database.db}" "DROP TABLE IF EXISTS sequelize_migrations;"
                npx sequelize-cli db:migrate --config config/cli.config.js
                ;;
        esac
        ;;
    
    5)
        echo ""
        echo "🔐 RESOLVENDO: Autenticação não funciona"
        echo "---------------------------------------"
        
        echo "1. Verificando problemas comuns..."
        
        # Verificar JWT_SECRET
        if ! grep -q "JWT_SECRET=" .env 2>/dev/null; then
            echo "   ❌ JWT_SECRET não configurado no .env"
            echo "   ↳ Execute: ./fix-problems.sh (opção 2)"
        else
            echo "   ✅ JWT_SECRET configurado"
        fi
        
        # Verificar hash duplicado no User model
        echo "2. Verificando User model..."
        if grep -q "DataTypes.VIRTUAL" src/models/User.js && grep -q "password_hash" src/models/User.js; then
            echo "   ⚠️  Possível hash duplicado detectado"
            echo "   ↳ Verifique se auth.service.js faz hash antes de User.create()"
        fi
        
        # Verificar tokens no banco
        echo "3. Verificando tokens no banco..."
        DB_FILE="${DATABASE_PATH:-./database.db}"
        if [ -f "$DB_FILE" ]; then
            TOKEN_COUNT=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM refresh_tokens WHERE revoked = 0;" 2>/dev/null || echo "0")
            echo "   Refresh tokens ativos: $TOKEN_COUNT"
        fi
        
        echo ""
        echo "🔧 SOLUÇÕES:"
        echo "   a) Limpar todos os tokens: DELETE FROM refresh_tokens"
        echo "   b) Verificar auth.service.js - método register"
        echo "   c) Testar com novo usuário: ./test-auth.sh"
        ;;
    
    6)
        echo ""
        echo "🧹 LIMPEZA COMPLETA DO SISTEMA"
        echo "-------------------------------"
        echo "Isso fará:"
        echo "1. Parar servidor Node.js"
        echo "2. Remover node_modules"
        echo "3. Remover banco de dados"
        echo "4. Limpar tokens JWT"
        echo ""
        read -p "Tem certeza? (s/n): " CONFIRM
        
        if [ "$CONFIRM" = "s" ]; then
            # Parar processos
            echo "1. Parando servidores..."
            pkill -f node 2>/dev/null
            sleep 2
            
            # Remover node_modules
            echo "2. Removendo node_modules..."
            rm -rf node_modules
            
            # Backup e remover banco
            echo "3. Lidando com banco de dados..."
            DB_FILE="${DATABASE_PATH:-./database.db}"
            if [ -f "$DB_FILE" ]; then
                BACKUP="database-backup-cleanup-$(date +%Y%m%d).db"
                cp "$DB_FILE" "$BACKUP"
                echo "   Backup criado: $BACKUP"
                rm -f "$DB_FILE"
            fi
            
            # Limpar arquivos de lock
            rm -f database.db-* 2>/dev/null
            
            # Reinstalar
            echo "4. Reinstalando dependências..."
            npm install
            
            # Recriar .env se necessário
            echo "5. Verificando configurações..."
            if [ ! -f ".env" ]; then
                cat > .env << ENV_EOF
NODE_ENV=development
PORT=3000
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
DATABASE_PATH=./database.db
ENV_EOF
                echo "   ✅ .env criado com nova chave JWT"
            fi
            
            # Executar migrações
            echo "6. Criando banco de dados..."
            npx sequelize-cli db:migrate --config config/cli.config.js
            
            echo ""
            echo "🎉 LIMPEZA COMPLETA CONCLUÍDA!"
            echo "✅ Sistema reinicializado"
            echo ""
            echo "🚀 PRÓXIMOS PASSOS:"
            echo "   1. Iniciar servidor: npm run dev"
            echo "   2. Testar: ./test-auth.sh"
        else
            echo "❌ Limpeza cancelada"
        fi
        ;;
    
    *)
        echo "❌ Opção inválida"
        ;;
esac

echo ""
echo "=========================================="
echo "🔧 Ações concluídas!"
echo ""
echo "💡 Dica: Sempre teste após resolver problemas:"
echo "   ./test-auth.sh"
