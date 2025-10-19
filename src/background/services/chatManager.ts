import type { Activity } from '../../interface/database'
import { activityTracker } from './activityTracker'

export class ChatAgent {
  private currentActivities: Activity[] = []
  private lastActiveTime = Date.now()
  private hasLoggedActive = false
  private hasLoggedInactive = false
  private readonly ACTIVE_THRESHOLD = 5 * 60 * 1000
  private readonly INACTIVE_THRESHOLD = 10 * 60 * 1000
  private readonly ACTIVTY_CHECK_THRESHOLD = 60 * 1000

  constructor() {
    this.startChatTimer()
  }

  private startChatTimer() {
    setInterval(() => this.checkActivity(), this.ACTIVTY_CHECK_THRESHOLD)
  }

  public receiveActivityHeartBeat() {
    this.currentActivities = activityTracker.getCurrentActivities()
    this.lastActiveTime = Date.now()
    if (this.hasLoggedInactive) {
      this.hasLoggedActive = false
      this.hasLoggedInactive = false
    }
  }

  private checkActivity() {
    const inactiveDuration = Date.now() - this.lastActiveTime

    if (!this.hasLoggedActive && inactiveDuration <= this.ACTIVE_THRESHOLD) {
      console.log(this.currentActivities)
      this.hasLoggedActive = true
    } else if (!this.hasLoggedInactive && inactiveDuration > this.INACTIVE_THRESHOLD) {
      this.hasLoggedInactive = true
    }
  }
}

export const chatAgent = new ChatAgent()
