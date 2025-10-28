const { promisify } = require("util")
const exec = promisify(require("child_process").exec)

const deleteLocalFiles = async (localFolder, fileExtension) => {
  const illegalPaths = /^\/(bin|boot|dev|etc|home|lib|lib64|media|mnt|opt|proc|root|run|sbin|sys|usr|var)?(\/)?$/

  if (localFolder.match(illegalPaths))
    throw Error(`::: Application: WARNING => Illegal path to remove files.`)

  try {
    await exec(`rm ${localFolder}/*.${fileExtension}`)
    console.log(
      `::: Application: Removed all ${fileExtension.toUpperCase()} files.`
    )
    resolve()
  } catch (error) {
    // do nothing
  }
}

module.exports = deleteLocalFiles
