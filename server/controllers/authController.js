const User = require('../models/User');
const Transaction = require('../models/Transaction');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email or username'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: req.body.role || 'user', // Use role from request, default to 'user'
      isActive: false, // Users start as inactive
      status: 'pending' // Users start as pending
    });

    // Handle referral if code provided
    if (req.body.referralCode) {
      const referrer = await User.findOne({ referralCode: req.body.referralCode });
      if (referrer) {
        user.referrer = referrer._id;
        // Referral bonus will be processed upon admin approval, not here.
      }
    }

    await user.save();

    // Create registration transaction
    await new Transaction({
      user: user._id,
      type: 'registration',
      amount: -100, // Registration fee
      description: 'Registration fee',
      status: 'completed'
    }).save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error during registration' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    console.log('Raw request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const { username, email, password } = req.body;
    console.log('Parsed login data:', { username, email, hasPassword: !!password });

    if (!username && !email) {
      console.log('Login failed: No username or email provided');
      return res.status(400).json({ message: 'Username or email is required' });
    }

    if (!password) {
      console.log('Login failed: No password provided');
      return res.status(400).json({ message: 'Password is required' });
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username }, { email }]
    }).select('+password'); // Include password field
    
    console.log('User found:', {
      id: user?._id,
      username: user?.username,
      email: user?.email,
      role: user?.role,
      isActive: user?.isActive,
      passwordHashLength: user?.password?.length
    });
    
    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    console.log('User found:', user ? {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    } : 'No user found');

    if (!user) {
      console.log('Login failed: User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check user status and activity
    console.log('User status:', {
      status: user.status,
      isActive: user.isActive,
      approvedAt: user.approvedAt,
      rejectedAt: user.rejectedAt
    });

    // Check if user is active
    if (!user.isActive) {
      console.log('Login failed: User account is inactive');
      return res.status(401).json({ 
        message: 'Account is not active. Please contact support.',
        details: {
          status: user.status,
          isActive: user.isActive
        }
      });
    }

    // Check if user is approved
    if (user.status !== 'approved') {
      console.log('Login failed: User not approved');
      return res.status(401).json({ 
        message: 'Account is pending approval. Please wait for admin to approve your account.',
        details: {
          status: user.status,
          isActive: user.isActive
        }
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      console.log('Login failed: Password mismatch');
      return res.status(401).json({ 
        message: 'Invalid credentials',
        details: {
          status: user.status,
          isActive: user.isActive
        }
      });
    }

    // Generate token
    const token = generateToken(user._id);
    console.log('Login successful, token generated');

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
}; 