// ============================================
// app.js - Express Application Setup
// ============================================
// Configures the Express app with CORS, body parsing,
// API routes, and error handling.
// ============================================

import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

const app = express(); // Express app instance (Express.js: Application Setup)

// --- Middleware ---
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean); // removes undefined if CLIENT_URL isn't set

app.use(cors({
  origin: function (origin, callback) {
    if (
      !origin || // allow non-browser requests (like curl/Postman)
      allowedOrigins.includes(origin) ||
      /^https:\/\/jay-ai-resume-builder.*\.vercel\.app$/.test(origin) // allow any Vercel preview/production URL for this project
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
})); // CORS middleware (Express.js: Middleware)

app.use(express.json({ limit: '10mb' })); // JSON body parser (Express.js: Middleware)

// --- Routes ---
app.use('/api', routes); // Route mounting (Express.js: Route Organization)

// --- Error Handling ---
app.use(notFoundHandler);
app.use(errorHandler);

export default app;