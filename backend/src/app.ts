import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';
import { startBackgroundJobs } from './jobs/tracker.job';

import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import wishlistRoutes from './routes/wishlist.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import notificationRoutes from './routes/notification.routes';
import budgetRoutes from './routes/budget.routes';
import aiRoutes from './routes/ai.routes';
import adminRoutes from './routes/admin.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger Docs Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'WishWise API Server',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/wishlists', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/assistant', aiRoutes);
app.use('/api/admin', adminRoutes);

// Error Middleware
app.use(errorHandler);

// Start Server & Background Jobs
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`WishWise Backend Server running on port ${PORT}`);
    logger.info(`API Docs available at http://localhost:${PORT}/api-docs`);
    startBackgroundJobs();
  });
}

export default app;
