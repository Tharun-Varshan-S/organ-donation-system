const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const connectDB = require('./config/database');
require('dotenv').config();

const createAdmin = async () => {
    await connectDB();

    const email = 'admin@example.com';
    const password = 'admin123'; // Simple password for development

    try {
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            console.log('Admin already exists.');
            existingAdmin.password = password; // Reset password
            await existingAdmin.save();
            console.log(`Password reset for ${email} to '${password}'`);
        } else {
            await Admin.create({
                name: 'System Admin',
                email,
                password,
                role: 'admin',
                isActive: true
            });
            console.log(`Admin created: ${email} / ${password}`);
        }
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

createAdmin();
