import { daysBetweenDates } from "./utils/daysBetweenDates"
import { LocalDataRow, FirebaseFile, FirebaseData } from "./types/shared"

/**
 * Service for managing remote file retention policies
 * Handles deletion of outdated files based on retention rules
 */

/**
 * Determines if a file should be deleted based on retention policy
 */
interface FileDeletionRule {
  isOutdated: boolean
  isNotInLocal: boolean
}

/**
 * Processes individual file for potential deletion
 */
class FileRetentionProcessor {
  private readonly localFiles: Set<string>
  private readonly retentionDays: number
  private readonly prefix: string

  constructor(
    localData: LocalDataRow[],
    retentionDays: number,
    prefix: string
  ) {
    this.localFiles = new Set(localData.map(row => `${row.id}.pdf`))
    this.retentionDays = retentionDays
    this.prefix = prefix
  }

  /**
   * Check if file meets deletion criteria
   */
  private async evaluateDeletionCriteria(
    file: FirebaseFile
  ): Promise<FileDeletionRule> {
    const isOutdated = await this.checkFileAge(file)
    const isNotInLocal = !this.localFiles.has(file.name)

    return { isOutdated, isNotInLocal }
  }

  /**
   * Extract file ID from filename
   */
  private extractFileId(fileName: string): string | null {
    const match = fileName.match(/^([a-zA-Z0-9_]+)\.(pdf|rtf)$/)
    return match ? match[1] || null : null
  }

  /**
   * Check if file is older than retention period
   */
  private async checkFileAge(file: FirebaseFile): Promise<boolean> {
    try {
      const metadata = await file.getMetadata()
      if (!metadata?.updated) return false

      const dateStr = metadata.updated.split("T")[0]
      if (!dateStr) return false

      const fileDate = new Date(dateStr).getTime()
      const now = Date.now()
      const daysOld = daysBetweenDates(now, fileDate)

      return daysOld >= this.retentionDays
    } catch (error) {
      console.warn(`Failed to check age for file ${file.name}:`, error)
      return false
    }
  }

  /**
   * Delete file and return its ID if successful
   */
  private async deleteFile(file: FirebaseFile): Promise<string | null> {
    try {
      await file.delete()
      console.log(
        `::: Firebase: The "${this.prefix}/${file.name}" file was removed from cloud storage.`
      )
      return this.extractFileId(file.name)
    } catch (error) {
      console.warn(`Failed to delete file ${file.name}:`, error)
      return null
    }
  }

  /**
   * Process single file for retention check
   */
  async processFile(file: FirebaseFile): Promise<string | null> {
    const { isOutdated, isNotInLocal } = await this.evaluateDeletionCriteria(
      file
    )

    // File should be deleted if it's outdated AND not in local data
    if (isOutdated && isNotInLocal) {
      return await this.deleteFile(file)
    }

    return null
  }
}

/**
 * Main retention processing function
 */
const remoteFileRetention = async (
  localData: LocalDataRow[],
  firebaseData: FirebaseData
): Promise<string[]> => {
  const { retention, prefix, files } = firebaseData
  const processor = new FileRetentionProcessor(localData, retention, prefix)

  // Process all files in parallel for better performance
  const deletionResults = await Promise.all(
    files.items.map(file => processor.processFile(file))
  )

  // Filter and return only successful deletions
  return deletionResults.filter((id): id is string => !!id && id.length > 0)
}

export default remoteFileRetention
