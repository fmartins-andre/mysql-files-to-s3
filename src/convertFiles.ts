import { exec as execCallback } from "child_process"
import { promisify } from "util"
import { promises as fs } from "fs"
import * as path from "path"

const exec = promisify(execCallback)

interface ConversionResult {
  fileName: string
  success: boolean
  error?: string
  pdfCreated?: boolean
}

interface ConversionSummary {
  totalFiles: number
  successful: number
  failed: number
  results: ConversionResult[]
}

const convertFiles = async (
  localFolder: string
): Promise<ConversionSummary> => {
  const summary: ConversionSummary = {
    totalFiles: 0,
    successful: 0,
    failed: 0,
    results: [],
  }

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
      summary.totalFiles = 0
      return summary
    }

    summary.totalFiles = rtfFiles.length
    console.log(
      `::: Application: Starting conversion of ${rtfFiles.length} RTF files to PDF...`
    )

    // Get list of existing PDF files before conversion
    const existingPdfs = new Set(
      files
        .filter(file => file.endsWith(".pdf"))
        .map(file => path.basename(file, ".pdf"))
    )

    // Convert each RTF file individually for better tracking
    for (const rtfFile of rtfFiles) {
      const rtfPath = path.join(localFolder, rtfFile)
      const baseName = path.basename(rtfFile, ".rtf")
      const expectedPdfName = `${baseName}.pdf`

      const result: ConversionResult = {
        fileName: rtfFile,
        success: false,
      }

      try {
        console.log(`::: Application: Converting "${rtfFile}"...`)

        // Convert individual RTF file
        const { stderr: conversionErr } = await exec(
          `${converterPath} --headless --convert-to pdf --outdir ${localFolder} "${rtfPath}"`
        )

        // Check if the conversion was successful by verifying the PDF was created
        const pdfCreated =
          existingPdfs.has(baseName) ||
          (await fs
            .access(path.join(localFolder, expectedPdfName))
            .then(() => true)
            .catch(() => false))

        result.pdfCreated = pdfCreated
        result.success = pdfCreated

        if (conversionErr && conversionErr.trim()) {
          if (pdfCreated) {
            result.error = conversionErr.toString().trim()
          } else {
            result.error = conversionErr.toString().trim()
            summary.failed++
          }
        } else {
          if (pdfCreated) {
            summary.successful++
          } else {
            result.error = "PDF file not found after conversion"
            summary.failed++
          }
        }

        // Check for specific error patterns in stderr
        if (!pdfCreated && (!conversionErr || !conversionErr.trim())) {
          result.error = "PDF file not created despite no error message"
          summary.failed++
        }
      } catch (error) {
        result.error = error instanceof Error ? error.message : String(error)
        summary.failed++
      }

      summary.results.push(result)
    }

    // Final verification and summary
    const afterFiles = await fs.readdir(localFolder)
    const pdfFiles = afterFiles.filter(file => file.endsWith(".pdf"))

    console.log(`\n::: Application: CONVERSION SUMMARY`)
    console.log(`::: Application: ======================`)
    console.log(
      `::: Application: Total RTF files processed: ${summary.totalFiles}`
    )
    console.log(
      `::: Application: Successful conversions: ${summary.successful}`
    )
    console.log(`::: Application: Failed conversions: ${summary.failed}`)
    console.log(`::: Application: Total PDF files created: ${pdfFiles.length}`)

    if (summary.failed > 0) {
      console.log(`\n::: Application: FAILED CONVERSIONS:`)
      summary.results
        .filter(result => !result.success)
        .forEach(result => {
          console.log(
            `::: Application: - ${result.fileName}: ${
              result.error || "Unknown error"
            }`
          )
        })
    }

    if (summary.successful > 0) {
      console.log(`\n::: Application: SUCCESSFUL CONVERSIONS:`)
      summary.results
        .filter(result => result.success)
        .forEach(result => {
          console.log(`::: Application: - ${result.fileName}`)
        })
    }

    console.log(`::: Application: ======================\n`)
  } catch (error) {
    console.error(
      `::: Application: CRITICAL ERROR during file conversion:`,
      error
    )
    summary.failed = summary.totalFiles // Mark all as failed if critical error
    throw error // Re-throw to be handled by caller
  }

  return summary
}

export default convertFiles
export type { ConversionResult, ConversionSummary }
