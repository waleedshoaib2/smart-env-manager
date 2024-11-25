import { describe, test, expect } from 'vitest';
import { EnvVarType, EnvVarConfig, EnvSchema } from '../types/env';
import { z } from 'zod';

describe('Environment Types', () => {
  describe('EnvVarType', () => {
    test('should allow valid types', () => {
      const validTypes = ['string', 'number', 'boolean', 'array'];
      validTypes.forEach(type => {
        expect(() => EnvVarType.parse(type)).not.toThrow();
      });
    });

    test('should reject invalid types', () => {
      const invalidTypes = ['object', 'function', 'undefined', 'null'];
      invalidTypes.forEach(type => {
        expect(() => EnvVarType.parse(type)).toThrow();
      });
    });
  });

  describe('EnvVarConfig', () => {
    test('should validate correct config structure', () => {
      const validConfig: z.infer<typeof EnvVarConfig> = {
        type: 'string',
        required: true,
        description: 'Test variable',
        validate: (value: any) => typeof value === 'string',
      };

      expect(() => EnvVarConfig.parse(validConfig)).not.toThrow();
    });

    test('should make optional fields truly optional', () => {
      const minimalConfig: z.infer<typeof EnvVarConfig> = {
        type: 'string',
      };

      expect(() => EnvVarConfig.parse(minimalConfig)).not.toThrow();
    });

    test('should validate default values match type', () => {
      const validConfigs = [
        { type: 'string', default: 'test' },
        { type: 'number', default: 123 },
        { type: 'boolean', default: true },
        { type: 'array', default: ['test'] },
      ];

      validConfigs.forEach(config => {
        expect(() => EnvVarConfig.parse(config)).not.toThrow();
      });
    });

    test('should allow valid validation functions', () => {
      const config: z.infer<typeof EnvVarConfig> = {
        type: 'number',
        validate: (value: number) => value > 0,
      };

      expect(() => EnvVarConfig.parse(config)).not.toThrow();
    });
  });

  describe('EnvSchema', () => {
    test('should validate correct schema structure', () => {
      const validSchema: z.infer<typeof EnvSchema> = {
        PORT: {
          type: 'number',
          required: true,
          default: 3000,
          description: 'Server port',
        },
        API_URL: {
          type: 'string',
          required: true,
          validate: (value: string) => value.startsWith('http'),
        },
        DEBUG: {
          type: 'boolean',
          default: false,
        },
        FEATURES: {
          type: 'array',
          default: [],
        },
      };

      expect(() => EnvSchema.parse(validSchema)).not.toThrow();
    });

    test('should reject invalid schema structure', () => {
      const invalidSchema = {
        PORT: {
          type: 'invalid',
          required: 'not-a-boolean',
        },
      };

      expect(() => EnvSchema.parse(invalidSchema)).toThrow();
    });

    test('should allow empty schema', () => {
      const emptySchema = {};

      expect(() => EnvSchema.parse(emptySchema)).not.toThrow();
    });
  });

  describe('Type Inference', () => {
    test('should correctly infer types', () => {
      // This is a type-level test
      const schema: z.infer<typeof EnvSchema> = {
        STRING: { type: 'string' },
        NUMBER: { type: 'number' },
        BOOLEAN: { type: 'boolean' },
        ARRAY: { type: 'array' },
      };

      // TypeScript should infer these types correctly
      type SchemaType = typeof schema;
      
      // If this compiles, the type inference is working
      const _test: SchemaType = {
        STRING: { type: 'string' },
        NUMBER: { type: 'number' },
        BOOLEAN: { type: 'boolean' },
        ARRAY: { type: 'array' },
      };

      expect(true).toBe(true); // Dummy assertion
    });
  });
});