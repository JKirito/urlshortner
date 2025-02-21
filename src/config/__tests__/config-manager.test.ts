import { ConfigManager } from '../index';
import { Config } from '../types';

describe('ConfigManager', () => {
  // Save original env
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset env before each test
    process.env = { ...originalEnv };
    // Clear all environment variables that might affect the test
    process.env = {
      NODE_ENV: undefined,
      PORT: undefined,
      API_VERSION: undefined,
      MONGO_URI: undefined,
      LOG_LEVEL: undefined,
      LOG_FORMAT: undefined,
      LOG_OUTPUT_PATH: undefined,
      FEATURES_ENABLED: undefined,
      CORS_ORIGINS: undefined,
    };
    // Clear any cached instance
    ConfigManager.resetInstance();
  });

  afterEach(() => {
    // Restore original env after each test
    process.env = originalEnv;
    ConfigManager.resetInstance();
  });

  describe('Configuration Loading', () => {
    it('should load default values when no environment variables are set', () => {
      // Get a fresh instance
      const freshConfigManager = ConfigManager.getInstance();
      const config = freshConfigManager.getConfig();

      // Test default values
      expect(config.app.env).toBe('development');
      expect(config.app.port).toBe(3000);
      expect(config.app.apiVersion).toBe('v1');
      expect(config.app.corsOrigins).toEqual([]);
      expect(config.database.mongo_uri).toBe('mongodb://localhost:27017/dev_db');
      expect(config.logger.level).toBe('info');
      expect(config.logger.format).toBe('json');
      expect(config.logger.outputPath).toBe('logs/app.log');
      expect(config.features.isEnabled).toBe(false);
    });

    it('should load environment variables when they are set', () => {
      // Set environment variables before creating config
      process.env.NODE_ENV = 'test';
      process.env.PORT = '4000';
      process.env.API_VERSION = 'v2';
      process.env.MONGO_URI = 'mongodb://localhost:27017/test_db';
      process.env.LOG_LEVEL = 'debug';
      process.env.LOG_FORMAT = 'text';
      process.env.LOG_OUTPUT_PATH = 'logs/test.log';
      process.env.FEATURES_ENABLED = 'true';
      process.env.CORS_ORIGINS = 'http://localhost:3000,http://localhost:4000';

      // Get a fresh instance
      const freshConfigManager = ConfigManager.getInstance();
      const config = freshConfigManager.getConfig();

      // Test environment values
      expect(config.app.env).toBe('test');
      expect(config.app.port).toBe(4000);
      expect(config.app.apiVersion).toBe('v2');
      expect(config.app.corsOrigins).toEqual(['http://localhost:3000', 'http://localhost:4000']);
      expect(config.database.mongo_uri).toBe('mongodb://localhost:27017/test_db');
      expect(config.logger.level).toBe('debug');
      expect(config.logger.format).toBe('text');
      expect(config.logger.outputPath).toBe('logs/test.log');
      expect(config.features.isEnabled).toBe(true);
    });
  });

  describe('Singleton Pattern', () => {
    it('should maintain the same instance', () => {
      const instance1 = ConfigManager.getInstance();
      const instance2 = ConfigManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Feature Flags', () => {
    it('should return correct feature flag value', () => {
      process.env.FEATURES_ENABLED = 'true';
      const instance = ConfigManager.getInstance();
      expect(instance.getFeatureFlag('isEnabled')).toBe(true);
    });
  });
});
