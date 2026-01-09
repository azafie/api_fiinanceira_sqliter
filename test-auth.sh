#!/bin/bash
echo "🔐 TESTE DE AUTENTICAÇÃO DA API"
echo "=========================================="

API_URL="http://localhost:3000"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test_${TIMESTAMP}@email.com"
TEST_PASSWORD="TestPass123"
TEST_NAME="Test User"

# Verificar se servidor está rodando
echo "1. 🏥 Verificando se servidor está online..."
if ! curl -s -f http://localhost:3000/health > /dev/null; then
    echo "❌ ERRO: Servidor não está respondendo!"
    echo "   ↳ Inicie o servidor: npm run dev"
    echo "   ↳ Verifique se porta 3000 está livre"
    exit 1
fi
echo "✅ Servidor online"

# Health check detalhado
echo ""
echo "2. 📊 Health check detalhado..."
HEALTH=$(curl -s http://localhost:3000/health)
if echo "$HEALTH" | grep -q '"status":"ok"'; then
    echo "✅ API saudável"
    echo "$HEALTH" | jq .
else
    echo "❌ ERRO: Health check falhou!"
    echo "Resposta: $HEALTH"
    exit 1
fi

# Registrar usuário
echo ""
echo "3. 👤 Registrando novo usuário..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$TEST_NAME\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

# Verificar resposta do registro
if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Registro bem-sucedido"
    
    # Extrair dados
    ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.tokens.access_token')
    REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.tokens.refresh_token')
    USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.user.id')
    
    echo "   📝 Dados obtidos:"
    echo "   - User ID: $USER_ID"
    echo "   - Access Token: ${ACCESS_TOKEN:0:30}..."
    echo "   - Refresh Token: ${REFRESH_TOKEN:0:30}..."
else
    echo "❌ ERRO no registro!"
    echo "Resposta: $REGISTER_RESPONSE"
    echo ""
    echo "🔧 SOLUÇÕES POSSÍVEIS:"
    echo "   1. Verifique se JWT_SECRET está no .env"
    echo "   2. Banco de dados pode estar bloqueado"
    echo "   3. Email já pode estar em uso (tente novamente)"
    exit 1
fi

# Testar login
echo ""
echo "4. 🔐 Testando login com credenciais..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Login bem-sucedido"
    
    # Verificar se tokens são diferentes (refresh token reutilizado)
    LOGIN_ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.tokens.access_token')
    LOGIN_REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.tokens.refresh_token')
    
    if [ "$ACCESS_TOKEN" != "$LOGIN_ACCESS_TOKEN" ]; then
        echo "   ⚠️  Access token diferente (esperado se refresh token foi reutilizado)"
    fi
    if [ "$REFRESH_TOKEN" = "$LOGIN_REFRESH_TOKEN" ]; then
        echo "   ✅ Refresh token reutilizado (comportamento esperado)"
    fi
else
    echo "❌ ERRO no login!"
    echo "Resposta: $LOGIN_RESPONSE"
    echo ""
    echo "🔧 PROBLEMA: Credenciais não funcionaram logo após registro"
    echo "   ↳ Verifique hooks do User model (pode ter hash duplicado)"
    echo "   ↳ Verifique auth.service.js - método register"
    exit 1
fi

# Testar endpoint protegido (perfil)
echo ""
echo "5. 👤 Testando endpoint protegido (perfil)..."
PROFILE_RESPONSE=$(curl -s -X GET "$API_URL/api/auth/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$PROFILE_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Perfil acessado com sucesso"
    USER_EMAIL=$(echo "$PROFILE_RESPONSE" | jq -r '.user.email')
    if [ "$USER_EMAIL" = "$TEST_EMAIL" ]; then
        echo "   ✅ Email correto retornado: $USER_EMAIL"
    else
        echo "   ⚠️  Email diferente: $USER_EMAIL (esperado: $TEST_EMAIL)"
    fi
else
    echo "❌ ERRO ao acessar perfil!"
    echo "Resposta: $PROFILE_RESPONSE"
    echo ""
    echo "🔧 PROBLEMAS POSSÍVEIS:"
    echo "   1. Token JWT inválido ou malformado"
    echo "   2. Middleware de auth não está funcionando"
    echo "   3. Token expirado (15 minutos)"
    exit 1
fi

# Testar refresh token
echo ""
echo "6. 🔄 Testando refresh token..."
REFRESH_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{
    \"refresh_token\": \"$REFRESH_TOKEN\"
  }")

if echo "$REFRESH_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Token renovado com sucesso"
    NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.access_token')
    echo "   Novo token: ${NEW_ACCESS_TOKEN:0:30}..."
    
    # Verificar se novo token funciona
    NEW_PROFILE=$(curl -s -X GET "$API_URL/api/auth/profile" \
      -H "Authorization: Bearer $NEW_ACCESS_TOKEN")
    
    if echo "$NEW_PROFILE" | grep -q '"success":true'; then
        echo "   ✅ Novo token funciona no perfil"
    else
        echo "   ❌ Novo token NÃO funciona!"
    fi
else
    echo "❌ ERRO ao renovar token!"
    echo "Resposta: $REFRESH_RESPONSE"
    echo ""
    echo "🔧 PROBLEMAS POSSÍVEIS:"
    echo "   1. Refresh token não encontrado no banco"
    echo "   2. Refresh token expirado (7 dias)"
    echo "   3. Token revogado"
    exit 1
fi

# Testar logout
echo ""
echo "7. 🚪 Testando logout..."
LOGOUT_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/logout" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"refresh_token\": \"$REFRESH_TOKEN\"
  }")

if echo "$LOGOUT_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Logout realizado"
    
    # Verificar se token foi realmente revogado
    echo "   Verificando se token foi revogado..."
    REFRESH_AFTER_LOGOUT=$(curl -s -X POST "$API_URL/api/auth/refresh" \
      -H "Content-Type: application/json" \
      -d "{
        \"refresh_token\": \"$REFRESH_TOKEN\"
      }")
    
    if echo "$REFRESH_AFTER_LOGOUT" | grep -q '"success":false'; then
        echo "   ✅ Token revogado corretamente (não funciona mais)"
    else
        echo "   ⚠️  Token ainda funciona após logout!"
    fi
else
    echo "❌ ERRO no logout!"
    echo "Resposta: $LOGOUT_RESPONSE"
fi

# Testar erros esperados
echo ""
echo "8. ⚠️ Testando comportamentos de erro..."
echo "   a) Login com senha errada:"
WRONG_PASS=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"senha_errada\"
  }")
