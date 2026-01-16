#!/bin/bash

echo "🧪 Testing Clean Organ Donation System"
echo "======================================"

BASE_URL="http://localhost:5000/api"

echo "1️⃣ Health Check..."
curl -s $BASE_URL/health | jq '.'

echo -e "\n2️⃣ Admin Login..."
ADMIN_RESPONSE=$(curl -s -X POST $BASE_URL/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.com",
    "password": "admin123"
  }')

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.token')
echo "Admin Token: ${ADMIN_TOKEN:0:20}..."

echo -e "\n3️⃣ Register Hospital..."
curl -s -X POST $BASE_URL/hospital/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Hospital",
    "email": "test@hospital.com",
    "password": "test123",
    "licenseNumber": "TEST001",
    "location": {"city": "Test City", "state": "TS"},
    "specializations": ["heart"]
  }' | jq '.'

echo -e "\n4️⃣ Hospital Login (Should Fail - Pending)..."
curl -s -X POST $BASE_URL/hospital/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@hospital.com",
    "password": "test123"
  }' | jq '.'

echo -e "\n5️⃣ Admin View Hospitals..."
HOSPITALS_RESPONSE=$(curl -s -X GET $BASE_URL/admin/hospitals \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo $HOSPITALS_RESPONSE | jq '.'

HOSPITAL_ID=$(echo $HOSPITALS_RESPONSE | jq -r '.data.hospitals[0]._id')
echo "Hospital ID: $HOSPITAL_ID"

echo -e "\n6️⃣ Admin Approve Hospital..."
curl -s -X PUT $BASE_URL/admin/hospitals/$HOSPITAL_ID/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'

echo -e "\n7️⃣ Hospital Login (Should Work - Approved)..."
curl -s -X POST $BASE_URL/hospital/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@hospital.com",
    "password": "test123"
  }' | jq '.'

echo -e "\n✅ Test Complete!"