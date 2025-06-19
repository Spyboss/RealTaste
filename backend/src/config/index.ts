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
    // API credentials for advanced integration
    apiAppId: process.env.PAYHERE_API_APP_ID!,
    apiAppSecret: process.env.PAYHERE_API_APP_SECRET!,
    // Use sandbox unless explicitly set to use live PayHere
    sandbox: process.env.USE_LIVE_PAYHERE !== 'true',
    baseUrl: process.env.USE_LIVE_PAYHERE === 'true'
      ? 'https://www.payhere.lk/pay/checkout'
      : 'https://sandbox.payhere.lk/pay/checkout',
    // Backend URL for callbacks (supports both local dev and deployed environments)
    backendUrl: process.env.BACKEND_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://realtaste.fly.dev'
        : 'http://localhost:3001'),
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
    phone: process.env.RESTAURANT_PHONE || '+94 76 195 2541',
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

// Debug logging for PayHere configuration
console.log('🔧 Config Debug - PayHere Settings:');
console.log(`   USE_LIVE_PAYHERE env var: "${process.env.USE_LIVE_PAYHERE}"`);
console.log(`   Parsed sandbox boolean: ${config.payhere.sandbox}`);
console.log(`   Base URL: ${config.payhere.baseUrl}`);
