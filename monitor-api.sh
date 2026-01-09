#!/bin/bash

echo "👁️ MONITORAMENTO DA API"
echo "Pressione Ctrl+C para parar"
echo ""

API_URL="http://localhost:3000"
INTERVAL=5  # segundos

while true; do
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
  
  # Health check
  RESPONSE=$(curl -s -w "%{http_code} %{time_total}" \
    -o /dev/null \
    "$API_URL/health")
  
  STATUS=$(echo $RESPONSE | awk '{print $1}')
  TIME=$(echo $RESPONSE | awk '{print $2}')
  
  if [ "$STATUS" = "200" ]; then
    echo "[$TIMESTAMP] ✅ API ONLINE | Status: $STATUS | Tempo: ${TIME}s"
  else
    echo "[$TIMESTAMP] ❌ API OFFLINE | Status: $STATUS | Tempo: ${TIME}s"
  fi
  
  # Verificar uso de memória do Node (se estiver rodando local)
  if pgrep node > /dev/null; then
    MEM_USAGE=$(ps -o %mem= -p $(pgrep node) | head -1)
    echo "   Memória Node.js: ${MEM_USAGE}%"
  fi
  
  sleep $INTERVAL
done
