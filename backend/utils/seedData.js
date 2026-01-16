const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Admin = require('../models/Admin');
const Hospital = require('../models/Hospital');
const Donor = require('../models/Donor');
const Request = require('../models/Request');
const Transplant = require('../models/Transplant');

const connectDB = require('../config/database');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Admin.deleteMany({});
    await Hospital.deleteMany({});
    await Donor.deleteMany({});
    await Request.deleteMany({});
    await Transplant.deleteMany({});

    // Create Admin
    console.log('👤 Creating admin user...');
    const admin = await Admin.create({
      name: 'Healthcare Admin',
      email: 'admin@healthcare.com',
      password: 'admin123456'
    });

    // Create Hospitals
    console.log('🏥 Creating hospitals...');
    const hospitals = await Hospital.create([
      {
        name: 'City General Hospital',
        email: 'contact@citygeneral.com',
        licenseNumber: 'LIC001',
        location: {
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        },
        contactInfo: {
          phone: '+1-555-0101',
          emergencyPhone: '+1-555-0102'
        },
        capacity: {
          totalBeds: 500,
          availableBeds: 120
        },
        status: 'approved',
        specializations: ['cardiology', 'nephrology', 'hepatology'],
        approvedBy: admin._id,
        approvedAt: new Date()
      },
      {
        name: 'Metro Medical Center',
        email: 'info@metromedical.com',
        licenseNumber: 'LIC002',
        location: {
          address: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001'
        },
        contactInfo: {
          phone: '+1-555-0201',
          emergencyPhone: '+1-555-0202'
        },
        capacity: {
          totalBeds: 350,
          availableBeds: 80
        },
        status: 'approved',
        specializations: ['transplant', 'emergency'],
        approvedBy: admin._id,
        approvedAt: new Date()
      },
      {
        name: 'Regional Healthcare',
        email: 'admin@regionalhc.com',
        licenseNumber: 'LIC003',
        location: {
          address: '789 Pine St',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601'
        },
        contactInfo: {
          phone: '+1-555-0301',
          emergencyPhone: '+1-555-0302'
        },
        capacity: {
          totalBeds: 280,
          availableBeds: 60
        },
        status: 'pending',
        specializations: ['general', 'surgery']
      },
      {
        name: 'University Hospital',
        email: 'contact@universityhospital.edu',
        licenseNumber: 'LIC004',
        location: {
          address: '321 University Blvd',
          city: 'Boston',
          state: 'MA',
          zipCode: '02101'
        },
        contactInfo: {
          phone: '+1-555-0401',
          emergencyPhone: '+1-555-0402'
        },
        capacity: {
          totalBeds: 600,
          availableBeds: 150
        },
        status: 'suspended',
        specializations: ['research', 'transplant', 'cardiology']
      }
    ]);

    // Create Donors
    console.log('❤️  Creating donors...');
    const donors = await Donor.create([
      {
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@email.com',
          phone: '+1-555-1001',
          dateOfBirth: new Date('1985-03-15'),
          gender: 'male'
        },
        medicalInfo: {
          bloodType: 'O+',
          weight: 75,
          height: 180,
          medicalHistory: ['No major illnesses'],
          allergies: ['None'],
          medications: ['None']
        },
        donationPreferences: {
          organTypes: ['heart', 'kidney', 'liver'],
          isLivingDonor: false
        },
        location: {
          address: '123 Donor St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        },
        status: 'active',
        registeredHospital: hospitals[0]._id,
        isVerified: true
      },
      {
        personalInfo: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@email.com',
          phone: '+1-555-1002',
          dateOfBirth: new Date('1990-07-22'),
          gender: 'female'
        },
        medicalInfo: {
          bloodType: 'AB+',
          weight: 65,
          height: 165,
          medicalHistory: ['Healthy'],
          allergies: ['Penicillin'],
          medications: ['Vitamins']
        },
        donationPreferences: {
          organTypes: ['kidney', 'pancreas'],
          isLivingDonor: true
        },
        location: {
          address: '456 Helper Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001'
        },
        status: 'active',
        registeredHospital: hospitals[1]._id,
        isVerified: true
      },
      {
        personalInfo: {
          firstName: 'Robert',
          lastName: 'Johnson',
          email: 'robert.johnson@email.com',
          phone: '+1-555-1003',
          dateOfBirth: new Date('1978-11-08'),
          gender: 'male'
        },
        medicalInfo: {
          bloodType: 'B+',
          weight: 82,
          height: 175,
          medicalHistory: ['Hypertension (controlled)'],
          allergies: ['None'],
          medications: ['Blood pressure medication']
        },
        donationPreferences: {
          organTypes: ['heart', 'lung'],
          isLivingDonor: false
        },
        location: {
          address: '789 Care Blvd',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601'
        },
        status: 'inactive',
        registeredHospital: hospitals[2]._id,
        isVerified: false
      }
    ]);

    // Create Requests
    console.log('📋 Creating organ requests...');
    const requestsData = [
      {
        hospital: hospitals[0]._id,
        patient: {
          name: 'Michael Brown',
          age: 45,
          bloodType: 'O+',
          medicalCondition: 'End-stage heart failure',
          urgencyLevel: 'critical'
        },
        organType: 'heart',
        status: 'pending',
        priority: 9,
        notes: 'Patient requires urgent heart transplant',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      {
        hospital: hospitals[1]._id,
        patient: {
          name: 'Sarah Wilson',
          age: 38,
          bloodType: 'AB+',
          medicalCondition: 'Chronic kidney disease',
          urgencyLevel: 'high'
        },
        organType: 'kidney',
        status: 'matched',
        priority: 7,
        matchedDonor: donors[1]._id,
        notes: 'Compatible donor found',
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
      },
      {
        hospital: hospitals[0]._id,
        patient: {
          name: 'David Lee',
          age: 52,
          bloodType: 'B+',
          medicalCondition: 'Liver cirrhosis',
          urgencyLevel: 'medium'
        },
        organType: 'liver',
        status: 'pending',
        priority: 5,
        notes: 'Stable condition, awaiting suitable donor',
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
      }
    ];
    
    const requests = [];
    for (let i = 0; i < requestsData.length; i++) {
      const request = new Request(requestsData[i]);
      await request.save();
      requests.push(request);
    }

    // Create Transplants
    console.log('🔄 Creating transplant records...');
    const transplant1 = new Transplant({
      request: requests[1]._id,
      donor: donors[1]._id,
      recipient: {
        name: 'Sarah Wilson',
        age: 38,
        bloodType: 'AB+',
        hospital: hospitals[1]._id
      },
      organType: 'kidney',
      surgeryDetails: {
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        surgeonName: 'Dr. Emily Chen',
        operatingRoom: 'OR-3'
      },
      status: 'scheduled',
      transportDetails: {
        pickupHospital: hospitals[1]._id,
        deliveryHospital: hospitals[1]._id,
        preservationMethod: 'Cold storage'
      }
    });
    await transplant1.save();
    
    const transplant2 = new Transplant({
      request: requests[0]._id,
      donor: donors[0]._id,
      recipient: {
        name: 'Michael Brown',
        age: 45,
        bloodType: 'O+',
        hospital: hospitals[0]._id
      },
      organType: 'heart',
      surgeryDetails: {
        scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        actualDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        duration: 360, // 6 hours
        surgeonName: 'Dr. James Rodriguez',
        operatingRoom: 'OR-1'
      },
      status: 'completed',
      outcome: {
        success: true,
        complications: [],
        notes: 'Surgery completed successfully, patient recovering well',
        followUpRequired: true
      },
      transportDetails: {
        pickupHospital: hospitals[0]._id,
        deliveryHospital: hospitals[0]._id,
        transportTime: 45,
        preservationMethod: 'Perfusion system'
      }
    });
    await transplant2.save();

    console.log('✅ Seed data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Admin: 1 user created`);
    console.log(`- Hospitals: ${hospitals.length} created`);
    console.log(`- Donors: ${donors.length} created`);
    console.log(`- Requests: ${requests.length} created`);
    console.log(`- Transplants: 2 created`);
    
    console.log('\n🔐 Admin Login Credentials:');
    console.log('Email: admin@healthcare.com');
    console.log('Password: admin123456');
    console.log(`Secret Key: ${process.env.ADMIN_SECRET_KEY}`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();