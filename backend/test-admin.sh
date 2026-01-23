#!/bin/bash

echo "🔐 Testing ADMIN-ONLY System"
echo "============================"

BASE_URL="http://localhost:5000/api"

echo "1️⃣ Health Check..."
curl -s $BASE_URL/health

echo -e "\n\n2️⃣ Register Admin (First Time)..."
curl -s -X POST $BASE_URL/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "System Admin",
    "email": "admin@system.com",
    "password": "admin123",
    "secretKey": "HEALTHCARE_ADMIN_2024_SECRET"
  }'

echo -e "\n\n3️⃣ Admin Login..."
ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@system.com",
    "password": "admin123"
  }')

echo $ADMIN_RESPONSE
ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.token')

echo -e "\n\n4️⃣ Dashboard Stats..."
curl -s -X GET $BASE_URL/admin/dashboard/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"

echo -e "\n\n5️⃣ View Hospitals..."
curl -s -X GET $BASE_URL/admin/hospitals \
  -H "Authorization: Bearer $ADMIN_TOKEN"

echo -e "\n\n✅ Admin System Working!"