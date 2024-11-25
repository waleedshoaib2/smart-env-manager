import { createEnv } from '../src/EnvManager';

const env = createEnv({
  PORT: {
    type: 'number',
    required: true,
    description: 'Port number for the server',
  },
  API_URL: {
    type: 'string',
    required: true,
    description: 'Base URL for API calls',
  },
  DEBUG: {
    type: 'boolean',
    required: false, // explicitly set to false
    default: false,
    description: 'Enable debug mode',
  },
  FEATURE_FLAGS: {
    type: 'array',
    required: false, // explicitly set to false
    default: [],
    description: 'Enabled feature flags',
  },
});

// Type-safe access to environment variables
const port: number = env.get('PORT');
const apiUrl: string = env.get('API_URL');
const debug: boolean = env.get('DEBUG');
const features: string[] = env.get('FEATURE_FLAGS');

console.log('Server Configuration:');
console.log('-------------------');
console.log(`Port: ${port}`);
console.log(`API URL: ${apiUrl}`);
console.log(`Debug Mode: ${debug}`);
console.log(`Enabled Features: ${features.join(', ')}`);