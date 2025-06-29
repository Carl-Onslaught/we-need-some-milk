const bcrypt = require('bcryptjs');

async function generateHash() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Ridge1228', salt);
    console.log('Hashed password:', hashedPassword);
  } catch (error) {
    console.error('Error:', error);
  }
}

generateHash(); 