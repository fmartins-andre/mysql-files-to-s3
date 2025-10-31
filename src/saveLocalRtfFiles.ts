import { promises as fs } from "fs"
import cleanData from "./cleanData.js"

interface LocalDataRow {
  id: string | number
  file: Uint8Array | Buffer
  [key: string]: any
}

interface RemoteFilesData {
  filesNames: string[]
}

const saveLocalRtfFiles = async (
  localData: LocalDataRow[],
  localFolder: string,
  { filesNames: remoteFilesNames }: RemoteFilesData
): Promise<number> => {
  return new Promise(resolve => {
    let numSavedFiles = 0
    let counter = 0
    localData.forEach(async row => {
      const pdfFileName = `${row.id}.pdf`

      if (!remoteFilesNames.includes(pdfFileName)) {
        const rtfFileName = `${localFolder}/${row.id}.rtf`

        try {
          const { ungzip } = await import("node-gzip")
          const uncompressed = await ungzip(row.file)
          const cleaned = cleanData(Buffer.from(uncompressed))
          await fs.writeFile(rtfFileName, Buffer.from(cleaned))
          numSavedFiles++
        } catch (error) {
          console.log(
            `::: Application: Error processing file ${row.id}: ${error}`
          )
        }
      }

      counter++
      if (counter === localData.length) {
        if (numSavedFiles <= 0) {
          console.log(`::: Application: There are no files to upload for now!`)
        } else {
          console.log(`::: Application: ${numSavedFiles} RTF files were saved.`)
        }

        resolve(numSavedFiles)
      }
    })
  })
}

export default saveLocalRtfFiles
