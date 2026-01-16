const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Hospital = require('./models/Hospital');
const Donor = require('./models/Donor');
const Request = require('./models/Request');
const Transplant = require('./models/Transplant');

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

// Extended hospital data
const extendedHospitalData = [
  {
    name: "St. Mary's Medical Center",
    email: "admin@stmarys.com",
    licenseNumber: "LIC-2024-006",
    location: {
      address: "890 Saint Mary Rd",
      city: "Miami",
      state: "Florida",
      zipCode: "33101",
      coordinates: { latitude: 25.7617, longitude: -80.1918 }
    },
    contactInfo: {
      phone: "+1-555-0106",
      emergencyPhone: "+1-555-0916"
    },
    capacity: { totalBeds: 350, availableBeds: 42 },
    status: "approved",
    specializations: ["Oncology", "Transplant Surgery", "Intensive Care"],
    password: "hospital123"
  },
  {
    name: "University Medical Center",
    email: "contact@umc.edu",
    licenseNumber: "LIC-2024-007",
    location: {
      address: "1200 University Ave",
      city: "Seattle",
      state: "Washington",
      zipCode: "98101",
      coordinates: { latitude: 47.6062, longitude: -122.3321 }
    },
    contactInfo: {
      phone: "+1-555-0107"
    },
    capacity: { totalBeds: 600, availableBeds: 55 },
    status: "pending",
    specializations: ["Research", "Teaching Hospital", "All Specialties"],
    password: "hospital123"
  },
  {
    name: "Emergency Plus Hospital",
    email: "info@emergencyplus.com",
    licenseNumber: "LIC-2024-008",
    location: {
      address: "555 Emergency Blvd",
      city: "Denver",
      state: "Colorado",
      zipCode: "80201",
      coordinates: { latitude: 39.7392, longitude: -104.9903 }
    },
    contactInfo: {
      phone: "+1-555-0108",
      emergencyPhone: "+1-555-0918"
    },
    capacity: { totalBeds: 200, availableBeds: 25 },
    status: "approved",
    specializations: ["Emergency Medicine", "Trauma Surgery", "Critical Care"],
    password: "hospital123"
  },
  {
    name: "Children's Healthcare",
    email: "admin@childrens.com",
    licenseNumber: "LIC-2024-009",
    location: {
      address: "777 Kids Way",
      city: "Atlanta",
      state: "Georgia",
      zipCode: "30301",
      coordinates: { latitude: 33.7490, longitude: -84.3880 }
    },
    contactInfo: {
      phone: "+1-555-0109",
      emergencyPhone: "+1-555-0919"
    },
    capacity: { totalBeds: 180, availableBeds: 20 },
    status: "pending",
    specializations: ["Pediatrics", "Pediatric Surgery", "NICU"],
    password: "hospital123"
  },
  {
    name: "Veterans Medical Center",
    email: "contact@va.gov",
    licenseNumber: "LIC-2024-010",
    location: {
      address: "999 Veterans Pkwy",
      city: "Boston",
      state: "Massachusetts",
      zipCode: "02101",
      coordinates: { latitude: 42.3601, longitude: -71.0589 }
    },
    contactInfo: {
      phone: "+1-555-0110",
      emergencyPhone: "+1-555-0920"
    },
    capacity: { totalBeds: 400, availableBeds: 38 },
    status: "approved",
    specializations: ["Veterans Care", "PTSD Treatment", "Rehabilitation"],
    password: "hospital123"
  }
];

