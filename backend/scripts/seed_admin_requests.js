const mongoose = require('mongoose');
const Hospital = require('../models/Hospital');
const Request = require('../models/Request');
const Donor = require('../models/Donor');
const Transplant = require('../models/Transplant');
const Admin = require('../models/Admin');
require('dotenv').config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data (optional, but good for clean state)
        // await Hospital.deleteMany({});
        // await Request.deleteMany({});

        // 1. Create a Master Hospital
        const hospital = await Hospital.findOneAndUpdate(
            { licenseNumber: 'MED-999-HOSP' },
            {
                name: 'Central Metropolitan Medical Center',
                address: '742 Healthcare Blvd',
                location: {
                    address: '742 Healthcare Blvd',
                    city: 'San Francisco',
                    state: 'CA',
                    zipCode: '94105',
                    region: 'West',
                    coordinates: { latitude: 37.7749, longitude: -122.4194 }
                },
                contactInfo: {
                    phone: '+1-555-0199',
                    email: 'ops@centralmed.org',
                    emergencyPhone: '+1-555-9111'
                },
                specializations: ['Cardiology', 'Neurology', 'Organ Transplant'],
                capacity: {
                    totalBeds: 500,
                    availableBeds: 42,
                    icuBeds: 50
                },
                status: 'approved',
                rating: 4.8,
                reviews: [
                    { userName: 'Dr. Sarah Smith', rating: 5, comment: 'Exceptional facilities and response time.', date: new Date(), verified: true },
                    { userName: 'Patient X', rating: 4, comment: 'Very professional staff.', date: new Date(), verified: true }
                ]
            },
            { upsert: true, new: true }
        );
        console.log('Created Hospital:', hospital.name);

        // 2. Create Organ Requests linked to this hospital
        const organs = ['heart', 'kidney', 'liver', 'lung', 'cornea'];
        const urgencies = ['critical', 'high', 'medium', 'low'];
        const bloodTypes = ['A+', 'O-', 'B+', 'AB+'];

        for (let i = 0; i < 6; i++) {
            await Request.create({
                hospital: hospital._id,
                patient: {
                    name: `Patient ${i + 1}`,
                    age: 25 + i * 5,
                    bloodType: bloodTypes[i % bloodTypes.length],
                    urgencyLevel: urgencies[i % urgencies.length]
                },
                organType: organs[i % organs.length],
                status: i === 0 ? 'matched' : 'pending',
                priority: 10 - i,
                notes: `System generated request for ${organs[i % organs.length]}`
            });
        }
        console.log('Created 6 Organ Requests');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seed();
