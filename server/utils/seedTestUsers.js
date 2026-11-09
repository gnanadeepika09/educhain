// utils/seedTestUsers.js
// Creates test student and donor accounts for demo purposes

const User = require('../models/User');
const Student = require('../models/Student');
const Donor = require('../models/Donor');

const seedTestUsers = async () => {
  try {
    // Check if test users already exist
    const testStudent = await User.findOne({ email: 'student@test.com' });
    const testStudent2 = await User.findOne({ email: 'student2@test.com' });
    const testDonor = await User.findOne({ email: 'donor@test.com' });

    // Create test student if doesn't exist
    if (!testStudent) {
      console.log('Creating test student account...');
      const student = await User.create({
        name: 'Test Student',
        email: 'student@test.com',
        password: 'Student@123',
        role: 'student',
        phone: '9393234474',
        isActive: true,
      });

      await Student.create({
        userId: student._id,
        college: 'PVPSIT',
        course: 'B.Tech',
        year: '3rd Year',
        rollNumber: '23501A0523',
        totalFundsReceived: 0,
      });

      console.log('✅ Test student created successfully');
      console.log('   Email: student@test.com');
      console.log('   Password: Student@123');
    } else {
      console.log('✅ Test student already exists');
    }

    // Create second test student if doesn't exist
    if (!testStudent2) {
      console.log('Creating second test student account...');
      const student2 = await User.create({
        name: 'Rajesh Kumar',
        email: 'student2@test.com',
        password: 'Student@123',
        role: 'student',
        phone: '9876543210',
        isActive: true,
      });

      await Student.create({
        userId: student2._id,
        college: 'IIT Delhi',
        course: 'M.Tech',
        year: '2nd Year',
        rollNumber: 'MT22CS001',
        totalFundsReceived: 0,
      });

      console.log('✅ Second test student created successfully');
      console.log('   Email: student2@test.com');
      console.log('   Password: Student@123');
    } else {
      console.log('✅ Second test student already exists');
    }

    // Create test donor if doesn't exist
    if (!testDonor) {
      console.log('Creating test donor account...');
      const donor = await User.create({
        name: 'Test Donor',
        email: 'donor@test.com',
        password: 'Donor@123',
        role: 'donor',
        phone: '8888888888',
        isActive: true,
      });

      await Donor.create({
        userId: donor._id,
        organization: 'Tech Foundation',
        walletAddress: '',
        totalDonated: 0,
      });

      console.log('✅ Test donor created successfully');
      console.log('   Email: donor@test.com');
      console.log('   Password: Donor@123');
    } else {
      console.log('✅ Test donor already exists');
    }

    console.log('');
    console.log('📋 Test Account Summary:');
    console.log('========================================');
    console.log('Admin:    admin@educhain.com / Admin@123');
    console.log('Student1: student@test.com / Student@123');
    console.log('Student2: student2@test.com / Student@123');
    console.log('Donor:    donor@test.com / Donor@123');
    console.log('========================================');
    console.log('');
  } catch (error) {
    console.error('❌ Error creating test users:', error.message);
  }
};

module.exports = seedTestUsers;
