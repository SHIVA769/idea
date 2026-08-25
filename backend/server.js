import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

import { connectDB } from './config/db.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { User } from './models/User.js';
import { seedDatabase } from './seeds/seedData.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import superAdminRoutes from './routes/superAdminRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import storefrontRoutes from './routes/storefrontRoutes.js';
import customerRoutes from './routes/customerRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const ensureDemoAccounts = async () => {
  try {
    const demoAccounts = [
      { email: 'admin@whatsstore.io', password: 'admin123' },
      { email: 'owner@luxeretail.com', password: 'owner123' },
    ];

    for (const account of demoAccounts) {
      const user = await User.findOne({ email: account.email });
      if (!user) continue;

      user.password = account.password;
      user.status = 'active';
      await user.save();
    }

    console.log('[Init] Demo account credentials synchronized.');
  } catch (e) {
    console.error('[Init Demo Restore Error]', e.message);
  }
};

// Connect to MongoDB
connectDB().then(async (conn) => {
  if (conn) {
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[Init] No users found. Running initial database seed...');
        await seedDatabase();
      } else {
        await ensureDemoAccounts();
      }
    } catch (e) {
      console.error('[Init Seed Error]', e.message);
    }
  }

}).catch((error) => {
  console.error(`[Startup Error] ${error.message}`);
});

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Do not let Mongoose buffer requests indefinitely when the database is offline.
app.use('/api', (req, res, next) => {
  if (req.path === '/health' || mongoose.connection.readyState === 1) return next();
  return res.status(503).json({
    success: false,
    message: 'Database unavailable. Please try again when the server is connected to MongoDB.',
  });
});

// Static uploads folder
const uploadsPath = path.resolve('uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// API Root Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: mongoose.connection.readyState === 1 ? 'online' : 'degraded',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'unavailable',
    app: 'WhatsStore SaaS REST API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/storefront', storefrontRoutes);
app.use('/api/customer', customerRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`  WhatsStore SaaS Server running on port ${PORT}`);
  console.log(`  API Health: http://localhost:${PORT}/api/health`);
  console.log(`=============================================`);
});
