const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'agent', 'user'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  approvedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  referralCode: {
    type: String,
    unique: true
  },
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  wallet: {
    type: Number,
    default: 0
  },
  clickEarnings: {
    type: Number,
    default: 0
  },
  // Daily click count (resets each calendar day based on lastClick field)
  dailyClicks: {
    type: Number,
    default: 0
  },
  dailyClickEarnings: {
    type: Number,
    default: 0
  },
  lastClick: {
    type: Date
  },
  level: {
    type: Number,
    enum: [1, 2, 3],
    default: 1
  },

  investments: [{
    package: {
      type: Number,
      enum: [1, 2]  // 1 for Package 1, 2 for Package 2
    },
    amount: Number,
    startDate: Date,
    endDate: Date,
    interest: Number,
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active'
    }
  }],
  referralEarnings: {
    direct: {
      type: Number,
      default: 0
    },
    indirect: {
      type: Number,
      default: 0
    }
  },
  sharedEarnings: {
    type: Number,
    default: 0
  },
  totalWithdraw: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hash password before saving if it's not already hashed
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  // Check if the password is already a bcrypt hash
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

// Generate referral code
userSchema.pre('save', function(next) {
  if (!this.referralCode) {
    this.referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  console.log('Comparing passwords:', {
    candidatePassword: candidatePassword ? '(password provided)' : '(no password)',
    storedPasswordFormat: this.password.substring(0, 7) + '...', // Only show format for security
    passwordLength: this.password.length
  });
  
  // Check if stored password is a valid bcrypt hash
  const isValidHash = this.password.startsWith('$2a$') || this.password.startsWith('$2b$');
  console.log('Is valid bcrypt hash:', isValidHash);
  
  if (!isValidHash) {
    console.log('Stored password is not a valid bcrypt hash');
    return false;
  }
  
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Password match result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

// Generate referral code before saving
userSchema.pre('save', async function(next) {
  if (!this.referralCode) {
    // Generate a random 6-character code
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    // Keep generating until we find a unique code
    let code;
    let isUnique = false;
    while (!isUnique) {
      code = generateCode();
      const existingUser = await mongoose.models.User.findOne({ referralCode: code });
      if (!existingUser) {
        isUnique = true;
      }
    }

    this.referralCode = code;
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User; 