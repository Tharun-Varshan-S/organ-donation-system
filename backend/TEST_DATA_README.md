# Test Data Setup Guide

This guide explains how to populate your organ donation system with comprehensive test data for development and testing purposes.

## Available Scripts

### 1. Initial Test Data Setup
```bash
npm run seed-test
```
**What it does:**
- Clears all existing data
- Creates 1 admin account
- Creates 5 hospitals (mix of approved/pending status)
- Creates 4 donors with different blood types and organ preferences
- Creates 4 organ requests with various urgency levels
- Creates 2 transplant records

### 2. Add More Test Data
```bash
npm run add-more-data
```
**What it does:**
- Adds 5 more hospitals across different states
- Adds 5 more donors with diverse profiles
- Adds 5 more organ requests
- Adds 2 more transplant records
- **Note:** Run this AFTER the initial setup

## Test Data Overview

### Admin Account
- **Email:** admin@healthcare.com
- **Password:** admin123

### Hospitals Created
1. **City Medical Center** (New York) - Approved ✅
2. **Regional Heart Institute** (Los Angeles) - Approved ✅
3. **Metro General Hospital** (Chicago) - Pending ⏳
4. **Riverside Healthcare** (Houston) - Approved ✅
5. **Central Clinic** (Phoenix) - Pending ⏳
6. **St. Mary's Medical Center** (Miami) - Approved ✅
7. **University Medical Center** (Seattle) - Pending ⏳
8. **Emergency Plus Hospital** (Denver) - Approved ✅
9. **Children's Healthcare** (Atlanta) - Pending ⏳
10. **Veterans Medical Center** (Boston) - Approved ✅

### Donors Created
- **Blood Types:** O+, A+, B-, AB+, O-, A-, B+, AB-, O+
- **Status Mix:** Active, Deceased, Matched
- **Organ Types:** Heart, Kidney, Liver, Lung, Pancreas, Cornea, Tissue, Bone
- **Living vs Deceased:** Mix of both types

### Organ Requests
- **Urgency Levels:** Low, Medium, High, Critical
- **Organ Types:** Heart, Kidney, Liver, Lung, Cornea
- **Status:** Pending, Matched, Completed
- **Age Range:** 12-67 years (including pediatric cases)

### Transplant Records
- **Status:** Scheduled, Completed, In-Progress
- **Success Rate:** Mix of successful and pending cases
- **Surgery Details:** Realistic duration, surgeon names, OR assignments
- **Transport Details:** Hospital-to-hospital logistics

## Usage Instructions

### Step 1: Initial Setup
```bash
cd backend
npm run seed-test
```

### Step 2: Add More Data (Optional)
```bash
npm run add-more-data
```

### Step 3: Start Your Application
```bash
npm run dev
```

### Step 4: Login to Admin Dashboard
1. Navigate to your admin login page
2. Use credentials: `admin@healthcare.com` / `admin123`
3. Explore the dashboard with populated data

## What You Can Test

### Dashboard Features
- ✅ Statistics cards with real numbers
- ✅ Hospital approval workflow
- ✅ Donor management
- ✅ Organ request tracking
- ✅ Transplant records
- ✅ Regional distribution
- ✅ Specialization grouping
- ✅ Emergency services filtering
- ✅ Search and filter functionality

### Data Scenarios
- **Pending Approvals:** Multiple hospitals waiting for approval
- **Emergency Cases:** Critical organ requests
- **Successful Transplants:** Completed procedures with outcomes
- **Living Donors:** Active donors available for transplant
- **Geographic Distribution:** Hospitals across multiple states
- **Specialization Variety:** Different medical specializations

## Resetting Data

To start fresh, simply run the initial setup again:
```bash
npm run seed-test
```

This will clear all existing data and create a fresh dataset.

## Customizing Test Data

You can modify the test data by editing:
- `seedTestData.js` - Initial dataset
- `addMoreTestData.js` - Extended dataset

Add your own hospitals, donors, or requests by following the existing data structure patterns.

## Troubleshooting

### Connection Issues
- Ensure MongoDB is running
- Check your `.env` file has correct `MONGODB_URI`

### Permission Errors
- Make sure you have write permissions to the database
- Verify your MongoDB user has the necessary privileges

### Data Conflicts
- If you get unique constraint errors, run the seed script again (it clears existing data first)

## Next Steps

After populating test data:
1. Test all admin dashboard features
2. Verify hospital approval workflow
3. Check donor-request matching logic
4. Test search and filtering
5. Validate transplant tracking
6. Review analytics and reports

Your organ donation system is now ready for comprehensive testing! 🏥❤️