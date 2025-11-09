# mysql-files-to-s3

A TypeScript-based microservice that uploads MySQL blob files to S3-compatible cloud storage (MinIO), processes them, and stores metadata in MongoDB Atlas.

## Overview

This application is a modernized version of a file processing microservice that:

- Retrieves blob data from MySQL databases
- Converts data to RTF files using a predefined header template
- Converts RTF files to PDF using LibreOffice
- Uploads PDFs to S3-compatible cloud storage (MinIO)
- Stores file metadata and encrypted URLs in MongoDB Atlas
- Implements automatic file retention and cleanup policies

## Features

- **TypeScript**: Full type safety and modern JavaScript features with ES modules
- **Cloud Storage**: Support for S3-compatible services (MinIO)
- **Database Support**: MySQL for source data, MongoDB Atlas for metadata storage
- **File Processing**: Automated RTF to PDF conversion using LibreOffice
- **Security**: Encrypted file URLs using MD5 and AES encryption
- **Retention Management**: Automatic cleanup of outdated files
- **Container Ready**: Docker support for easy deployment
- **Modular Architecture**: Clean separation of concerns with modular code structure
- **Error Handling**: Comprehensive error handling and logging
- **Performance**: Optimized file processing with connection pooling

## Tech Stack

- **Runtime**: Node.js 22.21.0+
- **Language**: TypeScript 5.9.3+ with ES modules
- **Database**: MySQL (source), MongoDB 6.20.0 (metadata)
- **Cloud Storage**: S3-compatible services (MinIO 8.0.6+)
- **File Processing**: LibreOffice (for RTF to PDF conversion)
- **Build Tools**: TypeScript compiler, Node.js runtime
- **Encryption**: crypto-js 4.2.0 for secure URL encryption

## Prerequisites

### System Dependencies

The application requires the following system packages to be installed:

- **LibreOffice Writer**: Version 6 or above (for RTF to PDF conversion)
- **OpenJDK Runtime Environment (JRE)**: Required by LibreOffice
- **Liberation Fonts**: Ensures font compatibility across different systems

### Node.js Dependencies

The application includes the following runtime dependencies:

```json
{
  "crypto-js": "^4.2.0",
  "minio": "^8.0.6",
  "mongodb": "^6.20.0",
  "mysql2": "^3.15.3",
  "typescript": "^5.9.3"
}
```

Development dependencies include TypeScript types, ts-node for development, and build tools.

## Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd mysql-files-to-s3
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **System Dependencies** (Debian Trixie):

   ```bash
   sudo apt-get update
   sudo apt-get install libreoffice-writer default-jre fonts-liberation
   ```

4. **Build the application**:
   ```bash
   npm run build
   ```

## Configuration

The application uses a JSON configuration file to specify database connections, cloud storage settings, and processing options.

### Configuration File Structure

```json
{
  "crypto_key": "your-secret-encryption-key",
  "mysql": {
    "query": "SELECT 'your blob query here...'",
    "connectionParameters": {
      "host": "your-mysql-host",
      "port": 3306,
      "database": "your-database",
      "user": "your-username",
      "password": "your-password"
    }
  },
  "mongo": {
    "db": "your-database-name",
    "collection": "your-collection-name",
    "connectionParameters": {
      "uri": "mongodb+srv://username:password@cluster.mongodb.net/",
      "options": {
        "useNewUrlParser": true,
        "useUnifiedTopology": true
      }
    }
  },
  "s3": {
    "fileRetention": 30,
    "folder": "your-files-folder",
    "connectionParameters": {
      "bucket": "your-bucket-name",
      "uri": "https://your-s3-endpoint.com",
      "user": "your-access-key",
      "password": "your-secret-key"
    }
  }
}
```

### Configuration Parameters

- **crypto_key**: Secret key for encrypting URLs and sensitive data using MD5 and AES
- **mysql**: MySQL database connection and query configuration
  - `query`: SQL query to select blob data (must return id, file, verification_code columns)
  - `connectionParameters`: MySQL connection details
- **mongo**: MongoDB Atlas connection configuration
  - `db`: Database name
  - `collection`: Collection name for storing file metadata
  - `connectionParameters`: MongoDB connection URI and options
- **s3**: S3 configuration for cloud storage
  - `fileRetention`: Days to keep files in cloud storage after local reference is lost
  - `folder`: Storage folder/prefix for uploaded files
  - `bucket`: S3 bucket name
  - `connectionParameters`: S3 endpoint and credentials

