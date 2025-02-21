import { Config } from './types';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

class ConfigManager {
  private static instance: ConfigManager | null = null;
  private config: Config;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public static resetInstance(): void {
    ConfigManager.instance = null;
  }

  private loadConfig(): Config {
    const environment = (process.env.NODE_ENV as Config['app']['env']) || 'development';

    return {
      app: {
        env: environment as Config['app']['env'],
        port: parseInt(process.env.PORT || '3000', 10),
        apiVersion: process.env.API_VERSION || 'v1',
        corsOrigins: process.env.CORS_ORIGINS?.split(',') || [],
      },
      database: {
        mongo_uri:
          (process.env.MONGO_URI as Config['database']['mongo_uri']) ||
          'mongodb://localhost:27017/dev_db',
      },
      logger: {
        level: (process.env.LOG_LEVEL as Config['logger']['level']) || 'info',
        format: (process.env.LOG_FORMAT as Config['logger']['format']) || 'json',
        outputPath:
          (process.env.LOG_OUTPUT_PATH as Config['logger']['outputPath']) || 'logs/app.log',
      },
      features: {
        isEnabled: process.env.FEATURES_ENABLED === 'true',
      },
    };
  }

  public getConfig(): Config {
    return this.config;
  }

  public getFeatureFlag(flag: keyof Config['features']): boolean {
    return this.config.features[flag];
  }

  public validateConfig(): void {
    const requiredEnvVars = [
      'NODE_ENV',
      'PORT',
      'API_VERSION',
      'CORS_ORIGINS',
      'MONGO_URI',
      'LOG_LEVEL',
      'LOG_FORMAT',
      'FEATURES_ENABLED',
    ];

    requiredEnvVars.forEach(envVar => {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    });
  }
}

// Export both the instance and the class for testing
export const configManager = ConfigManager.getInstance();
export { ConfigManager };
