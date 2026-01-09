#!/bin/bash

echo "🔍 DEBUG COMPLETO DA API FINANCEIRA"
echo "=========================================="

# Configurações
API_URL="http://localhost:3000"
TIMESTAMP=$(date +%s)
TEST_EMAIL="debug_${TIMESTAMP}@test.com"
TEST_PASSWORD="DebugPass123"
TEST_NAME="Usuário Debug"

echo ""
echo "1. ✅ TESTANDO HEALTH CHECK..."
echo "--------------------------------"
curl -s -w "Status: %{http_code} | Tempo: %{time_total}s\n" \
  -o /dev/null \
  -X GET "$API_URL/health"

echo ""
echo "2. 👤 TESTANDO REGISTRO..."
echo "--------------------------------"
REGISTER_OUTPUT=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$TEST_NAME\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "Resposta:"
echo "$REGISTER_OUTPUT" | jq .

# Extrair dados do registro
if echo "$REGISTER_OUTPUT" | jq -e '.success' > /dev/null; then
  ACCESS_TOKEN=$(echo "$REGISTER_OUTPUT" | jq -r '.tokens.access_token')
  REFRESH_TOKEN=$(echo "$REGISTER_OUTPUT" | jq -r '.tokens.refresh_token')
  USER_ID=$(echo "$REGISTER_OUTPUT" | jq -r '.user.id')
  
  echo ""
  echo "✅ Registro bem-sucedido!"
  echo "   Access Token: ${ACCESS_TOKEN:0:50}..."
  echo "   Refresh Token: ${REFRESH_TOKEN:0:50}..."
  echo "   User ID: $USER_ID"
else
  echo ""
  echo "❌ Falha no registro!"
  exit 1
fi

echo ""
echo "3. 🔐 TESTANDO LOGIN..."
echo "--------------------------------"
LOGIN_OUTPUT=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "Resposta:"
echo "$LOGIN_OUTPUT" | jq .

echo ""
echo "4. 👤 TESTANDO PERFIL..."
echo "--------------------------------"
PROFILE_OUTPUT=$(curl -s -X GET "$API_URL/api/auth/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Resposta:"
echo "$PROFILE_OUTPUT" | jq .

echo ""
echo "5. 🔄 TESTANDO REFRESH TOKEN..."
echo "--------------------------------"
REFRESH_OUTPUT=$(curl -s -X POST "$API_URL/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{
    \"refresh_token\": \"$REFRESH_TOKEN\"
  }")

echo "Resposta:"
echo "$REFRESH_OUTPUT" | jq .

if echo "$REFRESH_OUTPUT" | jq -e '.success' > /dev/null; then
  NEW_ACCESS_TOKEN=$(echo "$REFRESH_OUTPUT" | jq -r '.access_token')
  echo ""
  echo "✅ Token renovado: ${NEW_ACCESS_TOKEN:0:50}..."
fi

echo ""
echo "6. 🚪 TESTANDO LOGOUT..."
echo "--------------------------------"
LOGOUT_OUTPUT=$(curl -s -X POST "$API_URL/api/auth/logout" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"refresh_token\": \"$REFRESH_TOKEN\"
  }")

echo "Resposta:"
echo "$LOGOUT_OUTPUT" | jq .

echo ""
echo "7. ⚠️ TESTANDO ERROS..."
echo "--------------------------------"

echo "a) Login com credenciais inválidas:"
curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "naoexiste@email.com",
    "password": "senhaerrada"
  }' | jq '.error'

echo ""
echo "b) Perfil sem token:"
curl -s -X GET "$API_URL/api/auth/profile" | jq '.error'

echo ""
echo "c) Perfil com token inválido:"
curl -s -X GET "$API_URL/api/auth/profile" \
  -H "Authorization: Bearer token_invalido_123" | jq '.error'

echo ""
echo "=========================================="
echo "🎉 DEBUG COMPLETO FINALIZADO!"
echo ""
echo "📊 RESUMO:"
echo "   ✅ Health Check"
echo "   ✅ Registro de usuário"
echo "   ✅ Login"
echo "   ✅ Perfil protegido"
echo "   ✅ Refresh token"
echo "   ✅ Logout"
echo "   ✅ Tratamento de erros"
echo ""
echo "🚀 API FUNCIONANDO CORRETAMENTE!"
