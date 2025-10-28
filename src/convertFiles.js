const { promisify } = require("util")
const exec = promisify(require("child_process").exec)

const convertFiles = async localFolder => {
  const { stdout: converter, stderr: noConverter } = await exec(`which soffice`)

  if (noConverter) throw Error(`Could not find LibreOffice!`)

  try {
    const { stderr: conversionErr } = await exec(
      `${converter.trim()} --headless --convert-to pdf --outdir ${localFolder} ${localFolder}/*.rtf`
    )
    console.log(`::: Application: Generated PDF files.`)

    if (conversionErr)
      console.log(
        `::: Application: WARNING => File Conversion: ${conversionErr.trim()}`
      )
  } catch (error) {
    /* do nothing */
  }
}

module.exports = convertFiles