// Extended donor data
const extendedDonorData = [
  {
    personalInfo: {
      firstName: "Amanda",
      lastName: "Rodriguez",
      email: "amanda.rodriguez@email.com",
      phone: "+1-555-1005",
      dateOfBirth: new Date("1987-09-12"),
      gender: "female"
    },
    medicalInfo: {
      bloodType: "O-",
      weight: 62,
      height: 168,
      medicalHistory: [],
      allergies: ["Shellfish"],
      medications: []
    },
    donationPreferences: {
      organTypes: ["heart", "kidney", "liver", "lung"],
      isLivingDonor: false
    },
    location: {
      address: "234 Donor Ave",
      city: "Miami",
      state: "Florida",
      zipCode: "33101"
    },
    status: "active"
  },
  {
    personalInfo: {
      firstName: "James",
      lastName: "Wilson",
      email: "james.wilson@email.com",
      phone: "+1-555-1006",
      dateOfBirth: new Date("1975-12-03"),
      gender: "male"
    },
    medicalInfo: {
      bloodType: "A-",
      weight: 85,
      height: 185,
      medicalHistory: ["Diabetes Type 2"],
      allergies: [],
      medications: ["Metformin"]
    },
    donationPreferences: {
      organTypes: ["cornea", "tissue"],
      isLivingDonor: false
    },
    location: {
      address: "567 Health St",
      city: "Seattle",
      state: "Washington",
      zipCode: "98101"
    },
    status: "active"
  },
  {
    personalInfo: {
      firstName: "Maria",
      lastName: "Garcia",
      email: "maria.garcia@email.com",
      phone: "+1-555-1007",
      dateOfBirth: new Date("1992-04-18"),
      gender: "female"
    },
    medicalInfo: {
      bloodType: "B+",
      weight: 55,
      height: 162,
      medicalHistory: [],
      allergies: [],
      medications: []
    },
    donationPreferences: {
      organTypes: ["kidney"],
      isLivingDonor: true
    },
    location: {
      address: "890 Care Rd",
      city: "Denver",
      state: "Colorado",
      zipCode: "80201"
    },
    status: "active"
  },
  {
    personalInfo: {
      firstName: "Robert",
      lastName: "Thompson",
      email: "robert.thompson@email.com",
      phone: "+1-555-1008",
      dateOfBirth: new Date("1980-08-25"),
      gender: "male"
    },
    medicalInfo: {
      bloodType: "AB-",
      weight: 78,
      height: 177,
      medicalHistory: [],
      allergies: ["Latex"],
      medications: []
    },
    donationPreferences: {
      organTypes: ["liver", "pancreas", "bone"],
      isLivingDonor: false
    },
    location: {
      address: "123 Hope Ave",
      city: "Atlanta",
      state: "Georgia",
      zipCode: "30301"
    },
    status: "deceased"
  },
  {
    personalInfo: {
      firstName: "Linda",
      lastName: "Chen",
      email: "linda.chen@email.com",
      phone: "+1-555-1009",
      dateOfBirth: new Date("1988-06-14"),
      gender: "female"
    },
    medicalInfo: {
      bloodType: "O+",
      weight: 60,
      height: 165,
      medicalHistory: [],
      allergies: [],
      medications: []
    },
    donationPreferences: {
      organTypes: ["kidney", "liver"],
      isLivingDonor: true
    },
    location: {
      address: "456 Wellness Blvd",
      city: "Boston",
      state: "Massachusetts",
      zipCode: "02101"
    },
    status: "matched"
  }
];

