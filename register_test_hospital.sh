#!/bin/bash

echo "🏥 Registering 'St. Mary Mock Hospital' (Pending)..."

curl -X POST http://localhost:5000/api/hospitals/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "St. Mary Mock Hospital",
    "email": "admin@stmary.com",
    "password": "password123",
    "licenseNumber": "LIC-MOCK-2024",
    "location": {
      "address": "456 Healing Blvd",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94102"
    },
    "contactInfo": {
      "phone": "555-0199",
      "emergencyPhone": "555-9111"
    },
    "specializations": ["Cardiology", "Neurology", "Trauma", "Pediatrics"],
    "capacity": {
      "totalBeds": 500,
      "icuBeds": 50,
      "availableBeds": 120
    }
  }'

echo -e "\n\n✅ Request Sent! Check Admin Dashboard for 'St. Mary Mock Hospital' in Pending state."
