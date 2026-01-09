import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import apiRoutes from './routes/api';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const allowedOrigins = [
  'http://localhost:8081',
  'http://localhost:19006',
  'exp://localhost:8081'
];

app.use(cors({
  origin: true, // Allow all origins in dev/test for easier mobile connectivity
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', apiRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on http://0.0.0.0:${PORT}`);
});