// Add more test data
const addExtendedData = async () => {
  try {
    console.log('🏥 Adding more hospitals...');
    const newHospitals = await Hospital.create(extendedHospitalData);

    console.log('❤️  Adding more donors...');
    const newDonors = await Donor.create(extendedDonorData.map((donor, index) => ({
      ...donor,
      registeredHospital: newHospitals[index % newHospitals.length]._id
    })));

    // Get all hospitals for requests
    const allHospitals = await Hospital.find();

    console.log('📋 Adding more organ requests...');
    const moreRequestsData = [
      {
        hospital: newHospitals[0]._id,
        patient: {
          name: "Carlos Mendez",
          age: 34,
          bloodType: "O-",
          medicalCondition: "Acute heart failure",
          urgencyLevel: "critical"
        },
        organType: "heart",
        status: "pending",
        priority: 9,
        notes: "Patient in critical condition, needs immediate transplant"
      },
      {
        hospital: newHospitals[1]._id,
        patient: {
          name: "Susan Lee",
          age: 28,
          bloodType: "A-",
          medicalCondition: "Corneal scarring",
          urgencyLevel: "low"
        },
        organType: "cornea",
        status: "pending",
        priority: 2,
        notes: "Elective procedure, patient can wait"
      },
      {
        hospital: newHospitals[2]._id,
        patient: {
          name: "Thomas Anderson",
          age: 56,
          bloodType: "B+",
          medicalCondition: "Chronic kidney disease",
          urgencyLevel: "high"
        },
        organType: "kidney",
        status: "matched",
        priority: 7,
        matchedDonor: newDonors[2]._id,
        notes: "Living donor match found"
      },
      {
        hospital: newHospitals[3]._id,
        patient: {
          name: "Emma Johnson",
          age: 12,
          bloodType: "AB-",
          medicalCondition: "Liver failure",
          urgencyLevel: "critical"
        },
        organType: "liver",
        status: "pending",
        priority: 10,
        notes: "Pediatric case - urgent liver transplant needed"
      },
      {
        hospital: newHospitals[4]._id,
        patient: {
          name: "William Davis",
          age: 67,
          bloodType: "O+",
          medicalCondition: "COPD",
          urgencyLevel: "medium"
        },
        organType: "lung",
        status: "pending",
        priority: 5,
        notes: "Veteran patient, stable condition"
      }
    ];

    const moreRequests = await Request.create(moreRequestsData);

    console.log('🔄 Adding more transplant records...');
    const moreTransplantsData = [
      {
        request: moreRequests[2]._id,
        donor: newDonors[2]._id,
        recipient: {
          name: "Thomas Anderson",
          age: 56,
          bloodType: "B+",
          hospital: newHospitals[2]._id
        },
        organType: "kidney",
        surgeryDetails: {
          scheduledDate: new Date("2024-01-25T14:00:00Z"),
          actualDate: new Date("2024-01-25T14:15:00Z"),
          duration: 180,
          surgeonName: "Dr. Sarah Kim",
          operatingRoom: "OR-2"
        },
        status: "completed",
        outcome: {
          success: true,
          complications: [],
          notes: "Living donor transplant successful",
          followUpRequired: true
        },
        transportDetails: {
          pickupHospital: newHospitals[2]._id,
          deliveryHospital: newHospitals[2]._id,
          transportTime: 0,
          preservationMethod: "Direct transplant"
        }
      },
      {
        request: moreRequests[3]._id,
        donor: newDonors[3]._id,
        recipient: {
          name: "Emma Johnson",
          age: 12,
          bloodType: "AB-",
          hospital: newHospitals[3]._id
        },
        organType: "liver",
        surgeryDetails: {
          scheduledDate: new Date("2024-02-01T09:00:00Z"),
          duration: 360,
          surgeonName: "Dr. Jennifer Park",
          operatingRoom: "Pediatric OR-1"
        },
        status: "scheduled",
        transportDetails: {
          pickupHospital: newHospitals[4]._id,
          deliveryHospital: newHospitals[3]._id,
          preservationMethod: "Cold storage"
        }
      }
    ];

    await Transplant.create(moreTransplantsData);

    console.log('✅ Extended test data added successfully!');
    console.log('\n📊 Additional Summary:');
    console.log(`- ${newHospitals.length} more hospitals added`);
    console.log(`- ${newDonors.length} more donors added`);
    console.log(`- ${moreRequests.length} more organ requests added`);
    console.log(`- ${moreTransplantsData.length} more transplant records added`);

    // Show current totals
    const totalHospitals = await Hospital.countDocuments();
    const totalDonors = await Donor.countDocuments();
    const totalRequests = await Request.countDocuments();
    const totalTransplants = await Transplant.countDocuments();

    console.log('\n📈 Current Totals:');
    console.log(`- ${totalHospitals} total hospitals`);
    console.log(`- ${totalDonors} total donors`);
    console.log(`- ${totalRequests} total requests`);
    console.log(`- ${totalTransplants} total transplants`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding extended data:', error);
    process.exit(1);
  }
};

// Run the extended seeder
const runExtendedSeeder = async () => {
  await connectDB();
  await addExtendedData();
};

runExtendedSeeder();