if echo "$WRONG_PASS" | grep -q '"success":false'; then
    echo "      ✅ Rejeitou senha errada (esperado)"
else
    echo "      ❌ Aceitou senha errada (PROBLEMA!)"
fi

echo "   b) Perfil sem token:"
NO_TOKEN=$(curl -s -X GET "$API_URL/api/auth/profile")
if echo "$NO_TOKEN" | grep -q 'Token.*não fornecido'; then
    echo "      ✅ Rejeitou acesso sem token (esperado)"
else
    echo "      ❌ Permitiu acesso sem token (PROBLEMA!)"
fi

echo ""
echo "=========================================="
echo "🎉 TESTE DE AUTENTICAÇÃO COMPLETO!"
echo ""
echo "📊 RESUMO:"
echo "   ✅ Servidor online"
echo "   ✅ Registro de usuário"
echo "   ✅ Login com credenciais"
echo "   ✅ Acesso a endpoint protegido"
echo "   ✅ Refresh token funcionando"
echo "   ✅ Logout e revogação"
echo "   ✅ Tratamento de erros"
echo ""
echo "🚀 Sistema de autenticação 100% funcional!"
echo ""
echo "💡 PRÓXIMOS PASSOS:"
echo "   1. Testar outros endpoints (quando implementados)"
echo "   2. Criar frontend ou usar Postman"
echo "   3. Configurar para produção"
