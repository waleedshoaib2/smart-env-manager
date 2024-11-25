import { describe, test, expect, beforeEach, vi } from 'vitest';
import { createEnv } from '../EnvManager';
import { EnvSchema } from '../types/env';
import path from 'path';

describe('EnvManager', () => {
  beforeEach(() => {
    // Reset process.env before each test
    for (const key in process.env) {
      delete process.env[key];
    }
    // Clear console.warn mocks
    vi.restoreAllMocks();
  });

  describe('Basic Functionality', () => {
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
          required: false,
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
          required: false,
          default: 3000,
        },
        DEBUG: {
          type: 'boolean',
          required: false,
          default: false,
        },
        FEATURES: {
          type: 'array',
          required: false,
          default: ['default'],
        },
      };

      const env = createEnv(schema);

    //   expect(env.get<number>('PORT')).toBe(3000);
      expect(env.get<boolean>('DEBUG')).toBe(false);
      expect(env.get<string[]>('FEATURES')).toEqual(['default']);
    });
  });

  describe('Validation', () => {
    test('should throw error for missing required variables', () => {
      const schema: EnvSchema = {
        REQUIRED_VAR: {
          type: 'string',
          required: true,
        },
      };

      expect(() => createEnv(schema)).toThrow(
        'Required environment variable "REQUIRED_VAR" is missing'
      );
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

    test('should throw error for invalid type conversion', () => {
      process.env.NUMBER = 'not-a-number';

      const schema: EnvSchema = {
        NUMBER: {
          type: 'number',
          required: true,
        },
      };

      expect(() => createEnv(schema)).toThrow();
    });
  });

  describe('Type Safety', () => {
    test('should handle all supported types correctly', () => {
      process.env.STRING = 'test';
      process.env.NUMBER = '123';
      process.env.BOOLEAN = 'true';
      process.env.ARRAY = 'a,b,c';

      const schema: EnvSchema = {
        STRING: { type: 'string', required: true },
        NUMBER: { type: 'number', required: true },
        BOOLEAN: { type: 'boolean', required: true },
        ARRAY: { type: 'array', required: true },
      };

      const env = createEnv(schema);

      expect(typeof env.get<string>('STRING')).toBe('string');
      expect(typeof env.get<number>('NUMBER')).toBe('number');
      expect(typeof env.get<boolean>('BOOLEAN')).toBe('boolean');
      expect(Array.isArray(env.get<string[]>('ARRAY'))).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should throw error for undefined variables', () => {
      const env = createEnv({
        DEFINED: { type: 'string', required: false, default: 'default' },
      });

      expect(() => env.get('UNDEFINED')).toThrow(
        'Environment variable "UNDEFINED" is not defined in schema'
      );
    });

    test('should handle invalid boolean values', () => {
      process.env.BOOL = 'not-a-boolean';

      const schema: EnvSchema = {
        BOOL: { type: 'boolean', required: true },
      };

      expect(() => createEnv(schema)).toThrow();
    });
  });

  describe('GetAll Functionality', () => {
    test('should return all parsed variables', () => {
      process.env.PORT = '3000';
      process.env.DEBUG = 'true';

      const schema: EnvSchema = {
        PORT: { type: 'number', required: true },
        DEBUG: { type: 'boolean', required: true },
      };

      const env = createEnv(schema);
      const all = env.getAll();

      expect(all).toEqual({
        PORT: 3000,
        DEBUG: true,
      });
    });
  });
});