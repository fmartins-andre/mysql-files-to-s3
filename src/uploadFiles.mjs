import { promises as fs } from "fs"
import encrypt from "./utils/encrypt"

const uploadFiles = async (
  localData,
  localFolder,
  firebaseData,
  crypto_key
) => {
  const { ref, prefix, filesNames } = firebaseData

  return new Promise(resolve => {
    const uploadedFiles = []
    let counter = 0
    localData.forEach(async row => {
      const fileName = `${row.id}.pdf`
      const localFilePath = `${localFolder}/${fileName}`

      try {
        if (!filesNames.includes(fileName)) {
          await fs.access(localFilePath)
          const localFile = await fs.readFile(localFilePath)

          const fileRef = ref.child(`${prefix}/${fileName}`)
          await fileRef.put(Uint8Array.from(localFile))
          const url = await fileRef.getDownloadURL()

          uploadedFiles.push({
            _id: row.id,
            hash: `${encrypt("MD5", row.verification_code, crypto_key)}`,
            encrypted_url: `${encrypt("AES", url, crypto_key)}`,
          })
        }
      } catch (error) {
        console.log(`::: Firebase : Error while uploading file: ${error}`)
      }
      counter++
      if (counter === localData.length) {
        console.log(`::: Firebase : All files were uploaded.`)
        resolve(uploadedFiles)
      }
    })
  })
}

export default uploadFiles
