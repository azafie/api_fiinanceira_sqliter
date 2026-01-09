#!/bin/bash
echo "🔍 VERIFICADOR DO SISTEMA FINANCE-API"
echo "=========================================="

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ ERRO: package.json não encontrado!"
    echo "   ↳ Execute este comando na pasta raiz do projeto"
    exit 1
fi

echo "✅ Está na pasta correta do projeto"

# Verificar Node.js
NODE_VERSION=$(node --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Node.js encontrado: $NODE_VERSION"
else
    echo "❌ ERRO: Node.js não instalado!"
    echo "   ↳ Instale Node.js: https://nodejs.org/"
    exit 1
fi

# Verificar NPM
NPM_VERSION=$(npm --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ NPM encontrado: v$NPM_VERSION"
else
    echo "❌ ERRO: NPM não funciona!"
    echo "   ↳ Reinstale Node.js"
    exit 1
fi

# Verificar dependências
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules não encontrado"
    echo "   ↳ Execute: npm install"
    exit 1
else
    echo "✅ Dependências instaladas"
fi

# Verificar arquivo .env
if [ ! -f ".env" ]; then
    echo "❌ ERRO: Arquivo .env não encontrado!"
    echo "   ↳ Copie .env.example para .env: cp .env.example .env"
    echo "   ↳ Edite .env com suas configurações"
    exit 1
else
    echo "✅ Arquivo .env encontrado"
    
    # Verificar variáveis críticas
    REQUIRED_VARS=("NODE_ENV" "JWT_SECRET" "PORT")
    MISSING_VARS=()
    
    for var in "${REQUIRED_VARS[@]}"; do
        if ! grep -q "^$var=" .env; then
            MISSING_VARS+=("$var")
        fi
    done
    
    if [ ${#MISSING_VARS[@]} -gt 0 ]; then
        echo "❌ Variáveis faltando no .env: ${MISSING_VARS[*]}"
        echo "   ↳ Adicione estas variáveis ao arquivo .env"
        exit 1
    else
        echo "✅ Variáveis críticas configuradas"
    fi
fi

# Verificar estrutura do projeto
REQUIRED_DIRS=("src/config" "src/models" "src/modules/auth")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "❌ ERRO: Diretório faltando: $dir"
        echo "   ↳ Estrutura do projeto corrompida"
        exit 1
    fi
done
echo "✅ Estrutura do projeto OK"

# Verificar arquivos essenciais
ESSENTIAL_FILES=(
    "src/config/database.js"
    "src/models/User.js"
    "src/models/associations.js"
    "src/app.js"
    "src/server.js"
)

MISSING_FILES=()
for file in "${ESSENTIAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo "❌ Arquivos essenciais faltando:"
    for file in "${MISSING_FILES[@]}"; do
        echo "   - $file"
    done
    echo "   ↳ Recupere os arquivos do backup ou recrie o projeto"
    exit 1
else
    echo "✅ Arquivos essenciais presentes"
fi

# Verificar sintaxe dos arquivos JavaScript
echo ""
echo "📄 Verificando sintaxe dos arquivos..."
ERRORS=()

for file in "${ESSENTIAL_FILES[@]}"; do
    if node -c "$file" 2>/dev/null; then
        echo "   ✅ $file: Sintaxe OK"
    else
        ERRORS+=("$file")
        echo "   ❌ $file: Erro de sintaxe!"
    fi
done

if [ ${#ERRORS[@]} -gt 0 ]; then
    echo ""
    echo "❌ ERROS DE SINTAXE ENCONTRADOS!"
    echo "   ↳ Corrija os arquivos listados acima"
    exit 1
fi

echo ""
echo "=========================================="
echo "🎉 SISTEMA VERIFICADO COM SUCESSO!"
echo ""
echo "✅ PRÓXIMOS PASSOS:"
echo "   1. Iniciar servidor: npm run dev"
echo "   2. Testar API: curl http://localhost:3000/health"
echo "   3. Registrar usuário: usar comando test-auth.sh"
echo ""
echo "🚀 Tudo pronto para começar!"
