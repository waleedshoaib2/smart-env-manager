# Smart Environment Manager

A TypeScript-first environment variable manager that provides type safety, validation, and advanced features for managing environment configurations in Node.js applications.

## Features

- ✅ Full TypeScript support with type inference
- ✅ Runtime validation with Zod
- ✅ Support for string, number, boolean, and array types
- ✅ Required/optional field validation
- ✅ Default values
- ✅ Custom validation rules
- ✅ Detailed error messages
- ✅ Environment-specific configurations

## Installation

```bash
npm install @waleedshoaib/smart-env-manager
```

## Quick Start

```typescript
import { createEnv } from '@waleedshoaib/smart-env-manager';

const env = createEnv({
  NODE_ENV: {
    type: 'string',
    required: true,
    validate: (value) => ['development', 'production', 'test'].includes(value),
  },
  PORT: {
    type: 'number',
    default: 3000,
    validate: (port) => port >= 1000 && port <= 65535,
  },
  DATABASE_URL: {
    type: 'string',
    required: true,
  },
  FEATURE_FLAGS: {
    type: 'array',
    default: [],
  },
});

// Type-safe access to your environment variables
const nodeEnv: string = env.get('NODE_ENV');
const port: number = env.get('PORT');
const dbUrl: string = env.get('DATABASE_URL');
const features: string[] = env.get('FEATURE_FLAGS');
```

## Advanced Usage

### Validation Rules

```typescript
const env = createEnv({
  API_KEY: {
    type: 'string',
    required: true,
    validate: (key) => key.length >= 32,
    description: 'API key for external service',
  },
  ALLOWED_ORIGINS: {
    type: 'array',
    default: ['http://localhost:3000'],
    validate: (origins) => origins.every(origin => origin.startsWith('http')),
  },
});
```

### Type Safety

The package provides full TypeScript support:

```typescript
// TypeScript will ensure type safety
const port = env.get<number>('PORT'); // ✅ Works
const port = env.get<string>('PORT'); // ❌ Type error
```

## API Reference

### createEnv(schema)

Creates a new environment manager instance with the provided schema.

#### Schema Options

Each environment variable can have these options:

- `type`: 'string' | 'number' | 'boolean' | 'array'
- `required`: boolean (optional)
- `default`: any (optional)
- `validate`: (value: any) => boolean (optional)
- `description`: string (optional)

### env.get<T>(key)

Gets a type-safe environment variable.

### env.getAll()

Gets all configured environment variables.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Waleed Shoaib](https://github.com/waleedshoaib2)