## Usage

### Running the Application

**Development mode**:

```bash
npm run dev
```

**Production mode**:

```bash
npm run build
npm start
```

**With custom configuration**:

```bash
npm start path/to/your/config.json
```

### Docker Deployment

1. **Build the Docker image**:

   ```bash
   docker build -t mysql-files-to-s3 .
   ```

2. **Run the container**:
   ```bash
   docker run --rm \
     --mount type=bind,source="$(pwd)"/config.json,target=/app/config.json,readonly \
     --mount type=bind,source="$(pwd)"/files,target=/app/files \
     mysql-files-to-s3
   ```

**Docker Notes**:

- The configuration file must be mounted to `/app/config.json`
- The files directory should be mounted for temporary file processing
- The container includes all necessary system dependencies

## Application Workflow

The application follows this processing pipeline:

1. **Initialization**: Load configuration and validate connections
2. **Data Retrieval**: Fetch blob data from MySQL database
3. **File Creation**: Convert data to RTF files using predefined templates
4. **Format Conversion**: Convert RTF files to PDF using LibreOffice
5. **Local Cleanup**: Remove temporary RTF files
6. **Cloud Upload**: Upload PDF files to S3-compatible storage
7. **Metadata Storage**: Save file metadata and encrypted URLs to MongoDB
8. **Remote Cleanup**: Remove local PDF files
9. **Retention Management**: Clean up outdated files from cloud storage
10. **Final Results**: Store processing results in MongoDB

## Project Structure

```
├── src/
│   ├── index.ts                 # Main application entry point
│   ├── types/
│   │   └── shared.ts           # Shared TypeScript type definitions
│   ├── utils/
│   │   ├── index.ts            # Utility functions exports
│   │   ├── daysBetweenDates.ts # Date utility functions
│   │   ├── encrypt.ts          # Encryption utilities (MD5/AES)
│   │   └── rtfHeaderRaw.ts     # RTF header template
│   ├── cleanData.ts            # Data cleaning and validation
│   ├── convertFiles.ts         # RTF to PDF conversion
│   ├── deleteLocalFiles.ts     # Local file cleanup
│   ├── getData.ts              # MySQL data retrieval
│   ├── remoteFilesRetention.ts # S3 storage retention management
│   ├── saveLocalRtfFiles.ts    # RTF file creation
│   ├── sendResults.ts          # MongoDB result storage
│   ├── s3Data.ts               # S3/MinIO storage operations
│   └── uploadFiles.ts          # S3 file upload operations
├── files/                      # Temporary file processing directory
├── config.json.sample         # Configuration template
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

## Build Commands

- `npm run build`: Compile TypeScript to JavaScript
- `npm start`: Run the compiled application
- `npm run dev`: Build and run the application in development mode
- `npm run clean`: Remove build artifacts
- `npm run type-check`: Validate TypeScript types without compilation

## Type Definitions

### Shared Types

The application uses TypeScript for type safety. Key interfaces include:

- **LocalDataRow**: Represents a row from MySQL with id, file (blob), and verification_code
- **UploadedFile**: Represents uploaded file metadata with \_id, hash, and encrypted_url

## Error Handling

The application implements comprehensive error handling:

- Database connection failures
- File processing errors
- Cloud storage upload failures
- Configuration validation errors
- Graceful shutdown on critical errors

All errors are logged to stdout with detailed context information and stack traces for debugging.

## Security Considerations

- **Encryption**: URLs are encrypted using AES encryption with MD5 hashing
- **Secrets**: Sensitive configuration should be managed through environment variables in production
- **Database Security**: Use connection pooling and prepared statements
- **File Access**: Implement proper access controls for cloud storage
- **URL Security**: Generated presigned URLs with 1-hour expiration
- **Input Validation**: All external inputs are validated before processing
- **Connection Security**: Use TLS/SSL for all database connections

## Performance Considerations

- **File Processing**: Files are processed sequentially to avoid overwhelming S3
- **Database Connections**: Connections are properly closed to prevent leaks
- **Memory Usage**: Large files are processed in chunks to avoid memory issues
- **Concurrent Operations**: Database operations use connection pooling
- **Error Recovery**: Processing continues even if individual files fail

## Monitoring and Logging

The application provides detailed logging throughout the process:

- **Configuration Loading**: Status and validation results
- **Database Operations**: Connection status and query results
- **File Processing**: Progress and conversion status
- **Upload Operations**: Success/failure status for each file
- **Retention Management**: Files deleted and retention status
- **Error Details**: Complete error messages and stack traces

### Log Levels

- `console.log`: General application flow and status
- `console.error`: Errors and exceptions
- `console.warn`: Warnings and non-critical issues

## Development

### Adding New Features

1. Follow TypeScript strict mode requirements
2. Add comprehensive JSDoc documentation
3. Include proper error handling with try-catch blocks
4. Update type definitions in `src/types/shared.ts`
5. Follow ES module import/export patterns
6. Add unit tests for new functionality
7. Update this README with new features

### Code Quality

- TypeScript strict mode enabled
- No `any` types (except in rare, well-documented cases)
- Comprehensive JSDoc comments
- Consistent error handling patterns
- Modular code organization with clear separation of concerns
- ES modules for modern JavaScript compatibility
- Connection management and resource cleanup
- Performance optimizations for file processing

## Troubleshooting

### Common Issues

**LibreOffice not found**:

- Ensure LibreOffice is installed: `sudo apt-get install libreoffice-writer`
- Verify JRE is installed: `java -version`
- Check if soffice is in PATH: `which soffice`

**MySQL connection fails**:

- Check connection parameters in configuration
- Ensure MySQL server is accessible
- Verify firewall settings
- Ensure query returns id, file, and verification_code columns
- Test connection manually: `mysql -h host -u user -p database`

**MongoDB connection issues**:

- Check MongoDB Atlas IP whitelist
- Verify connection URI format
- Ensure network connectivity
- Test connection with MongoDB compass or CLI

**S3 upload fails**:

- Verify S3 endpoint and credentials
- Check bucket permissions and access policies
- Ensure sufficient storage quota/limits
- Verify bucket exists and is accessible
- Test with AWS CLI: `aws s3 ls s3://bucket-name`

