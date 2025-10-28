const fs = require("fs").promises
const { ungzip } = require("node-gzip")
const cleanData = require("./cleanData")

const saveLocalRtfFiles = async (
  localData,
  localFolder,
  { filesNames: remoteFilesNames }
) => {
  return new Promise(resolve => {
    let numSavedFiles = 0
    let counter = 0
    localData.forEach(async row => {
      const pdfFileName = `${row.id}.pdf`

      if (!remoteFilesNames.includes(pdfFileName)) {
        const rtfFileName = `${localFolder}/${row.id}.rtf`

        const uncompressed = await ungzip(row.file)
        const cleaned = cleanData(uncompressed)
        await fs.writeFile(rtfFileName, Buffer.from(cleaned))
        numSavedFiles++
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

module.exports = saveLocalRtfFiles
