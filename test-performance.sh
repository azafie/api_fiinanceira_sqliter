#!/bin/bash

echo "📊 TESTE DE PERFORMANCE E CONEXÃO"
echo "=========================================="

API_URL="http://localhost:3000"

# Teste de latência
echo ""
echo "1. 📈 TESTANDO LATÊNCIA..."
for i in {1..5}; do
  TIME=$(curl -s -o /dev/null -w "%{time_total}" "$API_URL/health")
  echo "   Tentativa $i: ${TIME}s"
done

# Teste de concorrência básica
echo ""
echo "2. 🔄 TESTE DE CONCORRÊNCIA (3 requests)..."
for i in {1..3}; do
  (curl -s -o /dev/null -w "   Request $i: %{http_code} em %{time_total}s\n" \
    "$API_URL/health" &)
done
wait

# Teste de carga leve
echo ""
echo "3. ⚖️ TESTE DE CARGA (10 requests)..."
START=$(date +%s.%N)
for i in {1..10}; do
  curl -s -o /dev/null "$API_URL/health" &
done
wait
END=$(date +%s.%N)

ELAPSED=$(echo "$END - $START" | bc)
echo "   Tempo total: ${ELAPSED}s"
echo "   Média por request: $(echo "scale=3; $ELAPSED / 10" | bc)s"

# Teste de timeout
echo ""
echo "4. ⏱️ TESTANDO TIMEOUT..."
curl -s -o /dev/null -w "   Timeout test: %{http_code} | %{time_total}s\n" \
  --max-time 2 "$API_URL/health"

echo ""
echo "=========================================="
echo "✅ TESTES DE PERFORMANCE COMPLETOS!"