**Configuration file not found**:

- Ensure config.json exists or provide path as argument
- Check file permissions (should be readable)
- Validate JSON syntax using a JSON validator

**TypeScript compilation errors**:

- Run `npm run type-check` to see detailed error messages
- Ensure all dependencies are installed: `npm install`
- Check that imports use `.js` extensions for ES modules
- Verify TypeScript configuration in `tsconfig.json`

### Performance Issues

**Slow file conversion**:

- Ensure LibreOffice has sufficient memory allocated
- Check available disk space for temporary files
- Consider processing fewer files at once
- Monitor CPU usage during conversion

**Database timeout issues**:

- Increase connection timeout values
- Optimize MySQL queries for better performance
- Consider using database indexes on frequently queried columns
- Monitor database server resource usage

**S3 upload timeouts**:

- Check network connectivity to S3 endpoint
- Verify upload file sizes don't exceed limits
- Consider multipart uploads for large files
- Monitor S3 service status and quotas

### Logs

The application provides detailed logging throughout the process. Monitor stdout for:

- Configuration loading status
- Database connection results
- File processing progress
- Upload and cleanup operations
- Error details and stack traces
- Performance metrics (files processed, time taken)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make changes with proper TypeScript typing
4. Add comprehensive error handling
5. Include unit tests for new functionality
6. Update documentation as needed
7. Ensure all tests pass (`npm run type-check`)
8. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
9. Push to the branch (`git push origin feature/AmazingFeature`)
10. Open a Pull Request

### Development Setup

```bash
# Clone the repository
git clone <your-fork-url>
cd mysql-files-to-s3

# Install dependencies
npm install

# Set up development environment
cp config.json.sample config.json
# Edit config.json with your configuration

# Build and run in development mode
npm run dev

# Run type checking
npm run type-check
```

## License

MIT License - see LICENSE file for details

## Author

André Martins <fmartins.andre@gmail.com>

## Keywords

mysql, s3, minio, file-upload, typescript, microservice, mongodb, blob-processing, rtf-to-pdf, cloud-storage, encryption, file-retention, document-conversion

## Version History

### v1.0.0 (Current)

- Initial release
- MySQL to S3 file processing pipeline
- RTF to PDF conversion
- MongoDB metadata storage
- File retention management
- TypeScript implementation with full type safety
- Docker support
- Comprehensive error handling and logging
