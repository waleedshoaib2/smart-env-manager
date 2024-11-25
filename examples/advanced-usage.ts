import { createEnv } from '../src/EnvManager';

// Define custom types for better type safety
interface DatabaseConfig {
  url: string;
  maxConnections: number;
  ssl: boolean;
}

interface CacheConfig {
  host: string;
  port: number;
  ttl: number;
}

interface SecurityConfig {
  apiKeys: string[];
  secretKey: string;
  allowedOrigins: string[];
}

// Create environment configuration with complex validation and transformations
const env = createEnv({
  // Application basics
  NODE_ENV: {
    type: 'string',
    required: true,
    validate: (value: string) => 
      ['development', 'production', 'test', 'staging'].includes(value),
    description: 'Application environment',
  },

  // Server configuration
  PORT: {
    type: 'number',
    default: 3000,
    validate: (port: number) => port >= 1000 && port <= 65535,
    description: 'Port number for the server',
  },

  // Database configuration
  DATABASE_URL: {
    type: 'string',
    required: true,
    validate: (url: string) => url.startsWith('postgresql://'),
    description: 'PostgreSQL connection string',
  },

  DATABASE_MAX_CONNECTIONS: {
    type: 'number',
    default: 20,
    validate: (value: number) => value > 0 && value <= 100,
    description: 'Maximum database connections',
  },

  DATABASE_SSL: {
    type: 'boolean',
    default: true,
    description: 'Enable SSL for database connection',
  },

  // Redis cache configuration
  REDIS_HOST: {
    type: 'string',
    required: true,
    description: 'Redis host address',
  },

  REDIS_PORT: {
    type: 'number',
    default: 6379,
    validate: (port: number) => port >= 1000 && port <= 65535,
    description: 'Redis port number',
  },

  CACHE_TTL: {
    type: 'number',
    default: 3600,
    validate: (ttl: number) => ttl >= 0,
    description: 'Cache TTL in seconds',
  },

  // Security settings
  API_KEYS: {
    type: 'array',
    required: true,
    validate: (keys: string[]) => 
      keys.every(key => key.length >= 32),
    description: 'List of valid API keys',
  },

  SECRET_KEY: {
    type: 'string',
    required: true,
    validate: (key: string) => key.length >= 32,
    description: 'Secret key for JWT signing',
  },

  ALLOWED_ORIGINS: {
    type: 'array',
    default: ['http://localhost:3000'],
    validate: (origins: string[]) => 
      origins.every(origin => origin.startsWith('http')),
    description: 'Allowed CORS origins',
  },

  // Feature flags
  ENABLED_FEATURES: {
    type: 'array',
    default: [],
    description: 'Enabled feature flags',
  },

  // Logging configuration
  LOG_LEVEL: {
    type: 'string',
    default: 'info',
    validate: (level: string) => 
      ['error', 'warn', 'info', 'debug', 'trace'].includes(level),
    description: 'Application log level',
  },
});

// Type-safe access to environment variables
const config = {
  app: {
    env: env.get<string>('NODE_ENV'),
    port: env.get<number>('PORT'),
    logLevel: env.get<string>('LOG_LEVEL'),
    features: env.get<string[]>('ENABLED_FEATURES'),
  },
  database: {
    url: env.get<string>('DATABASE_URL'),
    maxConnections: env.get<number>('DATABASE_MAX_CONNECTIONS'),
    ssl: env.get<boolean>('DATABASE_SSL'),
  } as DatabaseConfig,
  cache: {
    host: env.get<string>('REDIS_HOST'),
    port: env.get<number>('REDIS_PORT'),
    ttl: env.get<number>('CACHE_TTL'),
  } as CacheConfig,
  security: {
    apiKeys: env.get<string[]>('API_KEYS'),
    secretKey: env.get<string>('SECRET_KEY'),
    allowedOrigins: env.get<string[]>('ALLOWED_ORIGINS'),
  } as SecurityConfig,
};

// Helper function to mask sensitive values
const maskSensitiveValue = (value: string): string => {
  if (value.length <= 8) return '*'.repeat(value.length);
  return value.slice(0, 4) + '*'.repeat(value.length - 8) + value.slice(-4);
};

// Print configuration (with sensitive data masked)
console.log('\nApplication Configuration');
console.log('========================');
console.log('\nApplication:');
console.log('------------');
console.log(`Environment: ${config.app.env}`);
console.log(`Port: ${config.app.port}`);
console.log(`Log Level: ${config.app.logLevel}`);
console.log(`Enabled Features: ${config.app.features.join(', ') || 'none'}`);

console.log('\nDatabase:');
console.log('----------');
console.log(`URL: ${maskSensitiveValue(config.database.url)}`);
console.log(`Max Connections: ${config.database.maxConnections}`);
console.log(`SSL Enabled: ${config.database.ssl}`);

console.log('\nCache:');
console.log('-------');
console.log(`Redis Host: ${config.cache.host}`);
console.log(`Redis Port: ${config.cache.port}`);
console.log(`Cache TTL: ${config.cache.ttl}s`);

console.log('\nSecurity:');
console.log('----------');
console.log(`API Keys: ${config.security.apiKeys.map(key => maskSensitiveValue(key)).join(', ')}`);
console.log(`Secret Key: ${maskSensitiveValue(config.security.secretKey)}`);
console.log(`Allowed Origins: ${config.security.allowedOrigins.join(', ')}`);