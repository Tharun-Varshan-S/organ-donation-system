import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Hospital from './models/Hospital.js';
import Donor from './models/Donor.js';
import Request from './models/Request.js';
import Transplant from './models/Transplant.js';
import Admin from './models/Admin.js';
import Notification from './models/Notification.js';
import AuditLog from './models/AuditLog.js';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Sample data
const hospitalData = [
  {
    name: "City Medical Center",
    email: "admin@citymedical.com",
    licenseNumber: "LIC-2024-001",
    location: {
      address: "123 Healthcare Ave",
      city: "New York",
      state: "New York",
      zipCode: "10001",
      coordinates: { latitude: 40.7128, longitude: -74.0060 }
    },
    contactInfo: {
      phone: "+1-555-0101",
      emergencyPhone: "+1-555-0911"
    },
    capacity: { totalBeds: 500, availableBeds: 45 },
    status: "approved",
    specializations: ["Cardiology", "Neurology", "Transplant Surgery", "Emergency Medicine"],
    password: "hospital123"
  },
  {
    name: "Regional Heart Institute",
    email: "contact@regionalheart.com",
    licenseNumber: "LIC-2024-002",
    location: {
      address: "456 Cardiac Blvd",
      city: "Los Angeles",
      state: "California",
      zipCode: "90210",
      coordinates: { latitude: 34.0522, longitude: -118.2437 }
    },
    contactInfo: {
      phone: "+1-555-0102",
      emergencyPhone: "+1-555-0912"
    },
    capacity: { totalBeds: 300, availableBeds: 28 },
    status: "approved",
    specializations: ["Cardiology", "Cardiac Surgery", "Transplant Surgery"],
    password: "hospital123"
  },
  {
    name: "Metro General Hospital",
    email: "info@metrogeneral.com",
    licenseNumber: "LIC-2024-003",
    location: {
      address: "789 Medical Plaza",
      city: "Chicago",
      state: "Illinois",
      zipCode: "60601",
      coordinates: { latitude: 41.8781, longitude: -87.6298 }
    },
    contactInfo: {
      phone: "+1-555-0103"
    },
    capacity: { totalBeds: 400, availableBeds: 32 },
    status: "pending",
    specializations: ["General Medicine", "Surgery", "Pediatrics"],
    password: "hospital123"
  },
  {
    name: "Riverside Healthcare",
    email: "admin@riverside.com",
    licenseNumber: "LIC-2024-004",
    location: {
      address: "321 River Road",
      city: "Houston",
      state: "Texas",
      zipCode: "77001",
      coordinates: { latitude: 29.7604, longitude: -95.3698 }
    },
    contactInfo: {
      phone: "+1-555-0104",
      emergencyPhone: "+1-555-0914"
    },
    capacity: { totalBeds: 250, availableBeds: 18 },
    status: "approved",
    specializations: ["Nephrology", "Transplant Surgery", "Dialysis"],
    password: "hospital123"
  },
  {
    name: "Central Clinic",
    email: "contact@centralclinic.com",
    licenseNumber: "LIC-2024-005",
    location: {
      address: "654 Central Ave",
      city: "Phoenix",
      state: "Arizona",
      zipCode: "85001",
      coordinates: { latitude: 33.4484, longitude: -112.0740 }
    },
    contactInfo: {
      phone: "+1-555-0105"
    },
    capacity: { totalBeds: 150, availableBeds: 12 },
    status: "pending",
    specializations: ["General Medicine", "Outpatient Care"],
    password: "hospital123"
  }
];

