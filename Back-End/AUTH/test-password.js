require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User.model');

async function testPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ email: 'jtdhamodharan@gmail.com' }).select('+password');
    
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }
    
    const passwords = ['Prestige123!', 'NewPass123!@#', 'Admin123!@#'];
    
    console.log('\nTesting passwords:');
    for (const pwd of passwords) {
      const isValid = await user.comparePassword(pwd);
      console.log(`  ${pwd}: ${isValid ? '✅ VALID' : '❌ Invalid'}`);
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testPassword();
