import { activityTracker } from './activityTracker'
import { aiApiBridge } from './aiApiBridge'
import { chatManager } from './chatManager'

export class MainSoulAgent {
  private lastActiveTime = Date.now()
  private hasLoggedActive = false
  private hasLoggedInactive = false
  private readonly ACTIVE_THRESHOLD = 5 * 1000
  private readonly INACTIVE_THRESHOLD = 10 * 1000
  private readonly ACTIVTY_CHECK_THRESHOLD = 5 * 1000
  private readonly ACTIVE_TABS_CHECK_INTERVAL = 5 * 60 * 1000

  constructor() {
    this.startChatTimer()
    this.startActiveTabsTimer()
  }

  private startChatTimer() {
    setInterval(() => this.checkActivity(), this.ACTIVTY_CHECK_THRESHOLD)
  }

  private startActiveTabsTimer() {
    setInterval(() => this.processActiveTabs(), this.ACTIVE_TABS_CHECK_INTERVAL)
  }

  private checkActivity() {
    const inactiveDuration = Date.now() - this.lastActiveTime

    if (!this.hasLoggedActive && inactiveDuration <= this.ACTIVE_THRESHOLD) {
      this.hasLoggedActive = true
    } else if (!this.hasLoggedInactive && inactiveDuration > this.INACTIVE_THRESHOLD) {
      this.hasLoggedInactive = true
    }
  }

  private async processActiveTabs() {
    const activeActivities = activityTracker.getCurrentActivities()

    if (activeActivities.length === 0) {
      return
    }

    const activityDetails = activeActivities
      .map(a => {
        const durationSeconds = Math.round(a.activeDuration / 1000)
        const durationMinutes = Math.round(durationSeconds / 60)
        const durationDisplay = durationMinutes > 0 ? `${durationMinutes}m` : `${durationSeconds}s`

        return `${a.websiteTitle} (${durationDisplay})`
      })
      .join(', ')

    try {
      const summary = await aiApiBridge.summarize(activityDetails, {
        type: 'tldr',
        format: 'plain-text',
        length: 'medium',
        context: ''
      })

      chatManager.addChat({
        username: 'Main Soul',
        message: `Here's a summary of your recent activities: ${summary}`
      })
    } catch (error) {
      console.error('Failed to summarize activities:', error)
    }
  }
}

export const mainSoulAgent = new MainSoulAgent()
