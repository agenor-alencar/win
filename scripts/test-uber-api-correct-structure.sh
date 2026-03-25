#!/bin/bash

# Test direto com estrutura CORRETA para Uber API

echo "======================================="
echo "TEST: Uber API com Estrutura CORRETA"
echo "======================================="
echo ""

# Estrutura CORRETA que Uber espera (TOP-LEVEL campos)
curl -X POST "https://sandbox-api.uber.com/v1/customers/01233f28-3140-594c-85b5-553b08284ee0/delivery_quotes" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pickup_address": "Avenida Paulista 1000, Sao Paulo, SP",
    "dropoff_address": "Rua Maria Prestes 500, Sao Paulo, SP",
    "pickup_location": {
      "latitude": -23.5615,
      "longitude": -46.6560
    },
    "dropoff_location": {
      "latitude": -23.5725,
      "longitude": -46.6440
    },
    "vehicle_type": "motorcycle"
  }' | jq .

echo ""
echo "=========================================
echo "NOTAS:"
echo "1. Acima está a estrutura CORRETA"
echo "2. Campo TOP-LEVEL: pickup_address"
echo "3. Campo TOP-LEVEL: dropoff_address"
echo "4. Campo TOP-LEVEL: pickup_location"
echo "5. Campo TOP-LEVEL: dropoff_location"
echo ""
echo "O código Java JÁ foi corrigido para isso!"
echo "Só precisa recompilar/redeploy o JAR."
echo "======================================="
