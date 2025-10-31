import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

// Routes
import authRoutes from './routes/auth.js';
import mailRoutes from './routes/mail.js';
import templatesRoutes from './routes/templates.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// === MIDDLEWARE ===
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// === ROUTES ===
app.use('/api/auth', authRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/templates', templatesRoutes);

// === SANTÉ CHECK ===
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// === ERREUR 404 ===
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// === DÉMARRAGE ===
app.listen(PORT, () => {
  console.log(`🚀 RétroBus Mail API running on port ${PORT}`);
  console.log(`📧 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`💾 Database: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
});

export default app;