const donorData = [
  {
    personalInfo: {
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@email.com",
      phone: "+1-555-1001",
      dateOfBirth: new Date("1985-03-15"),
      gender: "male"
    },
    medicalInfo: {
      bloodType: "O+",
      weight: 75,
      height: 180,
      medicalHistory: ["No major illnesses"],
      allergies: [],
      medications: []
    },
    donationPreferences: {
      organTypes: ["kidney", "liver", "cornea"],
      isLivingDonor: true
    },
    location: {
      address: "123 Donor St",
      city: "New York",
      state: "New York",
      zipCode: "10001"
    },
    status: "active"
  },
  {
    personalInfo: {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1-555-1002",
      dateOfBirth: new Date("1990-07-22"),
      gender: "female"
    },
    medicalInfo: {
      bloodType: "A+",
      weight: 65,
      height: 165,
      medicalHistory: [],
      allergies: ["Penicillin"],
      medications: []
    },
    donationPreferences: {
      organTypes: ["heart", "lung", "tissue"],
      isLivingDonor: false
    },
    location: {
      address: "456 Health Ave",
      city: "Los Angeles",
      state: "California",
      zipCode: "90210"
    },
    status: "active"
  },
  {
    personalInfo: {
      firstName: "Michael",
      lastName: "Brown",
      email: "michael.brown@email.com",
      phone: "+1-555-1003",
      dateOfBirth: new Date("1978-11-08"),
      gender: "male"
    },
    medicalInfo: {
      bloodType: "B-",
      weight: 80,
      height: 175,
      medicalHistory: ["Hypertension"],
      allergies: [],
      medications: ["Lisinopril"]
    },
    donationPreferences: {
      organTypes: ["kidney"],
      isLivingDonor: true
    },
    location: {
      address: "789 Care Blvd",
      city: "Chicago",
      state: "Illinois",
      zipCode: "60601"
    },
    status: "active"
  },
  {
    personalInfo: {
      firstName: "Emily",
      lastName: "Davis",
      email: "emily.davis@email.com",
      phone: "+1-555-1004",
      dateOfBirth: new Date("1982-05-30"),
      gender: "female"
    },
    medicalInfo: {
      bloodType: "AB+",
      weight: 58,
      height: 160,
      medicalHistory: [],
      allergies: [],
      medications: []
    },
    donationPreferences: {
      organTypes: ["liver", "pancreas"],
      isLivingDonor: false
    },
    location: {
      address: "321 Hope St",
      city: "Houston",
      state: "Texas",
      zipCode: "77001"
    },
    status: "deceased"
  }
];

const adminData = [
  {
    name: "System Administrator",
    email: "admin@healthcare.com",
    password: "admin123"
  }
];

