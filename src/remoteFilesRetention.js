const daysBetweenDates = require("./utils/daysBetweenDates")

const mapDeletedFiles = (localData, firebaseData) => {
  const { prefix, retention } = firebaseData
  return async file => {
    try {
      const fileId = file.name.split(/\.([a-zA-z0-9]+)$/, 1)[0].trim()
      const fileMetadata = await file.getMetadata()
      const fileDate = new Date(fileMetadata.updated.split("T")[0]).getTime()
      const now = Date.now()
      const localFiles = localData.map(row => `${row.id}.pdf`)

      if (
        !localFiles.includes(file.name) &&
        daysBetweenDates(now, fileDate) >= retention
      ) {
        return new Promise(resolve => {
          file.delete().then(() => {
            console.log(
              `::: Firebase: The "${prefix}/${file.name}" file was removed from cloud storage.`
            )
            resolve(fileId)
          })
        })
      }
    } catch (error) {
      console.log(
        `::: Firebase: WARNING => Something got wrong while trying to remove the file ${file.name} from cloud storage.`
      )
    }
    return Promise.resolve()
  }
}

const remoteFileRetention = async (localData, firebaseData) => {
  const deletedFiles = await Promise.all(
    firebaseData.files.items.map(mapDeletedFiles(localData, firebaseData))
  )
  return Promise.resolve(deletedFiles.filter(id => !!id && id.length > 0))
}

module.exports = remoteFileRetention
