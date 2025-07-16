const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const os = require('os');
const fs = require('fs');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const agentRoutes = require('./routes/agent');
const adminRoutes = require('./routes/admin');
const clickRoutes = require('./routes/clicks');
const investmentRoutes = require('./routes/investments');
const userRoutes = require('./routes/user');
const paymentRoutes = require('./routes/paymentRoutes');
const packageRoutes = require('./routes/package');
const publicSettingsRoutes = require('./routes/settings');
const { MONGO_OPTIONS } = require('./config');
const { schedulePackageUpdates } = require('./utils/scheduler');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

logger.info('Starting server...');

// Initialize scheduled tasks
if (process.env.NODE_ENV !== 'test') {
    schedulePackageUpdates();
    logger.info('Scheduled tasks initialized');
}

// Create Express app and HTTP server
const app = express();
const server = require('http').createServer(app);

// Initialize Socket.IO with CORS
const io = require('socket.io')(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      `https://${process.env.DOMAIN_NAME}` // TODO: Change this to your actual frontend domain before deploying
    ],
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  allowEIO3: true,
  transports: ['polling', 'websocket'],
  path: '/socket.io/',
  serveClient: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  maxHttpBufferSize: 1e8
});

// Make io available globally for use in controllers
global.io = io;

// Handle Socket.IO connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });
});

// Make io available globally
global.io = io;

console.log('Express app and WebSocket server created.');

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    `https://${process.env.DOMAIN_NAME}` // TODO: Change this to your actual frontend domain before deploying
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan('dev'));

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Set up logging
const logStream = fs.createWriteStream(path.join(logsDir, 'server.log'), { flags: 'a' });

// Override console.error to log to file
const originalConsoleError = console.error;
console.error = (...args) => {
  originalConsoleError.apply(console, args);
  logStream.write(`${new Date().toISOString()} - ${args.join(' ')}\n`);
};

// Database connection with retry logic
const connectWithRetry = async () => {
  try {
    console.log('Attempting MongoDB connection...', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);
    console.log('Connected to MongoDB successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

// Initial connection attempt
console.log('Starting MongoDB connection...');
connectWithRetry();

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
  connectWithRetry();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/clicks', clickRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/package', packageRoutes);
app.use('/api/settings', publicSettingsRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Wealth Clicks API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  console.error('Error details:', {
    message: err.message,
    name: err.name,
    code: err.code
  });
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5001;

// Improved error handling for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the server at:`);
  console.log(`- Local: http://localhost:${PORT}`);
  console.log(`- Network: http://${getLocalIP()}:${PORT}`);
});

// Add this helper function to get the local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const devName of Object.keys(interfaces)) {
    const iface = interfaces[devName];
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return 'localhost';
} 