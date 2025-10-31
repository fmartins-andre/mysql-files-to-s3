/**
 * Centralized error handling utilities
 * Provides consistent error logging and handling patterns across the application
 */

/**
 * Application error types for better error categorization
 */
export enum ErrorType {
  DATABASE_CONNECTION = "DATABASE_CONNECTION",
  FILE_PROCESSING = "FILE_PROCESSING",
  FIREBASE_OPERATION = "FIREBASE_OPERATION",
  FILE_UPLOAD = "FILE_UPLOAD",
  CONFIGURATION = "CONFIGURATION",
  CRYPTO_OPERATION = "CRYPTO_OPERATION",
  SYSTEM = "SYSTEM",
}

/**
 * Standard application error interface
 */
export interface ApplicationError {
  type: ErrorType
  message: string
  originalError?: Error | undefined
  context?: Record<string, any> | undefined
  timestamp: Date
}

/**
 * Application logger interface
 */
export interface Logger {
  error: (message: string, context?: any) => void
  warn: (message: string, context?: any) => void
  info: (message: string, context?: any) => void
}

/**
 * Default console-based logger
 */
class ConsoleLogger implements Logger {
  private getTimestamp(): string {
    return new Date().toISOString()
  }

  error(message: string, context?: any): void {
    console.error(`[${this.getTimestamp()}] ERROR: ${message}`, context || "")
  }

  warn(message: string, context?: any): void {
    console.warn(`[${this.getTimestamp()}] WARN: ${message}`, context || "")
  }

  info(message: string, context?: any): void {
    console.info(`[${this.getTimestamp()}] INFO: ${message}`, context || "")
  }
}

/**
 * Application error class
 */
export class AppError extends Error {
  public readonly type: ErrorType
  public readonly context?: Record<string, any> | undefined
  public readonly timestamp: Date
  public readonly originalError?: Error | undefined

  constructor(error: ApplicationError) {
    super(error.message)
    this.name = "AppError"
    this.type = error.type
    this.context = error.context
    this.timestamp = error.timestamp
    this.originalError = error.originalError
  }
}

/**
 * Error handler utility class
 */
export class ErrorHandler {
  private static instance: ErrorHandler
  private logger: Logger

  private constructor(logger?: Logger) {
    this.logger = logger || new ConsoleLogger()
  }

  public static getInstance(logger?: Logger): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler(logger)
    }
    return ErrorHandler.instance
  }

  /**
   * Create standardized application error
   */
  public createError(
    type: ErrorType,
    message: string,
    originalError?: Error,
    context?: Record<string, any>
  ): AppError {
    return new AppError({
      type,
      message,
      originalError,
      context,
      timestamp: new Date(),
    })
  }

  /**
   * Handle and log error with standardized formatting
   */
  public handleError(
    type: ErrorType,
    message: string,
    originalError?: Error,
    context?: Record<string, any>,
    exitProcess = false
  ): never {
    const error = this.createError(type, message, originalError, context)

    // Log the error
    this.logger.error(`${type}: ${message}`, {
      error: error.message,
      originalError: originalError?.message,
      context,
      stack: originalError?.stack,
    })

    // Exit process if specified
    if (exitProcess) {
      console.error(`::: Application: FATAL ERROR - ${error.message}`)
      process.exit(1)
    }

    throw error
  }

  /**
   * Handle non-fatal errors (warnings)
   */
  public warn(
    type: ErrorType,
    message: string,
    context?: Record<string, any>
  ): void {
    this.logger.warn(`${type}: ${message}`, context)
  }

  /**
   * Log informational messages
   */
  public info(message: string, context?: Record<string, any>): void {
    this.logger.info(message, context)
  }

  /**
   * Wrap async operations with error handling
   */
  public async withErrorHandling<T>(
    operation: () => Promise<T>,
    type: ErrorType,
    errorMessage: string,
    exitOnError = false
  ): Promise<T | null> {
    try {
      return await operation()
    } catch (error) {
      if (error instanceof AppError) {
        // Re-throw if it's already an AppError
        throw error
      }

      // Convert to AppError and handle
      this.handleError(
        type,
        errorMessage,
        error as Error,
        { operation: operation.name },
        exitOnError
      )
    }
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()

// Convenience functions for specific error types
export const handleDatabaseError = (
  message: string,
  error?: Error,
  context?: any,
  exitProcess = false
) =>
  errorHandler.handleError(
    ErrorType.DATABASE_CONNECTION,
    message,
    error,
    context,
    exitProcess
  )

export const handleFileError = (
  message: string,
  error?: Error,
  context?: any,
  exitProcess = false
) =>
  errorHandler.handleError(
    ErrorType.FILE_PROCESSING,
    message,
    error,
    context,
    exitProcess
  )

export const handleFirebaseError = (
  message: string,
  error?: Error,
  context?: any,
  exitProcess = false
) =>
  errorHandler.handleError(
    ErrorType.FIREBASE_OPERATION,
    message,
    error,
    context,
    exitProcess
  )

export const handleUploadError = (
  message: string,
  error?: Error,
  context?: any,
  exitProcess = false
) =>
  errorHandler.handleError(
    ErrorType.FILE_UPLOAD,
    message,
    error,
    context,
    exitProcess
  )

export const handleConfigError = (
  message: string,
  error?: Error,
  context?: any,
  exitProcess = false
) =>
  errorHandler.handleError(
    ErrorType.CONFIGURATION,
    message,
    error,
    context,
    exitProcess
  )

export const handleCryptoError = (
  message: string,
  error?: Error,
  context?: any,
  exitProcess = false
) =>
  errorHandler.handleError(
    ErrorType.CRYPTO_OPERATION,
    message,
    error,
    context,
    exitProcess
  )
