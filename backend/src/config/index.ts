import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: '7d',
  },

  // PayHere
  payhere: {
    merchantId: process.env.PAYHERE_MERCHANT_ID!,
    merchantSecret: process.env.PAYHERE_MERCHANT_SECRET!,
    sandbox: process.env.PAYHERE_SANDBOX === 'true',
    baseUrl: process.env.PAYHERE_SANDBOX === 'true'
      ? 'https://sandbox.payhere.lk'
      : 'https://www.payhere.lk',
  },

  // Firebase
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  },

  // Business
  business: {
    name: process.env.RESTAURANT_NAME || 'RealTaste',
    phone: process.env.RESTAURANT_PHONE || '+94771234567',
    openTime: process.env.BUSINESS_OPEN_TIME || '10:00',
    closeTime: process.env.BUSINESS_CLOSE_TIME || '22:00',
    timezone: 'Asia/Colombo',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },

  // CORS
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? [
          process.env.FRONTEND_URL || 'https://realtaste.pages.dev',
          'https://*.pages.dev',
          'https://realtaste.pages.dev'
        ]
      : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  },
};

// Validate required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
