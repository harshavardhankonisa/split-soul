import type { User, Activity, Chat } from '../../interface/database'
import { getAllUsers, createUser } from '../../services/dexie/collections/user'
import { createChat, getAllChats } from '../../services/dexie/collections/chat'
import { getAllActivitys } from '../../services/dexie/collections/activity'

export class ChatAgent {
  private mainBody: User | null = null
  private mainSoul: User | null = null
  private splitSouls: User[] = []
  private chatTimer: NodeJS.Timeout | null = null
  private readonly CHAT_INTERVAL = 5 * 60 * 1000

  constructor() {
    this.initializeDefaultUsers()
    this.startChatTimer()
  }

  private async initializeDefaultUsers() {
    const users = await getAllUsers()

    this.mainBody = users.find(u => u.username === 'Main Body') || null
    if (!this.mainBody) {
      const mainBodyId = await createUser({
        username: 'Main Body',
        description: 'The primary user of the extension',
        avatarUrl: '',
        createdAt: new Date(),
        modifiedAt: new Date(),
        isActive: true,
        isEditable: false,
        vector: []
      })
      this.mainBody = {
        id: mainBodyId,
        username: 'Main Body',
        description: 'The primary user of the extension',
        avatarUrl: '',
        createdAt: new Date(),
        modifiedAt: new Date(),
        isActive: true,
        isEditable: false,
        vector: []
      }
    }

    // Find or create Main Soul
    this.mainSoul = users.find(u => u.username === 'Main Soul') || null
    if (!this.mainSoul) {
      const mainSoulId = await createUser({
        username: 'Main Soul',
        description: 'The primary agent that manages and observes activity patterns',
        avatarUrl: '',
        createdAt: new Date(),
        modifiedAt: new Date(),
        isActive: true,
        isEditable: false,
        vector: []
      })
      this.mainSoul = {
        id: mainSoulId,
        username: 'Main Soul',
        description: 'The primary agent that manages and observes activity patterns',
        avatarUrl: '',
        createdAt: new Date(),
        modifiedAt: new Date(),
        isActive: true,
        isEditable: false,
        vector: []
      }
    }

    // Get split souls (editable users)
    this.splitSouls = users.filter(u => u.isEditable && u.isActive)
  }

  private startChatTimer() {
    this.chatTimer = setInterval(async () => {
      await this.checkActivityAndChat()
    }, this.CHAT_INTERVAL)

    // Also check immediately after a short delay
    setTimeout(() => this.checkActivityAndChat(), 10000)
  }

  private async checkActivityAndChat() {
    if (!this.mainSoul) return

    const now = new Date()
    const fiveMinutesAgo = new Date(now.getTime() - this.CHAT_INTERVAL)

    // Get recent activities
    const activities = await this.getRecentActivities(fiveMinutesAgo, now)

    if (activities.length === 0) {
      // No activity - Main Soul comments on inactivity
      await this.postMainSoulMessage("I notice you've been inactive for the last 5 minutes. Time to get back to work!")
      return
    }

    // Analyze activity and generate Main Soul message
    const activitySummary = this.analyzeActivity(activities)
    const mainSoulMessage = await this.generateMainSoulMessage(activitySummary)
    await this.postMainSoulMessage(mainSoulMessage)

    // Occasionally get split soul responses (not every time)
    if (Math.random() < 0.3 && this.splitSouls.length > 0) {
      // 30% chance
      const respondingSoul = this.splitSouls[Math.floor(Math.random() * this.splitSouls.length)]
      const splitSoulMessage = await this.generateSplitSoulResponse(respondingSoul, activitySummary)
      if (splitSoulMessage) {
        await this.postSplitSoulMessage(respondingSoul, splitSoulMessage)
      }
    }

    // this.lastActivityCheck = now
  }

  private async getRecentActivities(startTime: Date, endTime: Date): Promise<Activity[]> {
    const allActivities = await getAllActivitys()
    return allActivities.filter(activity => {
      const activityTime = new Date(activity.updatedAt)
      return activityTime >= startTime && activityTime <= endTime && activity.activeDuration > 0
    })
  }

  private analyzeActivity(activities: Activity[]): string {
    const totalDuration = activities.reduce((sum, a) => sum + a.activeDuration, 0)
    const minutes = Math.round(totalDuration / 1000 / 60)
    const websites = [...new Set(activities.map(a => a.websiteTitle))].slice(0, 3)

    return `${minutes} minutes active on: ${websites.join(', ')}`
  }

  private async generateMainSoulMessage(activitySummary: string): Promise<string> {
    const messages = [
      `I see you spent ${activitySummary}. Keep up the focus!`,
      `Activity update: ${activitySummary}. How's your productivity feeling?`,
      `Tracking your progress: ${activitySummary}. Stay on track!`,
      `Latest activity: ${activitySummary}. Remember your goals!`,
      `I've been watching: ${activitySummary}. Good momentum!`
    ]

    return messages[Math.floor(Math.random() * messages.length)]
  }

  private async generateSplitSoulResponse(soul: User, activitySummary: string): Promise<string | null> {
    const responses = [
      `${soul.username}: Interesting pattern in ${activitySummary}`,
      `${soul.username}: I have thoughts about ${activitySummary}`,
      `${soul.username}: That activity reminds me of something...`,
      null,
      null
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  private async postMainSoulMessage(message: string) {
    if (!this.mainSoul) return

    await createChat({
      user: this.mainSoul,
      message,
      createdAt: new Date(),
      vector: []
    })
  }

  private async postSplitSoulMessage(soul: User, message: string) {
    await createChat({
      user: soul,
      message,
      createdAt: new Date(),
      vector: []
    })
  }

  public async refreshSouls() {
    const users = await getAllUsers()
    this.splitSouls = users.filter(u => u.isEditable && u.isActive)
  }

  public async getRecentChats(limit: number = 10): Promise<Chat[]> {
    const chats = await getAllChats()
    return chats.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit)
  }

  public stopChatTimer() {
    if (this.chatTimer) {
      clearInterval(this.chatTimer)
      this.chatTimer = null
    }
  }

  public getMainSoul(): User | null {
    return this.mainSoul
  }

  public getMainBody(): User | null {
    return this.mainBody
  }

  public getSplitSouls(): User[] {
    return this.splitSouls
  }
}

export const chatAgent = new ChatAgent()
