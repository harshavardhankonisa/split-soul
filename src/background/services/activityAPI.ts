import ActivityUtils from '../../utils/activity'
import { activityTracker } from './activityTracker'

// TODO: remvove class based implemetation here.
class ActivityAPI {
  static async getTodaysSummary() {
    try {
      const currentActivities = activityTracker.getCurrentActivities()

      // TODO: Implement database query for today's activities
      const totalActiveTime = 0 // Placeholder

      const currentSessionActive = currentActivities.reduce((total, activity) => total + activity.activeDuration, 0)

      return {
        totalActiveTime: totalActiveTime + currentSessionActive,
        totalSessions: currentActivities.length,
        currentActivities,
        formattedActiveTime: ActivityUtils.formatDuration(totalActiveTime + currentSessionActive)
      }
    } catch (error) {
      console.error('Error getting today summary:', error)
      return {
        totalActiveTime: 0,
        totalSessions: 0,
        currentActivities: [],
        formattedActiveTime: '0s',
        averageProductivity: 0
      }
    }
  }

  static async getWebsiteActivities(websiteUrl: string) {
    try {
      // TODO: Implement using getAllActivitys and filter by websiteUrl
      console.log('[PLACEHOLDER] Would query activities for website:', websiteUrl)
      return []
    } catch (error) {
      console.error('Error getting website activities:', error)
      return []
    }
  }
}

export async function handleActivityAPICall(method: string, params: Record<string, unknown>) {
  switch (method) {
    case 'getTodaysSummary':
      return ActivityAPI.getTodaysSummary()
    case 'getWebsiteActivities':
      return ActivityAPI.getWebsiteActivities(typeof params?.websiteUrl === 'string' ? params.websiteUrl : '')
    default:
      throw new Error(`Unknown API method: ${method}`)
  }
}
