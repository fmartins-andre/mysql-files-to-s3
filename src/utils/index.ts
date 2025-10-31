/**
 * Utility functions index file
 * Centralized exports for all utility modules
 */

export { daysBetweenDates } from "./daysBetweenDates"
export { emptyFirebaseStorage } from "./emptyFirebaseStorage"
export { encrypt } from "./encrypt"
export { default as rtfHeader } from "./rtfHeaderRaw"

// Re-export error handling utilities
export type {
  ErrorType,
  ApplicationError,
  Logger,
  AppError,
  ErrorHandler,
} from "./errorHandler"

export {
  errorHandler,
  handleDatabaseError,
  handleFileError,
  handleFirebaseError,
  handleUploadError,
  handleConfigError,
  handleCryptoError,
} from "./errorHandler"
