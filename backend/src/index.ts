import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import orderRoutes from './routes/orders';
import inventoryRoutes from './routes/inventory';
import staffRoutes from './routes/staff';
import analyticsRoutes from './routes/analytics';
import stockMovementsRoutes from './routes/stock-movements';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/stock-movements', stockMovementsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`MediStock backend running on port ${PORT}`);
});

export default app;
