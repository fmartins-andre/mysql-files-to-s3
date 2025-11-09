import { Client } from "minio"

interface S3Config {
  fileRetention: number
  folder: string
  [key: string]: any
}

interface S3ServiceAccount {
  uri: string
  user: string
  password: string
  bucket: string
  port?: number
}

interface S3File {
  name: string
  lastModified: string | undefined
  size: number | undefined
}

export interface S3Data {
  retention: number
  folder: string
  client: Client
  bucket: string
  files: S3File[]
  filesNames: string[]
}

const MAX_FILE_RETENTION_DAYS = 7 // max allowed by minio's presignedGetObject

const s3Data = async (
  s3Config: S3Config,
  s3ServiceAccount: S3ServiceAccount
): Promise<S3Data> => {
  const { fileRetention, folder } = s3Config
  const { uri, user, password, bucket, port } = s3ServiceAccount

  try {
    // Parse MinIO endpoint and port from URI
    const url = new URL(uri)
    const endpoint = url.hostname

    // Determine port - use provided port, extracted port, or default to 443 for HTTPS / 9000 for HTTP
    let resolvedPort: number
    if (port) {
      resolvedPort = port
    } else if (url.port) {
      resolvedPort = parseInt(url.port, 10)
    } else if (url.protocol === "https:") {
      resolvedPort = 443
    } else {
      resolvedPort = 9000 // Default MinIO port for HTTP
    }

    // Initialize MinIO client
    const client = new Client({
      endPoint: endpoint,
      port: resolvedPort,
      useSSL: url.protocol === "https:",
      accessKey: user,
      secretKey: password,
    })

    const data: S3Data = {} as S3Data
    data.retention = Math.min(fileRetention, MAX_FILE_RETENTION_DAYS)
    data.folder = folder
    data.client = client
    data.bucket = bucket

    // Test connection by listing objects
    const stream = client.listObjectsV2(bucket, folder)
    const files: S3File[] = []

    return new Promise((resolve, reject) => {
      stream.on("data", obj => {
        if (obj.name) {
          files.push({
            name: obj.name.replace(`${folder}/`, ""),
            lastModified: obj.lastModified?.toISOString(),
            size: obj.size,
          })
        }
      })

      stream.on("end", () => {
        data.files = files
        data.filesNames = files.map(file => file.name)
        console.log(
          `::: S3: Connected to ${endpoint}:${resolvedPort}, found ${files.length} files in bucket "${bucket}"`
        )
        resolve(data)
      })

      stream.on("error", error => {
        console.error(
          `::: S3: ERROR => Error listing objects: ${JSON.stringify(error)}`
        )
        reject(error)
      })
    })
  } catch (error) {
    console.error(
      `::: S3: ERROR => Error initializing S3 client: ${JSON.stringify(error)}`
    )
    throw error
  }
}

export default s3Data
