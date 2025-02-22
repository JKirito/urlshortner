import { Logger } from '../logger';
import { ConfigManager } from '../../config';
import { Config } from '../../config/types';

// Mock dependencies
jest.mock('winston', () => ({
  createLogger: jest.fn(),
  format: {
    json: jest.fn(),
    combine: jest.fn(),
    timestamp: jest.fn(),
    printf: jest.fn(),
    colorize: jest.fn(),
    simple: jest.fn(),
  },
  transports: {
    Console: jest.fn(),
  },
}));

jest.mock('winston-daily-rotate-file', () =>
  jest.fn().mockImplementation(() => ({
    on: jest.fn(),
  })),
);

describe('Logger', () => {
  // Test configuration
  const defaultConfig: Config = {
    app: {
      env: 'development',
      port: 3000,
      apiVersion: 'v1',
      corsOrigins: [],
    },
    database: {
      mongo_uri: 'mongodb://localhost:27017/dev_db',
    },
    logger: {
      level: 'info',
      format: 'json',
      outputPath: 'logs/app-%DATE%.log',
    },
    features: {
      isEnabled: false,
    },
  };

  // Winston mock instance
  const mockWinstonLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(() => {
    // Reset all mocks and instances
    jest.clearAllMocks();
    Logger.resetInstance();

    // Reset winston mock
    const winston = require('winston');
    winston.createLogger.mockReturnValue(mockWinstonLogger);

    // Mock config
    jest.spyOn(ConfigManager.prototype, 'getConfig').mockReturnValue(defaultConfig);
  });

  describe('Initialization', () => {
    it('should create a singleton instance', () => {
      const instance1 = Logger.getInstance();
      const instance2 = Logger.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should initialize with correct configuration', () => {
      const winston = require('winston');
      Logger.getInstance();

      expect(winston.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: defaultConfig.logger.level,
        }),
      );
    });
  });

  describe('Logging Methods', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = Logger.getInstance();
    });

    it('should log info messages', () => {
      const message = 'Test info message';
      const meta = { user: 'test' };

      logger.info(message, meta);

      expect(mockWinstonLogger.info).toHaveBeenCalledWith(message, meta);
    });

    it('should log error messages', () => {
      const message = 'Test error message';
      const meta = { error: new Error('test') };

      logger.error(message, meta);

      expect(mockWinstonLogger.error).toHaveBeenCalledWith(message, meta);
    });

    it('should log warn messages', () => {
      const message = 'Test warning message';
      const meta = { warning: 'test' };

      logger.warn(message, meta);

      expect(mockWinstonLogger.warn).toHaveBeenCalledWith(message, meta);
    });

    it('should log debug messages', () => {
      const message = 'Test debug message';
      const meta = { debug: 'test' };

      logger.debug(message, meta);

      expect(mockWinstonLogger.debug).toHaveBeenCalledWith(message, meta);
    });
  });

  describe('Error Handling', () => {
    let logger: Logger;

    beforeEach(() => {
      logger = Logger.getInstance();
    });

    it('should throw error for empty info message', () => {
      expect(() => logger.info('')).toThrow('Log message cannot be empty');
    });

    it('should throw error for empty error message', () => {
      expect(() => logger.error('')).toThrow('Log message cannot be empty');
    });

    it('should throw error for empty warn message', () => {
      expect(() => logger.warn('')).toThrow('Log message cannot be empty');
    });

    it('should throw error for empty debug message', () => {
      expect(() => logger.debug('')).toThrow('Log message cannot be empty');
    });
  });

  describe('Configuration Validation', () => {
    it('should use default level for invalid log level', () => {
      const invalidConfig = {
        ...defaultConfig,
        logger: { ...defaultConfig.logger, level: 'invalid' as any },
      };
      jest.spyOn(ConfigManager.prototype, 'getConfig').mockReturnValue(invalidConfig);

      Logger.getInstance();
      const winston = require('winston');

      expect(winston.createLogger).toHaveBeenCalledWith(expect.objectContaining({ level: 'info' }));
    });

    it('should use default format for invalid format', () => {
      const invalidConfig = {
        ...defaultConfig,
        logger: { ...defaultConfig.logger, format: 'invalid' as any },
      };
      jest.spyOn(ConfigManager.prototype, 'getConfig').mockReturnValue(invalidConfig);

      Logger.getInstance();
      const winston = require('winston');

      expect(winston.format.combine).toHaveBeenCalled();
    });

    it('should use default output path for empty path', () => {
      const invalidConfig = {
        ...defaultConfig,
        logger: { ...defaultConfig.logger, outputPath: '' },
      };
      jest.spyOn(ConfigManager.prototype, 'getConfig').mockReturnValue(invalidConfig);

      Logger.getInstance();
      const DailyRotateFile = require('winston-daily-rotate-file');

      expect(DailyRotateFile).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'logs/app.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      );
    });
  });

  describe('Metadata Handling', () => {
    it('should properly handle complex metadata objects', () => {
      const logger = Logger.getInstance();
      const meta = {
        user: {
          id: 1,
          name: 'Test User',
        },
        context: {
          action: 'login',
          timestamp: new Date().toISOString(),
        },
      };

      logger.info('Complex metadata test', meta);

      expect(mockWinstonLogger.info).toHaveBeenCalledWith('Complex metadata test', meta);
    });

    it('should handle undefined metadata', () => {
      const logger = Logger.getInstance();
      const message = 'Test message';

      logger.info(message);

      expect(mockWinstonLogger.info).toHaveBeenCalledWith(message, undefined);
    });
  });
});
