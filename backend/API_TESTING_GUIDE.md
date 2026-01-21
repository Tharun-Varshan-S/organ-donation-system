# 🧪 Healthcare Backend API Testing Guide

## 🚀 Quick Start

1. **Start Backend Server:**
   ```bash
   cd backend
   npm start
   # OR
   ./start-server.sh
   ```
   Server runs on: http://localhost:5000

2. **Health Check:**
   ```
   GET http://localhost:5000/api/health
   ```

## 🔐 Admin Login Credentials

```json
{
  "email": "admin@healthcare.com",
  "password": "admin123456",
  "secretKey": "HEALTHCARE_ADMIN_2024_SECRET"
}
```

---

## 📋 API Testing Steps

### Step 1: Health Check
**Test server is running**

**Request:**
```
GET http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Healthcare Backend API is running",
  "timestamp": "2024-01-06T12:00:00.000Z",
  "environment": "development"
}
```

---

### Step 2: Admin Login
**Get JWT token for authentication**

**Request:**
```
POST http://localhost:5000/api/admin/login
Content-Type: application/json

{
  "email": "admin@healthcare.com",
  "password": "admin123456",
  "secretKey": "HEALTHCARE_ADMIN_2024_SECRET"
}
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "676c123456789abcdef12345",
      "name": "Healthcare Admin",
      "email": "admin@healthcare.com",
      "role": "admin",
      "lastLogin": "2024-01-06T12:00:00.000Z"
    }
  }
}
```

**⚠️ IMPORTANT:** Copy the `token` value for next requests!

---

### Step 3: Dashboard Statistics
**Get admin dashboard stats**

**Request:**
```
GET http://localhost:5000/api/admin/dashboard/stats
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalHospitals": 4,
      "approvedHospitals": 2,
      "pendingHospitals": 1,
      "totalDonors": 3,
      "activeDonors": 2,
      "totalRequests": 3,
      "pendingRequests": 2,
      "totalTransplants": 2,
      "successfulTransplants": 1
    },
    "charts": {
      "monthlyTransplants": [...],
      "organDistribution": [...]
    }
  }
}
```

---

### Step 4: Get All Hospitals
**View hospital management data**

**Request:**
```
GET http://localhost:5000/api/admin/hospitals
Authorization: Bearer YOUR_TOKEN_HERE
```

**With Query Parameters:**
```
GET http://localhost:5000/api/admin/hospitals?page=1&limit=10&status=approved
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "hospitals": [
      {
        "_id": "676c123456789abcdef12345",
        "name": "City General Hospital",
        "email": "contact@citygeneral.com",
        "licenseNumber": "LIC001",
        "location": {
          "address": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001"
        },
        "status": "approved",
        "capacity": {
          "totalBeds": 500,
          "availableBeds": 120
        },
        "createdAt": "2024-01-06T12:00:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 1,
      "total": 4
    }
  }
}
```

---

### Step 5: Approve Hospital
**Approve a pending hospital**

**Request:**
```
PUT http://localhost:5000/api/admin/hospitals/HOSPITAL_ID_HERE/approve
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Hospital approved successfully",
  "data": {
    "_id": "676c123456789abcdef12345",
    "name": "Regional Healthcare",
    "status": "approved",
    "approvedBy": "676c123456789abcdef54321",
    "approvedAt": "2024-01-06T12:00:00.000Z"
  }
}
```

---

### Step 6: Suspend Hospital
**Suspend an approved hospital**

**Request:**
```
PUT http://localhost:5000/api/admin/hospitals/HOSPITAL_ID_HERE/suspend
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "reason": "Compliance violation"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Hospital suspended successfully",
  "data": {
    "_id": "676c123456789abcdef12345",
    "name": "University Hospital",
    "status": "suspended",
    "isActive": false,
    "suspensionReason": "Compliance violation"
  }
}
```

---

### Step 7: Get Donors (Read-Only)
**View donor information**

**Request:**
```
GET http://localhost:5000/api/admin/donors
Authorization: Bearer YOUR_TOKEN_HERE
```

**With Filters:**
```
GET http://localhost:5000/api/admin/donors?status=active&bloodType=O+
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "donors": [
      {
        "_id": "676c123456789abcdef12345",
        "personalInfo": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@email.com"
        },
        "medicalInfo": {
          "bloodType": "O+",
          "weight": 75,
          "height": 180
        },
        "status": "active",
        "isVerified": true
      }
    ],
    "bloodTypeStats": [
      { "_id": "O+", "count": 1 },
      { "_id": "AB+", "count": 1 }
    ],
    "pagination": {
      "current": 1,
      "pages": 1,
      "total": 3
    }
  }
}
```

