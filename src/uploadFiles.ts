import { promises as fs } from "fs"
import { encrypt } from "./utils/encrypt.js"
import { S3Data } from "./s3Data.js"
import { LocalDataRow, UploadedFile } from "./types/shared.js"

type FileWithError = {
  name: string
  error: string
}

const uploadFiles = async (
  localData: LocalDataRow[],
  localFolder: string,
  s3Data: S3Data,
  crypto_key: string
): Promise<UploadedFile[]> => {
  const { client, bucket, folder, filesNames, retention } = s3Data
  const retentionInSeconds = retention * 24 * 60 * 60 // from days to seconds
  const uploadedFiles: UploadedFile[] = []
  const filesWithError: FileWithError[] = []

  console.log(`::: S3: Starting to upload the PDF files...`)

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
      }
    } catch (error) {
      filesWithError.push({ name: fileName, error: String(error) })
    }
  }

  console.log(
    `::: S3: Upload process completed. ${uploadedFiles.length} files uploaded. ${filesWithError.length} files failed.`
  )
  if (filesWithError.length > 0) {
    filesWithError.forEach((file, i) => {
      console.log(
        `::: S3: --- ${i + 1}: ${file.name} failed due ${file.error}.`
      )
    })
  }
  return uploadedFiles
}

export default uploadFiles
