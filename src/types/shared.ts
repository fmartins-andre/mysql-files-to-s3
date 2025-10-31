/**
 * Shared type definitions for the application
 */

// Configuration types
export interface DatabaseConnectionConfig {
  database: string
  host: string
  port?: number
  user: string
  password: string
  connectionLimit?: number
}

export interface MongoDBConfig {
  db: string
  collection: string
  connectionParameters: {
    uri: string
    options: {
      useNewUrlParser?: boolean
      useUnifiedTopology?: boolean
    }
  }
}

export interface CryptoConfig {
  key: string
}

export interface FirebaseServiceConfig {
  [key: string]: string | number | boolean
}

export interface FileRetentionConfig {
  fileRetention: number
  defaultPrefix: string
}

// Data types
export interface LocalDataRow {
  id: string | number
  file?: Uint8Array | Buffer
  verification_code?: string
  [key: string]: string | number | Buffer | Uint8Array | undefined
}

export interface UploadedFile {
  _id: string | number
  hash: string
  encrypted_url: string
}

export interface QueryResult {
  rows: LocalDataRow[]
  fields: any[] // FieldPacket from mysql2
  error: string | null
}

// Firebase types
export interface FirebaseFile {
  name: string
  getMetadata(): Promise<{ updated: string }>
  delete(): Promise<void>
}

export interface FirebaseFileList {
  items: FirebaseFile[]
}

export interface FirebaseData {
  retention: number
  prefix: string
  ref: any // Firebase Storage reference
  files: FirebaseFileList
  filesNames: string[]
}

// File processing types
export interface ProcessingOptions {
  localFolder: string
  fileExtension: string
}

export interface ConversionResult {
  success: boolean
  message?: string
  error?: Error
}

// Result types
export interface ProcessResult {
  uploadedFiles: UploadedFile[]
  deletedFiles: string[]
  errors: string[]
}

// Error types
export interface ApplicationError {
  code: string
  message: string
  details?: any
}

// Utility types
export type FileExtension = "pdf" | "rtf" | "jpg" | "png" | "doc" | "docx"

export type DataRow = LocalDataRow

export type StringOrNumber = string | number
