import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { configManager } from '../../config';

// Add type definitions
type LogLevel = 'error' | 'warn' | 'info' | 'debug';
type LogFormat = 'json' | 'text';

interface LoggerConfig {
  level: LogLevel;
  format: LogFormat;
  outputPath: string;
}

const config = configManager.getConfig();

class Logger {
  private static instance: Logger | null = null;
  private logger: winston.Logger;

  private constructor() {
    const { format } = winston;

    const defaultConfig: LoggerConfig = {
      level: 'info',
      format: 'text',
      outputPath: 'logs/app-%DATE%.log',
    };

    // Validate and merge configurations
    const loggerConfig: LoggerConfig = {
      level: this.validateLogLevel(config.logger?.level) || defaultConfig.level,
      format: this.validateLogFormat(config.logger?.format) || defaultConfig.format,
      outputPath: this.validateOutputPath(config.logger?.outputPath) || defaultConfig.outputPath,
    };

    // Create the logger instance
    this.logger = winston.createLogger({
      level: loggerConfig.level,
      format:
        loggerConfig.format === 'json'
          ? format.json()
          : format.combine(
              format.timestamp(),
              format.printf(({ timestamp, level, message, ...meta }) => {
                return `${timestamp} [${level.toUpperCase()}]: ${message} ${
                  Object.keys(meta).length ? JSON.stringify(meta) : ''
                }`;
              }),
            ),
      transports: [
        // Console transport
        new winston.transports.Console({
          format: format.combine(format.colorize(), format.simple()),
        }),
        // Rotating file transport
        new DailyRotateFile({
          filename: loggerConfig.outputPath,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ],
    });
  }

  private validateLogLevel(level: any): LogLevel | undefined {
    const validLevels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
    return validLevels.includes(level as LogLevel) ? (level as LogLevel) : undefined;
  }

  private validateLogFormat(format: any): LogFormat | undefined {
    const validFormats: LogFormat[] = ['json', 'text'];
    return validFormats.includes(format as LogFormat) ? (format as LogFormat) : undefined;
  }

  private validateOutputPath(path: any): string | undefined {
    return typeof path === 'string' && path.length > 0 ? path : undefined;
  }

  // Add JSDoc comments for better documentation
  /**
   * Gets the singleton instance of the Logger
   * @returns Logger instance
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public static resetInstance(): void {
    Logger.instance = null;
  }

  /**
   * Logs an info message
   * @param message - The message to log
   * @param meta - Optional metadata to include
   */
  public info(message: string, meta?: Record<string, unknown>): void {
    if (!message) {
      throw new Error('Log message cannot be empty');
    }
    this.logger.info(message, meta);
  }

  /**
   * Logs an error message
   * @param message - The message to log
   * @param meta - Optional metadata to include
   */
  public error(message: string, meta?: Record<string, unknown>): void {
    if (!message) {
      throw new Error('Log message cannot be empty');
    }
    this.logger.error(message, meta);
  }

  /**
   * Logs a warning message
   * @param message - The message to log
   * @param meta - Optional metadata to include
   */
  public warn(message: string, meta?: Record<string, unknown>): void {
    if (!message) {
      throw new Error('Log message cannot be empty');
    }
    this.logger.warn(message, meta);
  }

  /**
   * Logs a debug message
   * @param message - The message to log
   * @param meta - Optional metadata to include
   */
  public debug(message: string, meta?: Record<string, unknown>): void {
    if (!message) {
      throw new Error('Log message cannot be empty');
    }
    this.logger.debug(message, meta);
  }
}

// Add process error handling
process.on('uncaughtException', error => {
  const logger = Logger.getInstance();
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

export const logger = Logger.getInstance();
export { Logger, LogLevel, LogFormat };
