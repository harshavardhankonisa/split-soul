export class ActivityUtils {
  // Should we track this URL?
  static shouldTrackUrl(url: string): boolean {
    if (!url) return false

    // Don't track chrome:// URLs
    if (url.startsWith('chrome://')) return false
    if (url.startsWith('chrome-extension://')) return false
    if (url.startsWith('about:')) return false

    // Don't track local files
    if (url.startsWith('file://')) return false

    return url.startsWith('http://') || url.startsWith('https://')
  }
}

export default ActivityUtils
