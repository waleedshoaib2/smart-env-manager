import { config } from 'dotenv';
import { resolve } from 'path';
import { EnvSchema, EnvVarConfig } from './types/env';

class ValueParser {
  static parse(value: string, type: 'string' | 'number' | 'boolean' | 'array'): any {
    switch (type) {
      case 'string':
        return value;
      
      case 'number':
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error(`Value "${value}" cannot be parsed as a number`);
        }
        return num;
      
      case 'boolean':
        const lowercased = value.toLowerCase();
        if (lowercased !== 'true' && lowercased !== 'false') {
          throw new Error(`Value "${value}" cannot be parsed as a boolean`);
        }
        return lowercased === 'true';
      
      case 'array':
        return value.split(',').map(item => item.trim());
      
      default:
        throw new Error(`Unsupported type: ${type}`);
    }
  }

  static validateType(value: any, type: 'string' | 'number' | 'boolean' | 'array'): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      default:
        return false;
    }
  }
}

export class EnvManager {
  private schema: EnvSchema;
  private parsedEnv: Record<string, any> = {};
  private unusedVars: Set<string> = new Set();

  private readonly ignoredPrefixes = [
    'npm_',
    'VSCODE_',
    'CHROME_',
    'TERM_',
    'FPS_',
    'INIT_',
    'LANG',
    'PATH',
    'OS',
    'PROMPT',
    'PROCESSOR',
    'SYSTEM',
    'PROGRAM',
    'APPDATA',
    'COMMON',
    'COMPUTER',
    'WINDOWS',
    'USER',
    'HOME',
    'LOGON',
    'PUBLIC',
    'TEMP',
    'TMP',
    'WIN',
    'ONE',
    'QT_',
    'ZES_',
    'SESSION',
    'NUMBER_OF_PROCESSORS'
  ];

  constructor(schema: EnvSchema, options?: { envPath?: string }) {
    this.schema = schema;
    this.loadEnvFile(options?.envPath);
    this.validateAndParseEnv();
  }

  private shouldIgnoreVar(varName: string): boolean {
    return this.ignoredPrefixes.some(prefix => 
      varName.toUpperCase().startsWith(prefix.toUpperCase())
    ) || 
    varName.length <= 1 ||
    [
      'ALLUSERSPROFILE',
      'COMMONPROGRAMFILES',
      'COMPUTERNAME',
      'COMSPEC',
      'DRIVERDATA',
      'SYSTEMDRIVE',
      'SYSTEMROOT',
      'WINDIR',
      'COLOR',
      'COLORTERM',
      'EDITOR',
      'GIT_ASKPASS',
      'NODE',
      'PT7HOME'
    ].includes(varName.toUpperCase());
  }

  private loadEnvFile(envPath?: string): void {
    const result = config({
      path: envPath ? resolve(process.cwd(), envPath) : undefined,
    });

    if (result.error) {
      throw new Error(`Failed to load .env file: ${result.error.message}`);
    }

    Object.keys(process.env).forEach(key => {
      if (!this.shouldIgnoreVar(key)) {
        this.unusedVars.add(key);
      }
    });
  }

  private validateAndParseEnv(): void {
    for (const [key, config] of Object.entries(this.schema)) {
      this.validateAndParseVariable(key, config);
    }

    this.checkUnusedVariables();
  }

  private validateAndParseVariable(key: string, config: EnvVarConfig): void {
    this.unusedVars.delete(key);
    let value = process.env[key];

    // Handle default values first
    if (value === undefined && config.default !== undefined) {
      if (!ValueParser.validateType(config.default, config.type)) {
        throw new Error(
          `Default value for "${key}" does not match specified type "${config.type}"`
        );
      }
      this.parsedEnv[key] = config.default;
      return;
    }

    // Handle required fields
    if (config.required && value === undefined) {
      throw new Error(`Required environment variable "${key}" is missing`);
    }

    // Parse and validate if value exists
    if (value !== undefined) {
      try {
        const parsedValue = ValueParser.parse(value, config.type);

        if (config.validate && !config.validate(parsedValue)) {
          throw new Error(`Custom validation failed for "${key}"`);
        }

        this.parsedEnv[key] = parsedValue;
      } catch (error) {
        throw new Error(
          `Error processing "${key}": ${(error as Error).message}`
        );
      }
    }
  }

  private checkUnusedVariables(): void {
    this.unusedVars.forEach(key => {
      if (!this.shouldIgnoreVar(key)) {
        console.warn(`Warning: Unused environment variable "${key}"`);
      }
    });
  }

  public get<T>(key: string): T {
    if (!(key in this.parsedEnv)) {
      throw new Error(`Environment variable "${key}" is not defined in schema`);
    }
    return this.parsedEnv[key] as T;
  }

  public getAll(): Record<string, any> {
    return { ...this.parsedEnv };
  }

  public generateTypes(): string {
    let types = 'export interface Env {\n';
    
    for (const [key, config] of Object.entries(this.schema)) {
      const tsType = this.getTsType(config.type);
      const required = config.required || config.default !== undefined;
      const description = config.description ? 
        `  /** ${config.description} */\n` : '';
      
      types += `${description}  ${key}${required ? '' : '?'}: ${tsType};\n`;
    }
    
    types += '}\n';
    return types;
  }

  private getTsType(type: 'string' | 'number' | 'boolean' | 'array'): string {
    switch (type) {
      case 'number': return 'number';
      case 'boolean': return 'boolean';
      case 'array': return 'string[]';
      default: return 'string';
    }
  }
}

export const createEnv = (
  schema: EnvSchema,
  options?: { envPath?: string }
): EnvManager => new EnvManager(schema, options);