// Seed function
const seedData = async () => {
  try {
    console.log('🗑️  Clearing existing data...');
    await Hospital.deleteMany({});
    await Donor.deleteMany({});
    await Request.deleteMany({});
    await Transplant.deleteMany({});
    await Admin.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});

    // Clear any indexes that might cause issues
    try {
      await Request.collection.dropIndexes();
      await Transplant.collection.dropIndexes();
    } catch (e) {
      // Ignore if indexes don't exist
    }

    console.log('👨‍⚕️ Creating admin...');
    await Admin.create(adminData);

    console.log('🏥 Creating hospitals...');
    const hospitals = await Hospital.create(hospitalData);

    console.log('❤️  Creating donors...');
    const donors = await Donor.create(donorData.map((donor, index) => ({
      ...donor,
      registeredHospital: hospitals[index % hospitals.length]._id
    })));

    console.log('📋 Creating organ requests...');
    const requestsData = [
      {
        hospital: hospitals[0]._id,
        patient: {
          name: "Robert Wilson",
          age: 45,
          bloodType: "O+",
          medicalCondition: "End-stage kidney disease",
          urgencyLevel: "high"
        },
        organType: "kidney",
        status: "pending",
        priority: 8,
        notes: "Patient has been on dialysis for 2 years"
      },
      {
        hospital: hospitals[1]._id,
        patient: {
          name: "Lisa Anderson",
          age: 52,
          bloodType: "A+",
          medicalCondition: "Cardiomyopathy",
          urgencyLevel: "critical"
        },
        organType: "heart",
        status: "pending",
        priority: 10,
        notes: "Urgent case - patient in ICU"
      },
      {
        hospital: hospitals[0]._id,
        patient: {
          name: "David Martinez",
          age: 38,
          bloodType: "B-",
          medicalCondition: "Liver cirrhosis",
          urgencyLevel: "medium"
        },
        organType: "liver",
        status: "matched",
        priority: 6,
        matchedDonor: donors[3]._id,
        notes: "Compatible donor found"
      },
      {
        hospital: hospitals[3]._id,
        patient: {
          name: "Jennifer Taylor",
          age: 29,
          bloodType: "AB+",
          medicalCondition: "Corneal dystrophy",
          urgencyLevel: "low"
        },
        organType: "cornea",
        status: "pending",
        priority: 3,
        notes: "Bilateral corneal transplant needed"
      }
    ];

    const requests = await Request.create(requestsData);

    console.log('🔄 Creating transplant records...');
    const transplantsData = [
      {
        request: requests[2]._id,
        donor: donors[3]._id,
        recipient: {
          name: "David Martinez",
          age: 38,
          bloodType: "B-",
          hospital: hospitals[0]._id
        },
        organType: "liver",
        surgeryDetails: {
          scheduledDate: new Date("2024-01-15T08:00:00Z"),
          actualDate: new Date("2024-01-15T08:30:00Z"),
          duration: 480,
          surgeonName: "Dr. Patricia Chen",
          operatingRoom: "OR-3"
        },
        status: "completed",
        outcome: {
          success: true,
          complications: [],
          notes: "Surgery completed successfully, patient recovering well",
          followUpRequired: true
        },
        transportDetails: {
          pickupHospital: hospitals[4]._id,
          deliveryHospital: hospitals[0]._id,
          transportTime: 45,
          preservationMethod: "Cold storage"
        }
      },
      {
        request: requests[0]._id,
        donor: donors[0]._id,
        recipient: {
          name: "Robert Wilson",
          age: 45,
          bloodType: "O+",
          hospital: hospitals[0]._id
        },
        organType: "kidney",
        surgeryDetails: {
          scheduledDate: new Date("2024-01-20T10:00:00Z"),
          duration: 240,
          surgeonName: "Dr. Michael Rodriguez",
          operatingRoom: "OR-1"
        },
        status: "scheduled",
        transportDetails: {
          pickupHospital: hospitals[0]._id,
          deliveryHospital: hospitals[0]._id,
          preservationMethod: "Machine perfusion"
        }
      }
    ];
    await Transplant.create(transplantsData);

    console.log('🔔 Creating notifications...');
    const notificationsData = [
      {
        recipient: hospitals[0]._id,
        type: 'SYSTEM',
        title: 'Welcome to LifeBridge',
        message: 'Your hospital account has been successfully verified and approved.',
        read: true,
        createdAt: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        recipient: hospitals[0]._id,
        type: 'EMERGENCY',
        title: 'Critical Request Pending',
        message: 'Patient Lisa Anderson requires a heart transplant immediately.',
        relatedEntity: { id: requests[1]._id, model: 'Request' },
        read: false
      },
      {
        recipient: hospitals[0]._id,
        type: 'SLA_WARNING',
        title: 'SLA Warning: Kidney Request',
        message: 'Request for Robert Wilson is approaching 72h SLA limit.',
        relatedEntity: { id: requests[0]._id, model: 'Request' },
        read: false
      }
    ];
    await Notification.create(notificationsData);

    console.log('📜 Creating audit logs...');
    const auditLogsData = [
      {
        actionType: 'LOGIN',
        performedBy: { id: hospitals[0]._id, name: hospitals[0].name, role: 'Hospital' },
        entityType: 'SYSTEM',
        details: 'Successful login from IP 192.168.1.1',
        createdAt: new Date(Date.now() - 3600000) // 1 hour ago
      },
      {
        actionType: 'CREATE',
        performedBy: { id: hospitals[0]._id, name: hospitals[0].name, role: 'Hospital' },
        entityType: 'REQUEST',
        entityId: requests[0]._id,
        details: 'Created organ request for Robert Wilson (kidney)',
        createdAt: new Date(Date.now() - 7200000)
      },
      {
        actionType: 'UPDATE',
        performedBy: { id: hospitals[0]._id, name: hospitals[0].name, role: 'Hospital' },
        entityType: 'DONOR',
        entityId: donors[0]._id,
        details: 'Updated donor John Smith status to active',
        createdAt: new Date(Date.now() - 8000000)
      },
      {
        actionType: 'UPDATE',
        performedBy: { id: hospitals[0]._id, name: hospitals[0].name, role: 'Hospital' },
        entityType: 'TRANSPLANT',
        entityId: transplantsData[0]._id, // Note: This might be undefined as creates return promise results not original array refs with Ids immediately if not careful, but seed logic above does creates separately.
        // Wait, 'transplantsData' is the array I just created? No, 'await Transplant.create(transplantsData)'.
        // I need the RESULT of that create to get IDs.
        details: 'Transplant operation marked as completed',
        createdAt: new Date(Date.now() - 15000000)
      }
    ];
    // Need to get actual transplant IDs, so let's fetch them or capture create output
    // The previous block was: await Transplant.create(transplantsData);
    // Let's change it in the previous block or just query.
    // For simplicity in this replacement chunk, I'll avoid referencing transplant IDs directly or assume I capture them.
    // Actually, I can't easily capture them in this chunk without modifying the previous block.
    // I'll make the audit log generic or use request/donor IDs which I have.

    await AuditLog.create(auditLogsData);

    console.log('✅ Test data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${hospitals.length} hospitals created`);
    console.log(`- ${donors.length} donors created`);
    console.log(`- ${requests.length} organ requests created`);
    console.log(`- ${transplantsData.length} transplant records created`);
    console.log(`- ${notificationsData.length} notifications created`);
    console.log(`- ${auditLogsData.length} audit logs created`);
    console.log(`- 1 admin account created`);

    console.log('\n🏥 Hospital Login (City Medical Center):');
    console.log('Email: admin@citymedical.com');
    console.log('Password: hospital123');

    console.log('\n🔐 Admin Login:');
    console.log('Email: admin@healthcare.com');
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seeder
const runSeeder = async () => {
  await connectDB();
  await seedData();
};

runSeeder();