---

### Step 8: Get Organ Requests
**View organ requests**

**Request:**
```
GET http://localhost:5000/api/admin/requests
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "_id": "676c123456789abcdef12345",
        "requestId": "REQ-2024-0001",
        "hospital": {
          "name": "City General Hospital",
          "location": { "city": "New York" }
        },
        "patient": {
          "name": "Michael Brown",
          "age": 45,
          "bloodType": "O+",
          "urgencyLevel": "critical"
        },
        "organType": "heart",
        "status": "pending",
        "priority": 9
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 1,
      "total": 3
    }
  }
}
```

---

### Step 9: Get Transplants
**View transplant records**

**Request:**
```
GET http://localhost:5000/api/admin/transplants
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "transplants": [
      {
        "_id": "676c123456789abcdef12345",
        "transplantId": "TRANS-2024-0001",
        "organType": "kidney",
        "status": "scheduled",
        "surgeryDetails": {
          "scheduledDate": "2024-01-13T12:00:00.000Z",
          "surgeonName": "Dr. Emily Chen",
          "operatingRoom": "OR-3"
        },
        "recipient": {
          "name": "Sarah Wilson",
          "age": 38,
          "bloodType": "AB+"
        }
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 1,
      "total": 2
    }
  }
}
```

---

## ❌ Error Testing

### Test Invalid Token
**Request:**
```
GET http://localhost:5000/api/admin/dashboard/stats
Authorization: Bearer invalid_token_here
```

**Expected Error:**
```json
{
  "success": false,
  "message": "Invalid token."
}
```

### Test Expired Token
**Use an old/expired token**

**Expected Error:**
```json
{
  "success": false,
  "message": "Token expired."
}
```

### Test Wrong Secret Key
**Request:**
```
POST http://localhost:5000/api/admin/login
Content-Type: application/json

{
  "email": "admin@healthcare.com",
  "password": "admin123456",
  "secretKey": "WRONG_SECRET_KEY"
}
```

**Expected Error:**
```json
{
  "success": false,
  "message": "Invalid admin secret key"
}
```

### Test Invalid Credentials
**Request:**
```
POST http://localhost:5000/api/admin/login
Content-Type: application/json

{
  "email": "wrong@email.com",
  "password": "wrongpassword",
  "secretKey": "HEALTHCARE_ADMIN_2024_SECRET"
}
```

**Expected Error:**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Test Missing Authorization
**Request without Authorization header:**
```
GET http://localhost:5000/api/admin/hospitals
```

**Expected Error:**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

---

## 🔧 Postman Collection

### Import this JSON into Postman:

```json
{
  "info": {
    "name": "Healthcare Backend API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/health"
      }
    },
    {
      "name": "Admin Login",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/admin/login",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"admin@healthcare.com\",\n  \"password\": \"admin123456\",\n  \"secretKey\": \"HEALTHCARE_ADMIN_2024_SECRET\"\n}"
        }
      }
    },
    {
      "name": "Dashboard Stats",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/admin/dashboard/stats",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ]
      }
    },
    {
      "name": "Get Hospitals",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/admin/hospitals",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ]
      }
    }
  ]
}
```

---

## 🛠️ Frontend Integration

### How to send JWT token from React:

```javascript
// After admin login success
const token = response.data.token;
localStorage.setItem('adminToken', token);

// For API calls
const apiCall = async () => {
  const token = localStorage.getItem('adminToken');
  
  const response = await fetch('http://localhost:5000/api/admin/dashboard/stats', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data;
};
```

---

## 🚀 Quick Test Commands

**Start server:**
```bash
cd backend
npm start
```

**Test with curl:**
```bash
# Health check
curl http://localhost:5000/api/health

# Admin login
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@healthcare.com","password":"admin123456","secretKey":"HEALTHCARE_ADMIN_2024_SECRET"}'

# Dashboard stats (replace TOKEN)
curl -X GET http://localhost:5000/api/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ✅ Testing Checklist

- [ ] Health check works
- [ ] Admin login successful
- [ ] JWT token received
- [ ] Dashboard stats load
- [ ] Hospitals list loads
- [ ] Hospital approve works
- [ ] Hospital suspend works
- [ ] Donors list loads (read-only)
- [ ] Requests list loads
- [ ] Transplants list loads
- [ ] Invalid token rejected
- [ ] Wrong secret key rejected
- [ ] Missing auth rejected

**🎯 All APIs are ADMIN-ONLY protected with JWT authentication!**