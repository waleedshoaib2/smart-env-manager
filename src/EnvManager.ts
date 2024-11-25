import { config } from 'dotenv';
import { join } from 'path';
import { EnvSchema, EnvVarConfig } from './types/env';
import { ValueParser } from './utils/parser';

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
    ['ALLUSERSPROFILE', 'COMMONPROGRAMFILES', 'COMPUTERNAME', 'COMSPEC', 
     'DRIVERDATA', 'SYSTEMDRIVE', 'SYSTEMROOT', 'WINDIR', 'COLOR', 'COLORTERM', 
     'EDITOR', 'GIT_ASKPASS', 'NODE', 'PT7HOME'].includes(varName.toUpperCase());
  }

  private loadEnvFile(envPath?: string): void {
    const result = config({
      path: envPath ? join(process.cwd(), envPath) : undefined,
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

    if (config.required && value === undefined && config.default === undefined) {
      throw new Error(`Required environment variable "${key}" is missing`);
    }

    if (value === undefined && config.default !== undefined) {
      if (!ValueParser.validateType(config.default, config.type)) {
        throw new Error(
          `Default value for "${key}" does not match specified type "${config.type}"`
        );
      }
      this.parsedEnv[key] = config.default;
      return;
    }

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
}

export const createEnv = (
  schema: EnvSchema,
  options?: { envPath?: string }
): EnvManager => new EnvManager(schema, options);