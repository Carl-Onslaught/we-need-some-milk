const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const { MONGO_OPTIONS } = require('./config');

async function updateAdminCredentials() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);

    // Find the admin user
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.log('No admin user found. Creating new admin user...');
      // Create new admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Ridge1228', salt);
      
      const newAdmin = new User({
        username: 'WClickAdmin',
        email: 'admin@wealthclicks.com',
        password: hashedPassword,
        role: 'admin',
        status: 'approved',
        approvedAt: new Date(),
        isActive: true
      });
      
      await newAdmin.save();
      console.log('New admin user created successfully!');
    } else {
      console.log('Admin user found. Updating credentials...');
      // Update existing admin credentials
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Ridge1228', salt);
      
      admin.username = 'WClickAdmin';
      admin.password = hashedPassword;
      admin.isActive = true;
      
      await admin.save();
      console.log('Admin credentials updated successfully!');
    }

    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateAdminCredentials(); 