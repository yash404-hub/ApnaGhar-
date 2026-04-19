const bcrypt = require('bcryptjs');
const { db } = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();

const seedData = async () => {
  try {
    // Clear existing data
    db.get('users').remove().write();
    db.get('tenants').remove().write();

    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash('adminpassword', salt);
    const hashedTenantPassword = await bcrypt.hash('tenant123', salt);

    // Create Owner
    const owner = {
      _id: 'owner123',
      name: 'Admin Owner',
      phone: '1234567890',
      password: hashedAdminPassword,
      role: 'OWNER',
      createdAt: new Date().toISOString()
    };

    // Create Tenant User
    const tenantUser = {
      _id: 'tenant_user_1',
      name: 'John Doe',
      phone: '9876543210',
      password: hashedTenantPassword,
      role: 'TENANT',
      createdAt: new Date().toISOString()
    };

    db.get('users').push(owner).push(tenantUser).write();

    // Create Tenant Profile
    const tenantProfile = {
      _id: 'tenant_profile_1',
      user: 'tenant_user_1',
      age: 25,
      aadhaarNumber: '123456789012',
      roomNumber: 'A-101',
      rentAmount: 5000,
      rentPaidStatus: 'Paid',
      paymentHistory: [
        {
          amount: 5000,
          date: new Date().toISOString(),
          status: 'Paid',
          month: 'April 2026'
        }
      ],
      fatherName: 'Robert Doe',
      motherName: 'Mary Doe',
      emergencyContact: '9988776655',
      reasonForStay: 'Working nearby',
      joiningDate: new Date().toISOString(),
      wifiEnabled: true,
      wifiDetails: {
        name: 'ApnaGhar_WiFi',
        password: 'apnaghar@123'
      },
      createdAt: new Date().toISOString()
    };

    db.get('tenants').push(tenantProfile).write();

    console.log('Seed data created successfully!');
    console.log('Owner: 1234567890 / adminpassword');
    console.log('Tenant: 9876543210 / tenant123');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
