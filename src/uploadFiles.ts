import { promises as fs } from "fs"
import { encrypt } from "./utils/encrypt.js"
import { S3Data } from "./s3Data.js"
import { LocalDataRow, UploadedFile } from "./types/shared.js"

const uploadFiles = async (
  localData: LocalDataRow[],
  localFolder: string,
  s3Data: S3Data,
  crypto_key: string
): Promise<UploadedFile[]> => {
  const { client, bucket, folder, filesNames, retention } = s3Data
  const retentionInSeconds = retention * 24 * 60 * 60 // from days to seconds
  const uploadedFiles: UploadedFile[] = []

  // Process files sequentially to avoid overwhelming S3
  for (const row of localData) {
    const fileName = `${row.id}.pdf`
    const localFilePath = `${localFolder}/${fileName}`

    try {
      if (!filesNames.includes(fileName)) {
        // Check if file exists before processing
        await fs.access(localFilePath)
        const localFile = await fs.readFile(localFilePath)

        // Upload file to MinIO/S3
        const objectName = `${folder}/${fileName}`
        await client.putObject(bucket, objectName, localFile)

        // Generate presigned URL for download
        const url = await client.presignedGetObject(
          bucket,
          objectName,
          retentionInSeconds
        )

        uploadedFiles.push({
          _id: row.id,
          hash: `${encrypt("MD5", row.verification_code, crypto_key)}`,
          encrypted_url: `${encrypt("AES", url, crypto_key)}`,
        })

        console.log(`::: S3: Successfully uploaded ${fileName}`)
      }
    } catch (error) {
      console.error(`::: S3: Error while uploading file ${fileName}:`, error)
      // Continue with other files even if one fails
    }
  }

  console.log(
    `::: S3: Upload process completed. ${uploadedFiles.length} files uploaded.`
  )
  return uploadedFiles
}

export default uploadFiles
