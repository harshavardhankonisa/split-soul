import type { Activity } from '../../interface/database'
import { activityTracker } from './activityTracker'

export class ChatAgent {
  private currentActivities: Activity[] = []
  private lastActiveTime = Date.now()
  private chatTimer: NodeJS.Timeout | null = null
  private readonly USER_ACTIVE_INTERVAL = 1 * 60 * 1000
  private readonly USER_INACTIVE_INTERVAL = 2 * 60 * 1000
  private readonly CHAT_INTERVAL = 5 * 60 * 1000
  private activeLogInterval: NodeJS.Timeout | null = null

  constructor() {
    this.startChatTimer()
  }

  private startChatTimer() {
    this.chatTimer = setInterval(() => this.checkActivity(), 60 * 1000)
  }

  public recieveActivityHeartBeat() {
    this.currentActivities = activityTracker.getCurrentActivities()
    this.lastActiveTime = Date.now()
  }

  private checkActivity() {
    const now = Date.now()
    const activeDuration = now - this.lastActiveTime

    if (activeDuration <= this.USER_ACTIVE_INTERVAL) {
      if (!this.activeLogInterval) {
        this.activeLogInterval = setInterval(() => {
          console.log('User has been active for 5 minutes continuously.', this.currentActivities)
        }, this.CHAT_INTERVAL)
      }
    } else if (activeDuration > this.USER_INACTIVE_INTERVAL) {
      if (this.activeLogInterval) {
        clearInterval(this.activeLogInterval)
        this.activeLogInterval = null
        console.log('User inactive for more than 10 minutes. Logging stopped.', this.chatTimer)
      }
    }
  }
}

export const chatAgent = new ChatAgent()
