import { EnvVarType } from '../types/env';

export class ValueParser {
  static parse(value: string, type: EnvVarType): any {
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

  static validateType(value: any, type: EnvVarType): boolean {
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