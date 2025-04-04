// app.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { CorsOptions } from 'cors';
const app = express();
import questionRoutes from './routes/question.routes'

const whitelist: string[] = [
  'https://assign-mate-3hzc.vercel.app',
  'http://localhost:3000'
];

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api', questionRoutes);

// Define a simple test route
app.get('/', (req, res) => {
  res.send('Hello from Assignment App Backend!');
});

export default app;
