import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
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

// Connect to MongoDB
connectDB().then(async (conn) => {
  if (conn) {
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[Init] No users found. Running initial database seed...');
        await seedDatabase();
      }
    } catch (e) {
      console.error('[Init Seed Error]', e.message);
    }
  }
});

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Static uploads folder
const uploadsPath = path.resolve('uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// API Root Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
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
