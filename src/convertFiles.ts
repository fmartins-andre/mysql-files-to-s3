import { exec as execCallback } from "child_process"
import { promisify } from "util"
import { promises as fs } from "fs"

const exec = promisify(execCallback)

const convertFiles = async (localFolder: string): Promise<void> => {
  try {
    // Check if LibreOffice is available
    const { stdout: converter, stderr: noConverter } = await exec(
      `command -v soffice`
    )

    if (noConverter) {
      throw new Error(
        `LibreOffice not found. Please install LibreOffice Writer.`
      )
    }

    if (!converter) {
      throw new Error(`LibreOffice converter path not found.`)
    }
    const converterPath = converter.toString().trim()

    // Check if there are any RTF files to convert
    const files = await fs.readdir(localFolder)
    const rtfFiles = files.filter(file => file.endsWith(".rtf"))

    if (rtfFiles.length === 0) {
      console.log(`::: Application: No RTF files found to convert.`)
      return
    }

    console.log(
      `::: Application: Converting ${rtfFiles.length} RTF files to PDF...`
    )

    // Convert RTF files to PDF
    const { stderr: conversionErr } = await exec(
      `${converterPath} --headless --convert-to pdf --outdir ${localFolder} ${localFolder}/*.rtf`
    )

    console.log(`::: Application: PDF conversion completed.`)

    if (conversionErr && conversionErr.trim()) {
      console.warn(
        `::: Application: WARNING during conversion: ${conversionErr
          .toString()
          .trim()}`
      )
    }

    // Verify that PDF files were actually created
    const afterFiles = await fs.readdir(localFolder)
    const pdfFiles = afterFiles.filter(file => file.endsWith(".pdf"))
    console.log(
      `::: Application: Successfully created ${pdfFiles.length} PDF files.`
    )
  } catch (error) {
    console.error(`::: Application: ERROR during file conversion:`, error)
    throw error // Re-throw to be handled by caller
  }
}

export default convertFiles
