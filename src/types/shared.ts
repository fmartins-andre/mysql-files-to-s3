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

// S3 types
export interface S3File {
  name: string
  lastModified?: string
  size?: number
}

export interface S3FileList {
  items: S3File[]
}

export interface S3Data {
  retention: number
  prefix: string
  client: any // S3/MinIO client
  files: S3FileList
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
