export interface DatabaseConfig {
  mongo_uri: string;
}

export interface LoggerConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text';
  outputPath: string;
}

export interface FeatureFlags {
  isEnabled: boolean;
}

export interface AppConfig {
  env: 'development' | 'staging' | 'production';
  port: number;
  apiVersion: string;
  corsOrigins: string[];
}

export interface Config {
  app: AppConfig;
  database: DatabaseConfig;
  logger: LoggerConfig;
  features: FeatureFlags;
}
