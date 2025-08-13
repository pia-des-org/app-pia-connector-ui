import { Injectable } from '@angular/core';

/**
 * Log levels to categorize the importance and type of log messages.
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

/**
 * A service to centralize and standardize logging throughout the application.
 * This helps maintain consistent logging formats and control log levels.
 */
@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private enabled = true;
  private logLevel: LogLevel = LogLevel.DEBUG; // Default to showing all logs

  constructor() {
    console.log(`[${new Date().toISOString()}] [INIT] Logging service initialized`);
  }

  /**
   * Enables or disables logging
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.info('LOGGING', `Logging ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Sets the minimum log level to display
   */
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
    this.info('LOGGING', `Log level set to ${level}`);
  }

  /**
   * Logs a debug message
   * Used for detailed information useful during development and troubleshooting
   */
  public debug(component: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, component, message, data);
  }

  /**
   * Logs an informational message
   * Used for general information about application flow
   */
  public info(component: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, component, message, data);
  }

  /**
   * Logs a warning message
   * Used for potentially problematic situations that don't cause immediate failure
   */
  public warn(component: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, component, message, data);
  }

  /**
   * Logs an error message
   * Used for failures and exceptions that affect functionality
   */
  public error(component: string, message: string, error?: any, data?: any): void {
    this.log(LogLevel.ERROR, component, message, { error, ...data });
  }

  /**
   * Internal method to format and output logs
   */
  private log(level: LogLevel, component: string, message: string, data?: any): void {
    if (!this.enabled) {
      return;
    }

    // Check if this log level should be displayed
    if (this.shouldLog(level)) {
      const timestamp = new Date().toISOString();
      const formattedMessage = `[${timestamp}] [${level}] [${component}] ${message}`;

      switch (level) {
        case LogLevel.DEBUG:
          data ? console.debug(formattedMessage, data) : console.debug(formattedMessage);
          break;
        case LogLevel.INFO:
          data ? console.info(formattedMessage, data) : console.info(formattedMessage);
          break;
        case LogLevel.WARN:
          data ? console.warn(formattedMessage, data) : console.warn(formattedMessage);
          break;
        case LogLevel.ERROR:
          data ? console.error(formattedMessage, data) : console.error(formattedMessage);
          break;
      }
    }
  }

  /**
   * Determines if a message with the given log level should be logged
   * based on the current log level setting
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Creates a log entry with details about the verification process
   * Format: [timestamp] [level] [component] message: data
   */
  public logVerificationStep(step: string, details: any): void {
    this.debug('VERIFICATION', `Step: ${step}`, details);
  }

  /**
   * Utility method to safely stringify objects for logging
   * Handles circular references and adds formatting
   */
  public formatObject(obj: any): string {
    try {
      return JSON.stringify(obj, this.circularReplacer(), 2);
    } catch (e: unknown) {
      // Handle error based on its type
      if (e instanceof Error) {
        return `[Unserializable object: ${e.message}]`;
      } else {
        return '[Unserializable object: Unknown error]';
      }
    }
  }

  /**
   * Helper function to handle circular references when stringifying objects
   */
  private circularReplacer() {
    const seen = new WeakSet();
    return (key: string, value: any) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    };
  }
}
