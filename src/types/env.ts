import { z } from 'zod';

// Define the allowed types for environment variables
export const EnvVarType = z.enum(['string', 'number', 'boolean', 'array']);
export type EnvVarType = z.infer<typeof EnvVarType>;

// Define the configuration for a single environment variable
export const EnvVarConfig = z.object({
  type: EnvVarType,
  required: z.boolean().optional(),  // Make required optional
  default: z.any().optional(),
  description: z.string().optional(),
  validate: z.function().args(z.any()).returns(z.boolean()).optional(),
});

export type EnvVarConfig = {
  type: z.infer<typeof EnvVarType>;
  required?: boolean;
  default?: any;
  description?: string;
  validate?: (value: any) => boolean;
};

// Define the schema for all environment variables
export const EnvSchema = z.record(EnvVarConfig);
export type EnvSchema = Record<string, EnvVarConfig>;