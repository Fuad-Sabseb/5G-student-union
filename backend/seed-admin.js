require('dotenv').config();
const mongoose = require('mongoose');
const Member = require('./models/Member');
const connectDB = require('./config/db');

async function seed() {
  await connectDB();

  console.log('Checking existing admin account...');
  const existingAdmin = await Member.findOne({ email: 'admin@gbsg.org' });

  if (existingAdmin) {
    existingAdmin.role = 'admin';
    existingAdmin.membershipStatus = 'active';
    await existingAdmin.save();
    console.log('✓ Admin account already exists: admin@gbsg.org (Password: Admin123!)');
  } else {
    const admin = await Member.create({
      fullName: 'GBSG Union Admin',
      email: 'admin@gbsg.org',
      password: 'Admin123!',
      role: 'admin',
      membershipStatus: 'active',
      leadershipPosition: 'System Administrator',
      campus: 'Jimma University Main Campus',
      department: 'Executive Administration',
      preferredLanguage: 'or',
    });
    console.log('✓ Admin account successfully created!');
    console.log('  Email:    admin@gbsg.org');
    console.log('  Password: Admin123!');
  }

  const allMembers = await Member.find().select('fullName email role membershipStatus');
  console.log('\n--- Current Database Members (' + allMembers.length + ') ---');
  allMembers.forEach((m, idx) => {
    console.log(`${idx + 1}. ${m.fullName} (${m.email}) - Role: [${m.role}] Status: [${m.membershipStatus}]`);
  });
  console.log('------------------------------------\n');

  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed Error:', err.message);
  process.exit(1);
});
