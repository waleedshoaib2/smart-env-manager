import { describe, test, expect, beforeEach } from 'vitest';
import { createEnv } from '../EnvManager';
import { EnvSchema } from '../types/env';

describe('EnvManager', () => {
  beforeEach(() => {
    process.env = {};
  });

  test('should properly parse different types of variables', () => {
    process.env.PORT = '3000';
    process.env.API_URL = 'http://api.example.com';
    process.env.DEBUG = 'true';
    process.env.FEATURES = 'feature1,feature2,feature3';

    const schema: EnvSchema = {
      PORT: {
        type: 'number',
        required: true,
      },
      API_URL: {
        type: 'string',
        required: true,
      },
      DEBUG: {
        type: 'boolean',
        default: false,
      },
      FEATURES: {
        type: 'array',
        required: true,
      },
    };

    const env = createEnv(schema);

    expect(env.get<number>('PORT')).toBe(3000);
    expect(env.get<string>('API_URL')).toBe('http://api.example.com');
    expect(env.get<boolean>('DEBUG')).toBe(true);
    expect(env.get<string[]>('FEATURES')).toEqual([
      'feature1',
      'feature2',
      'feature3',
    ]);
  });

  test('should use default values when variables are missing', () => {
    const schema: EnvSchema = {
      PORT: {
        type: 'number',
        default: 3000,
      },
      DEBUG: {
        type: 'boolean',
        default: false,
      },
    };

    const env = createEnv(schema);

    expect(env.get<number>('PORT')).toBe(3000);
    expect(env.get<boolean>('DEBUG')).toBe(false);
  });

  test('should throw error for missing required variables', () => {
    const schema: EnvSchema = {
      REQUIRED_VAR: {
        type: 'string',
        required: true,
      },
    };

    expect(() => createEnv(schema)).toThrow();
  });

  test('should validate custom validation rules', () => {
    process.env.PORT = '3000';

    const schema: EnvSchema = {
      PORT: {
        type: 'number',
        required: true,
        validate: (value: number) => value >= 1000 && value <= 9999,
      },
    };

    expect(() => createEnv(schema)).not.toThrow();

    process.env.PORT = '999';
    expect(() => createEnv(schema)).toThrow();
  });
});