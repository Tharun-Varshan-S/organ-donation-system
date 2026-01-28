
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const API_URL = 'http://localhost:5000/api';

async function verifyConfidentialData() {
    console.log('🧪 Starting Verification Script...');

    try {
        // 1. Register a new user
        const testUser = {
            name: 'Verification Donor',
            email: `verify_donor_${Date.now()}@test.com`,
            password: 'password123',
            bloodType: 'O+',
            isDonor: true
        };

        console.log(`\nACCOUNT CREATION: Registering ${testUser.email}...`);
        const registerRes = await axios.post(`${API_URL}/users/register`, testUser);

        if (!registerRes.data.success) {
            throw new Error(`Registration failed: ${registerRes.data.message}`);
        }

        const token = registerRes.data.token;
        console.log('✅ Registration Successful. Token received.');

        // 2. Initial Check of Confidential Data (should be defaults)
        console.log('\nINITIAL STATE CHECK:');
        console.log(`- Phone: ${registerRes.data.data.phone || '(empty)'}`);
        console.log(`- Visibility: ${registerRes.data.data.visibilityStatus}`);
        console.log(`- Availability: ${registerRes.data.data.availabilityStatus}`);

        // 3. Update Confidential Data
        console.log('\nUPDATE ACTION: Updating confidential data...');
        const updateData = {
            phone: '1234567890',
            visibilityStatus: 'public',
            availabilityStatus: 'Inactive'
        };

        const updateRes = await axios.put(
            `${API_URL}/users/profile`,
            updateData,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!updateRes.data.success) {
            throw new Error(`Update failed: ${updateRes.data.message}`);
        }
        console.log('✅ Update API called successfully.');

        // 4. Verification Check (Fetch fresh profile)
        console.log('\nVERIFICATION: Fetching fresh profile to verify persistence...');
        const profileRes = await axios.get(
            `${API_URL}/users/profile`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const updatedProfile = profileRes.data.data;
        console.log('Fetched Profile Data:', {
            phone: updatedProfile.phone,
            visibility: updatedProfile.visibilityStatus,
            availability: updatedProfile.availabilityStatus
        });

        // 5. Assertions
        const errors = [];
        if (updatedProfile.phone !== updateData.phone) errors.push(`Phone mismatch: Expected ${updateData.phone}, got ${updatedProfile.phone}`);
        if (updatedProfile.visibilityStatus !== updateData.visibilityStatus) errors.push(`Visibility mismatch: Expected ${updateData.visibilityStatus}, got ${updatedProfile.visibilityStatus}`);
        if (updatedProfile.availabilityStatus !== updateData.availabilityStatus) errors.push(`Availability mismatch: Expected ${updateData.availabilityStatus}, got ${updatedProfile.availabilityStatus}`);

        if (errors.length > 0) {
            console.error('\n❌ VERIFICATION FAILED:');
            errors.forEach(e => console.error(`- ${e}`));
            process.exit(1);
        } else {
            console.log('\n✨ SUCCESS: All confidential data fields were correctly updated and persisted to the DB.');
        }

    } catch (error) {
        console.error('\n❌ ERROR:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

verifyConfidentialData();
