# 🔐 Admin Registration API Testing

## 📋 Admin Registration

### Step 1: Register New Admin
**Create a new admin account**

**Request:**
```
POST http://localhost:5000/api/admin/register
Content-Type: application/json

{
  "name": "New Admin",
  "email": "newadmin@healthcare.com",
  "password": "newadmin123456",
  "secretKey": "HEALTHCARE_ADMIN_2024_SECRET"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Admin registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "676c123456789abcdef12345",
      "name": "New Admin",
      "email": "newadmin@healthcare.com",
      "role": "admin"
    }
  }
}
```

**Error Responses:**

**Missing Fields:**
```json
{
  "success": false,
  "message": "Please provide name, email, password, and secret key"
}
```

**Wrong Secret Key:**
```json
{
  "success": false,
  "message": "Invalid admin secret key"
}
```

**Duplicate Email:**
```json
{
  "success": false,
  "message": "Admin with this email already exists"
}
```

---

## 🧪 Test Commands

**Register Admin:**
```bash
curl -X POST http://localhost:5000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Admin",
    "email": "testadmin@healthcare.com",
    "password": "testpass123",
    "secretKey": "HEALTHCARE_ADMIN_2024_SECRET"
  }'
```

**Login with New Admin:**
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testadmin@healthcare.com",
    "password": "testpass123",
    "secretKey": "HEALTHCARE_ADMIN_2024_SECRET"
  }'
```

---

## 🔄 Complete Admin Flow

1. **Register** → POST /api/admin/register (requires secret key)
2. **Login** → POST /api/admin/login (requires secret key)
3. **Access Dashboard** → Use JWT token from login/register

**🔐 Both registration and login require the ADMIN_SECRET_KEY!**