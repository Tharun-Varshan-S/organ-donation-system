// Mock Hospital Data for Testing
export const MOCK_HOSPITALS = [
  {
    _id: '1',
    name: 'Metro Medical Center',
    status: 'approved',
    location: {
      address: '123 Medical Plaza Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001'
    },
    contactInfo: {
      phone: '(213) 555-0123',
      emergencyPhone: '911-555-0123'
    },
    capacity: {
      totalBeds: 350,
      icuBeds: 45,
      otRooms: 8,
      availableBeds: 120
    },
    specializations: [
      'Kidney Transplant',
      'Liver Transplant',
      'Heart Transplant',
      'Lung Transplant'
    ],
    email: 'contact@metromedical.com',
    approvedAt: '2025-06-15'
  },
  {
    _id: '2',
    name: 'City General Hospital',
    status: 'approved',
    location: {
      address: '456 Healthcare Blvd',
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    },
    contactInfo: {
      phone: '(212) 555-0456',
      emergencyPhone: '911-555-0456'
    },
    capacity: {
      totalBeds: 500,
      icuBeds: 75,
      otRooms: 12,
      availableBeds: 85
    },
    specializations: [
      'Cardiology & Cardiac Transplant',
      'Emergency Services',
      'Pancreas Transplant',
      'Multi-organ Transplant'
    ],
    email: 'info@citygeneralhosp.com',
    approvedAt: '2025-03-20'
  },
  {
    _id: '3',
    name: 'Regional Healthcare',
    status: 'approved',
    location: {
      address: '789 Healing Center Dr',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601'
    },
    contactInfo: {
      phone: '(312) 555-0789',
      emergencyPhone: '911-555-0789'
    },
    capacity: {
      totalBeds: 275,
      icuBeds: 35,
      otRooms: 6,
      availableBeds: 42
    },
    specializations: [
      'General Surgery',
      'Emergency Medicine',
      'Trauma Care',
      'Kidney Transplant'
    ],
    email: 'admin@regionalhealthcare.com',
    approvedAt: '2024-11-08'
  },
  {
    _id: '4',
    name: 'University Hospital',
    status: 'approved',
    location: {
      address: '321 Academic Way',
      city: 'Boston',
      state: 'MA',
      zipCode: '02115'
    },
    contactInfo: {
      phone: '(617) 555-0321',
      emergencyPhone: '911-555-0321'
    },
    capacity: {
      totalBeds: 600,
      icuBeds: 120,
      otRooms: 15,
      availableBeds: 200
    },
    specializations: [
      'Multi-organ Transplant',
      'Research & Innovation',
      'Liver Transplant',
      'Emergency Services'
    ],
    email: 'contact@unihospital.edu',
    approvedAt: '2025-01-05'
  },
  {
    _id: '5',
    name: 'Sunrise Medical Complex',
    status: 'approved',
    location: {
      address: '555 Wellness Plaza',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001'
    },
    contactInfo: {
      phone: '(713) 555-0555',
      emergencyPhone: '911-555-0555'
    },
    capacity: {
      totalBeds: 425,
      icuBeds: 65,
      otRooms: 10,
      availableBeds: 150
    },
    specializations: [
      'Heart Transplant',
      'Lung Transplant',
      'Emergency Surgery',
      'Transplant Coordination'
    ],
    email: 'service@sunrisemedical.com',
    approvedAt: '2025-04-12'
  },
  {
    _id: '6',
    name: 'Phoenix Health Institute',
    status: 'approved',
    location: {
      address: '888 Vitality Ave',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001'
    },
    contactInfo: {
      phone: '(602) 555-0888',
      emergencyPhone: '911-555-0888'
    },
    capacity: {
      totalBeds: 200,
      icuBeds: 30,
      otRooms: 5,
      availableBeds: 55
    },
    specializations: [
      'Kidney Transplant',
      'Pancreas Transplant',
      'Emergency Care',
      'Vascular Surgery'
    ],
    email: 'contact@phoenixhealth.com',
    approvedAt: '2025-02-18'
  }
];
