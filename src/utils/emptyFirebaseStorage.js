global.XMLHttpRequest = require("xhr2")
const fs = require("fs").promises
const path = require("path")
const firebaseData = require("../firebaseData")

const emptyFirebaseStorage = async () => {
  try {
    const configFile =
      process.argv[2] || path.resolve(__dirname, "../config.json")

    console.log(`config: ${path.resolve(__dirname, "../config.json")}`)

    const config = await fs.readFile(configFile, "utf-8")
    const { firebaseConfig, firebaseServiceAccount } = JSON.parse(config)

    const remoteData = await firebaseData(
      firebaseConfig,
      firebaseServiceAccount
    )

    const filesLength = remoteData.files.items.length
    console.log(`There are ${filesLength} files to delete!`)
    if (filesLength < 1) finish()

    let counter = 0
    if (filesLength > 0) {
      remoteData.files.items.forEach(async file => {
        try {
          await file.delete()
          console.log(`${file.name}: deleted!`)
        } catch (error) {
          console.log(`${file.name}: error deleting!`)
        }
        counter++
        if (counter === filesLength) finish()
      })
    }
  } catch (error) {
    console.log(`ERROR: ${error}`)
  }
}

function finish() {
  console.log(`All done!`)
  process.exit()
}

emptyFirebaseStorage()
