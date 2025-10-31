import { readFile } from "fs/promises"
import path from "path"

import firebaseData from "./firebaseData"
import getData from "./getData"
import convertFiles from "./convertFiles"
import uploadFiles from "./uploadFiles"
import remoteFileRetention from "./remoteFilesRetention"
import deleteLocalFiles from "./deleteLocalFiles"
import saveLocalRtfFiles from "./saveLocalRtfFiles"
import sendResults from "./sendResults"

// Type definitions
interface UploadedFile {
  _id: string | number
  hash: string
  encrypted_url: string
}

async function main() {
  console.log(`::: Application: Job started!`)

  const configFile = process.argv[2] || path.resolve(__dirname, "config.json")
  const localFolder = path.resolve(__dirname, "../files")

  if (process.argv[2])
    console.log(
      `::: Application: Tip: You can pass a JSON configuration file path as argument.`
    )
  console.log(
    `::: Application: Reading ${
      !process.argv[2] ? "default " : ""
    }configuration file: "${configFile}"`
  )

  try {
    const config = await readFile(configFile, "utf-8")
    const { crypto_key, mysql, mongo, firebaseConfig, firebaseServiceAccount } =
      JSON.parse(config)
    console.log(`::: Application: Configuration file loaded.`)

    const remoteData = await firebaseData(
      firebaseConfig,
      firebaseServiceAccount
    )

    const mysqlData = await getData(mysql)
    if (!mysqlData) {
      throw new Error("Failed to retrieve data from MySQL")
    }
    if (mysqlData.error) throw Error(String(mysqlData.error))

    if (mysqlData.rows) {
      const mysqlRows = mysqlData.rows
      let uploadedFiles: UploadedFile[] = []

      const numLocalFiles = await saveLocalRtfFiles(
        mysqlRows,
        localFolder,
        remoteData
      )

      if (numLocalFiles > 0) {
        await convertFiles(localFolder)
        await deleteLocalFiles(localFolder, "rtf")
        uploadedFiles = await uploadFiles(
          mysqlRows,
          localFolder,
          remoteData,
          crypto_key
        )
        await deleteLocalFiles(localFolder, "pdf")
      }

      const remoteFilesDeleted = await remoteFileRetention(
        mysqlRows,
        remoteData
      )

      await sendResults(uploadedFiles, remoteFilesDeleted, mongo)
    } else {
      throw Error(`There is no data to work on!`)
    }
  } catch (error) {
    console.error(`::: Application: ERROR => ${error}`)
  } finally {
    console.log(`::: Application: Job finished!`)
    process.exit()
  }
}

main()
