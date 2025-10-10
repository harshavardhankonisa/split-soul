export class ActivityUtils {
  // Format duration in milliseconds to human readable string
  static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      const remainingMinutes = minutes % 60
      const remainingSeconds = seconds % 60
      return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`
    } else if (minutes > 0) {
      const remainingSeconds = seconds % 60
      return `${minutes}m ${remainingSeconds}s`
    } else {
      return `${seconds}s`
    }
  }

  // Should we track this URL?
  static shouldTrackUrl(url: string): boolean {
    if (!url) return false

    // Don't track chrome:// URLs
    if (url.startsWith('chrome://')) return false
    if (url.startsWith('chrome-extension://')) return false
    if (url.startsWith('moz-extension://')) return false
    if (url.startsWith('edge://')) return false
    if (url.startsWith('about:')) return false

    // Don't track local files
    if (url.startsWith('file://')) return false

    return url.startsWith('http://') || url.startsWith('https://')
  }
}

export default ActivityUtils
